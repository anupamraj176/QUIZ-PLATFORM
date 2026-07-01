import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CandidateLogin from './pages/CandidateLogin';
import CandidateProfile from './pages/CandidateProfile';
import Instructions from './pages/Instructions';
import QuizPortal from './pages/QuizPortal';
import SubmitConfirmation from './pages/SubmitConfirmation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ParticipantsList from './pages/ParticipantsList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CandidateLogin />} />
        <Route path="/data" element={<CandidateProfile />} />
        <Route path="/instruction" element={<Instructions />} />
        <Route path="/quiz" element={<QuizPortal />} />
        <Route path="/submitform" element={<SubmitConfirmation />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/addquiz" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/participants" element={<ParticipantsList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Router>
  );
}

export default App;
