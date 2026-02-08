import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, updateDoc, increment, where, getDocs, arrayUnion } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const SKILL_NODES = [
  { id: 'Basics', label: 'Basics', requiredXP: 0, icon: '🌱' },
  { id: 'Tenses', label: 'Tenses', requiredXP: 100, icon: '⏳' },
  { id: 'Pronouns', label: 'Pronouns', requiredXP: 500, icon: '📜' },
  { id: 'Prepositions', label: 'Prepositions', requiredXP: 1000, icon: '⚔️' },
];

export default function GrammarGauntlet() {
  const { user, profile } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!selectedCategory) return;
    
    const q = query(
        collection(db, "grammar_lab"), 
        where("category", "==", selectedCategory)
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const sortedDocs = docs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

        setChallenges(sortedDocs);
        setIndex(0);
        setIsCorrect(null);
        setInput("");
      },
      (err) => console.error("Firestore Error:", err)
    );

    return () => unsubscribe();
  }, [selectedCategory]);

  const current = challenges[index];

  const handleCheck = async () => {
    if (!current) return;
    const isRight = input.toLowerCase().trim() === current.answer.toLowerCase().trim();
    setIsCorrect(isRight);

    if (isRight) {
      try {
        const q = query(collection(db, "pending_users"), where("email", "==", user.email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref;
          
          // Check if this was the last challenge in the set
          const isLastChallenge = index === challenges.length - 1;

          const updates = {
            xp: increment(current.xpReward || 50),
            grammarPoints: increment(1)
          };

          // If last challenge, add category to completed list
          if (isLastChallenge) {
            updates.completedCategories = arrayUnion(selectedCategory);
          }

          await updateDoc(userDocRef, updates);
        }
      } catch (e) {
        console.error("Profile update failed:", e);
      }
      
      setTimeout(() => {
        if (index === challenges.length - 1) {
          // Finished the category! Return to map
          setSelectedCategory(null);
        } else {
          setIndex(prev => prev + 1);
          setInput("");
          setIsCorrect(null);
        }
      }, 1500);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6 pb-32">
        <header className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Grammar <span className="text-indigo-500">Path</span></h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Unlock Linguistic Power</p>
        </header>

        <div className="flex flex-col items-center gap-6">
          {SKILL_NODES.map((node, i) => {
            const isCompleted = profile?.completedCategories?.includes(node.id);
            const isLocked = (profile?.xp || 0) < node.requiredXP;
            
            return (
              <div key={node.id} className="flex flex-col items-center w-full">
                {i !== 0 && (
                  <div className={`w-1 h-12 mb-2 rounded-full ${isLocked ? 'bg-slate-800' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`} />
                )}
                <motion.button
                  whileHover={!isLocked ? { scale: 1.05 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  disabled={isLocked}
                  onClick={() => setSelectedCategory(node.id)}
                  className={`relative group w-24 h-24 rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 border-2 ${
                    isCompleted 
                    ? 'bg-indigo-600/20 border-emerald-500 text-emerald-400' 
                    : isLocked 
                    ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-50' 
                    : 'bg-slate-900 border-indigo-500 text-white shadow-xl hover:border-white'
                  }`}
                >
                  <span className="text-3xl mb-1">{isCompleted ? '✅' : node.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">{node.label}</span>
                  
                  {isLocked && !isCompleted && (
                    <div className="absolute -bottom-2 bg-red-600 text-[8px] px-2 py-0.5 rounded-full font-black text-white">
                      {node.requiredXP} XP
                    </div>
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- CHALLENGE VIEW ---
  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 pb-32">
      <div className="max-w-2xl mx-auto pt-6">
        <button 
            onClick={() => setSelectedCategory(null)} 
            className="mb-6 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
            ← Retreat to Map
        </button>

        <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-indigo-500/20 text-xs">G</div>
            <h2 className="font-black tracking-widest text-[10px] uppercase">Rank: <span className="text-indigo-400">{profile?.grammarPoints || 0}</span></h2>
          </div>
          <div className="text-right flex flex-col">
             <span className="text-emerald-400 font-black tracking-tighter uppercase text-xs">{selectedCategory}</span>
             <span className="text-[8px] font-black text-slate-500 uppercase">Challenge {index + 1} of {challenges.length}</span>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={`review-${index}`}
            className="bg-slate-900 rounded-[2rem] p-8 border-l-4 border-indigo-500 shadow-xl"
          >
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Subject Intelligence</span>
            <h2 className="text-xl font-black mb-3 italic">Grammar Rule</h2>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">
              {current?.rule || "Study the context. Ensure your answer matches the required tense and gender for this module."}
            </p>
          </motion.div>

          <motion.div 
            key={`battle-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-slate-900 rounded-[2.5rem] p-8 border-b-8 shadow-2xl transition-all duration-500 ${
              isCorrect === true ? 'border-emerald-500 bg-emerald-950/20' : 
              isCorrect === false ? 'border-red-500 bg-red-950/20' : 'border-indigo-600'
            }`}
          >
            <p className="text-center text-slate-500 font-black uppercase tracking-widest text-[10px] mb-6">Battle Zone</p>
            
            <div className="bg-[#020617] p-6 rounded-2xl mb-8 border border-white/5">
              <p className="text-center font-black text-xl italic text-white leading-snug">"{current?.question}"</p>
            </div>

            <input 
              autoFocus 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type response..."
              className="w-full bg-transparent border-b-2 border-slate-700 p-4 text-center text-xl font-black outline-none focus:border-indigo-500 transition-colors uppercase"
            />

            <AnimatePresence>
              {isCorrect === false && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-center mt-6 p-4 bg-red-500/10 rounded-xl">
                  <p className="text-white font-bold text-sm">Correct Answer: {current?.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8">
              <button 
                onClick={handleCheck} 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
                  isCorrect === true ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-indigo-400 hover:text-white'
                }`}
              >
                {isCorrect === true ? 'Objective Secured ✓' : 'Submit Response ⚔️'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}