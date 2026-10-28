import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHANTOM_DATA } from './data';

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const T = {
  bg:          '#020617',
  surface:     '#080f1f',
  card:        '#0c1427',
  cardDeep:    '#07101e',
  accent:      '#6366f1',
  accentSoft:  'rgba(99,102,241,0.1)',
  accentMid:   'rgba(99,102,241,0.22)',
  accentGlow:  'rgba(99,102,241,0.35)',
  green:       '#34d399',
  greenSoft:   'rgba(52,211,153,0.1)',
  greenMid:    'rgba(52,211,153,0.25)',
  rose:        '#f43f5e',
  roseSoft:    'rgba(244,63,94,0.1)',
  roseMid:     'rgba(244,63,94,0.25)',
  amber:       '#f59e0b',
  ghost:       'rgba(139,92,246,0.18)',
  ghostBorder: 'rgba(139,92,246,0.28)',
  sub:         'rgba(255,255,255,0.05)',
  muted:       'rgba(148,163,184,0.35)',
  mutedDeep:   'rgba(148,163,184,0.18)',
};

/* ─── Ghost pip indicator ───────────────────────────────────────────────── */
function GhostPips({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <motion.div
            key={i}
            animate={active ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: done ? 22 : active ? 10 : 8,
              height: 8,
              borderRadius: 9999,
              background: done
                ? T.green
                : active
                  ? T.accent
                  : 'rgba(255,255,255,0.07)',
              boxShadow: active ? `0 0 10px ${T.accentGlow}` : done ? `0 0 6px rgba(52,211,153,0.3)` : 'none',
              transition: 'width 0.4s ease, background 0.4s ease',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Floating ghost orbs (background atmosphere) ───────────────────────── */
function GhostOrbs() {
  const orbs = [
    { w: 280, h: 280, x: '-10%', y: '5%',  color: 'rgba(99,102,241,0.04)',  dur: 8 },
    { w: 200, h: 200, x: '70%',  y: '55%', color: 'rgba(139,92,246,0.05)', dur: 11 },
    { w: 150, h: 150, x: '40%',  y: '-5%', color: 'rgba(99,102,241,0.03)',  dur: 14 },
  ];
  return (
    // position:absolute (not fixed) so it stays inside the component, not over the navbar
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -24, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2.5 }}
          style={{
            position: 'absolute', left: o.x, top: o.y,
            width: o.w, height: o.h, borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Option button ─────────────────────────────────────────────────────── */
function OptionBtn({ opt, answered, selected, correct, onClick }) {
  const isCorrect  = opt === correct;
  const isSelected = opt === selected;
  const isWrong    = answered && isSelected && !isCorrect;
  const isReveal   = answered && isCorrect;

  let bg    = 'rgba(255,255,255,0.03)';
  let border= 'rgba(255,255,255,0.07)';
  let color = 'rgba(226,232,240,0.75)';
  let glow  = 'none';
  let icon  = null;

  if (isReveal) {
    bg     = T.greenSoft;
    border = T.greenMid;
    color  = T.green;
    glow   = `0 0 20px rgba(52,211,153,0.15)`;
    icon   = '✓';
  } else if (isWrong) {
    bg     = T.roseSoft;
    border = T.roseMid;
    color  = T.rose;
    glow   = `0 0 20px rgba(244,63,94,0.12)`;
    icon   = '✕';
  }

  return (
    <motion.button
      whileHover={!answered ? { x: 4, backgroundColor: 'rgba(99,102,241,0.07)' } : {}}
      whileTap={!answered ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => !answered && onClick(opt)}
      disabled={answered}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        padding: '14px 18px',
        borderRadius: 14,
        background: bg,
        border: `1px solid ${border}`,
        color,
        cursor: answered ? 'default' : 'pointer',
        fontSize: '0.95rem',
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        textAlign: 'left',
        transition: 'background 0.25s, border-color 0.25s, color 0.25s',
        boxShadow: glow,
      }}
    >
      <span>{opt}</span>
      <AnimatePresence>
        {icon && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isReveal ? T.greenMid : T.roseMid,
              fontSize: 11, fontWeight: 900,
            }}
          >
            {icon}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Complete screen ───────────────────────────────────────────────────── */
function CompleteScreen({ onBack }) {
  return (
    <div style={{
      position: 'relative', zIndex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '50vh', textAlign: 'center', padding: '2rem',
    }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{
          background: T.card,
          border: `1px solid ${T.accentMid}`,
          borderRadius: 28,
          padding: '3rem 2.5rem',
          maxWidth: 380,
          width: '100%',
          boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${T.accentMid}`,
        }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.green}, #6ee7b7, transparent)`, borderRadius: 9999, marginBottom: 28 }} />

        <motion.div
          animate={{ rotate: [0, -12, 12, -6, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: '3.5rem', marginBottom: '1.25rem', display: 'block' }}
        >🏆</motion.div>

        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'rgba(52,211,153,0.5)', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
          All phantoms vanquished
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '2.2rem', color: '#f1f5f9', lineHeight: 1.05, marginBottom: 12 }}>
          All Ghosts Exorcised!
        </h2>
        <p style={{ fontSize: '0.9rem', color: T.muted, lineHeight: 1.65, marginBottom: '2rem', fontFamily: "'DM Sans', sans-serif" }}>
          Your weaknesses became strengths. New phantoms will appear after your next session.
        </p>

        <motion.button
          whileHover={{ opacity: 0.9 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${T.accent}, #4f46e5)`,
            color: '#fff', fontFamily: "'DM Sans', sans-serif",
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
export default function PhantomScreen({ onBack, onXpGain, toast }) {
  const [idx,      setIdx]      = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const card = PHANTOM_DATA[idx];
  const done = idx >= PHANTOM_DATA.length;

  const choose = (opt) => {
    if (answered) return;
    setAnswered(true);
    setSelected(opt);
    const correct = opt === card.correct;
    setFeedback({
      type: correct ? 'good' : 'bad',
      text: (correct ? 'Ghost exorcised! ' : 'Still haunts you. ') + card.explain,
    });
    if (correct) onXpGain(80);
  };

  const next = () => {
    setIdx((i) => i + 1);
    setAnswered(false);
    setSelected(null);
    setFeedback(null);
  };

  return (
    /*
     * ROOT FIX 1: No minHeight:"100vh" — the component flows inside the page layout.
     * ROOT FIX 2: No overflowX:"hidden" — that can clip the main navbar.
     * ROOT FIX 3: position:"relative" only (not fixed/sticky) so it doesn't escape its container.
     */
    <div className="ph-root" style={{
      background: T.bg,
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');

        /*
         * NAVBAR FIX: Scoped entirely to .ph-root.
         * The old code had a bare "*, *::before, *::after { margin: 0; padding: 0 }"
         * which injected a global reset into the page and nuked the main navbar's
         * padding, margins, and box model. Now it only affects children of .ph-root.
         */
        .ph-root *, .ph-root *::before, .ph-root *::after {
          box-sizing: border-box;
        }

        /* Selection colour scoped to this component */
        .ph-root ::selection { background: rgba(99,102,241,0.3); }
      `}</style>

      {/* Ghost orbs use position:absolute (not fixed) — stays inside the component */}
      <GhostOrbs />

      <div style={{
        maxWidth: 520, margin: '0 auto',
        padding: '28px 20px 80px',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── Back button ── */}
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            color: T.muted, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            marginBottom: 32,
            fontFamily: "'DM Sans', sans-serif",
            transition: 'color 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Arena
        </motion.button>

        {/* ── XP toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.92 }}
              style={{
                position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
                zIndex: 9000, padding: '10px 22px', borderRadius: 9999,
                background: T.amber, color: '#000',
                fontWeight: 800, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.2em',
                boxShadow: '0 0 28px rgba(245,158,11,0.45)',
                whiteSpace: 'nowrap', pointerEvents: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {done ? (
          <CompleteScreen onBack={onBack} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* ── Page header ── */}
              <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'rgba(99,102,241,0.45)', marginBottom: 8 }}>
                  Karta Cienia
                </p>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.9rem', color: '#f1f5f9', lineHeight: 1.05, marginBottom: 8 }}>
                  Face Your Phantoms
                </h1>
                <p style={{ fontSize: '0.82rem', color: T.mutedDeep, lineHeight: 1.6 }}>
                  These words already defeated you once. They're back.
                </p>
              </div>

              {/* ── Progress pips ── */}
              <GhostPips total={PHANTOM_DATA.length} current={idx} />

              {/* ── Main card ── */}
              <div style={{
                background: T.card,
                border: `1px solid ${T.ghostBorder}`,
                borderRadius: 26,
                overflow: 'hidden',
                boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px ${T.ghost}`,
                marginBottom: 16,
              }}>
                {/* Purple ghost accent strip */}
                <div style={{
                  height: 3,
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.8), rgba(99,102,241,0.6), transparent)',
                }} />

                <div style={{ padding: '28px 28px 24px' }}>
                  {/* Ghost icon + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                    <motion.span
                      animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }}
                    >
                      👻
                    </motion.span>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.26em', color: 'rgba(139,92,246,0.55)', marginBottom: 2 }}>
                        Haunted word
                      </p>
                      <p style={{ fontSize: 11, color: T.mutedDeep, fontWeight: 600 }}>
                        Card {idx + 1} of {PHANTOM_DATA.length}
                      </p>
                    </div>
                  </div>

                  {/* The word */}
                  <div style={{
                    padding: '20px 22px',
                    background: T.ghost,
                    border: `1px solid ${T.ghostBorder}`,
                    borderRadius: 16,
                    marginBottom: 14,
                    textAlign: 'center',
                  }}>
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: 'italic', fontWeight: 700,
                      fontSize: 'clamp(2rem, 6vw, 2.8rem)',
                      color: '#f1f5f9', lineHeight: 1.05,
                      letterSpacing: '-0.01em',
                    }}>
                      {card.word}
                    </h2>
                  </div>

                  {/* Context */}
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    marginBottom: 24,
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: T.mutedDeep, marginBottom: 5 }}>
                      Context
                    </p>
                    <p style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: 'italic',
                      fontSize: '0.88rem', color: T.muted, lineHeight: 1.65,
                    }}>
                      "{card.ctx}"
                    </p>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {card.opts.map((opt, i) => (
                      <motion.div
                        key={opt}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.25 }}
                      >
                        <OptionBtn
                          opt={opt}
                          answered={answered}
                          selected={selected}
                          correct={card.correct}
                          onClick={choose}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          marginTop: 18,
                          padding: '14px 18px',
                          borderRadius: 14,
                          background: feedback.type === 'good' ? T.greenSoft : T.roseSoft,
                          border: `1px solid ${feedback.type === 'good' ? T.greenMid : T.roseMid}`,
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>
                          {feedback.type === 'good' ? '✦' : '◈'}
                        </span>
                        <p style={{
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: feedback.type === 'good' ? T.green : T.rose,
                          lineHeight: 1.6,
                          fontFamily: "'DM Sans', sans-serif",
                          margin: 0,
                        }}>
                          {feedback.text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Next button ── */}
              <AnimatePresence>
                {answered && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ opacity: 0.92 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={next}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 16,
                      border: 'none', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${T.accent}, #4f46e5)`,
                      color: '#fff', fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.26em', fontSize: 11,
                      boxShadow: '0 12px 30px rgba(79,70,229,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                  >
                    {idx + 1 < PHANTOM_DATA.length ? 'Next Ghost' : 'Finish'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/>
                    </svg>
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
