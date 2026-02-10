import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { missions } from "../data/MissionData";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export default function ScenarioEngine() {
  const { user, profile } = useAuth();
  
  // PERSISTENCE HELPERS
  const getSaved = (key, fallback) => {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
  };

  // MISSION STATE
  const [currentMissionIndex, setCurrentMissionIndex] = useState(() => getSaved("shadow_mission_index", 0));
  const [currentStep, setCurrentStep] = useState(() => getSaved("shadow_step_index", 0));

  // XP & LOG PERSISTENCE
  const [sessionXP, setSessionXP] = useState(() => getSaved("shadow_session_xp", 0));
  const [missionEarnings, setMissionEarnings] = useState(() => getSaved("shadow_mission_earnings", 0));
  const [missionLog, setMissionLog] = useState(() => getSaved("shadow_mission_log", []));

  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState({ status: "idle", message: "" });
  const [patience, setPatience] = useState(100);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shake, setShake] = useState(false);

  const textareaRef = useRef(null);
  const mission = missions[currentMissionIndex];
  const objective = mission?.objectives[currentStep];

  // EFFECT: Auto-save all progress to localStorage
  useEffect(() => {
    localStorage.setItem("shadow_mission_index", JSON.stringify(currentMissionIndex));
    localStorage.setItem("shadow_step_index", JSON.stringify(currentStep));
    localStorage.setItem("shadow_session_xp", JSON.stringify(sessionXP));
    localStorage.setItem("shadow_mission_earnings", JSON.stringify(missionEarnings));
    localStorage.setItem("shadow_mission_log", JSON.stringify(missionLog));
  }, [currentMissionIndex, currentStep, sessionXP, missionEarnings, missionLog]);

  const calculateXP = () => 50 + Math.floor(patience / 2);

  const handleHardReset = () => {
    if (window.confirm("CAUTION: This will abort the current operation and reset mission progress. Points earned so far will remain in your total. Proceed?")) {
      setCurrentMissionIndex(0);
      setCurrentStep(0);
      setSessionXP(0);
      setMissionEarnings(0);
      setMissionLog([]);
      setPatience(100);
      setUserInput("");
      setFeedback({ status: "idle", message: "" });
      localStorage.clear();
    }
  };

  const speakTransmission = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setShowHint(false);
    if (objective) speakTransmission(objective.label);
  }, [currentStep, currentMissionIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPatience((prev) => (prev > 0 ? prev - 1 : 0));
    }, 2000);
    return () => clearInterval(timer);
  }, [currentStep, currentMissionIndex]);

  const injectChar = (char) => {
    if (!textareaRef.current) return;
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
    const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,?!]/g, "").trim();
    
    if (normalize(userInput) === normalize(objective.correct)) {
      const earnedXP = calculateXP();
      
      setSessionXP(prev => prev + earnedXP);
      setMissionEarnings(prev => prev + earnedXP);
      
      // Update Mission Log
      setMissionLog(prev => [...prev, { 
        label: objective.label, 
        correct: objective.correct, 
        xp: earnedXP 
      }]);
      
      setFeedback({ status: "success", message: `+${earnedXP} XP - OBJECTIVE SECURED` });
      speakTransmission(objective.correct);
      
      try {
        const userRef = doc(db, "pending_users", user.uid);
        await updateDoc(userRef, {
          xp: increment(earnedXP),
          streak: increment(1)
        });
      } catch (e) { console.error("Firebase update failed", e); }

      setTimeout(() => {
        if (currentStep + 1 < mission.objectives.length) {
          setCurrentStep(prev => prev + 1);
          setUserInput("");
          setFeedback({ status: "idle", message: "" });
        } else {
          setFeedback({ 
            status: "complete", 
            message: `MISSION COMPLETE: +${missionEarnings + earnedXP} TOTAL XP` 
          });
          
          setTimeout(() => {
            setCurrentMissionIndex((prev) => (prev + 1) % missions.length);
            setCurrentStep(0);
            setUserInput("");
            setPatience(100);
            setMissionEarnings(0);
            setMissionLog([]); // Clear log for new mission
            setFeedback({ status: "idle", message: "" });
          }, 3000);
        }
      }, 1200);
    } else {
      setShake(true); 
      setFeedback({ status: "error", message: "PROTOCOL BREACH" });
      setPatience((prev) => Math.max(0, prev - 15));
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!mission) return <div className="text-emerald-500 p-20 font-mono text-center uppercase tracking-widest animate-pulse">End of Operation</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-500 font-mono p-2 md:p-8 flex flex-col items-center selection:bg-emerald-500 selection:text-black">
      
      {/* HUD HEADER */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-800 font-black tracking-widest uppercase">Rank: {profile?.rank || "RECRUIT"}</span>
          <div className="flex items-center gap-2">
            <motion.span 
              key={(profile?.xp || 0) + sessionXP}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-white tracking-tighter"
            >
              {(profile?.xp || 0) + sessionXP}
            </motion.span>
            <span className="text-[10px] text-emerald-500 font-bold italic underline decoration-emerald-800">TOTAL_POINTS</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <button 
            onClick={handleHardReset}
            className="text-[9px] text-red-900 border border-red-900/30 px-2 py-0.5 rounded hover:bg-red-500 hover:text-white transition-all mb-2"
          >
            TERMINATE MISSION
          </button>
          <div>
            <span className="text-[10px] text-emerald-800 font-black tracking-widest uppercase">Multiplier</span>
            <div className="text-xl font-black text-emerald-400">x{(1 + patience/100).toFixed(1)}</div>
          </div>
        </div>
      </div>

      <motion.div 
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        className="w-full max-w-3xl border border-emerald-900/40 rounded-2xl p-4 md:p-8 bg-emerald-950/5 relative overflow-hidden backdrop-blur-md shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-900/20">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep) / mission.objectives.length) * 100}%` }}
          />
        </div>

        {/* MISSION TITLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2 relative z-20">
          <div>
            <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold rounded mb-1 inline-block uppercase tracking-widest">
              B1 Level Operation
            </span>
            <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
              {mission.title}
            </h2>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex justify-between items-end text-[9px] mb-1 uppercase tracking-widest font-black">
              <span className="text-emerald-800">Cognitive Stability</span>
              <span className={patience < 30 ? "text-red-500 animate-pulse" : "text-emerald-500"}>{patience}%</span>
            </div>
            <div className="h-1.5 w-full bg-black rounded-full border border-emerald-900/30 overflow-hidden">
              <motion.div 
                className={`h-full ${patience < 30 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-emerald-500'}`}
                animate={{ width: `${patience}%` }}
              />
            </div>
          </div>
        </div>

        {/* CONTEXT & OBJECTIVE */}
        <div className="space-y-4 mb-6">
          <div className="bg-emerald-500/5 border-l-2 border-emerald-500/50 p-3 rounded-r-lg text-xs md:text-sm text-emerald-50/80 leading-relaxed italic relative group">
            <button 
              onClick={() => speakTransmission(mission.context)}
              className="absolute top-2 right-2 p-1 text-[8px] border border-emerald-500/50 rounded hover:bg-emerald-500 hover:text-black transition-all"
            >
              PLAY LOG
            </button>
            {mission.context}
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-emerald-900/30 text-center">
            <span className="text-[8px] text-emerald-700 uppercase font-black block mb-1">Decrypted Objective</span>
            <p className="text-lg md:text-2xl text-white font-bold tracking-tight italic">
              "{objective?.label}"
            </p>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="relative z-20 mb-6">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleVerify())}
            className={`w-full bg-black/60 border-2 rounded-xl p-4 md:p-6 transition-all text-xl md:text-3xl outline-none resize-none placeholder:text-emerald-900/20 min-h-[100px] text-center font-bold ${feedback.status === 'error' ? 'border-red-500' : 'border-emerald-900/50 focus:border-emerald-400'}`}
            placeholder="TYPE IN POLISH..."
          />

          <div className="flex overflow-x-auto gap-1.5 mt-4 pb-2 no-scrollbar md:grid md:grid-cols-9">
            {['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'].map(char => (
              <button
                key={char}
                onClick={() => injectChar(char)}
                className="flex-shrink-0 w-12 h-12 md:w-auto flex items-center justify-center bg-emerald-950/40 rounded-lg border border-emerald-900/50 text-xl hover:bg-emerald-500 hover:text-black transition-all font-bold active:scale-90"
              >
                {char}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            {feedback.message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-lg border-2 text-center font-black uppercase text-[10px] md:text-xs tracking-[0.2em] ${
                  feedback.status === 'success' || feedback.status === 'complete' 
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                  : 'bg-red-950/90 border-red-500 text-red-500'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MISSION LOG TERMINAL */}
        {missionLog.length > 0 && (
          <div className="mb-6 p-4 bg-black/80 border border-emerald-900/40 rounded-xl max-h-40 overflow-y-auto no-scrollbar">
            <span className="text-[8px] font-black text-emerald-800 uppercase block mb-2 tracking-widest">Operation History Log</span>
            <div className="space-y-1">
              {missionLog.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-emerald-900/10 py-1">
                  <span className="text-emerald-500/60 font-bold">{log.label}</span>
                  <span className="text-white font-black">{log.correct}</span>
                  <span className="text-emerald-400 font-bold">+{log.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-3 relative z-20">
          <button 
            onClick={handleVerify}
            className="flex-[2] bg-emerald-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/10"
          >
            Execute Protocol
          </button>
          <button 
            onClick={() => setShowHint(!showHint)}
            className={`flex-1 py-4 rounded-xl border-2 transition-all uppercase text-[10px] font-black ${
              showHint ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'border-emerald-900 text-emerald-800 hover:text-emerald-400'
            }`}
          >
            {showHint ? "Hide Intel" : "Request Intel"}
          </button>
        </div>

        {/* HINT AREA */}
        <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black uppercase text-blue-400 tracking-tighter decoration-dotted underline">Encrypted Intel</span>
                    <button 
                      onClick={() => speakTransmission(objective?.correct)} 
                      className={`text-[8px] font-black px-2 py-1 rounded border border-blue-500/50 transition-all ${isSpeaking ? 'bg-blue-500 text-black' : 'text-blue-400 hover:bg-blue-500/20'}`}
                    >
                      {isSpeaking ? "TRANSMITTING..." : "VOICE SYNC"}
                    </button>
                </div>
                <p className="text-blue-100 text-xs italic leading-relaxed">{objective?.hint}</p>
              </motion.div>
            )}
        </AnimatePresence>

        {/* FOOTER STATS */}
        <div className="mt-8 pt-6 border-t border-emerald-900/20 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 hover:opacity-100 transition-opacity">
            <div>
                <span className="block text-[8px] uppercase font-black text-emerald-800 tracking-widest">Target Case</span>
                <span className="text-[10px] font-bold text-white">{objective?.caseFocus}</span>
            </div>
            <div>
                <span className="block text-[8px] uppercase font-black text-emerald-800 tracking-widest">Difficulty</span>
                <span className="text-[10px] font-bold text-white">{mission.difficulty}</span>
            </div>
            <div>
                <span className="block text-[8px] uppercase font-black text-emerald-800 tracking-widest">Mission Status</span>
                <span className="text-[10px] font-bold text-white">STEP {currentStep + 1} / {mission.objectives.length}</span>
            </div>
            <div className="text-right">
                <span className="block text-[8px] uppercase font-black text-emerald-800 tracking-widest">Est. Reward</span>
                <span className="text-[10px] font-black text-emerald-400">+{calculateXP()} XP</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
}