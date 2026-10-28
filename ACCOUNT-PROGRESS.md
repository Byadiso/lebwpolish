# Account-linked progress — v4

## Behavior

| Learner | Saving behavior |
| --- | --- |
| Guest / signed out | Current browser and device only. Existing guest keys are preserved. |
| Signed in | Learning state is linked to the authenticated Firebase UID and loaded from the account on another device. |
| Account temporarily offline | Pending changes remain in an account-specific local cache where available. The interface does not claim they are saved to the account until the server confirms. |
| Different user signs in | A separate account cache and server record are used. Another user’s cached work is not displayed. |

The shared layer covers the journey, contextual vocabulary reviews, writing drafts, daily-goal and level preferences, B1 self-reflection, activity favourites, recent activity, saved reading state/cards, saved role-play favourites, saved Everyday Missions state, arcade fallback statistics, and guest-style lesson-completion records when signed in. Existing authenticated profile/lesson rewards continue to use their existing user-profile fields.

## Saving and conflicts

- Writes use Firestore transactions against `users/{uid}` and preserve unrelated profile fields.
- `learningData` maps application storage keys to serialized strings. `learningApplied` holds the latest 128 operation IDs to avoid replaying confirmed operations.
- Fast updates are coalesced and debounced for 300 ms; up to twenty queued operations can be committed in one transaction. Local cache updates are immediate.
- The queue survives a reload when browser storage is available. Retry sync or reconnect to retry failed writes.
- Journey mission IDs and activity days merge as sets, so completed missions from different devices are preserved without duplicate XP. Vocabulary reviews use the latest recorded review timestamp. Correct device clocks are assumed.
- Edits to different writing prompts are merged. Concurrent edits to the same prompt use server commit order; there is no collaborative text editor or draft version history.
- Other preferences and saved session positions use the latest committed value for that key.
- On first account load, the app waits for account data instead of uploading guest defaults. If account loading fails, it offers retry or sign-out to guest practice. A previously cached account can continue with an unsynced-status message.

## Earlier local progress

Earlier versions stored a journey in a shared guest browser key, even when a person happened to be signed in. That history cannot reliably be attributed to one person on a shared device. It is preserved, and Daily Journey offers **Import my guest journey** if there are guest mission completions missing from the signed-in account. Import only your own history. The guest copy is kept. Guest writing drafts and other guests’ activity are not imported automatically.

## Firebase setup

Keep the working Firebase configuration in `.env`. Existing Firestore access rules must allow an authenticated learner to read their own `users/{uid}` document and to write the `learningData` and `learningApplied` fields there. If a profile document is absent, the sync adapter creates a document containing those fields. Rules must permit that owned-document creation if your registration flow does not already create it.

No Firestore rules were deployed or replaced. Preserve your existing role/admin restrictions when adjusting rules. A denied read/write appears as an account-sync error with a retry action; it is not silently treated as a successful save.

## Verification

1. Run `npm test`, `npm run test:render`, and `npm run build`.
2. Signed out: complete a mission and confirm the guest/browser save message.
3. Sign in: confirm account data loads. Choose the guest-journey import if that history belongs to you.
4. Complete another mission and wait for **Progress saved to your account**.
5. In another browser/device, sign into the same account and check missions, review queue, preferences, and a writing draft.
6. Sign into a different account and confirm the first account’s work is absent.
7. Disconnect after a successful account load, make a change, and check the unsynced indicator. Reconnect or retry and verify confirmation before testing another device.
8. Check Firestore permission failures with your project’s own rules and verify they show an error rather than a false success.

Thirty-one regression tests, the production build, targeted new-code lint, and eighteen public-entry server-render checks pass. Account-sync unit tests use a simulated remote service. Live Firebase and browser interaction checks require the owner’s configuration and were not run here.

The Cloze game added in v5 uses the same account-aware store through a same-origin iframe bridge under `lebw.cloze.b1.v1`. Its standalone-file mode uses localStorage. It does not replace other modules’ saved data. Concurrent Cloze sessions use the latest committed game snapshot, so use one active device at a time for that game.
