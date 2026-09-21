

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import LandingPage from "./jsx files/LandingPage";
import Pricing from "./jsx files/Pricing";
import Syllabus from "./jsx files/Syllabus";
import Login from "./jsx files/Login";
import CreateAccount from "./jsx files/CreateAccount";
import ChooseRole from "./jsx files/ChooseRole";
import StudentInfo from "./jsx files/StudentInfo";
import AdminInfo from "./jsx files/AdminInfo";
import GuardianVerification from "./jsx files/GuardianVerification";
import VerifyOTP from "./jsx files/VerifyOTP";
import Home from "./jsx files/Home";
import Quest from "./jsx files/Quest";

import './App.css';
import Loader from "./components/Loader";
import Profile from "./jsx files/Profile";
import Statistics from "./jsx files/Statistics";
import Settings from "./jsx files/Settings";
import Practice from "./jsx files/Practice";
import PracticePage from "./jsx files/PracticePage";
import PracticeLogs from "./jsx files/PracticeLogs";
import Learning from "./jsx files/Learning";
import AdminLogin from "./jsx files/AdminLogin";
import AdminHome from "./jsx files/AdminHome";
import AboutUs from "./components/Footer Pages/AboutUs";
import ContactUs from "./components/Footer Pages/ContactUs";
import PrivacyPolicy from "./components/Footer Pages/PrivacyPolicy";
import Terms from "./components/Footer Pages/Terms";
import Refund from "./components/Footer Pages/Refund";

import Exam from './jsx files/Exam';
import ExamTest from './jsx files/ExamTest';
import ExamResults from './jsx files/ExamResults';
import ExamHistory from './jsx files/ExamHistory';

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); // Loader duration
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route path="/student-info" element={<StudentInfo />} />
        <Route path="/admin-info" element={<AdminInfo />} />
        <Route path="/guardian-verification" element={<GuardianVerification />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quest" element={<Quest />} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice-quiz" element={<PracticePage />} />
        <Route path="/practice-logs" element={<PracticeLogs />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        
        <Route path="/terms-conditions" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<Refund />} />
        <Route path="/exams" element={<Exam />} />
        <Route path="/exam-test/:examType" element={<ExamTest />} />
        <Route path="/exam-results" element={<ExamResults />} />
        <Route path="/exam-history" element={<ExamHistory />} />
      </Routes>
    </>
  );
}


function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
