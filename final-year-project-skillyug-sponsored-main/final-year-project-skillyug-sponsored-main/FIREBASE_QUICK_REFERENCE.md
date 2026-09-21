# Firebase Integration - Quick Reference

Quick reference guide for developers working with Firebase in the PrepMark app.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Fill in Firebase credentials in .env
# Get credentials from Firebase Console > Project Settings

# 4. Start development server
npm run dev
```

---

## 📁 File Structure

```
src/
├── firebase/
│   ├── config.js          # Firebase initialization
│   ├── auth.js            # Authentication functions
│   ├── firestore.js       # Database operations
│   └── storage.js         # File/image storage
├── contexts/
│   └── AuthContext.jsx    # Auth state provider
├── hooks/
│   └── useFirebase.js     # Custom hooks for Firebase
└── utils/
    └── dataUploader.js    # Bulk question upload utility

firestore.rules             # Firestore security rules
storage.rules               # Storage security rules
.env                        # Environment variables (git-ignored)
```

---

## 🔑 Authentication

### Register User

```javascript
import { registerWithEmail } from '../firebase/auth';

const result = await registerWithEmail(email, password, {
  fullName: 'John Doe',
  grade: '8',
  role: 'student'
});

if (result.success) {
  // User created successfully
  navigate('/home');
} else {
  // Show error
  alert(result.error);
}
```

### Login

```javascript
import { loginWithEmail, loginWithGoogle } from '../firebase/auth';

// Email/Password
const result = await loginWithEmail(email, password);

// Google Sign-In
const result = await loginWithGoogle();
```

### Logout

```javascript
import { logout } from '../firebase/auth';

await logout();
```

### Check Auth State

```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, userProfile, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Welcome {user.displayName}</div>;
};
```

---

## 💾 Firestore Operations

### Fetch Questions with Pagination

```javascript
import { useQuestions } from '../hooks/useFirebase';

const Practice = () => {
  const { questions, loading, hasMore, loadMore } = useQuestions('math', 20);

  return (
    <div>
      {questions.map(q => <QuestionCard key={q.id} question={q} />)}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
};
```

### Fetch Random Questions

```javascript
import { useRandomQuestions } from '../hooks/useFirebase';

const QuickQuiz = () => {
  const { questions, loading, refresh } = useRandomQuestions('math', 10, {
    difficulty: 'medium'
  });

  return (
    <div>
      {questions.map(q => <Question key={q.id} {...q} />)}
      <button onClick={refresh}>New Questions</button>
    </div>
  );
};
```

### Save Exam Result

```javascript
import { useExamHistory } from '../hooks/useFirebase';

const ExamResults = () => {
  const { addExam } = useExamHistory();

  useEffect(() => {
    addExam({
      examType: 'mat',
      score: 75,
      totalQuestions: 90,
      percentage: 83.33,
      timeSpent: 5400,
      attempted: 88,
      correct: 75,
      wrong: 13,
      unattempted: 2
    });
  }, []);

  return <div>Results displayed here</div>;
};
```

### Update User XP

```javascript
import { useUserXP } from '../hooks/useFirebase';

const { totalXP, level, addXP } = useUserXP();

// Add 50 XP
const result = await addXP(50);

if (result.leveledUp) {
  console.log(`Level up! Now level ${result.newLevel}`);
}
```

---

## 📤 File Upload

### Upload Question Images

```javascript
import { uploadQuestionImage } from '../firebase/storage';

const handleImageUpload = async (file) => {
  const result = await uploadQuestionImage(
    file,
    'math',         // subjectId
    'q123',         // questionId
    (progress) => {
      console.log(`Upload progress: ${progress}%`);
    }
  );

  if (result.success) {
    console.log('Image URL:', result.url);
  }
};
```

### Upload Profile Picture

```javascript
import { uploadProfilePicture } from '../firebase/storage';

const result = await uploadProfilePicture(file, userId);

if (result.success) {
  // Update user profile with result.url
}
```

---

## 📊 Bulk Question Upload

### From Admin Panel

```javascript
import AdminQuestionUpload from '../components/AdminQuestionUpload';

// Use in AdminHome.jsx
<AdminQuestionUpload />
```

### Programmatically

```javascript
import { uploadQuestionsFromFile } from '../utils/dataUploader';

const result = await uploadQuestionsFromFile(
  csvFile,
  imageFiles,
  (progress) => {
    console.log(progress.stage, progress.progress);
  }
);

console.log(`Uploaded ${result.totalUploaded} questions`);
```

---

## 🔒 Security Rules

### Allow User to Read Own Data

```javascript
// Already configured in firestore.rules
match /users/{userId} {
  allow read: if request.auth.uid == userId;
}
```

### Admin Only Access

```javascript
// Already configured in firestore.rules
match /subjects/{subjectId}/questions/{questionId} {
  allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 🎯 Common Patterns

### Protected Route

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### Admin Only Component

```javascript
const { isAdmin } = useAuth();

if (!isAdmin) {
  return <div>Access Denied</div>;
}
```

### Handle Loading States

```javascript
const { questions, loading, error } = useQuestions('math');

if (loading) return <Loader />;
if (error) return <Error message={error} />;
if (questions.length === 0) return <EmptyState />;

return <QuestionList questions={questions} />;
```

---

## 🐛 Common Issues & Solutions

### Issue: Firebase not initialized

**Solution**: Ensure `.env` file exists with correct values and restart dev server

### Issue: Permission denied

**Solution**: Deploy security rules with `firebase deploy --only firestore:rules`

### Issue: Questions not loading

**Solution**: Check Firebase Console → Firestore to ensure questions exist in correct path

### Issue: Image upload fails

**Solution**: Check file size (<5MB) and type (JPEG/PNG/WebP/GIF only)

---

## 📈 Performance Tips

1. **Use pagination** - Never load all questions at once
2. **Enable offline persistence** - Already configured in config.js
3. **Cache queries** - Use React Query or SWR for advanced caching
4. **Compress images** - Use `compressImage()` before upload
5. **Batch operations** - Use `batchUploadQuestions()` for bulk uploads

---

## 🔗 Useful Links

- [Full Setup Guide](./FIREBASE_SETUP.md)
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

## 🆘 Need Help?

1. Check `FIREBASE_SETUP.md` for detailed instructions
2. Review Firebase Console logs
3. Check browser console for errors
4. Verify `.env` configuration

---

**Last Updated**: March 6, 2026
