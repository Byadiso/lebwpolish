import React, { useState } from 'react';
import { PHANTOM_DATA } from './data';

export default function PhantomScreen({ onBack, onXpGain, toast }) {
  const [idx, setIdx] = useState(0);
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

  if (done) {
    return (
      <div className="screen-inner">
        <button className="back-btn" onClick={onBack}>← Arena</button>
        <div className="phantom-complete">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div className="complete-title" style={{ color: '#10b981' }}>
            All Ghosts Exorcised!
          </div>
          <div className="complete-sub">
            Your weaknesses became strengths. New phantoms will appear after your next session.
          </div>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={onBack}>
            Return to Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-inner">
      <button className="back-btn" onClick={onBack}>← Arena</button>
      <div className="screen-title">Karta Cienia</div>
      <div className="screen-sub">
        These words already defeated you once. They're back. Face them.
      </div>

      {toast && <div className="xp-toast show">{toast}</div>}

      {/* Ghost pips */}
      <div className="ghost-pips">
        {PHANTOM_DATA.map((_, i) => (
          <div
            key={i}
            className={`ghost-pip ${i < 2 ? 'haunted' : ''} ${i < idx ? 'done' : ''}`}
          />
        ))}
      </div>

      <div className="phantom-card">
        <div className="phantom-icon">👻</div>
        <div className="phantom-label">
          This word haunts you — Card {idx + 1} of {PHANTOM_DATA.length}
        </div>
        <div className="phantom-word">{card.word}</div>
        <div className="phantom-context">Context: "{card.ctx}"</div>

        <div className="phantom-opts">
          {card.opts.map((opt) => {
            let cls = 'phantom-opt';
            if (answered) {
              if (opt === card.correct) cls += ' reveal-good';
              else if (opt === selected) cls += ' sel-bad';
            }
            return (
              <button key={opt} className={cls} onClick={() => choose(opt)} disabled={answered}>
                {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`feedback-box ${feedback.type === 'good' ? 'good' : 'bad'}`}>
            {feedback.text}
          </div>
        )}
      </div>

      {answered && (
        <button className="btn-primary" onClick={next}>
          Next Ghost →
        </button>
      )}
    </div>
  );
}
