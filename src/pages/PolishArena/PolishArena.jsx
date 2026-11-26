import IconText from "../../components/IconText";
import { useLearningPersistence } from '../../hooks/useLearningStorage';
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ArenaRefresh.css';
import SlotScreen from './SlotScreen';
import PhantomScreen from './PhantomScreen';
import DuelScreen from './DuelScreen';
import StoryScreen from './StoryScreen';
import { useProgressTracker } from '../../hooks/useProgressTracker';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

/* ─── Static data ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [{
  id: 'hub',
  icon: "[icon:home]",
  label: 'Arena Hub'
}, {
  id: 'slot',
  icon: "[icon:game]",
  label: 'Spin & Learn',
  pip: 'New'
}, {
  id: 'phantom',
  icon: "[icon:moon]",
  label: 'Phantom Words'
}, {
  id: 'duel',
  icon: "[icon:shield]",
  label: 'Duel Mode'
}, {
  id: 'story',
  icon: "[icon:screen]",
  label: 'Story Mode'
}];
const DAILY_CHALLENGES = [];
const LEADERBOARD = [];
const RECENT_ACTIVITY = [];
const RANK_CLASS = {
  1: 'gold',
  2: 'silver',
  3: 'bronze'
};
const XP_TO_NEXT = 1000;
const BADGE_DEFS = [{
  id: 'first_spin',
  label: 'First Spin',
  icon: "[icon:game]"
}, {
  id: 'on_fire',
  label: 'On Fire',
  icon: "[icon:flame]"
}, {
  id: 'centurion',
  label: 'Centurion',
  icon: "[icon:shield]"
}, {
  id: 'wordsmith',
  label: 'Wordsmith',
  icon: "[icon:book]"
}, {
  id: 'duel_master',
  label: 'Duel Master',
  icon: "[icon:trophy]"
}, {
  id: 'perfectionist',
  label: 'Perfectionist',
  icon: '✦'
}, {
  id: 'ghost_hunter',
  label: 'Ghost Hunter',
  icon: "[icon:moon]"
}, {
  id: 'storyteller',
  label: 'Storyteller',
  icon: "[icon:screen]"
}];

/* ─── Main component ────────────────────────────────────────────────────── */
export default function PolishArena() {
  const {loadLocal, saveLocal} = useLearningPersistence();
  const {
    user
  } = useAuth();
  const tracker = useProgressTracker();
  const [screen, setScreen] = useState('hub');
  const [stats, setStats] = useState(() => loadLocal('lebw.arena.stats', {
    streak: 0,
    xp: 0,
    wins: 0,
    ghosts: 0
  }));
  const [liveStats, setLiveStats] = useState(null);
  const [toast, setToast] = useState({
    hub: '',
    slot: '',
    phantom: '',
    duel: '',
    story: ''
  });
  const [badgeToast, setBadgeToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    saveLocal('lebw.arena.stats', stats);
  }, [stats]);

  /* ── Firebase live stats ── */
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'stats', 'aggregate');
    return onSnapshot(ref, snap => {
      if (snap.exists()) setLiveStats(snap.data());
    });
  }, [user]);

  /* ── Toast helper ── */
  const showToast = useCallback((src, msg) => {
    setToast(t => ({
      ...t,
      [src]: msg
    }));
    setTimeout(() => setToast(t => ({
      ...t,
      [src]: ''
    })), 2400);
  }, []);

  /* ── XP gain ── */
  const gainXP = useCallback(async (amt, src = 'hub') => {
    setStats(s => ({
      ...s,
      xp: s.xp + amt
    }));
    showToast(src, `+${amt} XP earned!`);
    await tracker.logXp(amt, src);
  }, [showToast, tracker]);

  /* ── Game result ── */
  const trackResult = useCallback(async (game, result, xp = 0, hintsUsed = 0, extra = {}) => {
    await tracker.logGameResult({
      game,
      result,
      xp: 0,
      hintsUsed,
      extra
    });
    if (result === 'win') setStats(s => ({
      ...s,
      wins: s.wins + 1
    }));
  }, [tracker]);
  const navigate = id => {
    setScreen(id);
    setSidebarOpen(false);
  };
  const displayXp = liveStats?.totalXp ?? stats.xp;
  const displayStreak = liveStats?.currentStreak ?? stats.streak;
  const displayWins = liveStats?.duelWins ?? stats.wins;
  const earnedBadges = liveStats?.earnedBadges ?? [];
  const xpPct = Math.min(100, Math.round(displayXp / XP_TO_NEXT * 100));

  const modes = [
    {id:'slot', icon:'[icon:game]', name:'Spin & Learn', skill:'Translation', desc:'Build confidence with Polish sentences. Spin, translate and check your answer.', action:'Spin a sentence'},
    {id:'phantom', icon:'[icon:moon]', name:'Phantom Words', skill:'Vocabulary recall', desc:'Challenge yourself to recognise tricky Polish words and strengthen your recall.', action:'Recall a word'},
    {id:'duel', icon:'[icon:shield]', name:'Duel Mode', skill:'Speed & accuracy', desc:'Test your recall in a timed match against a computer opponent.', action:'Start a duel'},
    {id:'story', icon:'[icon:book]', name:'Story Mode', skill:'Polish in context', desc:'Make choices in an interactive story and discover how your Polish shapes the outcome.', action:'Explore the story'}
  ];
  const [wordRevealed, setWordRevealed] = useState(false);
  const metrics = [ ['Streak', displayStreak, '[icon:flame]'], ['XP', displayXp, '[icon:star]'], ['Wins', displayWins, '[icon:trophy]'], ['Ghosts', stats.ghosts, '[icon:moon]'] ];
  const currentMode = modes.find(m => m.id === screen);

  /* ─── Toasts ──────────────────────────────────────────────────────────── */
  const XpToast = ({
    msg
  }) => <AnimatePresence>
      {msg && <motion.div key={msg} initial={{
      opacity: 0,
      y: -10,
      scale: 0.9
    }} animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }} exit={{
      opacity: 0,
      y: -8,
      scale: 0.95
    }} style={{
      position: 'fixed',
      top: 80,
      right: 20,
      zIndex: 9000,
      background: '#b91c1c',
      color: '#fff',
      fontFamily: "inherit",
      fontStyle: 'italic',
      fontSize: 15,
      fontWeight: 700,
      padding: '10px 20px',
      borderRadius: 20,
      boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
      pointerEvents: 'none'
    }}>
          <IconText>{msg}</IconText>
        </motion.div>}
    </AnimatePresence>;
  const BadgeToast = () => <AnimatePresence>
      {badgeToast && <motion.div initial={{
      opacity: 0,
      y: 16,
      scale: 0.9
    }} animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }} exit={{
      opacity: 0,
      y: 12
    }} style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: '#0d1526',
      border: '1px solid rgba(245,158,11,0.35)',
      padding: '14px 22px',
      borderRadius: 20,
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    }}>
          <span style={{
        fontSize: 28
      }}><IconText>{badgeToast.icon}</IconText></span>
          <div>
            <div style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#f59e0b',
          marginBottom: 3
        }}>Badge Unlocked!</div>
            <div style={{
          fontFamily: "inherit",
          fontStyle: 'italic',
          fontSize: 15,
          color: '#f0f0ff',
          fontWeight: 700
        }}><IconText>{badgeToast.label}</IconText></div>
          </div>
        </motion.div>}
    </AnimatePresence>;

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return <>
      <div className="pa-root arena-refresh">
        <header className="ar-header">
          <div><p className="ar-kicker">Learn by playing</p><h1>Polish <em>Arena.</em></h1><p>Make your next small win in Polish.</p></div>
          <div className="ar-metrics" aria-label="Your progress">{metrics.map(([label,value,icon]) => <div key={label}><span className="ar-metric-icon"><IconText>{icon}</IconText></span><strong>{value.toLocaleString()}</strong><span>{label}</span></div>)}</div>
        </header>
        <nav className="ar-nav" aria-label="Arena modes">{NAV_ITEMS.map(item => <button type="button" key={item.id} aria-current={screen === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><IconText>{item.icon}</IconText> {item.label}</button>)}</nav>
        <div className="ar-layout">
          <main className="ar-main">
            {screen === 'hub' && <>
              <XpToast msg={toast.hub} />
              <section className="ar-feature"><div><p className="ar-kicker">Not sure where to start?</p><h2>One sentence.<br/>One small win.</h2><p>Start with a translation round. Take your time and build confidence before trying a timed duel.</p><button type="button" onClick={() => navigate('slot')}>Start practising <span aria-hidden="true">→</span></button></div><div className="ar-feature-art" aria-hidden="true"><span>Myśl.</span><span>Mów.</span><span>Graj.</span></div></section>
              <div className="ar-section-heading"><h2>Choose your challenge</h2><p>Four ways to actively practise Polish.</p></div>
              <div className="ar-games">{modes.map(m => <button type="button" key={m.id} className="ar-game" onClick={() => navigate(m.id)}><span className="ar-game-icon"><IconText>{m.icon}</IconText></span><span className="ar-skill">{m.skill}</span><strong>{m.name}</strong><span className="ar-desc">{m.desc}</span><span className="ar-action">{m.action} <span aria-hidden="true">→</span></span></button>)}</div>
            </>}
            {currentMode && <div className="ar-playing-label"><strong>{currentMode.name}</strong><span>{currentMode.skill}</span></div>}
            {screen === 'slot' && <>
                <XpToast msg={toast.slot} />
                <SlotScreen onBack={() => navigate('hub')} onXpGain={amt => gainXP(amt, 'slot')} onResult={(result, xp, hintsUsed) => trackResult('slot', result, xp, hintsUsed)} toast={toast.slot} />
              </>}
            {screen === 'phantom' && <>
                <XpToast msg={toast.phantom} />
                <PhantomScreen onBack={() => navigate('hub')} onXpGain={amt => gainXP(amt, 'phantom')} onResult={(result, xp) => trackResult('phantom', result, xp)} toast={toast.phantom} />
              </>}
            {screen === 'duel' && <>
                <XpToast msg={toast.duel} />
                <DuelScreen onBack={() => navigate('hub')} onXpGain={amt => gainXP(amt, 'duel')} onWin={() => trackResult('duel', 'win', 0)} onLoss={() => trackResult('duel', 'loss', 0)} toast={toast.duel} />
              </>}
            {screen === 'story' && <>
                <XpToast msg={toast.story} />
                <StoryScreen onBack={() => navigate('hub')} onXpGain={amt => gainXP(amt, 'story')} onChapterComplete={(chapter, xp) => tracker.logChapterComplete({
              chapter,
              xp
            })} totalXp={displayXp} toast={toast.story} />
              </>}
          </main>

          <aside className="ar-side" aria-label="Learning support">
            <section className="ar-panel"><h2>Your achievements</h2><p>{BADGE_DEFS.filter(b => earnedBadges.includes(b.id)).length} of {BADGE_DEFS.length} badges earned</p><div className="ar-badges">{BADGE_DEFS.map(b => <div key={b.id} className={earnedBadges.includes(b.id) ? 'earned' : ''}><IconText>{b.icon}</IconText><span>{b.label}</span><small>{earnedBadges.includes(b.id) ? 'Earned' : 'Locked'}</small></div>)}</div><div className="ar-goal"><strong>XP milestone · {XP_TO_NEXT.toLocaleString()}</strong><progress max={100} value={xpPct} aria-label="XP milestone progress"/><span>{displayXp.toLocaleString()} XP</span></div></section>
            <section className="ar-panel"><p className="ar-kicker">Quick recall</p><h2>Serce</h2><p>Can you remember what this word means?</p><button type="button" className="ar-reveal" aria-expanded={wordRevealed} onClick={() => setWordRevealed(v => !v)}>{wordRevealed ? 'Hide meaning' : 'Reveal meaning'}</button>{wordRevealed && <div className="ar-meaning"><strong>heart · noun, neuter</strong><p>Masz dobre serce. — You have a good heart.</p></div>}</section>
            {liveStats && <section className="ar-panel"><h2>Recorded activity</h2><dl className="ar-activity">{[['Rounds',liveStats.totalRounds],['Correct answers',liveStats.totalCorrect],['Posts',liveStats.postsPublished],['Words added',liveStats.vocabAdded],['Words written',liveStats.totalWordsWritten]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{(value || 0).toLocaleString()}</dd></div>)}</dl></section>}
          </aside>
        </div>

        <BadgeToast />
      </div>
    </>;
}
