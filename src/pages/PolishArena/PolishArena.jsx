import React, { useState, useCallback, useEffect } from 'react';
import HubScreen from './HubScreen';
import SlotScreen from './SlotScreen';
import PhantomScreen from './PhantomScreen';
import DuelScreen from './DuelScreen';
import StoryScreen from './StoryScreen';
import './PolishArena.css';

const NAV_ITEMS = [
  { id: 'hub', icon: '🏠', label: 'Arena' },
  { id: 'slot', icon: '🎰', label: 'Spin' },
  { id: 'duel', icon: '⚔️', label: 'Duel' },
  { id: 'story', icon: '📺', label: 'Story' },
];

export default function PolishArena() {
  const [screen, setScreen] = useState('hub');
  const [stats, setStats] = useState({ streak: 7, xp: 640, wins: 3, ghosts: 2 });
  const [toast, setToast] = useState({ hub: '', slot: '', phantom: '', duel: '', story: '' });

  const showToast = useCallback((screen, msg) => {
    setToast((t) => ({ ...t, [screen]: msg }));
    setTimeout(() => setToast((t) => ({ ...t, [screen]: '' })), 2200);
  }, []);

  const gainXP = useCallback(
    (amt, src = 'hub') => {
      setStats((s) => ({ ...s, xp: s.xp + amt }));
      showToast(src, `+${amt} XP earned!`);
    },
    [showToast]
  );

  const navigate = (id) => setScreen(id);

  return (
    <div className="polish-arena-root">
      <div className="arena-content">
        {screen === 'hub' && (
          <HubScreen
            stats={stats}
            onNavigate={navigate}
            toast={toast.hub}
          />
        )}
        {screen === 'slot' && (
          <SlotScreen
            onBack={() => navigate('hub')}
            onXpGain={(amt) => gainXP(amt, 'slot')}
            toast={toast.slot}
          />
        )}
        {screen === 'phantom' && (
          <PhantomScreen
            onBack={() => navigate('hub')}
            onXpGain={(amt) => gainXP(amt, 'phantom')}
            toast={toast.phantom}
          />
        )}
        {screen === 'duel' && (
          <DuelScreen
            onBack={() => navigate('hub')}
            onXpGain={(amt) => gainXP(amt, 'duel')}
            onWin={() => setStats((s) => ({ ...s, wins: s.wins + 1 }))}
            toast={toast.duel}
          />
        )}
        {screen === 'story' && (
          <StoryScreen
            onBack={() => navigate('hub')}
            onXpGain={(amt) => gainXP(amt, 'story')}
            totalXp={stats.xp}
            toast={toast.story}
          />
        )}
      </div>

      <nav className="nav-bar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${screen === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-lbl">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
