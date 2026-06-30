import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        <Route path="/participants" element={<ParticipantsList />} />
      </Routes>
    </Router>
  );
}

export default App;
