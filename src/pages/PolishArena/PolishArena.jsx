import React, { useState, useCallback } from 'react';
import HubScreen from './HubScreen';
import SlotScreen from './SlotScreen';
import PhantomScreen from './PhantomScreen';
import DuelScreen from './DuelScreen';
import StoryScreen from './StoryScreen';
import './PolishArena.css';

const NAV_ITEMS = [
  { id: 'hub',     icon: '🏠', label: 'Arena Hub' },
  { id: 'slot',    icon: '🎰', label: 'Spin & Learn', pip: 'New' },
  { id: 'phantom', icon: '👻', label: 'Phantom Words' },
  { id: 'duel',    icon: '⚔️',  label: 'Duel Mode' },
  { id: 'story',   icon: '📺', label: 'Story Mode' },
];

const ACCOUNT_ITEMS = [
  { id: 'progress', icon: '📊', label: 'Progress' },
  { id: 'settings', icon: '⚙️',  label: 'Settings' },
];

const DAILY_CHALLENGES = [
  { label: 'Win a Duel',           progress: 'Completed', total: 1,  done: 1,  xp: 25 },
  { label: '10 correct in Spin',   progress: '7 / 10',    total: 10, done: 7,  xp: 40 },
  { label: 'Survive Phantom Mode', progress: '0 / 1',     total: 1,  done: 0,  xp: 60 },
];

const LEADERBOARD = [
  { rank: 1, initials: 'AK', name: 'anna_k',   xp: 1240, you: false },
  { rank: 2, initials: 'MP', name: 'marek_pl', xp: 980,  you: false },
  { rank: 3, initials: 'ZW', name: 'zia_w',    xp: 870,  you: false },
  { rank: 5, initials: 'KR', name: 'you',      xp: 640,  you: true  },
];

const RECENT_ACTIVITY = [
  { icon: '🎰', color: 'indigo', name: 'Spin & Learn — Round 4',   sub: '3 words correct · 2 minutes ago', xp: 30 },
  { icon: '⚔️',  color: 'indigo', name: 'Duel vs. Marek_PL',        sub: 'Victory · 5–3 · 14 min ago',      xp: 50 },
  { icon: '📺', color: 'amber',  name: 'Story — Chapter 2 complete',sub: 'All choices correct · Yesterday', xp: 80 },
];

const RANK_CLASS = { 1: 'gold', 2: 'silver', 3: 'bronze' };

const XP_TO_NEXT = 1000;

export default function PolishArena() {
  const [screen, setScreen]   = useState('hub');
  const [stats, setStats]     = useState({ streak: 7, xp: 640, wins: 3, ghosts: 2 });
  const [toast, setToast]     = useState({ hub: '', slot: '', phantom: '', duel: '', story: '' });

  const showToast = useCallback((src, msg) => {
    setToast((t) => ({ ...t, [src]: msg }));
    setTimeout(() => setToast((t) => ({ ...t, [src]: '' })), 2200);
  }, []);

  const gainXP = useCallback((amt, src = 'hub') => {
    setStats((s) => ({ ...s, xp: s.xp + amt }));
    showToast(src, `+${amt} XP earned!`);
  }, [showToast]);

  const navigate = (id) => setScreen(id);

  const xpPct = Math.min(100, Math.round((stats.xp / XP_TO_NEXT) * 100));

  /* ── Sidebar ─────────────────────────────────────────────── */
  const Sidebar = () => (
    <aside className="pa-sidebar">
      <div className="pa-sidebar-section-label">Modes</div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`pa-nav-item ${screen === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.id)}
        >
          <span className="pa-nav-icon">{item.icon}</span>
          <span className="pa-nav-label">{item.label}</span>
          {item.pip && <span className="pa-nav-pip">{item.pip}</span>}
        </button>
      ))}

      <div className="pa-sidebar-section-label">Account</div>
      {ACCOUNT_ITEMS.map((item) => (
        <button key={item.id} className="pa-nav-item">
          <span className="pa-nav-icon">{item.icon}</span>
          <span className="pa-nav-label">{item.label}</span>
        </button>
      ))}

      <div className="pa-sidebar-footer">
        <div className="pa-sf-label">Level 4 → 5</div>
        <div className="pa-xp-bar-wrap">
          <div className="pa-xp-bar" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="pa-xp-row">
          <span className="pa-xp-num">{stats.xp.toLocaleString()} XP</span>
          <span className="pa-xp-max">{XP_TO_NEXT.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  );

  /* ── Top Bar ─────────────────────────────────────────────── */
  const TopBar = () => (
    <header className="pa-topbar">
      <div className="pa-topbar-title">
        Polish <span>Arena</span>
      </div>
      <div className="pa-topbar-stats">
        {[
          { icon: '🔥', val: stats.streak, lbl: 'Streak',  cls: 'fire'   },
          { icon: '⭐', val: stats.xp,     lbl: 'XP',      cls: 'purple' },
          { icon: '⚔️',  val: stats.wins,   lbl: 'Wins',    cls: 'gold'   },
          { icon: '👻', val: stats.ghosts, lbl: 'Ghosts',  cls: 'ghost'  },
        ].map(({ icon, val, lbl, cls }) => (
          <div className="pa-tstat" key={lbl}>
            <span className="pa-tstat-icon">{icon}</span>
            <div>
              <div className={`pa-tstat-val ${cls}`}>{val.toLocaleString()}</div>
              <div className="pa-tstat-lbl">{lbl}</div>
            </div>
          </div>
        ))}
        <div className="pa-avatar">KR</div>
      </div>
    </header>
  );

  /* ── Right Panel ─────────────────────────────────────────── */
  const Panel = () => (
    <aside className="pa-panel">
      {/* Word of the Day */}
      <div className="pa-wod-card">
        <div className="pa-wod-label">Word of the Day</div>
        <div className="pa-wod-word">Serce</div>
        <div className="pa-wod-trans">heart (noun, neuter)</div>
        <div className="pa-wod-def">
          The organ that pumps blood; also used poetically for love or courage.
        </div>
        <div className="pa-wod-example">"Masz dobre serce." — You have a good heart.</div>
      </div>

      {/* Daily Challenges */}
      <div className="pa-panel-section">
        <div className="pa-panel-title">Daily Challenges</div>
        <div className="pa-challenge-list">
          {DAILY_CHALLENGES.map((c) => (
            <div className="pa-challenge" key={c.label}>
              <div className={`pa-ch-check ${c.done >= c.total ? 'done' : ''}`} />
              <div className="pa-ch-info">
                <div className="pa-ch-name">{c.label}</div>
                <div className="pa-ch-prog">{c.progress}</div>
              </div>
              <div className="pa-ch-xp">+{c.xp} XP</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="pa-panel-section">
        <div className="pa-panel-title">Leaderboard — This Week</div>
        <div className="pa-leader-list">
          {LEADERBOARD.map((entry) => (
            <div
              className={`pa-leader-row ${entry.you ? 'you' : ''}`}
              key={entry.name}
            >
              <div className={`pa-leader-rank ${RANK_CLASS[entry.rank] ?? ''}`}>
                {entry.rank}
              </div>
              <div className={`pa-leader-av ${entry.you ? 'you' : ''}`}>
                {entry.initials}
              </div>
              <div className={`pa-leader-name ${entry.you ? 'you' : ''}`}>
                {entry.name}
              </div>
              <div className={`pa-leader-xp ${entry.you ? 'you' : ''}`}>
                {entry.xp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="pa-panel-section">
        <button className="pa-qs-btn primary" onClick={() => navigate('duel')}>
          Quick Start — Duel
        </button>
        <button className="pa-qs-btn secondary" onClick={() => navigate('slot')}>
          Practice Vocabulary
        </button>
      </div>
    </aside>
  );

  /* ── Hub centre content ──────────────────────────────────── */
  const HubCenter = () => (
    <div className="pa-hub-center">
      <div className="pa-content-header">
        <div className="pa-ch-eyebrow">Good morning, learner</div>
        <div className="pa-ch-title">Choose Your Mode</div>
        <div className="pa-ch-sub">Pick a training style and start earning XP</div>
      </div>

      <div className="pa-mode-grid">
        {[
          { id: 'slot',    icon: '🎰', accent: 'indigo', tag: 'Vocabulary',   name: 'Spin & Learn',   desc: 'Three random words spin into a sentence — translate it before time runs out.', pip: 'New',  pipCls: 'new'  },
          { id: 'phantom', icon: '👻', accent: 'red',    tag: 'Survival',     name: 'Phantom Words',  desc: 'Rare, tricky words haunt you. One wrong answer and the ghost wins.',          pip: 'Hard', pipCls: 'hot'  },
          { id: 'duel',    icon: '⚔️',  accent: 'amber',  tag: 'Competitive',  name: 'Duel Mode',      desc: 'Race a rival in real-time. First to 5 correct answers takes the match.'                             },
          { id: 'story',   icon: '📺', accent: 'teal',   tag: 'Narrative',    name: 'Story Mode',     desc: 'Navigate a story with branching choices — your Polish determines the plot.'                          },
        ].map((m) => (
          <div
            className={`pa-mode-card accent-${m.accent}`}
            key={m.id}
            onClick={() => navigate(m.id)}
          >
            <span className="pa-mode-icon">{m.icon}</span>
            <div className={`pa-mode-tag tag-${m.accent}`}>{m.tag}</div>
            <div className="pa-mode-name">{m.name}</div>
            <div className="pa-mode-desc">{m.desc}</div>
            {m.pip && (
              <div className={`pa-mode-pip pip-${m.pipCls}`}>{m.pip}</div>
            )}
          </div>
        ))}
      </div>

      <div className="pa-section-label">Recent Activity</div>
      <div className="pa-activity-list">
        {RECENT_ACTIVITY.map((a) => (
          <div className="pa-activity-row" key={a.name}>
            <div className={`pa-act-icon color-${a.color}`}>{a.icon}</div>
            <div className="pa-act-info">
              <div className="pa-act-name">{a.name}</div>
              <div className="pa-act-sub">{a.sub}</div>
            </div>
            <div className="pa-act-xp">+{a.xp} XP</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── XP Toast ────────────────────────────────────────────── */
  const XpToast = ({ msg }) =>
    msg ? <div className="pa-xp-toast show">{msg}</div> : null;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="pa-root">
      <TopBar />
      <div className="pa-body">
        <Sidebar />

        <main className="pa-content">
          {screen === 'hub' && (
            <>
              <XpToast msg={toast.hub} />
              <HubCenter />
            </>
          )}
          {screen === 'slot' && (
            <>
              <XpToast msg={toast.slot} />
              <SlotScreen
                onBack={() => navigate('hub')}
                onXpGain={(amt) => gainXP(amt, 'slot')}
                toast={toast.slot}
              />
            </>
          )}
          {screen === 'phantom' && (
            <>
              <XpToast msg={toast.phantom} />
              <PhantomScreen
                onBack={() => navigate('hub')}
                onXpGain={(amt) => gainXP(amt, 'phantom')}
                toast={toast.phantom}
              />
            </>
          )}
          {screen === 'duel' && (
            <>
              <XpToast msg={toast.duel} />
              <DuelScreen
                onBack={() => navigate('hub')}
                onXpGain={(amt) => gainXP(amt, 'duel')}
                onWin={() => setStats((s) => ({ ...s, wins: s.wins + 1 }))}
                toast={toast.duel}
              />
            </>
          )}
          {screen === 'story' && (
            <>
              <XpToast msg={toast.story} />
              <StoryScreen
                onBack={() => navigate('hub')}
                onXpGain={(amt) => gainXP(amt, 'story')}
                totalXp={stats.xp}
                toast={toast.story}
              />
            </>
          )}
        </main>

        <Panel />
      </div>
    </div>
  );
}
