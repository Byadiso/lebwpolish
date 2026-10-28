# Install the playful learning refresh

## Recommended: use the full project

1. Extract `lebwpolish-cloze-v5.zip` into a new folder.
2. Open the `lebwpolish-cloze-v5` folder in your editor.
3. Copy your existing working `.env` into it if you use Firebase. Public local practice also works without it.
4. Run `npm ci`, then `npm run dev`.
5. Open the exact URL Vite prints, and choose Daily Journey or Explore.

Do not paste all files into App.jsx. Each file has its own destination path.

## Copy into an existing project

`FULL-UPDATED-FILES-v5.txt` contains complete replacement files, each with a BEGIN FILE and END FILE marker. Copy the full content between the markers into the indicated file. Exclude marker lines. Create new directories as needed. Keep your current .env values.

The route wiring is included in `src/App.jsx`. Authentication now has a single provider in `src/main.jsx`; replace both together. Also copy `src/firebase.js` and `src/context/AuthContext.jsx` when applying the update. Copying only DailyJourney.jsx will not install this release.

## Check the result

- `/learn`: twelve mission cards when All starting points is selected.
- `/explore`: searchable activities with SVG icons.
- `/learn?tab=review`: your saved vocabulary review queue.
- `/learn?tab=b1`: five B1 skill cards and a can-do checklist.
- `/B1-writing`: three writing prompts with draft saving.
- `/play`: arcade with real starting statistics and a labelled computer opponent.
- On a phone: open the menu button to reach Daily Journey, Explore, Play, and B1 path.

Run `npm test`, `npm run test:render`, and `npm run build` to repeat the automated checks. The included `APP-REVIEW.md` records limitations and the manual browser checklist.

## Account-progress update

Use the full v4 project or apply every file in the replacement pack. In particular, `src/main.jsx`, `src/context/LearningProgressContext.jsx`, `src/context/LearningStateContext.js`, `src/hooks/useLearningStorage.js`, and `src/lib/learningSync.js` must be installed together. They supply the shared storage provider required by the activity pages.

Keep your existing Firebase `.env`. Signed-in saving requires the project’s Firestore rules to allow the user to read their own `users/{uid}` document and update `learningData` and `learningApplied`. No external Firebase rules or settings were changed. See `ACCOUNT-PROGRESS.md` for a verification checklist.

## B1 Cloze game — v5

Open `/cloze` from Explore. The self-contained game lives at `public/cloze-b1.html` and can also be opened independently. `src/pages/ClozeLab.jsx`, `src/App.jsx`, and `src/data/activities.js` add the account-aware in-app entry. Previous v4 progress and saving behavior are retained. See `CLOZE-GUIDE.md` for the scheduler, import format, backup behavior, and testing limits.
