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
  
  // NEW: Confirmation Modal State
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const textareaRef = useRef(null);
  const mission = missions[currentMissionIndex];
  const objective = mission?.objectives[currentStep];

  // EFFECT: Auto-save
  useEffect(() => {
    localStorage.setItem("shadow_mission_index", JSON.stringify(currentMissionIndex));
    localStorage.setItem("shadow_step_index", JSON.stringify(currentStep));
    localStorage.setItem("shadow_session_xp", JSON.stringify(sessionXP));
    localStorage.setItem("shadow_mission_earnings", JSON.stringify(missionEarnings));
    localStorage.setItem("shadow_mission_log", JSON.stringify(missionLog));
  }, [currentMissionIndex, currentStep, sessionXP, missionEarnings, missionLog]);

  const calculateXP = () => 50 + Math.floor(patience / 2);

  const handleHardReset = () => {
    setCurrentMissionIndex(0);
    setCurrentStep(0);
    setSessionXP(0);
    setMissionEarnings(0);
    setMissionLog([]);
    setPatience(100);
    setUserInput("");
    setFeedback({ status: "idle", message: "" });
    localStorage.clear();
    setShowTerminateModal(false);
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
      setMissionLog(prev => [...prev, { label: objective.label, correct: objective.correct, xp: earnedXP }]);
      setFeedback({ status: "success", message: `+${earnedXP} XP - OBJECTIVE SECURED` });
      speakTransmission(objective.correct);
      
      try {
        const userRef = doc(db, "pending_users", user.uid);
        await updateDoc(userRef, { xp: increment(earnedXP), streak: increment(1) });
      } catch (e) { console.error("Firebase update failed", e); }

      setTimeout(() => {
        if (currentStep + 1 < mission.objectives.length) {
          setCurrentStep(prev => prev + 1);
          setUserInput("");
          setFeedback({ status: "idle", message: "" });
        } else {
          setFeedback({ status: "complete", message: `MISSION COMPLETE: +${missionEarnings + earnedXP} TOTAL XP` });
          setTimeout(() => {
            setCurrentMissionIndex((prev) => (prev + 1) % missions.length);
            setCurrentStep(0);
            setUserInput("");
            setPatience(100);
            setMissionEarnings(0);
            setMissionLog([]); 
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
      
      {/* TERMINATE MODAL */}
      <AnimatePresence>
        {showTerminateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTerminateModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-red-900/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(153,27,27,0.2)]"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-900/20 border-2 border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tighter uppercase">Terminate Mission?</h3>
                <p className="text-sm text-emerald-800 font-bold mb-6 leading-relaxed">
                  CAUTION: This will abort the current operation and reset mission progress. Points earned so far will remain in your total.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleHardReset}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/20"
                  >
                    Confirm Abortion
                  </button>
                  <button 
                    onClick={() => setShowTerminateModal(false)}
                    className="w-full bg-transparent border border-emerald-900/50 text-emerald-800 hover:text-emerald-400 font-black py-3 rounded-xl uppercase tracking-widest text-[10px] transition-all"
                  >
                    Resume Operation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HUD HEADER */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-800 font-black tracking-widest uppercase">Rank: {profile?.rank || "RECRUIT"}</span>
          <div className="flex items-center gap-2">
            <motion.span 
              key={(profile?.xp || 0) + sessionXP}
              initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-white tracking-tighter"
            >
              {(profile?.xp || 0) + sessionXP}
            </motion.span>
            <span className="text-[10px] text-emerald-500 font-bold italic underline decoration-emerald-800">TOTAL_POINTS</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <button 
            onClick={() => setShowTerminateModal(true)}
            className="text-[9px] text-red-900 border border-red-900/30 px-2 py-0.5 rounded hover:bg-red-500 hover:text-white transition-all mb-2 uppercase font-black"
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

        {/* MISSION TITLE AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2 relative z-20">
          <div className="flex items-start gap-3">
            <div className="flex flex-col flex-1">
                <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold rounded mb-1 inline-block uppercase tracking-widest w-fit">
                B1 Level Operation
                </span>
                <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {mission.title}
                </h2>
            </div>
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => speakTransmission(objective?.label)}
                className={`mt-1 p-2 rounded-lg border flex items-center justify-center transition-all ${isSpeaking ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_#10b981]' : 'bg-black/40 border-emerald-900/50 text-emerald-500 hover:border-emerald-500'}`}
                title="Tactical Briefing"
            >
                {isSpeaking ? (
                   <div className="flex gap-0.5 items-center h-4">
                     <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-black rounded-full" />
                     <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-black rounded-full" />
                     <motion.div animate={{ height: [8, 12, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-black rounded-full" />
                   </div>
                ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                )}
            </motion.button>
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
              className="absolute top-2 right-2 p-1 text-[8px] border border-emerald-500/50 rounded hover:bg-emerald-500 hover:text-black transition-all uppercase font-bold"
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
            autoFocus
          />

          <div className="flex overflow-x-auto gap-1.5 mt-4 pb-2 no-scrollbar md:grid md:grid-cols-9">
            {['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'].map(char => (
              <button
                key={char} onClick={() => injectChar(char)}
                className="flex-shrink-0 w-12 h-12 md:w-auto flex items-center justify-center bg-emerald-950/40 rounded-lg border border-emerald-900/50 text-xl hover:bg-emerald-500 hover:text-black transition-all font-bold active:scale-90"
              >
                {char}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            {feedback.message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
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

        {/* MISSION LOG */}
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

        <div className="flex flex-col md:flex-row gap-3 relative z-20">
          <button onClick={handleVerify} className="flex-[2] bg-emerald-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/10">
            Execute Protocol
          </button>
          <button onClick={() => setShowHint(!showHint)} className={`flex-1 py-4 rounded-xl border-2 transition-all uppercase text-[10px] font-black ${showHint ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'border-emerald-900 text-emerald-800 hover:text-emerald-400'}`}>
            {showHint ? "Hide Intel" : "Request Intel"}
          </button>
        </div>

        {/* HINT AREA */}
        <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black uppercase text-blue-400 tracking-tighter decoration-dotted underline">Encrypted Intel</span>
                    <button onClick={() => speakTransmission(objective?.correct)} className={`text-[8px] font-black px-2 py-1 rounded border border-blue-500/50 transition-all ${isSpeaking ? 'bg-blue-500 text-black' : 'text-blue-400 hover:bg-blue-500/20'}`}>
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