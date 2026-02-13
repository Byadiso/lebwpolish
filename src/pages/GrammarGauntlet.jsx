import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Added for routing
import { GRAMMAR_VAULT } from "../data/grammarVault";

export default function GrammarGauntlet({ onNavigateToCases }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate(); // Initialize navigation
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
        <header className="text-center mb-10 pt-6 md:pt-12">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Polish <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Codex</span>
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">B1 Active Construction</p>
            </div>
          </motion.div>
        </header>

        {/* CLICKABLE PREMIUM BLOCK: DIRECTS TO /PRACTICE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <button 
            type="button"
            onClick={() => navigate("/practice-polish-case")} // Updated to navigate to /practice
            className="w-full relative overflow-hidden group p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 border border-white/20 shadow-2xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="relative z-10 text-left pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Specialized Mastery</span>
              <h2 className="text-xl md:text-2xl font-black italic uppercase text-white">The 7 Polish Cases</h2>
              <p className="text-xs text-indigo-100 mt-1 font-medium">Master declension: Nominative to Vocative</p>
            </div>
            
            <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform pointer-events-none">
              <span className="text-2xl">🇵🇱</span>
            </div>

            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine pointer-events-none" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
          {GRAMMAR_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full group flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-indigo-500 shadow-xl'
                }`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-4 text-left flex-1 min-w-0">
                  <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5 truncate">{node.label}</h3>
                  <h2 className="text-sm md:text-base font-bold text-slate-200 truncate">{node.concept}</h2>
                </div>
                <div className="text-slate-700 font-black text-lg italic opacity-10 group-hover:opacity-40 ml-2">
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
        <motion.div key={selectedNode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedNode(null)} className="mb-6 text-[10px] font-black text-slate-500 hover:text-white uppercase flex items-center gap-2 transition-colors">
            <span>←</span> Back to Codex
          </button>

          <div className="bg-slate-900/90 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 md:p-10 relative">
              <div className="relative z-10">
                <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em]">Mastery Module</span>
                <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mt-2 leading-tight">
                  {activeLesson.concept}
                </h1>
              </div>
              <div className="absolute top-1/2 right-4 md:right-10 -translate-y-1/2 text-6xl md:text-8xl opacity-20 rotate-12 select-none">
                {activeLesson.icon}
              </div>
            </div>

            <div className="p-6 md:p-12 space-y-8 md:space-y-10">
              <section>
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">The Logic</h5>
                <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-4 md:pl-6">
                  "{activeLesson.lesson}"
                </p>
              </section>

              <section className="grid gap-4 md:gap-6">
                {activeLesson.sections.map((sec, idx) => (
                  <div key={idx} className="bg-[#020617] p-5 md:p-6 rounded-2xl border border-white/5">
                    <h6 className="text-white font-black text-[11px] md:text-sm uppercase mb-1">{sec.title}</h6>
                    <p className="text-slate-400 text-xs md:text-sm mb-4 leading-snug">{sec.content}</p>
                    <div className="bg-emerald-500/10 inline-flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-emerald-400 font-bold text-xs md:text-sm">
                      {sec.ex}
                    </div>
                  </div>
                ))}
              </section>

              <section className={`transition-all duration-500 border-2 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 ${
                isCorrect || alreadyCompleted ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-indigo-500/5 border-dashed border-indigo-500/20'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                    <span className={`${isCorrect || alreadyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} text-[9px] font-black px-2 py-1 rounded text-white`}>
                        {isCorrect || alreadyCompleted ? 'PASSED' : 'TASK'}
                    </span>
                    <h4 className="text-xs md:text-sm font-bold uppercase tracking-tight text-slate-300">
                        {isCorrect || alreadyCompleted ? 'Accuracy Verified' : 'Complete the construction'}
                    </h4>
                </div>
                
                <p className="text-base md:text-lg font-medium text-slate-100 mb-6">{activeLesson.challenge.q}</p>
                
                <div className="grid gap-2.5">
                    {activeLesson.challenge.options.map((option) => (
                        <button
                            key={option}
                            disabled={isCorrect || alreadyCompleted}
                            onClick={() => { setUserAnswer(option); setError(false); }}
                            className={`w-full p-4 rounded-xl md:rounded-2xl text-left font-bold transition-all border text-sm md:text-base ${
                                userAnswer === option || (alreadyCompleted && option === activeLesson.challenge.correct)
                                ? (isCorrect || alreadyCompleted ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/20' : 'bg-indigo-600 border-indigo-400 text-white') 
                                : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                        ❌ Try a different construction.
                    </motion.p>
                )}
              </section>

              <div className="pt-4 flex flex-col gap-4">
                <button
                  disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                  onClick={() => handleMastery(activeLesson.id)}
                  className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all shadow-xl ${
                    alreadyCompleted || isCorrect
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' 
                    : !userAnswer 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-emerald-500 hover:text-white active:scale-[0.98]'
                  }`}
                >
                  {loading ? "Verifying..." : (isCorrect || alreadyCompleted) ? "Mastery Unlocked" : "Verify Construction"}
                </button>

                {(isCorrect || alreadyCompleted) && nextLesson && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-5 md:p-6 bg-indigo-500/10 rounded-2xl md:rounded-3xl border border-indigo-500/20 text-center"
                  >
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                      Concept Mastered. Continue?
                    </p>
                    <button 
                      onClick={() => setSelectedNode(nextLesson.id)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95"
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