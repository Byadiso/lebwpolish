import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GRAMMAR_VAULT } from "../data/grammarVault";

export default function GrammarGauntlet({ onNavigateToCases }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const activeIndex = GRAMMAR_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = GRAMMAR_VAULT[activeIndex];
  const nextLesson = GRAMMAR_VAULT[activeIndex + 1];

  useEffect(() => {
    setUserAnswer(null);
    setError(false);
    setIsCorrect(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedNode]);

  const handleMastery = async (nodeId) => {
    if (userAnswer !== activeLesson.challenge.correct) {
      setError(true);
      setIsCorrect(false);
      return;
    }

    setLoading(true);
    setError(false);
    
    try {
      const q = query(collection(db, "pending_users"), where("email", "==", user.email.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          completedCategories: arrayUnion(nodeId),
          xp: increment(100),
          grammarPoints: increment(15)
        });
        setIsCorrect(true);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- MENU VIEW ---
  if (!selectedNode) {
    const completed = profile?.completedCategories || [];
    return (
      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-32 font-sans selection:bg-indigo-500/30">
        <header className="text-center mb-12 pt-6 md:pt-12">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              Polish <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Codex</span>
            </h1>
            <div className="mt-5 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">B1 Linguistic Engine Active</p>
            </div>
          </motion.div>
        </header>

        {/* TOP NAVIGATION CARDS */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* CASE MASTER CARD */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/practice-polish-case")}
            className="relative overflow-hidden group p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-800 border border-white/10 shadow-2xl flex items-center justify-between transition-all active:scale-[0.98]"
          >
            <div className="relative z-10 text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Module 01</span>
              <h2 className="text-xl font-black italic uppercase text-white">Grammar Cases</h2>
              <p className="text-[10px] text-indigo-100 mt-1 font-bold opacity-80 uppercase">Declension Trainer</p>
            </div>
            <div className="relative z-10 bg-white/10 p-3 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
              <span className="text-2xl">🇵🇱</span>
            </div>
            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine" />
          </motion.button>

          {/* NEW READING COMPREHENSION CARD */}
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/reading-comprehension")}
            className="relative overflow-hidden group p-6 rounded-3xl bg-[#0f172a] border border-indigo-500/30 shadow-2xl flex items-center justify-between transition-all active:scale-[0.98] hover:border-indigo-400"
          >
            <div className="relative z-10 text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Module 02</span>
              <h2 className="text-xl font-black italic uppercase text-white">Reading Codex</h2>
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Context & Vocabulary</p>
            </div>
            <div className="relative z-10 bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30 group-hover:-rotate-12 transition-transform">
              <span className="text-2xl">📖</span>
            </div>
          </motion.button>
        </div>

        {/* PROGRESS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {GRAMMAR_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full group flex items-center p-5 rounded-2xl border transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0f172a] border-white/5 hover:border-indigo-500/50 shadow-xl'
                }`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-4 text-left flex-1 min-w-0">
                  <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{node.label}</h3>
                  <h2 className="text-sm md:text-base font-bold text-slate-200 truncate group-hover:text-white transition-colors">{node.concept}</h2>
                </div>
                <div className="text-slate-700 font-black text-lg italic opacity-10 group-hover:opacity-30 ml-2">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- LESSON VIEW ---
  const alreadyCompleted = profile?.completedCategories?.includes(activeLesson.id);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 pb-20">
      <AnimatePresence mode="wait">
        <motion.div key={selectedNode} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedNode(null)} className="mb-8 text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase flex items-center gap-2 transition-colors tracking-[0.2em]">
            <span className="text-lg">←</span> Return to Codex
          </button>

          <div className="bg-[#0f172a] rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 md:p-12 relative">
              <div className="relative z-10">
                <span className="bg-black/20 text-white/80 text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">B1 Masterclass</span>
                <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mt-4 leading-tight">
                  {activeLesson.concept}
                </h1>
              </div>
              <div className="absolute top-1/2 right-4 md:right-10 -translate-y-1/2 text-7xl md:text-9xl opacity-10 rotate-12 select-none pointer-events-none">
                {activeLesson.icon}
              </div>
            </div>

            <div className="p-6 md:p-12 space-y-10">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-indigo-500/20" />
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">The Logic</h5>
                  <div className="h-px flex-1 bg-indigo-500/20" />
                </div>
                <p className="text-xl md:text-2xl text-slate-100 font-serif italic leading-relaxed text-center px-4">
                  "{activeLesson.lesson}"
                </p>
              </section>

              <section className="grid gap-4">
                {activeLesson.sections.map((sec, idx) => (
                  <div key={idx} className="bg-[#020617] p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-colors group">
                    <h6 className="text-indigo-400 font-black text-[10px] uppercase mb-2 tracking-widest">{sec.title}</h6>
                    <p className="text-slate-300 text-sm md:text-base mb-4 leading-relaxed font-medium">{sec.content}</p>
                    <div className="bg-emerald-500/10 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-emerald-400 font-black text-sm border border-emerald-500/20 shadow-inner">
                      <span className="opacity-50">EX:</span> {sec.ex}
                    </div>
                  </div>
                ))}
              </section>

              <section className={`transition-all duration-700 border-2 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 ${
                isCorrect || alreadyCompleted ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-indigo-500/5 border-dashed border-indigo-500/20'
              }`}>
                <div className="flex items-center justify-center gap-3 mb-8">
                    <span className={`${isCorrect || alreadyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} text-[9px] font-black px-3 py-1 rounded-full text-white tracking-widest`}>
                        {isCorrect || alreadyCompleted ? 'VERIFIED' : 'CHALLENGE'}
                    </span>
                </div>
                
                <p className="text-lg md:text-2xl font-bold text-slate-100 mb-8 text-center">{activeLesson.challenge.q}</p>
                
                <div className="grid gap-3">
                    {activeLesson.challenge.options.map((option) => (
                        <button
                            key={option}
                            disabled={isCorrect || alreadyCompleted}
                            onClick={() => { setUserAnswer(option); setError(false); }}
                            className={`w-full p-5 rounded-2xl text-center font-black uppercase tracking-widest transition-all border-2 text-xs md:text-sm ${
                                userAnswer === option || (alreadyCompleted && option === activeLesson.challenge.correct)
                                ? (isCorrect || alreadyCompleted ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-indigo-600 border-indigo-400 text-white') 
                                : 'bg-slate-900 border-white/5 text-slate-500 hover:border-slate-700'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {error && (
                    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] text-center italic">
                        ❌ Construction Error. Review the logic above.
                    </motion.p>
                )}
              </section>

              <div className="pt-4 space-y-4">
                <button
                  disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                  onClick={() => handleMastery(activeLesson.id)}
                  className={`w-full py-6 md:py-7 rounded-3xl font-black uppercase tracking-[0.3em] text-xs md:text-sm transition-all ${
                    alreadyCompleted || isCorrect
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 cursor-default' 
                    : !userAnswer 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-white text-black hover:bg-emerald-500 hover:text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? "Decrypting..." : (isCorrect || alreadyCompleted) ? "Construction Mastered" : "Verify Construction"}
                </button>

                {(isCorrect || alreadyCompleted) && nextLesson && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 text-center"
                  >
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">
                      Sequential Access Granted
                    </p>
                    <button 
                      onClick={() => setSelectedNode(nextLesson.id)}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-900/40"
                    >
                      Next: {nextLesson.concept} →
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}