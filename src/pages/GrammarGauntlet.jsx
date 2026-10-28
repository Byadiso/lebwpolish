import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GRAMMAR_VAULT } from "../data/grammarVault";

// --- XP TOAST ---
function XPToast({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-2xl shadow-indigo-900/50 border border-indigo-400/30"
        >
          <span className="text-yellow-300 text-base">⚡</span>
          <span className="font-black text-xs uppercase tracking-[0.2em]">+100 XP &nbsp;·&nbsp; +15 Grammar Points</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- DIFFICULTY BADGE ---
function DifficultyBadge({ level }) {
  const colors = {
    'B1 Foundation': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    'B1 Essential':  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'B1 Advanced':   'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${colors[level] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
      {level}
    </span>
  );
}

// --- PROGRESS BAR ---
function ProgressBar({ completed, total }) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Vault Progress</span>
        <span className="text-[9px] font-black text-indigo-400">{completed}/{total} Mastered</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
        />
      </div>
    </div>
  );
}

// --- STREAK PIPS ---
function StreakPips({ completed, total }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.02 }}
          className={`w-2 h-2 rounded-full transition-colors ${
            i < completed ? 'bg-indigo-500' : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

// --- CONFETTI BURST ---
function ConfettiBurst({ show }) {
  const colors = ['#6366f1', '#8b5cf6', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const x = Math.random() * 100;
            const color = colors[i % colors.length];
            const delay = Math.random() * 0.3;
            const size = 6 + Math.random() * 8;
            return (
              <motion.div
                key={i}
                initial={{ top: '40%', left: `${x}%`, opacity: 1, scale: 1 }}
                animate={{ top: `${10 + Math.random() * 60}%`, opacity: 0, scale: 0, rotate: Math.random() * 360 }}
                transition={{ duration: 1 + Math.random() * 0.6, delay, ease: "easeOut" }}
                style={{ position: 'absolute', width: size, height: size, borderRadius: Math.random() > 0.5 ? '50%' : '2px', background: color }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function GrammarGauntlet({ onNavigateToCases }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealWhy, setRevealWhy] = useState(false);

  const totalLessons = GRAMMAR_VAULT.length;
  const completedCount = (profile?.completedCategories || []).filter(id =>
    GRAMMAR_VAULT.some(n => n.id === id)
  ).length;

  const activeIndex = GRAMMAR_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = GRAMMAR_VAULT[activeIndex];
  const nextLesson = GRAMMAR_VAULT[activeIndex + 1];

  useEffect(() => {
    setUserAnswer(null);
    setError(false);
    setIsCorrect(false);
    setRevealWhy(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedNode]);

  const handleMastery = async (nodeId) => {
    if (userAnswer !== activeLesson.challenge.correct) {
      setError(true);
      setIsCorrect(false);
      setRevealWhy(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const q = query(collection(db, "pending_users"), where("email", "==", user.email.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          completedCategories: arrayUnion(nodeId),
          xp: increment(100),
          grammarPoints: increment(15)
        });
        setIsCorrect(true);
        setShowConfetti(true);
        setShowXP(true);
        setTimeout(() => setShowConfetti(false), 2000);
        setTimeout(() => setShowXP(false), 2800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- MENU VIEW ---
  if (!selectedNode) {
    const completed = profile?.completedCategories || [];
    return (
      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 pb-32 font-sans selection:bg-indigo-500/30">
        <header className="text-center mb-10 pt-6 md:pt-12">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              Polish <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Codex</span>
            </h1>
            <div className="mt-5 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">B1 Linguistic Engine Active</p>
            </div>
          </motion.div>
        </header>

        {/* PROGRESS SECTION */}
        <div className="max-w-4xl mx-auto mb-8 bg-[#0f172a] border border-white/5 rounded-2xl p-5 space-y-3">
          <ProgressBar completed={completedCount} total={totalLessons} />
          <StreakPips completed={completedCount} total={totalLessons} />
        </div>

        {/* TOP NAVIGATION CARDS */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/practice-polish-case")}
            className="relative overflow-hidden group p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-800 border border-white/10 shadow-2xl flex items-center justify-between transition-all active:scale-[0.98]"
          >
            <div className="relative z-10 text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Module 01</span>
              <h2 className="text-xl font-black italic uppercase text-white">Grammar Cases</h2>
              <p className="text-[10px] text-indigo-100 mt-1 font-bold opacity-80 uppercase">Declension Trainer</p>
            </div>
            <div className="relative z-10 bg-white/10 p-3 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
              <span className="text-2xl">🇵🇱</span>
            </div>
            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/reading-comprehension")}
            className="relative overflow-hidden group p-6 rounded-3xl bg-[#0f172a] border border-indigo-500/30 shadow-2xl flex items-center justify-between transition-all active:scale-[0.98] hover:border-indigo-400"
          >
            <div className="relative z-10 text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Module 02</span>
              <h2 className="text-xl font-black italic uppercase text-white">Reading Codex</h2>
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Context & Vocabulary</p>
            </div>
            <div className="relative z-10 bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30 group-hover:-rotate-12 transition-transform">
              <span className="text-2xl">📖</span>
            </div>
          </motion.button>
        </div>

        {/* PROGRESS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {GRAMMAR_VAULT.map((node, i) => {
            const isDone = completed.includes(node.id);
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full group flex items-center p-5 rounded-2xl border transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0f172a] border-white/5 hover:border-indigo-500/50 shadow-xl'
                }`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
                  isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                }`}>
                  {isDone ? '✓' : node.icon}
                </div>
                <div className="ml-4 text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{node.label}</h3>
                    <DifficultyBadge level={node.difficulty} />
                  </div>
                  <h2 className="text-sm md:text-base font-bold text-slate-200 truncate group-hover:text-white transition-colors">{node.concept}</h2>
                </div>
                <div className="text-slate-700 font-black text-lg italic opacity-10 group-hover:opacity-30 ml-2">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- LESSON VIEW ---
  const alreadyCompleted = profile?.completedCategories?.includes(activeLesson.id);
  const wrongAnswer = userAnswer && userAnswer !== activeLesson.challenge.correct;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 pb-20">
      <ConfettiBurst show={showConfetti} />
      <XPToast show={showXP} />

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedNode}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="max-w-2xl mx-auto"
        >
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase flex items-center gap-2 transition-colors tracking-[0.2em]"
            >
              <span className="text-lg">←</span> Return to Codex
            </button>
            <DifficultyBadge level={activeLesson.difficulty} />
          </div>

          <div className="bg-[#0f172a] rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden">
            {/* HERO HEADER */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 md:p-12 relative">
              <div className="relative z-10">
                <span className="bg-black/20 text-white/80 text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">B1 Masterclass</span>
                <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mt-4 leading-tight">
                  {activeLesson.concept}
                </h1>
              </div>
              <div className="absolute top-1/2 right-4 md:right-10 -translate-y-1/2 text-7xl md:text-9xl opacity-10 rotate-12 select-none pointer-events-none">
                {activeLesson.icon}
              </div>
            </div>

            <div className="p-6 md:p-12 space-y-10">
              {/* THE LOGIC */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-indigo-500/20" />
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">The Logic</h5>
                  <div className="h-px flex-1 bg-indigo-500/20" />
                </div>
                <p className="text-xl md:text-2xl text-slate-100 font-serif italic leading-relaxed text-center px-4">
                  "{activeLesson.lesson}"
                </p>
              </section>

              {/* MEMORY HOOK */}
              <section>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🧠</span>
                    <h6 className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Memory Hook</h6>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{activeLesson.memory}</p>
                </div>
              </section>

              {/* SECTIONS */}
              <section className="grid gap-4">
                {activeLesson.sections.map((sec, idx) => (
                  <div key={idx} className="bg-[#020617] p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-colors group">
                    <h6 className="text-indigo-400 font-black text-[10px] uppercase mb-2 tracking-widest">{sec.title}</h6>
                    <p className="text-slate-300 text-sm md:text-base mb-4 leading-relaxed font-medium">{sec.content}</p>
                    <div className="bg-emerald-500/10 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-emerald-400 font-black text-sm border border-emerald-500/20 shadow-inner">
                      <span className="opacity-50">EX:</span> {sec.ex}
                    </div>
                  </div>
                ))}
              </section>

              {/* COMMON MISTAKE */}
              {activeLesson.mistake && (
                <section>
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">⚠️</span>
                      <h6 className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Common Mistake</h6>
                    </div>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-rose-500 font-black text-xs mt-0.5">✗</span>
                      <code className="text-rose-300 text-sm font-mono bg-rose-500/10 px-2 py-1 rounded-lg">{activeLesson.mistake.wrong}</code>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed pl-5">{activeLesson.mistake.explanation}</p>
                  </div>
                </section>
              )}

              {/* CHALLENGE */}
              <section className={`transition-all duration-700 border-2 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 ${
                isCorrect || alreadyCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]'
                  : 'bg-indigo-500/5 border-dashed border-indigo-500/20'
              }`}>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <span className={`${isCorrect || alreadyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} text-[9px] font-black px-3 py-1 rounded-full text-white tracking-widest`}>
                    {isCorrect || alreadyCompleted ? 'VERIFIED' : 'CHALLENGE'}
                  </span>
                </div>

                <p className="text-lg md:text-2xl font-bold text-slate-100 mb-8 text-center">{activeLesson.challenge.q}</p>

                <div className="grid gap-3">
                  {activeLesson.challenge.options.map((option) => {
                    const isSelected = userAnswer === option;
                    const isThisCorrect = option === activeLesson.challenge.correct;
                    const showCorrectHighlight = (isCorrect || alreadyCompleted) && isThisCorrect;
                    const showWrongHighlight = error && isSelected && !isThisCorrect;

                    return (
                      <button
                        key={option}
                        disabled={isCorrect || alreadyCompleted}
                        onClick={() => { setUserAnswer(option); setError(false); setRevealWhy(false); }}
                        className={`w-full p-5 rounded-2xl text-center font-black uppercase tracking-widest transition-all border-2 text-xs md:text-sm ${
                          showCorrectHighlight
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                            : showWrongHighlight
                              ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                              : isSelected && !isCorrect && !alreadyCompleted
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-slate-900 border-white/5 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* FEEDBACK AREA */}
                <AnimatePresence>
                  {error && revealWhy && activeLesson.challenge.why && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">❌</span>
                        <span className="text-rose-400 text-[9px] font-black uppercase tracking-widest">Construction Error</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{activeLesson.challenge.why}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">✓ Correct:</span>
                        <code className="text-emerald-300 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded-lg">{activeLesson.challenge.correct}</code>
                      </div>
                    </motion.div>
                  )}
                  {error && !revealWhy && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] text-center italic"
                    >
                      ❌ Construction Error. Review the logic above.
                    </motion.p>
                  )}
                </AnimatePresence>
              </section>

              {/* CTA BUTTONS */}
              <div className="pt-4 space-y-4">
                <button
                  disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                  onClick={() => handleMastery(activeLesson.id)}
                  className={`w-full py-6 md:py-7 rounded-3xl font-black uppercase tracking-[0.3em] text-xs md:text-sm transition-all ${
                    alreadyCompleted || isCorrect
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 cursor-default'
                      : !userAnswer
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-white text-black hover:bg-emerald-500 hover:text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? "Decrypting..." : (isCorrect || alreadyCompleted) ? "✓ Construction Mastered" : "Verify Construction"}
                </button>

                {(isCorrect || alreadyCompleted) && nextLesson && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 text-center"
                  >
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">
                      Sequential Access Granted
                    </p>
                    <button
                      onClick={() => setSelectedNode(nextLesson.id)}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-900/40"
                    >
                      Next: {nextLesson.concept} →
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
