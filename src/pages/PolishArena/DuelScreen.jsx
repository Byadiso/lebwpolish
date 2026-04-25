import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DUEL_QUESTIONS } from './data';

export default function DuelScreen({ onBack, onXpGain, onWin, toast }) {
  const [phase, setPhase] = useState('playing'); // playing | result
  const [qIdx, setQIdx] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [rivalMsg, setRivalMsg] = useState('Rywal pisze...');
  const timerRef = useRef(null);

  const q = DUEL_QUESTIONS[qIdx];

  const advanceQ = useCallback(
    (nextIdx, pScore, rScore) => {
      clearInterval(timerRef.current);
      if (nextIdx >= DUEL_QUESTIONS.length) {
        if (pScore > rScore) onWin();
        setPhase('result');
        setPlayerScore(pScore);
        setRivalScore(rScore);
        return;
      }
      setTimeout(() => {
        setQIdx(nextIdx);
        setAnswered(false);
        setSelected(null);
        setFeedback(null);
        setTimeLeft(30);
        setRivalMsg('Rywal pisze...');
      }, 1600);
    },
    [onWin]
  );

  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (next === 3 && !answered) {
          setRivalScore((rs) => {
            const newRS = rs + 1;
            setRivalMsg('Rywal odpowiedział! +1');
            return newRS;
          });
        }
        if (next <= 0) {
          clearInterval(timerRef.current);
          if (!answered) {
            setFeedback({ type: 'bad', text: 'Time up! Rival answered first. Moving on...' });
            setAnswered(true);
            setRivalScore((rs) => {
              advanceQ(qIdx + 1, playerScore, rs);
              return rs;
            });
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, phase, answered, advanceQ, playerScore, qIdx]);

  const choose = (opt) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(opt);
    const correct = opt === q.correct;
    const pts = Math.max(1, timeLeft);

    if (correct) {
      setFeedback({ type: 'good', text: `Correct! +${pts} pts (speed bonus: ${pts}s left)` });
      setRivalMsg('You answered first!');
      setPlayerScore((ps) => {
        const newPS = ps + pts;
        onXpGain(pts * 10);
        advanceQ(qIdx + 1, newPS, rivalScore);
        return newPS;
      });
    } else {
      setFeedback({ type: 'bad', text: `Wrong! Rival gains a point. Correct: ${q.correct}` });
      setRivalMsg('Rywal zdobył punkt!');
      setRivalScore((rs) => {
        const newRS = rs + 1;
        advanceQ(qIdx + 1, playerScore, newRS);
        return newRS;
      });
    }
  };

  const reset = () => {
    setPhase('playing');
    setQIdx(0);
    setPlayerScore(0);
    setRivalScore(0);
    setTimeLeft(30);
    setAnswered(false);
    setSelected(null);
    setFeedback(null);
    setRivalMsg('Rywal pisze...');
  };

  if (phase === 'result') {
    const win = playerScore > rivalScore;
    const margin = Math.abs(playerScore - rivalScore);
    return (
      <div className="screen-inner">
        <button className="back-btn" onClick={onBack}>← Arena</button>
        <div className={`result-overlay ${win ? 'win' : 'lose'}`}>
          <div className="result-title">{win ? 'Wygrałeś!' : 'Przegrałeś'}</div>
          <div className="result-sub">
            {win
              ? `You crushed it by ${margin} points. New challenger awaits.`
              : `You lost by ${margin} points. ${margin <= 2 ? 'That was a near-miss — rematch?' : 'Drill faster next time.'}`}
          </div>
          <div className="result-scores">
            <div>
              <div className="score-big" style={{ color: '#a78bfa' }}>{playerScore}</div>
              <div className="score-lbl">Your score</div>
            </div>
            <div>
              <div className="score-big" style={{ color: '#f87171' }}>{rivalScore}</div>
              <div className="score-lbl">Rival score</div>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={reset}>REMATCH →</button>
        <button className="btn-secondary" style={{ marginTop: 8 }} onClick={onBack}>
          Back to Arena
        </button>
      </div>
    );
  }

  return (
    <div className="screen-inner">
      <button className="back-btn" onClick={onBack}>← Arena</button>
      <div className="screen-title">Pojedynek</div>
      <div className="screen-sub">Matched against a rival at your level. They're already typing.</div>

      {toast && <div className="xp-toast show">{toast}</div>}

      <div className="duel-arena">
        <div className="duel-vs">
          <div className="player-side">
            <div className="player-avatar you">TY</div>
            <div className="player-name" style={{ color: '#818cf8' }}>You</div>
            <div className="player-score" style={{ color: '#a78bfa' }}>{playerScore}</div>
          </div>
          <div className="vs-badge">VS</div>
          <div className="player-side">
            <div className="player-avatar rival">RY</div>
            <div className="player-name" style={{ color: '#f87171' }}>Rival</div>
            <div className="player-score" style={{ color: '#f87171' }}>{rivalScore}</div>
          </div>
        </div>

        <div className="duel-timer">
          <div className={`timer-ring ${timeLeft <= 3 ? 'urgent' : ''}`}>{timeLeft}</div>
          <div className="timer-lbl">seconds</div>
        </div>

        <div className="duel-sentence">
          <div className="duel-pl">{q.pl}</div>
          <div className="duel-hint">
            Q {qIdx + 1} of {DUEL_QUESTIONS.length} — Choose the correct translation
          </div>
        </div>

        <div className="duel-opts">
          {q.opts.map((opt) => {
            let cls = 'duel-opt';
            if (answered) {
              if (opt === q.correct) cls += ' hit';
              else if (opt === selected) cls += ' miss';
            }
            return (
              <button key={opt} className={cls} onClick={() => choose(opt)} disabled={answered}>
                {opt}
              </button>
            );
          })}
        </div>

        <div className="rival-typing">{rivalMsg}</div>

        {feedback && (
          <div className={`feedback-box ${feedback.type === 'good' ? 'good' : 'bad'}`} style={{ marginTop: 8 }}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
