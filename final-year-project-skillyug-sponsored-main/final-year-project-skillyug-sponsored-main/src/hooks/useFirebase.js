/**
 * Custom React Hooks for Firebase Operations
 * 
 * Provides reusable hooks for common Firebase operations:
 * - useQuestions: Fetch and paginate questions
 * - useExamHistory: Manage exam history
 * - useUserStats: Track user statistics
 * - useFirebaseQuery: Generic Firestore query hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchQuestions, 
  fetchRandomQuestions,
  updateQuestionStats,
  fetchExamHistory,
  saveExamHistory,
  deleteExamHistory,
  updateUserXP,
  updateUserStreak
} from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for fetching questions with pagination
 * 
 * @param {string} subjectId - Subject ID
 * @param {number} pageSize - Questions per page
 * @param {Object} filters - Optional filters
 * @returns {Object} - Questions, loading state, and pagination functions
 */
export const useQuestions = (subjectId, pageSize = 20, filters = {}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Cache to avoid refetching
  const cacheRef = useRef({});
  const cacheKey = `${subjectId}_${JSON.stringify(filters)}`;

  /**
   * Load initial questions
   */
  const loadQuestions = useCallback(async () => {
    // Check cache first
    if (cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setQuestions(cached.questions);
      setLastDoc(cached.lastDoc);
      setHasMore(cached.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchQuestions(subjectId, pageSize, null, filters);

      if (result.success) {
        setQuestions(result.questions);
        setLastDoc(result.lastVisible);
        setHasMore(result.hasMore);
        
        // Cache results
        cacheRef.current[cacheKey] = {
          questions: result.questions,
          lastDoc: result.lastVisible,
          hasMore: result.hasMore
        };
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId, pageSize, filters, cacheKey]);

  /**
   * Load next page
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const result = await fetchQuestions(subjectId, pageSize, lastDoc, filters);

      if (result.success) {
        setQuestions(prev => [...prev, ...result.questions]);
        setLastDoc(result.lastVisible);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId, pageSize, lastDoc, filters, hasMore, loading]);

  /**
   * Refresh questions (clear cache and reload)
   */
  const refresh = useCallback(() => {
    delete cacheRef.current[cacheKey];
    setQuestions([]);
    setLastDoc(null);
    setHasMore(true);
    loadQuestions();
  }, [cacheKey, loadQuestions]);

  // Load questions on mount and when dependencies change
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

/**
 * Hook for fetching random questions (for quick quizzes)
 * 
 * @param {string} subjectId - Subject ID
 * @param {number} count - Number of questions
 * @param {Object} filters - Optional filters
 * @returns {Object} - Questions, loading state, and refresh function
 */
export const useRandomQuestions = (subjectId, count = 10, filters = {}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRandomQuestions(subjectId, count, filters);

      if (result.success) {
        setQuestions(result.questions);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId, count, filters]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    loading,
    error,
    refresh: loadQuestions
  };
};

/**
 * Hook for managing exam history
 * 
 * @returns {Object} - Exam history, loading state, and CRUD functions
 */
export const useExamHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  /**
   * Load exam history
   */
  const loadHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchExamHistory(user.uid, 20, null);

      if (result.success) {
        setHistory(result.history);
        setLastDoc(result.lastVisible);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Load more history
   */
  const loadMore = useCallback(async () => {
    if (!user || !hasMore || loading) return;

    setLoading(true);

    try {
      const result = await fetchExamHistory(user.uid, 20, lastDoc);

      if (result.success) {
        setHistory(prev => [...prev, ...result.history]);
        setLastDoc(result.lastVisible);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, lastDoc, hasMore, loading]);

  /**
   * Add new exam result
   */
  const addExam = useCallback(async (examData) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const result = await saveExamHistory(user.uid, examData);

      if (result.success) {
        // Refresh history
        await loadHistory();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user, loadHistory]);

  /**
   * Delete exam from history
   */
  const deleteExam = useCallback(async (examId) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const result = await deleteExamHistory(user.uid, examId);

      if (result.success) {
        // Remove from local state
        setHistory(prev => prev.filter(exam => exam.id !== examId));
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user]);

  // Load on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    hasMore,
    loadMore,
    addExam,
    deleteExam,
    refresh: loadHistory
  };
};

/**
 * Hook for managing user XP and level
 * 
 * @returns {Object} - XP data and update function
 */
export const useUserXP = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  /**
   * Add XP to user
   */
  const addXP = useCallback(async (amount) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setUpdating(true);

    try {
      const result = await updateUserXP(user.uid, amount);

      if (result.success) {
        // Refresh profile to get updated XP
        await refreshProfile();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [user, refreshProfile]);

  return {
    totalXP: userProfile?.totalXP || 0,
    level: userProfile?.level || 1,
    addXP,
    updating
  };
};

/**
 * Hook for managing user streak
 * 
 * @returns {Object} - Streak data and update function
 */
export const useStreak = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  /**
   * Update streak
   */
  const updateStreak = useCallback(async (newStreak) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setUpdating(true);

    try {
      const result = await updateUserStreak(user.uid, newStreak);

      if (result.success) {
        await refreshProfile();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [user, refreshProfile]);

  return {
    streak: userProfile?.streak || 0,
    updateStreak,
    updating
  };
};

/**
 * Hook for tracking question statistics
 * 
 * @returns {Object} - Function to record answer
 */
export const useQuestionStats = () => {
  const recordAnswer = useCallback(async (subjectId, questionId, wasCorrect) => {
    try {
      await updateQuestionStats(subjectId, questionId, wasCorrect);
    } catch (err) {
      console.error('Failed to record answer:', err);
    }
  }, []);

  return { recordAnswer };
};

/**
 * Hook for debouncing values
 * Useful for search inputs, etc.
 * 
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
