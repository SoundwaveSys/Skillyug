# Questions Integration Guide

## Overview
Your questions are now integrated from Firestore database! The questions stored in the `question` collection will automatically be fetched for tests and quizzes.

## Question Format in Firestore

Each question document in the `question` collection should have:

```javascript
{
  ans: 4,                                    // (number) Correct answer option (1-4)
  chapter: "1861 चा राष्ट्रीय उठाव",         // (string) Chapter name
  chapterid: 4,                              // (number) Chapter ID
  opt1: "आर्थिक",                            // (string) Option 1
  opt2: "सामाजिक",                           // (string) Option 2
  opt3: "राजकीय",                            // (string) Option 3
  opt4: "तात्काळ",                           // (string) Option 4
  qno: 5,                                    // (number) Question number
  question: "'ब्रिटीशांनी हिंदी...'",        // (string) Question text
  subject: "इतिहास"                          // (string) Subject name
}
```

## Key Changes Made

### 1. Firestore Functions Added (`src/firebase/firestore.js`)

✅ **`fetchQuestionsBySubject(subject, limitCount)`**
   - Fetches questions for a specific subject
   - Example: `fetchQuestionsBySubject("इतिहास", 50)`

✅ **`fetchQuestionsByChapter(subject, chapter, limitCount)`**
   - Fetches questions from a specific chapter
   - Example: `fetchQuestionsByChapter("इतिहास", "1861 चा राष्ट्रीय उठाव", 20)`

✅ **`fetchRandomQuestionsFlat(subject, count)`**
   - Fetches random questions (optionally by subject)
   - Example: `fetchRandomQuestionsFlat("गणित", 25)` or `fetchRandomQuestionsFlat(null, 100)` for all subjects

✅ **`fetchQuestionsForExam(subjectConfig)`**
   - Fetches mixed questions from multiple subjects
   - Perfect for exams like NMMS that have multiple subjects
   - Example:
     ```javascript
     fetchQuestionsForExam([
       { subject: 'इतिहास', count: 20 },
       { subject: 'भूगोल', count: 20 },
       { subject: 'गणित', count: 30 }
     ])
     ```

✅ **`getAllSubjects()`**
   - Gets all unique subjects from your question database
   - Useful for building subject selection UI

✅ **`getChaptersBySubject(subject)`**
   - Gets all chapters for a specific subject
   - Returns array of `{name, id}` objects sorted by chapter ID

### 2. ExamTest.jsx Updated

**Before:** Generated fake questions
**Now:** Fetches real questions from Firestore based on exam type

- **MAT Exam:** Fetches 90 random questions
- **SAT Exam:** Fetches 90 questions from multiple subjects
- **Full NMMS Exam:** Fetches 180 questions

**Loading States:**
- Shows loading spinner while fetching questions
- Shows error message if no questions found or connection fails

### 3. PracticePage.jsx Updated

**Before:** Used hardcoded sample questions
**Now:** Fetches real questions from Firestore

- Fetches questions based on quiz configuration
- If subject specified in quizData, fetches only that subject
- Otherwise fetches random questions from all subjects

## How to Configure Subject Names for Exams

### Edit ExamTest.jsx (Lines 29-50)

Currently configured for SAT exam:

```javascript
else if (examType === 'sat') {
  result = await fetchQuestionsForExam([
    { subject: 'गणित', count: 22 },
    { subject: 'विज्ञान', count: 27 },
    { subject: 'इतिहास', count: 14 },
    { subject: 'भूगोल', count: 14 },
    { subject: 'नागरिकशास्त्र', count: 13 }
  ]);
}
```

**⚠️ Important:** Update the subject names to match what's in your Firestore database!

## Checking Your Database

To find out what subjects are in your database, you can:

1. **Use Firestore Console:**
   - Go to Firebase Console → Firestore Database
   - Open the `question` collection
   - Check the `subject` field in your documents

2. **Use the getAllSubjects() function:**
   ```javascript
   import { getAllSubjects } from '../firebase/firestore';
   
   const { subjects } = await getAllSubjects();
   console.log('Available subjects:', subjects);
   ```

## Common Subject Names (Examples)

Based on your sample question, you might have:
- `इतिहास` (History)
- `भूगोल` (Geography)
- `नागरिकशास्त्र` (Civics)
- `गणित` (Mathematics)
- `विज्ञान` (Science)
- `अर्थशास्त्र` (Economics)

## Testing the Integration

### Step 1: Upload Questions
Make sure you have questions uploaded to Firestore in the `question` collection.

### Step 2: Verify Subject Names
Check that the subject names in your code match exactly with those in Firestore (case-sensitive!).

### Step 3: Test Exam Flow
1. Navigate to exam selection page
2. Choose MAT, SAT, or Full exam
3. Questions should load from database
4. If no questions appear, check browser console for errors

### Step 4: Test Practice Flow
1. Navigate to practice page
2. Select a quiz
3. Questions should load based on quiz configuration

## Error Handling

The system now handles:
- ✅ No internet connection
- ✅ Empty question collection
- ✅ Database read errors
- ✅ Missing subject data

Users will see friendly error messages with options to:
- Return to main page
- Try again

## Performance Considerations

**Question Fetching:**
- Questions are fetched once when exam/quiz loads
- Random shuffling happens client-side for efficiency
- No repeated database reads during test

**Firestore Reads:**
- One read per question fetched
- For 90-question exam = 90 reads
- For practice quiz (25 questions) = 25 reads

**Optimization Tips:**
- Consider implementing question caching in localStorage
- Batch question fetches where possible
- Monitor Firestore usage in console

## Next Steps (Optional Enhancements)

1. **Add Question Caching:**
   - Store fetched questions in localStorage
   - Reduce repeated database reads
   - Update cache periodically

2. **Add Subject/Chapter Filters:**
   - Let users choose specific subjects
   - Let users practice specific chapters
   - Build dynamic UI based on `getAllSubjects()` and `getChaptersBySubject()`

3. **Add Difficulty Levels:**
   - Add difficulty field to questions
   - Filter by difficulty in practice mode
   - Progressive difficulty in tests

4. **Track Question Statistics:**
   - Use `updateQuestionStats()` function
   - Track which questions are answered correctly
   - Show weak areas to students

## Troubleshooting

### Questions Not Loading?

**Check:**
1. ✅ Firestore rules allow read access to `question` collection
2. ✅ Subject names in code match exactly with database
3. ✅ Questions exist in Firestore
4. ✅ Browser console for error messages
5. ✅ Network tab shows successful Firestore requests

### Wrong Questions Appearing?

**Check:**
1. ✅ Subject filter is correctly specified
2. ✅ Question count matches available questions
3. ✅ Chapter names are spelled correctly

### Firestore Rules

Make sure your Firestore rules allow reading questions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /question/{questionId} {
      allow read: if request.auth != null; // Authenticated users can read
    }
  }
}
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firestore connection
3. Test with `getAllSubjects()` to see available data
4. Check that question documents have all required fields

---

**Status:** ✅ Fully Integrated
**Last Updated:** March 6, 2026
