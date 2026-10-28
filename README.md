# LEBWPOLISH

### Learn Polish by doing. One useful sentence at a time.

**LEBWPOLISH — Learn By Writing Polish** turns everyday Polish practice into small, satisfying activities: complete a mission, build a sentence, recall a word, follow a story, or write something of your own.

The aim is to make returning to Polish feel easy. Learners get practical examples, manageable grammar patterns, supportive feedback, and clear next steps towards B1. The interface keeps the project’s red, slate, and white identity, bold typography, and consistent SVG icons.

Start with **Daily Journey** for guided practice, **One word closer** for sentence-based vocabulary, or **Explore** to choose an activity that fits your mood and time.

## Quick start

### Requirements

- Node.js **20.19+ within the Node 20 series**, or **22.12+**.
- npm and a modern browser.
- A Firebase project for sign-in, account-linked progress, and community features. Local practice can start without it.

### Run the full application

From a checkout containing this version:

```bash
git clone https://github.com/Byadiso/lebwpolish.git
cd lebwpolish
npm ci
npm run dev
```

If you downloaded a project ZIP, extract it and open the folder containing `package.json`; then run `npm ci` and `npm run dev` there. The ZIP may contain updates that have not yet been pushed to GitHub.

Open the **exact local URL printed by Vite**. The port can change when another development server is already running.

Useful starting routes:

- `/learn` — Daily Journey.
- `/cloze` — One word closer, the B1 sentence game.
- `/explore` — the activity library.
- `/B1-writing` — the writing studio.

### Run only the single-file sentence game

Open [`public/cloze-b1.html`](public/cloze-b1.html) directly in your browser. The standalone download is also named `lebwpolish-cloze-b1.html`.

The file contains its own HTML, CSS, vanilla JavaScript, SVG icons, starter sentences, and review scheduler. It needs **no installation or external dependencies**. This applies to the standalone game; the full application uses the React toolchain listed below.

Standalone progress saves locally. Use the full app’s `/cloze` route for account-linked saving when signed in.

## What you can learn with

### Guided learning and discovery

| Feature | What it offers | Route |
| --- | --- | --- |
| Daily Journey | Twelve A1–B1 missions and thirty-six exercises, built around useful everyday patterns. | `/learn` |
| Memory Garden | Optional typed recall, phrase examples, and scheduled vocabulary reviews. | `/learn?tab=review` |
| B1 Compass | Five exam skill areas, a can-do reflection checklist, and official practice resources. | `/learn?tab=b1` |
| Explore | Eighteen activities, search, skill filters, a five-minute filter, favourites, recent visits, and a surprise suggestion. | `/explore` |
| Writing Studio | Three original practice tasks, planning prompts, useful connectors, saved drafts, word counts, and self-review. | `/B1-writing` |
| One word closer | Sixty original B1-oriented cloze sentences, typing and multiple choice, spaced reviews, XP, streaks, and backups. | `/cloze` |

Daily Journey follows a simple sequence: **notice a pattern → try it with support → use it in real life → recall it later**. Learners can choose their starting level without artificial locks. Daily goals and milestones reward actual practice; missing a day does not erase completed missions.

### More ways to practise

| Activity | Focus | Route |
| --- | --- | --- |
| Polish Arcade | Sentence building, word recall, a computer-opponent duel, and story choices. | `/play` |
| Role-play Studio | Speaking prompts and imaginative everyday scenarios. | `/PolishRolePlay` |
| Vocabulary Vault | Words for work, travel, feelings, and other everyday topics. | `/vocabularyvault` |
| Listen & Write | Hear Polish examples and reconstruct the phrase. | `/practice` |
| Grammar Codex | Grammar explanations, examples, hints, and short challenges. | `/grammar` |
| Cases, Made Clearer | Polish case patterns and contextual exercises. | `/practice-polish-case` |
| Sentence Forge | Arrange words into useful Polish sentences. | `/polish-simplified` |
| Verb Workshop | Conjugation patterns and quizzes. | `/conjugation-practice` |
| Read a Story | Reading in context, word lookups, and saved cards. | `/reading-practice` |
| Reading Detective | Short texts and comprehension questions. | `/Reading-comprehension` |
| Everyday Missions | Situational responses, with relaxed practice or an optional timed challenge. | `/shadow-protocol` |
| B1 Grammar Challenge | Twenty grammar situations with explanations and tutor hints. | `/B1-ready` |
| Polish Through Music | Song-based language exploration. | `/polish-music` |
| Polish Through Memes | Community captions, humour, and language notes. | `/PolishMeme` |
| Community Writing | Share writing and interact with other learners. Requires sign-in. | `/space` |

Profile and administration pages are available at `/profile` and `/admin`. Administration requires the configured administrator account. Some account flows use invitation or access-key checks; unrestricted public registration is not currently implemented.

## One word closer: the B1 Cloze game

The game shows a Polish sentence with one missing word and an English translation underneath. Type the word and press Enter, or switch to four-choice mode. Feedback reveals the complete sentence and a short explanation of the word form.

The starter set contains **twelve sentences in each of five topics**: daily life, work, health, shopping, and travel. It mixes cases and verb tenses. Starter frequency ranks are illustrative practice priorities, not measured corpus frequencies.

### Sessions and answer checking

- A scored session starts with **due reviews, oldest first**, followed by **up to ten new sentences**.
- **Fast Track** introduces unseen sentences in ascending `frequencyRank` order. Turning it off uses library order.
- Capitalisation and extra surrounding spaces are ignored.
- An answer equivalent after removing Polish diacritics is accepted as **almost**. The correct spelling is shown, and mastery still advances.
- Other mistakes reveal the answer and return the sentence after up to three other queued cards. If no other cards remain, the retry follows the feedback step.
- Press Enter on the feedback panel, click Next, or enable auto-next. You can finish a run at any time.

### Mastery and points

| Mastery after an accepted answer | Next review |
| --- | --- |
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 8 days |
| 5 | 16 days |

Correct and almost answers raise mastery by one, capped at five. Later correct reviews at level five remain sixteen days apart. A wrong answer resets mastery to zero and leaves the sentence due if the run is stopped.

| Answer | Cloze XP |
| --- | --- |
| Exact typed answer | 20 |
| Typed answer missing Polish diacritics | 15 |
| Correct multiple choice | 10 |
| Wrong answer | 0; no points are subtracted |

Every 100 Cloze XP adds a game level. The progress screen shows mastered unique target forms, accepted-answer accuracy, almost-answer counts, a daily streak, a rolling 28-day practice calendar, and mastery distribution.

**Free play** revisits introduced sentences without changing XP, accuracy, streak statistics, or review dates. It provides extra practice while keeping the scored review schedule intact.

The game also includes Polish-letter insertion, device speech, dark and light modes, JSON sentence imports, and progress backup/export. See the [Cloze guide](CLOZE-GUIDE.md) for details.

## How progress is saved

| How you use the app | Saving behavior |
| --- | --- |
| Guest / signed out | Progress stays in the current browser on the current device. |
| Signed in, inside the full app | Supported saved learning state is linked to the authenticated Firebase account. |
| Account sync fails temporarily | Changes remain queued in an account-specific browser cache where available. The interface reports an unsynced state until the server confirms saving. |
| Another account signs in | A separate account record and cache are used. The previous learner’s cached work is not displayed. |
| Standalone Cloze HTML | Local saving only, even if another tab is signed into the full app. Use a backup to transfer the game’s data between origins or browsers. |

The shared account layer covers the journey, vocabulary reviews, writing drafts, preferences, B1 reflection, activity favourites, recent visits, existing saved reading and mission state, and the integrated Cloze game. Existing account profile and lesson-reward fields are preserved.

Account data is stored in `users/{uid}.learningData`. A bounded `learningApplied` operation list helps prevent replaying confirmed writes. Writes are coalesced, briefly debounced, and committed through transactions.

### Guest history and multiple devices

Guest history is **not silently assigned to whoever signs in next**. Daily Journey offers **Import my guest journey** when the device contains guest mission completions missing from the account. The guest copy is kept; guest writing drafts and other local history are not imported automatically.

Journey completions merge across devices, and review results use their recorded timestamps. Edits to different writing prompts are preserved; concurrent edits to the same prompt follow commit order. Other saved session positions, including a Cloze game snapshot, use the latest committed value. Use one active Cloze device/session at a time.

Clearing browser data can remove guest work and unsynced caches. Export Cloze backups when you want a transferable copy. See [Account-linked progress](ACCOUNT-PROGRESS.md) for the storage model and verification steps.

## Firebase and optional media configuration

Keep your existing working `.env`. For a new setup, copy `.env.example` without overwriting an existing configuration.

**macOS / Linux:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Populate the Firebase web-app values:

```dotenv
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Use the values from your own project. `measurementId` is included in the configuration but is not required to enable local practice. The app’s configured-mode check uses the API key, project ID, and app ID; a working account setup also needs the appropriate Firebase services and permissions.

For account and community features, configure:

1. **Firebase Authentication**, including the email/password sign-in method used by the current account flow.
2. **Cloud Firestore**, with rules permitting learners to read their own user document and write the progress fields they own.
3. The existing community collections and their intended permissions if you use shared writing or meme features.

The account-sync layer writes `learningData` and `learningApplied` under `users/{uid}`. If registration has not created that document, the layer may create it with those fields. Preserve administrator restrictions and authorization rules; client-side route guards do not replace Firestore authorization.

Meme image uploads additionally read these optional Cloudinary settings:

```dotenv
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Configure the intended upload preset and restrictions in your Cloudinary account. Those settings are unnecessary for the standalone Cloze game and other local practice flows.

All `VITE_*` values are available to browser code. Do not put service-account credentials or other server secrets in them. Restart Vite after editing `.env`.

## Importing sentence data

In the Cloze game, open **Library**, paste a JSON array, and choose **Add sentences**:

```json
[
  {
    "id": "custom-001",
    "polish": "Chciałabym porozmawiać z lekarzem.",
    "english": "I would like to speak with a doctor.",
    "targetWord": "lekarzem",
    "frequencyRank": 500,
    "grammarHint": "Instrumental singular after z meaning with.",
    "topic": "Health"
  }
]
```

The first five fields are required. `grammarHint` and `topic` are optional. The example rank above illustrates the format; use ranks from your chosen frequency source when available.

The missing word must occur exactly once as a complete word in the Polish sentence. Imports are validated before changes are applied. Identical existing IDs are skipped; conflicting IDs and duplicate imported IDs are rejected. Existing progress remains attached to its original sentence ID.

For Tatoeba or another source, first convert selected sentence/translation pairs into this format and retain any required source information and attribution. The app does not fetch Tatoeba automatically. The sixty starter sentences are original content.

## Backups

In the Cloze game, open **Your progress → Export backup**. The exported JSON includes its sentence library, mastery, review dates, statistics, calendar, and settings.

To restore, choose a backup, review its summary, and explicitly confirm restoration. It replaces **only Cloze game data**; other learning modules are unaffected. Restoring starts without an unfinished quiz, while an ordinary reload can resume the current saved run.

Cloze backup export is not a full Firebase-account export. Other account progress continues to use its own saving layer.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the committed lockfile. |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production application in `dist/`. |
| `npm run preview` | Serve the production build locally for inspection. |
| `npm test` | Run Node regression tests for progress, scheduling, imports, and route integrity. |
| `npm run test:render` | Check initial server-rendered public screens and icon output. |
| `npm run test:production` | Build and execute the emitted Firebase chunk to check SDK initialization. |
| `npm run lint` | Run ESLint across the configured source files. Legacy findings remain. |

There is no `npm start` script in the current project.

## Project structure

| Location | Responsibility |
| --- | --- |
| `src/main.jsx` | Mounts the application with one authentication provider and the learning-progress provider. |
| `src/App.jsx` | Application routes, access guards, lazy-loaded activities, and route-level behavior. |
| `src/components/` | Navigation, SVG icons, text/icon presentation, and error recovery. |
| `src/context/` | Authentication and account-aware learning-state providers. |
| `src/hooks/` | Storage access, lesson completion, and activity tracking. |
| `src/lib/` | Review scheduling, progress validation, synchronization, and scoped storage helpers. |
| `src/data/` | Journey missions, activity definitions, and existing learning content. |
| `src/pages/` | Learning screens and legacy activity modules. |
| `public/cloze-b1.html` | Complete standalone Cloze game, including its data, scheduler, UI, and styles. |
| `public/songs/`, `public/stories/` | Existing song and reading assets. |
| `tests/` | Regression tests and server-render smoke checks. |
| `vite.config.js` | Vite plugins and production chunk configuration. |

The full app uses **React 19**, **React Router 7**, **Vite 7**, **Tailwind CSS 4**, **Firebase 12**, Framer Motion, and confetti libraries. Exact dependency ranges are in `package.json`, with resolved versions in `package-lock.json`.

Interface icons come from the local SVG system in `AppIcon.jsx`. Content files can use serializable `[icon:name]` tokens rendered through `IconText`; no icon CDN or font package is needed. The standalone game embeds its own SVG symbols. Some legacy modules load their existing web fonts or media separately.

## Testing and current limits

The current implementation has **31 passing regression tests** and **19 initial-screen server-render checks**, with a successful production build. Coverage includes:

- Route and lazy-import integrity.
- Mission reward idempotence and isolated resets.
- Review dates, diacritic matching, retries, and Cloze import/backup validation.
- Account-cache separation, queued-write recovery, and simulated cross-device merging.
- Initial public-screen rendering and unresolved icon-token checks.

These checks have practical limits:

- Server-render checks do not exercise interactive browser behavior, iframe gameplay, audio, file pickers, or downloads.
- Account-sync tests use a simulated remote adapter; live Firebase sign-in, rules, and cross-device saves still need verification against the owner’s project.
- Desktop/mobile visual testing was not completed in this environment because the cloud browser could not connect to the workspace server.
- The full repository lint command still reports legacy issues. The targeted checks for the new flows and wrapper passed.
- Device-generated Polish speech depends on browser/OS support and installed voices. Voice quality and platform connectivity requirements vary.

See [APP-REVIEW.md](APP-REVIEW.md) for the implementation review and manual verification checklist.

## Production hosting

Build the full application:

```bash
npm ci
npm run build
```

Publish the generated `dist/` directory with your static hosting provider. Configure the required `VITE_*` values in the build environment before building; changing them requires a new build.

The project uses browser-based routing. Deep links such as `/learn`, `/cloze`, and `/B1-writing` need a fallback to `index.html`, while real static files must still be served normally. The repository includes Netlify fallback configuration in `netlify.toml` and `public/_redirects`. Configure an equivalent fallback on other hosts.

`npm run preview` is a local inspection server, not a production hosting setup. The standalone `cloze-b1.html` can instead be hosted as an individual static file, with local-only progress.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `/learn` or `/cloze` is missing | Run the current project folder, not an older extracted copy. Check `src/App.jsx`, stop the old server, and restart Vite. |
| The browser shows the old app | Use the exact URL and port printed by the current server. Confirm which folder contains the running `package.json`. |
| Sign-in is unavailable | Check the Firebase `.env` values, enabled sign-in method, and account/invitation flow. Restart Vite after configuration changes. |
| Account progress cannot load or save | Check connectivity and owned-document Firestore permissions. Use the visible retry action; do not assume an unsynced change is already in the cloud. |
| Guest progress appears missing | Check the browser, device, hostname, and port. Guest storage is origin-specific. A standalone file and the hosted app do not automatically share it. |
| A hosted deep link returns 404 | Configure the single-page-app fallback while preserving static asset routes. |
| Polish audio does not play | Check browser support, available Polish voices, and device audio. Use an explicit Speak action. |
| Meme image upload fails | Check the optional Cloudinary settings and upload-preset configuration. |
| Cloze JSON import is rejected | Check required fields, unique IDs, positive integer ranks, and a target word occurring exactly once. Validation messages identify the issue. |
| Standalone saving is unavailable | Check browser storage restrictions and export a backup before closing the game. |

## Extending the project

- Add guided missions in `src/data/journey.js` and register discoverable activities in `src/data/activities.js`.
- Keep route wiring in `src/App.jsx` aligned with the activity directory.
- Use the shared learning-storage hooks for saved state that should belong to a signed-in account. Keep guest storage isolated.
- Extend Cloze content through validated JSON imports or the embedded `starter-data` block in `public/cloze-b1.html`.
- Preserve stable content IDs, the existing visual identity, responsive layouts, keyboard access, and reduced-motion behavior.
- Give grammar explanations in small contextual steps and check exceptions before presenting a rule as universal.
- Test persistence and reward changes for duplicate awards, account switching, failed sync, and backup recovery.

## B1 preparation scope

LEBWPOLISH provides a growing practice foundation across listening, reading, grammar, writing, and speaking. The current content is **not a complete B1 course or a readiness certification**. Game XP, mastery levels, checklists, and short grammar rounds are practice indicators rather than exam results.

Build preparation with authentic listening, longer conversations, full-length timed sample papers, and feedback on writing and speaking. Official resources are available from [certyfikatpolski.pl](https://certyfikatpolski.pl/); the B1 Compass links to its exam structure and sample tasks.

## Further documentation

- [Installation and update guide](UPDATE-GUIDE.md)
- [Account-linked progress and synchronization](ACCOUNT-PROGRESS.md)
- [Cloze game guide and scheduler](CLOZE-GUIDE.md)
- [Application review and validation scope](APP-REVIEW.md)

## Author and content

Created by **Desire BYAMUNGU**.

The repository currently has no project-wide licence file. Keep the source and attribution requirements of third-party music, images, text, and imported datasets separate from the original learning content.

**LEBWPOLISH — small steps, real conversations.**
