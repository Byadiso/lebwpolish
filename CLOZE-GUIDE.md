# One word closer — LEBWPOLISH B1 Cloze Lab

## Open the single-file game

Open `lebwpolish-cloze-b1.html` in a modern browser. HTML, CSS, vanilla JavaScript, sixty starter sentences, grammar hints, and SVG icons are all in this one file. No package installation, fonts, network assets, or external libraries are required. The font stack matches the app’s system-sans identity; red/slate colours and bold typography are retained.

Standalone progress is stored under its own localStorage key, `lebw.cloze.b1.v1`. Browsers handle local `file:` storage differently; if saving is unavailable, the footer warns you. Export a JSON backup before leaving. Device speech depends on installed browser/OS voices and may require the platform’s own connectivity.

## Open it inside the existing app

Use the complete v5 project, retain your existing `.env`, and run:

```bash
npm ci
npm run dev
```

Visit `/cloze` or find **One word closer** in Explore. The game remains a single independent HTML file, embedded by a small React wrapper. Guests use browser saving; signed-in learners use the account-aware saving layer from v4. The wrapper validates the message origin and iframe source and only accepts this game’s designated storage key. Firebase permissions/configuration from v4 are still required for account saves.

No earlier journey, reading, writing, profile, or vocabulary data is reset or replaced. Standalone-file browser storage and the hosted app’s browser storage are different origins; use a game backup to move between them.

## The learning loop

1. A session starts with due reviews, oldest first, followed by at most ten unseen sentences.
2. Fast Track orders new sentences by ascending `frequencyRank`. Turn it off to use library order. Starter ranks are illustrative priorities, not measured corpus frequencies; supplied corpus ranks are respected for imported entries.
3. Type the word and press Enter, or choose one of four distinct options. Capitalisation and extra surrounding spaces are ignored.
4. A diacritic-free equivalent is accepted as **almost**, while the correct spelling is shown. Other word endings are not treated as equivalent.
5. Feedback reveals the full sentence and its grammar hint. Press Enter on the feedback panel, click Next, or enable timed auto-next. Speech and other focused buttons retain their native keyboard actions.
6. Wrong answers return after up to three other queued cards. If no other cards remain, the retry is necessarily next after feedback. Finish for now is always available.

The model and scheduler are defined before the UI script, with a short explanation at the top of the code. Sentence data is in the embedded `starter-data` JSON block.

## Review schedule

| Accepted-answer mastery | Next review |
| --- | --- |
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 8 days |
| 5 | 16 days |

Accepted includes correct and almost. Mastery is capped at five, and subsequent correct reviews at five remain sixteen days apart. Wrong answers reset to zero and stay due if the run is stopped. Future-due cards are not included in scored sessions.

Free play uses up to twenty introduced sentences, starting with lower mastery. It is unlimited and changes neither review dates nor XP/accuracy/streak statistics.

## Points and progress

- Exact typed answer: 20 XP.
- Typed answer missing Polish diacritics: 15 XP.
- Correct multiple choice: 10 XP.
- Wrong answer: 0 XP, with no subtraction.
- Re-submitting the same feedback cannot award duplicate points.
- Every 100 XP adds a level. These are game levels, not CEFR or exam scores.
- The progress screen shows mastered unique target forms (mastery five), accepted-answer accuracy, almost-answer counts, current streak, a rolling 28-day practice calendar, and mastery distribution.
- Any scored practice attempt counts as an active day; simply opening the game does not. A streak may continue from yesterday before you practise today.

## Add more sentences

Paste an array into Library:

```json
[
  {
    "id": "custom-001",
    "polish": "Czekam na twoją odpowiedź.",
    "english": "I am waiting for your answer.",
    "targetWord": "odpowiedź",
    "frequencyRank": 120,
    "grammarHint": "Accusative singular after czekać na.",
    "topic": "Daily life"
  }
]
```

The first five fields are required. Grammar hints and topics are optional; starter hints cover all sixty original sentences. For useful feedback on custom material, supply a grammarHint rather than relying on an automatically guessed rule.

The target must appear exactly once as a complete word, with the same spelling apart from capitalisation. Imports are validated before anything is changed. Identical existing IDs are skipped; conflicting IDs and duplicate imported IDs are rejected. Existing progress stays attached to its original sentence ID. HTML-like text is escaped when displayed. The library supports up to 10,000 entries, subject to browser storage limits.

Tatoeba-style data must be converted to the fields above; the app does not fetch Tatoeba. Verify licensing, attribution, translations, and frequency sources for any imported material. The starter set here is original content.

## Backups

Export a backup from Your progress. It includes the library, mastery, due dates, lifetime statistics, calendar, and settings. Choose a backup, review its summary, then explicitly restore it. Restoring replaces only this Cloze game’s data and starts without an unfinished quiz; other app progress is untouched. A regular reload can resume an in-progress saved run, including its existing feedback, without awarding the answer twice.

The integrated Cloze save is one account-backed game snapshot. Use one active device/session at a time; concurrent Cloze runs follow the shared store’s latest committed snapshot. Existing v4 journey merging is unchanged.

## Validation

- Thirty-one regression tests pass, including eleven Cloze-specific tests for all sixty data rows, scheduling, retries, rewards, diacritics, choices, free play, backups, streak boundaries, and absence of external dependencies.
- Nineteen public-entry server-render checks pass, including the new iframe wrapper. These do not run the iframe’s interactive DOM.
- Production build and targeted wrapper lint pass.
- A browser check was attempted, but the cloud browser could not connect to the workspace’s local server. Desktop/mobile visual checks, real audio, download/file-picker interactions, and live Firebase sync remain to be checked in the owner’s browser.
