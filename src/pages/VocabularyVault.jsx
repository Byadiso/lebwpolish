import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { VOCAB_VAULT } from "../data/vocabVault";

export default function VocabLexicon() {
  const { user, profile } = useAuth();
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const activeIndex = VOCAB_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = VOCAB_VAULT[activeIndex];
  const nextLesson = VOCAB_VAULT[activeIndex + 1];

  useEffect(() => {
    setUserAnswer(null);
    setError(false);
    setIsCorrect(false);
    if (selectedNode) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedNode]);

  const handleMastery = async (nodeId) => {
    if (userAnswer !== activeLesson.challenge.correct) {
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, "pending_users"), where("email", "==", user.email.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          completedVocab: arrayUnion(nodeId),
          xp: increment(150),
          vocabPoints: increment(20)
        });
        setIsCorrect(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // --- GRID MENU VIEW ---
  if (!selectedNode) {
    const completed = profile?.completedVocab || [];
    return (
      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-32">
        <header className="text-center mb-12 pt-6 md:pt-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              B1 <span className="text-emerald-500">LEXICON</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-500 mt-4">
              Advanced Word Acquisition Lab
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
          {VOCAB_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedNode(node.id)}
                className={`flex items-center p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-emerald-500 shadow-xl'
                }`}
              >
                <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-emerald-400'}`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-4 md:ml-6 text-left min-w-0">
                  <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate">{node.label}</h3>
                  <h2 className="text-lg md:text-xl font-bold text-white truncate">{node.concept}</h2>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- DETAIL LAB VIEW ---
  const alreadyCompleted = profile?.completedVocab?.includes(activeLesson.id);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 pb-20">
      <motion.button 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={() => setSelectedNode(null)} 
        className="mb-6 text-[10px] font-black text-slate-500 flex items-center gap-2 hover:text-emerald-400 transition-colors"
      >
        ← EXIT LAB
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedNode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-8 md:p-10 relative">
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter relative z-10">
              {activeLesson.concept}
            </h1>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 text-7xl md:text-8xl opacity-20 rotate-12 select-none">
              {activeLesson.icon}
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-6 md:space-y-8">
            {/* Sections */}
            <div className="grid gap-4">
              {activeLesson.sections.map((s, idx) => (
                <div key={idx} className="bg-black/40 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5">
                  <h4 className="text-emerald-400 font-black text-[9px] md:text-[10px] uppercase mb-2 tracking-widest">{s.title}</h4>
                  <p className="text-slate-300 text-xs md:text-sm mb-3 leading-relaxed">{s.content}</p>
                  <p className="text-white font-bold italic text-sm md:text-base border-l-2 border-emerald-500/50 pl-3">{s.ex}</p>
                </div>
              ))}
            </div>
            
            {/* Challenge Zone */}
            <div className={`pt-8 border-t border-white/5 transition-colors duration-500 p-2 rounded-2xl ${isCorrect || alreadyCompleted ? 'bg-emerald-500/5' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-base md:text-lg font-bold text-slate-100">{activeLesson.challenge.q}</p>
              </div>

              <div className="grid gap-2.5">
                {activeLesson.challenge.options.map(opt => (
                  <button 
                    key={opt}
                    disabled={isCorrect || alreadyCompleted}
                    onClick={() => {setUserAnswer(opt); setError(false);}}
                    className={`w-full p-4 rounded-xl md:rounded-2xl text-left font-bold text-sm md:text-base transition-all border ${
                      userAnswer === opt || (alreadyCompleted && opt === activeLesson.challenge.correct)
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40' 
                        : 'bg-slate-800/50 border-transparent text-slate-400 hover:border-emerald-500/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-center text-rose-500 text-[10px] font-black uppercase mt-4 tracking-widest">
                  Selection Refused. Try Again.
                </p>
              )}

              {/* Action Button */}
              <button 
                disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                onClick={() => handleMastery(activeLesson.id)}
                className={`w-full mt-8 py-5 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all active:scale-[0.98] ${
                  alreadyCompleted || isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : !userAnswer 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-emerald-500 hover:text-white'
                }`}
              >
                {loading ? "Syncing..." : (isCorrect || alreadyCompleted) ? "Lexicon Updated" : "Lock In Word"}
              </button>

              {/* Continue Step */}
              {(isCorrect || alreadyCompleted) && nextLesson && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedNode(nextLesson.id)}
                  className="w-full mt-4 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-[10px] uppercase tracking-tighter transition-all"
                >
                  Advance to: {nextLesson.concept} →
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}