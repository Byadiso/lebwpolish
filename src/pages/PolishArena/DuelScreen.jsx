import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DUEL_QUESTIONS } from './data';

export default function DuelScreen({ onBack, onXpGain, onWin, onLoss, toast }) {
  const [phase, setPhase]             = useState('playing');
  const [qIdx, setQIdx]               = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [rivalScore, setRivalScore]   = useState(0);
  const [timeLeft, setTimeLeft]       = useState(30);
  const [answered, setAnswered]       = useState(false);
  const [selected, setSelected]       = useState(null);
  const [feedback, setFeedback]       = useState(null);
  const [rivalMsg, setRivalMsg]       = useState('Rywal pisze…');

  // Refs that always hold current values — avoids ALL stale-closure bugs
  const timerRef        = useRef(null);
  const answeredRef     = useRef(false);
  const playerScoreRef  = useRef(0);
  const rivalScoreRef   = useRef(0);
  const qIdxRef         = useRef(0);

  // Keep refs in sync with state
  useEffect(() => { answeredRef.current    = answered;    }, [answered]);
  useEffect(() => { playerScoreRef.current = playerScore; }, [playerScore]);
  useEffect(() => { rivalScoreRef.current  = rivalScore;  }, [rivalScore]);
  useEffect(() => { qIdxRef.current        = qIdx;        }, [qIdx]);

  const q = DUEL_QUESTIONS[qIdx];

  /* ── advance to next question or end game ───────────────────────────────── */
  const advanceQ = useCallback((nextIdx, pScore, rScore) => {
    clearInterval(timerRef.current);
    if (nextIdx >= DUEL_QUESTIONS.length) {
      if (pScore > rScore) onWin?.();
      else onLoss?.();
      setPlayerScore(pScore);
      setRivalScore(rScore);
      setPhase('result');
      return;
    }
    setTimeout(() => {
      setQIdx(nextIdx);
      setAnswered(false);
      setSelected(null);
      setFeedback(null);
      setTimeLeft(30);
      setRivalMsg('Rywal pisze…');
    }, 1600);
  }, [onWin, onLoss]);

  /* ── timer — runs once per question (qIdx change) ──────────────────────── */
  useEffect(() => {
    if (phase !== 'playing') return;

    clearInterval(timerRef.current);
    setTimeLeft(30);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;

        // Rival "answers" at 3 seconds left if player hasn't yet
        if (next === 3 && !answeredRef.current) {
          const newRS = rivalScoreRef.current + 1;
          rivalScoreRef.current = newRS;
          setRivalScore(newRS);
          setRivalMsg('Rywal odpowiedział! +1');
        }

        // Time expired
        if (next <= 0) {
          clearInterval(timerRef.current);
          if (!answeredRef.current) {
            answeredRef.current = true;
            setAnswered(true);
            setFeedback({ type: 'bad', text: 'Czas minął! Rywal odpowiedział pierwszy.' });
            advanceQ(
              qIdxRef.current + 1,
              playerScoreRef.current,
              rivalScoreRef.current,
            );
          }
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, phase]); // only re-run when question changes or phase changes

  /* ── player picks an option ─────────────────────────────────────────────── */
  const choose = (opt) => {
    if (answeredRef.current) return;
    clearInterval(timerRef.current);

    answeredRef.current = true;
    setAnswered(true);
    setSelected(opt);

    const correct = opt === q.correct;
    const pts     = Math.max(1, timeLeft);

    if (correct) {
      const newPS = playerScoreRef.current + pts;
      playerScoreRef.current = newPS;
      setPlayerScore(newPS);
      setFeedback({ type: 'good', text: `Poprawnie! +${pts} pkt (bonus czasowy: ${pts}s)` });
      setRivalMsg('Odpowiedziałeś pierwszy!');
      onXpGain?.(pts * 10);
      advanceQ(qIdxRef.current + 1, newPS, rivalScoreRef.current);
    } else {
      const newRS = rivalScoreRef.current + 1;
      rivalScoreRef.current = newRS;
      setRivalScore(newRS);
      setFeedback({ type: 'bad', text: `Błąd! Poprawna odpowiedź: "${q.correct}"` });
      setRivalMsg('Rywal zdobył punkt!');
      advanceQ(qIdxRef.current + 1, playerScoreRef.current, newRS);
    }
  };

  /* ── reset / rematch ────────────────────────────────────────────────────── */
  const reset = () => {
    clearInterval(timerRef.current);
    playerScoreRef.current = 0;
    rivalScoreRef.current  = 0;
    qIdxRef.current        = 0;
    answeredRef.current    = false;
    setPhase('playing');
    setQIdx(0);
    setPlayerScore(0);
    setRivalScore(0);
    setTimeLeft(30);
    setAnswered(false);
    setSelected(null);
    setFeedback(null);
    setRivalMsg('Rywal pisze…');
  };

  /* ── timer ring progress ────────────────────────────────────────────────── */
  const timerPct  = timeLeft / 30;
  const r         = 24;
  const circ      = 2 * Math.PI * r;
  const dashOffset = circ - timerPct * circ;
  const timerColor = timeLeft > 10 ? '#818cf8' : timeLeft > 5 ? '#f59e0b' : '#ef4444';

  /* ══════════════════════════════════════════════════════════════════════════
     RESULT SCREEN
  ══════════════════════════════════════════════════════════════════════════ */
  if (phase === 'result') {
    const win    = playerScore > rivalScore;
    const draw   = playerScore === rivalScore;
    const margin = Math.abs(playerScore - rivalScore);

    return (
      <>
        <style>{STYLES}</style>
        <div className="du-root">
          <div className="du-inner">
            <button className="du-back" onClick={onBack}>← Arena</button>

            <div className={`du-result-card ${win ? 'win' : draw ? 'draw' : 'lose'}`}>
              <div className="du-result-icon">
                {win ? '🏆' : draw ? '🤝' : '💀'}
              </div>
              <div className="du-result-title">
                {win ? 'Wygrałeś!' : draw ? 'Remis!' : 'Przegrałeś'}
              </div>
              <div className="du-result-sub">
                {win
                  ? `Wygrałeś o ${margin} ${margin === 1 ? 'punkt' : 'punkty'}. Nowy rywal czeka.`
                  : draw
                  ? 'Remis — obaj jesteście na tym samym poziomie.'
                  : `Przegrałeś o ${margin} ${margin === 1 ? 'punkt' : 'punkty'}. ${margin <= 2 ? 'Blisko! Rewanż?' : 'Ćwicz szybciej.'}`}
              </div>

              <div className="du-result-scores">
                <div className="du-score-col">
                  <div className="du-score-av you">TY</div>
                  <div className="du-score-big you">{playerScore}</div>
                  <div className="du-score-lbl">Twój wynik</div>
                </div>
                <div className="du-score-divider">—</div>
                <div className="du-score-col">
                  <div className="du-score-av rival">RY</div>
                  <div className="du-score-big rival">{rivalScore}</div>
                  <div className="du-score-lbl">Rywal</div>
                </div>
              </div>

              {/* Per-question summary could go here */}
            </div>

            <div className="du-result-btns">
              <button className="du-btn-primary" onClick={reset}>Rewanż →</button>
              <button className="du-btn-secondary" onClick={onBack}>Powrót do Areny</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PLAYING SCREEN
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{STYLES}</style>
      <div className="du-root">
        <div className="du-inner">
          <button className="du-back" onClick={onBack}>← Arena</button>

          {/* Title */}
          <div className="du-title">Pojedynek</div>
          <div className="du-sub">Zmierzysz się z rywalem na Twoim poziomie.</div>

          {toast && <div className="du-xp-toast">{toast}</div>}

          {/* ── Scoreboard ── */}
          <div className="du-scoreboard">
            <div className="du-player-side">
              <div className="du-avatar you">TY</div>
              <div className="du-player-name you">You</div>
              <div className="du-player-score you">{playerScore}</div>
            </div>

            {/* Timer ring */}
            <div className="du-timer-wrap">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                <circle
                  cx="30" cy="30" r={r} fill="none"
                  stroke={timerColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s' }}
                />
              </svg>
              <div className="du-timer-num" style={{ color: timerColor }}>{timeLeft}</div>
            </div>

            <div className="du-player-side">
              <div className="du-avatar rival">RY</div>
              <div className="du-player-name rival">Rival</div>
              <div className="du-player-score rival">{rivalScore}</div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="du-progress">
            {DUEL_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`du-dot ${i < qIdx ? 'done' : i === qIdx ? 'active' : ''}`}
              />
            ))}
          </div>

          {/* Question card */}
          <div className="du-question-card">
            <div className="du-q-meta">
              Pytanie {qIdx + 1} / {DUEL_QUESTIONS.length}
            </div>
            <div className="du-q-text">{q.pl}</div>
            <div className="du-q-hint">Wybierz poprawne tłumaczenie</div>
          </div>

          {/* Answer options */}
          <div className="du-opts">
            {q.opts.map((opt, i) => {
              let cls = 'du-opt';
              if (answered) {
                if (opt === q.correct)   cls += ' hit';
                else if (opt === selected) cls += ' miss';
                else                       cls += ' dim';
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => choose(opt)}
                  disabled={answered}
                >
                  <span className="du-opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="du-opt-text">{opt}</span>
                  {answered && opt === q.correct && <span className="du-opt-check">✓</span>}
                  {answered && opt === selected && opt !== q.correct && <span className="du-opt-x">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Rival status */}
          <div className={`du-rival-msg ${rivalMsg.includes('odpowiedział') || rivalMsg.includes('zdobył') ? 'alert' : ''}`}>
            <span className="du-rival-dot" />
            {rivalMsg}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`du-feedback ${feedback.type}`}>
              {feedback.text}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .du-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #020617;
    color: #f0f0ff;
    display: flex;
    justify-content: center;
    padding: 32px 16px 72px;
    position: relative;
    overflow-x: hidden;
  }
  .du-root::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 600px 400px at 30% 20%, rgba(99,102,241,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 500px 300px at 70% 80%, rgba(239,68,68,0.05)  0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .du-inner {
    position: relative; z-index: 1;
    width: 100%; max-width: 560px;
    display: flex; flex-direction: column; align-items: center;
    gap: 16px;
  }

  /* ── Back ── */
  .du-back {
    align-self: flex-start;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.45);
    padding: 9px 16px; border-radius: 12px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    transition: all 0.2s;
  }
  .du-back:hover { color: #f0f0ff; border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.07); }

  /* ── Title ── */
  .du-title {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: clamp(28px, 5vw, 38px); font-weight: 700;
    color: #f0f0ff; letter-spacing: -0.02em; text-align: center;
    margin-bottom: -4px;
  }
  .du-sub {
    font-size: 13px; color: rgba(255,255,255,0.32); text-align: center;
    font-weight: 400; max-width: 360px;
  }

  /* ── Scoreboard ── */
  .du-scoreboard {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%;
    background: #0d1526;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 24px;
    padding: 20px 24px;
  }
  .du-player-side { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 72px; }
  .du-avatar {
    width: 48px; height: 48px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif; font-weight: 800; font-size: 14px;
    letter-spacing: 0.06em;
  }
  .du-avatar.you    { background: rgba(99,102,241,0.2);  color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
  .du-avatar.rival  { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .du-player-name { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); }
  .du-player-name.you   { color: #818cf8; }
  .du-player-name.rival { color: #f87171; }
  .du-player-score {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: 32px; font-weight: 700; line-height: 1;
    transition: transform 0.2s;
  }
  .du-player-score.you   { color: #818cf8; }
  .du-player-score.rival { color: #f87171; }

  /* Timer ring */
  .du-timer-wrap { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
  .du-timer-num {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: 20px; font-weight: 700; transition: color 0.3s;
  }

  /* Progress dots */
  .du-progress { display: flex; gap: 6px; align-items: center; }
  .du-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
    transition: all 0.3s;
  }
  .du-dot.done   { background: #818cf8; }
  .du-dot.active { background: #c4b5fd; width: 10px; height: 10px; box-shadow: 0 0 8px rgba(129,140,248,0.6); }

  /* ── Question card ── */
  .du-question-card {
    width: 100%;
    background: rgba(99,102,241,0.05);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 20px;
    padding: 22px 24px;
    text-align: center;
  }
  .du-q-meta {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.22em; color: rgba(99,102,241,0.55); margin-bottom: 12px;
  }
  .du-q-text {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: clamp(18px, 3.5vw, 24px); font-weight: 700;
    color: #f0f0ff; line-height: 1.35; margin-bottom: 8px;
  }
  .du-q-hint { font-size: 11px; color: rgba(255,255,255,0.28); font-style: italic; }

  /* ── Options ── */
  .du-opts { display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .du-opt {
    display: flex; align-items: center; gap: 14px;
    width: 100%; padding: 14px 18px;
    background: #0d1526;
    border: 1.5px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    color: rgba(255,255,255,0.7); font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; text-align: left;
    cursor: pointer; transition: all 0.18s;
  }
  .du-opt:hover:not(:disabled) {
    border-color: rgba(99,102,241,0.4);
    background: rgba(99,102,241,0.08);
    color: #f0f0ff;
    transform: translateX(3px);
  }
  .du-opt:disabled { cursor: default; }
  .du-opt.hit  { border-color: rgba(52,211,153,0.5); background: rgba(52,211,153,0.08); color: #6ee7b7; }
  .du-opt.miss { border-color: rgba(239,68,68,0.4);  background: rgba(239,68,68,0.06);  color: #fca5a5; }
  .du-opt.dim  { opacity: 0.35; }
  .du-opt-letter {
    width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4);
    transition: all 0.18s;
  }
  .du-opt.hit  .du-opt-letter { background: rgba(52,211,153,0.2); border-color: rgba(52,211,153,0.4); color: #34d399; }
  .du-opt.miss .du-opt-letter { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.3);  color: #f87171; }
  .du-opt-text { flex: 1; }
  .du-opt-check { font-size: 16px; color: #34d399; flex-shrink: 0; }
  .du-opt-x     { font-size: 16px; color: #f87171; flex-shrink: 0; }

  /* ── Rival msg ── */
  .du-rival-msg {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.32);
    transition: color 0.3s;
  }
  .du-rival-msg.alert { color: rgba(239,68,68,0.7); }
  .du-rival-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    animation: duPulse 1.4s ease-in-out infinite;
  }
  .du-rival-msg.alert .du-rival-dot { background: #ef4444; animation: none; }
  @keyframes duPulse {
    0%,100% { opacity: 0.3; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.3); }
  }

  /* ── Feedback ── */
  .du-feedback {
    width: 100%; border-radius: 14px; padding: 13px 18px;
    font-size: 13px; font-weight: 500; line-height: 1.6;
    animation: duFadeUp 0.25s ease;
  }
  .du-feedback.good { background: rgba(52,211,153,0.07); border: 1px solid rgba(52,211,153,0.2); color: #6ee7b7; }
  .du-feedback.bad  { background: rgba(239,68,68,0.06);  border: 1px solid rgba(239,68,68,0.16);  color: #fca5a5; }
  @keyframes duFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── XP toast ── */
  .du-xp-toast {
    position: fixed; top: 72px; right: 20px; z-index: 9999;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white; font-family: 'Playfair Display', serif;
    font-style: italic; font-size: 15px; font-weight: 700;
    padding: 10px 20px; border-radius: 20px;
    box-shadow: 0 8px 24px rgba(99,102,241,0.4);
    animation: duFadeUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
  }

  /* ── Result screen ── */
  .du-result-card {
    width: 100%; border-radius: 28px; padding: 36px 32px;
    text-align: center; border: 1px solid;
    animation: duFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .du-result-card.win  { background: rgba(52,211,153,0.05); border-color: rgba(52,211,153,0.2);  }
  .du-result-card.lose { background: rgba(239,68,68,0.05);  border-color: rgba(239,68,68,0.18);  }
  .du-result-card.draw { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.2);  }
  .du-result-icon { font-size: 52px; margin-bottom: 16px; }
  .du-result-title {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: 36px; font-weight: 700; color: #f0f0ff;
    margin-bottom: 10px;
  }
  .du-result-sub { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.6; max-width: 360px; margin: 0 auto 28px; }
  .du-result-scores { display: flex; align-items: center; justify-content: center; gap: 28px; }
  .du-score-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .du-score-av {
    width: 52px; height: 52px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 14px; letter-spacing: 0.06em;
  }
  .du-score-av.you    { background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
  .du-score-av.rival  { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .du-score-big { font-family: 'Playfair Display', serif; font-style: italic; font-size: 48px; font-weight: 700; line-height: 1; }
  .du-score-big.you   { color: #818cf8; }
  .du-score-big.rival { color: #f87171; }
  .du-score-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.28); }
  .du-score-divider { font-family: 'Playfair Display', serif; font-size: 28px; color: rgba(255,255,255,0.15); align-self: center; }

  .du-result-btns { display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .du-btn-primary {
    width: 100%; padding: 16px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.22em; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 8px 24px rgba(99,102,241,0.3);
  }
  .du-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(99,102,241,0.4); }
  .du-btn-secondary {
    width: 100%; padding: 15px; border-radius: 14px;
    background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.55);
    border: 1px solid rgba(255,255,255,0.09); font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.22em; cursor: pointer; transition: all 0.2s;
  }
  .du-btn-secondary:hover { border-color: rgba(99,102,241,0.3); color: #c4b5fd; background: rgba(99,102,241,0.08); }
`;
