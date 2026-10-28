import IconText from "../components/IconText";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { READING_VAULT } from "../data/readingVault";
const OPTION_LABELS = ["A", "B", "C", "D"];
const getDifficultyColor = difficulty => {
  if (!difficulty) return "text-slate-500 bg-slate-500/10";
  if (difficulty === "Easy") return "text-emerald-400 bg-emerald-500/10";
  if (difficulty === "Hard") return "text-rose-400 bg-rose-500/10";
  return "text-amber-400 bg-amber-500/10";
};
const getScoreFeedback = (score, total) => {
  const pct = score / total;
  if (pct === 1) return {
    label: "Perfect",
    msg: "Flawless execution. Your B1 comprehension is sharp.",
    color: "text-emerald-400"
  };
  if (pct >= 0.75) return {
    label: "Strong",
    msg: "Solid grasp. Review the missed items carefully.",
    color: "text-indigo-300"
  };
  if (pct >= 0.5) return {
    label: "Developing",
    msg: "Good foundation. Re-read the text with the grammar note.",
    color: "text-amber-400"
  };
  return {
    label: "Keep Practicing",
    msg: "Read the text again slowly before retrying.",
    color: "text-rose-400"
  };
};
export default function PolishReadingEngine() {
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showGrammarNote, setShowGrammarNote] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [sessionScores, setSessionScores] = useState([]);
  const [revealedExplanations, setRevealedExplanations] = useState({});
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);
  const activeData = READING_VAULT.find(t => t.id === selectedTextId);
  useEffect(() => {
    const handleScroll = () => setActiveTooltip(null);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);
  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };
  const handleSelect = (qId, option) => {
    if (showResults) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };
  const calculateScore = () => {
    let score = 0;
    activeData.questions.forEach(q => {
      if (answers[q.id] === q.correct) score++;
    });
    return score;
  };
  const handleSubmit = () => {
    setShowResults(true);
    const score = calculateScore();
    setSessionScores(prev => [...prev, {
      title: activeData.title,
      score,
      total: activeData.questions.length
    }]);
  };
  const handleReset = () => {
    setIsStarted(false);
    setShowResults(false);
    setAnswers({});
    setSelectedTextId(null);
    setShowGrammarNote(false);
    setCurrentQ(0);
    setRevealedExplanations({});
  };
  const answeredCount = Object.keys(answers).length;
  const totalQ = activeData?.questions?.length ?? 0;
  const progressPct = totalQ > 0 ? answeredCount / totalQ * 100 : 0;
  const renderInteractiveText = (text, glossary = {}) => {
    const words = text.split(/(\s+)/);
    return words.map((part, i) => {
      const cleanWord = part.toLowerCase().replace(/[.,„"()!?;:]/g, "").trim();
      const definition = glossary && glossary[cleanWord];
      if (!cleanWord.length) return <span key={i}><IconText>{part}</IconText></span>;
      return <span key={i} className="relative inline">
          <button onClick={e => {
          e.stopPropagation();
          setActiveTooltip(activeTooltip === i ? null : i);
        }} className={`transition-all rounded px-[1px] ${definition ? "text-indigo-300 border-b border-indigo-500/50 hover:bg-indigo-500/15" : "hover:text-white hover:bg-white/5"}`}>
            <IconText>{part}</IconText>
          </button>
          <AnimatePresence>
            {activeTooltip === i && <motion.div initial={{
            opacity: 0,
            y: 6
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 6
          }} transition={{
            duration: 0.15
          }} className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 p-3.5 bg-[#1e293b] border border-indigo-500/30 rounded-2xl shadow-2xl z-[200]" style={{
            pointerEvents: "none"
          }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                  <IconText>{definition ? "Definicja" : "Słowo"}</IconText>
                </p>
                <p className="text-[13px] text-slate-100 leading-snug">
                  <IconText>{definition ?? "Tap any highlighted word for its meaning."}</IconText>
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1e293b]" />
              </motion.div>}
          </AnimatePresence>
        </span>;
    });
  };

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (!selectedTextId) {
    return <div className="w-full bg-[#020617] min-h-screen text-white font-sans overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-5 py-12 md:py-20">

          {/* Header */}
          <motion.header initial={{
          opacity: 0,
          y: -16
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-3">
              B1 Reading<IconText>{" "}</IconText>
              <span className="text-indigo-500 font-serif lowercase not-italic">codex</span>
            </h1>
            <p className="text-slate-500 text-sm tracking-widest uppercase font-semibold mb-6">
              Polish comprehension simulator
            </p>
            <div className="h-px w-16 bg-indigo-600 mx-auto rounded-full" />
          </motion.header>

          {/* Session bar */}
          {sessionScores.length > 0 && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="mb-8 mt-8 flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 shrink-0">
                Session
              </span>
              {sessionScores.map((s, i) => <div key={i} className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                  <span className="text-[11px] text-slate-400 max-w-[100px] truncate"><IconText>{s.title}</IconText></span>
                  <span className={`text-[11px] font-black ${s.score === s.total ? "text-emerald-400" : "text-indigo-400"}`}>
                    <IconText>{s.score}</IconText>/<IconText>{s.total}</IconText>
                  </span>
                </div>)}
            </motion.div>}

          {/* Cards grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {READING_VAULT.map((item, idx) => {
            const pastScore = sessionScores.findLast(s => s.title === item.title);
            return <motion.div key={item.id} initial={{
              opacity: 0,
              y: 24
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: idx * 0.04
            }} whileHover={{
              y: -4
            }} className="relative group bg-[#0d1526] border border-white/5 rounded-[2rem] p-7 cursor-pointer hover:border-indigo-500/30 transition-all duration-300 overflow-hidden flex flex-col" onClick={() => setSelectedTextId(item.id)}>
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl"><IconText>{item.icon}</IconText></span>
                    <div className="flex items-center gap-2">
                      {item.difficulty && <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${getDifficultyColor(item.difficulty)}`}>
                          <IconText>{item.difficulty}</IconText>
                        </span>}
                      <button onClick={e => toggleFavorite(e, item.id)} className={`w-8 h-8 flex items-center justify-center rounded-xl text-base transition-all ${favorites.includes(item.id) ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-600 hover:text-slate-400"}`}>
                        <IconText>{favorites.includes(item.id) ? "★" : "☆"}</IconText>
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5">
                    <IconText>{item.category}</IconText>
                  </p>
                  <h2 className="text-lg font-bold leading-snug mb-3 group-hover:text-indigo-100 transition-colors">
                    <IconText>{item.title}</IconText>
                  </h2>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-auto pt-5 border-t border-white/5">
                    <span className="text-[10px] text-slate-600 font-semibold">
                      <IconText>{item.questions?.length ?? "—"}</IconText> questions
                    </span>
                    {item.readTime && <>
                        <span className="text-slate-700">·</span>
                        <span className="text-[10px] text-slate-600 font-semibold">~<IconText>{item.readTime}</IconText> min read</span>
                      </>}
                    {pastScore && <>
                        <span className="text-slate-700">·</span>
                        <span className={`text-[10px] font-black ml-auto ${pastScore.score === pastScore.total ? "text-emerald-400" : "text-indigo-400"}`}>
                          Last: <IconText>{pastScore.score}</IconText>/<IconText>{pastScore.total}</IconText>
                        </span>
                      </>}
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute bottom-7 right-7 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 font-black text-lg">
                    →
                  </div>
                </motion.div>;
          })}
          </div>
        </div>
      </div>;
  }

  // ── SIMULATOR ─────────────────────────────────────────────────────────────
  const score = showResults ? calculateScore() : null;
  const feedback = showResults ? getScoreFeedback(score, totalQ) : null;
  return <div ref={containerRef} className="w-full bg-[#020617] min-h-screen text-white font-sans" onClick={() => setActiveTooltip(null)}>
      <div className="max-w-3xl mx-auto px-5 pb-24">

        {/* Sticky header */}
        <header className="sticky top-0 z-50 flex items-center justify-between py-4 mb-6 backdrop-blur-md bg-[#020617]/85 border-b border-white/5">
          <button onClick={handleReset} className="text-[9px] font-black text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
            ← Exit
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              <IconText>{activeData.category}</IconText>
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[180px]">
              <IconText>{activeData.title}</IconText>
            </span>
          </div>
          {isStarted && !showResults && <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-indigo-400">
                <IconText>{answeredCount}</IconText>/<IconText>{totalQ}</IconText>
              </span>
            </div>}
          {(!isStarted || showResults) && <div className="w-10" />}
        </header>

        {/* Progress bar (shown during quiz) */}
        {isStarted && !showResults && <div className="mb-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-indigo-500 rounded-full" animate={{
          width: `${progressPct}%`
        }} transition={{
          duration: 0.3
        }} />
          </div>}

        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {!isStarted && <motion.div key="intro" initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0
        }} className="space-y-5">
              <div className="bg-[#0d1526] border border-white/5 rounded-[2.5rem] p-10 text-center">
                <div className="text-8xl mb-6"><IconText>{activeData.icon}</IconText></div>
                <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-3">
                  <IconText>{activeData.title}</IconText>
                </h2>
                <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                  Read the text carefully, then answer <IconText>{totalQ}</IconText> comprehension questions. Tap highlighted words for definitions.
                </p>

                {/* Meta chips */}
                <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
                  {activeData.difficulty && <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${getDifficultyColor(activeData.difficulty)}`}>
                      <IconText>{activeData.difficulty}</IconText>
                    </span>}
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl text-slate-400 bg-white/5">
                    <IconText>{totalQ}</IconText> questions
                  </span>
                  {activeData.readTime && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl text-slate-400 bg-white/5">
                      ~<IconText>{activeData.readTime}</IconText> min
                    </span>}
                </div>

                <button onClick={() => setIsStarted(true)} className="bg-indigo-600 hover:bg-indigo-500 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] transition-all shadow-[0_12px_30px_rgba(79,70,229,0.3)] active:scale-95">
                  Start Reading
                </button>
              </div>
            </motion.div>}

          {/* ── ACTIVE QUIZ ── */}
          {isStarted && !showResults && <motion.div key="quiz" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="space-y-8">
              {/* Reading passage */}
              <div className="bg-[#0d1526] border border-indigo-500/10 rounded-[2.5rem] p-8 md:p-12">
                {/* Hint bar */}
                <div className="flex items-center gap-2 mb-6 pb-5 border-b border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                    Tap words to reveal meanings
                  </span>
                </div>

                {/* Text */}
                <div className="text-slate-200 text-lg md:text-xl leading-[1.85] font-serif italic">
                  <IconText>{renderInteractiveText(activeData.text, activeData.glossary)}</IconText>
                </div>

                {/* Grammar note toggle */}
                {activeData.grammarNote && <div className="mt-8 pt-6 border-t border-white/5">
                    <button onClick={() => setShowGrammarNote(p => !p)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">
                      <span className={`transition-transform ${showGrammarNote ? "rotate-90" : ""}`}><IconText>[icon:sparkles]</IconText></span>
                      Grammar note
                    </button>
                    <AnimatePresence>
                      {showGrammarNote && <motion.div initial={{
                  height: 0,
                  opacity: 0
                }} animate={{
                  height: "auto",
                  opacity: 1
                }} exit={{
                  height: 0,
                  opacity: 0
                }} className="overflow-hidden">
                          <div className="mt-4 p-6 bg-indigo-950/50 rounded-2xl border border-indigo-500/20 text-sm text-indigo-100/80 leading-relaxed">
                            <IconText>{activeData.grammarNote}</IconText>
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </div>}
              </div>

              {/* Questions */}
              <div className="space-y-5">
                {activeData.questions.map((q, idx) => <motion.div key={q.id} initial={{
              opacity: 0,
              y: 12
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: idx * 0.06
            }} className="bg-[#0d1526]/70 border border-white/5 rounded-[2rem] p-7 md:p-9">
                    {/* Question header */}
                    <div className="flex items-start gap-4 mb-6">
                      <span className="shrink-0 w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 text-[11px] font-black flex items-center justify-center border border-indigo-500/20">
                        <IconText>{idx + 1}</IconText>
                      </span>
                      <p className="font-bold text-white text-base md:text-lg leading-snug pt-1">
                        <IconText>{q.q}</IconText>
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 pl-12">
                      {q.options.map((opt, oIdx) => {
                  const isSelected = answers[q.id] === opt;
                  return <button key={opt} onClick={() => handleSelect(q.id, opt)} className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl text-[13px] font-semibold text-left border transition-all ${isSelected ? "bg-indigo-600/30 border-indigo-500/60 text-white" : "bg-white/3 border-white/8 text-slate-400 hover:border-indigo-500/30 hover:text-white hover:bg-indigo-500/5"}`}>
                            <span className={`shrink-0 w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center border transition-all ${isSelected ? "bg-indigo-500 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-slate-600"}`}>
                              <IconText>{OPTION_LABELS[oIdx]}</IconText>
                            </span>
                            <IconText>{opt}</IconText>
                          </button>;
                })}
                    </div>
                  </motion.div>)}
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={answeredCount < totalQ} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[11px] transition-all shadow-[0_16px_40px_rgba(79,70,229,0.25)] disabled:opacity-20 disabled:cursor-not-allowed disabled:grayscale active:scale-[0.99]">
                <IconText>{answeredCount < totalQ ? `Answer all questions (${answeredCount}/${totalQ})` : "Submit answers →"}</IconText>
              </button>
            </motion.div>}

          {/* ── RESULTS ── */}
          {showResults && <motion.div key="results" initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              {/* Score card */}
              <div className="bg-[#0d1526] border border-indigo-500/20 rounded-[2.5rem] p-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">
                  Result
                </p>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-7xl md:text-8xl font-black italic tracking-tighter"><IconText>{score}</IconText></span>
                  <span className="text-2xl text-slate-600 font-bold">/ <IconText>{totalQ}</IconText></span>
                </div>
                <p className={`text-lg font-black uppercase italic tracking-tight mb-1 ${feedback.color}`}>
                  <IconText>{feedback.label}</IconText>
                </p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto"><IconText>{feedback.msg}</IconText></p>
              </div>

              {/* Per-question review */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">
                  Question review
                </h3>
                {activeData.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;
              const showExp = revealedExplanations[q.id];
              return <div key={q.id} className={`rounded-[2rem] border p-7 md:p-9 transition-all ${isCorrect ? "bg-emerald-950/30 border-emerald-500/20" : "bg-rose-950/20 border-rose-500/20"}`}>
                      {/* Question */}
                      <div className="flex items-start gap-3 mb-5">
                        <span className={`shrink-0 w-7 h-7 rounded-xl text-[11px] font-black flex items-center justify-center ${isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          <IconText>{isCorrect ? "✓" : "✗"}</IconText>
                        </span>
                        <p className="font-bold text-white text-sm leading-snug pt-1"><IconText>{q.q}</IconText></p>
                      </div>

                      {/* Options review */}
                      <div className="space-y-2 pl-10">
                        {q.options.map((opt, oIdx) => {
                    const isUserPick = opt === userAnswer;
                    const isRight = opt === q.correct;
                    let cls = "bg-white/3 border-white/5 text-slate-600";
                    if (isRight) cls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";else if (isUserPick && !isRight) cls = "bg-rose-500/15 border-rose-500/40 text-rose-300 line-through";
                    return <div key={opt} className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-[12px] font-semibold border ${cls}`}>
                              <span className={`shrink-0 w-5 h-5 rounded-lg text-[9px] font-black flex items-center justify-center ${isRight ? "bg-emerald-500/30 text-emerald-300" : "bg-white/5 text-slate-600"}`}>
                                <IconText>{OPTION_LABELS[oIdx]}</IconText>
                              </span>
                              <IconText>{opt}</IconText>
                              {isRight && <span className="ml-auto text-[9px] font-black text-emerald-500 uppercase tracking-widest">Correct</span>}
                            </div>;
                  })}
                      </div>

                      {/* Explanation toggle */}
                      {q.explanation && <div className="pl-10 mt-4">
                          <button onClick={() => setRevealedExplanations(p => ({
                    ...p,
                    [q.id]: !p[q.id]
                  }))} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                            <span className={`transition-transform ${showExp ? "rotate-90" : ""}`}><IconText>[icon:sparkles]</IconText></span>
                            <IconText>{showExp ? "Hide explanation" : "Why this answer?"}</IconText>
                          </button>
                          <AnimatePresence>
                            {showExp && <motion.div initial={{
                      height: 0,
                      opacity: 0
                    }} animate={{
                      height: "auto",
                      opacity: 1
                    }} exit={{
                      height: 0,
                      opacity: 0
                    }} className="overflow-hidden">
                                <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-white/3 rounded-xl p-4 border border-white/5">
                                  <IconText>{q.explanation}</IconText>
                                </p>
                              </motion.div>}
                          </AnimatePresence>
                        </div>}
                    </div>;
            })}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={() => {
              setAnswers({});
              setShowResults(false);
              setRevealedExplanations({});
              setShowGrammarNote(false);
            }} className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                  Retry this text
                </button>
                <button onClick={handleReset} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_8px_24px_rgba(79,70,229,0.25)]">
                  Choose another →
                </button>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}
