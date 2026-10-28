import { MotionConfig } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { firebaseConfigured } from './firebase';
import Navbar from './components/Navbar';
import AppBoundary from './components/AppBoundary';
import { activities } from './data/activities';
import { useLearningPersistence } from './hooks/useLearningStorage';
import { AccountSyncBanner } from './context/LearningProgressContext';
const ClozeLab = lazy(() => import('./pages/ClozeLab'));
const Home = lazy(() => import('./pages/Home'));
const DailyJourney = lazy(() => import('./pages/DailyJourney'));
const Explore = lazy(() => import('./pages/Explore'));
const WritingStudio = lazy(() => import('./pages/WritingStudio'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const EnrollmentGuard = lazy(() => import('./components/EnrollmentGuard'));
const LearningSpace = lazy(() => import('./pages/LearningSpace'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PracticeLab = lazy(() => import('./pages/PracticeLab'));
const GrammarGauntlet = lazy(() => import('./pages/GrammarGauntlet'));
const VocabularyVault = lazy(() => import('./pages/VocabularyVault'));
const PolishWarForge = lazy(() => import('./pages/PolishWarForge'));
const LirycznaSymfonia = lazy(() => import('./pages/LirycznaSymfonia'));
const ScenarioEngine = lazy(() => import('./pages/ScenarioEngine'));
const PolishReadingEngine = lazy(() => import('./pages/PolishReadingEngine'));
const PolishCaseCodex = lazy(() => import('./pages/PolishCaseCodex'));
const ReadingComprehension = lazy(() => import('./pages/ReadingComprehension'));
const KoniugacjaMaster = lazy(() => import('./pages/KoniugacjaMaster'));
const B1ShadowBoxer = lazy(() => import('./pages/B1ShadowBoxer'));
const PolishArena = lazy(() => import('./pages/PolishArena'));
const PolishWithMeme = lazy(() => import('./pages/PolishWithMeme'));
const PolishRoleplay = lazy(() => import('./pages/PolishRolePlay'));
function ProtectedRoute({
  children,
  admin = false
}) {
  const {
    user
  } = useAuth();
  if (!user) return <Navigate to="/guest" replace />;
  if (admin && user.email !== 'byadiso@gmail.com') return <Navigate to="/learn" replace />;
  return children;
}
function AppContent() {
  const {loadLocal, saveLocal} = useLearningPersistence();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
    const activity = activities.find(a => a.path.toLowerCase() === location.pathname.toLowerCase());
    document.title = activity ? `${activity.title} · LEBWPOLISH` : 'LEBWPOLISH · Learn by doing';
    if (activity) {
      const recent = loadLocal('lebw.recent', []);
      saveLocal('lebw.recent', [activity.path, ...(Array.isArray(recent) ? recent : []).filter(p => p !== activity.path)].slice(0, 5));
    }
    window.speechSynthesis?.cancel();
  }, [location.pathname, loadLocal, saveLocal]);
  return <div className="min-h-screen bg-[#fafafa]"><Navbar /><AccountSyncBanner />{!firebaseConfigured && <div className="app-guest-notice">Local practice is ready. Sign-in and community features need your Firebase settings in <code>.env</code>.</div>}<div id="app-content" tabIndex={-1}><AppBoundary key={location.pathname}><Suspense fallback={<div className="app-loading" role="status">Loading your next activity…</div>}><Routes>
 <Route path="/" element={<Home />} /><Route path="/cloze" element={<ClozeLab />} /><Route path="/learn" element={<DailyJourney />} /><Route path="/explore" element={<Explore />} /><Route path="/B1-writing" element={<WritingStudio />} />
 <Route path="/login" element={firebaseConfigured ? <Login /> : <Navigate to="/learn" replace />} /><Route path="/signup" element={firebaseConfigured ? <Signup /> : <Navigate to="/learn" replace />} /><Route path="/guest" element={<EnrollmentGuard />} />
 <Route path="/grammar" element={<GrammarGauntlet />} /><Route path="/shadow-protocol" element={<ScenarioEngine />} /><Route path="/vocabularyvault" element={<VocabularyVault />} /><Route path="/polish-simplified" element={<PolishWarForge />} /><Route path="/practice-polish-case" element={<PolishCaseCodex />} /><Route path="/reading-practice" element={<PolishReadingEngine />} /><Route path="/Reading-comprehension" element={<ReadingComprehension />} /><Route path="/conjugation-practice" element={<KoniugacjaMaster />} /><Route path="/B1-ready" element={<B1ShadowBoxer />} /><Route path="/play" element={<PolishArena />} /><Route path="/polish-music" element={<LirycznaSymfonia />} /><Route path="/practice" element={<PracticeLab />} /><Route path="/PolishMeme" element={<PolishWithMeme />} /><Route path="/PolishRolePlay" element={<PolishRoleplay />} />
 <Route path="/space" element={<ProtectedRoute><LearningSpace /></ProtectedRoute>} /><Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /><Route path="/admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/explore" replace />} />
 </Routes></Suspense></AppBoundary></div></div>;
}
export default function App() {
  return <MotionConfig reducedMotion="user"><BrowserRouter><AppContent /></BrowserRouter></MotionConfig>;
}
