import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ChallengeCatalogue from './pages/ChallengeCatalogue';
import ChallengeDetails from './pages/ChallengeDetails';
import SubmissionPage from './pages/SubmissionPage';
import StudentDashboard from './pages/StudentDashboard';
import MyProgress from './pages/MyProgress';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ReviewSubmission from './pages/ReviewSubmission';
import ChallengeManagement from './pages/ChallengeManagement';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/challenges" element={<ChallengeCatalogue />} />
              <Route path="/challenges/:id" element={<ChallengeDetails />} />

              {/* Student Protected Routes */}
              <Route
                path="/challenges/:id/submit"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SubmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/progress"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyProgress />
                  </ProtectedRoute>
                }
              />

              {/* Reviewer Protected Routes */}
              <Route
                path="/reviewer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['reviewer']}>
                    <ReviewerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reviewer/submissions/:id"
                element={
                  <ProtectedRoute allowedRoles={['reviewer']}>
                    <ReviewSubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reviewer/challenges"
                element={
                  <ProtectedRoute allowedRoles={['reviewer']}>
                    <ChallengeManagement />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

