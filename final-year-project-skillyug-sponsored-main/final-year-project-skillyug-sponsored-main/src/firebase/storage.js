/**
 * Firebase Storage Service
 * 
 * Handles all file/image operations:
 * - Upload question images
 * - Generate public/private URLs
 * - Delete images
 * - Batch upload from local files
 * - Progress tracking for uploads
 * 
 * Storage Structure:
 * /questions/{subjectId}/{questionId}/{filename}
 * /profiles/{userId}/{filename}
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a single image for a question
 * Shows upload progress
 * 
 * @param {File} file - Image file to upload
 * @param {string} subjectId - Subject ID
 * @param {string} questionId - Question ID
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<Object>} - Download URL and success status
 */
export const uploadQuestionImage = async (
  file,
  subjectId,
  questionId,
  onProgress = null
) => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storagePath = `questions/${subjectId}/${questionId}/${filename}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          if (onProgress) {
            onProgress(Math.round(progress));
          }
          
          console.log(`Upload is ${progress.toFixed(2)}% done`);
        },
        (error) => {
          // Handle upload errors
          console.error('❌ Upload error:', error);
          
          let message = 'Failed to upload image';
          
          switch (error.code) {
            case 'storage/unauthorized':
              message = 'Unauthorized to upload files. Please login.';
              break;
            case 'storage/canceled':
              message = 'Upload cancelled.';
              break;
            case 'storage/quota-exceeded':
              message = 'Storage quota exceeded.';
              break;
            default:
              message = error.message;
          }
          
          reject({
            success: false,
            error: message
          });
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            console.log('✅ Image uploaded successfully');
            
            resolve({
              success: true,
              url: downloadURL,
              path: storagePath,
              filename: filename,
              size: file.size,
              type: file.type
            });
          } catch (error) {
            reject({
              success: false,
              error: 'Failed to get download URL'
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload profile picture for user
 * 
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Download URL and success status
 */
export const uploadProfilePicture = async (file, userId, onProgress = null) => {
  try {
    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }
    
    const maxSize = 2 * 1024 * 1024; // 2MB for profile pictures
    if (file.size > maxSize) {
      throw new Error('File size exceeds 2MB limit.');
    }
    
    const filename = `profile_${Date.now()}.${file.name.split('.').pop()}`;
    const storagePath = `profiles/${userId}/${filename}`;
    const storageRef = ref(storage, storagePath);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('❌ Profile upload error:', error);
          reject({ success: false, error: error.message });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              path: storagePath
            });
          } catch (error) {
            reject({ success: false, error: 'Failed to get download URL' });
          }
        }
      );
    });
  } catch (error) {
    console.error('❌ Error uploading profile picture:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Batch upload multiple images
 * Useful for uploading question images from CSV/Excel
 * 
 * @param {Array} files - Array of {file, subjectId, questionId} objects
 * @param {Function} onOverallProgress - Callback for overall progress
 * @returns {Promise<Object>} - Array of upload results
 */
export const batchUploadImages = async (files, onOverallProgress = null) => {
  try {
    const results = [];
    let completed = 0;
    
    // Upload files sequentially to avoid overwhelming the browser
    for (const { file, subjectId, questionId } of files) {
      try {
        const result = await uploadQuestionImage(
          file,
          subjectId,
          questionId,
          null // Individual progress not tracked in batch
        );
        
        results.push({
          questionId,
          ...result
        });
      } catch (error) {
        results.push({
          questionId,
          success: false,
          error: error.message
        });
      }
      
      completed++;
      
      if (onOverallProgress) {
        onOverallProgress((completed / files.length) * 100);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log(`✅ Batch upload complete: ${successCount} success, ${failCount} failed`);
    
    return {
      success: true,
      results,
      successCount,
      failCount,
      total: results.length
    };
  } catch (error) {
    console.error('❌ Batch upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete an image from storage
 * 
 * @param {string} storagePath - Full path in storage
 * @returns {Promise<Object>} - Success status
 */
export const deleteImage = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    console.log('✅ Image deleted successfully');
    
    return {
      success: true,
      message: 'Image deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    
    let message = 'Failed to delete image';
    
    if (error.code === 'storage/object-not-found') {
      message = 'Image not found';
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Delete all images for a specific question
 * Useful when deleting a question
 * 
 * @param {string} subjectId - Subject ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} - Success status with count
 */
export const deleteQuestionImages = async (subjectId, questionId) => {
  try {
    const folderRef = ref(storage, `questions/${subjectId}/${questionId}`);
    
    // List all files in the folder
    const listResult = await listAll(folderRef);
    
    // Delete all files
    const deletePromises = listResult.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${listResult.items.length} images`);
    
    return {
      success: true,
      count: listResult.items.length,
      message: `${listResult.items.length} images deleted`
    };
  } catch (error) {
    console.error('❌ Error deleting question images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get download URL for an existing file
 * 
 * @param {string} storagePath - Full path in storage
 * @returns {Promise<Object>} - Download URL
 */
export const getImageURL = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    const url = await getDownloadURL(storageRef);
    
    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('❌ Error getting image URL:', error);
    
    let message = 'Failed to get image URL';
    
    if (error.code === 'storage/object-not-found') {
      message = 'Image not found';
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Upload image from URL (useful for migrating from external sources)
 * 
 * @param {string} imageUrl - External image URL
 * @param {string} subjectId - Subject ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} - Firebase storage URL
 */
export const uploadImageFromURL = async (imageUrl, subjectId, questionId) => {
  try {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create File object
    const filename = imageUrl.split('/').pop() || 'image.jpg';
    const file = new File([blob], filename, { type: blob.type });
    
    // Upload to Firebase
    const result = await uploadQuestionImage(file, subjectId, questionId);
    
    return result;
  } catch (error) {
    console.error('❌ Error uploading from URL:', error);
    return {
      success: false,
      error: 'Failed to upload image from URL'
    };
  }
};

/**
 * Compress image before upload (client-side optimization)
 * Reduces storage costs and improves load times
 * 
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width (default 1200px)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log(`✅ Compressed: ${(file.size / 1024).toFixed(2)}KB → ${(blob.size / 1024).toFixed(2)}KB`);
              
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Export storage instance for direct use if needed
export { storage };
