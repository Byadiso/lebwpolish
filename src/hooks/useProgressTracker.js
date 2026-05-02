/**
 * useProgressTracker — site-wide Firebase progress tracking
 *
 * Drop this hook into any component to log events and sync stats.
 * All writes are fire-and-forget so they never block UI.
 *
 * Usage:
 *   const { logEvent, logGameResult, logStreak, logXp } = useProgressTracker();
 */

import { useCallback } from 'react';
import { db } from '../firebase';
import {
  doc, setDoc, updateDoc, addDoc, increment,
  collection, serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// ─── Event type constants (import these wherever you track) ─────────────────
export const EVENTS = {
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
  // General
  XP_GAINED:          'xp_gained',
  STREAK_EXTENDED:    'streak_extended',
  LEVEL_UP:           'level_up',
  BADGE_EARNED:       'badge_earned',
};

// ─── Badge definitions ──────────────────────────────────────────────────────
const BADGES = [
  { id: 'first_spin',     label: 'First Spin',      icon: '🎰', condition: (s) => s.totalSpins >= 1 },
  { id: 'on_fire',        label: 'On Fire',          icon: '🔥', condition: (s) => s.currentStreak >= 3 },
  { id: 'centurion',      label: 'Centurion',        icon: '⚔️', condition: (s) => s.totalCorrect >= 100 },
  { id: 'wordsmith',      label: 'Wordsmith',        icon: '📖', condition: (s) => (s.vocabAdded || 0) >= 25 },
  { id: 'duel_master',    label: 'Duel Master',      icon: '🏆', condition: (s) => s.duelWins >= 5 },
  { id: 'perfectionist',  label: 'Perfectionist',    icon: '✦',  condition: (s) => s.nohintCorrect >= 10 },
  { id: 'ghost_hunter',   label: 'Ghost Hunter',     icon: '👻', condition: (s) => s.phantomCorrect >= 20 },
  { id: 'storyteller',    label: 'Storyteller',      icon: '📺', condition: (s) => s.chaptersComplete >= 3 },
];

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useProgressTracker() {
  const { user } = useAuth();

  // Low-level: write a raw event to the activity log sub-collection
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

  // Core stat updater — merges into users/{uid}/stats
  const _updateStats = useCallback(async (delta = {}, newFields = {}) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'stats', 'aggregate');
    try {
      // increment numeric fields
      const increments = {};
      Object.entries(delta).forEach(([k, v]) => {
        increments[k] = increment(v);
      });
      await setDoc(ref, { ...increments, ...newFields, lastActive: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('[tracker] _updateStats failed', e);
    }
  }, [user]);

  // Check and award badges based on current stats snapshot
  const _checkBadges = useCallback(async (statsSnapshot) => {
    if (!user) return;
    const earned = statsSnapshot?.earnedBadges || [];
    const newBadges = BADGES.filter(b => !earned.includes(b.id) && b.condition(statsSnapshot));
    if (newBadges.length === 0) return;
    const ref = doc(db, 'users', user.uid, 'stats', 'aggregate');
    const badgeIds = newBadges.map(b => b.id);
    await updateDoc(ref, { earnedBadges: arrayUnion(...badgeIds) });
    // Log each badge event
    for (const b of newBadges) {
      await logEvent(EVENTS.BADGE_EARNED, { badgeId: b.id, badgeLabel: b.label });
    }
    return newBadges;
  }, [user, logEvent]);

  // ── Public tracking methods ───────────────────────────────────────────────

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

  /** Track a game round result from SlotScreen / PhantomScreen / etc. */
  const logGameResult = useCallback(async ({
    game,          // 'slot' | 'phantom' | 'duel' | 'story'
    result,        // 'correct' | 'near' | 'wrong' | 'win' | 'loss'
    xp = 0,
    hintsUsed = 0,
    extra = {},    // any extra payload
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
    const key = `${game}_${result}`;
    const eventType = eventMap[key] || `${game}_${result}`;

    const statsDelta = { totalRounds: 1 };
    if (xp)                              statsDelta.totalXp      = xp;
    if (result === 'correct')            statsDelta.totalCorrect = 1;
    if (result === 'correct' && !hintsUsed) statsDelta.nohintCorrect = 1;
    if (result === 'win')                statsDelta.duelWins     = 1;
    if (game === 'slot')                 statsDelta.totalSpins   = 1;
    if (game === 'phantom' && result === 'correct') statsDelta.phantomCorrect = 1;

    await Promise.all([
      logEvent(eventType, { game, result, xp, hintsUsed, ...extra }),
      _updateStats(statsDelta),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track drill session completion (PracticeLab) */
  const logDrillSession = useCallback(async ({ sessionXp, correct, total, streak }) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.DRILL_SESSION_END, { sessionXp, correct, total, streak }),
      _updateStats({ totalXp: sessionXp, totalCorrect: correct, drillSessions: 1 }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track vocab additions (LearningSpace) */
  const logVocabAdded = useCallback(async (words = []) => {
    if (!user || !words.length) return;
    await Promise.all([
      logEvent(EVENTS.VOCAB_ADDED, { words, count: words.length }),
      _updateStats({ vocabAdded: words.length }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track post published (LearningSpace) */
  const logPostPublished = useCallback(async ({ wordCount, missionType, xp }) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.POST_PUBLISHED, { wordCount, missionType, xp }),
      _updateStats({ totalXp: xp, postsPublished: 1, totalWordsWritten: wordCount }),
    ]);
  }, [user, logEvent, _updateStats]);

  /** Track story chapter completion */
  const logChapterComplete = useCallback(async ({ chapter, xp }) => {
    if (!user) return;
    await Promise.all([
      logEvent(EVENTS.STORY_CHAPTER, { chapter, xp }),
      _updateStats({ totalXp: xp, chaptersComplete: 1 }),
    ]);
  }, [user, logEvent, _updateStats]);

  return {
    logEvent,
    logXp,
    logStreak,
    logGameResult,
    logDrillSession,
    logVocabAdded,
    logPostPublished,
    logChapterComplete,
    EVENTS,
  };
}
