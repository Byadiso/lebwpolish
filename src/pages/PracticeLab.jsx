import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, increment 
} from "firebase/firestore";
import Confetti from "react-confetti";

export default function PracticeLab() {
  const { user, profile } = useAuth();
  const [drills, setDrills] = useState([]); // Now dynamic from DB
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Constants for level calculation
  const XP_PER_LEVEL = 100;
  
  // 1. Live Fetch Drills from Firebase
  useEffect(() => {
    const q = query(collection(db, "drills"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDrills(data);
    });
    return unsub;
  }, []);

  // Sync progress bar with current index and dynamic drill count
  useEffect(() => {
    if (drills.length > 0) {
      setProgress((currentIndex / drills.length) * 100);
    }
  }, [currentIndex, drills]);

  // Use values directly from Profile (Live Firebase Doc)
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

  // 2. Update Firebase with real progress
  const handleVerify = async () => {
    setStatus("checking");
    const normalize = (str) => str.toLowerCase().replace(/[.,?!]/g, "").trim();
    
    // Reference to the current user's document in Firebase
    const userRef = doc(db, "pending_users", user.uid); 

    setTimeout(async () => {
      if (normalize(userInput) === normalize(currentDrill.polish)) {
        setStatus("success");
        
        // SAVE PROGRESS TO CLOUD
        await updateDoc(userRef, {
          xp: increment(showHint ? 5 : 20),
          streak: increment(1)
        });

        setShowConfetti(true);
        speak("Świetnie!", 1.1);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setStatus("error");
        
        // RESET STREAK IN CLOUD
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
    // Note: We don't reset XP/Streak here because they are permanent in the cloud
  };

  if (drills.length === 0) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white font-black italic animate-pulse">
      SYNCING DRILLS...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-red-500/30">
      {showConfetti && <Confetti numberOfPieces={150} recycle={false} colors={['#EF4444', '#FFFFFF', '#10B981']} />}
      
      <div className="max-w-xl mx-auto px-6 py-12">
        {/* LEVEL & RANK SYSTEM (Pulling from profile) */}
        <div className="mb-10 p-4 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Your Rank</span>
                    <h3 className="text-lg font-black italic tracking-tight">{getRank()}</h3>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</span>
                    <h3 className="text-2xl font-black text-white leading-none">{userLevel}</h3>
                </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${xpInCurrentLevel}%` }}
                />
            </div>
        </div>

        {/* Hot Streak and Level badge */}
        {!isFinished && (
          <div className="flex justify-between items-end mb-4 px-2">
            <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total XP</span>
                  <span className="text-xl font-black text-emerald-400">{xp}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hot Streak</span>
                  <span className={`text-xl font-black transition-all ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-700'}`}>
                      {streak} {streak > 4 ? '🔥' : ''}
                  </span>
                </div>
            </div>
            <div className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Polish {currentDrill.level}</span>
            </div>
          </div>
        )}

        <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {isFinished ? (
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="mb-6 text-6xl">🏆</div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">SESSION COMPLETE</h2>
            <p className="text-slate-400 mb-8 font-medium italic">You mastered {drills.length} sentences today!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                    <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Current XP</span>
                    <span className="text-2xl font-black text-emerald-400">{xp}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                    <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Final Streak</span>
                    <span className="text-2xl font-black text-orange-500">{streak}</span>
                </div>
            </div>

            <div className="space-y-4">
                <button 
                  onClick={restartSession}
                  className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
                >
                  🔄 Repeat Training
                </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 mb-8 justify-center opacity-50">
                {drills.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-full transition-colors ${i === currentIndex ? 'bg-red-500' : i < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'}`} 
                    />
                ))}
            </div>

            <div className={`relative transition-all duration-500 rounded-[3rem] p-10 border-t-4 shadow-2xl ${
              status === 'success' ? 'bg-emerald-950/20 border-emerald-500' : 
              status === 'error' ? 'bg-rose-950/20 border-rose-500 animate-shake' : 
              'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-6">
                  <button onClick={() => speak(currentDrill.polish)} className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-xl hover:bg-slate-700 active:scale-90 transition-all">🔊</button>
                  <button onClick={startListening} className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all ${isListening ? 'bg-rose-500 scale-110 shadow-rose-500/50' : 'bg-red-600 hover:scale-105 active:scale-95'}`}>
                    {isListening ? "⏹️" : "🎙️"}
                  </button>
                </div>

                <div className="w-full space-y-2 text-center">
                  <textarea 
                    rows="2"
                    value={userInput}
                    onChange={(e) => { setUserInput(e.target.value); if(status !== 'idle') setStatus('idle'); }}
                    className="w-full bg-transparent text-center text-2xl font-black placeholder:text-slate-800 outline-none resize-none overflow-hidden"
                    placeholder="Write what you heard..."
                  />
                  {showHint && (
                    <div className="bg-slate-950/50 rounded-xl p-2 mt-2 border border-white/5">
                        <p className="text-red-500/60 font-mono text-xs tracking-[0.3em] animate-pulse">{getHintText()}</p>
                    </div>
                  )}
                </div>

                <div className="w-full pt-4">
                  {status !== "success" ? (
                    <button onClick={handleVerify} disabled={!userInput || status === 'checking'} className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl disabled:opacity-20">
                      {status === 'checking' ? 'Processing...' : 'Verify Recall'}
                    </button>
                  ) : (
                    <button onClick={nextLevel} className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest animate-bounce shadow-lg shadow-emerald-900/40">
                      {currentIndex + 1 === drills.length ? "Finish Session 🏁" : `Correct (+${showHint ? 5 : 20} XP) →`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <p className="text-center text-slate-400 font-medium italic text-lg leading-relaxed px-4 italic">"{currentDrill.english}"</p>
              <div className="flex flex-col items-center gap-4 pt-4">
                <button onClick={() => speak(currentDrill.polish, 0.4)} className="group flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-red-500 transition-colors">🐢 Slow-Mo Mode</button>
                <button onClick={async () => { 
                    setShowHint(true); 
                    await updateDoc(doc(db, "pending_users", user.uid), { streak: 0 }); 
                  }} className="text-[10px] font-black text-slate-500/50 uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4">💡 Use Hint (Kills Streak)</button>
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}