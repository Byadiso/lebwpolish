import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, increment 
} from "firebase/firestore";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function PracticeLab() {
  const { user, profile } = useAuth();
  const [drills, setDrills] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const XP_PER_LEVEL = 100;
  
  useEffect(() => {
    const q = query(collection(db, "drills"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDrills(data);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (drills.length > 0) {
      setProgress((currentIndex / drills.length) * 100);
    }
  }, [currentIndex, drills]);

  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const userLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const currentDrill = drills[currentIndex];

  const getRank = () => {
    if (xp < 100) return "Cześć (Novice)";
    if (xp < 300) return "Uczeń (Student)";
    if (xp < 600) return "Mówca (Speaker)";
    return "Poliglota (Polyglot)";
  };

  const speak = (text, speed = 0.8) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "pl-PL";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.replace(/\.$/, "");
      setUserInput(transcript);
      setStatus("idle");
    };
    recognition.start();
  };

  const getHintText = () => {
    if (!currentDrill) return "";
    return currentDrill.polish
      .split(" ")
      .map(word => word[0] + "_".repeat(word.length - 1))
      .join(" ");
  };

  const handleVerify = async () => {
    setStatus("checking");
    const normalize = (str) => str.toLowerCase().replace(/[.,?!]/g, "").trim();
    const userRef = doc(db, "pending_users", user.uid); 

    setTimeout(async () => {
      if (normalize(userInput) === normalize(currentDrill.polish)) {
        setStatus("success");
        await updateDoc(userRef, {
          xp: increment(showHint ? 5 : 20),
          streak: increment(1)
        });
        setShowConfetti(true);
        speak("Świetnie!", 1.1);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setStatus("error");
        await updateDoc(userRef, { streak: 0 });
        speak("Spróbuj jeszcze raz", 1);
      }
    }, 600);
  };

  const nextLevel = () => {
    if (currentIndex + 1 < drills.length) {
      setStatus("idle");
      setUserInput("");
      setShowHint(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      setProgress(100);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setUserInput("");
    setStatus("idle");
    setIsFinished(false);
    setProgress(0);
  };

  if (drills.length === 0) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white font-black italic animate-pulse">
      SYNCING DRILLS...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-red-500/30 overflow-x-hidden pb-32">
      {showConfetti && <Confetti numberOfPieces={150} recycle={false} colors={['#EF4444', '#FFFFFF', '#10B981']} />}
      
      <div className="max-w-xl mx-auto px-4 py-6 md:py-12">
        {/* TOP HUD */}
        <div className="mb-6 p-4 bg-slate-900/80 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-3">
                <div className="min-w-0">
                    <span className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-widest">Rank</span>
                    <h3 className="text-sm md:text-lg font-black italic tracking-tight truncate">{getRank()}</h3>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</span>
                    <h3 className="text-xl md:text-2xl font-black text-white leading-none">{userLevel}</h3>
                </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${xpInCurrentLevel}%` }}
                />
            </div>
        </div>

        {/* STATS STRIP */}
        {!isFinished && (
          <div className="flex justify-between items-end mb-4 px-2">
            <div className="flex gap-4 md:gap-6">
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">XP</span>
                  <span className="text-lg md:text-xl font-black text-emerald-400 leading-tight">{xp}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Streak</span>
                  <span className={`text-lg md:text-xl font-black leading-tight transition-all ${streak > 0 ? 'text-orange-500' : 'text-slate-700'}`}>
                      {streak} {streak > 4 ? '🔥' : ''}
                  </span>
                </div>
            </div>
            <div className="bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50 shrink-0">
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">PL {currentDrill.level}</span>
            </div>
          </div>
        )}

        {/* SESSION PROGRESS */}
        <div className="w-full h-1 bg-slate-800 rounded-full mb-6 md:mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {isFinished ? (
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center shadow-2xl">
            <div className="mb-4 text-5xl md:text-6xl">🏆</div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 uppercase">Session Complete</h2>
            <p className="text-slate-400 mb-8 font-medium italic text-sm">You mastered {drills.length} sentences!</p>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">XP</span>
                    <span className="text-xl font-black text-emerald-400">{xp}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Streak</span>
                    <span className="text-xl font-black text-orange-500">{streak}</span>
                </div>
            </div>

            <button 
              onClick={restartSession}
              className="w-full py-4 md:py-5 bg-white text-black rounded-2xl md:rounded-3xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
            >
              🔄 Repeat Training
            </button>
          </motion.div>
        ) : (
          <>
            {/* DRILL CARD */}
            <div className={`relative transition-all duration-500 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-t-4 shadow-2xl ${
              status === 'success' ? 'bg-emerald-950/20 border-emerald-500' : 
              status === 'error' ? 'bg-rose-950/20 border-rose-500 animate-shake' : 
              'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col items-center gap-6 md:gap-8">
                {/* AUDIO CONTROLS */}
                <div className="flex items-center gap-4 md:gap-6">
                  <button onClick={() => speak(currentDrill.polish)} className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 border border-slate-700 rounded-xl md:rounded-2xl flex items-center justify-center text-xl shadow-xl active:scale-90 transition-all">🔊</button>
                  <button onClick={startListening} className={`relative w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-2xl transition-all ${isListening ? 'bg-rose-500 scale-105 shadow-rose-500/50' : 'bg-red-600 hover:scale-105 active:scale-95'}`}>
                    {isListening ? "⏹️" : "🎙️"}
                  </button>
                </div>

                {/* INPUT ZONE */}
                <div className="w-full space-y-2 text-center">
                  <textarea 
                    rows="2"
                    value={userInput}
                    onChange={(e) => { setUserInput(e.target.value); if(status !== 'idle') setStatus('idle'); }}
                    className="w-full bg-transparent text-center text-xl md:text-2xl font-black placeholder:text-slate-800 outline-none resize-none overflow-hidden"
                    placeholder="Type the Polish..."
                  />
                  {showHint && (
                    <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} className="bg-slate-950/50 rounded-xl p-2 mt-2 border border-white/5">
                        <p className="text-red-500/60 font-mono text-[10px] tracking-[0.2em] uppercase">{getHintText()}</p>
                    </motion.div>
                  )}
                </div>

                {/* ACTION BUTTON */}
                <div className="w-full">
                  {status !== "success" ? (
                    <button onClick={handleVerify} disabled={!userInput || status === 'checking'} className="w-full py-4 md:py-5 bg-white text-black rounded-2xl md:rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-10 active:scale-[0.98]">
                      {status === 'checking' ? 'Validating...' : 'Verify'}
                    </button>
                  ) : (
                    <button onClick={nextLevel} className="w-full py-4 md:py-5 bg-emerald-500 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-emerald-900/40 active:scale-[0.98]">
                      {currentIndex + 1 === drills.length ? "Finish 🏁" : `Next (+${showHint ? 5 : 20} XP) →`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TRANSLATION & HELPERS */}
            <div className="mt-8 space-y-6">
              <p className="text-center text-slate-400 font-medium italic text-base md:text-lg leading-relaxed px-4">
                "{currentDrill.english}"
              </p>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => speak(currentDrill.polish, 0.4)} className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-red-500 py-2">🐢 Slow Mode</button>
                <button onClick={async () => { 
                    setShowHint(true); 
                    await updateDoc(doc(db, "pending_users", user.uid), { streak: 0 }); 
                  }} className="text-[9px] font-black text-slate-500/40 uppercase tracking-widest hover:text-white underline underline-offset-4">💡 Hint (Ends Streak)</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FLOATING MUSIC LAB CTA - FIXED TO BOTTOM TO AVOID BLOCKING DRILLS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent pointer-events-none">
          <div className="max-w-xl mx-auto pointer-events-auto">
              <motion.button 
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = "/polish-music"}
                className="w-full group relative overflow-hidden bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-indigo-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:rotate-12 transition-transform">
                    🎵
                  </div>
                  <div className="text-left">
                    <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest">Optional Immersion</span>
                    <h3 className="text-sm font-black italic uppercase tracking-tight text-white">Music & Lyrics Lab</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-400 transition-colors">START LISTENING</span>
                  <span className="text-indigo-500 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-500/5 to-transparent" />
              </motion.button>
          </div>
      </div>

      <style jsx>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}