/**
 * Firebase Firestore Service
 * 
 * Handles all database operations for MCQ questions, exam history, and user data
 * Implements:
 * - Pagination for efficient data loading
 * - Caching to minimize read operations
 * - Optimized queries to reduce costs
 * - Batch operations for bulk updates
 * 
 * Data Structure:
 * /subjects/{subjectId}/questions/{questionId}
 * /users/{userId}
 * /examHistory/{userId}/exams/{examId}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

// ==================== QUESTIONS MANAGEMENT (FLAT COLLECTION) ====================

/**
 * Fetch questions from flat "question" collection by subject
 * Fetches all questions for a specific subject (e.g., "इतिहास", "भूगोल")
 * 
 * @param {string} subject - Subject name (e.g., "इतिहास")
 * @param {number} limitCount - Optional limit on number of questions
 * @returns {Promise<Object>} - Questions array
 */
export const fetchQuestionsBySubject = async (subject, limitCount = null) => {
  try {
    const questionsRef = collection(db, 'questions');
    let q = query(questionsRef, where('subject', '==', subject), orderBy('qno', 'asc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const questions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        question: data.question,
        options: [data.opt1, data.opt2, data.opt3, data.opt4],
        correct: data.ans - 1, // Convert 1-based to 0-based index
        chapter: data.chapter,
        chapterId: data.chapterid,
        qno: data.qno,
        subject: data.subject,
        ...data
      });
    });
    
    console.log(`✅ Fetched ${questions.length} questions for subject: ${subject}`);
    
    return {
      success: true,
      questions,
      count: questions.length
    };
  } catch (error) {
    console.error('❌ Error fetching questions by subject:', error);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Fetch questions by chapter
 * 
 * @param {string} subject - Subject name
 * @param {string} chapter - Chapter name
 * @param {number} limitCount - Optional limit
 * @returns {Promise<Object>} - Questions array
 */
export const fetchQuestionsByChapter = async (subject, chapter, limitCount = null) => {
  try {
    console.log(`🔍 Fetching questions - Subject: "${subject}", Chapter: "${chapter}", Limit: ${limitCount}`);
    
    const questionsRef = collection(db, 'questions');
    
    // Build query without orderBy to avoid composite index requirement
    let q = query(
      questionsRef, 
      where('subject', '==', subject),
      where('chapter', '==', chapter)
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const questions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        question: data.question,
        options: [data.opt1, data.opt2, data.opt3, data.opt4],
        correct: data.ans - 1,
        chapter: data.chapter,
        chapterId: data.chapterid,
        qno: data.qno,
        subject: data.subject,
        ...data
      });
    });
    
    // Sort by qno after fetching (to avoid composite index)
    questions.sort((a, b) => (a.qno || 0) - (b.qno || 0));
    
    console.log(`✅ Fetched ${questions.length} questions for "${subject}" - "${chapter}"`);
    
    if (questions.length === 0) {
      console.warn(`⚠️ No questions found for subject="${subject}", chapter="${chapter}"`);
    }
    
    return {
      success: true,
      questions,
      count: questions.length
    };
  } catch (error) {
    console.error('❌ Error fetching questions by chapter:', error);
    console.error('Error details:', error.message, error.code);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Fetch random questions from "question" collection
 * For practice quizzes and tests
 * 
 * @param {string} subject - Subject name (optional, null for all subjects)
 * @param {number} count - Number of questions needed
 * @returns {Promise<Object>} - Random questions array
 */
export const fetchRandomQuestionsFlat = async (subject = null, count = 10) => {
  try {
    const questionsRef = collection(db, 'questions');
    let q;
    
    if (subject) {
      q = query(questionsRef, where('subject', '==', subject));
    } else {
      q = query(questionsRef);
    }
    
    const querySnapshot = await getDocs(q);
    const allQuestions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allQuestions.push({
        id: doc.id,
        question: data.question,
        options: [data.opt1, data.opt2, data.opt3, data.opt4],
        correct: data.ans - 1,
        chapter: data.chapter,
        chapterId: data.chapterid,
        qno: data.qno,
        subject: data.subject,
        ...data
      });
    });
    
    // Shuffle and take random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const randomQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    
    console.log(`✅ Fetched ${randomQuestions.length} random questions`);
    
    return {
      success: true,
      questions: randomQuestions,
      count: randomQuestions.length
    };
  } catch (error) {
    console.error('❌ Error fetching random questions:', error);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Fetch questions for exam/test by multiple subjects
 * Useful for NMMS-style exams that have multiple subjects
 * 
 * @param {Array<{subject: string, count: number}>} subjectConfig - Array of subjects with required counts
 * @returns {Promise<Object>} - Mixed questions array
 */
export const fetchQuestionsForExam = async (subjectConfig) => {
  try {
    const allQuestions = [];
    
    for (const config of subjectConfig) {
      const result = await fetchRandomQuestionsFlat(config.subject, config.count);
      if (result.success) {
        allQuestions.push(...result.questions);
      }
    }
    
    console.log(`✅ Fetched ${allQuestions.length} questions for exam`);
    
    return {
      success: true,
      questions: allQuestions,
      count: allQuestions.length
    };
  } catch (error) {
    console.error('❌ Error fetching exam questions:', error);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Get all unique subjects from question collection
 * Useful for building subject selection UI
 * 
 * @returns {Promise<Object>} - Array of unique subjects
 */
export const getAllSubjects = async () => {
  try {
    const questionsRef = collection(db, 'questions');
    const querySnapshot = await getDocs(questionsRef);
    
    const subjects = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subject) {
        subjects.add(data.subject);
      }
    });
    
    const subjectArray = Array.from(subjects).sort();
    
    console.log(`✅ Found ${subjectArray.length} unique subjects`);
    
    return {
      success: true,
      subjects: subjectArray
    };
  } catch (error) {
    console.error('❌ Error fetching subjects:', error);
    return {
      success: false,
      error: error.message,
      subjects: []
    };
  }
};

/**
 * Get all chapters for a specific subject
 * 
 * @param {string} subject - Subject name
 * @returns {Promise<Object>} - Array of unique chapters
 */
export const getChaptersBySubject = async (subject) => {
  try {
    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, where('subject', '==', subject));
    const querySnapshot = await getDocs(q);
    
    const chapters = new Map(); // Use Map to store chapter with id
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.chapter && data.chapterid) {
        chapters.set(data.chapter, data.chapterid);
      }
    });
    
    const chaptersArray = Array.from(chapters, ([name, id]) => ({ name, id }))
      .sort((a, b) => a.id - b.id);
    
    console.log(`✅ Found ${chaptersArray.length} chapters for ${subject}`);
    
    return {
      success: true,
      chapters: chaptersArray
    };
  } catch (error) {
    console.error('❌ Error fetching chapters:', error);
    return {
      success: false,
      error: error.message,
      chapters: []
    };
  }
};

// ==================== QUESTIONS MANAGEMENT ====================

/**
 * Fetch questions with pagination
 * Reduces read operations by loading only needed questions
 * 
 * @param {string} subjectId - Subject ID (e.g., 'math', 'science', 'mat', 'sat')
 * @param {number} pageSize - Number of questions per page (default: 20)
 * @param {DocumentSnapshot} lastDoc - Last document from previous page (for pagination)
 * @param {Object} filters - Optional filters (difficulty, tags, etc.)
 * @returns {Promise<Object>} - Questions array and lastVisible document
 */
export const fetchQuestions = async (
  subjectId, 
  pageSize = 20, 
  lastDoc = null, 
  filters = {}
) => {
  try {
    const questionsRef = collection(db, 'subjects', subjectId, 'questions');
    
    // Build query with filters
    let q = query(questionsRef);
    
    // Apply difficulty filter if provided
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }
    
    // Apply tags filter if provided
    if (filters.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }
    
    // Order by creation date or custom field
    q = query(q, orderBy(filters.orderBy || 'createdAt', 'desc'));
    
    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    q = query(q, limit(pageSize));
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Extract questions data
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get last visible document for next page
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    console.log(`✅ Fetched ${questions.length} questions from ${subjectId}`);
    
    return {
      success: true,
      questions,
      lastVisible,
      hasMore: questions.length === pageSize
    };
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Fetch random questions for quick quiz
 * Uses efficient sampling technique to avoid loading all questions
 * 
 * @param {string} subjectId - Subject ID
 * @param {number} count - Number of random questions needed
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - Random questions array
 */
export const fetchRandomQuestions = async (subjectId, count = 10, filters = {}) => {
  try {
    const questionsRef = collection(db, 'subjects', subjectId, 'questions');
    
    // For truly random selection, we use a random field approach
    // Each question should have a 'randomId' field set during creation
    const randomValue = Math.random();
    
    let q = query(
      questionsRef,
      where('randomId', '>=', randomValue),
      limit(count)
    );
    
    // Apply filters if provided
    if (filters.difficulty) {
      q = query(questionsRef, where('difficulty', '==', filters.difficulty), limit(count));
    }
    
    const querySnapshot = await getDocs(q);
    
    // If we didn't get enough questions, fetch from the beginning
    let questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // If not enough questions, fetch more from start
    if (questions.length < count) {
      const additionalQ = query(
        questionsRef,
        where('randomId', '<', randomValue),
        limit(count - questions.length)
      );
      const additionalSnapshot = await getDocs(additionalQ);
      additionalSnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    console.log(`✅ Fetched ${questions.length} random questions`);
    
    return {
      success: true,
      questions
    };
  } catch (error) {
    console.error('❌ Error fetching random questions:', error);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Get a single question by ID
 * 
 * @param {string} subjectId - Subject ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} - Question data
 */
export const getQuestion = async (subjectId, questionId) => {
  try {
    const questionRef = doc(db, 'subjects', subjectId, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      return {
        success: true,
        question: {
          id: questionSnap.id,
          ...questionSnap.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Question not found'
      };
    }
  } catch (error) {
    console.error('❌ Error fetching question:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Add a new question to Firestore
 * Used by admin or during data upload
 * 
 * @param {string} subjectId - Subject ID
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} - Success status with question ID
 */
export const addQuestion = async (subjectId, questionData) => {
  try {
    const questionsRef = collection(db, 'subjects', subjectId, 'questions');
    const newQuestionRef = doc(questionsRef);
    
    // Add metadata and random field for efficient random queries
    const fullQuestionData = {
      ...questionData,
      randomId: Math.random(), // For random sampling
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0,
      correctCount: 0,
      incorrectCount: 0
    };
    
    await setDoc(newQuestionRef, fullQuestionData);
    
    console.log(`✅ Question added with ID: ${newQuestionRef.id}`);
    
    return {
      success: true,
      questionId: newQuestionRef.id,
      message: 'Question added successfully'
    };
  } catch (error) {
    console.error('❌ Error adding question:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Batch upload multiple questions
 * More efficient than adding one by one
 * Maximum 500 operations per batch
 * 
 * @param {string} subjectId - Subject ID
 * @param {Array} questionsArray - Array of question objects
 * @returns {Promise<Object>} - Success status with count
 */
export const batchUploadQuestions = async (subjectId, questionsArray) => {
  try {
    const batchSize = 500; // Firestore batch limit
    const batches = [];
    
    // Split into batches of 500
    for (let i = 0; i < questionsArray.length; i += batchSize) {
      const currentBatch = writeBatch(db);
      const chunk = questionsArray.slice(i, i + batchSize);
      
      chunk.forEach((questionData) => {
        const newQuestionRef = doc(collection(db, 'subjects', subjectId, 'questions'));
        const fullQuestionData = {
          ...questionData,
          randomId: Math.random(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          viewCount: 0,
          correctCount: 0,
          incorrectCount: 0
        };
        currentBatch.set(newQuestionRef, fullQuestionData);
      });
      
      batches.push(currentBatch.commit());
    }
    
    // Execute all batches
    await Promise.all(batches);
    
    console.log(`✅ Batch uploaded ${questionsArray.length} questions`);
    
    return {
      success: true,
      count: questionsArray.length,
      message: `${questionsArray.length} questions uploaded successfully`
    };
  } catch (error) {
    console.error('❌ Error batch uploading questions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update question statistics after attempt
 * Tracks view count, correct/incorrect attempts
 * 
 * @param {string} subjectId - Subject ID
 * @param {string} questionId - Question ID
 * @param {boolean} wasCorrect - Whether answer was correct
 * @returns {Promise<Object>} - Success status
 */
export const updateQuestionStats = async (subjectId, questionId, wasCorrect) => {
  try {
    const questionRef = doc(db, 'subjects', subjectId, 'questions', questionId);
    
    await updateDoc(questionRef, {
      viewCount: increment(1),
      [wasCorrect ? 'correctCount' : 'incorrectCount']: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating question stats:', error);
    return { success: false, error: error.message };
  }
};

// ==================== USER PROFILE MANAGEMENT ====================

/**
 * Update user profile in Firestore
 * 
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Success status
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ User profile updated');
    
    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user XP and level
 * 
 * @param {string} userId - User ID
 * @param {number} xpToAdd - XP points to add
 * @returns {Promise<Object>} - Success status with new level
 */
export const updateUserXP = async (userId, xpToAdd) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentXP = userSnap.data().totalXP || 0;
      const currentLevel = userSnap.data().level || 1;
      
      const newXP = currentXP + xpToAdd;
      
      // Calculate new level (example: level up every 100 XP)
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > currentLevel;
      
      await updateDoc(userRef, {
        totalXP: newXP,
        level: newLevel,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        newXP,
        newLevel,
        leveledUp,
        xpAdded: xpToAdd
      };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('❌ Error updating XP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user streak
 * 
 * @param {string} userId - User ID
 * @param {number} newStreak - New streak value
 * @returns {Promise<Object>} - Success status
 */
export const updateUserStreak = async (userId, newStreak) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      streak: newStreak,
      lastActivity: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, streak: newStreak };
  } catch (error) {
    console.error('❌ Error updating streak:', error);
    return { success: false, error: error.message };
  }
};

// ==================== EXAM HISTORY MANAGEMENT ====================

/**
 * Save exam/practice result to Firestore
 * Replaces localStorage with cloud storage
 * 
 * @param {string} userId - User ID
 * @param {Object} examData - Exam result data
 * @returns {Promise<Object>} - Success status
 */
export const saveExamHistory = async (userId, examData) => {
  try {
    const historyRef = collection(db, 'users', userId, 'examHistory');
    const newExamRef = doc(historyRef);
    
    await setDoc(newExamRef, {
      ...examData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    // Also update user's total stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalExams: increment(1),
      totalScore: increment(examData.score || 0),
      lastExamDate: serverTimestamp()
    });
    
    console.log('✅ Exam history saved');
    
    return {
      success: true,
      examId: newExamRef.id,
      message: 'Exam result saved successfully'
    };
  } catch (error) {
    console.error('❌ Error saving exam history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch user's exam history with pagination
 * 
 * @param {string} userId - User ID
 * @param {number} pageSize - Results per page
 * @param {DocumentSnapshot} lastDoc - Last document for pagination
 * @returns {Promise<Object>} - Exam history array
 */
export const fetchExamHistory = async (userId, pageSize = 20, lastDoc = null) => {
  try {
    const historyRef = collection(db, 'users', userId, 'examHistory');
    
    let q = query(
      historyRef,
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(historyRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);
    
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      success: true,
      history,
      lastVisible,
      hasMore: history.length === pageSize
    };
  } catch (error) {
    console.error('❌ Error fetching exam history:', error);
    return {
      success: false,
      error: error.message,
      history: []
    };
  }
};

/**
 * Delete specific exam from history
 * 
 * @param {string} userId - User ID
 * @param {string} examId - Exam ID
 * @returns {Promise<Object>} - Success status
 */
export const deleteExamHistory = async (userId, examId) => {
  try {
    const examRef = doc(db, 'users', userId, 'examHistory', examId);
    await deleteDoc(examRef);
    
    return {
      success: true,
      message: 'Exam deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting exam:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clear all exam history for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Success status
 */
export const clearAllExamHistory = async (userId) => {
  try {
    const historyRef = collection(db, 'users', userId, 'examHistory');
    const querySnapshot = await getDocs(historyRef);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return {
      success: true,
      message: 'All history cleared',
      count: querySnapshot.size
    };
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ==================== PRACTICE HISTORY & DAILY QUIZ ====================

/**
 * Save practice session history
 */
export const savePracticeHistory = async (userId, practiceData) => {
  try {
    const historyRef = collection(db, 'users', userId, 'practiceHistory');
    const newPracticeRef = doc(historyRef);
    
    await setDoc(newPracticeRef, {
      ...practiceData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Practice history saved');
    
    return {
      success: true,
      practiceId: newPracticeRef.id
    };
  } catch (error) {
    console.error('❌ Error saving practice history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch practice history for a user
 */
export const fetchPracticeHistory = async (userId, limitCount = 50) => {
  try {
    const historyRef = collection(db, 'users', userId, 'practiceHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      history
    };
  } catch (error) {
    console.error('❌ Error fetching practice history:', error);
    return {
      success: false,
      error: error.message,
      history: []
    };
  }
};

/**
 * Save daily quiz completion
 */
export const saveDailyQuizResult = async (userId, quizData) => {
  try {
    const quizRef = collection(db, 'users', userId, 'dailyQuizHistory');
    const newQuizRef = doc(quizRef);
    
    await setDoc(newQuizRef, {
      ...quizData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return {
      success: true,
      quizId: newQuizRef.id
    };
  } catch (error) {
    console.error('❌ Error saving daily quiz:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch daily quiz history
 */
export const fetchDailyQuizHistory = async (userId, limitCount = 100) => {
  try {
    const quizRef = collection(db, 'users', userId, 'dailyQuizHistory');
    const q = query(quizRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      history
    };
  } catch (error) {
    console.error('❌ Error fetching daily quiz history:', error);
    return {
      success: false,
      error: error.message,
      history: []
    };
  }
};

// ==================== STATISTICS & ANALYTICS ====================

/**
 * Fetch comprehensive user statistics
 */
export const fetchUserStatistics = async (userId) => {
  try {
    // Fetch all data in parallel
    const [userDoc, examHistory, practiceHistory, dailyQuizHistory] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      fetchExamHistory(userId, 1000),
      fetchPracticeHistory(userId, 1000),
      fetchDailyQuizHistory(userId, 1000)
    ]);
    
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    return {
      success: true,
      userData,
      examHistory: examHistory.history || [],
      practiceHistory: practiceHistory.history || [],
      dailyQuizHistory: dailyQuizHistory.history || []
    };
  } catch (error) {
    console.error('❌ Error fetching user statistics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch global leaderboard for ranking
 */
export const fetchGlobalLeaderboard = async (limitCount = 100) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalXP', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        userId: doc.id,
        fullName: data.fullName || 'Anonymous',
        totalXP: data.totalXP || 0,
        questProgress: data.questProgress || 0
      });
    });
    
    return {
      success: true,
      leaderboard
    };
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    return {
      success: false,
      error: error.message,
      leaderboard: []
    };
  }
};

/**
 * Get user's rank among all users
 */
export const getUserRank = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userXP = userDoc.data().totalXP || 0;
    
    // Count how many users have more XP
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('totalXP', '>', userXP));
    const querySnapshot = await getDocs(q);
    
    const rank = querySnapshot.size + 1;
    
    // Get total users count
    const allUsersQuery = query(usersRef);
    const allUsersSnapshot = await getDocs(allUsersQuery);
    const totalUsers = allUsersSnapshot.size;
    
    const percentile = totalUsers > 0 ? ((totalUsers - rank + 1) / totalUsers * 100).toFixed(1) : 0;
    
    return {
      success: true,
      rank,
      totalUsers,
      percentile: parseFloat(percentile)
    };
  } catch (error) {
    console.error('❌ Error getting user rank:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ==================== BADGES & ACHIEVEMENTS ====================

/**
 * Update user badges
 */
export const updateUserBadges = async (userId, badge) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      badges: arrayUnion(badge),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Badge unlocked!'
    };
  } catch (error) {
    console.error('❌ Error updating badges:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check and award badges based on achievements
 */
export const checkAndAwardBadges = async (userId, stats) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return { success: false };
    
    const userData = userDoc.data();
    const currentBadges = userData.badges || [];
    const newBadges = [];
    
    // Define badge criteria
    const badgeCriteria = [
      { id: 'daily_quiz_50', name: 'Quiz Master', check: () => stats.dailyQuizHistory.length >= 50 },
      { id: 'exam_10', name: 'Exam Pro', check: () => stats.examHistory.length >= 10 },
      { id: 'perfect_10', name: 'Perfectionist', check: () => stats.examHistory.filter(e => e.percentage >= 100).length >= 10 },
      { id: 'streak_7', name: 'Week Warrior', check: () => (userData.streak || 0) >= 7 },
      { id: 'streak_30', name: 'Monthly Master', check: () => (userData.streak || 0) >= 30 },
      { id: 'xp_1000', name: 'XP Hunter', check: () => (userData.totalXP || 0) >= 1000 },
      { id: 'xp_5000', name: 'XP Legend', check: () => (userData.totalXP || 0) >= 5000 },
      { id: 'quest_10', name: 'Quest Seeker', check: () => (userData.questProgress || 0) >= 10 },
      { id: 'quest_40', name: 'Quest Champion', check: () => (userData.questProgress || 0) >= 40 },
      { id: 'practice_100', name: 'Practice Guru', check: () => stats.practiceHistory.length >= 100 }
    ];
    
    // Check each badge
    for (const criteria of badgeCriteria) {
      if (!currentBadges.includes(criteria.id) && criteria.check()) {
        await updateUserBadges(userId, criteria.id);
        newBadges.push(criteria);
      }
    }
    
    return {
      success: true,
      newBadges
    };
  } catch (error) {
    console.error('❌ Error checking badges:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export db instance for direct use if needed
export { db };
