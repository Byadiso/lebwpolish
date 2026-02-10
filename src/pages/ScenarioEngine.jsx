import { useState, useEffect } from "react";
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

  const mission = missions[currentMissionIndex];
  const objective = mission.objectives[currentStep];

  // Stress Meter Logic: Patience drops over time
  useEffect(() => {
    const timer = setInterval(() => {
      setPatience((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep]);

  const handleVerify = async () => {
    const normalize = (s) => s.toLowerCase().replace(/[.,?!]/g, "").trim();
    
    if (normalize(userInput) === normalize(objective.correct)) {
      setFeedback({ status: "success", message: "OBJECTIVE SECURED" });
      
      // Update Firebase
      const userRef = doc(db, "pending_users", user.uid);
      await updateDoc(userRef, {
        xp: increment(50 + Math.floor(patience / 2)), // Bonus for speed!
        streak: increment(1)
      });

      setTimeout(() => {
        if (currentStep + 1 < mission.objectives.length) {
          setCurrentStep(currentStep + 1);
          setUserInput("");
          setFeedback({ status: "idle", message: "" });
        } else {
          setFeedback({ status: "complete", message: "MISSION ACCOMPLISHED" });
        }
      }, 1500);
    } else {
      setFeedback({ status: "error", message: "PROTOCOL BREACH: TRY AGAIN" });
      setPatience((prev) => prev - 10);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-500 font-mono p-4 md:p-8">
      <div className="max-w-3xl mx-auto border-2 border-emerald-900/30 rounded-lg p-6 bg-emerald-950/5 relative overflow-hidden">
        
        {/* SCANLINE EFFECT */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xs tracking-[0.5em] text-emerald-800 uppercase">Shadow Protocol v1.0</h1>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{mission.title}</h2>
          </div>
          <div className="text-right">
            <span className="block text-[8px] text-emerald-800">XP MULTIPLIER</span>
            <span className="text-2xl font-black text-emerald-400">x{(1 + patience/100).toFixed(1)}</span>
          </div>
        </div>

        {/* PATIENCE/STRESS METER */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] mb-2 uppercase tracking-widest">
            <span>NPC Patience Status</span>
            <span className={patience < 30 ? "text-red-500 animate-pulse" : ""}>{patience}%</span>
          </div>
          <div className="h-1 w-full bg-emerald-900/20 rounded-full">
            <motion.div 
              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
              animate={{ width: `${patience}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* CONTEXT WINDOW */}
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded mb-8 italic text-sm text-emerald-100">
          "LOG: {mission.context}"
        </div>

        {/* OBJECTIVE BOX */}
        <div className="mb-12">
          <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-black font-black uppercase mr-2">Current Objective</span>
          <p className="text-xl mt-4 text-white font-bold underline decoration-emerald-500/50 underline-offset-8">
            {objective.label}
          </p>
        </div>

        {/* INPUT AREA */}
        <div className="relative group">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-transparent border-b-2 border-emerald-900 focus:border-emerald-400 transition-colors text-2xl md:text-3xl py-4 outline-none resize-none placeholder:text-emerald-950"
            placeholder="TYPE TRANSMISSION..."
            rows="1"
          />
          
          {/* FEEDBACK OVERLAY */}
          <AnimatePresence>
            {feedback.message && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-xs font-black p-2 rounded uppercase ${
                  feedback.status === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIONS */}
        <div className="mt-12 flex flex-col md:flex-row gap-4">
          <button 
            onClick={handleVerify}
            className="flex-1 bg-emerald-500 text-black font-black py-4 uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Execute Protocol
          </button>
          <button 
            onClick={() => alert(objective.hint)}
            className="px-8 border border-emerald-900 text-emerald-900 hover:text-emerald-400 transition-colors uppercase text-xs font-black"
          >
            Request Intel (Hint)
          </button>
        </div>

        {/* GRAMMAR POWER-CORE (Dopamine Visualizer) */}
        <div className="mt-12 pt-8 border-t border-emerald-900/30 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
                <span className="block text-[8px] text-emerald-800 uppercase">Active Case</span>
                <span className="text-xs font-black text-white">{objective.caseFocus}</span>
            </div>
            <div className="text-center">
                <span className="block text-[8px] text-emerald-800 uppercase">Complexity</span>
                <span className="text-xs font-black text-white">LEVEL {mission.difficulty}</span>
            </div>
            <div className="text-center">
                <span className="block text-[8px] text-emerald-800 uppercase">Auth Level</span>
                <span className="text-xs font-black text-white">{profile?.rank || "NOVICE"}</span>
            </div>
            <div className="text-center">
                <span className="block text-[8px] text-emerald-800 uppercase">Reward</span>
                <span className="text-xs font-black text-emerald-400">+{50 + Math.floor(patience / 2)} XP</span>
            </div>
        </div>

      </div>
    </div>
  );
}