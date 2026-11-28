import PolishListen from '../components/PolishListen';
import { playAudio } from '../lib/polishAudio';
import "./PracticeLab.css";
import IconText from "../components/IconText";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import drillData from "../data/drills.json";
import { matchesTranslation } from "../lib/translationAnswers";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const POLISH_CHARS = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"];
const RANK_SYSTEM = [{
  min: 0,
  max: 199,
  title: "Nowicjusz",
  color: "#94a3b8"
}, {
  min: 200,
  max: 499,
  title: "Student",
  color: "#818cf8"
}, {
  min: 500,
  max: 999,
  title: "Mówca",
  color: "#34d399"
}, {
  min: 1000,
  max: 1999,
  title: "Znawca",
  color: "#f59e0b"
}, {
  min: 2000,
  max: 9999,
  title: "Poliglota",
  color: "#ef4444"
}];
const STREAK_MESSAGES = [null, null, "Nieźle!", "Trzy z rzędu!", "Cztery! Nie zatrzymuj się!", "PIĘĆ Z RZĘDU!", "SZÓSTKA! Absolutny mistrz!", "SIEDEM!!! LEGENDA!"];
function getRank(xp) {
  return RANK_SYSTEM.find(r => xp >= r.min && xp <= r.max) || RANK_SYSTEM[RANK_SYSTEM.length - 1];
}

/* ─── Particle Burst ────────────────────────────────────────────────────── */
function ParticleBurst({
  active,
  x,
  y
}) {
  if (!active) return null;
  const particles = Array.from({
    length: 14
  }, (_, i) => {
    const angle = i / 14 * Math.PI * 2;
    const dist = 55 + Math.random() * 45;
    return {
      id: i,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color: ["#dc2626", "#172b45", "#15803d", "#f59e0b", "#fca5a5"][i % 5]
    };
  });
  return <div style={{
    position: "fixed",
    left: x,
    top: y,
    pointerEvents: "none",
    zIndex: 9999
  }}>
      {particles.map(p => <motion.div key={p.id} initial={{
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1
    }} animate={{
      x: p.tx,
      y: p.ty,
      scale: 0,
      opacity: 0
    }} transition={{
      duration: 0.65,
      ease: "easeOut"
    }} style={{
      position: "absolute",
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: p.color
    }} />)}
    </div>;
}

/* ─── Floating XP Chip ──────────────────────────────────────────────────── */
function FloatingChip({
  items
}) {
  return <AnimatePresence>
      {items.map(item => <motion.div key={item.id} initial={{
      y: 0,
      opacity: 1,
      scale: 0.9
    }} animate={{
      y: -100,
      opacity: 0,
      scale: 1.15
    }} exit={{
      opacity: 0
    }} transition={{
      duration: 1.1,
      ease: "easeOut"
    }} style={{
      position: "fixed",
      left: item.x,
      top: item.y,
      transform: "translateX(-50%)",
      zIndex: 9999,
      pointerEvents: "none",
      fontFamily: "inherit",
      fontStyle: "italic",
      fontSize: item.bonus ? "2.2rem" : "1.7rem",
      fontWeight: 700,
      color: item.bonus ? "#92400e" : "#15803d",
      letterSpacing: "-0.01em"
    }}>
          +<IconText>{item.amount}</IconText> XP<IconText>{item.bonus ? " ✦" : ""}</IconText>
        </motion.div>)}
    </AnimatePresence>;
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function PracticeLab() {
  const {
    user,
    profile
  } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | success | error
  const [isListening, setIsListening] = useState(false);

  const [showHint, setShowHint] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [floatingChips, setFloatingChips] = useState([]);
  const [particles, setParticles] = useState(null);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [streakMsg, setStreakMsg] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false); // ← OFF by default; plays only on button click
  const [speed, setSpeed] = useState(1);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const drills = drillData;
  const xp = (profile?.xp || 0) + sessionXp;
  const rank = getRank(xp);
  const rankIdx = RANK_SYSTEM.indexOf(rank);
  const nextRank = RANK_SYSTEM[rankIdx + 1];
  const xpInRank = xp - rank.min;
  const rankRange = (nextRank?.max ?? rank.max) - rank.min;
  const rankProgress = Math.min(100, xpInRank / rankRange * 100);
  const currentDrill = drills[currentIndex];
  const totalDrills = drills.length;

  /* ── Speech ── */
  const speak = useCallback((text, rate = speed) => {
    playAudio(text,{rate});
  }, [speed]);

  // Auto-play only fires when the toggle is ON — never on first mount
  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(() => speak(currentDrill.polish, 1), 350);
    return () => clearTimeout(t);
  }, [currentIndex, autoPlay]); // intentionally excludes speak to avoid double-trigger

  /* ── Effects ── */
  const triggerChip = (amount, bonus = false, e) => {
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const id = Date.now() + Math.random();
    setFloatingChips(prev => [...prev, {
      id,
      amount,
      bonus,
      x,
      y
    }]);
    setParticles({
      x,
      y
    });
    setTimeout(() => {
      setFloatingChips(prev => prev.filter(c => c.id !== id));
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
    rec.onresult = ev => {
      const t = ev.results[0][0].transcript.replace(/\.$/, "");
      setUserInput(t);
      setStatus("idle");
    };
    rec.start();
  };

  /* ── Char inject ── */
  const injectChar = char => {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart,
      e = el.selectionEnd;
    const next = userInput.slice(0, s) + char + userInput.slice(e);
    setUserInput(next);
    if (status !== "idle") setStatus("idle");
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 1, s + 1);
    });
  };

  /* ── Verify ── */
  const handleVerify = async e => {
    if (status === "checking" || status === "success" || !userInput.trim()) return;
    setStatus("checking");
    const correct = matchesTranslation(userInput, currentDrill);
    setTimeout(async () => {
      if (correct) {
        const earnedXp = showHint ? 5 : 20;
        const isBonus = sessionStreak >= 2;
        const totalEarned = isBonus ? earnedXp + 5 : earnedXp;
        setStatus("success");
        setSessionXp(prev => prev + totalEarned);
        setSessionStreak(prev => prev + 1);
        const msg = STREAK_MESSAGES[Math.min(sessionStreak + 1, STREAK_MESSAGES.length - 1)];
        if (msg) {
          setStreakMsg(msg);
          setTimeout(() => setStreakMsg(null), 2200);
        }
        triggerChip(totalEarned, isBonus, e);
        speak("Świetnie!", 1);
        if (user && db) {
          try { await setDoc(doc(db, "users", user.uid), { xp: increment(totalEarned) }, { merge: true }); }
          catch (error) { console.warn('Practice progress could not sync:', error.code); }
        }
      } else {
        setStatus("error");
        setSessionStreak(0);
        speak("Spróbuj ponownie.", 1);
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
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setIsFinished(true);
    }
  };

  /* Presentation only: existing practice handlers and rewards above. */
  if (isFinished) return <main className="pl-page"><div className="pl-shell pl-finish">
    <div className="pl-card pl-summary"><span className="pl-emblem"><IconText>[icon:trophy]</IconText></span>
      <p className="pl-eyebrow">Session complete</p><h1>Brawo! <em>Great work.</em></h1>
      <p>You completed all {totalDrills} translation challenges.</p>
      <div className="pl-summary-xp">+{sessionXp} XP</div>
      <button className="pl-primary" onClick={() => {
        setCurrentIndex(0); setUserInput(""); setStatus("idle"); setShowHint(false);
        setSessionXp(0); setSessionStreak(0); setIsFinished(false);
      }}>Practise again →</button>
    </div></div></main>;

  const completed = currentIndex + (status === "success" ? 1 : 0);
  return <main className="pl-page">
    {particles && <ParticleBurst active x={particles.x} y={particles.y} />}
    <FloatingChip items={floatingChips} />
    <div className="pl-shell">
      <header className="pl-heading"><p className="pl-eyebrow">Translation practice</p>
        <h1>Think in Polish. <em>One sentence at a time.</em></h1>
        <p>Recall the words, build a sentence and say it out loud.</p>
      </header>
      <section className="pl-session" aria-label="Session progress">
        <div className="pl-metrics">
          <div><span>Current rank</span><strong>{rank.title}</strong><small>{xp} XP · {Math.round(rankProgress)}% rank progress</small></div>
          <div><span>Session XP</span><strong>+{sessionXp}</strong></div>
          <div><span>Correct in a row</span><strong>{sessionStreak} <IconText>[icon:flame]</IconText></strong></div>
        </div>
        <div className="pl-progress-label"><span>{completed} of {totalDrills} completed</span><span>{Math.round(completed / totalDrills * 100)}%</span></div>
        <progress value={completed} max={totalDrills} aria-label="Exercises completed" />
      </section>
      <div className="pl-layout">
        <section className="pl-card pl-challenge" aria-label="Translation challenge">
          <div className="pl-top"><span className="pl-eyebrow">Challenge {currentIndex + 1} / {totalDrills}</span><div className="pl-tags"><span>{currentDrill.level}</span><span>{currentDrill.category}</span></div></div>
          <div className="pl-prompt"><p>Translate into Polish</p><h2>{currentDrill.english}</h2></div>
          <label className="pl-label" htmlFor="pl-answer">Your Polish answer</label>
          <input id="pl-answer" ref={inputRef} type="text" value={userInput} placeholder="Wpisz po polsku…" lang="pl" autoComplete="off" className={`pl-input pl-${status}`} onKeyDown={e => e.key === "Enter" && !e.nativeEvent.isComposing && (status === "success" ? nextDrill() : handleVerify(e))} onChange={e => { setUserInput(e.target.value); if (status !== "idle") setStatus("idle"); }} />
          <div className="pl-letters" aria-label="Polish characters">{POLISH_CHARS.map(char => <button type="button" key={char} onClick={() => injectChar(char)}>{char}</button>)}</div>
          <div className="pl-feedback" role="status" aria-live="polite" data-status={status}>
            {status === "success" ? <><strong>Świetnie! Correct answer.</strong><span>{streakMsg || "You earned XP. Ready for the next sentence?"}</span></> : status === "error" ? <><strong>Spróbuj ponownie — try again.</strong><span>Check your endings or use a hint. Other valid translations may not yet be recognised.</span></> : status === "checking" ? "Checking your answer…" : "Try recalling the sentence before using a hint."}
          </div>
          <button className={`pl-primary ${status === "success" ? "pl-correct" : ""}`} onClick={e => status === "success" ? nextDrill() : handleVerify(e)} disabled={status === "checking" || (!userInput.trim() && status !== "success")}>{status === "checking" ? "Checking…" : status === "success" ? "Next challenge →" : "Check answer →"}</button>
          <div className="pl-hint">{showHint ? <p lang="pl">{currentDrill.polish}</p> : <button type="button" onClick={() => setShowHint(true)}>Need a hint? <small>−15 XP</small></button>}</div>
        </section>
        <aside className="pl-side" aria-label="Practice tools">
          <section className="pl-card pl-tools"><h2>Listen & speak</h2><p>Hear the sentence or dictate your answer in Polish.</p>
            <div className="pl-audio"><PolishListen text={currentDrill.polish} normalRate={speed} slowRate={0.45} /><button onClick={startListening} disabled={!(window.SpeechRecognition || window.webkitSpeechRecognition)}><IconText>[icon:mic]</IconText> {isListening ? "Listening…" : "Speak"}</button></div>
            <div className="pl-settings"><button role="switch" aria-checked={autoPlay} onClick={() => setAutoPlay(a => !a)}>Auto-play <strong>{autoPlay ? "On" : "Off"}</strong></button><div><span>Playback speed</span><div className="pl-speeds">{[0.6, 0.8, 1.0].map(s => <button key={s} aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}×</button>)}</div></div></div>
          </section>
          {currentDrill.tip && <section className="pl-card pl-tools"><h2><IconText>[icon:lightbulb]</IconText> Grammar insight</h2><p>Understand the pattern behind this sentence.</p><button className="pl-secondary" aria-expanded={showTip} onClick={() => setShowTip(t => !t)}>{showTip ? "Hide grammar tip" : "Show grammar tip"}</button>{showTip && <p className="pl-tip">{currentDrill.tip}</p>}</section>}
          <a className="pl-card pl-music" href="/polish-music"><IconText>[icon:music]</IconText><span><strong>Polish beyond practice</strong><small>Explore Polish music →</small></span></a>
        </aside>
      </div>
    </div>
  </main>;
}
