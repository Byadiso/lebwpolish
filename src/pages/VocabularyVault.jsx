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
          completedVocab: arrayUnion(nodeId), // Distinct from grammar
          xp: increment(150), // Vocabulary often gives more XP
          vocabPoints: increment(20)
        });
        setIsCorrect(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!selectedNode) {
    const completed = profile?.completedVocab || [];
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6 pb-32">
        <header className="text-center mb-16 pt-10">
          <motion.h1 className="text-6xl font-black italic tracking-tighter uppercase">
            B1 <span className="text-emerald-500">LEXICON</span>
          </motion.h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mt-4">Advanced Word Acquisition Lab</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {VOCAB_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedNode(node.id)}
                className={`flex items-center p-6 rounded-[2rem] border transition-all ${
                  isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-emerald-500 shadow-2xl'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isDone ? 'bg-emerald-500' : 'bg-slate-800 text-emerald-400'}`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-6 text-left">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{node.label}</h3>
                  <h2 className="text-xl font-bold text-white">{node.concept}</h2>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ... (Detail view follows the same logic as Grammar, but use emerald-500 accents for Vocab)
  return (
      <div className="min-h-screen bg-[#020617] text-white p-6 pb-20">
        <button onClick={() => setSelectedNode(null)} className="mb-8 text-[10px] font-black text-slate-500 flex items-center gap-2">← EXIT LAB</button>
        <div className="max-w-2xl mx-auto bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden">
             <div className="bg-emerald-600 p-10">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">{activeLesson.concept}</h1>
             </div>
             <div className="p-10 space-y-8">
                {activeLesson.sections.map((s, idx) => (
                    <div key={idx} className="bg-black/40 p-6 rounded-3xl border border-white/5">
                        <h4 className="text-emerald-400 font-black text-[10px] uppercase mb-2">{s.title}</h4>
                        <p className="text-slate-300 text-sm mb-3">{s.content}</p>
                        <p className="text-white font-bold italic">{s.ex}</p>
                    </div>
                ))}
                
                {/* Challenge Logic Same as Grammar but with emerald themes */}
                <div className="pt-10 border-t border-white/5">
                    <p className="text-lg font-bold mb-6">{activeLesson.challenge.q}</p>
                    <div className="grid gap-3">
                        {activeLesson.challenge.options.map(opt => (
                            <button 
                                key={opt}
                                onClick={() => {setUserAnswer(opt); setError(false);}}
                                className={`w-full p-4 rounded-2xl text-left border ${userAnswer === opt ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800 border-transparent'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => handleMastery(activeLesson.id)}
                        className="w-full mt-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                    >
                        {loading ? "Checking..." : isCorrect ? "Vocabulary Locked In" : "Master Words"}
                    </button>
                </div>
             </div>
        </div>
      </div>
  )
}