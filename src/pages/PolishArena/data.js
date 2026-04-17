// ─── SLOT MACHINE DATA — B1 LEVEL ────────────────────────────────────────────
// Subjects include more complex noun phrases and formal registers.
// Verbs cover aspectual pairs, reflexive forms, and B1 modal constructions.
// Objects push students into cases beyond Accusative (Genitive, Dative, Instrumental).

export const SUBJECTS = [
  { pl: 'Ja',             en: 'I' },
  { pl: 'Ty',             en: 'You (sing.)' },
  { pl: 'On',             en: 'He' },
  { pl: 'Ona',            en: 'She' },
  { pl: 'My',             en: 'We' },
  { pl: 'Wy',             en: 'You (pl.)' },
  { pl: 'Oni',            en: 'They (masc.)' },
  { pl: 'Rząd',           en: 'The government' },
  { pl: 'Kierownik',      en: 'The manager' },
  { pl: 'Większość ludzi',en: 'Most people' },
];

export const VERBS = [
  { pl: 'zajmuje się',      en: 'deals with / is in charge of',  past: 'zajmował/a się' },
  { pl: 'zdecydował się',   en: 'decided (perf.)',               past: 'zdecydował/a się' },
  { pl: 'powinien/powinna', en: 'should',                        past: 'powinien był / powinna była' },
  { pl: 'starał się',       en: 'was trying to',                 past: 'starał/a się' },
  { pl: 'zrezygnował z',    en: 'resigned from / gave up',       past: 'zrezygnował/a z' },
  { pl: 'przyzwyczaił się', en: 'got used to',                   past: 'przyzwyczaił/a się' },
  { pl: 'skorzystał z',     en: 'made use of / took advantage of', past: 'skorzystał/a z' },
  { pl: 'obawia się',       en: 'is afraid of / worries about',  past: 'obawiał/a się' },
  { pl: 'narzeka na',       en: 'complains about',               past: 'narzekał/a na' },
  { pl: 'udało mu/jej się', en: 'he/she managed to (impersonal)', past: 'udało mu/jej się' },
];

export const OBJECTS = [
  { pl: 'tej sytuacji',        en: 'this situation (Gen.)' },
  { pl: 'własnych błędów',     en: 'their own mistakes (Gen. pl.)' },
  { pl: 'nowej pracy',         en: 'the new job (Gen.)' },
  { pl: 'trudnościami',        en: 'difficulties (Inst.)' },
  { pl: 'zmianom klimatycznym',en: 'climate change (Dat. pl.)' },
  { pl: 'długoterminowych celów', en: 'long-term goals (Gen. pl.)' },
  { pl: 'tego problemu',       en: 'this problem (Gen.)' },
  { pl: 'codziennym stresem',  en: 'daily stress (Inst.)' },
  { pl: 'swojej kariery',      en: 'their career (Gen.)' },
  { pl: 'lepszymi wynikami',   en: 'better results (Inst.)' },
  { pl: 'odpowiedzialności',   en: 'responsibility (Gen.)' },
  { pl: 'nowymi możliwościami',en: 'new opportunities (Inst.)' },
];


// ─── PHANTOM CARDS DATA — B1 LEVEL ───────────────────────────────────────────
// Targets: aspect (perfective vs. imperfective), conditional mood, indirect speech,
// reflexive verbs, case government after prepositions, and nuanced vocabulary.

export const PHANTOM_DATA = [
  {
    word: 'Udało mi się',
    ctx: 'Describing something you finally managed to achieve',
    opts: [
      'I managed to (impersonal success)',
      'I tried hard',
      'It happened to me',
      'I was lucky (by chance)',
    ],
    correct: 'I managed to (impersonal success)',
    explain:
      'Udało mi się is an impersonal construction: udać się (perf.) + Dative of person. It expresses achieved success without claiming full agency. "Udało mi się zdać egzamin" = I managed to pass the exam. The subject is the event, not you — a very Polish way to express achievement humbly.',
  },
  {
    word: 'Żeby',
    ctx: 'Linking two clauses where the second expresses purpose or desire',
    opts: [
      'Because / since',
      'So that / in order to (+ subjunctive-like)',
      'Although / even though',
      'Whenever / each time',
    ],
    correct: 'So that / in order to (+ subjunctive-like)',
    explain:
      'Żeby introduces a subordinate clause of purpose or desire and forces the verb into the l-form past tense regardless of time: "Chcę, żebyś przyszedł" (I want you to come). Compare with "aby" — synonymous and interchangeable at B1. Never use żeby + present tense after verbs of wanting or requesting.',
  },
  {
    word: 'Mimo że',
    ctx: 'You are making a concession before contradicting it',
    opts: [
      'As long as',
      'Even though / despite the fact that',
      'In case that',
      'As soon as',
    ],
    correct: 'Even though / despite the fact that',
    explain:
      '"Mimo że pracował dużo, nie dostał awansu" = Even though he worked hard, he did not get promoted. Mimo że + indicative verb. Do not confuse with "mimo to" (despite this / nevertheless) which stands alone as a connector, or "pomimo" + Genitive noun phrase (pomimo trudności = despite difficulties).',
  },
  {
    word: 'Przyzwyczaić się do',
    ctx: 'After moving to a new country, you finally feel at home',
    opts: [
      'To accuse someone of',
      'To get used to (+ Genitive)',
      'To prefer something over',
      'To be attracted to',
    ],
    correct: 'To get used to (+ Genitive)',
    explain:
      'Przyzwyczaić się do + Genitive. "Przyzwyczaiłem się do hałasu" = I got used to the noise. The perfective form marks completion (you are now used to it). The imperfective przyzwyczajać się do describes the ongoing process. B1 exams test both the Genitive government and the aspect distinction here.',
  },
  {
    word: 'Gdybym była na twoim miejscu',
    ctx: 'Giving advice to a friend using a hypothetical',
    opts: [
      'When I am in your place',
      'If I were in your position (fem.)',
      'Because I was where you were',
      'I used to be like you',
    ],
    correct: 'If I were in your position (fem.)',
    explain:
      'Gdybym + była (past l-form, feminine) constructs the Polish counterfactual conditional. The speaker is NOT in that position. "Gdybym był na twoim miejscu, zrezygnowałbym" = If I were you, I would resign. This structure appears constantly in advice-giving — a core B1 conversational pattern. Był = masculine, była = feminine.',
  },
  {
    word: 'Zależy mi na',
    ctx: 'Expressing that something matters deeply to you',
    opts: [
      'I depend on (something)',
      'Something matters to me / I care about (+ Loc.)',
      'I am interested in',
      'It depends on me',
    ],
    correct: 'Something matters to me / I care about (+ Loc.)',
    explain:
      '"Zależy mi na rodzinie" = My family matters to me / I care about my family. Construction: zależeć + Dative of person (mi, ci, mu) + na + Locative. Distinct from "zależeć od" (to depend on + Genitive): "To zależy od ciebie" = It depends on you. B1 candidates frequently mix these two.',
  },
  {
    word: 'Skoro',
    ctx: 'Justifying a conclusion based on already known facts',
    opts: [
      'Even if',
      'Since / given that (causal, known fact)',
      'As soon as',
      'So that',
    ],
    correct: 'Since / given that (causal, known fact)',
    explain:
      '"Skoro już wiesz, powiedz mi" = Since you already know, tell me. Skoro implies the cause is established fact known to both speakers — stronger and more logical than "bo" (because). It does not express time. Compare: "Skoro tu jesteś, możemy zacząć" = Since you are here, we can start. Formal written and spoken registers both use it.',
  },
  {
    word: 'Nie dość, że... to jeszcze',
    ctx: 'Complaining that one bad thing is compounded by another',
    opts: [
      'Not enough, but also…',
      'Not only… but on top of that…',
      'Neither… nor…',
      'Instead of… he also…',
    ],
    correct: 'Not only… but on top of that…',
    explain:
      '"Nie dość, że spóźnił się, to jeszcze zapomniał o raporcie" = Not only was he late, but on top of that he forgot the report. This double-frustration structure is very common in spoken Polish at B1/B2. The first clause uses że + indicative; the second clause uses to jeszcze + the additional offence. Examiners love testing it in dialogue comprehension.',
  },
];


// ─── DUEL QUESTIONS — B1 LEVEL ────────────────────────────────────────────────
// Tests: subordinate clauses, aspect selection, formal register, indirect speech,
// case-governed prepositions, and nuanced vocabulary distinction.

export const DUEL_QUESTIONS = [
  {
    pl: 'Zależy mi na tym, żebyś zdał ten egzamin.',
    opts: [
      'I hope you pass this exam.',
      'It matters to me that you pass this exam.',
      'I depend on you to take this exam.',
      'I want you to have passed this exam.',
    ],
    correct: 'It matters to me that you pass this exam.',
  },
  {
    pl: 'Gdybym miał więcej czasu, nauczyłbym się grać na gitarze.',
    opts: [
      'When I have more time, I will learn to play guitar.',
      'I had more time to learn guitar.',
      'If I had more time, I would learn to play guitar.',
      'If I had learned guitar, I would have had more time.',
    ],
    correct: 'If I had more time, I would learn to play guitar.',
  },
  {
    pl: 'Mimo że byłam zmęczona, postanowiłam zostać na spotkaniu.',
    opts: [
      'Because I was tired, I decided to leave the meeting.',
      'Even though I was tired, I decided to stay at the meeting.',
      'I was so tired that I stayed at the meeting.',
      'Although I stayed, I was tired from the meeting.',
    ],
    correct: 'Even though I was tired, I decided to stay at the meeting.',
  },
  {
    pl: 'Udało nam się wynegocjować lepsze warunki umowy.',
    opts: [
      'We tried to negotiate better contract terms.',
      'We were lucky during the contract negotiation.',
      'We managed to negotiate better contract terms.',
      'We needed better terms for our agreement.',
    ],
    correct: 'We managed to negotiate better contract terms.',
  },
  {
    pl: 'Nie przyzwyczaiłem się jeszcze do pracy zdalnej.',
    opts: [
      'I do not like remote work at all.',
      'I have not decided about remote work yet.',
      'I have not got used to remote work yet.',
      'I was not prepared for remote work.',
    ],
    correct: 'I have not got used to remote work yet.',
  },
  {
    pl: 'Skoro wszyscy się zgadzają, możemy podjąć decyzję.',
    opts: [
      'As soon as everyone agrees, we can make a decision.',
      'Even if everyone agrees, we must decide.',
      'Since everyone agrees, we can make a decision.',
      'Everyone agreed, but we cannot decide.',
    ],
    correct: 'Since everyone agrees, we can make a decision.',
  },
  {
    pl: 'Zamiast narzekać, powinieneś zaproponować rozwiązanie.',
    opts: [
      'Apart from complaining, you should also suggest a solution.',
      'Instead of complaining, you should propose a solution.',
      'Because you complained, you should now find a solution.',
      'While complaining, you should look for a solution.',
    ],
    correct: 'Instead of complaining, you should propose a solution.',
  },
  {
    pl: 'Nie dość, że spóźniłeś się, to jeszcze zapomniałeś dokumentów.',
    opts: [
      'You were not late enough, and you forgot the documents too.',
      'You were just a bit late and left the documents.',
      'Not only were you late, but on top of that you forgot the documents.',
      'You forgot the documents and that is why you were late.',
    ],
    correct: 'Not only were you late, but on top of that you forgot the documents.',
  },
];


// ─── STORY DATA — B1 LEVEL ───────────────────────────────────────────────────
// Three-part narrative set in a realistic B1 scenario: renting an apartment in
// Warsaw. Students face formal written communication, negotiation, and describing
// past events using perfective vs. imperfective aspect correctly.

export const STORY_PARTS = [
  {
    ep: 'Ep. 5 — Nowe Mieszkanie',
    title: 'The Rental Negotiation',
    location: 'Warsaw, Agencja Nieruchomości — poniedziałek, 10:00',
    narration:
      'You are Kasia, a junior project manager who has just moved to Warsaw for work. You have found a flat you love — but the agent, Pan Wiśniewski, tells you the rent is 3200 PLN per month, which is above your budget. You want to negotiate. Pan Wiśniewski looks at you over his glasses and waits.',
    prompt:
      'Pan Wiśniewski says: "Czynsz wynosi trzy tysiące dwieście złotych miesięcznie. Czy to dla pani odpowiednia kwota?" (The rent is 3200 PLN per month. Is that a suitable amount for you?)',
    choices: [
      {
        pl: 'Rozumiem, jednak pozwoli pan, że zapytam — czy jest możliwość negocjacji ceny?',
        en: 'I understand, however — if you will permit me — is there any possibility of negotiating the price?',
        badge: 'smart',
        outcome: 'good',
        result:
          'Pan Wiśniewski straightens up, visibly impressed. "Pozwoli pan/pani że zapytam" is a textbook formal Polish hedge — polite, indirect, face-saving. He agrees to discuss a 150 PLN reduction. You have used the conditional of pozwolić correctly and maintained the formal Pan/Pani register throughout. +70 XP — the negotiation continues in your favour.',
        xp: 70,
      },
      {
        pl: 'To trochę za drogo dla mnie. Czy mogłabym płacić trzy tysiące?',
        en: 'That is a little expensive for me. Could I pay three thousand?',
        badge: 'risky',
        outcome: 'neutral',
        result:
          'Grammatically solid — mogłabym (conditional feminine, perfect for B1) and the price stated correctly. However, "trochę za drogo" is slightly informal for a business negotiation context. Wiśniewski listens but offers only 100 PLN off. Your Polish was correct; your register cost you. Lesson: in formal Polish negotiations, soften with "niestety" or "obawiam się, że". +40 XP.',
        xp: 40,
      },
      {
        pl: 'Za drogo! Chcę taniej.',
        en: 'Too expensive! I want cheaper.',
        badge: 'bad',
        outcome: 'bad',
        result:
          'Pan Wiśniewski closes his folder. "Taniej" (cheaper) used this bluntly is considered rude in Polish professional contexts. Polish negotiation culture requires indirect face-saving language. He tells you the price is fixed. You have lost the negotiation entirely. Lesson: Polish adjective "tani" → comparative "tańszy/tańsza" — and even then, wrap it in a conditional. +5 XP.',
        xp: 5,
      },
    ],
  },
  {
    ep: 'Ep. 5 — Part 2',
    title: 'The Formal Email',
    location: 'Warsaw, kawiarnia — wtorek, 18:30',
    narration:
      'The agent has asked you to confirm your intention to rent in writing by end of day. You must write a short formal email. You draft it on your phone. B1 formal Polish letters follow strict conventions: a greeting, body, and closing formula.',
    prompt:
      'Which opening and closing formula is correct for a formal Polish business email to a man you have met once?',
    choices: [
      {
        pl: 'Szanowny Panie Wiśniewski, … Z poważaniem, Katarzyna Nowak',
        en: 'Dear Mr Wiśniewski, … Yours sincerely, Katarzyna Nowak',
        badge: 'smart',
        outcome: 'good',
        result:
          '"Szanowny Panie" + surname (Vocative is handled by "Panie") is the correct B1 formal opening. "Z poważaniem" (With respect) is the standard closing for semi-formal to formal business correspondence in Polish. You have followed the exact formula tested in the DELF-equivalent Polish B1 written exam. Wiśniewski replies promptly. +70 XP.',
        xp: 70,
      },
      {
        pl: 'Dzień dobry, Panie Wiśniewski, … Pozdrawiam, Kasia',
        en: 'Good day, Mr Wiśniewski, … Regards, Kasia',
        badge: 'risky',
        outcome: 'neutral',
        result:
          '"Dzień dobry, Panie [Surname]" is acceptable in modern Polish business email — less stiff than "Szanowny". "Pozdrawiam" is widely used in professional email today. However, signing as "Kasia" (diminutive) is too informal after one meeting; use "Katarzyna Nowak". At B1, examiners will penalise register inconsistency. +35 XP.',
        xp: 35,
      },
      {
        pl: 'Hej Wiśniewski! … Na razie, Kasia :)',
        en: 'Hey Wiśniewski! … Bye for now, Kasia :)',
        badge: 'bad',
        outcome: 'bad',
        result:
          'This is a text-message register in a formal business context. "Hej" and "Na razie" are casual spoken Polish. Addressing someone by surname alone without "Pan/Pani" is considered dismissive or even rude. The emoji confirms this is entirely inappropriate. Pan Wiśniewski does not reply. The flat goes to the next applicant. +5 XP for effort.',
        xp: 5,
      },
    ],
  },
  {
    ep: 'Ep. 5 — Part 3',
    title: 'The Neighbour Complaint',
    location: 'Warsaw, nowe mieszkanie — piątek, 23:00',
    narration:
      'You have moved in. Unfortunately, your upstairs neighbour has been playing loud music every night this week. You decide to knock on their door. A young man opens — he seems friendly but surprised. You want to explain the situation politely but clearly, and ask him to stop.',
    prompt:
      'How do you explain that the music is too loud and ask him to turn it down, politely but directly?',
    choices: [
      {
        pl: 'Przepraszam, że przeszkadzam — muzyka jest trochę głośna i nie mogę spać. Czy mógłby pan ją ściszyć?',
        en: 'Sorry to disturb you — the music is a little loud and I cannot sleep. Could you turn it down?',
        badge: 'smart',
        outcome: 'good',
        result:
          'This is near-perfect B1 spoken Polish. You opened with "Przepraszam, że przeszkadzam" (Sorry to disturb — że + verb in present tense after an apology verb), softened the complaint with "trochę" (a little), stated the consequence, and used the conditional "mógłby pan" (could you — formal, masc.) for the request. The neighbour apologises immediately and turns down the music. +70 XP.',
        xp: 70,
      },
      {
        pl: 'Słuchaj, muzyka jest za głośna. Ścisz to, bo nie mogę spać.',
        en: 'Listen, the music is too loud. Turn it down, because I cannot sleep.',
        badge: 'risky',
        outcome: 'neutral',
        result:
          '"Słuchaj" (Listen) is informal but not offensive between young neighbours. The imperative "Ścisz" (Turn it down) is grammatically correct but blunt — no conditional softening. "Bo" (because) is fine in spoken Polish. He turns it down, but looks slightly annoyed. Lesson: "Czy mógłbyś" instead of the bare imperative shows B1 pragmatic competence. +35 XP.',
        xp: 35,
      },
      {
        pl: 'MUZYKA! ZA GŁOŚNO! CICHO!',
        en: 'MUSIC! TOO LOUD! QUIET!',
        badge: 'bad',
        outcome: 'bad',
        result:
          'Telegraphic shouting — no verbs, no politeness, no case morphology. While each word is individually correct Polish, this is not communication at any certified level. Your neighbour shouts back, your landlord receives a complaint about you, and the relationship with your neighbour deteriorates immediately. +5 XP for knowing the vocabulary at least.',
        xp: 5,
      },
    ],
  },
];
