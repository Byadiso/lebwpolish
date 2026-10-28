import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORGE_DATA } from "../data/ForgeData";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { query, collection, where, getDocs, updateDoc, increment, arrayUnion } from "firebase/firestore";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const T = {
  bg:        '#020617',
  surface:   '#080f1e',
  card:      '#0c1427',
  accent:    '#6366f1',
  accentSoft:'rgba(99,102,241,0.12)',
  accentMid: 'rgba(99,102,241,0.24)',
  green:     '#34d399',
  greenSoft: 'rgba(52,211,153,0.1)',
  greenMid:  'rgba(52,211,153,0.25)',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  roseSoft:  'rgba(244,63,94,0.1)',
  sub:       'rgba(255,255,255,0.05)',
  muted:     'rgba(148,163,184,0.4)',
};

const TIER_COLORS = {
  'The Subject':     { color: '#818cf8', glow: 'rgba(129,140,248,0.2)'  },
  'The Target':      { color: '#f59e0b', glow: 'rgba(245,158,11,0.2)'  },
  'The Shadow':      { color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
  'The Gift':        { color: '#34d399', glow: 'rgba(52,211,153,0.2)'  },
  'The Weapon':      { color: '#f43f5e', glow: 'rgba(244,63,94,0.2)'   },
  'The Realm':       { color: '#60a5fa', glow: 'rgba(96,165,250,0.2)'  },
  'The Call':        { color: '#fbbf24', glow: 'rgba(251,191,36,0.2)'  },
  'The Time Bender': { color: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
  'The Identity':    { color: '#fb923c', glow: 'rgba(251,146,60,0.2)'  },
  'The Force':       { color: '#38bdf8', glow: 'rgba(56,189,248,0.2)'  },
};

/* ─── Particle burst ─────────────────────────────────────────────────────── */
function ParticleBurst({ x, y, active }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist  = 45 + Math.random() * 60;
        const color = [T.accent, '#818cf8', T.green, T.amber, '#c4b5fd'][i % 5];
        return (
          <motion.div key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ position: 'absolute', width: 7, height: 7, borderRadius: i % 3 === 0 ? 2 : '50%', background: color }}
          />
        );
      })}
    </div>
  );
}

/* ─── Floating XP chip ───────────────────────────────────────────────────── */
function FloatingXP({ amount, x, y, bonus }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.9 }}
      animate={{ opacity: 0, y: -100, scale: 1.15 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{
        position: 'fixed', left: x, top: y, transform: 'translateX(-50%)',
        zIndex: 9999, pointerEvents: 'none',
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
        fontSize: bonus ? '2.2rem' : '1.8rem', fontWeight: 700,
        color: bonus ? T.amber : T.green,
        textShadow: `0 0 20px ${bonus ? 'rgba(245,158,11,0.6)' : 'rgba(52,211,153,0.6)'}`,
      }}
    >
      +{amount} XP{bonus ? ' ✦' : ''}
    </motion.div>
  );
}

/* ─── Stamina hearts ─────────────────────────────────────────────────────── */
function StaminaHearts({ stamina, max = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <motion.div
          key={i}
          animate={i >= stamina ? { scale: [1, 1.3, 1], opacity: [1, 0.3, 0.3] } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: '1.3rem', filter: i < stamina ? 'drop-shadow(0 0 6px rgba(244,63,94,0.7))' : 'grayscale(1)', opacity: i < stamina ? 1 : 0.25 }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Difficulty stars ───────────────────────────────────────────────────── */
function DifficultyStars({ level }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ fontSize: 10, color: i <= level ? T.amber : 'rgba(255,255,255,0.12)' }}>★</span>
      ))}
    </div>
  );
}

/* ─── Progress ring ──────────────────────────────────────────────────────── */
function ProgressRing({ pct, size = 56, stroke = 4, color = T.accent, children }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ}
          animate={{ strokeDashoffset: off }} transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Hint button ────────────────────────────────────────────────────────── */
function HintButton({ hint, used, onUse }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    if (!used) onUse();
    setOpen(o => !o);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={toggle} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 12,
        background: used ? T.accentSoft : 'rgba(255,255,255,0.03)',
        border: `1px solid ${used ? T.accentMid : 'rgba(255,255,255,0.07)'}`,
        color: used ? '#a5b4fc' : T.muted,
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em',
        cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
        transition: 'all 0.2s',
      }}>
        💡 {used ? 'Show Hint' : 'Use Hint (−50 XP)'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 8, padding: '12px 16px', borderRadius: 12,
              background: T.accentSoft, border: `1px solid ${T.accentMid}`,
              fontSize: 13, color: '#c4b5fd', lineHeight: 1.65,
              fontFamily: "'Space Grotesk', sans-serif", overflow: 'hidden',
            }}
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Grammar reveal (after success) ────────────────────────────────────── */
function GrammarReveal({ note, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            marginTop: 16, padding: '16px 18px', borderRadius: 16,
            background: T.greenSoft, border: `1px solid ${T.greenMid}`,
            display: 'flex', gap: 12,
          }}
        >
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🧠</span>
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(52,211,153,0.6)', marginBottom: 5 }}>
              Grammar Note
            </p>
            <p style={{ fontSize: 13, color: T.green, lineHeight: 1.65, fontFamily: "'Space Grotesk', sans-serif" }}>
              {note}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Codex (lesson select) ──────────────────────────────────────────────── */
function CodexView({ profile, onSelect }) {
  const completedIds    = profile?.completedCategories || [];
  const completedCount  = completedIds.length;
  const totalLessons    = FORGE_DATA.length;
  const progressPercent = (completedCount / totalLessons) * 100;

  // Group by tier
  const tiers = [...new Set(FORGE_DATA.map(d => d.tier))];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .forge-root *, .forge-root *::before, .forge-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .forge-root ::-webkit-scrollbar { width: 4px; }
        .forge-root ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 9999px; }
      `}</style>

      <div className="forge-root" style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'rgba(99,102,241,0.5)', marginBottom: 10 }}>
            Polish Grammar
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontWeight: 700, fontSize: 'clamp(2rem, 6vw, 3rem)',
            color: '#f1f5f9', lineHeight: 1.05, marginBottom: 6,
          }}>
            War <span style={{ color: T.accent }}>Forge</span>
          </h1>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
            Master the seven cases. Forge your Polish.
          </p>

          {/* Master progress */}
          <div style={{
            padding: '16px 20px', borderRadius: 18,
            background: T.card, border: `1px solid ${T.accentMid}`,
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4,
          }}>
            <ProgressRing pct={progressPercent} size={52} color={T.accent}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#818cf8' }}>{Math.round(progressPercent)}%</span>
            </ProgressRing>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(99,102,241,0.5)', marginBottom: 4 }}>System Mastery</p>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #34d399)', borderRadius: 9999 }}
                />
              </div>
              <p style={{ fontSize: 11, color: T.muted }}>{completedCount} of {totalLessons} lessons mastered</p>
            </div>
          </div>
        </motion.div>

        {/* Lessons by tier */}
        {tiers.map((tier, ti) => {
          const lessons     = FORGE_DATA.filter(d => d.tier === tier);
          const tierColors  = TIER_COLORS[tier] || { color: T.accent, glow: T.accentSoft };
          return (
            <div key={tier} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ height: 1, width: 16, background: tierColors.color, opacity: 0.4 }} />
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.26em', color: tierColors.color, opacity: 0.7 }}>
                  {tier}
                </p>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {lessons.map((item, i) => {
                  const isDone = completedIds.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (ti * 4 + i) * 0.03 }}
                      whileHover={{ y: -2, boxShadow: `0 12px 32px ${tierColors.glow}` }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 18px', borderRadius: 18, cursor: 'pointer',
                        textAlign: 'left', border: 'none',
                        background: isDone ? `${tierColors.color}0d` : T.card,
                        outline: `1px solid ${isDone ? `${tierColors.color}40` : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.2s',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem',
                        background: isDone ? `${tierColors.color}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isDone ? `${tierColors.color}40` : 'rgba(255,255,255,0.06)'}`,
                        filter: isDone ? 'none' : 'grayscale(0.4)',
                      }}>
                        {isDone ? '✓' : item.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: isDone ? tierColors.color : 'rgba(148,163,184,0.4)', marginBottom: 3 }}>
                          {item.concept}
                        </p>
                        <p style={{
                          fontSize: 13, fontWeight: 700,
                          color: isDone ? '#f1f5f9' : 'rgba(226,232,240,0.7)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.task}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <DifficultyStars level={item.difficulty} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(99,102,241,0.55)' }}>{item.xp} XP</span>
                        </div>
                      </div>

                      {isDone && (
                        <span style={{
                          flexShrink: 0, width: 8, height: 8, borderRadius: '50%',
                          background: tierColors.color, boxShadow: `0 0 8px ${tierColors.glow}`,
                        }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function PolishWarForge() {
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId]             = useState(null);
  const [wordBank, setWordBank]                 = useState([]);
  const [sentence, setSentence]                 = useState([]);
  const [stamina, setStamina]                   = useState(3);
  const [isForged, setIsForged]                 = useState(false);
  const [errorShake, setErrorShake]             = useState(false);
  const [hintUsed, setHintUsed]                 = useState(false);
  const [particles, setParticles]               = useState(null);
  const [floatingXPs, setFloatingXPs]           = useState([]);
  const [streak, setStreak]                     = useState(0);
  const [showGrammar, setShowGrammar]           = useState(false);
  const [wrongWords, setWrongWords]             = useState(new Set());
  const verifyBtnRef = useRef(null);

  const activeIndex  = FORGE_DATA.findIndex(n => n.id === selectedId);
  const activeLesson = FORGE_DATA[activeIndex];
  const nextLesson   = FORGE_DATA[activeIndex + 1];
  const tierStyle    = activeLesson ? (TIER_COLORS[activeLesson.tier] || { color: T.accent, glow: T.accentSoft }) : {};

  useEffect(() => {
    if (!activeLesson) return;
    const all = [...activeLesson.correctSequence, ...activeLesson.distractors];
    setWordBank(all.sort(() => Math.random() - 0.5));
    setSentence([]);
    setIsForged(false);
    setStamina(3);
    setHintUsed(false);
    setShowGrammar(false);
    setWrongWords(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedId]);

  const addWord = (word, idx) => {
    if (isForged || stamina === 0) return;
    setSentence(s => [...s, { word, idx }]);
    setWordBank(w => w.filter((_, i) => i !== idx));
    setWrongWords(ww => { const n = new Set(ww); n.delete(word); return n; });
  };

  const removeWord = (item, idx) => {
    if (isForged) return;
    setSentence(s => s.filter((_, i) => i !== idx));
    setWordBank(w => [...w, item.word]);
  };

  const spawnXP = (amount, bonus) => {
    const btn = verifyBtnRef.current?.getBoundingClientRect();
    const x   = btn ? btn.left + btn.width / 2 : window.innerWidth / 2;
    const y   = btn ? btn.top  : window.innerHeight / 2;
    const id  = Date.now() + Math.random();
    setParticles({ x, y });
    setFloatingXPs(prev => [...prev, { id, amount, bonus, x, y }]);
    setTimeout(() => {
      setParticles(null);
      setFloatingXPs(prev => prev.filter(c => c.id !== id));
    }, 1400);
  };

  const verify = async () => {
    if (!sentence.length || isForged || stamina === 0) return;
    const attempt = sentence.map(s => s.word).join(' ');
    const correct = activeLesson.correctSequence.join(' ');

    if (attempt === correct) {
      setIsForged(true);
      setShowGrammar(true);
      const isBonus  = streak >= 2;
      const earned   = activeLesson.xp - (hintUsed ? 50 : 0) + (isBonus ? streak * 10 : 0);
      setStreak(s => s + 1);
      spawnXP(earned, isBonus);

      try {
        const q    = query(collection(db, 'pending_users'), where('email', '==', user.email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, {
            xp: increment(earned),
            grammarPoints: increment(20),
            completedCategories: arrayUnion(activeLesson.id),
          });
        }
      } catch (e) { console.error('Sync failed', e); }

    } else {
      // Mark wrong words
      const correctArr = activeLesson.correctSequence;
      const wrong = new Set(
        sentence.map((s, i) => correctArr[i] !== s.word ? s.word : null).filter(Boolean)
      );
      setWrongWords(wrong);
      setStamina(s => {
        const n = Math.max(0, s - 1);
        if (n === 0) setStreak(0);
        return n;
      });
      setErrorShake(true);
      setTimeout(() => { setErrorShake(false); setWrongWords(new Set()); }, 600);
    }
  };

  // ── Codex view ─────────────────────────────────────────────────────────────
  if (!selectedId) {
    return <CodexView profile={profile} onSelect={setSelectedId} />;
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  const sentenceFull = sentence.length === activeLesson.correctSequence.length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        .forge-game *, .forge-game *::before, .forge-game *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes wrongShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .wrong-shake { animation: wrongShake 0.35s ease; }
      `}</style>

      {/* Ambient background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${tierStyle.glow || T.accentSoft}, transparent 70%)`, filter: 'blur(40px)', opacity: 0.6 }} />
      </div>

      {/* Particles + floating XP */}
      {particles && <ParticleBurst x={particles.x} y={particles.y} active />}
      <AnimatePresence>
        {floatingXPs.map(f => <FloatingXP key={f.id} amount={f.amount} x={f.x} y={f.y} bonus={f.bonus} />)}
      </AnimatePresence>

      <div className="forge-game" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 120px', position: 'relative', zIndex: 1 }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <motion.button
            whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedId(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
              color: T.muted, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.18em',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Codex
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  padding: '5px 11px', borderRadius: 9999,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                  fontSize: 10, fontWeight: 800, color: T.amber,
                  textTransform: 'uppercase', letterSpacing: '0.14em',
                }}
              >
                {streak}× 🔥
              </motion.div>
            )}
            <StaminaHearts stamina={stamina} />
          </div>
        </div>

        {/* ── Lesson header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 9999,
              background: `${tierStyle.color}18`, border: `1px solid ${tierStyle.color}40`,
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
              color: tierStyle.color,
            }}>
              {activeLesson.tier}
            </span>
            <span style={{
              padding: '4px 12px', borderRadius: 9999,
              background: T.accentSoft, border: `1px solid ${T.accentMid}`,
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
              color: '#818cf8',
            }}>
              {activeLesson.concept}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <DifficultyStars level={activeLesson.difficulty} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(99,102,241,0.55)' }}>{activeLesson.xp} XP</span>
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontWeight: 700, fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
            color: '#f1f5f9', lineHeight: 1.2, padding: '0 8px',
          }}>
            "{activeLesson.task}"
          </h2>
        </motion.div>

        {/* ── Hint ── */}
        <HintButton hint={activeLesson.hint} used={hintUsed} onUse={() => setHintUsed(true)} />

        {/* ── Construction zone ── */}
        <motion.div
          className={errorShake ? 'wrong-shake' : ''}
          style={{
            minHeight: 120, borderRadius: 24, padding: '20px 20px',
            border: `2px ${isForged ? 'solid' : 'dashed'} ${isForged ? T.green : stamina === 0 ? T.rose : 'rgba(255,255,255,0.1)'}`,
            background: isForged
              ? T.greenSoft
              : stamina === 0
                ? T.roseSoft
                : 'rgba(255,255,255,0.02)',
            display: 'flex', flexWrap: 'wrap', gap: 8,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, position: 'relative',
            transition: 'border-color 0.3s, background 0.3s',
            boxShadow: isForged ? `0 0 40px rgba(52,211,153,0.1)` : 'none',
          }}
        >
          {/* Label */}
          {!sentence.length && !isForged && (
            <motion.p
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.2)' }}
            >
              Select runes below
            </motion.p>
          )}

          {sentence.map((item, i) => {
            const isWrong = wrongWords.has(item.word);
            return (
              <motion.button
                key={i}
                layout
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: isWrong ? [1, 1.1, 0.9, 1] : 1, opacity: 1 }}
                whileTap={!isForged ? { scale: 0.92 } : {}}
                onClick={() => removeWord(item, i)}
                disabled={isForged}
                style={{
                  padding: '10px 18px', borderRadius: 13,
                  background: isWrong
                    ? 'rgba(244,63,94,0.15)'
                    : isForged
                      ? T.greenSoft
                      : T.accentSoft,
                  border: `1px solid ${isWrong ? T.rose + '60' : isForged ? T.greenMid : T.accentMid}`,
                  color: isWrong ? T.rose : isForged ? T.green : '#c4b5fd',
                  fontSize: 15, fontWeight: 700,
                  cursor: isForged ? 'default' : 'pointer',
                  boxShadow: isForged ? `0 4px 0 rgba(52,211,153,0.2)` : `0 4px 0 rgba(99,102,241,0.2)`,
                  transition: 'all 0.2s',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {item.word}
              </motion.button>
            );
          })}

          {/* Success checkmark */}
          <AnimatePresence>
            {isForged && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ position: 'absolute', top: 10, right: 12 }}
              >
                <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.6))' }}>✓</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Grammar reveal ── */}
        <GrammarReveal note={activeLesson.grammar_note} visible={showGrammar} />

        {/* ── No stamina state ── */}
        {stamina === 0 && !isForged && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              padding: '20px', borderRadius: 20, textAlign: 'center',
              background: T.roseSoft, border: `1px solid rgba(244,63,94,0.25)`,
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: T.rose, marginBottom: 8 }}>
              ⚠️ Stamina Depleted
            </p>
            <p style={{ fontSize: 12, color: 'rgba(244,63,94,0.6)', marginBottom: 14 }}>
              The correct answer was: <strong style={{ color: T.rose }}>{activeLesson.correctSequence.join(' ')}</strong>
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedId(selectedId)}
              style={{
                padding: '10px 22px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
                color: T.rose, fontSize: 11, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.18em',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* ── Word bank ── */}
        {!isForged && stamina > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
            {wordBank.map((word, i) => (
              <motion.button
                key={`${word}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.9, y: 3 }}
                onClick={() => addWord(word, i)}
                style={{
                  padding: '11px 20px', borderRadius: 14,
                  background: T.card,
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(226,232,240,0.85)',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
                  transition: 'background 0.15s',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {word}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating action buttons ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 28px',
        background: 'linear-gradient(to top, rgba(2,6,23,0.98) 70%, transparent)',
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Verify / Continue */}
          <motion.button
            ref={verifyBtnRef}
            whileTap={{ scale: 0.97 }}
            onClick={isForged ? (nextLesson ? () => setSelectedId(nextLesson.id) : () => setSelectedId(null)) : verify}
            disabled={!isForged && (!sentence.length || stamina === 0)}
            style={{
              width: '100%', padding: '17px', borderRadius: 18, border: 'none', cursor: 'pointer',
              background: isForged
                ? `linear-gradient(135deg, ${T.green}, #059669)`
                : stamina === 0 || !sentence.length
                  ? 'rgba(255,255,255,0.05)'
                  : `linear-gradient(135deg, ${T.accent}, #4f46e5)`,
              color: stamina === 0 && !isForged ? 'rgba(148,163,184,0.3)' : '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.28em',
              boxShadow: isForged
                ? '0 10px 30px rgba(16,185,129,0.3)'
                : sentence.length && stamina > 0 && !isForged
                  ? '0 10px 30px rgba(79,70,229,0.3)'
                  : 'none',
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {isForged
              ? (nextLesson ? `Next: ${nextLesson.concept}` : 'Back to Codex')
              : stamina === 0
                ? 'Stamina Depleted'
                : 'Forge Runes'}
            {isForged && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/>
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
