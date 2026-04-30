import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import drillData from "../data/drills.json";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const POLISH_CHARS = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"];

const RANK_SYSTEM = [
  { min: 0,    max: 199,  title: "Nowicjusz", color: "#94a3b8" },
  { min: 200,  max: 499,  title: "Student",   color: "#818cf8" },
  { min: 500,  max: 999,  title: "Mówca",     color: "#34d399" },
  { min: 1000, max: 1999, title: "Znawca",    color: "#f59e0b" },
  { min: 2000, max: 9999, title: "Poliglota", color: "#ef4444" },
];

const STREAK_MESSAGES = [
  null, null,
  "Nieźle!",
  "Trzy z rzędu!",
  "Cztery! Nie zatrzymuj się!",
  "PIĘĆ Z RZĘDU!",
  "SZÓSTKA! Absolutny mistrz!",
  "SIEDEM!!! LEGENDA!",
];

function getRank(xp) {
  return RANK_SYSTEM.find((r) => xp >= r.min && xp <= r.max) || RANK_SYSTEM[RANK_SYSTEM.length - 1];
}

/* ─── Particle Burst ────────────────────────────────────────────────────── */
function ParticleBurst({ active, x, y }) {
  if (!active) return null;
  const particles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 55 + Math.random() * 45;
    return {
      id: i,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color: ["#818cf8", "#6366f1", "#34d399", "#f59e0b", "#c4b5fd"][i % 5],
    };
  });
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.tx, y: p.ty, scale: 0, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            position: "absolute", width: 7, height: 7, borderRadius: "50%",
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating XP Chip ──────────────────────────────────────────────────── */
function FloatingChip({ items }) {
  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: 0, opacity: 1, scale: 0.9 }}
          animate={{ y: -100, opacity: 0, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{
            position: "fixed", left: item.x, top: item.y,
            transform: "translateX(-50%)", zIndex: 9999, pointerEvents: "none",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: item.bonus ? "2.2rem" : "1.7rem",
            fontWeight: 700,
            color: item.bonus ? "#f59e0b" : "#34d399",
            letterSpacing: "-0.01em",
          }}
        >
          +{item.amount} XP{item.bonus ? " ✦" : ""}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/* ─── Progress Ring ─────────────────────────────────────────────────────── */
function ProgressRing({ progress, color, size = 56, stroke = 4, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Waveform ──────────────────────────────────────────────────────────── */
function Waveform({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 28 }}>
      {Array.from({ length: 18 }, (_, i) => (
        <motion.div
          key={i}
          animate={active ? {
            scaleY: [0.15, 0.5 + Math.random() * 0.7, 0.15],
            opacity: [0.4, 1, 0.4],
          } : { scaleY: 0.12, opacity: 0.2 }}
          transition={active ? {
            duration: 0.35 + Math.random() * 0.35,
            repeat: Infinity,
            delay: i * 0.035,
            ease: "easeInOut",
          } : { duration: 0.25 }}
          style={{
            width: 2.5, height: "100%", borderRadius: 2,
            background: active ? "#818cf8" : "rgba(255,255,255,0.12)",
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Typewriter Hint ───────────────────────────────────────────────────── */
function TypewriterText({ text, active }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 42);
    return () => clearInterval(iv);
  }, [text, active]);
  if (!active) return null;
  return (
    <span style={{
      fontFamily: "'Playfair Display', serif",
      fontStyle: "italic",
      fontSize: "1.35rem",
      color: "#34d399",
      letterSpacing: "0.01em",
    }}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.55, repeat: Infinity }}
        style={{ color: "#6ee7b7" }}
      >|</motion.span>
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function PracticeLab() {
  const { user, profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | success | error
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [floatingChips, setFloatingChips] = useState([]);
  const [particles, setParticles] = useState(null);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [streakMsg, setStreakMsg] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false); // ← OFF by default; plays only on button click
  const [speed, setSpeed] = useState(0.8);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const drills = drillData;

  const xp = (profile?.xp || 0) + sessionXp;
  const rank = getRank(xp);
  const rankIdx = RANK_SYSTEM.indexOf(rank);
  const nextRank = RANK_SYSTEM[rankIdx + 1];
  const xpInRank = xp - rank.min;
  const rankRange = (nextRank?.max ?? rank.max) - rank.min;
  const rankProgress = Math.min(100, (xpInRank / rankRange) * 100);

  const currentDrill = drills[currentIndex];
  const totalDrills = drills.length;
  const progressPct = (currentIndex / totalDrills) * 100;

  /* ── Speech ── */
  const speak = useCallback((text, rate = speed) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pl-PL";
    u.rate = rate;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [speed]);

  // Auto-play only fires when the toggle is ON — never on first mount
  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(() => speak(currentDrill.polish, 0.7), 350);
    return () => clearTimeout(t);
  }, [currentIndex, autoPlay]); // intentionally excludes speak to avoid double-trigger

  /* ── Effects ── */
  const triggerChip = (amount, bonus = false, e) => {
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const id = Date.now() + Math.random();
    setFloatingChips((prev) => [...prev, { id, amount, bonus, x, y }]);
    setParticles({ x, y });
    setTimeout(() => {
      setFloatingChips((prev) => prev.filter((c) => c.id !== id));
      setParticles(null);
    }, 1400);
  };

  /* ── Mic ── */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    recognitionRef.current?.abort();
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "pl-PL";
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (ev) => {
      const t = ev.results[0][0].transcript.replace(/\.$/, "");
      setUserInput(t);
      setStatus("idle");
    };
    rec.start();
  };

  /* ── Char inject ── */
  const injectChar = (char) => {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const next = userInput.slice(0, s) + char + userInput.slice(e);
    setUserInput(next);
    if (status !== "idle") setStatus("idle");
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 1, s + 1);
    });
  };

  /* ── Verify ── */
  const handleVerify = async (e) => {
    if (status === "checking" || !userInput.trim()) return;
    setStatus("checking");
    const norm = (s) => s.toLowerCase().replace(/[.,?!;:]/g, "").trim();
    const correct = norm(userInput) === norm(currentDrill.polish);

    setTimeout(async () => {
      if (correct) {
        const earnedXp = showHint ? 5 : 20;
        const isBonus = sessionStreak >= 2;
        const totalEarned = isBonus ? earnedXp + 5 : earnedXp;

        setStatus("success");
        setSessionXp((prev) => prev + totalEarned);
        setSessionStreak((prev) => prev + 1);

        const msg = STREAK_MESSAGES[Math.min(sessionStreak + 1, STREAK_MESSAGES.length - 1)];
        if (msg) { setStreakMsg(msg); setTimeout(() => setStreakMsg(null), 2200); }

        triggerChip(totalEarned, isBonus, e);
        speak("Świetnie!", 1.1);

        if (user) {
          await updateDoc(doc(db, "pending_users", user.uid), {
            xp: increment(totalEarned),
            streak: increment(1),
          });
        }
      } else {
        setStatus("error");
        setSessionStreak(0);
        speak("Spróbuj ponownie.", 0.75);
        if (user) await updateDoc(doc(db, "pending_users", user.uid), { streak: 0 });
      }
    }, 480);
  };

  /* ── Next ── */
  const nextDrill = () => {
    if (currentIndex + 1 < totalDrills) {
      setStatus("idle");
      setUserInput("");
      setShowHint(false);
      setShowTip(false);
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setIsFinished(true);
    }
  };

  /* ── Finished Screen ── */
  if (isFinished) return (
    <div className="w-full bg-[#020617] min-h-screen text-white font-sans flex items-center justify-center p-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="bg-[#0d1526] border border-indigo-500/20 rounded-[2.5rem] p-12 text-center max-w-sm w-full shadow-2xl"
      >
        <div className="text-7xl mb-6">🏆</div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">Sesja ukończona</p>
        <h2 className="text-4xl font-bold italic mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Brawo!
        </h2>
        <p className="text-slate-500 text-sm mb-2">Zdobyte XP w tej sesji</p>
        <p className="text-5xl font-black text-indigo-400 mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          +{sessionXp}
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0); setUserInput(""); setStatus("idle");
            setShowHint(false); setSessionXp(0); setSessionStreak(0); setIsFinished(false);
          }}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-[0_12px_30px_rgba(79,70,229,0.3)] active:scale-95"
        >
          Zacznij od nowa
        </button>
      </motion.div>
    </div>
  );

  /* ── Border color by status ── */
  const cardBorder =
    status === "success" ? "border-emerald-500/30 bg-emerald-950/20" :
    status === "error"   ? "border-rose-500/30 bg-rose-950/15" :
                           "border-white/5 bg-[#0d1526]";

  return (
    <div className="w-full bg-[#020617] min-h-screen text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        .shake { animation: shake 0.3s ease; }
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {particles && <ParticleBurst active x={particles.x} y={particles.y} />}
      <FloatingChip items={floatingChips} />

      {/* Streak banner */}
      <AnimatePresence>
        {streakMsg && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[8000] px-6 py-2.5 rounded-full bg-amber-500/95 text-black font-black uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(245,158,11,0.5)] pointer-events-none whitespace-nowrap"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {streakMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-5 pb-24 pt-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── STICKY HEADER ── */}
        <header className="sticky top-0 z-50 flex items-center justify-between py-4 mb-5 backdrop-blur-md bg-[#020617]/85 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ProgressRing progress={rankProgress} color={rank.color} size={48} stroke={3.5}>
              <span className="text-[9px] font-black" style={{ color: rank.color }}>{xp}</span>
            </ProgressRing>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-0.5">Ranga</p>
              <p className="text-sm font-bold" style={{ color: rank.color, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                {rank.title}
              </p>
            </div>
          </div>

          {/* Session XP */}
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-0.5">Sesja</p>
            <motion.p
              key={sessionXp}
              initial={{ scale: 1.4, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#fff" }}
              transition={{ duration: 0.35 }}
              className="text-xl font-black"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              +{sessionXp}
            </motion.p>
          </div>

          {/* Streak */}
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-0.5">Seria</p>
            <div className="flex items-center gap-1.5 justify-end">
              <motion.span
                key={sessionStreak}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xl font-black"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: sessionStreak >= 5 ? "#ef4444" : sessionStreak >= 3 ? "#f59e0b" : "#fff",
                }}
              >
                {sessionStreak}
              </motion.span>
              <motion.span
                animate={sessionStreak >= 3 ? { rotate: [-8, 8, -8, 0] } : {}}
                transition={{ duration: 0.5, repeat: sessionStreak >= 3 ? Infinity : 0, repeatDelay: 1.2 }}
                className="text-base"
              >🔥</motion.span>
            </div>
          </div>
        </header>

        {/* ── PROGRESS BAR ── */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Ćwiczenie {currentIndex + 1} / {totalDrills}
            </span>
            <span className="text-[10px] font-black text-slate-600">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-indigo-500"
            />
          </div>
          {/* Dot markers */}
          <div className="flex justify-between mt-2 px-0.5">
            {Array.from({ length: Math.min(totalDrills, 10) }, (_, i) => {
              const idx = Math.round((i / 9) * (totalDrills - 1));
              const done = idx < currentIndex;
              const curr = idx === currentIndex;
              return (
                <motion.div
                  key={i}
                  animate={curr ? { scale: [1, 1.35, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.4, repeatDelay: 0.6 }}
                  style={{
                    width: curr ? 9 : 5, height: curr ? 9 : 5,
                    borderRadius: "50%",
                    background: done ? "#818cf8" : curr ? "#6366f1" : "rgba(255,255,255,0.07)",
                    transition: "all 0.35s",
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <motion.div
          layout
          className={`rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${cardBorder} ${status === "error" ? "shake" : ""}`}
        >
          {/* Top pills */}
          <div className="flex justify-between items-center px-7 pt-6">
            <span className="text-[9px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {currentDrill.level}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-xl bg-white/4 border border-white/8 text-slate-500">
              {currentDrill.category}
            </span>
          </div>

          <div className="px-7 pb-7 pt-5 flex flex-col gap-5">

            {/* English prompt */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-3">
                Przetłumacz na polski
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-white text-xl leading-snug"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                  "{currentDrill.english}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Audio row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2.5">
                {/* Play */}
                <motion.button
                  whileTap={{ scale: 0.91 }}
                  onClick={() => speak(currentDrill.polish)}
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center text-lg transition-all border ${
                    isSpeaking
                      ? "bg-indigo-500/25 border-indigo-500/50"
                      : "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
                  }`}
                  title="Odsłuchaj"
                >
                  🔊
                </motion.button>

                {/* Slow */}
                <motion.button
                  whileTap={{ scale: 0.91 }}
                  onClick={() => speak(currentDrill.polish, 0.45)}
                  className="h-11 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/4 border border-white/8 hover:border-white/15 hover:text-slate-300 transition-all"
                >
                  0.5×
                </motion.button>
              </div>

              <Waveform active={isSpeaking || isListening} />

              {/* Mic */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={startListening}
                animate={isListening ? { boxShadow: ["0 0 0px #6366f1", "0 0 20px #6366f1", "0 0 0px #6366f1"] } : {}}
                transition={{ duration: 0.75, repeat: Infinity }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all border ${
                  isListening
                    ? "bg-indigo-500/30 border-indigo-400/60"
                    : "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
                }`}
              >
                {isListening ? "⏺" : "🎙️"}
              </motion.button>
            </div>

            {/* Hint area */}
            <div className="min-h-[44px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {showHint ? (
                  <TypewriterText text={currentDrill.polish} active={showHint} />
                ) : (
                  <motion.button
                    key="hint-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowHint(true)}
                    className="border border-dashed border-white/10 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all"
                  >
                    Pokaż podpowiedź (−15 XP)
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                autoFocus
                placeholder="Wpisz po polsku…"
                onKeyDown={(e) => e.key === "Enter" && (status === "success" ? nextDrill() : handleVerify(e))}
                onChange={(e) => { setUserInput(e.target.value); if (status !== "idle") setStatus("idle"); }}
                className="w-full py-4 px-5 rounded-xl text-white text-base font-medium outline-none transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${
                    status === "success" ? "rgba(52,211,153,0.5)" :
                    status === "error"   ? "rgba(239,68,68,0.5)" :
                    "rgba(255,255,255,0.09)"
                  }`,
                  caretColor: "#818cf8",
                  boxShadow: status === "success" ? "0 0 0 3px rgba(52,211,153,0.12)" :
                             status === "error"   ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
                }}
              />
              {userInput.length > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-700 font-bold">
                  {userInput.length}
                </span>
              )}
            </div>

            {/* Polish special chars */}
            <div className="flex flex-wrap gap-2 justify-center">
              {POLISH_CHARS.map((char) => (
                <motion.button
                  key={char}
                  whileTap={{ scale: 0.82 }}
                  onClick={() => injectChar(char)}
                  className="w-10 h-10 rounded-xl bg-white/4 border border-white/8 hover:bg-indigo-500/10 hover:border-indigo-500/25 text-indigo-400 font-bold text-sm transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {char}
                </motion.button>
              ))}
            </div>

            {/* CTA button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={(e) => status === "success" ? nextDrill() : handleVerify(e)}
              disabled={!userInput.trim() && status !== "success"}
              className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.35em] text-[11px] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background:
                  status === "success" ? "linear-gradient(135deg,#10b981,#059669)" :
                  status === "checking" ? "rgba(255,255,255,0.06)" :
                  !userInput.trim() ? "rgba(255,255,255,0.04)" :
                  "linear-gradient(135deg,#6366f1,#4f46e5)",
                boxShadow:
                  status === "success" ? "0 10px 30px rgba(16,185,129,0.3)" :
                  userInput.trim() && status !== "success" ? "0 10px 30px rgba(99,102,241,0.3)" :
                  "none",
                color: !userInput.trim() && status !== "success" ? "rgba(148,163,184,0.3)" : "#fff",
              }}
            >
              {status === "checking" ? "Sprawdzam…" :
               status === "success"  ? "Następne →" :
               "Sprawdź"}
            </motion.button>
          </div>
        </motion.div>

        {/* ── GRAMMAR TIP ── */}
        {currentDrill.tip && (
          <motion.div className="mt-3">
            <button
              onClick={() => setShowTip((t) => !t)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl hover:bg-indigo-500/10 transition-all"
            >
              <span className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <span className="text-base">💡</span> Wskazówka gramatyczna
              </span>
              <motion.span
                animate={{ rotate: showTip ? 180 : 0 }}
                className="text-indigo-500 text-xs"
              >▼</motion.span>
            </button>
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-5 py-4 bg-indigo-500/5 border border-indigo-500/10 border-t-0 rounded-b-2xl text-sm text-indigo-100/70 leading-relaxed"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}
                  >
                    {currentDrill.tip}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── CONTROLS ROW ── */}
        <div className="flex items-center justify-between mt-5 px-1">
          {/* Auto-play toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Auto-play
            </span>
            <motion.button
              onClick={() => setAutoPlay((a) => !a)}
              className="relative"
              style={{
                width: 42, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                background: autoPlay ? "#6366f1" : "rgba(255,255,255,0.08)",
                transition: "background 0.3s",
              }}
            >
              <motion.div
                animate={{ x: autoPlay ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  position: "absolute", top: 2, width: 18, height: 18,
                  borderRadius: "50%", background: "#fff",
                }}
              />
            </motion.button>
          </div>

          {/* Speed toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tempo</span>
            {[0.6, 0.8, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${
                  speed === s
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "bg-white/4 border-white/8 text-slate-600 hover:text-slate-400"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* ── MUSIC BANNER ── */}
        <motion.a
          href="/polish-music"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="block mt-4 no-underline"
        >
          <motion.div
            whileHover={{ borderColor: "rgba(129,140,248,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between gap-3 px-5 py-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl cursor-pointer transition-all hover:bg-indigo-500/8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shrink-0">
                🎵
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-500/70 mb-0.5">
                  Tip — Boost your Polish
                </p>
                <p className="text-sm font-semibold text-slate-300">
                  Listen to Polish music →
                </p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              Explore
            </span>
          </motion.div>
        </motion.a>
      </div>
    </div>
  );
}
