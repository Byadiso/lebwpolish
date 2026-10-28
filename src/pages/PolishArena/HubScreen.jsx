import IconText from "../../components/IconText";
import React from 'react';
const HUB_MODES = [{
  id: 'slot',
  icon: "[icon:game]",
  tagColor: '#fb923c',
  tagLabel: 'Hot streak',
  name: 'Losowanie',
  desc: 'Spin 3 reels. Translate the sentence that lands. Variable difficulty — never the same twice.',
  pip: {
    label: 'Hot',
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.15)'
  }
}, {
  id: 'phantom',
  icon: "[icon:moon]",
  tagColor: '#f87171',
  tagLabel: '2 haunting you',
  name: 'Karta Cienia',
  desc: 'Words you got wrong are back. Exorcise them — or they multiply.',
  pip: {
    label: '!',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.15)'
  }
}, {
  id: 'duel',
  icon: "[icon:shield]",
  tagColor: '#a78bfa',
  tagLabel: 'Live',
  name: 'Pojedynek',
  desc: 'A stranger at your level. Same questions. Real-time. First to finish wins.',
  pip: null
}, {
  id: 'story',
  icon: "[icon:screen]",
  tagColor: '#34d399',
  tagLabel: 'Ep. 3 live',
  name: 'Powieść',
  desc: 'You are Marek. One wrong sentence and you lose the job. Choose wisely.',
  pip: {
    label: 'New',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.15)'
  }
}];
export default function HubScreen({
  stats,
  onNavigate,
  toast
}) {
  return <div className="hub-screen">
      <div className="hub-title">
        <h1>
          Polish <span>Arena</span>
        </h1>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-val fire"><IconText>{stats.streak}</IconText></div>
          <div className="stat-lbl">Passa</div>
        </div>
        <div className="stat">
          <div className="stat-val purple"><IconText>{stats.xp}</IconText></div>
          <div className="stat-lbl">XP</div>
        </div>
        <div className="stat">
          <div className="stat-val gold"><IconText>{stats.wins}</IconText></div>
          <div className="stat-lbl">Wins</div>
        </div>
        <div className="stat">
          <div className="stat-val" style={{
          color: '#f87171'
        }}>
            <IconText>{stats.ghosts}</IconText>
          </div>
          <div className="stat-lbl">Ghosts</div>
        </div>
      </div>

      {toast && <div className="xp-toast show"><IconText>{toast}</IconText></div>}

      <div className="mode-grid">
        {HUB_MODES.map(mode => <div key={mode.id} className="mode-card" onClick={() => onNavigate(mode.id)}>
            <span className="mode-icon"><IconText>{mode.icon}</IconText></span>
            <div className="mode-tag" style={{
          color: mode.tagColor
        }}>
              <IconText>{mode.tagLabel}</IconText>
            </div>
            <div className="mode-name"><IconText>{mode.name}</IconText></div>
            <div className="mode-desc"><IconText>{mode.desc}</IconText></div>
            {mode.pip && <div className="mode-pip" style={{
          color: mode.pip.color,
          background: mode.pip.bg
        }}>
                <IconText>{mode.pip.label}</IconText>
              </div>}
          </div>)}
      </div>
    </div>;
}
