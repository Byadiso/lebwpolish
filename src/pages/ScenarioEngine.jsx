import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { missions } from "../data/MissionData";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export default function ScenarioEngine() {
  const { user, profile } = useAuth();
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState({ status: "idle", message: "" });
  const [patience, setPatience] = useState(100);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const textareaRef = useRef(null);

  const mission = missions[currentMissionIndex];
  const objective = mission?.objectives[currentStep];

  // Voice Synthesis Logic
  const speakTransmission = (text) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL"; // Force Polish accent
    utterance.rate = 0.85;    // Slightly slower for learning clarity
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setShowHint(false);
  }, [currentStep, currentMissionIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPatience((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1500);
    return () => clearInterval(timer);
  }, [currentStep, currentMissionIndex]);

  const injectChar = (char) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = userInput.substring(0, start) + char + userInput.substring(end);
    setUserInput(newText);
    
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const handleVerify = async () => {
    if (!objective) return;

    const normalize = (s) => s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[.,?!]/g, "")
      .trim();
    
    if (normalize(userInput) === normalize(objective.correct)) {
      setFeedback({ status: "success", message: "OBJECTIVE SECURED" });
      speakTransmission(objective.correct); // Audio reinforcement on success
      
      try {
        const userRef = doc(db, "pending_users", user.uid);
        await updateDoc(userRef, {
          xp: increment(50 + Math.floor(patience / 2)),
          streak: increment(1)
        });
      } catch (e) { console.error("Firebase update failed"); }

      setTimeout(() => {
        if (currentStep + 1 < mission.objectives.length) {
          setCurrentStep(currentStep + 1);
          setUserInput("");
          setFeedback({ status: "idle", message: "" });
        } else if (currentMissionIndex + 1 < missions.length) {
          setFeedback({ status: "complete", message: "MISSION ACCOMPLISHED. RELOADING..." });
          setTimeout(() => {
            setCurrentMissionIndex(currentMissionIndex + 1);
            setCurrentStep(0);
            setUserInput("");
            setPatience(100);
            setFeedback({ status: "idle", message: "" });
          }, 2000);
        } else {
          setFeedback({ status: "complete", message: "ALL PROTOCOLS COMPLETED" });
        }
      }, 1500);
    } else {
      setFeedback({ status: "error", message: "PROTOCOL BREACH: TRY AGAIN" });
      setPatience((prev) => Math.max(0, prev - 15));
    }
  };

  if (!mission) return <div className="text-emerald-500 p-20 font-mono text-center uppercase tracking-widest">End of Operation</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-500 font-mono p-3 md:p-8 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-3xl mx-auto border border-emerald-900/40 rounded-xl p-4 md:p-8 bg-emerald-950/5 relative overflow-hidden backdrop-blur-sm">
        
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%]" />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 relative z-20">
          <div className="flex-1">
            <h1 className="text-[10px] tracking-[0.3em] text-emerald-800 uppercase font-bold">Shadow Protocol v1.3</h1>
            <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-white uppercase truncate">
              {mission.title}
            </h2>
          </div>
          <div className="text-right ml-4">
            <span className="block text-[8px] text-emerald-800 tracking-widest">MULT</span>
            <span className="text-lg md:text-2xl font-black text-emerald-400">x{(1 + patience/100).toFixed(1)}</span>
          </div>
        </div>

        {/* STRESS METER */}
        <div className="mb-6 relative z-20">
          <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-widest font-bold">
            <span className="opacity-60">Patience Level</span>
            <span className={patience < 30 ? "text-red-500 animate-pulse" : ""}>{patience}%</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-900/30">
            <motion.div 
              className={`h-full shadow-[0_0_15px] ${patience < 30 ? 'bg-red-600 shadow-red-600' : 'bg-emerald-500 shadow-emerald-500'}`}
              animate={{ width: `${patience}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* MISSION LOG */}
        <div className="bg-emerald-950/30 border-l-2 border-emerald-500/50 p-3 md:p-4 rounded-r mb-6 text-xs md:text-sm text-emerald-100/80 leading-relaxed italic">
          <span className="text-emerald-500 not-italic font-bold mr-2 text-[10px]">MISSION_LOG:</span>
          {mission.context}
        </div>

        {/* OBJECTIVE BOX */}
        <div className="mb-6 bg-black/40 p-4 rounded-lg border border-emerald-900/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">Required Input</span>
          </div>
          <p className="text-lg md:text-xl text-white font-bold leading-tight">
            {objective?.label}
          </p>
        </div>

        {/* INPUT AREA */}
        <div className="relative group z-20 mb-4">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-transparent border-b-2 border-emerald-900/50 focus:border-emerald-400 transition-all text-xl md:text-2xl py-3 outline-none resize-none placeholder:text-emerald-900/50 min-h-[60px]"
            placeholder="TYPE TRANSMISSION..."
            rows="1"
          />

          {/* POLISH KEYBOARD BAR */}
          <div className="flex flex-wrap gap-1.5 mt-4 py-3 border-t border-emerald-900/20">
            {['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'].map(char => (
              <button
                key={char}
                onClick={() => injectChar(char)}
                className="flex-1 min-w-[35px] h-10 flex items-center justify-center bg-emerald-900/20 rounded border border-emerald-800/40 text-sm hover:bg-emerald-500 hover:text-black transition-all font-bold active:scale-90"
              >
                {char}
              </button>
            ))}
          </div>
          
          <AnimatePresence>
            {feedback.message && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-[10px] md:text-xs font-black p-3 rounded border flex items-center gap-3 uppercase ${
                  feedback.status === 'success' || feedback.status === 'complete' 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500 text-red-500'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${feedback.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {feedback.message}
              </motion.div>
            )}

            {showHint && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-blue-500/10 border border-blue-500/40 rounded overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-[9px] uppercase text-blue-400 tracking-widest">Decrypted Intel</span>
                    <button 
                        onClick={() => speakTransmission(objective?.correct)}
                        className={`flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded border transition-all ${isSpeaking ? 'bg-blue-500 text-black border-blue-500 animate-pulse' : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/20'}`}
                    >
                        {isSpeaking ? "SYNCING..." : "PLAY AUDIO SYNC"}
                    </button>
                </div>
                <p className="text-blue-200 text-xs italic leading-relaxed">
                    {objective?.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="mt-8 flex flex-col md:flex-row gap-3 relative z-20">
          <button 
            onClick={handleVerify}
            className="flex-[2] bg-emerald-500 text-black font-black py-4 uppercase tracking-[0.1em] text-sm hover:bg-white transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            Execute Protocol
          </button>
          <button 
            onClick={() => setShowHint(!showHint)}
            className={`flex-1 px-4 py-4 border transition-all uppercase text-[10px] font-black ${
              showHint ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-emerald-900 text-emerald-900 hover:text-emerald-400'
            }`}
          >
            {showHint ? "Close Intel" : "Request Intel"}
          </button>
        </div>

        {/* MISSION STATS FOOTER */}
        <div className="mt-8 pt-6 border-t border-emerald-900/30 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-20 opacity-60">
            <div className="text-left md:text-center">
                <span className="block text-[7px] text-emerald-800 uppercase font-bold">Focus</span>
                <span className="text-[10px] font-black text-white">{objective?.caseFocus}</span>
            </div>
            <div className="text-right md:text-center">
                <span className="block text-[7px] text-emerald-800 uppercase font-bold">Difficulty</span>
                <span className="text-[10px] font-black text-white">{mission.difficulty}</span>
            </div>
            <div className="text-left md:text-center">
                <span className="block text-[7px] text-emerald-800 uppercase font-bold">Rank</span>
                <span className="text-[10px] font-black text-white truncate">{profile?.rank || "NOVICE"}</span>
            </div>
            <div className="text-right md:text-center">
                <span className="block text-[7px] text-emerald-800 uppercase font-bold">XP Pool</span>
                <span className="text-[10px] font-black text-emerald-400">+{50 + Math.floor(patience / 2)}</span>
            </div>
        </div>
      </div>
    </div>
  );
}