/**
 * Firebase Authentication Service
 * 
 * Handles all authentication operations including:
 * - Email/Password sign up and login
 * - Google Sign-In
 * - Password reset
 * - User session management
 * - Profile updates
 * 
 * All functions include proper error handling and return standardized responses
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

/**
 * Create user profile document in Firestore
 * This is called after successful registration to store additional user data
 * 
 * @param {string} uid - User ID from Firebase Auth
 * @param {Object} userData - Additional user information
 * @returns {Promise<void>}
 */
const createUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Check if profile already exists
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalXP: 0,
        streak: 0,
        level: 1,
        examHistory: [],
        practiceHistory: [],
        settings: {
          notifications: {
            email: true,
            push: true,
            studyReminders: true,
            achievementAlerts: true
          },
          study: {
            dailyGoal: 60, // minutes
            difficulty: 'medium',
            soundEffects: true,
            showHints: true
          },
          appearance: {
            theme: 'auto',
            fontSize: 'medium',
            animations: true
          }
        }
      });
      console.log('✅ User profile created successfully');
    } else {
      console.log('ℹ️ User profile already exists');
    }
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
};

/**
 * Register new user with email and password
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 6 characters)
 * @param {Object} profileData - Additional profile information (name, grade, etc.)
 * @returns {Promise<Object>} - User object and success status
 */
export const registerWithEmail = async (email, password, profileData = {}) => {
  try {
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (profileData.fullName) {
      await updateProfile(user, {
        displayName: profileData.fullName
      });
    }
    
    // Create Firestore profile
    await createUserProfile(user.uid, {
      email: user.email,
      displayName: profileData.fullName || '',
      fullName: profileData.fullName || '',
      dateOfBirth: profileData.dateOfBirth || '',
      guardianName: profileData.guardianName || '',
      guardianEmail: profileData.guardianEmail || '',
      guardianPhone: profileData.guardianPhone || '',
      role: profileData.role || 'student',
      isGuardianVerified: false
    });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      message: 'Account created successfully!'
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific error codes
    let message = 'Failed to create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered. Please login instead.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address format.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Login user with email and password
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User object and success status
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login timestamp
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      message: 'Login successful!'
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    
    let message = 'Failed to login';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        message = 'Invalid email or password.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Login/Register with Google Sign-In
 * If user doesn't exist, creates a new account automatically
 * 
 * @returns {Promise<Object>} - User object and success status
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if this is a new user
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // New user - create profile
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        fullName: user.displayName,
        photoURL: user.photoURL,
        role: 'student',
        provider: 'google'
      });
    } else {
      // Existing user - update last login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      },
      message: userSnap.exists() ? 'Login successful!' : 'Account created successfully!'
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    
    let message = 'Failed to sign in with Google';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed. Please try again.';
        break;
      case 'auth/popup-blocked':
        message = 'Popup blocked by browser. Please allow popups and try again.';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Sign-in cancelled.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Logout current user
 * 
 * @returns {Promise<Object>} - Success status
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logged out successfully!'
    };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout'
    };
  }
};

/**
 * Send password reset email
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Success status
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    };
  } catch (error) {
    console.error('❌ Password reset error:', error);
    
    let message = 'Failed to send reset email';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Update user display name
 * 
 * @param {string} displayName - New display name
 * @returns {Promise<Object>} - Success status
 */
export const updateDisplayName = async (displayName) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await updateProfile(user, { displayName });
    
    // Update Firestore profile
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      displayName,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Name updated successfully!'
    };
  } catch (error) {
    console.error('❌ Update name error:', error);
    return {
      success: false,
      error: 'Failed to update name'
    };
  }
};

/**
 * Update user email address
 * Requires recent authentication
 * 
 * @param {string} newEmail - New email address
 * @param {string} currentPassword - Current password for re-authentication
 * @returns {Promise<Object>} - Success status
 */
export const updateUserEmail = async (newEmail, currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Re-authenticate user before sensitive operation
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update email
    await updateEmail(user, newEmail);
    
    // Update Firestore profile
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Email updated successfully!'
    };
  } catch (error) {
    console.error('❌ Update email error:', error);
    
    let message = 'Failed to update email';
    
    switch (error.code) {
      case 'auth/wrong-password':
        message = 'Incorrect password.';
        break;
      case 'auth/email-already-in-use':
        message = 'This email is already in use.';
        break;
      case 'auth/requires-recent-login':
        message = 'Please logout and login again to update email.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Update user password
 * Requires recent authentication
 * 
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Success status
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    
    return {
      success: true,
      message: 'Password updated successfully!'
    };
  } catch (error) {
    console.error('❌ Update password error:', error);
    
    let message = 'Failed to update password';
    
    switch (error.code) {
      case 'auth/wrong-password':
        message = 'Incorrect current password.';
        break;
      case 'auth/weak-password':
        message = 'New password should be at least 6 characters.';
        break;
      case 'auth/requires-recent-login':
        message = 'Please logout and login again to update password.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Delete user account
 * Requires recent authentication
 * 
 * @param {string} password - Current password for confirmation
 * @returns {Promise<Object>} - Success status
 */
export const deleteUserAccount = async (password) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete Firestore profile first
    const userRef = doc(db, 'users', user.uid);
    await deleteDoc(userRef);
    
    // Delete authentication account
    await deleteUser(user);
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('❌ Delete account error:', error);
    
    let message = 'Failed to delete account';
    
    switch (error.code) {
      case 'auth/wrong-password':
        message = 'Incorrect password.';
        break;
      case 'auth/requires-recent-login':
        message = 'Please logout and login again to delete account.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Get current user profile from Firestore
 * 
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        success: true,
        profile: {
          uid: user.uid,
          ...userSnap.data()
        }
      };
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return {
      success: false,
      error: 'Failed to fetch profile'
    };
  }
};

/**
 * Update user profile data in Firestore
 * 
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise<Object>} - Success status
 */
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    const userRef = doc(db, 'users', user.uid);
    
    // Update Firestore profile with new data
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    // Update display name in Firebase Auth if provided
    if (profileData.fullName) {
      await updateProfile(user, {
        displayName: profileData.fullName
      });
    }
    
    return {
      success: true,
      message: 'Profile updated successfully!'
    };
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
};

/**
 * Listen to authentication state changes
 * Useful for persisting login state across page refreshes
 * 
 * @param {Function} callback - Called with user object when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ==================== ADMIN AUTHENTICATION ====================

/**
 * Admin login with email, password, and authentication key
 * Verifies user is an admin before allowing access
 * 
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @param {string} authKey - Admin authentication key (from .env)
 * @returns {Promise<Object>} - Admin user object and success status
 */
export const loginAdmin = async (email, password, authKey) => {
  try {
    // Verify auth key
    const validAuthKey = import.meta.env.VITE_ADMIN_AUTH_KEY || 'admin@2024';
    
    if (authKey !== validAuthKey) {
      return {
        success: false,
        error: 'Invalid authentication key. Access denied.'
      };
    }
    
    // Attempt login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verify user is admin
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Sign out and deny access
      await signOut(auth);
      return {
        success: false,
        error: 'User profile not found. Please contact support.'
      };
    }
    
    const userData = userSnap.data();
    
    if (userData.role !== 'admin') {
      // User is not an admin - sign them out
      await signOut(auth);
      return {
        success: false,
        error: 'Access denied. This account does not have admin privileges.'
      };
    }
    
    // Update last login
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
    
    console.log('✅ Admin login successful:', email);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'admin'
      },
      message: 'Admin login successful!'
    };
  } catch (error) {
    console.error('❌ Admin login error:', error);
    
    let message = 'Admin login failed';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        message = 'Invalid email or password.';
        break;
      case 'auth/user-disabled':
        message = 'This admin account has been disabled.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      default:
        message = error.message;
    }
    
    return {
      success: false,
      error: message
    };
  }
};

/**
 * Check if current user is an admin
 * 
 * @returns {Promise<boolean>} - True if user is admin
 */
export const isUserAdmin = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return false;
    
    return userSnap.data().role === 'admin';
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
};

// Export auth instance for direct use if needed
export { auth };
