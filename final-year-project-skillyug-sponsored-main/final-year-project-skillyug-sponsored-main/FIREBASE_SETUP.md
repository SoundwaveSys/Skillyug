# Firebase Integration Setup Guide

Complete guide for setting up Firebase in the PrepMark NMMS Exam Prep application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Install Dependencies](#install-dependencies)
4. [Environment Configuration](#environment-configuration)
5. [Initialize Firebase Services](#initialize-firebase-services)
6. [Deploy Security Rules](#deploy-security-rules)
7. [Data Structure](#data-structure)
8. [Uploading Questions](#uploading-questions)
9. [Integration Guide](#integration-guide)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (free tier is sufficient to start)
- Basic knowledge of React and JavaScript

---

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `prepmark-nmms` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### Step 2: Register Web App

1. In project overview, click the **Web** icon `</>`
2. Register app with nickname: "PrepMark Web App"
3. ✅ **Enable Firebase Hosting** (optional)
4. Click "Register app"
5. **Copy the configuration object** - you'll need this later

### Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
   - Click on Email/Password
   - Toggle "Enable"
   - Click Save
3. Enable **Google Sign-In**
   - Click on Google
   - Toggle "Enable"
   - Set support email
   - Click Save

### Step 4: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Select **Production mode** (we'll deploy our own rules)
4. Choose closest location (e.g., `asia-south1` for India)
5. Click "Enable"

### Step 5: Enable Cloud Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in **Production mode**
4. Use same location as Firestore
5. Click "Done"

---

## 📦 Install Dependencies

Run the following command in your project directory:

```bash
npm install firebase xlsx
```

Or with yarn:

```bash
yarn add firebase xlsx
```

### Dependency Breakdown

- **firebase** (^10.x.x): Firebase SDK for authentication, Firestore, and Storage
- **xlsx** (^0.18.x): Library for parsing Excel/CSV files

---

## ⚙️ Environment Configuration

### Step 1: Create Environment File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 2: Find Your Credentials

From Firebase Console:
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Find your web app
4. Copy each value to `.env`

⚠️ **IMPORTANT**: Never commit `.env` to Git! It's already in `.gitignore`.

---

## 🚀 Initialize Firebase Services

The Firebase services are already initialized in `src/firebase/config.js`.

### Verify Installation

Create a test file to verify Firebase is working:

```jsx
// src/test/firebaseTest.js
import { isFirebaseConfigured } from '../firebase/config';

if (isFirebaseConfigured()) {
  console.log('✅ Firebase is properly configured!');
} else {
  console.error('❌ Firebase configuration is missing!');
}
```

---

## 🔒 Deploy Security Rules

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Project

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage
- ✅ (Optional) Hosting

When prompted:
- Use existing project → Select your project
- Firestore rules: Use `firestore.rules`
- Firestore indexes: Use default
- Storage rules: Use `storage.rules`

### Deploy Rules

```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules
```

Or deploy individually:

```bash
# Firestore rules only
firebase deploy --only firestore:rules

# Storage rules only
firebase deploy --only storage:rules
```

### Verify Rules

1. Go to **Firestore** → **Rules** in Firebase Console
2. Verify your rules are deployed (check timestamp)
3. Do the same for **Storage** → **Rules**

---

## 📊 Data Structure

### Firestore Collections

```
/users/{userId}
  - email: string
  - displayName: string
  - role: "student" | "admin"
  - totalXP: number
  - level: number
  - streak: number
  - settings: object
  - createdAt: timestamp
  - updatedAt: timestamp
  
  /examHistory/{examId}
    - examType: "mat" | "sat" | "full"
    - score: number
    - totalQuestions: number
    - percentage: number
    - timeSpent: number
    - timestamp: timestamp
  
  /practiceHistory/{practiceId}
    - Similar to examHistory

/subjects/{subjectId}
  - name: string
  - description: string
  - totalQuestions: number
  
  /questions/{questionId}
    - questionText: string
    - options: array[string]
    - correctAnswer: number (0-3)
    - difficulty: "easy" | "medium" | "hard"
    - tags: array[string]
    - imageURL: string (optional)
    - imagePath: string (optional)
    - explanation: string (optional)
    - marks: number
    - timeLimit: number
    - randomId: number (for random queries)
    - viewCount: number
    - correctCount: number
    - incorrectCount: number
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Storage Structure

```
/questions/{subjectId}/{questionId}/{filename}
  - Question images

/profiles/{userId}/{filename}
  - Profile pictures

/temp/{userId}/{filename}
  - Temporary uploads (auto-deleted)

/public/{allPaths}
  - Public assets
```

---

## 📤 Uploading Questions

### Method 1: Using CSV Template

1. **Download template**:
   ```javascript
   import { downloadSampleCSV } from './utils/dataUploader';
   downloadSampleCSV();
   ```

2. **Fill in questions** following this format:

   | subject | question | option_a | option_b | option_c | option_d | correct_answer | difficulty | tags | image_path |
   |---------|----------|----------|----------|----------|----------|----------------|------------|------|------------|
   | math | What is 2+2? | 2 | 3 | 4 | 5 | c | easy | arithmetic | |
   | science | H2O is? | Oxygen | Water | Hydrogen | Carbon | b | easy | chemistry | image1.jpg |

3. **Upload via Admin Panel** (implementation in next section)

### Method 2: Using Excel Template

1. **Download template**:
   ```javascript
   import { downloadSampleExcel } from './utils/dataUploader';
   downloadSampleExcel();
   ```

2. Fill in questions in Excel (same columns as CSV)

3. Upload via Admin Panel

### Method 3: Programmatic Upload

```javascript
import { uploadQuestionsFromFile } from './utils/dataUploader';

const handleFileUpload = async (file, imageFiles) => {
  const result = await uploadQuestionsFromFile(
    file,
    imageFiles,
    (progress) => {
      console.log(`Stage: ${progress.stage}, Progress: ${progress.progress}%`);
    }
  );
  
  if (result.success) {
    console.log(`✅ Uploaded ${result.totalUploaded} questions!`);
  } else {
    console.error('❌ Upload failed:', result.error);
  }
};
```

---

## 🔗 Integration Guide

### Step 1: Wrap App with AuthProvider

Update `src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Step 2: Update Login Component

Replace localStorage auth with Firebase:

```jsx
// src/jsx files/Login.jsx
import { useState } from 'react';
import { loginWithEmail, loginWithGoogle } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
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
    setError('');

    const result = await loginWithGoogle();

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    // Your JSX with email/password form
    // Add onClick handlers to buttons
  );
};
```

### Step 3: Update CreateAccount Component

```jsx
// src/jsx files/CreateAccount.jsx
import { registerWithEmail } from '../firebase/auth';

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
```

### Step 4: Protect Routes

Create a Protected Route component:

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default ProtectedRoute;
```

Update `App.jsx`:

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/home" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />

<Route path="/admin-home" element={
  <ProtectedRoute adminOnly>
    <AdminHome />
  </ProtectedRoute>
} />
```

### Step 5: Use Firebase Hooks in Components

```jsx
// Example: Practice.jsx
import { useQuestions } from '../hooks/useFirebase';

const Practice = () => {
  const { questions, loading, loadMore, hasMore } = useQuestions('math', 20);

  if (loading) return <Loader />;

  return (
    <div>
      {questions.map(q => (
        <QuestionCard key={q.id} question={q} />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
};
```

### Step 6: Save Exam Results to Firebase

```jsx
// Example: ExamResults.jsx
import { useExamHistory } from '../hooks/useFirebase';
import { useEffect } from 'react';

const ExamResults = () => {
  const { addExam } = useExamHistory();
  const examData = /* your exam results */;

  useEffect(() => {
    // Save to Firebase instead of localStorage
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

  return /* Your results UI */;
};
```

---

## ✅ Best Practices

### Performance Optimization

1. **Use Pagination**: Never load all questions at once
2. **Cache Queries**: Use React Query or SWR for caching
3. **Lazy Load Images**: Load images only when visible
4. **Batch Operations**: Use batch writes for multiple updates
5. **Indexes**: Create composite indexes for complex queries

### Security

1. **Never expose .env**: Keep in .gitignore
2. **Use Security Rules**: Don't rely on client-side validation
3. **Validate Input**: Sanitize user input before saving
4. **Rate Limiting**: Implement Cloud Functions for rate limiting
5. **Monitor Usage**: Set up billing alerts

### Cost Management

1. **Enable Offline Persistence**: Reduces repeated reads
2. **Use Get Instead of OnSnapshot**: When real-time isn't needed
3. **Cleanup Temp Files**: Delete old images regularly
4. **Compress Images**: Use the compressImage utility
5. **Monitor Reads/Writes**: Track in Firebase Console

### Database Design

1. **Denormalize When Needed**: Firebase works best with denormalized data
2. **Limit Subcollections**: Keep nesting to 2 levels max
3. **Use Consistent IDs**: Auto-generated IDs for most cases
4. **Add Timestamps**: Always include createdAt/updatedAt
5. **Plan for Scale**: Design for 10x current needs

---

## 🐛 Troubleshooting

### Firebase Not Initializing

**Error**: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solution**:
1. Check if `.env` file exists and has correct values
2. Restart development server after changing `.env`
3. Verify import paths are correct

### Authentication Errors

**Error**: "auth/invalid-api-key"

**Solution**:
- Double-check API key in `.env`
- Ensure API key restrictions in Firebase Console allow your domain

**Error**: "auth/popup-blocked"

**Solution**:
- Allow popups in browser settings
- Use redirect instead of popup for Google Sign-In

### Firestore Permission Denied

**Error**: "Missing or insufficient permissions"

**Solution**:
1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Check rules in Firebase Console
3. Verify user is authenticated
4. Check user role matches requirements

### Storage Upload Fails

**Error**: "storage/unauthorized"

**Solution**:
1. Deploy storage rules: `firebase deploy --only storage:rules`
2. Check file size (max 5MB for questions, 2MB for profiles)
3. Verify file type is image/jpeg, image/png, or image/webp

### Questions Not Loading

**Solution**:
1. Check browser console for errors
2. Verify questions exist in Firestore Console
3. Check network tab for failed requests
4. Ensure pagination is working correctly

---

## 📈 Monitoring & Analytics

### Firebase Console

1. **Authentication**: Monitor signups and active users
2. **Firestore**: Track read/write operations
3. **Storage**: Monitor storage usage
4. **Performance**: Analyze app performance
5. **Analytics**: User engagement metrics

### Set Up Alerts

1. Go to **Project Settings** → **Integrations**
2. Enable **Cloud Monitoring**
3. Set up budget alerts
4. Configure error reporting

---

## 🚢 Deployment Checklist

Before going to production:

- [ ] Environment variables set on hosting platform
- [ ] Security rules deployed and tested
- [ ] Firebase quota limits reviewed
- [ ] Billing alerts configured
- [ ] Backup strategy implemented
- [ ] Error logging set up
- [ ] Performance monitoring enabled
- [ ] User data export functionality tested
- [ ] GDPR compliance measures in place
- [ ] Terms of Service and Privacy Policy updated

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Firebase YouTube Channel](https://www.youtube.com/firebase)

---

## 🆘 Support

For issues or questions:
1. Check this documentation first
2. Review Firebase Console logs
3. Search Stack Overflow with `[firebase]` tag
4. Contact project maintainer

---

**Last Updated**: March 6, 2026
**Version**: 1.0.0
