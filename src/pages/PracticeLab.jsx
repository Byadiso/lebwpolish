import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import drillData from "../data/drills.json";

const POLISH_CHARS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

const RANK_SYSTEM = [
  { min: 0,    max: 199,  title: "Nowicjusz",   color: "#94a3b8", glow: "rgba(148,163,184,0.4)" },
  { min: 200,  max: 499,  title: "Student",     color: "#60a5fa", glow: "rgba(96,165,250,0.4)"  },
  { min: 500,  max: 999,  title: "Mówca",       color: "#34d399", glow: "rgba(52,211,153,0.4)"  },
  { min: 1000, max: 1999, title: "Znawca",      color: "#f59e0b", glow: "rgba(245,158,11,0.4)"  },
  { min: 2000, max: 9999, title: "Poliglota",   color: "#ef4444", glow: "rgba(239,68,68,0.4)"   },
];

const STREAK_MESSAGES = [
  null, null,
  "Nieźle! 🔥",
  "Trzy z rzędu! ⚡",
  "Cztery! Nie zatrzymuj się! 💥",
  "PIĘĆ Z RZĘDU! Jesteś niesamowity! 🚀",
  "SZÓSTKA! Absolutny mistrz! 🏆",
  "SIEDEM!!! LEGENDA! 👑",
];

function getRank(xp) {
  return RANK_SYSTEM.find(r => xp >= r.min && xp <= r.max) || RANK_SYSTEM[RANK_SYSTEM.length - 1];
}

// ── Particle burst effect ─────────────────────────────────────────────────────
function ParticleBurst({ active, x, y }) {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 60 + Math.random() * 50;
    return {
      id: i,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color: ["#ef4444","#f59e0b","#10b981","#3b82f6","#a78bfa"][i % 5],
    };
  });
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.tx, y: p.ty, scale: 0, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute", width: 8, height: 8, borderRadius: "50%",
            background: p.color, boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Floating XP chip ──────────────────────────────────────────────────────────
function FloatingChip({ items }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.div
          key={item.id}
          initial={{ y: 0, opacity: 1, scale: 0.8 }}
          animate={{ y: -120, opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "fixed", left: item.x, top: item.y,
            transform: "translateX(-50%)",
            zIndex: 9999, pointerEvents: "none",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: item.bonus ? "2.8rem" : "2rem",
            color: item.bonus ? "#f59e0b" : "#10b981",
            textShadow: `0 0 20px ${item.bonus ? "#f59e0b" : "#10b981"}`,
            letterSpacing: "0.05em",
          }}
        >
          +{item.amount} XP{item.bonus ? " 🔥" : ""}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// ── Slot-machine streak counter ────────────────────────────────────────────────
function StreakCounter({ streak }) {
  const digits = String(streak).padStart(2, "0").split("");
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {digits.map((d, i) => (
        <motion.div
          key={`${i}-${d}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: i * 0.05 }}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2.2rem", lineHeight: 1,
            color: streak >= 5 ? "#ef4444" : streak >= 3 ? "#f59e0b" : "#fff",
            textShadow: streak >= 3 ? `0 0 20px ${streak >= 5 ? "#ef4444" : "#f59e0b"}` : "none",
          }}
        >
          {d}
        </motion.div>
      ))}
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ progress, color, size = 64, stroke = 5, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ── Waveform visualiser (animated bars) ───────────────────────────────────────
function Waveform({ active }) {
  const bars = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
      {bars.map(i => (
        <motion.div
          key={i}
          animate={active ? {
            scaleY: [0.2, 0.6 + Math.random() * 0.8, 0.2],
            opacity: [0.5, 1, 0.5],
          } : { scaleY: 0.15, opacity: 0.3 }}
          transition={active ? {
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut",
          } : { duration: 0.3 }}
          style={{
            width: 3, height: "100%", borderRadius: 2,
            background: active ? "#ef4444" : "rgba(255,255,255,0.15)",
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

// ── Typewriter reveal for hints ───────────────────────────────────────────────
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
    }, 45);
    return () => clearInterval(iv);
  }, [text, active]);
  if (!active) return null;
  return (
    <span style={{
      fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.06em",
      color: "#10b981", textShadow: "0 0 20px rgba(16,185,129,0.6)",
    }}>
      {displayed}<motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.6, repeat: Infinity }}>|</motion.span>
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
  const [playedIndexes, setPlayedIndexes] = useState(new Set());
  const [autoPlay, setAutoPlay] = useState(true);
  const [speed, setSpeed] = useState(0.8);
  const [showSuccess, setShowSuccess] = useState(false);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const drills = drillData;

  const xp = (profile?.xp || 0) + sessionXp;
  const streak = profile?.streak || 0;
  const rank = getRank(xp);
  const xpForNextRank = RANK_SYSTEM.find(r => xp < r.max)?.max ?? 9999;
  const xpInRank = xp - rank.min;
  const rankRange = (RANK_SYSTEM.find(r => xp < r.max)?.max ?? 9999) - rank.min;
  const rankProgress = Math.min(100, (xpInRank / rankRange) * 100);

  const currentDrill = drills[currentIndex];
  const totalDrills = drills.length;

  const speak = useCallback((text, rate = speed) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pl-PL"; u.rate = rate;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [speed]);

  // Auto-play new drill audio
  useEffect(() => {
    if (autoPlay && currentDrill) {
      const t = setTimeout(() => speak(currentDrill.polish, 0.7), 400);
      return () => clearTimeout(t);
    }
  }, [currentIndex, autoPlay]);

  const triggerChip = (amount, bonus = false, e) => {
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const id = Date.now() + Math.random();
    setFloatingChips(prev => [...prev, { id, amount, bonus, x, y }]);
    setParticles({ x, y });
    setTimeout(() => {
      setFloatingChips(prev => prev.filter(c => c.id !== id));
      setParticles(null);
    }, 1400);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) { recognitionRef.current.abort(); }
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

  const handleVerify = async (e) => {
    if (status === "checking" || !userInput.trim()) return;
    setStatus("checking");
    const norm = s => s.toLowerCase().replace(/[.,?!;:]/g, "").trim();
    const correct = norm(userInput) === norm(currentDrill.polish);

    setTimeout(async () => {
      if (correct) {
        const earnedXp = showHint ? 5 : 20;
        const isBonus = sessionStreak >= 2;
        const totalEarned = isBonus ? earnedXp + 5 : earnedXp;

        setStatus("success");
        setShowSuccess(true);
        setSessionXp(prev => prev + totalEarned);
        setSessionStreak(prev => prev + 1);

        const msg = STREAK_MESSAGES[Math.min(sessionStreak + 1, STREAK_MESSAGES.length - 1)];
        if (msg) { setStreakMsg(msg); setTimeout(() => setStreakMsg(null), 2000); }

        triggerChip(totalEarned, isBonus, e);
        speak("Świetnie!", 1.2);

        if (user) {
          const ref = doc(db, "pending_users", user.uid);
          await updateDoc(ref, { xp: increment(totalEarned), streak: increment(1) });
        }

        setTimeout(() => setShowSuccess(false), 1200);
      } else {
        setStatus("error");
        setSessionStreak(0);
        speak("Spróbuj ponownie.", 0.75);
        if (user) await updateDoc(doc(db, "pending_users", user.uid), { streak: 0 });
      }
    }, 500);
  };

  const nextDrill = () => {
    if (currentIndex + 1 < totalDrills) {
      setStatus("idle");
      setUserInput("");
      setShowHint(false);
      setShowTip(false);
      setPlayedIndexes(prev => new Set([...prev, currentIndex]));
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsFinished(true);
    }
  };

  const progressPct = ((currentIndex) / totalDrills) * 100;

  if (isFinished) return (
    <div style={{
      minHeight: "100vh", background: "#020617", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "2rem",
      fontFamily: "'Bebas Neue', sans-serif",
    }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          textAlign: "center", maxWidth: 400,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(16,185,129,0.4)",
          borderRadius: 32, padding: "3rem 2rem",
          boxShadow: "0 0 80px rgba(16,185,129,0.15)",
        }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🏆</div>
        <div style={{ fontSize: "3.5rem", color: "#10b981", textShadow: "0 0 30px #10b981", marginBottom: 8 }}>UKOŃCZONO!</div>
        <div style={{ fontFamily: "sans-serif", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Session XP earned: <strong style={{ color: "#f59e0b" }}>+{sessionXp}</strong>
        </div>
        <button
          onClick={() => { setCurrentIndex(0); setUserInput(""); setStatus("idle"); setShowHint(false); setSessionXp(0); setSessionStreak(0); setIsFinished(false); }}
          style={{
            width: "100%", padding: "1.1rem", borderRadius: 16,
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none", color: "#fff", cursor: "pointer",
            fontSize: "1.4rem", fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "0.1em", boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
          }}
        >
          Zacznij od nowa
        </button>
      </motion.div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes successPulse { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.6)} 70%{box-shadow:0 0 0 20px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .shake { animation: shake 0.35s ease; }
        .success-ring { animation: successPulse 0.6s ease-out; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Particles */}
      {particles && <ParticleBurst active={true} x={particles.x} y={particles.y} />}
      <FloatingChip items={floatingChips} />

      {/* Streak message banner */}
      <AnimatePresence>
        {streakMsg && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            style={{
              position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
              zIndex: 8000, background: "rgba(245,158,11,0.95)",
              borderRadius: 9999, padding: "0.5rem 2rem",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem",
              letterSpacing: "0.08em", color: "#000",
              boxShadow: "0 0 40px rgba(245,158,11,0.6)",
              pointerEvents: "none", whiteSpace: "nowrap",
            }}
          >
            {streakMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem 8rem" }}>

        {/* ── HUD ROW ── */}
        <header style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          {/* Rank ring */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ProgressRing progress={rankProgress} color={rank.color} size={52} stroke={4}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.7rem", color: rank.color }}>{xp}</span>
            </ProgressRing>
            <div>
              <div style={{ fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)", marginBottom: 2 }}>Ranga</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: rank.color, textShadow: `0 0 12px ${rank.glow}`, letterSpacing: "0.06em" }}>{rank.title}</div>
            </div>
          </div>

          {/* Center: session XP */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(148,163,184,0.4)" }}>Sesja</div>
            <motion.div
              key={sessionXp}
              initial={{ scale: 1.5, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#fff" }}
              transition={{ duration: 0.4 }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", lineHeight: 1, letterSpacing: "0.04em" }}
            >
              +{sessionXp}
            </motion.div>
            <div style={{ fontSize: "0.5rem", color: "rgba(148,163,184,0.4)", fontWeight: 700 }}>XP</div>
          </div>

          {/* Streak */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <div style={{ fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)" }}>Seria</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StreakCounter streak={sessionStreak} />
              <motion.span
                animate={sessionStreak >= 3 ? { scale: [1, 1.3, 1], rotate: [-10, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: sessionStreak >= 3 ? Infinity : 0, repeatDelay: 1 }}
                style={{ fontSize: "1.2rem" }}
              >🔥</motion.span>
            </div>
          </div>
        </header>

        {/* ── PROGRESS BAR ── */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.4)" }}>
              Ćwiczenie {currentIndex + 1} z {totalDrills}
            </span>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(148,163,184,0.4)" }}>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 9999, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: 9999,
                background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)",
                boxShadow: "0 0 10px rgba(239,68,68,0.5)",
              }}
            />
          </div>
          {/* Dot markers */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 2px" }}>
            {Array.from({ length: Math.min(totalDrills, 10) }, (_, i) => {
              const idx = Math.round((i / 9) * (totalDrills - 1));
              const done = idx < currentIndex;
              const curr = idx === currentIndex;
              return (
                <motion.div key={i}
                  animate={curr ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                  style={{
                    width: curr ? 10 : 6, height: curr ? 10 : 6, borderRadius: "50%",
                    background: done ? "#10b981" : curr ? "#ef4444" : "rgba(255,255,255,0.08)",
                    boxShadow: curr ? "0 0 8px #ef4444" : done ? "0 0 6px #10b981" : "none",
                    transition: "all 0.4s",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <motion.div
          layout
          className={status === "error" ? "shake" : status === "success" ? "success-ring" : ""}
          style={{
            borderRadius: 32,
            border: `1px solid ${
              status === "success" ? "rgba(16,185,129,0.4)" :
              status === "error"   ? "rgba(239,68,68,0.4)" :
              "rgba(255,255,255,0.06)"
            }`,
            background: status === "success" ? "rgba(16,185,129,0.06)" :
                        status === "error"   ? "rgba(239,68,68,0.06)" :
                        "rgba(255,255,255,0.025)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            transition: "border-color 0.3s, background 0.3s",
          }}
        >
          {/* Card top bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "1rem 1.5rem 0",
          }}>
            <span style={{
              padding: "3px 10px", borderRadius: 9999, fontSize: "0.6rem",
              fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#ef4444",
            }}>
              {currentDrill.level}
            </span>
            <span style={{
              padding: "3px 10px", borderRadius: 9999, fontSize: "0.6rem",
              fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(148,163,184,0.6)",
            }}>
              {currentDrill.category}
            </span>
          </div>

          <div style={{ padding: "1.25rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* English prompt */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 20, padding: "1.25rem 1.25rem",
            }}>
              <div style={{ fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(148,163,184,0.4)", marginBottom: "0.5rem" }}>
                Przetłumacz na polski
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(1.3rem, 5vw, 1.7rem)",
                    lineHeight: 1.25,
                    letterSpacing: "0.04em",
                    color: "#fff",
                  }}
                >
                  "{currentDrill.english}"
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Audio controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Play button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speak(currentDrill.polish)}
                  style={{
                    width: 48, height: 48, borderRadius: 14, border: "none", cursor: "pointer",
                    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.3rem",
                    boxShadow: isSpeaking ? "0 0 20px rgba(239,68,68,0.5)" : "none",
                    transition: "box-shadow 0.3s",
                  }}
                  title="Odsłuchaj"
                >🔊</motion.button>

                {/* Slow button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speak(currentDrill.polish, 0.45)}
                  style={{
                    height: 48, padding: "0 14px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(148,163,184,0.6)", fontSize: "0.65rem", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                  }}
                  title="Wolno"
                >
                  0.5×
                </motion.button>
              </div>

              {/* Waveform */}
              <Waveform active={isSpeaking || isListening} />

              {/* Mic button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={startListening}
                animate={isListening ? { boxShadow: ["0 0 0px #ef4444", "0 0 24px #ef4444", "0 0 0px #ef4444"] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: isListening
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, #b91c1c, #7f1d1d)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                  boxShadow: isListening ? "0 0 30px rgba(239,68,68,0.7)" : "0 4px 20px rgba(239,68,68,0.3)",
                  transition: "background 0.3s",
                }}
              >
                {isListening ? "⏺" : "🎙️"}
              </motion.button>
            </div>

            {/* Hint area */}
            <div style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    style={{
                      background: "none", border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: 9999, padding: "0.4rem 1.2rem",
                      color: "rgba(148,163,184,0.35)", cursor: "pointer",
                      fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(148,163,184,0.7)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(148,163,184,0.35)"; }}
                  >
                    Pokaż podpowiedź (−15 XP)
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Text input */}
            <div style={{ position: "relative" }}>
              <motion.input
                ref={inputRef}
                type="text"
                value={userInput}
                onKeyDown={e => e.key === "Enter" && (status === "success" ? nextDrill() : handleVerify(e))}
                onChange={e => { setUserInput(e.target.value); if (status !== "idle") setStatus("idle"); }}
                placeholder="Wpisz po polsku…"
                autoFocus
                animate={status === "success" ? { borderColor: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" } :
                         status === "error"   ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.2)" } :
                         { borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 0 0 0px transparent" }}
                style={{
                  width: "100%", padding: "1rem 1.25rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.05rem", fontWeight: 600,
                  outline: "none", caretColor: "#ef4444",
                  transition: "border-color 0.3s",
                }}
              />
              {/* Char counter */}
              {userInput.length > 0 && (
                <div style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  fontSize: "0.6rem", color: "rgba(148,163,184,0.3)", fontWeight: 700,
                }}>
                  {userInput.length}
                </div>
              )}
            </div>

            {/* Polish special chars */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
              {POLISH_CHARS.map(char => (
                <motion.button
                  key={char}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => injectChar(char)}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#ef4444", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.15)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >
                  {char}
                </motion.button>
              ))}
            </div>

            {/* CTA button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={e => status === "success" ? nextDrill() : handleVerify(e)}
              disabled={!userInput.trim() && status !== "success"}
              style={{
                width: "100%", padding: "1.1rem",
                borderRadius: 18, border: "none", cursor: "pointer",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.5rem", letterSpacing: "0.08em",
                transition: "all 0.3s",
                background: status === "success"
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : status === "checking"
                  ? "rgba(255,255,255,0.08)"
                  : !userInput.trim()
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: !userInput.trim() && status !== "success" ? "rgba(148,163,184,0.3)" : "#fff",
                boxShadow: status === "success"
                  ? "0 8px 32px rgba(16,185,129,0.4)"
                  : userInput.trim() && status !== "success"
                  ? "0 8px 32px rgba(239,68,68,0.35)"
                  : "none",
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
          <motion.div style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowTip(t => !t)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1.25rem",
                background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#818cf8" }}>
                <span>💡</span> Wskazówka gramatyczna
              </span>
              <motion.span
                animate={{ rotate: showTip ? 180 : 0 }}
                style={{ color: "#818cf8", fontSize: "0.8rem" }}
              >▼</motion.span>
            </button>
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    padding: "1rem 1.25rem",
                    background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)",
                    borderTop: "none", borderRadius: "0 0 16px 16px",
                    fontSize: "0.85rem", lineHeight: 1.7, color: "rgba(199,210,254,0.8)",
                    fontStyle: "italic",
                  }}>
                    {currentDrill.tip}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── AUTO-PLAY TOGGLE ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.4)" }}>
            Auto-play audio
          </span>
          <motion.button
            onClick={() => setAutoPlay(a => !a)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
              background: autoPlay ? "#ef4444" : "rgba(255,255,255,0.1)",
              position: "relative", transition: "background 0.3s",
              boxShadow: autoPlay ? "0 0 12px rgba(239,68,68,0.4)" : "none",
            }}
          >
            <motion.div
              animate={{ x: autoPlay ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{
                position: "absolute", top: 2, width: 20, height: 20,
                borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            />
          </motion.button>

          
        </div>
        {/* ── POLISH MUSIC BANNER ── */}
<motion.a
  href="/polish-music"
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.4 }}
  style={{
    display: "block",
    textDecoration: "none",
    marginTop: 12,
  }}
>
  <motion.div
    whileHover={{ borderColor: "rgba(168,85,247,0.5)", background: "linear-gradient(135deg,rgba(168,85,247,0.12),rgba(239,68,68,0.08))" }}
    whileTap={{ scale: 0.98 }}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "0.85rem 1.25rem",
      background: "linear-gradient(135deg,rgba(168,85,247,0.07),rgba(239,68,68,0.05))",
      border: "1px solid rgba(168,85,247,0.22)",
      borderRadius: 16,
      cursor: "pointer",
      transition: "all 0.25s",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: "rgba(168,85,247,0.14)",
        border: "1px solid rgba(168,85,247,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.2rem",
      }}>🎵</div>
      <div>
        <div style={{
          fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.18em", color: "rgba(168,85,247,0.7)", marginBottom: 2,
        }}>
          Tip — Boost your Polish
        </div>
        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
          Listen to Polish music →
        </div>
      </div>
    </div>

    <div style={{
      flexShrink: 0,
      padding: "4px 10px", borderRadius: 9999,
      background: "rgba(168,85,247,0.1)",
      border: "1px solid rgba(168,85,247,0.22)",
      fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "rgba(168,85,247,0.75)",
      display: "flex", alignItems: "center", gap: 4,
    }}>
      Explore
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </motion.div>
</motion.a>

      </div>
    </div>
  );
}
