/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * - Current user information
 * - Login/logout functions
 * - Loading states
 * - Protected route logic
 * 
 * Usage:
 * import { useAuth } from './contexts/AuthContext';
 * const { user, loading, login, logout } = useAuth();
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthChange, getUserProfile } from '../firebase/auth';

// Create context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

/**
 * AuthProvider Component
 * Wraps the app to provide authentication state
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        console.log('✅ User signed in:', firebaseUser.email);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
        
        // Fetch user profile from Firestore
        try {
          const profileResult = await getUserProfile();
          
          if (profileResult.success) {
            setUserProfile(profileResult.profile);
          } else {
            console.warn('⚠️ Could not fetch user profile');
          }
        } catch (error) {
          console.error('❌ Error fetching profile:', error);
          setError('Failed to load user profile');
        }
      } else {
        // User is signed out
        console.log('ℹ️ User signed out');
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Refresh user profile data
   * Call this after profile updates
   */
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const profileResult = await getUserProfile();
      
      if (profileResult.success) {
        setUserProfile(profileResult.profile);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to refresh profile' };
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user;
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check (student, admin, etc.)
   */
  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Check if user is student
   */
  const isStudent = () => {
    return hasRole('student');
  };

  // Context value
  const value = {
    // State
    user,
    userProfile,
    loading,
    error,
    
    // Computed values
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isStudent: isStudent(),
    
    // Methods
    refreshProfile,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
