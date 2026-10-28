# LEBWPOLISH application review and implemented refresh

## Evaluation

The application has a strong collection of Polish activities and a recognisable visual identity. The main obstacles were discovery, disconnected progress, inconsistent interface icons, intimidating wording, and a few broken completion/reset paths. Several displayed achievements were examples rather than real learner activity.

The refresh creates a clearer route from curiosity to practice: choose a small mission, learn one pattern, try it with feedback, recall a phrase later, then use it in a conversation or a longer writing task. This is the design intent; engagement and learning gains have not been measured with users.

## Implemented changes

| Area | Change and purpose |
| --- | --- |
| Interface icons | Replaced hardcoded emoji presentation throughout the source UI with consistent local SVGs. Content icon tokens are rendered through a small fragment-only adapter, without altering user-authored content. |
| Discovery | Added a searchable directory for eighteen activities, skill and five-minute filters, saved favourites, recent visits, and a surprise suggestion. |
| Guided learning | Expanded from three to twelve missions across A1/A2/B1, with thirty-six exercises and contextual phrases. No artificial level locks. |
| Habit formation | Added adjustable daily small-win goals, a seven-day activity view, review nudges, and milestones earned from actual practice. Missed days do not erase progress. |
| Recall | Added an optional typed attempt before revealing a review phrase. Review intervals rise to 1/3/7/14/30 days; difficult phrases return after ten minutes. Future reviews cannot be advanced early. |
| Writing | Added three original B1-oriented practice prompts, planning scaffolds, opening/ending hints, immediate local draft saving, word counts, and self-review. No automatic exam scoring claim. |
| Exam orientation | Connected the five-skill B1 compass to the actual writing studio and existing activity routes, with official sample-task links and a self-reflection checklist. |
| Navigation | Added the missing learn route explicitly, rebuilt responsive navigation, added skip-to-content, and fixed the overlapping homepage navigation position. |
| Startup | Removed the duplicate authentication provider. Local public practice can start without Firebase credentials. Sign-in and cloud community features still require configuration. |
| Lesson completion | Grammar, cases, and vocabulary can complete for guests, with browser persistence. Account rewards now write atomically to the user profile and avoid repeat-completion rewards. |
| Sentence Forge | Fixed the retry control that re-selected the same state and did not reset the round. Corrected completion counts that included unrelated lessons. |
| Listening drills | Prevented repeated submission of an already-correct answer, handled unsupported speech synthesis, and stopped clearing the account streak after a wrong answer. |
| Everyday Missions | Reset now clears only its own keys, preserving other work. Relaxed mode is the default; a timed challenge is optional. |
| Community writing | Corrected double-counting of profile XP and used atomic increments. Like/comment clicks no longer produce local XP totals disconnected from the saved profile. |
| Arcade | Removed fabricated starting statistics, recent activity, and leaderboard data. Labelled the duel opponent as a computer and prevented double-counting wins and XP. |
| Grammar explanations | Corrected several blanket rules, including negation, dative endings, instrumental plural exceptions, gender heuristics, and the claim that twenty grammar questions mean B1 mastery. This was not a full linguistic review of every existing lesson. |
| Music | Added loading failure feedback and cancelled stale requests when changing songs. |
| Performance | Lazy-loaded activity routes and split Firebase/motion vendor bundles. No production chunk exceeds Vite’s default 500 kB warning threshold in this build. |
| Mobile/accessibility | Added responsive grids, larger touch targets in new flows, flexible navigation, clearer B1 challenge sizing, visible keyboard focus, and reduced-motion support. Preserved existing module breakpoints. |
| Maintenance | Removed forty-nine duplicate object properties while retaining the last-value behavior already used at runtime. |

## Validation actually performed

- Production build succeeds.
- Thirty-one regression tests pass, including ten account-sync tests and the original tests for: route coverage, lazy import resolution, reset isolation, mission reward idempotence, review intervals, early-review rejection, answer matching, malformed storage recovery, local dates, and curriculum structure.
- Initial server-render checks pass for nineteen public activity entry screens, including checking their rendered text for unresolved icon tokens or hardcoded emoji.
- New application/learning-flow code and supporting utility files pass targeted ESLint checks.
- All JavaScript/JSX source participates in compilation; content data and existing public assets are included in the delivered project.
- ZIP content and route wiring are checked again during packaging.

## Limits and follow-up

- A working headless browser was unavailable: its download failed. Responsive breakpoints and layout code were checked, but actual desktop/mobile visual and interaction testing was not completed. Server-render checks do not execute effects, audio, timers, media loading, or authenticated workflows.
- Firebase sign-in, security rules, permissions, cloud writes, and live community feeds need testing against the owner’s configured Firebase project. No credentials were supplied or invented.
- Existing project-wide lint findings remain, especially older hook patterns and animation code. The targeted new-code lint check passes; the entire repository lint check does not.
- Guests keep browser-only progress. Signed-in learners use account-backed progress with account-specific caches and a retry queue. Guest journey import requires an explicit click; guest drafts are never silently imported.
- These twelve missions are not a complete B1 curriculum. Expand authentic listening, sustained speaking tasks, task-specific writing feedback, and exam-length papers before making readiness claims.
- No user analytics or learning-outcome study was added. A useful next evaluation is to observe learners completing a first mission, returning for recall, and finding their next activity.

## Manual browser checklist

1. At 360 px and 390 px widths, open/close navigation and check for horizontal overflow in each activity.
2. Complete a mission with a mistake, hint, and correct answer. Refresh and confirm saved XP and phrases.
3. Review a phrase; confirm it disappears until due and does not generate duplicate rewards.
4. Search/filter activities, save a favourite, and refresh.
5. Type a writing draft, immediately navigate away, and return to confirm it was saved.
6. Try Sentence Forge with three wrong answers, then use Try Again.
7. Reset Everyday Missions and verify writing/journey progress remains.
8. With Firebase configured, test login/logout, profile updates, account lesson completion, and repeated-completion rewards.
9. Check music loading, unavailable media feedback, device speech, keyboard navigation, and reduced-motion settings.

## Account-progress correction

The current release adds a shared account-aware storage layer for all previously browser-saved learning state. Signed-in data is saved in the user’s own Firestore document, while guests retain browser-only storage. Account switches remount the learning state and never read another account’s cache. Save indicators distinguish confirmed cloud saves from pending/failed sync. Writes are debounced, coalesced, and batched; pending changes survive reload if browser storage is available. Journey completions merge across devices, preserving the latest recorded vocabulary-review result. Draft edits preserve other writing prompts. The same prompt edited concurrently uses commit order.

The account-sync tests use an injected in-memory remote adapter; they are not live Firebase integration tests. The production build and public-entry server-render checks pass. Live sign-in, Firestore access rules, and actual cross-device behavior still require the owner’s configured Firebase project.

## B1 Cloze game — v5

Added the independently usable single-file `public/cloze-b1.html`, plus an account-aware iframe entry at `/cloze`. It contains sixty original B1-oriented sentences, typing/four-choice answers, diacritic-tolerant almost feedback, mastery review scheduling, same-run retries, XP/streaks, progress displays, speech, light/dark modes, validated sentence imports, and backups. Starter frequency ranks are illustrative, not measured corpus values. No previous learning-state key is cleared. Eleven new core tests bring the total to thirty-one. The public-entry render suite now checks nineteen screens, but does not execute the standalone iframe DOM. The cloud browser could not reach the local server, so visual/audio/download and live account checks remain manual. See `CLOZE-GUIDE.md`.
