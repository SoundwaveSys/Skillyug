/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes Firebase services for the application:
 * - Authentication (email/password, Google Sign-In)
 * - Firestore Database (for storing questions, user data, exam history)
 * - Storage (for storing question images)
 * 
 * Environment variables are loaded from .env file
 * Follow security best practices by never committing .env to Git
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration object from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are present
const validateConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration variables:', missing);
    throw new Error(`Missing required Firebase environment variables: ${missing.join(', ')}`);
  }
};

// Validate configuration before initializing
validateConfig();

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
// Set persistence to LOCAL so users stay logged in after browser refresh
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Google Auth Provider for Google Sign-In
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Force account selection even if user has one Google account
});

// Initialize Firestore Database
const db = getFirestore(app);

// Enable offline persistence for Firestore
// This allows the app to work offline and sync when connection is restored
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('⚠️ Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('⚠️ Firestore persistence not supported in this browser');
    }
  });
} catch (err) {
  console.error('Error enabling Firestore persistence:', err);
}

// Initialize Firebase Storage for image uploads
const storage = getStorage(app);

// Initialize Analytics (optional, only if measurementId is provided)
let analytics = null;
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  analytics = getAnalytics(app);
}

// Export initialized services for use throughout the app
export { 
  app,           // Firebase app instance
  auth,          // Authentication service
  googleProvider,// Google OAuth provider
  db,            // Firestore database
  storage,       // Cloud Storage
  analytics      // Analytics (optional)
};

// Export helper to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

console.log('✅ Firebase initialized successfully');
