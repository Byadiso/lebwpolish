import React, { useState, useRef, useCallback } from 'react';
import { SUBJECTS, VERBS, OBJECTS } from './data';

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SlotScreen({ onBack, onXpGain, toast }) {
  const [reelState, setReelState] = useState('idle'); // idle | spinning | answering | done
  const [reels, setReels] = useState([
    { word: '—', tr: '', locked: false },
    { word: '—', tr: '', locked: false },
    { word: '—', tr: '', locked: false },
  ]);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'good'|'bad', text }
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef(null);

  const spin = useCallback(() => {
    if (reelState === 'spinning') return;
    setReelState('spinning');
    setFeedback(null);
    setAnswer('');

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
      }
    }, 80);
  }, [reelState]);

  const checkAnswer = () => {
    if (!current) return;
    const { s, v, o } = current;
    const correct = `${s.en} ${v.en} ${o.en}`.toLowerCase().replace(/\./g, '');
    const ans = answer.toLowerCase().trim().replace(/\./g, '');
    const correctWords = correct.split(/\s+/);
    const hits = correctWords.filter((w) => ans.includes(w)).length;
    const isCorrect = ans === correct || hits === correctWords.length;
    const isNear = hits >= correctWords.length - 1 && !isCorrect;

    if (isCorrect) {
      setFeedback({
        type: 'good',
        text: `Perfect! "${s.en} ${v.en} ${o.en}." — Excellent Polish instinct!`,
      });
      const pts = 100;
      setScore((sc) => sc + pts);
      setStreak((st) => st + 1);
      onXpGain(pts);
    } else if (isNear) {
      setFeedback({
        type: 'bad',
        text: `So close! The answer was: "${s.en} ${v.en} ${o.en}." You had most of it!`,
      });
      setScore((sc) => sc + 20);
      setStreak(0);
      onXpGain(20);
    } else {
      setFeedback({
        type: 'bad',
        text: `Not quite. Answer: "${s.en} ${v.en} ${o.en}." — Review: ${s.pl}=${s.en}, ${v.pl}=${v.en}, ${o.pl}=${o.en}`,
      });
      setStreak(0);
    }
    setReelState('done');
  };

  const REEL_LABELS = ['Subject', 'Verb', 'Object'];

  return (
    <div className="screen-inner">
      <button className="back-btn" onClick={onBack}>
        ← Arena
      </button>
      <div className="screen-title">Losowanie Słowa</div>
      <div className="screen-sub">
        Spin the reels — translate what you get. No two rounds are the same.
      </div>

      {toast && <div className="xp-toast show">{toast}</div>}

      <div className="slot-wrap">
        <div className="reels-grid">
          {reels.map((reel, i) => (
            <div
              key={i}
              className={`reel ${reelState === 'spinning' ? 'spinning' : ''} ${reel.locked ? 'locked' : ''}`}
            >
              <div className="reel-lbl">{REEL_LABELS[i]}</div>
              <div className="reel-word">{reel.word}</div>
              <div className="reel-tr">{reel.tr}</div>
            </div>
          ))}
        </div>

        {reelState !== 'idle' && reelState !== 'spinning' && current && (
          <div className="slot-sentence">
            <div className="slot-pl">
              {current.s.pl} {current.v.pl} {current.o.pl}.
            </div>
            <div className="slot-hint">Translate the full sentence into English</div>
          </div>
        )}

        {(reelState === 'answering' || reelState === 'done') && (
          <input
            className={`answer-input ${feedback?.type === 'good' ? 'correct' : feedback?.type === 'bad' ? 'wrong' : ''}`}
            placeholder="Type your English translation..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && reelState === 'answering' && checkAnswer()}
            disabled={reelState === 'done'}
          />
        )}

        {feedback && (
          <div className={`feedback-box ${feedback.type === 'good' ? 'good' : 'bad'}`}>
            {feedback.text}
          </div>
        )}

        {reelState === 'idle' && (
          <button className="btn-primary" onClick={spin}>
            SPIN
          </button>
        )}
        {reelState === 'answering' && (
          <button className="btn-primary" onClick={checkAnswer} disabled={!answer.trim()}>
            CHECK TRANSLATION
          </button>
        )}
        {reelState === 'done' && (
          <button
            className="btn-secondary"
            onClick={() => {
              setReelState('idle');
              setReels([
                { word: '—', tr: '', locked: false },
                { word: '—', tr: '', locked: false },
                { word: '—', tr: '', locked: false },
              ]);
              spin();
            }}
          >
            SPIN AGAIN
          </button>
        )}
      </div>

      <div className="score-row">
        <div className="stat">
          <div className="stat-val">{score}</div>
          <div className="stat-lbl">Score</div>
        </div>
        <div className="stat">
          <div className="stat-val" style={{ color: '#f97316' }}>
            {streak}
          </div>
          <div className="stat-lbl">Streak</div>
        </div>
      </div>
    </div>
  );
}
