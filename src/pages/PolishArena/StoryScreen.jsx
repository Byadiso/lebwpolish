import React, { useState } from 'react';
import { STORY_PARTS } from './data';

const BADGE_COLORS = {
  smart: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  risky: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  bad: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

export default function StoryScreen({ onBack, onXpGain, totalXp, toast }) {
  const [part, setPart] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [consequence, setConsequence] = useState(null);

  const s = STORY_PARTS[part];
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

  if (done) {
    return (
      <div className="screen-inner">
        <button className="back-btn" onClick={onBack}>← Arena</button>
        <div className="story-complete">
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
          <div className="complete-title" style={{ color: '#6366f1' }}>
            Episode Complete!
          </div>
          <div className="complete-sub">
            Marek survived the interview. Episode 4 unlocks when you earn 800 XP total. You
            currently have{' '}
            <strong style={{ color: '#a78bfa' }}>{totalXp}</strong> XP.
          </div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={onBack}>
            Return to Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-inner">
      <button className="back-btn" onClick={onBack}>← Arena</button>
      <div className="screen-title">Powieść Interaktywna</div>
      <div className="screen-sub">You are Marek. Every word you say has consequences.</div>

      {toast && <div className="xp-toast show">{toast}</div>}

      <div className="story-card">
        <div className="story-scene">
          <div className="story-ep">{s.ep}</div>
          <div className="story-title-sm">{s.title}</div>
          <div className="story-loc">📍 {s.location}</div>
        </div>

        <div className="story-body">
          <div className="story-narration">{s.narration}</div>

          <div className="story-prompt-box">
            <div className="prompt-label">She says</div>
            <div className="prompt-text">{s.prompt}</div>
          </div>

          <div className="choices-label">Choose your response:</div>

          <div className="story-choices">
            {s.choices.map((c, i) => {
              let cls = 'story-choice';
              if (chosen !== null) {
                if (i === chosen) {
                  cls += c.outcome === 'good' ? ' chosen-good' : ' chosen-bad';
                } else {
                  cls += ' faded';
                }
              }
              const badge = BADGE_COLORS[c.badge] || BADGE_COLORS.risky;
              return (
                <div key={i} className={cls} onClick={() => choose(i)}>
                  <div className="choice-polish">{c.pl}</div>
                  <div className="choice-eng">{c.en}</div>
                  <span
                    className="choice-badge"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {c.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {consequence && (
            <div
              className={`consequence ${
                consequence.type === 'good'
                  ? 'good'
                  : consequence.type === 'bad'
                  ? 'bad'
                  : 'neutral'
              }`}
            >
              {consequence.text}
            </div>
          )}

          {chosen !== null && (
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={next}>
              Continue Story →
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="story-progress">
        {STORY_PARTS.map((_, i) => (
          <div
            key={i}
            className={`sp ${i < part ? 'done' : i === part ? 'current' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
