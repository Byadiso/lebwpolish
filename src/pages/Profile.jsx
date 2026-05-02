import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc, onSnapshot,
  collection, query, orderBy, limit,
} from "firebase/firestore";
import { useProgressTracker } from "../hooks/useProgressTracker";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const DAY_MS       = 1000 * 60 * 60 * 24;
const ADMIN_EMAIL  = "byadiso@gmail.com";
const XP_PER_LEVEL = 500;

const BADGE_DEFS = [
  { id: 'first_spin',    label: 'First Spin',    icon: '🎰', desc: 'Played Spin & Learn'          },
  { id: 'on_fire',       label: 'On Fire',        icon: '🔥', desc: '3-day streak'                 },
  { id: 'centurion',     label: 'Centurion',      icon: '⚔️', desc: '100 correct answers'          },
  { id: 'wordsmith',     label: 'Wordsmith',      icon: '📖', desc: '25 vocab words added'         },
  { id: 'duel_master',   label: 'Duel Master',    icon: '🏆', desc: '5 duel victories'             },
  { id: 'perfectionist', label: 'Perfectionist',  icon: '✦',  desc: '10 correct without hints'    },
  { id: 'ghost_hunter',  label: 'Ghost Hunter',   icon: '👻', desc: '20 phantom words correct'    },
  { id: 'storyteller',   label: 'Storyteller',    icon: '📺', desc: '3 story chapters complete'   },
  { id: 'explorer',      label: 'Explorer',       icon: '🗺️', desc: '50 page visits'              },
  { id: 'dedicated',     label: 'Dedicated',      icon: '📅', desc: 'Logged in 7 days'            },
  { id: 'linguist',      label: 'Linguist',       icon: '🧠', desc: '10 words learned'            },
  { id: 'polyglot',      label: 'Polyglot',       icon: '🌍', desc: '50 words learned'            },
  { id: 'time_lord',     label: 'Time Lord',      icon: '⏱️', desc: '60 minutes of study'         },
  { id: 'comeback',      label: 'Comeback Kid',   icon: '💪', desc: 'Logged in 3 days'            },
];

const RANK_LABELS = [
  { min: 0,    label: 'Nowicjusz', color: '#94a3b8' },
  { min: 500,  label: 'Student',   color: '#818cf8' },
  { min: 1000, label: 'Mówca',     color: '#34d399' },
  { min: 2000, label: 'Znawca',    color: '#f59e0b' },
  { min: 4000, label: 'Mistrz',    color: '#f43f5e' },
  { min: 8000, label: 'Poliglota', color: '#a78bfa' },
];

function getRank(xp = 0) {
  return [...RANK_LABELS].reverse().find(r => xp >= r.min) || RANK_LABELS[0];
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StatCard({ icon, label, value, sub, accent = '#6366f1', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      style={{
        background: '#0c1427',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 18, padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 6,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, left: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}22, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
        fontSize: '1.85rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.2em', color: 'rgba(148,163,184,0.5)',
      }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.3)', marginTop: 2 }}>{sub}</div>}
    </motion.div>
  );
}

function XpBar({ xp }) {
  const level   = Math.floor(xp / XP_PER_LEVEL) + 1;
  const inLevel = xp % XP_PER_LEVEL;
  const pct     = (inLevel / XP_PER_LEVEL) * 100;
  const rank    = getRank(xp);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <div>
          <p style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.28em', color: 'rgba(99,102,241,0.55)', marginBottom: 4,
          }}>Level {level}</p>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: '1.4rem', fontWeight: 700, color: rank.color,
          }}>{rank.label}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: '1.1rem', fontWeight: 700, color: '#818cf8',
          }}>{xp.toLocaleString()} XP</p>
          <p style={{ fontSize: 10, color: 'rgba(148,163,184,0.3)', marginTop: 2 }}>
            {XP_PER_LEVEL - inLevel} to next level
          </p>
        </div>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 9999, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{
            height: '100%', borderRadius: 9999,
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.3)' }}>{inLevel} XP</span>
        <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.2)' }}>{XP_PER_LEVEL} XP</span>
      </div>
    </div>
  );
}

function StreakSection({ streak, diffDays, isBroken, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      style={{
        borderRadius: 20, padding: '22px 24px', marginBottom: 24,
        background: isBroken ? 'rgba(244,63,94,0.07)' : 'rgba(245,158,11,0.06)',
        border: `1px solid ${isBroken ? 'rgba(244,63,94,0.25)' : 'rgba(245,158,11,0.2)'}`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {!isBroken && (
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.08, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 20,
            border: '2px solid rgba(245,158,11,0.5)', pointerEvents: 'none',
          }}
        />
      )}

      {isBroken ? (
        <div>
          <p style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.28em', color: 'rgba(244,63,94,0.7)', marginBottom: 8,
          }}>⚠️ Streak Broken</p>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: '1.8rem', fontWeight: 700, color: '#f43f5e', marginBottom: 6,
          }}>{diffDays} days silent</p>
          <p style={{ fontSize: 12, color: 'rgba(244,63,94,0.6)', marginBottom: 16, lineHeight: 1.6 }}>
            Your streak is broken. Every day you don't write, a word forgets you.
          </p>
          <Link to="/space" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
            color: '#f43f5e', fontSize: 11, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.18em', textDecoration: 'none',
          }}>Restore streak →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.28em', color: 'rgba(245,158,11,0.65)', marginBottom: 6,
            }}>{isAdmin ? 'Admin Tenure' : 'Active Streak 🔥'}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <motion.span
                key={streak}
                initial={{ scale: 1.3, color: '#f59e0b' }}
                animate={{ scale: 1 }}
                style={{
                  fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                  fontSize: '3.5rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1,
                }}
              >{streak}</motion.span>
              <span style={{
                fontSize: 14, fontWeight: 700, color: '#f59e0b',
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>Days</span>
            </div>
            <p style={{
              fontSize: 10, color: 'rgba(245,158,11,0.4)', marginTop: 6,
              textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700,
            }}>Keep the flame alive</p>
          </div>
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.6))' }}
          >🔥</motion.div>
        </div>
      )}
    </motion.div>
  );
}

function BadgeGrid({ earnedBadges = [], hoveredBadge, setHoveredBadge }) {
  return (
    <div>
      <p style={{
        fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.28em', color: 'rgba(99,102,241,0.45)', marginBottom: 14,
      }}>
        Badges — {earnedBadges.length} / {BADGE_DEFS.length}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {BADGE_DEFS.map((b, i) => {
          const earned    = earnedBadges.includes(b.id);
          const isHovered = hoveredBadge === b.id;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onMouseEnter={() => setHoveredBadge(b.id)}
              onMouseLeave={() => setHoveredBadge(null)}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '12px 6px', borderRadius: 14,
                border: `1px solid ${earned ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                background: earned ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                cursor: 'default',
                filter: earned ? 'none' : 'grayscale(1)',
                opacity: earned ? 1 : 0.35,
                transition: 'all 0.2s',
                transform: isHovered && earned ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: 20 }}>{b.icon}</span>
              <span style={{
                fontSize: 7, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: earned ? '#c4b5fd' : 'rgba(148,163,184,0.4)',
                textAlign: 'center', lineHeight: 1.3,
              }}>{b.label}</span>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', bottom: '110%', left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#0c1427', border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: 10, padding: '7px 12px',
                      fontSize: 10, fontWeight: 600, color: '#c4b5fd',
                      whiteSpace: 'nowrap', zIndex: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                  >
                    {b.desc}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityFeed({ activity = [] }) {
  if (!activity.length) return null;

  const icons = {
    page_visit:               '👁️',
    word_learned:             '📖',
    xp_gained:                '⭐',
    login:                    '🔑',
    session_start:            '🚀',
    session_end:              '🏁',
    slot_correct:             '🎰',
    phantom_correct:          '👻',
    duel_win:                 '⚔️',
    story_chapter_complete:   '📺',
    drill_correct:            '✅',
    drill_session_end:        '📝',
    post_published:           '✍️',
    badge_earned:             '🏅',
    vocab_added:              '📚',
  };

  const getLabel = (ev) => {
    switch (ev.type) {
      case 'page_visit':             return `Visited ${ev.page || 'a page'}`;
      case 'word_learned':           return `Learned "${ev.word}"`;
      case 'xp_gained':              return `Earned ${ev.amount} XP from ${ev.source || 'activity'}`;
      case 'login':                  return 'Logged in';
      case 'session_start':          return 'Started a session';
      case 'session_end':            return `Session ended — ${ev.durationMinutes || 0} min`;
      case 'slot_correct':           return 'Correct in Spin & Learn';
      case 'phantom_correct':        return 'Defeated a phantom word';
      case 'duel_win':               return 'Won a duel';
      case 'story_chapter_complete': return `Completed story chapter ${ev.chapter || ''}`;
      case 'drill_correct':          return 'Drill answered correctly';
      case 'drill_session_end':      return `Drill session — ${ev.correct || 0}/${ev.total || 0} correct`;
      case 'post_published':         return `Published ${ev.wordCount || ''} words`;
      case 'badge_earned':           return `Unlocked badge: ${ev.badgeLabel || ev.badgeId}`;
      case 'vocab_added':            return `Added ${ev.count || 0} vocabulary words`;
      default:                       return ev.type.replace(/_/g, ' ');
    }
  };

  return (
    <div>
      <p style={{
        fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.28em', color: 'rgba(99,102,241,0.45)', marginBottom: 14,
      }}>Recent Activity</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {activity.slice(0, 8).map((ev, i) => {
          const ts  = ev.timestamp?.toDate?.();
          const ago = ts ? Math.round((Date.now() - ts.getTime()) / 60000) : null;
          const agoStr = ago === null  ? ''
                       : ago < 1     ? 'just now'
                       : ago < 60    ? `${ago}m ago`
                       : ago < 1440  ? `${Math.floor(ago / 60)}h ago`
                       :               `${Math.floor(ago / 1440)}d ago`;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: 15, width: 24, textAlign: 'center', flexShrink: 0 }}>
                {icons[ev.type] || '•'}
              </span>
              <span style={{ flex: 1, fontSize: 12, color: 'rgba(226,232,240,0.6)', fontWeight: 500 }}>
                {getLabel(ev)}
              </span>
              {agoStr && (
                <span style={{
                  fontSize: 10, color: 'rgba(148,163,184,0.3)',
                  flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                }}>{agoStr}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Profile() {
  const { user, profile, loading } = useAuth();
  const tracker = useProgressTracker();

  // NOTE: useLocation is imported but only needed if you want to read the current path.
  // It's kept here in case you need it; removing the import is safe if unused.
  useLocation(); // keeps the import live; harmless no-op

  const [liveStats,    setLiveStats]    = useState(null);
  const [activity,     setActivity]     = useState([]);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  // ── Track page visit once user is known ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    tracker.logPageVisit('profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // ── Subscribe to live stats ──────────────────────────────────────────────
  // React 18 Strict Mode double-invokes effects (mount → unmount → mount).
  // Without the `active` guard + setTimeout(0) deferral, two onSnapshot
  // calls hit the same Firestore target before the first unsubscribes,
  // triggering "FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state".
  useEffect(() => {
    if (!user) return;
    let active = true;
    let unsub = () => {};

    const timer = setTimeout(() => {
      if (!active) return;
      unsub = onSnapshot(
        doc(db, 'users', user.uid, 'stats', 'aggregate'),
        (snap) => { if (active && snap.exists()) setLiveStats(snap.data()); },
        (err) => console.warn('[Profile] stats snapshot error', err),
      );
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
      unsub();
    };
  }, [user?.uid]);

  // ── Subscribe to recent activity ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let active = true;
    let unsub = () => {};

    const timer = setTimeout(() => {
      if (!active) return;
      const q = query(
        collection(db, 'users', user.uid, 'activity'),
        orderBy('timestamp', 'desc'),
        limit(20),
      );
      unsub = onSnapshot(
        q,
        (snap) => { if (active) setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
        (err) => console.warn('[Profile] activity snapshot error', err),
      );
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
      unsub();
    };
  }, [user?.uid]);

  /* ── Loading spinner ── */
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#020617',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.12)', borderTopColor: '#6366f1',
        }}
      />
    </div>
  );

  const isAdmin = user?.email === ADMIN_EMAIL;

  const accountAgeDays = user?.metadata?.creationTime
    ? Math.floor((Date.now() - new Date(user.metadata.creationTime).getTime()) / DAY_MS)
    : 0;

  const displayProfile = profile || (isAdmin ? {
    cityName: 'Admin HQ', level: 'All-Access', rank: 'Grandmaster',
    streak: accountAgeDays, vocabCount: 0, lastWrite: { toDate: () => new Date() },
  } : null);

  if (!displayProfile) return (
    <div style={{
      minHeight: '100vh', background: '#020617',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#0c1427', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 28, padding: '3rem', textAlign: 'center', maxWidth: 360,
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
          fontSize: '1.8rem', color: '#f1f5f9', marginBottom: 8,
        }}>Profil w przygotowaniu</h2>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.5)', lineHeight: 1.6 }}>
          Your Polish identity is being forged...
        </p>
      </motion.div>
    </div>
  );

  const lastWriteDate = displayProfile.lastWrite?.toDate?.();
  const diffDays = lastWriteDate
    ? Math.floor((Date.now() - lastWriteDate.getTime()) / DAY_MS)
    : 0;
  const isBroken = diffDays > 1 && !isAdmin;

  // Merge Firebase live stats with profile fallbacks
  const xp           = liveStats?.totalXp             ?? 0;
  const totalLogins  = liveStats?.totalLogins          ?? 0;
  const totalVisits  = liveStats?.totalPageVisits      ?? 0;
  const wordsLearned = liveStats?.wordsLearned         ?? displayProfile.vocabCount ?? 0;
  const totalRounds  = liveStats?.totalRounds          ?? 0;
  const sessionMins  = liveStats?.totalSessionMinutes  ?? 0;
  const earnedBadges = liveStats?.earnedBadges         ?? [];
  const rank         = getRank(xp);

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        .prof-root *, .prof-root *::before, .prof-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .prof-root ::-webkit-scrollbar { width: 4px; }
        .prof-root ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 9999px; }
        a { text-decoration: none; }
      `}</style>

      <div
        className="prof-root"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: 560, margin: '0 auto', padding: '32px 20px 80px',
        }}
      >
        {/* ── Admin bar ── */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: 20, padding: '14px 18px', borderRadius: 16,
              background: '#0c1427', border: '1px solid rgba(244,63,94,0.25)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.3rem' }}>🔑</span>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#f43f5e', marginBottom: 2 }}>
                  Admin Mode
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(226,232,240,0.7)' }}>
                  Manage Students
                </p>
              </div>
            </div>
            <Link to="/admin" style={{
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
              color: '#f43f5e', fontSize: 10, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.18em',
            }}>Dashboard</Link>
          </motion.div>
        )}

        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#0c1427',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: 26, overflow: 'hidden', marginBottom: 20,
          }}
        >
          {/* Hero banner */}
          <div style={{
            height: 120, position: 'relative',
            background: isBroken
              ? 'linear-gradient(135deg, #0a0010, #1a0008)'
              : 'linear-gradient(135deg, #0d1040, #1a0d4a)',
            display: 'flex', alignItems: 'flex-end', padding: '0 24px 0',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 160, height: 160,
              borderRadius: '50%',
              background: isBroken
                ? 'radial-gradient(circle, rgba(244,63,94,0.2), transparent 70%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)',
              filter: 'blur(20px)',
            }} />

            {isAdmin && (
              <div style={{
                position: 'absolute', top: 14, right: 14,
                padding: '4px 10px', borderRadius: 9999,
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)',
              }}>Chief Administrator</div>
            )}

            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '3px solid #0c1427',
              background: isBroken ? '#1a0008' : '#0d1040',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem',
              transform: 'translateY(40px)',
              flexShrink: 0, zIndex: 1,
              boxShadow: `0 0 0 1px ${isBroken ? 'rgba(244,63,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
            }}>
              {isBroken ? '💀' : isAdmin ? '👑' : '✍️'}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '52px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                  fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9',
                  marginBottom: 8, lineHeight: 1,
                }}>{displayProfile.cityName}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 9999,
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)',
                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.16em', color: '#818cf8',
                  }}>Level {displayProfile.level}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 9999,
                    background: `${rank.color}18`, border: `1px solid ${rank.color}40`,
                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.16em', color: rank.color,
                  }}>{displayProfile.rank || rank.label}</span>
                </div>
              </div>
              {/* XP badge */}
              <div style={{
                padding: '8px 14px', borderRadius: 14, textAlign: 'center',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                  fontSize: '1.3rem', fontWeight: 700, color: '#818cf8', lineHeight: 1,
                }}>{xp.toLocaleString()}</p>
                <p style={{
                  fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.18em', color: 'rgba(99,102,241,0.45)', marginTop: 3,
                }}>XP</p>
              </div>
            </div>

            <XpBar xp={xp} />

            <StreakSection
              streak={displayProfile.streak ?? 0}
              diffDays={diffDays}
              isBroken={isBroken}
              isAdmin={isAdmin}
            />

            {/* Stat grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
              <StatCard icon="📖" label="Words Learned"  value={wordsLearned}   accent="#34d399"  delay={0.1}  />
              <StatCard icon="🔑" label="Days Logged In" value={totalLogins}    accent="#6366f1"  delay={0.15} />
              <StatCard icon="👁️" label="Pages Visited"  value={totalVisits}    accent="#818cf8"  delay={0.2}  />
              <StatCard icon="🎮" label="Rounds Played"  value={totalRounds}    accent="#f59e0b"  delay={0.25} />
              <StatCard
                icon="⏱️" label="Study Minutes" value={sessionMins} accent="#a78bfa" delay={0.3}
                sub={sessionMins >= 60 ? `${Math.floor(sessionMins / 60)}h ${sessionMins % 60}m` : undefined}
              />
              <StatCard
                icon="🏅" label="Badges Earned"
                value={`${earnedBadges.length}/${BADGE_DEFS.length}`}
                accent="#f43f5e" delay={0.35}
              />
            </div>

            {/* Badges */}
            <div style={{ marginBottom: 24 }}>
              <BadgeGrid
                earnedBadges={earnedBadges}
                hoveredBadge={hoveredBadge}
                setHoveredBadge={setHoveredBadge}
              />
            </div>

            {/* Activity feed */}
            <ActivityFeed activity={activity} />

            {/* Back link */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Link to="/space" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.22em', color: 'rgba(148,163,184,0.4)',
              }}>← Back to Learning Space</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
