# LEBWPOLISH — learn by doing

Polish for real life, through short missions, sentence games, reading, speaking prompts, music, and writing. The original red/slate/white brand and existing module fonts are preserved.

## Start locally

Use Node.js 20.19+ or 22.12+.

```bash
npm ci
npm run dev
```

Open the exact local URL printed by Vite. Start with `/learn`, `/explore`, or `/B1-writing`.

The public practice tools work without Firebase configuration. To enable sign-in, saved account profiles, and community features, copy `.env.example` to `.env` and fill in your own Firebase project values. Keep an existing working `.env`; do not overwrite it with the empty example. Restart Vite after changing environment variables.

## Main learning flows

- **One word closer** (`/cloze`): a single-file B1 Cloze game with sixty original sentences, typing/four-choice modes, mastery-based reviews, streaks, XP, JSON imports, and backups. See `CLOZE-GUIDE.md`.
- **Daily Journey** (`/learn`): twelve A1–B1 missions, thirty-six short exercises, contextual phrases, optional hints, and everyday transfer prompts.
- **Memory Garden** (`/learn?tab=review`): recall before reveal, then schedule a phrase for review based on honest self-assessment.
- **B1 Compass** (`/learn?tab=b1`): five exam skill areas, a self-reflection checklist, and official practice links.
- **Explore** (`/explore`): searchable activity directory, skill filters, five-minute filter, favourites, recent activity, and a surprise activity.
- **Writing Studio** (`/B1-writing`): three original practice tasks, planning prompts, saved drafts, word counts, and self-review.
- Existing arcade, reading, listening, music, vocabulary, cases, conjugation, role-play, community writing, and administration routes remain available.

## Checks

```bash
npm test
npm run test:render
npm run build
```

`npm test` covers progress, scheduling, route integrity, and isolated resets. `test:render` checks initial server-rendered public screens and icon rendering; it does not simulate browser interactions. `npm run lint` also checks legacy modules, which still contain pre-existing lint findings. See `APP-REVIEW.md` for exact validation scope.

## Storage and audio

Guests keep their progress in the current browser on the current device. Signed-in learners save their journey, reviews, writing drafts, preferences, favourites, recent activity, and existing saved activity state to their Firebase account. Account-specific browser caches retain pending changes if sync fails; the UI reports whether a save is confirmed or still pending. Guest history is not attached to an account automatically. Daily Journey offers an explicit guest-journey import.

Cloud progress is stored in `users/{uid}.learningData`, with a bounded `learningApplied` list used to avoid replaying writes. Existing account profile fields are preserved. See `ACCOUNT-PROGRESS.md` for setup, migration, conflict handling, and verification. Audio examples use browser/device speech where implemented; Polish voice availability and quality vary.

## Exam preparation scope

The missions are a growing practice foundation, not a complete B1 course or an exam-readiness certification. Add authentic listening, full-length timed sample papers, and teacher feedback on writing and speaking. The adult exam information links to the official certyfikatpolski.pl resources.

## Interface icons

`src/components/AppIcon.jsx` provides local SVGs with a consistent stroke. Serializable `[icon:name]` tokens in content are presented through `IconText`. No icon font, icon CDN, or extra package is needed. User-authored content is not rewritten.

Created by Desire BYAMUNGU.
