# Migration Guide: localStorage to Firebase

This guide helps you transition existing components from localStorage to Firebase.

---

## 📋 Overview

Current state: The app uses localStorage for:
- User authentication (simulated)
- Exam history
- Practice logs
- User XP and streaks
- Settings

New state: All data will be stored in Firebase with:
- Real authentication
- Cloud-synced data
- Multi-device support
- Better security

---

## 🔄 Step-by-Step Migration

### 1. Wrap App with AuthProvider

**File**: `src/main.jsx`

**Before**:
```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**After**:
```javascript
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

---

### 2. Update Login.jsx

**File**: `src/jsx files/Login.jsx`

**Replace localStorage login with Firebase**:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from '../firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginWithEmail(email, password);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    // Your existing JSX
    // Update form onSubmit={handleLogin}
    // Add Google button onClick={handleGoogleLogin}
    // Display {error} if present
    // Disable buttons when {loading}
  );
};
```

---

### 3. Update CreateAccount.jsx

**File**: `src/jsx files/CreateAccount.jsx`

```javascript
import { registerWithEmail } from '../firebase/auth';

const CreateAccount = () => {
  // ... existing state

  const handleRegister = async (e) => {
    e.preventDefault();

    const result = await registerWithEmail(email, password, {
      fullName,
      dateOfBirth,
      grade,
      school,
      guardianName,
      guardianEmail,
      guardianPhone,
      role: 'student'
    });

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }
  };

  // Keep existing JSX
};
```

---

### 4. Update Home.jsx

**File**: `src/jsx files/Home.jsx`

**Replace localStorage XP/streak with Firebase**:

```javascript
import { useAuth } from '../contexts/AuthContext';
import { useUserXP, useStreak } from '../hooks/useFirebase';

const Home = () => {
  const { user, userProfile } = useAuth();
  const { totalXP, level, addXP } = useUserXP();
  const { streak, updateStreak } = useStreak();

  // Remove localStorage.getItem('totalXP') calls
  // Use totalXP from hook instead

  const handleDailyQuiz = async () => {
    // After quiz completion
    await addXP(5); // Add 5 XP
  };

  return (
    // Update UI to use userProfile data
    <div>
      <p>XP: {totalXP}</p>
      <p>Level: {level}</p>
      <p>Streak: {streak} days</p>
    </div>
  );
};
```

---

### 5. Update ExamResults.jsx

**File**: `src/jsx files/ExamResults.jsx`

**Replace localStorage exam history with Firebase**:

**Before**:
```javascript
useEffect(() => {
  const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
  history.push(examData);
  localStorage.setItem('examHistory', JSON.stringify(history));
}, []);
```

**After**:
```javascript
import { useExamHistory } from '../hooks/useFirebase';

const ExamResults = () => {
  const { addExam } = useExamHistory();

  useEffect(() => {
    addExam({
      examType: 'mat',
      totalQuestions: 90,
      attempted: 88,
      correct: 75,
      wrong: 13,
      unattempted: 2,
      score: 75,
      percentage: 83.33,
      timeSpent: 5400,
    });
  }, []);

  return /* Your results UI */;
};
```

---

### 6. Update ExamHistory.jsx

**File**: `src/jsx files/ExamHistory.jsx`

**Replace localStorage with Firebase**:

```javascript
import { useExamHistory } from '../hooks/useFirebase';

const ExamHistory = () => {
  const { history, loading, deleteExam, refresh } = useExamHistory();

  const handleDelete = async (examId) => {
    const result = await deleteExam(examId);
    if (result.success) {
      alert('Exam deleted');
    }
  };

  const handleClearAll = async () => {
    // Implement using deleteExam for each item
    // Or add clearAllExamHistory to hook
  };

  if (loading) return <Loader />;

  return (
    <div>
      {history.map(exam => (
        <ExamCard 
          key={exam.id} 
          exam={exam} 
          onDelete={() => handleDelete(exam.id)}
        />
      ))}
    </div>
  );
};
```

---

### 7. Update Practice.jsx

**Use Firebase questions instead of mock data**:

```javascript
import { useQuestions } from '../hooks/useFirebase';

const Practice = () => {
  const { questions, loading, hasMore, loadMore } = useQuestions('math', 20);

  if (loading) return <Loader />;

  return (
    <div>
      {questions.map(q => (
        <QuestionCard key={q.id} question={q} />
      ))}
      {hasMore && (
        <button onClick={loadMore}>Load More Questions</button>
      )}
    </div>
  );
};
```

---

### 8. Update PracticePage.jsx

**Fetch real questions from Firebase**:

```javascript
import { useRandomQuestions } from '../hooks/useFirebase';
import { useQuestionStats } from '../hooks/useFirebase';

const PracticePage = () => {
  const subjectId = 'math'; // From navigation state
  const { questions, loading } = useRandomQuestions(subjectId, 10);
  const { recordAnswer } = useQuestionStats();

  const handleAnswerSubmit = async (questionId, wasCorrect) => {
    // Record statistics
    await recordAnswer(subjectId, questionId, wasCorrect);
    
    // Continue with quiz logic
  };

  if (loading) return <Loader />;

  return /* Quiz UI with real questions */;
};
```

---

### 9. Update Settings.jsx

**Save settings to Firebase user profile**:

```javascript
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/firestore';

const Settings = () => {
  const { user, refreshProfile } = useAuth();

  const handleSave = async (settings) => {
    const result = await updateUserProfile(user.uid, {
      settings: {
        notifications: { ... },
        study: { ... },
        appearance: { ... }
      }
    });

    if (result.success) {
      await refreshProfile(); // Refresh context
      alert('Settings saved!');
    }
  };

  return /* Settings UI */;
};
```

---

### 10. Update Profile.jsx

**Load and save profile from Firebase**:

```javascript
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/firestore';

const Profile = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (updatedData) => {
    const result = await updateUserProfile(user.uid, updatedData);

    if (result.success) {
      await refreshProfile();
      setIsEditing(false);
      alert('Profile updated!');
    } else {
      alert(result.error);
    }
  };

  return (
    <div>
      <p>Name: {userProfile?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Grade: {userProfile?.grade}</p>
    </div>
  );
};
```

---

### 11. Add Protected Routes

**File**: `src/App.jsx`

```javascript
import { useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Loader from './components/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// In Routes:
<Route path="/home" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />
```

---

### 12. Update Navbar/MainNavbar

**Add logout functionality**:

```javascript
import { logout } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MainNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav>
      <p>Welcome, {user?.displayName}</p>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};
```

---

## ✅ Migration Checklist

- [ ] Install Firebase dependencies (`npm install firebase xlsx`)
- [ ] Create `.env` file with Firebase credentials
- [ ] Wrap App with AuthProvider in `main.jsx`
- [ ] Update Login.jsx to use Firebase auth
- [ ] Update CreateAccount.jsx to use Firebase auth
- [ ] Update Home.jsx to use Firebase XP/streak
- [ ] Update ExamResults.jsx to save to Firebase
- [ ] Update ExamHistory.jsx to load from Firebase
- [ ] Update Practice.jsx to load questions from Firebase
- [ ] Update PracticePage.jsx to use real questions
- [ ] Update Settings.jsx to save to Firebase
- [ ] Update Profile.jsx to load/save from Firebase
- [ ] Add ProtectedRoute component
- [ ] Update all routes to use ProtectedRoute
- [ ] Add logout to navbars
- [ ] Remove all localStorage.setItem() calls
- [ ] Remove all localStorage.getItem() calls
- [ ] Test authentication flow
- [ ] Test data persistence
- [ ] Deploy security rules to Firebase
- [ ] Test on multiple devices

---

## 🔍 Finding localStorage Usage

Search for these patterns and replace:

```bash
# Find localStorage usage
grep -r "localStorage" src/

# Common patterns to replace:
localStorage.getItem('examHistory')
localStorage.setItem('totalXP', ...)
localStorage.getItem('userStreak')
localStorage.setItem('settings', ...)
```

---

## 🧪 Testing After Migration

1. **Auth Flow**:
   - Register new user
   - Login with email/password
   - Login with Google
   - Logout and login again
   - Check persistence across page refresh

2. **Data Persistence**:
   - Complete a quiz, check exam history
   - Update profile, reload page
   - Change settings, verify saved
   - Check XP and streak updates

3. **Multi-Device**:
   - Login on different browser
   - Verify data syncs
   - Complete quiz on device A
   - Check history on device B

---

## 🐛 Common Migration Issues

### Issue: "Firebase not initialized"
**Fix**: Ensure `.env` exists and server restarted

### Issue: Data not updating
**Fix**: Call `refreshProfile()` after updates

### Issue: Permission denied
**Fix**: Deploy security rules

### Issue: Old localStorage data conflicts
**Fix**: Clear browser storage and test fresh

---

## 📊 Data Migration Script

If you have existing users with localStorage data:

```javascript
// src/utils/migrateLocalStorage.js
import { saveExamHistory } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export const migrateLocalStorageToFirebase = async () => {
  const { user } = useAuth();
  
  // Migrate exam history
  const examHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
  for (const exam of examHistory) {
    await saveExamHistory(user.uid, exam);
  }
  
  // Clear old data
  localStorage.removeItem('examHistory');
  
  console.log('Migration complete!');
};
```

Run once after first Firebase login.

---

## 🎯 Benefits After Migration

✅ **Real Authentication** - Secure user accounts  
✅ **Cloud Sync** - Access data from any device  
✅ **Better Performance** - Pagination and caching  
✅ **Scalability** - Handle thousands of users  
✅ **Analytics** - Track user engagement  
✅ **Security** - Firestore rules protect data  
✅ **Offline Support** - Works without internet (sync later)  

---

**Last Updated**: March 6, 2026
