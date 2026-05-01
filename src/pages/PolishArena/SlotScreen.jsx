import React, { useState, useRef, useCallback } from 'react';
import { SUBJECTS, VERBS, OBJECTS } from './data';

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stripParens(str) {
  return str.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Extract every valid alternative from a translation string.
 * Handles: "admitted to / confessed (perf.)"  →  ["admitted to", "confessed"]
 *          "he / she"                           →  ["he", "she"]
 *          "go (somewhere)"                     →  ["go"]
 */
function getAlternatives(raw) {
  // First strip parenthetical notes entirely
  const cleaned = raw.replace(/\s*\([^)]*\)/g, '').trim();
  // Split on " / " or "/"
  return cleaned
    .split(/\s*\/\s*/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Build the full set of acceptable answer strings by combining
 * per-slot alternatives via cartesian product.
 * e.g. subject ["he","she"] × verb ["admitted to","confessed"] × object ["it"]
 *   → ["he admitted to it", "he confessed it", "she admitted to it", "she confessed it"]
 */
function buildAcceptedAnswers(s, v, o) {
  const sAlts = getAlternatives(s.en);
  const vAlts = getAlternatives(v.en);
  const oAlts = getAlternatives(o.en);
  const results = [];
  for (const sa of sAlts) {
    for (const va of vAlts) {
      for (const oa of oAlts) {
        results.push(`${sa} ${va} ${oa}`.replace(/\s+/g, ' ').trim());
      }
    }
  }
  return results;
}

/** Normalise for comparison: lowercase, collapse spaces, strip trailing period */
function norm(str) {
  return str.toLowerCase().trim().replace(/\s+/g, ' ').replace(/\.$/, '');
}

const REEL_LABELS = ['Subject', 'Verb', 'Object'];

// ── Individual reel card ──────────────────────────────────────────────────────
function ReelCard({ reel, index, spinning, hintRevealed, onRevealHint, showTranslation, hintsLeft }) {
  const show = showTranslation || hintRevealed;

  return (
    <div className={`reel ${spinning ? 'spinning' : ''} ${reel.locked ? 'locked' : ''}`}>
      <div className="reel-lbl">{REEL_LABELS[index]}</div>
      <div className="reel-word">{reel.word}</div>
      <div className="reel-tr-wrap">
        {!reel.locked ? (
          <span className="reel-tr">&nbsp;</span>
        ) : show ? (
          <span className={`reel-tr revealed ${hintRevealed && !showTranslation ? 'hint-color' : ''}`}>
            {reel.tr}
          </span>
        ) : (
          <button
            className={`hint-btn ${hintsLeft === 0 ? 'exhausted' : ''}`}
            onClick={() => onRevealHint(index)}
            title={hintsLeft === 0 ? 'No hints left' : 'Reveal translation (uses 1 hint)'}
            disabled={hintsLeft === 0}
          >
            👁 Hint
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SlotScreen({ onBack, onXpGain, toast }) {
  const [reelState, setReelState] = useState('idle');
  const [reels, setReels] = useState([
    { word: '—', tr: '', locked: false },
    { word: '—', tr: '', locked: false },
    { word: '—', tr: '', locked: false },
  ]);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState([false, false, false]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [acceptedAnswers, setAcceptedAnswers] = useState([]);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  // ── Spin ──
  const spin = useCallback(() => {
    if (reelState === 'spinning') return;
    setReelState('spinning');
    setFeedback(null);
    setAnswer('');
    setHintsUsed([false, false, false]);
    setShowAllTranslations(false);
    setAcceptedAnswers([]);

    let ticks = 0;
    const maxTicks = 18;

    intervalRef.current = setInterval(() => {
      setReels([
        { word: rand(SUBJECTS).pl, tr: '', locked: false },
        { word: rand(VERBS).pl,    tr: '', locked: false },
        { word: rand(OBJECTS).pl,  tr: '', locked: false },
      ]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        const s = rand(SUBJECTS);
        const v = rand(VERBS);
        const o = rand(OBJECTS);
        setCurrent({ s, v, o });
        setAcceptedAnswers(buildAcceptedAnswers(s, v, o));
        setReels([
          { word: s.pl, tr: s.en, locked: true },
          { word: v.pl, tr: v.en, locked: true },
          { word: o.pl, tr: o.en, locked: true },
        ]);
        setReelState('answering');
        setTimeout(() => inputRef.current?.focus(), 60);
      }
    }, 80);
  }, [reelState]);

  // ── Reveal one hint ──
  const revealHint = (index) => {
    if (hintsLeft <= 0 || hintsUsed[index]) return;
    setHintsUsed(prev => { const n = [...prev]; n[index] = true; return n; });
    setHintsLeft(h => h - 1);
  };

  // ── Check answer ──
  const checkAnswer = () => {
    if (!current) return;
    const { s, v, o } = current;
    const userAns = norm(answer);
    const usedCount = hintsUsed.filter(Boolean).length;

    setShowAllTranslations(true);

    // Exact match against any accepted combo
    const isCorrect = acceptedAnswers.some(a => norm(a) === userAns);

    // "Near" — user's answer contains every word of at least one accepted combo
    const isNear = !isCorrect && acceptedAnswers.some(accepted => {
      const words = norm(accepted).split(/\s+/);
      return words.length > 1 && words.every(w => userAns.includes(w));
    });

    // Build a clean display string showing all alternatives
    const sAlts = getAlternatives(s.en);
    const vAlts = getAlternatives(v.en);
    const oAlts = getAlternatives(o.en);
    const displayParts = [];
    if (sAlts.length > 1) displayParts.push(sAlts.join(' / '));
    else displayParts.push(sAlts[0] || s.en);
    if (vAlts.length > 1) displayParts.push(vAlts.join(' / '));
    else displayParts.push(vAlts[0] || v.en);
    if (oAlts.length > 1) displayParts.push(oAlts.join(' / '));
    else displayParts.push(oAlts[0] || o.en);
    const displayAnswer = displayParts.join(' · ');

    if (isCorrect) {
      const pts = usedCount === 0 ? 100 : Math.max(40, 100 - usedCount * 20);
      setFeedback({
        type: 'good',
        text: usedCount === 0
          ? `✓ Perfect — no hints needed! +${pts} XP`
          : `✓ Correct! ${usedCount} hint${usedCount > 1 ? 's' : ''} used. +${pts} XP`,
      });
      setScore(sc => sc + pts);
      setStreak(st => st + 1);
      onXpGain(pts);
    } else if (isNear) {
      setFeedback({ type: 'near', text: `~ So close! Accepted: ${displayAnswer}` });
      setScore(sc => sc + 20);
      setStreak(0);
      onXpGain(20);
    } else {
      setFeedback({ type: 'bad', text: `✗ Accepted: ${displayAnswer}` });
      setStreak(0);
    }
    setReelState('done');
  };

  // ── Spin again ──
  const spinAgain = () => {
    setReelState('idle');
    setReels([
      { word: '—', tr: '', locked: false },
      { word: '—', tr: '', locked: false },
      { word: '—', tr: '', locked: false },
    ]);
    setHintsLeft(h => Math.min(3, h + 1));
    spin();
  };

  const inputClass = `answer-input${
    feedback?.type === 'good' ? ' correct'
    : feedback?.type === 'bad' || feedback?.type === 'near' ? ' wrong'
    : ''
  }`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .slot-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #020617;
          color: #f0f0ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px 72px;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient glow */
        .slot-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 700px 400px at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 500px 300px at 80% 90%, rgba(52,211,153,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .slot-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ─── Header ─── */
        .slot-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .back-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.45);
          padding: 9px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.2s;
        }
        .back-btn:hover {
          border-color: rgba(255,255,255,0.18);
          color: #f0f0ff;
          background: rgba(255,255,255,0.07);
        }

        .header-stats { display: flex; gap: 6px; }
        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 18px;
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          min-width: 72px;
          transition: border-color 0.3s;
        }
        .stat-pill:hover { border-color: rgba(99,102,241,0.2); }
        .stat-pill .val {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
          color: #f0f0ff;
          transition: color 0.3s;
        }
        .stat-pill .val.streak { color: #f59e0b; }
        .stat-pill .lbl {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          font-weight: 700;
        }

        /* ─── Title ─── */
        .slot-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(26px, 5vw, 38px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f0f0ff;
          margin-bottom: 8px;
          text-align: center;
        }
        .slot-sub {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          text-align: center;
          max-width: 420px;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        /* ─── Hints bar ─── */
        .hints-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.32);
          animation: fadeUp 0.3s ease;
        }
        .hint-dots { display: flex; gap: 5px; }
        .hint-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.12);
          transition: all 0.35s;
        }
        .hint-dot.active {
          background: #f59e0b;
          border-color: #f59e0b;
          box-shadow: 0 0 7px rgba(245,158,11,0.5);
        }

        /* ─── Reels ─── */
        .reels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          width: 100%;
          margin-bottom: 20px;
        }

        .reel {
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 20px 12px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-height: 132px;
          transition: border-color 0.4s, box-shadow 0.4s;
          position: relative;
          overflow: hidden;
        }
        .reel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .reel.locked::before { opacity: 1; }
        .reel.locked {
          border-color: rgba(99,102,241,0.22);
          box-shadow: 0 0 24px rgba(99,102,241,0.06);
        }
        .reel.spinning .reel-word {
          animation: blurTick 0.08s linear infinite;
        }
        @keyframes blurTick {
          0%   { opacity: 0.2; transform: translateY(-4px); }
          50%  { opacity: 1;   transform: translateY(0); }
          100% { opacity: 0.2; transform: translateY(4px); }
        }

        .reel-lbl {
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        .reel-word {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(13px, 2.8vw, 17px);
          font-weight: 700;
          color: #818cf8;
          text-align: center;
          line-height: 1.3;
          position: relative;
          z-index: 1;
        }
        .reel.locked .reel-word { color: #c4b5fd; }

        .reel-tr-wrap {
          margin-top: auto;
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .reel-tr {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          line-height: 1.4;
        }
        .reel-tr.revealed {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          text-align: center;
          animation: fadeUp 0.35s ease;
        }
        .reel-tr.hint-color { color: #f59e0b; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hint-btn {
          background: rgba(245,158,11,0.07);
          border: 1px dashed rgba(245,158,11,0.28);
          color: rgba(245,158,11,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.04em;
        }
        .hint-btn:hover:not(:disabled) {
          background: rgba(245,158,11,0.14);
          border-color: rgba(245,158,11,0.5);
          color: #f59e0b;
          transform: scale(1.05);
        }
        .hint-btn.exhausted,
        .hint-btn:disabled {
          opacity: 0.22;
          cursor: not-allowed;
          border-style: solid;
        }

        /* ─── Polish sentence box ─── */
        .slot-sentence {
          width: 100%;
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 18px;
          padding: 18px 22px;
          text-align: center;
          margin-bottom: 16px;
          animation: fadeUp 0.3s ease;
        }
        .slot-pl {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(16px, 3.2vw, 21px);
          font-weight: 700;
          color: #f0f0ff;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .slot-hint-text {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.02em;
          font-style: italic;
        }

        /* ─── Alternatives helper ─── */
        .slot-accepted {
          width: 100%;
          padding: 12px 18px;
          background: rgba(52,211,153,0.04);
          border: 1px solid rgba(52,211,153,0.12);
          border-radius: 14px;
          margin-bottom: 12px;
          animation: fadeUp 0.3s ease;
        }
        .slot-accepted-lbl {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(52,211,153,0.5);
          margin-bottom: 6px;
        }
        .slot-accepted-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .slot-accepted-tag {
          font-size: 11px;
          font-weight: 600;
          color: rgba(52,211,153,0.75);
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.15);
          border-radius: 8px;
          padding: 3px 10px;
        }

        .slot-divider {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 4px 0 18px;
        }

        /* ─── Input ─── */
        .answer-input {
          width: 100%;
          background: #0d1526;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 15px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #f0f0ff;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          margin-bottom: 12px;
          caret-color: #818cf8;
        }
        .answer-input::placeholder { color: rgba(255,255,255,0.18); }
        .answer-input:focus {
          border-color: rgba(99,102,241,0.45);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .answer-input.correct {
          border-color: rgba(52,211,153,0.45);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.07);
        }
        .answer-input.wrong {
          border-color: rgba(239,68,68,0.38);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.06);
        }

        /* ─── Feedback ─── */
        .feedback-box {
          width: 100%;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.6;
          margin-bottom: 14px;
          animation: fadeUp 0.25s ease;
        }
        .feedback-box.good {
          background: rgba(52,211,153,0.07);
          border: 1px solid rgba(52,211,153,0.2);
          color: #6ee7b7;
        }
        .feedback-box.near {
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.2);
          color: #fde68a;
        }
        .feedback-box.bad {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.16);
          color: #fca5a5;
        }

        /* ─── Buttons ─── */
        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          box-shadow: 0 8px 24px rgba(99,102,241,0.3);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.4s;
        }
        .btn-primary:hover:not(:disabled)::before { left: 100%; }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(99,102,241,0.4);
        }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.22; cursor: not-allowed; }

        .btn-secondary {
          width: 100%;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 15px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-secondary:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.08);
          color: #c4b5fd;
          transform: translateY(-1px);
        }

        /* ─── XP toast ─── */
        .xp-toast {
          position: fixed;
          top: 20px; right: 20px;
          background: linear-gradient(135deg, #6366f1, #34d399);
          color: white;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 700;
          font-size: 15px;
          padding: 10px 20px;
          border-radius: 20px;
          z-index: 999;
          animation: toastPop 0.3s ease;
          pointer-events: none;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }
        @keyframes toastPop {
          from { opacity: 0; transform: translateY(-10px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="slot-root">
        <div className="slot-inner">

          {/* ── Header ── */}
          <div className="slot-header">
            <button className="back-btn" onClick={onBack}>← Arena</button>
            <div className="header-stats">
              <div className="stat-pill">
                <span className="val">{score}</span>
                <span className="lbl">Score</span>
              </div>
              <div className="stat-pill">
                <span className={`val ${streak > 0 ? 'streak' : ''}`}>{streak}</span>
                <span className="lbl">Streak</span>
              </div>
            </div>
          </div>

          {/* ── Title ── */}
          <div className="slot-title">Losowanie Słowa</div>
          <div className="slot-sub">
            Spin the reels — translate each word you land on. Any correct alternative counts.
          </div>

          {/* ── Hints bar ── */}
          {reelState === 'answering' && (
            <div className="hints-bar">
              <div className="hint-dots">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`hint-dot ${i < hintsLeft ? 'active' : ''}`} />
                ))}
              </div>
              <span>
                {hintsLeft > 0
                  ? `${hintsLeft} hint${hintsLeft !== 1 ? 's' : ''} left — tap 👁 on any word`
                  : 'No hints left'}
              </span>
            </div>
          )}

          {/* ── Reels ── */}
          <div className="reels-grid">
            {reels.map((reel, i) => (
              <ReelCard
                key={i}
                reel={reel}
                index={i}
                spinning={reelState === 'spinning'}
                hintRevealed={hintsUsed[i]}
                onRevealHint={revealHint}
                showTranslation={showAllTranslations}
                hintsLeft={hintsLeft}
              />
            ))}
          </div>

          {/* ── Polish sentence ── */}
          {reelState !== 'idle' && reelState !== 'spinning' && current && (
            <div className="slot-sentence">
              <div className="slot-pl">
                {current.s.pl} {current.v.pl} {current.o.pl}.
              </div>
              <div className="slot-hint-text">
                {reelState === 'answering'
                  ? "Any correct alternative is accepted — ignore grammar notes in brackets"
                  : 'Check the translations revealed on each card above'}
              </div>
            </div>
          )}

          {/* ── Accepted answers preview (shown after checking) ── */}
          {reelState === 'done' && acceptedAnswers.length > 1 && (
            <div className="slot-accepted">
              <div className="slot-accepted-lbl">All accepted answers</div>
              <div className="slot-accepted-list">
                {acceptedAnswers.slice(0, 8).map((a, i) => (
                  <span key={i} className="slot-accepted-tag">{a}</span>
                ))}
                {acceptedAnswers.length > 8 && (
                  <span className="slot-accepted-tag">+{acceptedAnswers.length - 8} more</span>
                )}
              </div>
            </div>
          )}

          <div className="slot-divider" />

          {/* ── Answer input ── */}
          {(reelState === 'answering' || reelState === 'done') && (
            <input
              ref={inputRef}
              className={inputClass}
              placeholder="Type your English translation..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && reelState === 'answering' && checkAnswer()}
              disabled={reelState === 'done'}
            />
          )}

          {/* ── Feedback ── */}
          {feedback && (
            <div className={`feedback-box ${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          {/* ── Action buttons ── */}
          {reelState === 'idle' && (
            <button className="btn-primary" onClick={spin}>Spin the Reels</button>
          )}
          {reelState === 'answering' && (
            <button className="btn-primary" onClick={checkAnswer} disabled={!answer.trim()}>
              Check Translation
            </button>
          )}
          {reelState === 'done' && (
            <button className="btn-secondary" onClick={spinAgain}>Spin Again</button>
          )}

        </div>

        {toast && <div className="xp-toast">{toast}</div>}
      </div>
    </>
  );
}
