import React, { useState, useCallback, useEffect } from 'react';
import HubScreen from './HubScreen';
import SlotScreen from './SlotScreen';
import PhantomScreen from './PhantomScreen';
import DuelScreen from './DuelScreen';
import StoryScreen from './StoryScreen';
import { useProgressTracker } from '../../hooks/useProgressTracker';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

/* ─── Static data ──────────────────────────────────────────────────────────── */
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
  { rank: 5, initials: 'YO', name: 'you',      xp: 640,  you: true  },
];

const RECENT_ACTIVITY = [
  { icon: '🎰', name: 'Spin & Learn — Round 4',    sub: '3 words correct · 2 minutes ago', xp: 30 },
  { icon: '⚔️',  name: 'Duel vs. Marek_PL',         sub: 'Victory · 5–3 · 14 min ago',      xp: 50 },
  { icon: '📺', name: 'Story — Chapter 2 complete', sub: 'All choices correct · Yesterday', xp: 80 },
];

const RANK_CLASS = { 1: 'gold', 2: 'silver', 3: 'bronze' };
const XP_TO_NEXT = 1000;

const BADGE_DEFS = [
  { id: 'first_spin',    label: 'First Spin',   icon: '🎰' },
  { id: 'on_fire',       label: 'On Fire',       icon: '🔥' },
  { id: 'centurion',     label: 'Centurion',     icon: '⚔️' },
  { id: 'wordsmith',     label: 'Wordsmith',     icon: '📖' },
  { id: 'duel_master',   label: 'Duel Master',   icon: '🏆' },
  { id: 'perfectionist', label: 'Perfectionist', icon: '✦'  },
  { id: 'ghost_hunter',  label: 'Ghost Hunter',  icon: '👻' },
  { id: 'storyteller',   label: 'Storyteller',   icon: '📺' },
];

/* ─── Main component ────────────────────────────────────────────────────────── */
export default function PolishArena() {
  const { user } = useAuth();
  const tracker  = useProgressTracker();

  const [screen, setScreen] = useState('hub');
  const [stats,  setStats]  = useState({ streak: 7, xp: 640, wins: 3, ghosts: 2 });
  const [liveStats, setLiveStats] = useState(null); // from Firebase
  const [toast,  setToast]  = useState({ hub: '', slot: '', phantom: '', duel: '', story: '' });
  const [badgeToast, setBadgeToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Subscribe to live stats from Firebase ──────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'stats', 'aggregate');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setLiveStats(snap.data());
    });
    return unsub;
  }, [user]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = useCallback((src, msg) => {
    setToast(t => ({ ...t, [src]: msg }));
    setTimeout(() => setToast(t => ({ ...t, [src]: '' })), 2400);
  }, []);

  // ── XP gain — updates local state AND tracks to Firebase ──────────────────
  const gainXP = useCallback(async (amt, src = 'hub') => {
    setStats(s => ({ ...s, xp: s.xp + amt }));
    showToast(src, `+${amt} XP earned!`);
    await tracker.logXp(amt, src);
  }, [showToast, tracker]);

  // ── Game result tracker — call this from child screens ────────────────────
  const trackResult = useCallback(async (game, result, xp = 0, hintsUsed = 0, extra = {}) => {
    await tracker.logGameResult({ game, result, xp, hintsUsed, extra });
    if (result === 'win') setStats(s => ({ ...s, wins: s.wins + 1 }));
  }, [tracker]);

  const navigate = (id) => { setScreen(id); setSidebarOpen(false); };

  const displayXp  = liveStats?.totalXp  ?? stats.xp;
  const displayStreak = liveStats?.currentStreak ?? stats.streak;
  const displayWins   = liveStats?.duelWins     ?? stats.wins;
  const earnedBadges  = liveStats?.earnedBadges ?? [];
  const xpPct = Math.min(100, Math.round((displayXp / XP_TO_NEXT) * 100));

  /* ─── Sidebar ─────────────────────────────────────────────────────────────── */
  const Sidebar = () => (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="pa-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`pa-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="pa-sidebar-logo">
          <span className="pa-logo-mark">✦</span>
          <span className="pa-logo-text">Polish Arena</span>
        </div>

        <div className="pa-sidebar-section-label">Modes</div>
        {NAV_ITEMS.map(item => (
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
        {ACCOUNT_ITEMS.map(item => (
          <button key={item.id} className="pa-nav-item">
            <span className="pa-nav-icon">{item.icon}</span>
            <span className="pa-nav-label">{item.label}</span>
          </button>
        ))}

        {/* Live stats mini panel */}
        {liveStats && (
          <div className="pa-sidebar-live">
            <div className="pa-sl-label">Live Stats</div>
            <div className="pa-sl-grid">
              <div className="pa-sl-item"><span className="pa-sl-val">{liveStats.totalRounds || 0}</span><span className="pa-sl-key">Rounds</span></div>
              <div className="pa-sl-item"><span className="pa-sl-val">{liveStats.totalCorrect || 0}</span><span className="pa-sl-key">Correct</span></div>
              <div className="pa-sl-item"><span className="pa-sl-val">{liveStats.postsPublished || 0}</span><span className="pa-sl-key">Posts</span></div>
              <div className="pa-sl-item"><span className="pa-sl-val">{liveStats.vocabAdded || 0}</span><span className="pa-sl-key">Words</span></div>
            </div>
          </div>
        )}

        <div className="pa-sidebar-footer">
          <div className="pa-sf-label">Level 4 → 5</div>
          <div className="pa-xp-bar-wrap">
            <div className="pa-xp-bar" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="pa-xp-row">
            <span className="pa-xp-num">{displayXp.toLocaleString()} XP</span>
            <span className="pa-xp-max">{XP_TO_NEXT.toLocaleString()}</span>
          </div>
        </div>
      </aside>
    </>
  );

  /* ─── Top Bar ─────────────────────────────────────────────────────────────── */
  const TopBar = () => (
    <header className="pa-topbar">
      <button className="pa-hamburger" onClick={() => setSidebarOpen(o => !o)}>
        <span /><span /><span />
      </button>
      <div className="pa-topbar-stats">
        {[
          { icon: '🔥', val: displayStreak, lbl: 'Streak',  cls: 'fire'   },
          { icon: '⭐', val: displayXp,     lbl: 'XP',      cls: 'purple' },
          { icon: '⚔️',  val: displayWins,   lbl: 'Wins',    cls: 'gold'   },
          { icon: '👻', val: stats.ghosts,  lbl: 'Ghosts',  cls: 'ghost'  },
        ].map(({ icon, val, lbl, cls }) => (
          <div className="pa-tstat" key={lbl}>
            <span className="pa-tstat-icon">{icon}</span>
            <div>
              <div className={`pa-tstat-val ${cls}`}>{val.toLocaleString()}</div>
              <div className="pa-tstat-lbl">{lbl}</div>
            </div>
          </div>
        ))}
      </div>
    </header>
  );

  /* ─── Right Panel ─────────────────────────────────────────────────────────── */
  const Panel = () => (
    <aside className="pa-panel">
      {/* Word of the Day */}
      <div className="pa-wod-card">
        <div className="pa-wod-label">Word of the Day</div>
        <div className="pa-wod-word">Serce</div>
        <div className="pa-wod-trans">heart · noun, neuter</div>
        <div className="pa-wod-def">
          The organ that pumps blood; used poetically for love or courage.
        </div>
        <div className="pa-wod-example">"Masz dobre serce." — You have a good heart.</div>
      </div>

      {/* Badges */}
      <div className="pa-panel-section">
        <div className="pa-panel-title">Badges</div>
        <div className="pa-badge-grid">
          {BADGE_DEFS.map(b => {
            const earned = earnedBadges.includes(b.id);
            return (
              <div key={b.id} className={`pa-badge ${earned ? 'earned' : 'locked'}`} title={b.label}>
                <span className="pa-badge-icon">{b.icon}</span>
                <span className="pa-badge-lbl">{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="pa-panel-section">
        <div className="pa-panel-title">Daily Challenges</div>
        <div className="pa-challenge-list">
          {DAILY_CHALLENGES.map(c => (
            <div className="pa-challenge" key={c.label}>
              <div className={`pa-ch-check ${c.done >= c.total ? 'done' : ''}`}>
                {c.done >= c.total && '✓'}
              </div>
              <div className="pa-ch-info">
                <div className="pa-ch-name">{c.label}</div>
                <div className="pa-ch-bar-wrap">
                  <div className="pa-ch-bar" style={{ width: `${Math.min(100, (c.done / c.total) * 100)}%` }} />
                </div>
                <div className="pa-ch-prog">{c.progress}</div>
              </div>
              <div className="pa-ch-xp">+{c.xp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="pa-panel-section">
        <div className="pa-panel-title">Leaderboard — This Week</div>
        <div className="pa-leader-list">
          {LEADERBOARD.map(entry => (
            <div className={`pa-leader-row ${entry.you ? 'you' : ''}`} key={entry.name}>
              <div className={`pa-leader-rank ${RANK_CLASS[entry.rank] ?? ''}`}>{entry.rank}</div>
              <div className={`pa-leader-av ${entry.you ? 'you' : ''}`}>{entry.initials}</div>
              <div className={`pa-leader-name ${entry.you ? 'you' : ''}`}>{entry.name}</div>
              <div className={`pa-leader-xp ${entry.you ? 'you' : ''}`}>{entry.xp.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="pa-panel-section">
        <button className="pa-qs-btn primary"   onClick={() => navigate('duel')}>Quick Start — Duel</button>
        <button className="pa-qs-btn secondary" onClick={() => navigate('slot')}>Practice Vocabulary</button>
      </div>
    </aside>
  );

  /* ─── Hub centre ──────────────────────────────────────────────────────────── */
  const HubCenter = () => (
    <div className="pa-hub-center">
      <div className="pa-content-header">
        <div className="pa-ch-eyebrow">Good morning, learner</div>
        <div className="pa-ch-title">Choose Your Mode</div>
        <div className="pa-ch-sub">Pick a training style and start earning XP</div>
      </div>

      {/* Live stats row */}
      {liveStats && (
        <div className="pa-live-row">
          {[
            { label: 'Total XP',     val: (liveStats.totalXp     || 0).toLocaleString(), icon: '⭐' },
            { label: 'Rounds Played',val: (liveStats.totalRounds  || 0).toLocaleString(), icon: '🎮' },
            { label: 'Correct',      val: (liveStats.totalCorrect || 0).toLocaleString(), icon: '✓'  },
            { label: 'Words Written',val: (liveStats.totalWordsWritten || 0).toLocaleString(), icon: '✍️' },
          ].map(s => (
            <div key={s.label} className="pa-live-stat">
              <span className="pa-ls-icon">{s.icon}</span>
              <span className="pa-ls-val">{s.val}</span>
              <span className="pa-ls-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pa-mode-grid">
        {[
          { id: 'slot',    icon: '🎰', accent: 'indigo', tag: 'Vocabulary',  name: 'Spin & Learn',  desc: 'Three random words spin into a sentence — translate it before time runs out.', pip: 'New',  pipCls: 'new' },
          { id: 'phantom', icon: '👻', accent: 'red',    tag: 'Survival',    name: 'Phantom Words', desc: 'Rare, tricky words haunt you. One wrong answer and the ghost wins.',          pip: 'Hard', pipCls: 'hot' },
          { id: 'duel',    icon: '⚔️',  accent: 'amber',  tag: 'Competitive', name: 'Duel Mode',     desc: 'Race a rival in real-time. First to 5 correct answers takes the match.' },
          { id: 'story',   icon: '📺', accent: 'teal',   tag: 'Narrative',   name: 'Story Mode',    desc: 'Navigate a story with branching choices — your Polish determines the plot.' },
        ].map(m => (
          <div className={`pa-mode-card accent-${m.accent}`} key={m.id} onClick={() => navigate(m.id)}>
            <span className="pa-mode-icon">{m.icon}</span>
            <div className={`pa-mode-tag tag-${m.accent}`}>{m.tag}</div>
            <div className="pa-mode-name">{m.name}</div>
            <div className="pa-mode-desc">{m.desc}</div>
            {m.pip && <div className={`pa-mode-pip pip-${m.pipCls}`}>{m.pip}</div>}
          </div>
        ))}
      </div>

      <div className="pa-section-label">Recent Activity</div>
      <div className="pa-activity-list">
        {RECENT_ACTIVITY.map(a => (
          <div className="pa-activity-row" key={a.name}>
            <div className="pa-act-icon">{a.icon}</div>
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

  /* ─── XP Toast ────────────────────────────────────────────────────────────── */
  const XpToast = ({ msg }) => msg ? <div className="pa-xp-toast show">{msg}</div> : null;

  /* ─── Badge Toast ─────────────────────────────────────────────────────────── */
  const BadgeToast = () => badgeToast ? (
    <div className="pa-badge-toast">
      <span>{badgeToast.icon}</span>
      <div>
        <div className="pa-bt-title">Badge Unlocked!</div>
        <div className="pa-bt-name">{badgeToast.label}</div>
      </div>
    </div>
  ) : null;

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .pa-root {
          font-family: 'DM Sans', sans-serif;
          background: #020617;
          color: #f0f0ff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }
        .pa-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 900px 500px at 20% 10%, rgba(99,102,241,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 600px 400px at 85% 80%, rgba(52,211,153,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 400px 300px at 50% 50%, rgba(245,158,11,0.03) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* ── Topbar ── */
        .pa-topbar {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
          height: 60px;
          background: rgba(2,6,23,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pa-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 6px;
        }
        .pa-hamburger span {
          display: block; width: 22px; height: 2px;
          background: rgba(255,255,255,0.6); border-radius: 2px; transition: all 0.2s;
        }
        @media (max-width: 1023px) { .pa-hamburger { display: flex; } }

        .pa-topbar-stats { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .pa-tstat {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .pa-tstat:hover { border-color: rgba(99,102,241,0.2); }
        .pa-tstat-icon { font-size: 15px; }
        .pa-tstat-val {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 17px; font-weight: 700; line-height: 1; color: #f0f0ff;
        }
        .pa-tstat-val.fire   { color: #f59e0b; }
        .pa-tstat-val.purple { color: #818cf8; }
        .pa-tstat-val.gold   { color: #f59e0b; }
        .pa-tstat-val.ghost  { color: #34d399; }
        .pa-tstat-lbl { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.28); }

        /* ── Body ── */
        .pa-body {
          display: flex; flex: 1; position: relative; z-index: 1;
        }

        /* ── Sidebar ── */
        .pa-sidebar {
          width: 240px; flex-shrink: 0;
          background: #0a0f1e;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column;
          padding: 24px 14px 20px;
          gap: 2px;
          overflow-y: auto;
          position: sticky; top: 60px; height: calc(100vh - 60px);
        }
        @media (max-width: 1023px) {
          .pa-sidebar {
            position: fixed; top: 60px; left: 0; bottom: 0; z-index: 100;
            transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
            width: 260px;
          }
          .pa-sidebar.open { transform: translateX(0); }
        }
        .pa-sidebar-overlay {
          display: none;
          @media (max-width: 1023px) { display: block; }
          position: fixed; inset: 0; z-index: 99;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
        }

        .pa-sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 8px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 16px;
        }
        .pa-logo-mark { font-size: 20px; color: #818cf8; }
        .pa-logo-text {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 17px; font-weight: 700; color: #f0f0ff;
        }

        .pa-sidebar-section-label {
          font-size: 8px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.22em; color: rgba(255,255,255,0.22);
          padding: 14px 10px 6px; margin-top: 4px;
        }
        .pa-nav-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px;
          background: none; border: none; border-radius: 12px;
          color: rgba(255,255,255,0.45); font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer; text-align: left;
          transition: all 0.18s; position: relative;
        }
        .pa-nav-item:hover { background: rgba(99,102,241,0.1); color: #c4b5fd; }
        .pa-nav-item.active {
          background: rgba(99,102,241,0.15);
          color: #c4b5fd;
          border: 1px solid rgba(99,102,241,0.2);
        }
        .pa-nav-item.active::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0; background: #818cf8;
        }
        .pa-nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .pa-nav-label { flex: 1; }
        .pa-nav-pip {
          font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          padding: 2px 7px; border-radius: 6px;
          background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3);
        }

        /* Live stats in sidebar */
        .pa-sidebar-live {
          margin-top: 12px; padding: 14px;
          background: rgba(52,211,153,0.04);
          border: 1px solid rgba(52,211,153,0.12);
          border-radius: 14px;
        }
        .pa-sl-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(52,211,153,0.5); margin-bottom: 10px; }
        .pa-sl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .pa-sl-item { display: flex; flex-direction: column; gap: 2px; }
        .pa-sl-val { font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: #34d399; font-weight: 700; line-height: 1; }
        .pa-sl-key { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.28); }

        .pa-sidebar-footer {
          margin-top: auto; padding: 16px 10px 4px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .pa-sf-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.28); margin-bottom: 8px; }
        .pa-xp-bar-wrap { height: 4px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; margin-bottom: 7px; }
        .pa-xp-bar { height: 100%; background: linear-gradient(90deg, #6366f1, #34d399); border-radius: 99px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .pa-xp-row { display: flex; justify-content: space-between; }
        .pa-xp-num { font-size: 11px; font-weight: 700; color: #818cf8; }
        .pa-xp-max { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.2); }

        /* ── Content ── */
        .pa-content { flex: 1; min-width: 0; overflow-y: auto; }

        /* ── Right Panel ── */
        .pa-panel {
          width: 300px; flex-shrink: 0;
          background: #0a0f1e;
          border-left: 1px solid rgba(255,255,255,0.05);
          padding: 24px 18px;
          overflow-y: auto;
          display: flex; flex-direction: column; gap: 20px;
          position: sticky; top: 60px; height: calc(100vh - 60px);
        }
        @media (max-width: 1280px) { .pa-panel { display: none; } }

        /* ── Word of the Day ── */
        .pa-wod-card {
          background: linear-gradient(135deg, #0d1526, #0a1520);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px; padding: 20px;
          position: relative; overflow: hidden;
        }
        .pa-wod-card::before {
          content: ''; position: absolute; top: -20px; right: -20px;
          width: 100px; height: 100px; background: rgba(99,102,241,0.1);
          border-radius: 50%;
        }
        .pa-wod-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: rgba(99,102,241,0.6); margin-bottom: 10px; }
        .pa-wod-word { font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; font-weight: 700; color: #f0f0ff; line-height: 1; margin-bottom: 4px; }
        .pa-wod-trans { font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
        .pa-wod-def { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.6; margin-bottom: 10px; }
        .pa-wod-example { font-size: 12px; font-style: italic; color: rgba(255,255,255,0.35); border-left: 2px solid rgba(99,102,241,0.3); padding-left: 10px; line-height: 1.55; }

        /* ── Badges ── */
        .pa-badge-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .pa-badge {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 10px 4px;
          border-radius: 12px; border: 1px solid;
          transition: all 0.2s; cursor: default;
        }
        .pa-badge.earned {
          background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25);
        }
        .pa-badge.earned:hover { border-color: rgba(99,102,241,0.45); transform: scale(1.05); }
        .pa-badge.locked { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06); opacity: 0.4; filter: grayscale(1); }
        .pa-badge-icon { font-size: 18px; }
        .pa-badge-lbl { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); text-align: center; line-height: 1.3; }
        .pa-badge.earned .pa-badge-lbl { color: #c4b5fd; }

        /* ── Panel sections ── */
        .pa-panel-section { display: flex; flex-direction: column; gap: 10px; }
        .pa-panel-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: rgba(255,255,255,0.28); }

        /* ── Challenges ── */
        .pa-challenge-list { display: flex; flex-direction: column; gap: 8px; }
        .pa-challenge { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; transition: border-color 0.2s; }
        .pa-challenge:hover { border-color: rgba(99,102,241,0.18); }
        .pa-ch-check {
          width: 18px; height: 18px; border-radius: 6px; flex-shrink: 0; margin-top: 1px;
          border: 1.5px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #34d399; transition: all 0.25s;
        }
        .pa-ch-check.done { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); }
        .pa-ch-info { flex: 1; }
        .pa-ch-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 5px; }
        .pa-ch-bar-wrap { height: 3px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; margin-bottom: 4px; }
        .pa-ch-bar { height: 100%; background: linear-gradient(90deg, #6366f1, #34d399); border-radius: 99px; transition: width 0.5s; }
        .pa-ch-prog { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.28); text-transform: uppercase; letter-spacing: 0.1em; }
        .pa-ch-xp { font-size: 11px; font-weight: 700; color: #818cf8; flex-shrink: 0; margin-top: 1px; }

        /* ── Leaderboard ── */
        .pa-leader-list { display: flex; flex-direction: column; gap: 6px; }
        .pa-leader-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.2s; }
        .pa-leader-row.you { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
        .pa-leader-rank { width: 22px; height: 22px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); flex-shrink: 0; }
        .pa-leader-rank.gold   { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .pa-leader-rank.silver { background: rgba(148,163,184,0.15); color: #94a3b8; }
        .pa-leader-rank.bronze { background: rgba(180,83,9,0.15);    color: #b45309; }
        .pa-leader-av { width: 28px; height: 28px; border-radius: 9px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); flex-shrink: 0; }
        .pa-leader-av.you { background: rgba(99,102,241,0.2); color: #818cf8; }
        .pa-leader-name { flex: 1; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55); }
        .pa-leader-name.you { color: #c4b5fd; }
        .pa-leader-xp { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); font-family: 'Playfair Display', serif; font-style: italic; }
        .pa-leader-xp.you { color: #818cf8; }

        /* ── Quick start ── */
        .pa-qs-btn {
          width: 100%; padding: 13px; border-radius: 13px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.18em; cursor: pointer; transition: all 0.2s;
          margin-bottom: 8px;
        }
        .pa-qs-btn:last-child { margin-bottom: 0; }
        .pa-qs-btn.primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; box-shadow: 0 6px 20px rgba(99,102,241,0.28); }
        .pa-qs-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,0.38); }
        .pa-qs-btn.secondary { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.09); }
        .pa-qs-btn.secondary:hover { border-color: rgba(99,102,241,0.3); color: #c4b5fd; background: rgba(99,102,241,0.08); }

        /* ── Hub center ── */
        .pa-hub-center { padding: 32px; max-width: 860px; }
        @media (max-width: 768px) { .pa-hub-center { padding: 20px 16px; } }

        .pa-content-header { margin-bottom: 28px; }
        .pa-ch-eyebrow { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.25em; color: rgba(99,102,241,0.6); margin-bottom: 8px; }
        .pa-ch-title { font-family: 'Playfair Display', serif; font-style: italic; font-size: clamp(26px, 4vw, 38px); font-weight: 700; color: #f0f0ff; line-height: 1.15; margin-bottom: 8px; }
        .pa-ch-sub { font-size: 14px; color: rgba(255,255,255,0.35); font-weight: 400; }

        /* Live stats row */
        .pa-live-row {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
          margin-bottom: 28px;
        }
        @media (max-width: 640px) { .pa-live-row { grid-template-columns: repeat(2, 1fr); } }
        .pa-live-stat {
          display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
          padding: 16px; background: #0d1526; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; transition: border-color 0.2s;
        }
        .pa-live-stat:hover { border-color: rgba(99,102,241,0.2); }
        .pa-ls-icon { font-size: 18px; margin-bottom: 4px; }
        .pa-ls-val { font-family: 'Playfair Display', serif; font-style: italic; font-size: 22px; font-weight: 700; color: #f0f0ff; line-height: 1; }
        .pa-ls-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.28); }

        /* Mode grid */
        .pa-mode-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 36px; }
        @media (max-width: 560px) { .pa-mode-grid { grid-template-columns: 1fr; } }

        .pa-mode-card {
          background: #0d1526; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px; padding: 24px 22px;
          cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden;
        }
        .pa-mode-card::before {
          content: ''; position: absolute; top: 0; right: 0;
          width: 120px; height: 120px; border-radius: 50%;
          opacity: 0; transition: opacity 0.3s;
        }
        .pa-mode-card:hover::before { opacity: 1; }
        .pa-mode-card:hover { transform: translateY(-3px); border-color: rgba(99,102,241,0.22); }
        .pa-mode-card:active { transform: scale(0.98); }

        .pa-mode-card.accent-indigo:hover { box-shadow: 0 16px 48px rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.25); }
        .pa-mode-card.accent-red:hover    { box-shadow: 0 16px 48px rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.22); }
        .pa-mode-card.accent-amber:hover  { box-shadow: 0 16px 48px rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.22); }
        .pa-mode-card.accent-teal:hover   { box-shadow: 0 16px 48px rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.22); }

        .pa-mode-card.accent-indigo::before { background: radial-gradient(circle, rgba(99,102,241,0.15), transparent); }
        .pa-mode-card.accent-red::before    { background: radial-gradient(circle, rgba(239,68,68,0.12), transparent); }
        .pa-mode-card.accent-amber::before  { background: radial-gradient(circle, rgba(245,158,11,0.12), transparent); }
        .pa-mode-card.accent-teal::before   { background: radial-gradient(circle, rgba(52,211,153,0.12), transparent); }

        .pa-mode-icon { font-size: 28px; display: block; margin-bottom: 12px; position: relative; z-index: 1; }
        .pa-mode-tag {
          font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em;
          padding: 3px 9px; border-radius: 7px; display: inline-block;
          margin-bottom: 10px; position: relative; z-index: 1;
        }
        .tag-indigo { background: rgba(99,102,241,0.12);  color: #818cf8;  border: 1px solid rgba(99,102,241,0.2); }
        .tag-red    { background: rgba(239,68,68,0.1);    color: #f87171;  border: 1px solid rgba(239,68,68,0.18); }
        .tag-amber  { background: rgba(245,158,11,0.1);   color: #fbbf24;  border: 1px solid rgba(245,158,11,0.2); }
        .tag-teal   { background: rgba(52,211,153,0.1);   color: #34d399;  border: 1px solid rgba(52,211,153,0.18); }

        .pa-mode-name { font-family: 'Playfair Display', serif; font-style: italic; font-size: 19px; font-weight: 700; color: #f0f0ff; margin-bottom: 8px; position: relative; z-index: 1; }
        .pa-mode-desc { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.65; position: relative; z-index: 1; }
        .pa-mode-pip {
          position: absolute; top: 16px; right: 16px;
          font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          padding: 3px 8px; border-radius: 6px;
        }
        .pip-new  { background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
        .pip-hot  { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

        /* Section label */
        .pa-section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: rgba(255,255,255,0.28); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .pa-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05); }

        /* Activity */
        .pa-activity-list { display: flex; flex-direction: column; gap: 8px; }
        .pa-activity-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #0d1526; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; transition: all 0.2s; }
        .pa-activity-row:hover { border-color: rgba(99,102,241,0.18); background: rgba(99,102,241,0.04); }
        .pa-act-icon { font-size: 20px; width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pa-act-info { flex: 1; min-width: 0; }
        .pa-act-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pa-act-sub  { font-size: 11px; color: rgba(255,255,255,0.28); }
        .pa-act-xp   { font-family: 'Playfair Display', serif; font-style: italic; font-size: 15px; font-weight: 700; color: #818cf8; flex-shrink: 0; }

        /* ── Toasts ── */
        .pa-xp-toast {
          position: fixed; top: 72px; right: 20px; z-index: 9999;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white; font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 15px; font-weight: 700;
          padding: 10px 20px; border-radius: 20px;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
          animation: paToastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          pointer-events: none;
        }
        .pa-badge-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; display: flex; align-items: center; gap: 14px;
          background: #0d1526; border: 1px solid rgba(245,158,11,0.35);
          padding: 14px 22px; border-radius: 20px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.1);
          animation: paToastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
          pointer-events: none; white-space: nowrap;
        }
        .pa-badge-toast span { font-size: 28px; }
        .pa-bt-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #f59e0b; margin-bottom: 3px; }
        .pa-bt-name  { font-family: 'Playfair Display', serif; font-style: italic; font-size: 15px; color: #f0f0ff; font-weight: 700; }

        @keyframes paToastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      `}</style>

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
                  onResult={(result, xp, hintsUsed) => trackResult('slot', result, xp, hintsUsed)}
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
                  onResult={(result, xp) => trackResult('phantom', result, xp)}
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
                  onWin={() => {
                    setStats(s => ({ ...s, wins: s.wins + 1 }));
                    trackResult('duel', 'win', 0);
                  }}
                  onLoss={() => trackResult('duel', 'loss', 0)}
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
                  onChapterComplete={(chapter, xp) => tracker.logChapterComplete({ chapter, xp })}
                  totalXp={displayXp}
                  toast={toast.story}
                />
              </>
            )}
          </main>

          <Panel />
        </div>

        <BadgeToast />
      </div>
    </>
  );
}
