import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_PARTS } from './data';

/* ─── Design tokens (matches app system) ───────────────────────────────── */
const T = {
  bg:         '#020617',
  surface:    '#080f1f',
  card:       '#0c1427',
  accent:     '#6366f1',
  accentSoft: 'rgba(99,102,241,0.1)',
  accentMid:  'rgba(99,102,241,0.22)',
  accentGlow: 'rgba(99,102,241,0.35)',
  green:      '#34d399',
  greenSoft:  'rgba(52,211,153,0.09)',
  greenMid:   'rgba(52,211,153,0.24)',
  amber:      '#f59e0b',
  amberSoft:  'rgba(251,191,36,0.09)',
  amberMid:   'rgba(251,191,36,0.22)',
  rose:       '#f43f5e',
  roseSoft:   'rgba(244,63,94,0.09)',
  roseMid:    'rgba(244,63,94,0.22)',
  sub:        'rgba(255,255,255,0.05)',
  muted:      'rgba(148,163,184,0.4)',
  mutedDeep:  'rgba(148,163,184,0.2)',
};

const BADGE = {
  smart: { bg: T.greenSoft, border: T.greenMid, color: T.green,  label: 'Smart'  },
  risky: { bg: T.amberSoft, border: T.amberMid, color: T.amber,  label: 'Risky'  },
  bad:   { bg: T.roseSoft,  border: T.roseMid,  color: T.rose,   label: 'Bad'    },
};

const OUTCOME_ICON = { good: '✦', neutral: '◈', bad: '◇' };

/* ─── Ambient background orbs ───────────────────────────────────────────── */
function CinemaOrbs() {
  const orbs = [
    { w: 320, h: 320, x: '-8%',  y: '10%',  color: 'rgba(99,102,241,0.04)',  dur: 9  },
    { w: 220, h: 220, x: '72%',  y: '50%',  color: 'rgba(99,102,241,0.03)',  dur: 13 },
    { w: 180, h: 180, x: '35%',  y: '-8%',  color: 'rgba(139,92,246,0.035)', dur: 11 },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
          style={{
            position: 'absolute', left: o.x, top: o.y,
            width: o.w, height: o.h, borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            filter: 'blur(28px)',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Progress chapters bar ─────────────────────────────────────────────── */
function ChapterBar({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <motion.div
            key={i}
            animate={active ? { opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              flex: done || active ? 2 : 1,
              height: 4, borderRadius: 9999,
              background: done
                ? `linear-gradient(90deg, ${T.accent}, #818cf8)`
                : active
                  ? T.accent
                  : 'rgba(255,255,255,0.07)',
              boxShadow: active ? `0 0 10px ${T.accentGlow}` : 'none',
              transition: 'flex 0.4s ease, background 0.4s ease',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Choice card ───────────────────────────────────────────────────────── */
function ChoiceCard({ choice, index, chosen, isThis, onClick }) {
  const badge    = BADGE[choice.badge] || BADGE.risky;
  const revealed = chosen !== null;
  const faded    = revealed && !isThis;
  const isGood   = choice.outcome === 'good';

  let borderColor = 'rgba(255,255,255,0.07)';
  let bg          = 'rgba(255,255,255,0.025)';
  let glow        = 'none';

  if (revealed && isThis) {
    bg          = isGood ? T.greenSoft : T.roseSoft;
    borderColor = isGood ? T.greenMid  : T.roseMid;
    glow        = isGood
      ? '0 0 24px rgba(52,211,153,0.12)'
      : '0 0 24px rgba(244,63,94,0.1)';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: faded ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.07 }}
      whileHover={!revealed ? { x: 4, backgroundColor: T.accentSoft } : {}}
      onClick={() => !revealed && onClick(index)}
      style={{
        padding: '16px 18px',
        borderRadius: 16,
        background: bg,
        border: `1px solid ${borderColor}`,
        cursor: revealed ? 'default' : 'pointer',
        boxShadow: glow,
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s, opacity 0.25s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Left accent line on selected */}
      {revealed && isThis && (
        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: isGood
              ? `linear-gradient(180deg, ${T.green}, #6ee7b7)`
              : `linear-gradient(180deg, ${T.rose}, #fb7185)`,
            transformOrigin: 'top',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 5 }}>
        {/* Polish line */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic', fontWeight: 700,
          fontSize: '1.05rem', color: '#f1f5f9', lineHeight: 1.3,
          flex: 1,
        }}>
          {choice.pl}
        </p>

        {/* Badge */}
        <span style={{
          flexShrink: 0, padding: '3px 9px', borderRadius: 9999,
          background: badge.bg, border: `1px solid ${badge.border}`,
          color: badge.color, fontSize: 9, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {badge.label}
        </span>
      </div>

      {/* English translation */}
      <p style={{
        fontSize: '0.8rem', color: T.muted, lineHeight: 1.5,
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
      }}>
        {choice.en}
      </p>

      {/* Tick / Cross on reveal */}
      <AnimatePresence>
        {revealed && isThis && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            style={{
              position: 'absolute', top: 14, right: 56,
              width: 20, height: 20, borderRadius: '50%',
              background: isGood ? T.greenMid : T.roseMid,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900,
              color: isGood ? T.green : T.rose,
            }}
          >
            {isGood ? '✓' : '✕'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Complete screen ───────────────────────────────────────────────────── */
function CompleteScreen({ onBack, totalXp }) {
  return (
    <div style={{
      position: 'relative', zIndex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '65vh', padding: '2rem', textAlign: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{
          background: T.card, border: `1px solid ${T.accentMid}`,
          borderRadius: 28, padding: '3rem 2.5rem',
          maxWidth: 380, width: '100%',
          boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${T.accentMid}`,
        }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.accent}, #818cf8, transparent)`, borderRadius: 9999, marginBottom: 28 }} />

        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 0.75, delay: 0.35 }}
          style={{ fontSize: '3.2rem', marginBottom: '1.2rem', display: 'block' }}
        >🎬</motion.div>

        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'rgba(99,102,241,0.5)', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          Episode complete
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '2.1rem', color: '#f1f5f9', lineHeight: 1.05, marginBottom: 14 }}>
          Episode Complete!
        </h2>
        <p style={{ fontSize: '0.88rem', color: T.muted, lineHeight: 1.7, marginBottom: '1rem', fontFamily: "'Space Grotesk', sans-serif" }}>
          Marek survived the interview. Episode 4 unlocks when you earn 800 XP total.
        </p>
        <p style={{ fontSize: '0.88rem', color: T.muted, marginBottom: '2rem', fontFamily: "'Space Grotesk', sans-serif" }}>
          You currently have{' '}
          <span style={{ color: '#a78bfa', fontWeight: 700, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1rem' }}>
            {totalXp}
          </span>
          {' '}XP.
        </p>

        <motion.button
          whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}
          onClick={onBack}
          style={{
            width: '100%', padding: '15px', borderRadius: 14,
            border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${T.accent}, #4f46e5)`,
            color: '#fff', fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.26em', fontSize: 11,
            boxShadow: '0 12px 30px rgba(79,70,229,0.3)',
          }}
        >
          Return to Arena
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function StoryScreen({ onBack, onXpGain, totalXp, toast }) {
  const [part, setPart]             = useState(0);
  const [chosen, setChosen]         = useState(null);
  const [consequence, setConsequence] = useState(null);

  const s    = STORY_PARTS[part];
  const done = part >= STORY_PARTS.length;

  const choose = (idx) => {
    if (chosen !== null) return;
    const c = s.choices[idx];
    setChosen(idx);
    setConsequence({ type: c.outcome, text: c.result });
    onXpGain(c.xp);
  };

  const next = () => {
    setPart((p) => p + 1);
    setChosen(null);
    setConsequence(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(99,102,241,0.3); }
      `}</style>

      <CinemaOrbs />

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '28px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Back button ── */}
        <motion.button
          whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            color: T.muted, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            marginBottom: 32, fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Arena
        </motion.button>

        {/* ── XP Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
                zIndex: 9000, padding: '10px 22px', borderRadius: 9999,
                background: T.amber, color: '#000',
                fontWeight: 800, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.2em',
                boxShadow: '0 0 28px rgba(245,158,11,0.45)',
                whiteSpace: 'nowrap', pointerEvents: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {done ? (
          <CompleteScreen onBack={onBack} totalXp={totalXp} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={part}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              {/* ── Page header ── */}
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'rgba(99,102,241,0.45)', marginBottom: 8 }}>
                  Powieść Interaktywna
                </p>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.85rem', color: '#f1f5f9', lineHeight: 1.08, marginBottom: 8 }}>
                  You Are Marek
                </h1>
                <p style={{ fontSize: '0.82rem', color: T.mutedDeep, lineHeight: 1.6 }}>
                  Every word you say has consequences.
                </p>
              </div>

              {/* ── Chapter progress ── */}
              <ChapterBar total={STORY_PARTS.length} current={part} />

              {/* ── Story card ── */}
              <div style={{
                background: T.card,
                border: `1px solid ${T.accentMid}`,
                borderRadius: 26,
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                marginBottom: 14,
              }}>
                {/* Cinematic scene header */}
                <div style={{
                  padding: '22px 26px 18px',
                  background: `linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))`,
                  borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Decorative film-grain line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, #818cf8, transparent)` }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'rgba(99,102,241,0.5)', marginBottom: 5 }}>
                        {s.ep}
                      </p>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.3rem', color: '#f1f5f9', lineHeight: 1.1 }}>
                        {s.title}
                      </h2>
                    </div>
                    {/* Location pill */}
                    <span style={{
                      flexShrink: 0, marginTop: 2,
                      padding: '5px 11px', borderRadius: 9999,
                      background: T.accentSoft, border: `1px solid ${T.accentMid}`,
                      fontSize: 10, fontWeight: 600,
                      color: 'rgba(165,180,252,0.7)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span>📍</span>
                      <span>{s.location}</span>
                    </span>
                  </div>
                </div>

                <div style={{ padding: '24px 26px 26px' }}>
                  {/* Narration */}
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic', fontSize: '0.95rem',
                    color: 'rgba(148,163,184,0.55)', lineHeight: 1.75,
                    marginBottom: 20,
                  }}>
                    {s.narration}
                  </p>

                  {/* She says prompt */}
                  <div style={{
                    padding: '16px 20px',
                    background: 'rgba(99,102,241,0.06)',
                    border: `1px solid ${T.accentMid}`,
                    borderRadius: 16,
                    marginBottom: 24,
                    position: 'relative',
                  }}>
                    {/* Speech bubble tail visual */}
                    <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.26em', color: 'rgba(99,102,241,0.45)', marginBottom: 7 }}>
                      She says
                    </p>
                    <p style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: 'italic', fontWeight: 700,
                      fontSize: '1.05rem', color: '#e2e8f0', lineHeight: 1.55,
                    }}>
                      "{s.prompt}"
                    </p>
                  </div>

                  {/* Choices label */}
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.26em', color: T.mutedDeep, marginBottom: 12 }}>
                    Choose your response
                  </p>

                  {/* Choices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 0 }}>
                    {s.choices.map((c, i) => (
                      <ChoiceCard
                        key={i}
                        choice={c}
                        index={i}
                        chosen={chosen}
                        isThis={i === chosen}
                        onClick={choose}
                      />
                    ))}
                  </div>

                  {/* Consequence */}
                  <AnimatePresence>
                    {consequence && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        style={{
                          marginTop: 18,
                          padding: '14px 18px',
                          borderRadius: 14,
                          background: consequence.type === 'good'
                            ? T.greenSoft
                            : consequence.type === 'bad'
                              ? T.roseSoft
                              : T.amberSoft,
                          border: `1px solid ${
                            consequence.type === 'good'
                              ? T.greenMid
                              : consequence.type === 'bad'
                                ? T.roseMid
                                : T.amberMid
                          }`,
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                        }}
                      >
                        <span style={{
                          fontSize: '1rem', flexShrink: 0, marginTop: 1,
                          color: consequence.type === 'good'
                            ? T.green
                            : consequence.type === 'bad'
                              ? T.rose
                              : T.amber,
                        }}>
                          {OUTCOME_ICON[consequence.type] || '◈'}
                        </span>
                        <p style={{
                          fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.65,
                          color: consequence.type === 'good'
                            ? T.green
                            : consequence.type === 'bad'
                              ? T.rose
                              : T.amber,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}>
                          {consequence.text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Continue button ── */}
              <AnimatePresence>
                {chosen !== null && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ opacity: 0.92 }} whileTap={{ scale: 0.97 }}
                    onClick={next}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 16,
                      border: 'none', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${T.accent}, #4f46e5)`,
                      color: '#fff', fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.26em', fontSize: 11,
                      boxShadow: '0 12px 30px rgba(79,70,229,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                  >
                    {part + 1 < STORY_PARTS.length ? 'Continue Story' : 'Finish Episode'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/></svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
