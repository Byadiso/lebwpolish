import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { CASES_VAULT } from "../data/casesVault";

export default function PolishCaseCodex() {
  const { user, profile } = useAuth();
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const activeIndex = CASES_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = CASES_VAULT[activeIndex];
  const nextLesson = CASES_VAULT[activeIndex + 1];

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
          completedCases: arrayUnion(nodeId), // Changed to completedCases
          xp: increment(150), // Higher XP for Case Mastery
          grammarPoints: increment(25)
        });
        setIsCorrect(true);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!selectedNode) {
    const completed = profile?.completedCases || [];
    return (
      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-32 font-sans selection:bg-indigo-500/30">
        <header className="text-center mb-10 pt-6 md:pt-12">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Polish <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Cases</span>
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">B1 Mastery: Declension</p>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
          {CASES_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full group flex items-center p-5 rounded-2xl border transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-indigo-500 shadow-xl'
                }`}
              >
                <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-5 text-left flex-1 min-w-0">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{node.label}</h3>
                  <h2 className="text-base md:text-lg font-bold text-slate-100">{node.concept}</h2>
                </div>
                <div className="text-slate-700 font-black text-xl italic opacity-10 group-hover:opacity-40">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const alreadyCompleted = profile?.completedCases?.includes(activeLesson.id);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 pb-20">
      <AnimatePresence mode="wait">
        <motion.div key={selectedNode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedNode(null)} className="mb-6 text-[10px] font-black text-slate-500 hover:text-white uppercase flex items-center gap-2 transition-colors">
            <span>←</span> Back to Cases
          </button>

          <div className="bg-slate-900/90 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 md:p-12 relative">
              <div className="relative z-10">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">Grammar Core</span>
                <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mt-2 leading-tight">
                  {activeLesson.concept}
                </h1>
              </div>
              <div className="absolute top-1/2 right-6 -translate-y-1/2 text-7xl md:text-9xl opacity-20 rotate-12 select-none">
                {activeLesson.icon}
              </div>
            </div>

            <div className="p-6 md:p-12 space-y-10">
              <section>
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">The Case Logic</h5>
                <p className="text-xl md:text-2xl text-slate-100 font-serif leading-relaxed italic border-l-4 border-indigo-500 pl-6">
                  {activeLesson.lesson}
                </p>
              </section>

              <section className="grid gap-4">
                {activeLesson.sections.map((sec, idx) => (
                  <div key={idx} className="bg-[#020617] p-6 rounded-2xl border border-white/5">
                    <h6 className="text-indigo-300 font-black text-xs uppercase mb-2">{sec.title}</h6>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{sec.content}</p>
                    <div className="bg-emerald-500/10 inline-flex items-center gap-3 px-4 py-2 rounded-xl text-emerald-400 font-bold text-sm">
                       👉 {sec.ex}
                    </div>
                  </div>
                ))}
              </section>

              <section className={`transition-all duration-500 border-2 rounded-[2rem] p-6 md:p-10 ${
                isCorrect || alreadyCompleted ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-indigo-500/5 border-dashed border-indigo-500/20'
              }`}>
                <div className="flex items-center gap-3 mb-8">
                    <span className={`${isCorrect || alreadyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} text-[9px] font-black px-2 py-1 rounded text-white`}>
                        {isCorrect || alreadyCompleted ? 'VERIFIED' : 'PRACTICE'}
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Apply the rule</h4>
                </div>
                
                <p className="text-lg md:text-xl font-bold text-slate-100 mb-8">{activeLesson.challenge.q}</p>
                
                <div className="grid gap-3">
                    {activeLesson.challenge.options.map((option) => (
                        <button
                            key={option}
                            disabled={isCorrect || alreadyCompleted}
                            onClick={() => { setUserAnswer(option); setError(false); }}
                            className={`w-full p-5 rounded-2xl text-left font-black transition-all border text-sm md:text-base ${
                                userAnswer === option || (alreadyCompleted && option === activeLesson.challenge.correct)
                                ? (isCorrect || alreadyCompleted ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20') 
                                : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/20'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                        ❌ Case ending incorrect. Try again.
                    </motion.p>
                )}
              </section>

              <div className="pt-4 flex flex-col gap-4">
                <button
                  disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                  onClick={() => handleMastery(activeLesson.id)}
                  className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl ${
                    alreadyCompleted || isCorrect
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' 
                    : !userAnswer 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-indigo-500 hover:text-white active:scale-[0.97]'
                  }`}
                >
                  {loading ? "Analyzing..." : (isCorrect || alreadyCompleted) ? "Case Mastered" : "Check Declension"}
                </button>

                {(isCorrect || alreadyCompleted) && nextLesson && (
                  <motion.button 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => setSelectedNode(nextLesson.id)}
                    className="w-full py-4 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-indigo-500/30"
                  >
                    Next Case: {nextLesson.concept} →
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}