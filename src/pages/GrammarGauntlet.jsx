import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// ... (GRAMMAR_VAULT remains the same as your provided list)
import { GRAMMAR_VAULT } from "../data/grammarVault";

export default function GrammarGauntlet() {
  const { user, profile } = useAuth();
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); // Track local success

  const activeIndex = GRAMMAR_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = GRAMMAR_VAULT[activeIndex];
  const nextLesson = GRAMMAR_VAULT[activeIndex + 1];

  // Reset local state when switching lessons
  useEffect(() => {
    setUserAnswer(null);
    setError(false);
    setIsCorrect(false);
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
        setIsCorrect(true); // Trigger success UI
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!selectedNode) {
    const completed = profile?.completedCategories || [];
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 font-sans selection:bg-indigo-500/30">
        <header className="text-center mb-12 pt-10">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              Polish <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Codex</span>
            </h1>
            <div className="mt-6 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">B1 Active Construction Mode</p>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {GRAMMAR_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full group flex items-center p-4 rounded-3xl border transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-indigo-500 shadow-xl'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-4 text-left flex-1">
                  <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{node.label}</h3>
                  <h2 className="text-base font-bold text-slate-200">{node.concept}</h2>
                </div>
                <div className="text-slate-700 font-black text-xl italic opacity-20 group-hover:opacity-100">0{i+1}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const alreadyCompleted = profile?.completedCategories?.includes(activeLesson.id);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-20">
      <AnimatePresence mode="wait">
        <motion.div key={selectedNode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedNode(null)} className="mb-6 text-[10px] font-black text-slate-500 hover:text-white uppercase flex items-center gap-2 transition-colors">
            <span>←</span> Back to Codex
          </button>

          <div className="bg-slate-900/90 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 relative">
              <div className="relative z-10">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Mastery Module</span>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter mt-2">{activeLesson.concept}</h1>
              </div>
              <div className="absolute top-1/2 right-10 -translate-y-1/2 text-8xl opacity-20 rotate-12">{activeLesson.icon}</div>
            </div>

            <div className="p-8 md:p-12 space-y-10">
              <section>
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">The Logic</h5>
                <p className="text-xl text-slate-200 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-6">
                  "{activeLesson.lesson}"
                </p>
              </section>

              <section className="grid gap-6">
                {activeLesson.sections.map((sec, idx) => (
                  <div key={idx} className="bg-[#020617] p-6 rounded-3xl border border-white/5">
                    <h6 className="text-white font-black text-sm uppercase mb-1">{sec.title}</h6>
                    <p className="text-slate-400 text-sm mb-4 leading-snug">{sec.content}</p>
                    <div className="bg-emerald-500/10 inline-flex items-center gap-3 px-4 py-2 rounded-xl text-emerald-400 font-bold text-sm">
                      {sec.ex}
                    </div>
                  </div>
                ))}
              </section>

              {/* B1 CONSTRUCTION ZONE */}
              <section className={`transition-all duration-500 border-2 rounded-[2.5rem] p-8 ${
                isCorrect || alreadyCompleted ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-indigo-500/5 border-dashed border-indigo-500/20'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                    <span className={`${isCorrect || alreadyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} text-[10px] font-black px-2 py-1 rounded transition-colors`}>
                        {isCorrect || alreadyCompleted ? 'PASSED' : 'ACTIVE TASK'}
                    </span>
                    <h4 className="text-sm font-bold uppercase tracking-tight">
                        {isCorrect || alreadyCompleted ? 'Accuracy Verified' : 'Prove yourself'}
                    </h4>
                </div>
                
                <p className="text-lg font-medium text-slate-200 mb-6">{activeLesson.challenge.q}</p>
                
                <div className="grid gap-3">
                    {activeLesson.challenge.options.map((option) => (
                        <button
                            key={option}
                            disabled={isCorrect || alreadyCompleted}
                            onClick={() => { setUserAnswer(option); setError(false); }}
                            className={`w-full p-4 rounded-2xl text-left font-bold transition-all border ${
                                userAnswer === option || (alreadyCompleted && option === activeLesson.challenge.correct)
                                ? (isCorrect || alreadyCompleted ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-indigo-600 border-indigo-400 text-white') 
                                : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-rose-500 text-xs font-black uppercase tracking-widest text-center">
                        ❌ That is incorrect. Try again.
                    </motion.p>
                )}
              </section>

              <div className="pt-6 flex flex-col gap-4">
                <button
                  disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                  onClick={() => handleMastery(activeLesson.id)}
                  className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all ${
                    alreadyCompleted || isCorrect
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' 
                    : !userAnswer 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  {loading ? "Verifying..." : (isCorrect || alreadyCompleted) ? "Mastery Unlocked" : "Verify & Unlock Mastery"}
                </button>

                {/* MOTIVATIONAL NEXT STEPS */}
                {(isCorrect || alreadyCompleted) && nextLesson && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-center"
                  >
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
                      Boom! Level Up Complete.
                    </p>
                    <button 
                      onClick={() => setSelectedNode(nextLesson.id)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
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