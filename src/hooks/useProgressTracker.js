/**
 * useProgressTracker — site-wide Firebase progress tracking
 *
 * Drop this hook into any component to log events and sync stats.
 * All writes are fire-and-forget so they never block UI.
 *
 * Usage:
 *   const { logPageVisit, logLogin, logGameResult, logXp } = useProgressTracker();
 */

import { useCallback } from 'react';
import { db } from '../firebase';
import {
  doc, setDoc, updateDoc, addDoc, increment,
  collection, serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// ─── Event type constants ────────────────────────────────────────────────────
export const EVENTS = {
  // Navigation / session
  PAGE_VISIT:         'page_visit',
  LOGIN:              'login',
  SESSION_START:      'session_start',
  SESSION_END:        'session_end',
  // Arena
  SLOT_SPIN:          'slot_spin',
  SLOT_CORRECT:       'slot_correct',
  SLOT_NEAR:          'slot_near',
  SLOT_WRONG:         'slot_wrong',
  PHANTOM_CORRECT:    'phantom_correct',
  PHANTOM_WRONG:      'phantom_wrong',
  DUEL_WIN:           'duel_win',
  DUEL_LOSS:          'duel_loss',
  STORY_CHOICE:       'story_choice',
  STORY_CHAPTER:      'story_chapter_complete',
  // Practice Lab
  DRILL_CORRECT:      'drill_correct',
  DRILL_HINT_USED:    'drill_hint_used',
  DRILL_SESSION_END:  'drill_session_end',
  // Learning Space
  POST_PUBLISHED:     'post_published',
  POST_LIKED:         'post_liked',
  COMMENT_POSTED:     'comment_posted',
  VOCAB_ADDED:        'vocab_added',
  WORD_LEARNED:       'word_learned',
  // General
  XP_GAINED:          'xp_gained',
  STREAK_EXTENDED:    'streak_extended',
  LEVEL_UP:           'level_up',
  BADGE_EARNED:       'badge_earned',
};

// ─── Badge auto-award definitions ────────────────────────────────────────────
const BADGES = [
  { id: 'first_spin',    label: 'First Spin',    icon: '🎰', condition: (s) => (s.totalSpins        || 0) >= 1  },
  { id: 'on_fire',       label: 'On Fire',        icon: '🔥', condition: (s) => (s.currentStreak     || 0) >= 3  },
  { id: 'centurion',     label: 'Centurion',      icon: '⚔️', condition: (s) => (s.totalCorrect      || 0) >= 100 },
  { id: 'wordsmith',     label: 'Wordsmith',      icon: '📖', condition: (s) => (s.vocabAdded        || 0) >= 25 },
  { id: 'duel_master',   label: 'Duel Master',    icon: '🏆', condition: (s) => (s.duelWins          || 0) >= 5  },
  { id: 'perfectionist', label: 'Perfectionist',  icon: '✦',  condition: (s) => (s.nohintCorrect     || 0) >= 10 },
  { id: 'ghost_hunter',  label: 'Ghost Hunter',   icon: '👻', condition: (s) => (s.phantomCorrect    || 0) >= 20 },
  { id: 'storyteller',   label: 'Storyteller',    icon: '📺', condition: (s) => (s.chaptersComplete  || 0) >= 3  },
  { id: 'linguist',      label: 'Linguist',       icon: '🧠', condition: (s) => (s.wordsLearned      || 0) >= 10 },
  { id: 'polyglot',      label: 'Polyglot',       icon: '🌍', condition: (s) => (s.wordsLearned      || 0) >= 50 },
  { id: 'dedicated',     label: 'Dedicated',      icon: '📅', condition: (s) => (s.totalLogins       || 0) >= 7  },
  { id: 'comeback',      label: 'Comeback Kid',   icon: '💪', condition: (s) => (s.totalLogins       || 0) >= 3  },
  { id: 'explorer',      label: 'Explorer',       icon: '🗺️', condition: (s) => (s.totalPageVisits   || 0) >= 50 },
  { id: 'time_lord',     label: 'Time Lord',      icon: '⏱️', condition: (s) => (s.totalSessionMinutes||0) >= 60 },
];

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useProgressTracker() {
  const { user } = useAuth();

  // ── Low-level: append an event to the activity sub-collection ────────────
  const logEvent = useCallback(async (type, payload = {}) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'activity'), {
        type,
        ...payload,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('[tracker] logEvent failed', e);
    }
  }, [user]);

  // ── Core: merge increments + plain fields into stats/aggregate ───────────
  const _updateStats = useCallback(async (delta = {}, newFields = {}) => {
    if (!user) return;
    try {
      const increments = {};
      Object.entries(delta).forEach(([k, v]) => { increments[k] = increment(v); });
      const ref = doc(db, 'users', user.uid, 'stats', 'aggregate');
      await setDoc(
        ref,
        { ...increments, ...newFields, lastActive: serverTimestamp() },
        { merge: true },
      );
    } catch (e) {
      console.warn('[tracker] _updateStats failed', e);
    }
  }, [user]);

  // ── Auto-award badges from a fresh stats snapshot ────────────────────────
  const checkBadges = useCallback(async (statsSnapshot) => {
    if (!user || !statsSnapshot) return;
    const earned    = statsSnapshot.earnedBadges || [];
    const newBadges = BADGES.filter(b => !earned.includes(b.id) && b.condition(statsSnapshot));
    if (!newBadges.length) return;
    const ref = doc(db, 'users', user.uid, 'stats', 'aggregate');
    await updateDoc(ref, { earnedBadges: arrayUnion(...newBadges.map(b => b.id)) });
    for (const b of newBadges) {
      await logEvent(EVENTS.BADGE_EARNED, { badgeId: b.id, badgeLabel: b.label });
    }
    return newBadges;
  }, [user, logEvent]);

  // ── Navigation / session ─────────────────────────────────────────────────

  /** Track a page visit — call once per page mount */
  const logPageVisit = useCallback(async (page) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.PAGE_VISIT, { page }),
      _updateStats({ totalPageVisits: 1 }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track a successful login */
  const logLogin = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.LOGIN, {}),
      _updateStats({ totalLogins: 1 }, { lastLoginAt: serverTimestamp() }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track session start */
  const logSessionStart = useCallback(async () => {
    if (!user) return;
    await logEvent(EVENTS.SESSION_START, { startedAt: Date.now() });
  }, [user, logEvent]);

  /** Track session end with duration in minutes */
  const logSessionEnd = useCallback(async (durationMinutes = 0) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.SESSION_END, { durationMinutes: Math.round(durationMinutes) }),
      _updateStats({ totalSessionMinutes: Math.round(durationMinutes) }),
    ]);
  }, [user, logEvent, _updateStats]);

  // ── XP / streak ──────────────────────────────────────────────────────────

  /** Track an XP gain from any source */
  const logXp = useCallback(async (amount, source) => {
    if (!user || !amount) return;
    await Promise.all([
      logEvent(EVENTS.XP_GAINED, { amount, source }),
      _updateStats({ totalXp: amount }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track a streak update */
  const logStreak = useCallback(async (newStreak) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.STREAK_EXTENDED, { streak: newStreak }),
      _updateStats({}, { currentStreak: newStreak, lastStreakUpdate: serverTimestamp() }),
    ]);
  }, [user, logEvent, _updateStats]);

  // ── Vocabulary ───────────────────────────────────────────────────────────

  /** Track a single word learned */
  const logWordLearned = useCallback(async (word) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.WORD_LEARNED, { word }),
      _updateStats({ wordsLearned: 1 }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track bulk vocab add (LearningSpace comma-separated field) */
  const logVocabAdded = useCallback(async (words = []) => {
    if (!user || !words.length) return;
    await Promise.all([
      logEvent(EVENTS.VOCAB_ADDED, { words, count: words.length }),
      _updateStats({ vocabAdded: words.length, wordsLearned: words.length }),
    ]);
  }, [user, logEvent, _updateStats]);

  // ── Gameplay ─────────────────────────────────────────────────────────────

  /** Track a game round result (slot / phantom / duel / story) */
  const logGameResult = useCallback(async ({
    game,
    result,
    xp = 0,
    hintsUsed = 0,
    extra = {},
  }) => {
    if (!user) return;
    const eventMap = {
      slot_correct:    EVENTS.SLOT_CORRECT,
      slot_near:       EVENTS.SLOT_NEAR,
      slot_wrong:      EVENTS.SLOT_WRONG,
      slot_spin:       EVENTS.SLOT_SPIN,
      phantom_correct: EVENTS.PHANTOM_CORRECT,
      phantom_wrong:   EVENTS.PHANTOM_WRONG,
      duel_win:        EVENTS.DUEL_WIN,
      duel_loss:       EVENTS.DUEL_LOSS,
    };
    const eventType = eventMap[`${game}_${result}`] || `${game}_${result}`;
    const delta = { totalRounds: 1 };
    if (xp)                                         delta.totalXp        = xp;
    if (result === 'correct')                       delta.totalCorrect   = 1;
    if (result === 'correct' && !hintsUsed)         delta.nohintCorrect  = 1;
    if (result === 'win')                           delta.duelWins       = 1;
    if (game === 'slot')                            delta.totalSpins     = 1;
    if (game === 'phantom' && result === 'correct') delta.phantomCorrect = 1;
    await Promise.all([
      logEvent(eventType, { game, result, xp, hintsUsed, ...extra }),
      _updateStats(delta),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track drill session end (PracticeLab) */
  const logDrillSession = useCallback(async ({ sessionXp, correct, total, streak }) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.DRILL_SESSION_END, { sessionXp, correct, total, streak }),
      _updateStats({ totalXp: sessionXp, totalCorrect: correct, drillSessions: 1 }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track a post being published (LearningSpace) */
  const logPostPublished = useCallback(async ({ wordCount, missionType, xp }) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.POST_PUBLISHED, { wordCount, missionType, xp }),
      _updateStats({ totalXp: xp, postsPublished: 1, totalWordsWritten: wordCount }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track a story chapter completion */
  const logChapterComplete = useCallback(async ({ chapter, xp }) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.STORY_CHAPTER, { chapter, xp }),
      _updateStats({ totalXp: xp, chaptersComplete: 1 }),
    ]);
  }, [user, logEvent, _updateStats]);

  return {
    // Navigation
    logPageVisit,
    logLogin,
    logSessionStart,
    logSessionEnd,
    // Gameplay
    logGameResult,
    logDrillSession,
    logChapterComplete,
    // Learning
    logXp,
    logStreak,
    logWordLearned,
    logVocabAdded,
    logPostPublished,
    // Meta
    checkBadges,
    logEvent,
    EVENTS,
  };
}
