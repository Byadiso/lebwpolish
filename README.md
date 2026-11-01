# LEBWPOLISH

### Learn Polish by doing. One useful sentence at a time.

**LEBWPOLISH — Learn By Writing Polish** is an interactive language-learning platform designed to make Polish practice practical, engaging, and accessible.

From building your first sentences to strengthening your confidence at B1 level, LEBWPOLISH brings vocabulary, grammar, writing, reading, listening, and everyday communication together in one learning space.

**[Explore LEBWPOLISH](https://lebwpolish.netlify.app/)**

---

## About the Platform

Learning Polish takes more than memorizing vocabulary. It requires understanding how words work together, recognizing grammar patterns, and using the language in meaningful situations.

LEBWPOLISH is built around a simple philosophy:

**Learn. Practise. Remember. Improve.**

Through interactive activities, guided learning missions, spaced repetition, and contextual exercises, learners can develop their skills at their own pace.

The platform currently focuses on **A1–B1 learning and practice**, with particular attention to practical communication and preparation for intermediate-level Polish.

## Key Features

### Guided Learning Journey

Follow structured learning missions covering useful vocabulary, sentence patterns, and everyday situations.

- Twelve learning missions and thirty-six exercises
- Flexible starting levels
- Daily learning goals and progress milestones
- Vocabulary review through Memory Garden
- B1 Compass for exam-oriented skill reflection

### Interactive Polish Practice

Explore a collection of activities designed to develop different language skills.

| Learning Experience | Description |
|---|---|
| Daily Journey | Guided missions and progressive language practice |
| One Word Closer | B1-oriented sentence completion and vocabulary recall |
| Vocabulary Vault | Practical vocabulary organized around everyday topics |
| Grammar Codex | Grammar explanations, examples, and challenges |
| Sentence Forge | Build meaningful sentences from individual words |
| Verb Workshop | Practise Polish verb conjugation |
| Polish Arcade | Interactive games for vocabulary and sentence building |
| Role-play Studio | Practise communication in realistic scenarios |
| Listen & Write | Strengthen listening and written recall |
| Reading Practice | Read Polish stories and explore vocabulary in context |
| Writing Studio | Complete writing tasks with prompts and self-review |
| B1 Grammar Challenge | Apply grammar knowledge to contextual questions |

### One Word Closer — B1 Sentence Game

**One Word Closer** is an interactive sentence-completion experience focused on vocabulary and grammar in context.

It includes:

- Sixty original B1-oriented sentences
- Typing and multiple-choice practice
- Spaced repetition and mastery levels
- Explanations and contextual feedback
- XP, streaks, and learning statistics
- Progress backup and restoration

The game is available within the main platform and as a standalone HTML experience.

### Personal Learning Progress

LEBWPOLISH helps learners return to their studies without losing track of what they've accomplished.

Depending on the activity and account status, supported features include:

- Learning progress and mission completion
- Vocabulary review history
- Writing drafts
- Learning preferences
- Activity favourites and recent visits
- Account-linked progress synchronization
- Local progress for guest learners

### Quick Notes

Capture useful vocabulary, grammar observations, and personal learning reminders while exploring the platform.

Quick Notes provides a convenient place to keep ideas and revisit them later.

### Community and Creative Learning

Learning a language is also about expression and connection.

LEBWPOLISH includes creative activities such as community writing, Polish through music, Polish through memes, and interactive role-play experiences.

Some community features require an account.

---

## Designed for a Better Learning Experience

LEBWPOLISH combines a consistent visual identity with an interface designed to make regular practice feel approachable.

The experience includes:

- Responsive layouts for desktop and mobile
- Consistent SVG iconography
- Clear navigation and activity discovery
- Branded loading states
- Accessible interaction patterns
- Optional background music controls
- A cohesive red, slate, and white design system

The goal is to make the interface feel modern without distracting from learning.

## Privacy and Visitor Analytics

LEBWPOLISH includes an administrator-only statistics dashboard intended to help understand platform usage and improve the learning experience.

Analytics functionality is designed to distinguish between guest and authenticated visitor sessions and measure information such as page visits and engagement duration.

The platform also provides a dedicated **[Privacy Policy](https://lebwpolish.netlify.app/privacy)** explaining its approach to data handling.

Analytics configuration, database access controls, and applicable privacy requirements should be reviewed before production use.

---

## Technology Stack

LEBWPOLISH is built with modern web technologies.

| Technology | Purpose |
|---|---|
| React | Interactive user interface |
| Vite | Development and production builds |
| React Router | Client-side navigation |
| Tailwind CSS | Styling and responsive layouts |
| Firebase Authentication | User authentication |
| Firebase Realtime Database | Application data and visitor analytics |
| Firebase Cloud Firestore | Features that use document-based storage |
| Framer Motion | Interface animations |
| Netlify | Website hosting and deployment |

The application also uses local browser storage for supported guest learning experiences and preferences.

## Getting Started

To run LEBWPOLISH locally:

```bash
git clone https://github.com/Byadiso/lebwpolish.git
cd lebwpolish
npm ci
npm run dev
```

Open the local address displayed by Vite.

**Requirements:** Node.js 20.19+ or 22.12+, npm, and a modern web browser.

### Environment Configuration

For Firebase-enabled features, configure the relevant environment variables in your local `.env` file.

```dotenv
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.europe-west1.firebasedatabase.app
```

Use the configuration values from your own Firebase project. Firebase Authentication providers and database security rules must also be configured for the features you intend to use.

Do not place private service-account credentials in frontend environment variables.

### Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate a production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run the configured regression tests |
| `npm run lint` | Run ESLint |

---

## Deployment

LEBWPOLISH is hosted on **Netlify**.

**Live application:** https://lebwpolish.netlify.app/

The production application is generated with:

```bash
npm run build
```

The resulting `dist/` directory contains the deployable website.

Firebase environment variables must be configured in the hosting environment before building. Client-side routes require a single-page application fallback.

## Project Vision

LEBWPOLISH aims to become a welcoming, practical space where Polish learners can build confidence through regular, meaningful practice.

Future development will continue to focus on improving the learning experience, expanding useful content, strengthening progress tracking, and making Polish easier to practise in real-life contexts.

The long-term objective is not simply to help learners recognize Polish words, but to help them **use Polish with greater confidence and independence**.

## Learning Scope

LEBWPOLISH supports language development through guided exercises and interactive practice. It is not currently a complete B1 certification course or an official assessment of exam readiness.

Learners preparing for formal certification should also use authentic listening materials, extended speaking and writing practice, and official examination resources.

Official Polish certification information is available at [certyfikatpolski.pl](https://certyfikatpolski.pl/).

## Creator

**Created by Desire BYAMUNGU**

LEBWPOLISH is an independent language-learning project built around the belief that consistent, practical learning can make a meaningful difference.

The repository does not currently declare a project-wide open-source licence. Third-party content and assets may have separate usage requirements.

---

**LEBWPOLISH — Small steps. Real conversations.**

[Visit the Platform](https://lebwpolish.netlify.app/) · [Privacy Policy](https://lebwpolish.netlify.app/privacy) · [GitHub Repository](https://github.com/Byadiso/lebwpolish)