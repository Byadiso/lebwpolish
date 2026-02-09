import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORGE_DATA } from "../data/ForgeData"; 
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext"; 
import { query, collection, where, getDocs, updateDoc, increment, arrayUnion } from "firebase/firestore";

export default function PolishWarForge() {
  const { user, profile } = useAuth(); 
  const [selectedId, setSelectedId] = useState(null);
  const [wordBank, setWordBank] = useState([]);
  const [constructedSentence, setConstructedSentence] = useState([]);
  const [stamina, setStamina] = useState(3);
  const [isForged, setIsForged] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  const [streak, setStreak] = useState(0);

  const activeIndex = FORGE_DATA.findIndex(n => n.id === selectedId);
  const activeLesson = FORGE_DATA[activeIndex];
  const nextLesson = FORGE_DATA[activeIndex + 1];

  const completedCount = profile?.completedCategories?.length || 0;
  const totalLessons = FORGE_DATA.length;
  const progressPercent = (completedCount / totalLessons) * 100;

  useEffect(() => {
    if (activeLesson) {
      const allWords = [...activeLesson.correctSequence, ...activeLesson.distractors];
      setWordBank(allWords.sort(() => Math.random() - 0.5));
      setConstructedSentence([]);
      setIsForged(false);
      setStamina(3);
      window.scrollTo(0, 0);
    }
  }, [selectedId]);

  const toggleWord = (word, index) => {
    if (isForged || stamina === 0) return;
    setConstructedSentence([...constructedSentence, { word, originalIdx: index }]);
    setWordBank(wordBank.filter((_, i) => i !== index));
  };

  const removeWord = (item, index) => {
    if (isForged) return;
    setConstructedSentence(constructedSentence.filter((_, i) => i !== index));
    setWordBank([...wordBank, item.word]);
  };

  const verifyForge = async () => {
    const finalStr = constructedSentence.map(s => s.word).join(" ");
    const correctStr = activeLesson.correctSequence.join(" ");

    if (finalStr === correctStr) {
      setIsForged(true);
      setShowXpGain(true);
      setStreak(prev => prev + 1);
      
      try {
        const q = query(collection(db, "pending_users"), where("email", "==", user.email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, {
            xp: increment(activeLesson.xp + (streak * 10)), // Streak Bonus
            grammarPoints: increment(20),
            completedCategories: arrayUnion(activeLesson.id)
          });
        }
      } catch (e) { console.error("Sync Failed", e); }
      
      setTimeout(() => setShowXpGain(false), 2000);
    } else {
      setStamina(s => {
        const newStamina = Math.max(0, s - 1);
        if (newStamina === 0) setStreak(0);
        return newStamina;
      });
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  // --- VIEW: THE CODEX ---
  if (!selectedId) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-24 selection:bg-indigo-500">
        <header className="text-center mb-8 pt-4">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-indigo-500"
          >
            War <span className="text-white">Forge</span>
          </motion.h1>
          
          <div className="mt-6 max-w-sm mx-auto bg-slate-900 h-3 rounded-full overflow-hidden border border-white/10 p-[2px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 rounded-full"
            />
          </div>
          <p className="text-[10px] mt-3 text-slate-500 uppercase font-black tracking-[0.2em]">
            System Mastery: {Math.round(progressPercent)}%
          </p>
        </header>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {FORGE_DATA.map((item, i) => {
            const isDone = profile?.completedCategories?.includes(item.id);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedId(item.id)}
                className={`group relative flex flex-col p-5 rounded-3xl border transition-all active:scale-[0.97] ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-2xl ${isDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>{item.icon}</div>
                  {isDone && <div className="bg-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full text-white">MASTERED</div>}
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{item.tier}</p>
                  <h3 className="font-bold text-sm md:text-base leading-tight">{item.concept}</h3>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VIEW: THE GAME LOOP ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans p-4 md:p-8 relative flex flex-col items-center">
      <AnimatePresence>
        {showXpGain && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: -150, opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-1/2 pointer-events-none z-50 text-emerald-400 font-black text-4xl italic"
          >
            +{activeLesson.xp} XP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl flex justify-between items-center mb-10">
        <button onClick={() => setSelectedId(null)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-full border border-white/5">
          ← Exit
        </button>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <motion.span 
                key={i} 
                animate={stamina <= i ? { scale: [1, 1.2, 1], opacity: 0.3 } : {}}
                className={`text-xl ${i < stamina ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "text-slate-800"}`}
              >
                ❤️
              </motion.span>
            ))}
          </div>
          {streak > 1 && <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Streak: {streak}x 🔥</span>}
        </div>
      </div>

      <main className="w-full max-w-xl flex-1 flex flex-col">
        <section className="text-center mb-8 space-y-3">
          <motion.span layoutId={`tier-${selectedId}`} className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
            {activeLesson.concept}
          </motion.span>
          <h2 className="text-2xl md:text-3xl font-black italic leading-tight px-4">"{activeLesson.task}"</h2>
        </section>

        {/* Construction Zone */}
        <motion.div 
          animate={errorShake ? { x: [-8, 8, -8, 8, 0], backgroundColor: ["#1e1b4b", "#450a0a", "#0f172a"] } : {}}
          className={`min-h-[140px] w-full p-6 rounded-[2.5rem] border-2 flex flex-wrap gap-2 justify-center items-center transition-all duration-500 ${
            isForged ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)]" : "bg-slate-900/40 border-dashed border-slate-800"
          }`}
        >
          {constructedSentence.map((item, i) => (
            <motion.button
              layoutId={`word-${item.word}-${item.originalIdx}`}
              key={i}
              onClick={() => removeWord(item, i)}
              className="px-5 py-2.5 bg-indigo-600 rounded-2xl font-bold shadow-[0_5px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none text-sm md:text-base transition-transform"
            >
              {item.word}
            </motion.button>
          ))}
          {constructedSentence.length === 0 && !isForged && (
            <span className="text-slate-700 text-[10px] uppercase font-black tracking-widest animate-pulse">Select runes to forge</span>
          )}
        </motion.div>

        {/* Word Bank */}
        <div className="mt-10 mb-24">
          {!isForged && stamina > 0 && (
            <div className="flex flex-wrap gap-2.5 justify-center">
              {wordBank.map((word, i) => (
                <motion.button
                  layoutId={`word-${word}-${i}`}
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWord(word, i)}
                  className="px-5 py-3 bg-slate-900 border border-white/10 rounded-2xl text-sm font-medium hover:border-indigo-500 active:bg-indigo-900 transition-colors shadow-xl"
                >
                  {word}
                </motion.button>
              ))}
            </div>
          )}

          {stamina === 0 && !isForged && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 bg-rose-500/5 rounded-3xl border border-rose-500/20">
              <p className="text-rose-500 font-black uppercase text-xs tracking-widest mb-4">Forge Cold — No Stamina Left</p>
              <button onClick={() => setSelectedId(null)} className="text-white bg-rose-600 px-6 py-2 rounded-xl font-bold text-sm">Retry Realm</button>
            </motion.div>
          )}
        </div>

        {/* Action Button - Floating on Mobile */}
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-xl mx-auto z-40">
          <div className="flex flex-col gap-3">
            <button
              onClick={verifyForge}
              disabled={constructedSentence.length === 0 || isForged || stamina === 0}
              className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] ${
                isForged 
                ? "bg-emerald-500 text-white" 
                : stamina === 0 
                  ? "bg-slate-800 text-slate-600 grayscale cursor-not-allowed" 
                  : "bg-white text-black ring-4 ring-indigo-500/20"
              }`}
            >
              {isForged ? "VERIFIED ✓" : stamina === 0 ? "STAMINA DEPLETED" : "FORGE RUNES"}
            </button>

            {isForged && nextLesson && (
              <motion.button
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                onClick={() => setSelectedId(nextLesson.id)}
                className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-bold text-xs uppercase tracking-widest shadow-lg active:bg-indigo-500 transition-all"
              >
                Next Realm: {nextLesson.concept} →
              </motion.button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}