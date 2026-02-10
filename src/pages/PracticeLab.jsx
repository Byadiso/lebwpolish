import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import drillData from "../data/drills.json";

const POLISH_CHARS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

export default function PracticeLab() {
  const { user, profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [floatingXp, setFloatingXp] = useState([]);

  const inputRef = useRef(null);
  const XP_PER_LEVEL = 100;
  const drills = drillData;

  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const userLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const currentDrill = drills[currentIndex];

  const getRank = () => {
    if (xp < 100) return "Novice";
    if (xp < 300) return "Student";
    if (xp < 600) return "Speaker";
    return "Polyglot";
  };

  const speak = (text, speed = 0.8) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  const triggerXpPopup = (amount) => {
    const id = Date.now();
    setFloatingXp((prev) => [...prev, { id, amount }]);
    setTimeout(() => {
      setFloatingXp((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  const injectChar = (char) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = userInput.substring(0, start) + char + userInput.substring(end);
    setUserInput(newText);
    if (status !== 'idle') setStatus('idle');
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
    }, 0);
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

  const handleVerify = async () => {
    if (status === 'checking' || !userInput) return;
    setStatus("checking");
    const normalize = (str) => str.toLowerCase().replace(/[.,?!]/g, "").trim();
    const userRef = doc(db, "pending_users", user.uid);

    setTimeout(async () => {
      if (normalize(userInput) === normalize(currentDrill.polish)) {
        const earnedXp = showHint ? 5 : 20;
        setStatus("success");
        triggerXpPopup(earnedXp);

        if (user) {
          await updateDoc(userRef, {
            xp: increment(earnedXp),
            streak: increment(1)
          });
        }
        setShowConfetti(true);
        speak("Świetnie!", 1.1);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setStatus("error");
        speak("Spróbuj ponownie", 0.8);
        if (user) await updateDoc(userRef, { streak: 0 });
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
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-red-500/30">
      {showConfetti && <Confetti numberOfPieces={150} recycle={false} gravity={0.2} />}

      <div className="max-w-md mx-auto px-4 pt-4 pb-24 lg:pt-8">
        
        {/* COMPACT HUD */}
        <header className="mb-6 grid grid-cols-2 gap-3">
          <div className="bg-slate-900/80 border border-white/5 p-3 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Rank</p>
            <p className="text-sm font-black text-red-500 truncate">{getRank()}</p>
            <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <motion.div animate={{ width: `${xpInCurrentLevel}%` }} className="h-full bg-red-600" />
            </div>
          </div>
          <div className="bg-slate-900/80 border border-white/5 p-3 rounded-2xl backdrop-blur-md flex flex-col justify-center items-end">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Streak</p>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black italic">{streak}</span>
              <span className="animate-pulse">🔥</span>
            </div>
          </div>
        </header>

        {/* IMMERSION SHORTCUT */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = "/polish-music"}
          className="w-full mb-8 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-indigo-600/20">🎵</div>
            <span className="text-[11px] font-bold uppercase tracking-tight text-indigo-300">Switch to Music Lab</span>
          </div>
          <span className="text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity">→</span>
        </motion.button>

        {!isFinished ? (
          <div className="space-y-6">
            {/* PROGRESS DOTS */}
            <div className="flex justify-center gap-2">
               {drills.slice(0, 10).map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-1 rounded-full transition-all duration-500 ${
                     i === currentIndex ? "w-8 bg-red-600" : i < currentIndex ? "w-2 bg-emerald-500" : "w-2 bg-slate-800"
                   }`} 
                 />
               ))}
            </div>

            {/* MAIN INTERFACE CARD */}
            <motion.div 
              layout
              className={`relative rounded-[2.5rem] p-6 border-t border-white/10 shadow-2xl transition-all duration-500 ${
                status === 'success' ? 'bg-emerald-950/20 ring-1 ring-emerald-500/50' : 
                status === 'error' ? 'bg-rose-950/20 ring-1 ring-rose-500/50 animate-shake' : 
                'bg-slate-900/90'
              }`}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => speak(currentDrill.polish)} 
                    className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl"
                  >
                    🔊
                  </motion.button>
                  <button 
                    onClick={startListening} 
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-xl ${
                      isListening ? 'bg-red-500 animate-pulse scale-110' : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    {isListening ? "●" : "🎙️"}
                  </button>
                </div>

                <div className="w-full relative py-4">
                  <input 
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    onChange={(e) => { setUserInput(e.target.value); if(status !== 'idle') setStatus('idle'); }}
                    className="w-full bg-transparent text-center text-2xl font-black placeholder:text-slate-800 outline-none uppercase tracking-tight"
                    placeholder="Type translation..."
                    autoFocus
                  />
                  
                  <AnimatePresence>
                    {floatingXp.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -80, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-1/2 -top-4 -translate-x-1/2 text-2xl font-black text-emerald-400 pointer-events-none"
                      >
                        +{item.amount} XP
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* SPECIAL CHARS - Optimized for tapping */}
                <div className="grid grid-cols-5 gap-2 w-full max-w-[300px]">
                  {POLISH_CHARS.map(char => (
                    <button
                      key={char}
                      onClick={() => injectChar(char)}
                      className="aspect-square bg-slate-800 border border-white/5 rounded-lg flex items-center justify-center font-bold text-lg text-red-500 active:bg-white active:text-black transition-colors"
                    >
                      {char}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={status === 'success' ? nextLevel : handleVerify} 
                  disabled={!userInput && status !== 'success'}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
                    status === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                    'bg-white text-black disabled:opacity-20 shadow-lg shadow-white/10'
                  }`}
                >
                  {status === 'checking' ? 'Checking...' : status === 'success' ? 'Next Mission →' : 'Submit'}
                </button>
              </div>
            </motion.div>

            {/* PROMPT SECTION */}
            <div className="text-center pt-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">English Task</span>
              <div className="h-16 flex items-center justify-center relative px-4">
                <AnimatePresence mode="wait">
                  {!showHint ? (
                    <motion.h2 
                      key="prompt"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xl font-black italic leading-tight"
                    >
                      "{currentDrill.english}"
                    </motion.h2>
                  ) : (
                    <motion.div 
                      key="hint"
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-emerald-400 font-black text-xl tracking-tighter bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/30"
                    >
                      {currentDrill.polish}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center gap-12 mt-4">
                <button onClick={() => speak(currentDrill.polish, 0.4)} className="flex flex-col items-center group">
                  <span className="text-[9px] font-bold text-slate-600 group-active:text-red-500 uppercase tracking-widest">Slow</span>
                  <div className="h-1 w-4 bg-slate-800 rounded-full mt-1 group-active:w-8 group-active:bg-red-500 transition-all" />
                </button>
                <button onClick={() => setShowHint(true)} className="flex flex-col items-center group">
                  <span className="text-[9px] font-bold text-slate-600 group-active:text-white uppercase tracking-widest">Hint</span>
                  <div className="h-1 w-4 bg-slate-800 rounded-full mt-1 group-active:w-8 group-active:bg-white transition-all" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8 bg-slate-900 rounded-[3rem] border border-emerald-500/50"
          >
             <h1 className="text-4xl font-black mb-6 uppercase italic">Cleared</h1>
             <button onClick={() => window.location.reload()} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-widest">Restart Session</button>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}