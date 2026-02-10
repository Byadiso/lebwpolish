// src/pages/Signup.jsx
import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const isAuthorizedEmail = email.toLowerCase() === "byadiso@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText("nganatech@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isAuthorizedEmail) return;
    setError("");
    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Credentials not found. Please contact the administrator for a Polish Learning Invitation.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocId = querySnapshot.docs[0].id;
      
      await updateDoc(doc(db, "users", userDocId), {
        uid: userCredential.user.uid,
        status: "active",
        activatedAt: new Date().toISOString()
      });

      navigate("/space");
    } catch (err) {
      setError(err.message.includes("auth/email-already-in-use") 
        ? "Fluent profile already active. Log in to continue your progress." 
        : "Connection failed. Please check your network to resume Polish training.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-[#fafafa] px-6 py-12 overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        
        {/* --- TOP ADMIN CONTACT --- */}
        <div className="w-full mb-12 text-center">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mb-3">
            Request Invitation for Polish Mastery
          </p>
          <button 
            onClick={copyEmail}
            className="group relative flex items-center gap-3 mx-auto px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-red-500 transition-all active:scale-95"
          >
            <span className="text-xs font-black text-slate-900 tracking-tight transition-colors group-hover:text-red-600">
              nganatech@gmail.com
            </span>
            <div className="h-4 w-[1px] bg-slate-100"></div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter group-hover:text-red-500">
              {copied ? 'Copied' : 'Copy'} <CopyIcon />
            </span>
          </button>
        </div>

        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            LEBW<span className="text-red-600 italic">POL</span>
          </h1>
          <div className="inline-block mt-3 px-4 py-1.5 bg-slate-900 rounded-full">
            <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Fluency Protocol</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] rounded-[3rem] p-8 md:p-12 relative overflow-hidden w-full">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-400"></div>

          <div className="mb-10 text-left">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
              Unlock Your <br />
              <span className="text-red-600 font-black italic">Polish Potential</span>
            </h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Account activation is reserved for invited learners. Enter your registered email to initialize your training data.
            </p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Student Email</label>
              <input 
                type="email" 
                placeholder="learner@lebwpol.com" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-red-500/5 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <AnimatePresence>
              {isAuthorizedEmail && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Set Security Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-red-500/5 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black rounded-xl">
                      ⚠️ {error}
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    {loading ? "Activating..." : "Begin Learning Journey"}
                    {!loading && <LockIcon />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Already a member? <Link to="/login" className="text-red-600 hover:text-red-700 font-black ml-1 underline underline-offset-4 decoration-red-200">Resume Your Learning</Link>
            </p>
          </div>
        </div>

        <p className="mt-16 text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">
          Powered by Nganatech  • 2026
        </p>
      </motion.div>
    </div>
  );
}