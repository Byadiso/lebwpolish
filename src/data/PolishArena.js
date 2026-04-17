// ─── SLOT MACHINE DATA ───────────────────────────────────────────────────────

export const SUBJECTS = [
  { pl: 'Ja', en: 'I' },
  { pl: 'Ty', en: 'You' },
  { pl: 'On', en: 'He' },
  { pl: 'Ona', en: 'She' },
  { pl: 'My', en: 'We' },
  { pl: 'Marek', en: 'Marek' },
  { pl: 'Anna', en: 'Anna' },
  { pl: 'Kot', en: 'The cat' },
  { pl: 'Profesor', en: 'The professor' },
  { pl: 'Dziecko', en: 'The child' },
];

export const VERBS = [
  { pl: 'kupuje', en: 'buys', past: 'kupił/a' },
  { pl: 'czyta', en: 'reads', past: 'czytał/a' },
  { pl: 'widzi', en: 'sees', past: 'widział/a' },
  { pl: 'zapomniał', en: 'forgot', past: 'zapomniał/a' },
  { pl: 'lubi', en: 'likes', past: 'lubił/a' },
  { pl: 'szuka', en: 'is looking for', past: 'szukał/a' },
  { pl: 'gotuje', en: 'cooks', past: 'gotował/a' },
  { pl: 'pisze', en: 'writes', past: 'pisał/a' },
  { pl: 'rozumie', en: 'understands', past: 'rozumiał/a' },
  { pl: 'słucha', en: 'listens to', past: 'słuchał/a' },
];

export const OBJECTS = [
  { pl: 'kawę', en: 'coffee' },
  { pl: 'książkę', en: 'a book' },
  { pl: 'klucze', en: 'keys' },
  { pl: 'rower', en: 'a bike' },
  { pl: 'psa', en: 'the dog' },
  { pl: 'muzykę', en: 'music' },
  { pl: 'raport', en: 'the report' },
  { pl: 'film', en: 'a film' },
  { pl: 'obiad', en: 'lunch' },
  { pl: 'wiadomość', en: 'a message' },
  { pl: 'prezent', en: 'a gift' },
  { pl: 'numer', en: 'the number' },
];

// ─── PHANTOM CARDS DATA ───────────────────────────────────────────────────────

export const PHANTOM_DATA = [
  {
    word: 'Biernik',
    ctx: 'The case that shifts objects after action verbs',
    opts: ['Accusative case', 'Genitive case', 'Dative case', 'Nominative case'],
    correct: 'Accusative case',
    explain:
      'Biernik = Accusative. It targets the direct object of action. Widzę, mam, lubię all trigger it.',
  },
  {
    word: 'Podoba mi się',
    ctx: 'Expression of liking something in Polish',
    opts: [
      'I am similar',
      'I like it (lit: it pleases me)',
      'I am looking for it',
      'I think so',
    ],
    correct: 'I like it (lit: it pleases me)',
    explain:
      'Podoba mi się = it pleases to me. Polish liking uses Dative. Mi = Dative of Ja. Never "podoba mnie się"!',
  },
  {
    word: 'Chciałabym',
    ctx: 'A woman speaking — expressing desire',
    opts: [
      'She would want',
      'I will want',
      'I would like (feminine)',
      'They wanted',
    ],
    correct: 'I would like (feminine)',
    explain:
      'Chciałabym = conditional, feminine 1st person. The -ła- signals feminine gender. Men say Chciałbym.',
  },
  {
    word: 'Nie mam czasu',
    ctx: 'Responding to "Can you meet today?"',
    opts: [
      "I don't have time",
      "I don't like time",
      "I have no money",
      'Time is not here',
    ],
    correct: "I don't have time",
    explain:
      'Nie triggers Genitive: czas → czasu. "Nie mam auto" is wrong — it must be "Nie mam auta". Same rule here.',
  },
  {
    word: 'Gdybym był',
    ctx: 'Starting a hypothetical sentence',
    opts: ['When I am', 'If I were', 'Because I was', 'While I am'],
    correct: 'If I were',
    explain:
      'Gdybym + był = conditional "If I were". The -by- marker signals we have left reality. Gdybym była = feminine form.',
  },
];

// ─── DUEL QUESTIONS ───────────────────────────────────────────────────────────

export const DUEL_QUESTIONS = [
  {
    pl: 'Czy mówisz po polsku?',
    opts: [
      'Do you speak Polish?',
      'Are you Polish?',
      'Did you speak Polish?',
      'Can you write Polish?',
    ],
    correct: 'Do you speak Polish?',
  },
  {
    pl: 'Jestem Polakiem.',
    opts: [
      'I am Polish. (masc.)',
      'She is Polish.',
      'I like Poland.',
      'We are Polish.',
    ],
    correct: 'I am Polish. (masc.)',
  },
  {
    pl: 'Nie mam czasu.',
    opts: [
      "I don't have money.",
      "I don't have time.",
      'Time is up.',
      'I am busy tomorrow.',
    ],
    correct: "I don't have time.",
  },
  {
    pl: 'Chciałbym kawę, proszę.',
    opts: [
      'I would like a coffee, please.',
      'Give me coffee.',
      'I had coffee.',
      'Coffee is ready.',
    ],
    correct: 'I would like a coffee, please.',
  },
  {
    pl: 'Widzę piękną kobietę.',
    opts: [
      'I see a beautiful woman.',
      'I like a beautiful woman.',
      'I saw a beautiful girl.',
      'She sees a woman.',
    ],
    correct: 'I see a beautiful woman.',
  },
];

// ─── STORY DATA ───────────────────────────────────────────────────────────────

export const STORY_PARTS = [
  {
    ep: 'Ep. 3 — Dzień w Biurze',
    title: 'The Job Interview',
    location: 'Warsaw, Biuro na 12. piętrze — 9:00 AM',
    narration:
      'You are Marek. You have been learning Polish for 6 months. Today is your first real job interview — at a Warsaw startup. Your interviewer, Pani Kowalska, steps in with coffee and looks at you expectantly.',
    prompt:
      'Pani Kowalska says: "Dzień dobry! Jak się pan nazywa?" (Good morning! What is your name?)',
    choices: [
      {
        pl: 'Dzień dobry, nazywam się Marek Nowak.',
        en: 'Good morning, my name is Marek Nowak.',
        badge: 'smart',
        outcome: 'good',
        result:
          'Pani Kowalska smiles. "Bardzo dobrze!" she says, impressed by your formal register. You have started perfectly. +50 XP, interview advances.',
        xp: 50,
      },
      {
        pl: 'Hej, jestem Marek!',
        en: 'Hey, I am Marek!',
        badge: 'risky',
        outcome: 'neutral',
        result:
          'Kowalska raises an eyebrow. Too casual for a formal interview in Poland. She continues, but your first impression was slightly off. Lesson: Polish work culture values formality. +20 XP.',
        xp: 20,
      },
      {
        pl: 'Nie rozumiem po polsku.',
        en: "I don't understand Polish.",
        badge: 'bad',
        outcome: 'bad',
        result:
          "Silence. Kowalska switches to English. You just told a Warsaw interviewer you don't speak Polish — the job requires it. The interview continues awkwardly. -1 confidence point. +5 XP (for honesty).",
        xp: 5,
      },
    ],
  },
  {
    ep: 'Ep. 3 — Part 2',
    title: 'The Tricky Question',
    location: 'Warsaw, same office — 9:15 AM',
    narration:
      'Pani Kowalska asks you about your experience. She wants to know if you have finished a big project before.',
    prompt:
      '"Czy pan skończył jakiś duży projekt?" (Have you finished any large project?)',
    choices: [
      {
        pl: 'Tak, napisałem raport dla 50 klientów.',
        en: 'Yes, I wrote a report for 50 clients.',
        badge: 'smart',
        outcome: 'good',
        result:
          'Perfect! You used Perfective aspect (napisałem = I wrote/finished). Kowalska nods approvingly — you understand completion. +60 XP, strong impression.',
        xp: 60,
      },
      {
        pl: 'Tak, pisałem raport dla klientów.',
        en: 'Yes, I was writing a report for clients.',
        badge: 'risky',
        outcome: 'neutral',
        result:
          'You used Imperfective (pisałem = I was writing). The report process is described, but not its completion. Kowalska wonders: did you actually finish it? Slightly weaker answer. +30 XP.',
        xp: 30,
      },
      {
        pl: 'Nie, nie mam projektów.',
        en: 'No, I have no projects.',
        badge: 'bad',
        outcome: 'bad',
        result:
          'Kowalska writes something down. You missed the chance to showcase experience. In Polish interviews, humility can read as incompetence. +10 XP.',
        xp: 10,
      },
    ],
  },
  {
    ep: 'Ep. 3 — Part 3',
    title: 'Making a Request',
    location: 'Warsaw — 9:30 AM',
    narration:
      'You want to ask for a glass of water. The office assistant is nearby.',
    prompt: 'How do you politely ask for water?',
    choices: [
      {
        pl: 'Czy mógłbym prosić o wodę?',
        en: 'Could I ask for some water?',
        badge: 'smart',
        outcome: 'good',
        result:
          'Textbook conditional politeness! Mógłbym = I could (conditional). This is exactly how educated Poles make requests. The assistant smiles and brings it immediately. +50 XP.',
        xp: 50,
      },
      {
        pl: 'Chciałbym wodę, proszę.',
        en: 'I would like water, please.',
        badge: 'smart',
        outcome: 'good',
        result:
          'Also excellent — Chciałbym (conditional "I would like") + proszę. Natural and polite. Both forms are correct. Great Polish instinct! +50 XP.',
        xp: 50,
      },
      {
        pl: 'Daj mi wodę.',
        en: 'Give me water.',
        badge: 'bad',
        outcome: 'bad',
        result:
          '"Daj mi" (Give me) is a command — rude to a stranger or colleague. The assistant looks startled. In Polish culture this is a significant faux pas. +5 XP.',
        xp: 5,
      },
    ],
  },
];
