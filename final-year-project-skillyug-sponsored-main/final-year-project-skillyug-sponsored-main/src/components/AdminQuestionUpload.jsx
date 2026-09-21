/**
 * Admin Question Upload Component
 * 
 * Allows administrators to bulk upload questions from Excel/CSV files
 * Features:
 * - File upload with validation
 * - Image upload support
 * - Progress tracking
 * - Error handling
 * - Sample template download
 */

import React, { useState } from 'react';
import { 
  uploadQuestionsFromFile, 
  validateFile,
  downloadSampleCSV,
  downloadSampleExcel 
} from '../utils/dataUploader';
import '../css files/AdminQuestionUpload.css';

const AdminQuestionUpload = () => {
  const [file, setFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    // Validate file
    const validation = validateFile(selectedFile);
    
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate images
    const validImages = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
    });

    if (validImages.length !== files.length) {
      setError(`${files.length - validImages.length} invalid image(s) removed. Only JPEG, PNG, WebP, GIF under 5MB allowed.`);
    }

    setImageFiles(validImages);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setProgress({ stage: 'starting', progress: 0 });

    try {
      const uploadResult = await uploadQuestionsFromFile(
        file,
        imageFiles,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      if (uploadResult.success) {
        setResult(uploadResult);
        setFile(null);
        setImageFiles([]);
        
        // Reset file inputs
        document.getElementById('file-input').value = '';
        document.getElementById('image-input').value = '';
      } else {
        setError(uploadResult.error);
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getProgressText = () => {
    if (!progress) return '';

    switch (progress.stage) {
      case 'parsing':
        return 'Parsing file...';
      case 'validating':
        return 'Validating questions...';
      case 'uploading_images':
        return `Uploading images... ${Math.round(progress.progress)}%`;
      case 'uploading_questions':
        return `Uploading questions to database... ${Math.round(progress.progress)}%`;
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return `Error: ${progress.error}`;
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="admin-upload-container">
      <div className="upload-card">
        <h2 className="upload-title">📤 Bulk Question Upload</h2>
        <p className="upload-subtitle">
          Upload MCQ questions from Excel or CSV files with optional images
        </p>

        {/* Template Downloads */}
        <div className="template-section">
          <h3>📋 Download Templates</h3>
          <div className="template-buttons">
            <button 
              onClick={downloadSampleCSV}
              className="template-btn csv-btn"
            >
              📄 Download CSV Template
            </button>
            <button 
              onClick={downloadSampleExcel}
              className="template-btn excel-btn"
            >
              📊 Download Excel Template
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="upload-section">
          <h3>1️⃣ Select Question File</h3>
          <div className="file-input-wrapper">
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={uploading}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              {file ? `✅ ${file.name}` : '📁 Choose Excel/CSV File'}
            </label>
          </div>
          {file && (
            <div className="file-info">
              <p>📂 {file.name}</p>
              <p>📏 {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="upload-section">
          <h3>2️⃣ Select Question Images (Optional)</h3>
          <p className="section-note">
            Upload images referenced in your question file. 
            Image filenames should match the 'image_path' column in your file.
          </p>
          <div className="file-input-wrapper">
            <input
              id="image-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageSelect}
              disabled={uploading}
              className="file-input"
            />
            <label htmlFor="image-input" className="file-input-label">
              {imageFiles.length > 0 
                ? `✅ ${imageFiles.length} image(s) selected` 
                : '🖼️ Choose Images (Optional)'}
            </label>
          </div>
          {imageFiles.length > 0 && (
            <div className="image-list">
              {imageFiles.map((img, index) => (
                <div key={index} className="image-item">
                  <span>🖼️ {img.name}</span>
                  <span className="image-size">{(img.size / 1024).toFixed(2)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`upload-btn ${uploading ? 'uploading' : ''}`}
          >
            {uploading ? '⏳ Uploading...' : '🚀 Upload Questions'}
          </button>
        </div>

        {/* Progress Display */}
        {progress && (
          <div className="progress-section">
            <div className="progress-text">{getProgressText()}</div>
            {progress.progress !== undefined && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        {/* Success Result */}
        {result && result.success && (
          <div className="success-message">
            <h3>✅ Upload Successful!</h3>
            <div className="result-stats">
              <div className="stat-item">
                <span className="stat-label">Total Parsed:</span>
                <span className="stat-value">{result.totalParsed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Valid Questions:</span>
                <span className="stat-value green">{result.validQuestions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Invalid Questions:</span>
                <span className="stat-value red">{result.invalidQuestions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Uploaded:</span>
                <span className="stat-value blue">{result.totalUploaded}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Subjects:</span>
                <span className="stat-value">{result.subjects}</span>
              </div>
            </div>
            
            {result.invalidRows && result.invalidRows.length > 0 && (
              <div className="invalid-rows">
                <p className="invalid-warning">
                  ⚠️ Invalid rows skipped: {result.invalidRows.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-section">
          <h3>📖 Instructions</h3>
          <ol className="instruction-list">
            <li>Download the CSV or Excel template</li>
            <li>Fill in your questions following the format</li>
            <li>For questions with images, prepare image files</li>
            <li>Upload the completed file and images</li>
            <li>Click "Upload Questions" to import</li>
          </ol>
          
          <div className="format-info">
            <p><strong>Required Columns:</strong></p>
            <ul>
              <li>subject - Subject name (e.g., math, science, mat, sat)</li>
              <li>question - Question text</li>
              <li>option_a, option_b, option_c, option_d - Answer options</li>
              <li>correct_answer - Correct option (a, b, c, d or 0, 1, 2, 3)</li>
            </ul>
            
            <p><strong>Optional Columns:</strong></p>
            <ul>
              <li>difficulty - easy, medium, or hard</li>
              <li>tags - Semicolon-separated tags (e.g., "algebra;equations")</li>
              <li>image_path - Filename of question image</li>
              <li>explanation - Detailed explanation</li>
              <li>marks - Points for question (default: 1)</li>
              <li>time_limit - Seconds per question (default: 60)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionUpload;
