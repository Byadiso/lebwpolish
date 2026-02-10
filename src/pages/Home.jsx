import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Simple icons for the paths
const PathIcon = ({ type }) => {
  const icons = {
    grammar: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>,
    shadow: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
    vault: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="3" x2="7" y1="7" y2="7"/><line x1="17" x2="21" y1="17" y2="17"/></svg>,
    zap: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  };
  return icons[type];
};

export default function Home() {
  const { user, profile } = useAuth();
  const [showBriefing, setShowBriefing] = useState(false);

  const learningPaths = [
    { name: 'Grammar Labs', path: '/grammar', type: 'grammar', tag: 'Structure', color: 'hover:border-blue-500' },
    { name: 'Shadow Protocol', path: '/shadow-protocol', type: 'shadow', tag: 'Audio', color: 'hover:border-red-500' },
    { name: 'Vocabulary Vault', path: '/vocabularyvault', type: 'vault', tag: 'Memory', color: 'hover:border-slate-900' },
    { name: 'Simplified Polish', path: '/polish-simplified', type: 'zap', tag: 'Speed', color: 'hover:border-amber-500' }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-[#fafafa] selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      
      {/* Navigation Overlay */}
      {user && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 z-50 bg-white/60 backdrop-blur-xl shadow-sm border border-slate-200/50 px-6 py-3 rounded-full text-[10px] md:text-xs font-black text-slate-900 flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="tracking-widest uppercase">STREAK: {profile?.streak || 0}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <div className="tracking-widest uppercase text-slate-500 font-bold">LVL: {profile?.level || '1'}</div>
        </motion.div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center pt-28 md:pt-40 pb-12 px-6 text-center max-w-6xl w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[9px] md:text-[10px] font-black tracking-[0.3em] text-red-600 uppercase">
              Writing • Listening • Mastery
          </span>
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-5xl sm:text-8xl md:text-[10rem] font-black text-slate-900 mb-6 tracking-tighter leading-[0.85]"
        >
          LEBW<span className="text-red-600">POL</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-base md:text-2xl text-slate-500 max-w-3xl mb-12 leading-relaxed font-medium px-4"
        >
          {user ? (
            <span>Welcome back, <span className="text-slate-900 font-bold italic">{profile?.cityName || "Operator"}</span>. Your <span className="text-red-600 font-black">Immersion Protocol</span> is live.</span>
          ) : (
            <span>Stop memorizing tables. Start <span className="text-slate-900 font-bold underline decoration-red-500 decoration-4 underline-offset-8">producing language</span>. Master Polish through active writing and native audio.</span>
          )}
        </motion.p>

        {/* Learning Paths Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {learningPaths.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`group bg-white border border-slate-200 p-6 rounded-[2rem] text-left transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 ${item.color}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 transition-colors">
                  <PathIcon type={item.type} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-slate-100 rounded-md text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">{item.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Enter Module →</p>
            </Link>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6"
        >
          <Link
            to="/space"
            className="group relative bg-slate-900 text-white px-10 md:px-16 py-5 md:py-6 rounded-2xl font-black text-sm md:text-base shadow-2xl hover:bg-red-600 transition-all duration-500 flex items-center justify-center gap-4 active:scale-95"
          >
            {user ? "RESUME TRAINING" : "ENTER PRACTICE SPACE"}
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>

          {!user && (
            <button
              onClick={() => setShowBriefing(true)}
              className="bg-white border-2 border-slate-200 text-slate-900 px-10 md:px-16 py-5 md:py-6 rounded-2xl font-black text-sm md:text-base hover:border-red-600 hover:text-red-600 transition-all"
            >
              HOW IT WORKS
            </button>
          )}
        </motion.div>
      </main>

      {/* --- NEW SECTION: WHAT GUESTS ARE MISSING --- */}
      {!user && (
        <section className="relative z-10 w-full max-w-6xl px-6 py-24">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
            {/* Subtle red glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Member-Only Access</span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                  Unlock the <br />Full <span className="text-red-500 italic">Experience</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 font-medium">
                  Open Labs are just the beginning. Authorized students gain access to the <span className="text-white font-bold">Liryczna Symfonia</span> where we break down Polish music, plus daily writing feedback to build true <span className="text-white font-bold">Memory Muscle</span>.
                </p>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-4 bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95"
                >
                  Claim Your Account <span className="text-lg">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> Liryczna Symfonia
                  </h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Master grammar and slang through the lens of Polish hits. Listening is no longer a chore.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> Muscle Memory Forge
                  </h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Don't just memorize—use. Daily writing challenges force your brain to recall and produce.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Value Bar */}
      <div className="w-full bg-white border-y border-slate-100 py-10 mt-12 mb-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between gap-8">
              {['Free Practice Space', 'Real-Time Progress', 'Native Audio Immersion'].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-[8px] font-bold">✓</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{text}</span>
                </div>
              ))}
          </div>
      </div>

      {/* Feature Pillars */}
      <section className="w-full max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { id: '01', title: 'Daily Writing', desc: 'Convert thoughts into Polish sentences through output-based practice.' },
            { id: '02', title: 'Shadowing', desc: 'Master the rhythm. Every lesson includes native audio to sharpen your ears.' },
            { id: '03', title: 'Contextual Grammar', desc: 'Internalize grammar naturally. No charts, just pure production.' },
            { id: '04', title: 'XP Tracking', desc: 'Watch your vocabulary grow as you level up and maintain your streak.' }
          ].map((f) => (
            <div key={f.id} className="flex flex-col items-start group">
              <div className="w-12 h-12 mb-6 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                {f.id}
              </div>
              <h3 className="font-black text-[11px] uppercase tracking-widest mb-3 text-slate-900">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed text-left font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 flex flex-col items-center gap-4 w-full bg-slate-50/50">
        <p className="text-[9px] uppercase tracking-[0.5em] font-black text-slate-400">
          Engineered by <a href="https://www.nganatech.com" className="text-slate-900 hover:text-red-600 transition-colors">Nganatech</a> • 2026
        </p>
      </footer>

      {/* Mission Briefing Modal */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
              <button onClick={() => setShowBriefing(false)} className="absolute top-8 right-8 text-[10px] font-black tracking-widest text-slate-400 hover:text-red-600 transition-colors">CLOSE [X]</button>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Polish Mastery Protocol</h2>
              <div className="space-y-6 mb-10">
                <div className="flex gap-4 text-left">
                  <span className="text-red-600 font-black text-xl italic">01.</span>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Active Production</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">The brain learns best when it has to create. Every lesson requires active output.</p>
                  </div>
                </div>
                <div className="flex gap-4 text-left">
                  <span className="text-red-600 font-black text-xl italic">02.</span>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Audio Synchronization</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Bridge the gap between reading a word and hearing it in real conversations.</p>
                  </div>
                </div>
              </div>
              <Link to="/signup" onClick={() => setShowBriefing(false)} className="block w-full bg-slate-900 text-white text-center py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all">
                Create Fluency Profile
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}