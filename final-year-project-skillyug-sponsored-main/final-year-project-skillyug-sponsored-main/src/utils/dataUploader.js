/**
 * Data Upload Utility for Bulk Question Import
 * 
 * This script allows importing MCQ questions from Excel/CSV files into Firebase
 * Features:
 * - Parse Excel/CSV files with questions
 * - Upload associated images to Firebase Storage
 * - Create Firestore documents with image URLs
 * - Progress tracking and error handling
 * - Batch processing for efficiency
 * 
 * Expected CSV/Excel Format:
 * subject, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, tags, image_path
 * 
 * Usage:
 * import { uploadQuestionsFromFile } from './utils/dataUploader';
 * uploadQuestionsFromFile(file, onProgress);
 */

import * as XLSX from 'xlsx';
import { batchUploadQuestions } from '../firebase/firestore';
import { uploadQuestionImage, uploadImageFromURL } from '../firebase/storage';

/**
 * Parse CSV file to JSON
 * 
 * @param {string} csvText - CSV file content as text
 * @returns {Array} - Array of question objects
 */
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse rows
  const questions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      console.warn(`⚠️ Row ${i + 1} has incorrect column count, skipping`);
      continue;
    }
    
    const question = {};
    headers.forEach((header, index) => {
      question[header] = values[index];
    });
    
    questions.push(question);
  }
  
  return questions;
};

/**
 * Parse Excel file to JSON
 * 
 * @param {File} file - Excel file
 * @returns {Promise<Array>} - Array of question objects
 */
const parseExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const questions = XLSX.utils.sheet_to_json(firstSheet);
        
        resolve(questions);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate question object structure
 * 
 * @param {Object} question - Question object
 * @returns {boolean} - true if valid
 */
const validateQuestion = (question) => {
  const required = ['subject', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
  
  for (const field of required) {
    if (!question[field]) {
      console.warn(`⚠️ Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate correct answer
  const correctAnswer = question.correct_answer.toString().toLowerCase();
  if (!['a', 'b', 'c', 'd', '0', '1', '2', '3'].includes(correctAnswer)) {
    console.warn(`⚠️ Invalid correct answer: ${correctAnswer}`);
    return false;
  }
  
  return true;
};

/**
 * Transform raw question data to Firestore format
 * 
 * @param {Object} rawQuestion - Raw question from CSV/Excel
 * @returns {Object} - Formatted question object
 */
const transformQuestion = (rawQuestion) => {
  // Map correct answer to index
  const answerMap = {
    'a': 0, '0': 0,
    'b': 1, '1': 1,
    'c': 2, '2': 2,
    'd': 3, '3': 3
  };
  
  const correctAnswer = rawQuestion.correct_answer.toString().toLowerCase();
  
  return {
    questionText: rawQuestion.question,
    options: [
      rawQuestion.option_a,
      rawQuestion.option_b,
      rawQuestion.option_c,
      rawQuestion.option_d
    ],
    correctAnswer: answerMap[correctAnswer],
    difficulty: rawQuestion.difficulty || 'medium',
    tags: rawQuestion.tags ? rawQuestion.tags.split(';').map(t => t.trim()) : [],
    imageURL: rawQuestion.image_url || null,
    imagePath: rawQuestion.image_path || null,
    explanation: rawQuestion.explanation || null,
    marks: parseInt(rawQuestion.marks) || 1,
    timeLimit: parseInt(rawQuestion.time_limit) || 60 // seconds
  };
};

/**
 * Upload questions from CSV/Excel file to Firebase
 * Main function for bulk import
 * 
 * @param {File} file - CSV or Excel file
 * @param {Array} imageFiles - Optional array of image files (matched by name)
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - Upload results
 */
export const uploadQuestionsFromFile = async (file, imageFiles = [], onProgress = null) => {
  try {
    console.log('📁 Starting file upload process...');
    
    // Step 1: Parse file
    if (onProgress) onProgress({ stage: 'parsing', progress: 0 });
    
    let rawQuestions = [];
    
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      rawQuestions = parseCSV(text);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      rawQuestions = await parseExcel(file);
    } else {
      throw new Error('Unsupported file format. Please use CSV or Excel.');
    }
    
    console.log(`✅ Parsed ${rawQuestions.length} questions from file`);
    
    if (onProgress) onProgress({ stage: 'parsing', progress: 100 });
    
    // Step 2: Validate and transform questions
    if (onProgress) onProgress({ stage: 'validating', progress: 0 });
    
    const validQuestions = [];
    const invalidQuestions = [];
    
    rawQuestions.forEach((q, index) => {
      if (validateQuestion(q)) {
        validQuestions.push(transformQuestion(q));
      } else {
        invalidQuestions.push({ row: index + 2, data: q });
      }
    });
    
    console.log(`✅ Validated: ${validQuestions.length} valid, ${invalidQuestions.length} invalid`);
    
    if (onProgress) onProgress({ stage: 'validating', progress: 100 });
    
    if (validQuestions.length === 0) {
      throw new Error('No valid questions found in file');
    }
    
    // Step 3: Upload images if provided
    if (imageFiles.length > 0) {
      if (onProgress) onProgress({ stage: 'uploading_images', progress: 0 });
      
      console.log(`📤 Uploading ${imageFiles.length} images...`);
      
      // Create image lookup by filename
      const imageLookup = {};
      imageFiles.forEach(file => {
        imageLookup[file.name] = file;
      });
      
      // Upload images and link to questions
      for (let i = 0; i < validQuestions.length; i++) {
        const question = validQuestions[i];
        
        if (question.imagePath) {
          const imageName = question.imagePath.split('/').pop();
          const imageFile = imageLookup[imageName];
          
          if (imageFile) {
            try {
              const subjectId = rawQuestions[i].subject || 'general';
              const questionId = `q_${Date.now()}_${i}`;
              
              const uploadResult = await uploadQuestionImage(
                imageFile,
                subjectId,
                questionId
              );
              
              if (uploadResult.success) {
                question.imageURL = uploadResult.url;
                question.imageStoragePath = uploadResult.path;
              }
            } catch (error) {
              console.warn(`⚠️ Failed to upload image for question ${i + 1}`);
            }
          }
        }
        
        // Update progress
        const progress = ((i + 1) / validQuestions.length) * 100;
        if (onProgress) onProgress({ stage: 'uploading_images', progress });
      }
    }
    
    // Step 4: Group questions by subject
    const questionsBySubject = {};
    
    validQuestions.forEach((question, index) => {
      const subject = rawQuestions[index].subject || 'general';
      
      if (!questionsBySubject[subject]) {
        questionsBySubject[subject] = [];
      }
      
      questionsBySubject[subject].push(question);
    });
    
    // Step 5: Upload to Firestore by subject
    if (onProgress) onProgress({ stage: 'uploading_questions', progress: 0 });
    
    const uploadResults = {};
    const subjects = Object.keys(questionsBySubject);
    
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const questions = questionsBySubject[subject];
      
      console.log(`📤 Uploading ${questions.length} questions to ${subject}...`);
      
      const result = await batchUploadQuestions(subject, questions);
      uploadResults[subject] = result;
      
      const progress = ((i + 1) / subjects.length) * 100;
      if (onProgress) onProgress({ stage: 'uploading_questions', progress });
    }
    
    // Step 6: Prepare summary
    const totalUploaded = Object.values(uploadResults).reduce(
      (sum, result) => sum + (result.success ? result.count : 0),
      0
    );
    
    const summary = {
      success: true,
      totalParsed: rawQuestions.length,
      validQuestions: validQuestions.length,
      invalidQuestions: invalidQuestions.length,
      totalUploaded,
      subjects: subjects.length,
      uploadResults,
      invalidRows: invalidQuestions.map(q => q.row)
    };
    
    console.log('✅ Upload complete!', summary);
    
    if (onProgress) onProgress({ stage: 'complete', progress: 100, summary });
    
    return summary;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        error: error.message
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download sample CSV template
 * Helps users format their data correctly
 * 
 * @returns {void}
 */
export const downloadSampleCSV = () => {
  const sampleData = `subject,question,option_a,option_b,option_c,option_d,correct_answer,difficulty,tags,image_path,explanation,marks,time_limit
math,What is 2 + 2?,2,3,4,5,c,easy,arithmetic;basic,,,1,30
science,What is the chemical symbol for water?,O,H2O,H,OH,b,easy,chemistry;symbols,,,1,30
mat,Find the next number in series: 2 4 6 8 ?,9,10,11,12,b,medium,series;patterns,,,1,60
sat,The capital of France is?,London,Berlin,Paris,Rome,c,easy,geography;capitals,,,1,30`;

  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'questions_template.csv';
  link.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ Sample CSV downloaded');
};

/**
 * Download sample Excel template
 * 
 * @returns {void}
 */
export const downloadSampleExcel = () => {
  const sampleData = [
    {
      subject: 'math',
      question: 'What is 2 + 2?',
      option_a: '2',
      option_b: '3',
      option_c: '4',
      option_d: '5',
      correct_answer: 'c',
      difficulty: 'easy',
      tags: 'arithmetic;basic',
      image_path: '',
      explanation: '',
      marks: 1,
      time_limit: 30
    },
    {
      subject: 'science',
      question: 'What is the chemical symbol for water?',
      option_a: 'O',
      option_b: 'H2O',
      option_c: 'H',
      option_d: 'OH',
      correct_answer: 'b',
      difficulty: 'easy',
      tags: 'chemistry;symbols',
      image_path: '',
      explanation: '',
      marks: 1,
      time_limit: 30
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
  
  XLSX.writeFile(workbook, 'questions_template.xlsx');
  
  console.log('✅ Sample Excel downloaded');
};

/**
 * Validate file before upload
 * Quick check to prevent unnecessary processing
 * 
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateFile = (file) => {
  const validExtensions = ['.csv', '.xlsx', '.xls'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload CSV or Excel file.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.'
    };
  }
  
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.'
    };
  }
  
  return {
    valid: true,
    extension,
    size: file.size
  };
};

// Helper function to create a ZIP of sample files
export const downloadAllSamples = () => {
  downloadSampleCSV();
  setTimeout(() => downloadSampleExcel(), 500);
};
