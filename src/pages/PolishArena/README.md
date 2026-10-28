# 🇵🇱 Polish Arena — React Component

A fully self-contained React mini-game hub for learning Polish. Drop it into any React project.

## Files

```
src/components/PolishArena/
├── index.js              ← barrel export (import from here)
├── PolishArena.jsx       ← root component, state orchestration
├── PolishArena.css       ← all styles (self-contained)
├── data.js               ← all game data (vocabulary, questions, story)
├── HubScreen.jsx         ← main menu + stats
├── SlotScreen.jsx        ← 🎰 random sentence slot machine
├── PhantomScreen.jsx     ← 👻 ghost card review (spaced repetition)
├── DuelScreen.jsx        ← ⚔️ timed rival duel with countdown
└── StoryScreen.jsx       ← 📺 interactive story mode (Marek's interview)
```

## Usage

### Basic drop-in

```jsx
import PolishArena from './components/PolishArena';

export default function App() {
  return <PolishArena />;
}
```

### With XP callback (sync to external state)

```jsx
import PolishArena from './components/PolishArena';

export default function LearnPage() {
  const handleXpGain = (amount) => {
    // e.g. update your global user profile
    updateUserXP(amount);
  };

  return <PolishArena onExternalXpGain={handleXpGain} />;
}
```

### Individual screens (advanced)

```jsx
import { SlotScreen, PhantomScreen, DuelScreen } from './components/PolishArena';
```

## Extending game data

All content lives in `data.js`. To add more:

- **Slot machine words**: add to `SUBJECTS`, `VERBS`, or `OBJECTS` arrays
- **Ghost cards**: add objects to `PHANTOM_DATA`
- **Duel questions**: add to `DUEL_QUESTIONS`
- **Story chapters**: add to `STORY_PARTS` (each has `choices` with `xp` values)

## Requirements

- React 17+ (uses hooks: `useState`, `useEffect`, `useCallback`, `useRef`)
- No external dependencies

## Styling

The component is fully self-contained via `PolishArena.css`. It uses a dark theme (`#020617` base) with indigo accents. Max-width 480px, centered. Safe for embedding in any page layout.

To override the color scheme, target `.polish-arena-root` and override CSS custom properties or specific classes.
