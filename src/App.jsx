// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Core Identity Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EnrollmentGuard from './components/EnrollmentGuard';
import Navbar from './components/Navbar';

// Learning Modules (Labs)
import LearningSpace from './pages/LearningSpace';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import PracticeLab from './pages/PracticeLab';
import GrammarGauntlet from './pages/GrammarGauntlet';
import VocabularyVault from './pages/VocabularyVault';
import PolishWarForge from './pages/PolishWarForge';
import LirycznaSymfonia from './pages/LirycznaSymfonia';
import ScenarioEngine from './pages/ScenarioEngine';
import PolishReadingEngine from './pages/PolishReadingEngine';
import PolishCaseCodex from './pages/PolishCaseCodex';
import ReadingComprehension from './pages/ReadingComprehension';

// Secure Gatekeeper Helper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/guest" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#fafafa]">
          <Navbar />
          <Routes>
            {/* --- PUBLIC ACCESS ROUTES: THE OPEN LABS --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/guest" element={<EnrollmentGuard />} />
            
            {/* These paths are now open for immediate use. 
                They match the grid cards on the Home page.
            */}
            <Route path="/grammar" element={<GrammarGauntlet />} />
            <Route path="/shadow-protocol" element={<ScenarioEngine />} />
            <Route path="/vocabularyvault" element={<VocabularyVault />} />
            <Route path="/polish-simplified" element={<PolishWarForge />} />
            <Route path="/practice-polish-case" element={<PolishCaseCodex />} />
            <Route path="/reading-practice" element={<PolishReadingEngine />} />
            <Route path="/Reading-comprehension" element={<ReadingComprehension />} />

            {/* --- PROTECTED STUDENT ROUTES: PERSONAL PROGRESS --- */}
            {/* These routes require an active Fluency Profile (Login) */}
            <Route path="/space" element={
              <ProtectedRoute><LearningSpace /></ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            <Route path="/practice" element={
              <ProtectedRoute><PracticeLab /></ProtectedRoute>
            } />

            <Route path="/polish-music" element={
              <ProtectedRoute><LirycznaSymfonia /></ProtectedRoute>
            } />

            {/* --- ADMIN ONLY --- */}
            <Route path="/admin" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />

            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;