// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import your pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LearningSpace from './pages/LearningSpace';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import PracticeLab from './pages/PracticeLab';
import GrammarGauntlet from './pages/GrammarGauntlet';
import VocabularyVault from './pages/VocabularyVault';
import PolishWarForge from './pages/PolishWarForge';
import LirycznaSymfonia from './pages/LirycznaSymfonia';

// A helper to protect pages from non-logged-in users
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Student Routes */}
            <Route path="/space" element={
              <ProtectedRoute><LearningSpace /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />


            
            <Route path="/practice" element={
              <ProtectedRoute><PracticeLab /></ProtectedRoute>
            } />

            <Route path="/grammar" element={
              <ProtectedRoute><GrammarGauntlet /></ProtectedRoute>
            } />

            <Route path="/vocabularyvault" element={
              <ProtectedRoute><VocabularyVault /></ProtectedRoute>
            } />

             <Route path="/polish-simplified" element={
              <ProtectedRoute><PolishWarForge /></ProtectedRoute>
            } />

             <Route path="/polish-music" element={
              <ProtectedRoute><LirycznaSymfonia /></ProtectedRoute>
            } />

            {/* Admin Only Route */}
            <Route path="/admin" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;