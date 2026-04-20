import React, { useState, useRef, useCallback } from 'react';
import { SUBJECTS, VERBS, OBJECTS } from './data';

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stripParens(str) {
  return str.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
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
  const [reelState, setReelState] = useState('idle'); // idle | spinning | answering | done
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

    let ticks = 0;
    const maxTicks = 18;

    intervalRef.current = setInterval(() => {
      setReels([
        { word: rand(SUBJECTS).pl, tr: '', locked: false },
        { word: rand(VERBS).pl, tr: '', locked: false },
        { word: rand(OBJECTS).pl, tr: '', locked: false },
      ]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        const s = rand(SUBJECTS);
        const v = rand(VERBS);
        const o = rand(OBJECTS);
        setCurrent({ s, v, o });
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
    setHintsUsed((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setHintsLeft((h) => h - 1);
  };

  // ── Check answer ──
  const checkAnswer = () => {
    if (!current) return;
    const { s, v, o } = current;

    const cleanS = stripParens(s.en);
    const cleanV = stripParens(v.en);
    const cleanO = stripParens(o.en);
    const correct = `${cleanS} ${cleanV} ${cleanO}`.toLowerCase().replace(/\./g, '');
    const ans = answer.toLowerCase().trim().replace(/\./g, '');
    const correctWords = correct.split(/\s+/);
    const hits = correctWords.filter((w) => ans.includes(w)).length;
    const isCorrect = ans === correct || hits === correctWords.length;
    const isNear = hits >= correctWords.length - 1 && !isCorrect;

    const usedCount = hintsUsed.filter(Boolean).length;
    const display = `${s.en} ${v.en} ${o.en}`;

    // Always reveal all translations after submitting
    setShowAllTranslations(true);

    if (isCorrect) {
      const pts = usedCount === 0 ? 100 : Math.max(40, 100 - usedCount * 20);
      setFeedback({
        type: 'good',
        text: usedCount === 0
          ? `✓ Perfect — no hints needed! +${pts} XP`
          : `✓ Correct! ${usedCount} hint${usedCount > 1 ? 's' : ''} used. +${pts} XP`,
      });
      setScore((sc) => sc + pts);
      setStreak((st) => st + 1);
      onXpGain(pts);
    } else if (isNear) {
      setFeedback({
        type: 'near',
        text: `~ So close! Full answer: "${display}"`,
      });
      setScore((sc) => sc + 20);
      setStreak(0);
      onXpGain(20);
    } else {
      setFeedback({
        type: 'bad',
        text: `✗ Answer was: "${display}"`,
      });
      setStreak(0);
    }
    setReelState('done');
  };

  // ── Spin again — replenish 1 hint per round, max 3 ──
  const spinAgain = () => {
    setReelState('idle');
    setReels([
      { word: '—', tr: '', locked: false },
      { word: '—', tr: '', locked: false },
      { word: '—', tr: '', locked: false },
    ]);
    setHintsLeft((h) => Math.min(3, h + 1));
    spin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .slot-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0e0e12;
          color: #f0ece4;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 56px;
          position: relative;
          overflow-x: hidden;
        }

        /* Grain texture */
        .slot-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        /* Top ambient glow */
        .slot-root::after {
          content: '';
          position: fixed;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(234,179,8,0.06) 0%, transparent 68%);
          pointer-events: none;
          z-index: 0;
        }

        .slot-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 660px;
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
          margin-bottom: 36px;
        }

        .back-btn {
          background: none;
          border: 1px solid rgba(240,236,228,0.13);
          color: rgba(240,236,228,0.45);
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.02em;
          transition: all 0.2s;
        }
        .back-btn:hover {
          border-color: rgba(240,236,228,0.3);
          color: #f0ece4;
        }

        .header-stats {
          display: flex;
          gap: 24px;
        }
        .stat-pill { display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .stat-pill .val {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          color: #f0ece4;
          transition: color 0.3s;
        }
        .stat-pill .val.streak { color: #f97316; }
        .stat-pill .lbl {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240,236,228,0.3);
        }

        /* ─── Title ─── */
        .slot-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(24px, 5vw, 34px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f0ece4;
          margin-bottom: 6px;
          text-align: center;
        }
        .slot-sub {
          font-size: 12.5px;
          color: rgba(240,236,228,0.38);
          text-align: center;
          max-width: 400px;
          line-height: 1.65;
          margin-bottom: 32px;
        }

        /* ─── Hints bar ─── */
        .hints-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          font-size: 11.5px;
          color: rgba(240,236,228,0.35);
          animation: fade-in 0.3s ease;
        }
        .hint-dots { display: flex; gap: 5px; }
        .hint-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(249,115,22,0.18);
          border: 1px solid rgba(249,115,22,0.15);
          transition: all 0.35s;
        }
        .hint-dot.active {
          background: #f97316;
          border-color: #f97316;
          box-shadow: 0 0 7px rgba(249,115,22,0.55);
        }

        /* ─── Reels ─── */
        .reels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          width: 100%;
          margin-bottom: 22px;
        }

        .reel {
          background: #16161d;
          border: 1px solid rgba(240,236,228,0.07);
          border-radius: 16px;
          padding: 18px 10px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-height: 128px;
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .reel.locked {
          border-color: rgba(234,179,8,0.18);
          box-shadow: 0 0 20px rgba(234,179,8,0.04);
        }
        .reel.spinning .reel-word {
          animation: blur-tick 0.08s linear infinite;
        }
        @keyframes blur-tick {
          0%   { opacity: 0.25; transform: translateY(-3px); }
          50%  { opacity: 1;    transform: translateY(0); }
          100% { opacity: 0.25; transform: translateY(3px); }
        }

        .reel-lbl {
          font-size: 8.5px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(240,236,228,0.25);
          font-weight: 500;
        }
        .reel-word {
          font-family: 'Syne', sans-serif;
          font-size: clamp(13px, 2.8vw, 17px);
          font-weight: 700;
          color: #eab308;
          text-align: center;
          line-height: 1.3;
        }

        /* Translation / hint area */
        .reel-tr-wrap {
          margin-top: auto;
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .reel-tr {
          font-size: 10.5px;
          color: rgba(240,236,228,0.28);
          text-align: center;
          line-height: 1.4;
        }
        .reel-tr.revealed {
          font-size: 10.5px;
          color: rgba(240,236,228,0.52);
          text-align: center;
          animation: fade-in 0.35s ease;
        }
        .reel-tr.hint-color { color: #fb923c; }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hint-btn {
          background: rgba(249,115,22,0.07);
          border: 1px dashed rgba(249,115,22,0.28);
          color: rgba(249,115,22,0.65);
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          padding: 3px 9px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .hint-btn:hover:not(:disabled) {
          background: rgba(249,115,22,0.14);
          border-color: rgba(249,115,22,0.55);
          color: #f97316;
        }
        .hint-btn.exhausted,
        .hint-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          border-style: solid;
        }

        /* ─── Polish sentence box ─── */
        .slot-sentence {
          width: 100%;
          background: rgba(234,179,8,0.035);
          border: 1px solid rgba(234,179,8,0.11);
          border-radius: 14px;
          padding: 16px 20px;
          text-align: center;
          margin-bottom: 16px;
        }
        .slot-pl {
          font-family: 'Syne', sans-serif;
          font-size: clamp(15px, 3.2vw, 20px);
          font-weight: 700;
          color: #f0ece4;
          margin-bottom: 5px;
          letter-spacing: -0.01em;
        }
        .slot-hint-text {
          font-size: 11px;
          color: rgba(240,236,228,0.3);
          letter-spacing: 0.03em;
          font-style: italic;
        }

        .slot-divider {
          width: 100%;
          height: 1px;
          background: rgba(240,236,228,0.055);
          margin: 6px 0 18px;
        }

        /* ─── Input ─── */
        .answer-input {
          width: 100%;
          background: #16161d;
          border: 1px solid rgba(240,236,228,0.1);
          border-radius: 12px;
          padding: 14px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #f0ece4;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .answer-input::placeholder { color: rgba(240,236,228,0.18); }
        .answer-input:focus {
          border-color: rgba(234,179,8,0.38);
          box-shadow: 0 0 0 3px rgba(234,179,8,0.06);
        }
        .answer-input.correct {
          border-color: rgba(34,197,94,0.45);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.06);
        }
        .answer-input.wrong {
          border-color: rgba(239,68,68,0.38);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.06);
        }

        /* ─── Feedback ─── */
        .feedback-box {
          width: 100%;
          border-radius: 12px;
          padding: 13px 18px;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 14px;
          box-sizing: border-box;
          animation: fade-in 0.25s ease;
        }
        .feedback-box.good {
          background: rgba(34,197,94,0.07);
          border: 1px solid rgba(34,197,94,0.22);
          color: #86efac;
        }
        .feedback-box.near {
          background: rgba(234,179,8,0.07);
          border: 1px solid rgba(234,179,8,0.22);
          color: #fde68a;
        }
        .feedback-box.bad {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.18);
          color: #fca5a5;
        }

        /* ─── Buttons ─── */
        .btn-primary {
          width: 100%;
          background: #eab308;
          color: #0e0e12;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-primary:hover:not(:disabled) {
          background: #fbbf24;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(234,179,8,0.22);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-secondary {
          width: 100%;
          background: transparent;
          color: #f0ece4;
          border: 1px solid rgba(240,236,228,0.18);
          border-radius: 12px;
          padding: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-secondary:hover {
          border-color: rgba(240,236,228,0.4);
          background: rgba(240,236,228,0.04);
          transform: translateY(-1px);
        }

        /* ─── XP toast ─── */
        .xp-toast {
          position: fixed;
          top: 18px;
          right: 18px;
          background: #eab308;
          color: #0e0e12;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 20px;
          z-index: 999;
          animation: toast-pop 0.3s ease;
          pointer-events: none;
        }
        @keyframes toast-pop {
          from { opacity: 0; transform: translateY(-10px) scale(0.93); }
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
                <span className="val streak">{streak}</span>
                <span className="lbl">Streak</span>
              </div>
            </div>
          </div>

          {/* ── Title ── */}
          <div className="slot-title">Losowanie Słowa</div>
          <div className="slot-sub">
            Spin the reels — translate each word you land on. Sentences may be
            grammatically wild, and that's fine: your job is the words, not the meaning.
          </div>

          {/* ── Hints bar — only during answering ── */}
          {reelState === 'answering' && (
            <div className="hints-bar">
              <div className="hint-dots">
                {[0, 1, 2].map((i) => (
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
                  ? "Ignore the grammar notes in brackets — they don't count"
                  : 'Check the translations revealed on each card above'}
              </div>
            </div>
          )}

          <div className="slot-divider" />

          {/* ── Answer input ── */}
          {(reelState === 'answering' || reelState === 'done') && (
            <input
              ref={inputRef}
              className={`answer-input ${
                feedback?.type === 'good' ? 'correct'
                : feedback?.type === 'bad' || feedback?.type === 'near' ? 'wrong'
                : ''
              }`}
              placeholder="Type your English translation..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && reelState === 'answering' && checkAnswer()
              }
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
            <button className="btn-primary" onClick={spin}>SPIN</button>
          )}
          {reelState === 'answering' && (
            <button
              className="btn-primary"
              onClick={checkAnswer}
              disabled={!answer.trim()}
            >
              CHECK TRANSLATION
            </button>
          )}
          {reelState === 'done' && (
            <button className="btn-secondary" onClick={spinAgain}>
              SPIN AGAIN
            </button>
          )}

        </div>

        {toast && <div className="xp-toast">{toast}</div>}
      </div>
    </>
  );
}
