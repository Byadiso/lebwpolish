// ─── SLOT MACHINE DATA — B1 LEVEL (EVERYDAY LIFE) ───────────────────────────
// Theme: real Warsaw life — trams, neighbours, doctors, markets, dates, cafés.
// Grammar: aspect pairs, reflexive verbs, case government, modal constructions.
// VERB notes show case government so learners absorb chunks, not isolated words.

export const SUBJECTS = [
  { pl: 'Ja',                     en: 'I' },
  { pl: 'Mój sąsiad',             en: 'My (male) neighbour' },
  { pl: 'Moja mama',              en: 'My mum' },
  { pl: 'Ten facet z tramwaju',   en: 'That guy from the tram' },
  { pl: 'Moja koleżanka',         en: 'My (female) friend' },
  { pl: 'Kasjerka',               en: 'The cashier (f.)' },
  { pl: 'Lekarz',                 en: 'The doctor' },
  { pl: 'Właścicielka mieszkania',en: 'The landlady' },
  { pl: 'Wszyscy w kolejce',      en: 'Everyone in the queue' },
  { pl: 'Mój pies',               en: 'My dog' },
];

export const VERBS = [
  {
    pl: 'zapomniał/a o',
    en: 'forgot about (perf.)',
    past: 'zapomniał/a o',
    note: '+ Locative: zapomnieć o spotkaniu — forget about an appointment',
  },
  {
    pl: 'przyzwyczaił/a się do',
    en: 'got used to (perf.)',
    past: 'przyzwyczaił/a się do',
    note: '+ Genitive: przyzwyczaić się do hałasu — get used to the noise',
  },
  {
    pl: 'skarży się na',
    en: 'is complaining about (imperf.)',
    past: 'skarżył/a się na',
    note: '+ Accusative: skarżyć się na ból — complain about pain',
  },
  {
    pl: 'boi się',
    en: 'is afraid of (imperf.)',
    past: 'bał/a się',
    note: '+ Genitive: bać się dentysty — be afraid of the dentist',
  },
  {
    pl: 'udało mu/jej się',
    en: 'he/she managed to (impersonal perf.)',
    past: 'udało mu/jej się',
    note: 'udać się + Dative of person + infinitive: udało mi się zarezerwować',
  },
  {
    pl: 'tęskni za',
    en: 'misses / longs for (imperf.)',
    past: 'tęsknił/a za',
    note: '+ Instrumental: tęsknić za domem — miss home',
  },
  {
    pl: 'narzeka na',
    en: 'complains about (imperf.)',
    past: 'narzekał/a na',
    note: '+ Accusative: narzekać na pogodę — complain about the weather',
  },
  {
    pl: 'zdecydował/a się na',
    en: 'decided on / went for (perf.)',
    past: 'zdecydował/a się na',
    note: '+ Accusative: zdecydować się na zupę — decide on the soup',
  },
  {
    pl: 'martwi się o',
    en: 'worries about (imperf.)',
    past: 'martwił/a się o',
    note: '+ Accusative: martwić się o zdrowie — worry about health',
  },
  {
    pl: 'przyznał/a się do',
    en: 'admitted to / confessed (perf.)',
    past: 'przyznał/a się do',
    note: '+ Genitive: przyznać się do błędu — admit to a mistake',
  },
];

export const OBJECTS = [
  { pl: 'wizyty u dentysty',        en: 'the dentist appointment (Gen.)' },
  { pl: 'deszczowej pogody',        en: 'the rainy weather (Gen.)' },
  { pl: 'hałasu za ścianą',         en: 'the noise through the wall (Gen.)' },
  { pl: 'codziennej rutyny',        en: 'the daily routine (Gen.)' },
  { pl: 'za swoim miastem',         en: 'their home town (Inst. after za)' },
  { pl: 'na spóźniony autobus',     en: 'about the late bus (Acc.)' },
  { pl: 'na ból głowy',             en: 'about a headache (Acc.)' },
  { pl: 'na drogie zakupy',         en: 'about expensive shopping (Acc.)' },
  { pl: 'o wyniki badań',           en: 'about the test results (Acc.)' },
  { pl: 'do zgubienia kluczy',      en: 'to losing the keys (Gen.)' },
  { pl: 'na pierogi zamiast sałatki', en: 'for pierogi instead of salad (Acc.)' },
  { pl: 'do swojej winy',           en: 'to being at fault (Gen.)' },
];


// ─── PHANTOM CARDS — B1 LEVEL (EVERYDAY LIFE) ────────────────────────────────
// 12 cards. Each one teaches one grammar rule through a vivid, memorable
// everyday scenario. Explanations are tutor-voice: warm, precise, a bit funny.

export const PHANTOM_DATA = [
  {
    word: 'Bać się + Genitive',
    ctx: 'You have not been to the dentist in two years. You are telling a friend why.',
    opts: [
      'bać się dentysty (Genitive) ✓',
      'bać się dentystę (Accusative)',
      'bać się z dentystą (Instrumental)',
      'bać się do dentysty (Genitive + do)',
    ],
    correct: 'bać się dentysty (Genitive) ✓',
    explain:
      'Bać się always governs Genitive. "Boję się dentysty" — I am afraid of the dentist. The Genitive here expresses the object of fear. This applies across the whole fear family: obawiać się (to worry about), straszyć się (to be scared by). Memory trick: fear takes things away from you — Genitive is the "removal" case. "Boję się egzaminu, pająków, swojego sąsiada o 23:00." All Genitive.',
  },
  {
    word: 'Tęsknić za + Instrumental',
    ctx: 'You moved from Kraków to Warsaw six months ago and something is missing.',
    opts: [
      'tęsknić za Krakowem (Instrumental) ✓',
      'tęsknić do Krakowa (Genitive)',
      'tęsknić Kraków (Accusative)',
      'tęsknić od Krakowa (Genitive)',
    ],
    correct: 'tęsknić za Krakowem (Instrumental) ✓',
    explain:
      '"Tęsknię za Krakowem" — I miss Kraków. The preposition za governs Instrumental when it expresses longing. "Tęsknię za mamą, za domem, za dobrą kawą." This catches people out because za can also mean "behind" (location, also Instrumental) or "in exchange for" (Accusative). Context decides. When it is emotional longing: za + Instrumental, always. A beautiful, melancholy verb worth knowing deeply.',
  },
  {
    word: 'Imperfective for interrupted or background actions',
    ctx: 'You were reading when your phone rang. Which aspect describes your reading?',
    opts: [
      'Przeczytałem — perfective, I finished the book',
      'Czytałem — imperfective, I was in the middle of reading (background action)',
      'Either works; aspect does not matter for past tense',
      'Przeczytałem — because it happened in the past',
    ],
    correct: 'Czytałem — imperfective, I was in the middle of reading (background action)',
    explain:
      '"Czytałem książkę, kiedy zadzwonił telefon." The reading was ongoing — a background action that gets interrupted. Imperfective is the only correct choice here. Compare: "Przeczytałem książkę i poszedłem spać" (I finished the book and went to sleep — sequential completed actions, both perfective). The rule: if two past actions overlap in time (one ongoing, one punctual), the ongoing one is imperfective. This distinction appears in every B1 reading comprehension.',
  },
  {
    word: 'Udało mi się',
    ctx: 'You finally got a seat on the morning tram after three failed attempts this week.',
    opts: [
      'I tried to get a seat (effort, no result)',
      'I was lucky (by random chance, no skill)',
      'I managed to (achieved result — impersonal construction)',
      'I had to get a seat (obligation)',
    ],
    correct: 'I managed to (achieved result — impersonal construction)',
    explain:
      '"Udało mi się zająć miejsce!" The subject of the sentence is actually the event — not you. Mi = Dative (to me). This is Polish modesty grammar: something succeeded to me, rather than I succeeded. It implies effort was needed but hedges the boast. Perfect for: "Udało mi się zdać egzamin / znaleźć mieszkanie / nie spóźnić się." The perfective form (udało) marks the result as achieved. The imperfective (udawało mi się) would suggest a recurring pattern.',
  },
  {
    word: 'Żeby + l-form (purpose with subject change)',
    ctx: 'You ask your neighbour to turn down the music so YOU can sleep.',
    opts: [
      'Proszę, żebyś ściszył muzykę, żebym mogła spać.',
      'Proszę, żebyś ściszył muzykę, żeby mogła spać.',
      'Proszę ściszyć muzykę, żeby spać.',
      'Proszę, żebyś ściszyć muzykę, żebym mogę spać.',
    ],
    correct: 'Proszę, żebyś ściszył muzykę, żebym mogła spać.',
    explain:
      'Two żeby clauses, two subject changes, two l-forms. First: żebyś ściszył — you (ty) turn it down; the ś ending on żeby + ściszył (masc. l-form) marks the subject as "you". Second: żebym mogła — I (ja, feminine) can sleep; the m ending marks "I", mogła is feminine l-form. The rule: when the subject of the żeby clause DIFFERS from the main clause subject, you must use żeby + personal ending + l-form. If the subject is the same, use żeby + infinitive instead.',
  },
  {
    word: 'Gdybym… (present counterfactual)',
    ctx: 'You are broke and eyeing a beautiful coat in a shop window.',
    opts: [
      'Kiedy będę mieć pieniądze, kupię ten płaszcz. (future real)',
      'Gdybym miała pieniądze, kupiłabym ten płaszcz. (counterfactual — I do not have the money)',
      'Gdybym miała pieniądze, kupię ten płaszcz. (mixed — incorrect)',
      'Jeśli miałam pieniądze, kupiłabym. (past real condition)',
    ],
    correct: 'Gdybym miała pieniądze, kupiłabym ten płaszcz. (counterfactual — I do not have the money)',
    explain:
      '"Gdybym miała pieniądze, kupiłabym ten płaszcz." Both halves of the counterfactual must carry the conditional: gdybym + l-form in the if-clause; -łabym (-łbym for masc.) in the main clause. The speaker does NOT have money — this is purely hypothetical. Kiedy + future (kupię) describes something you genuinely expect to happen. Gdyby is a commitment: this is not happening. A sentence Poles use every day in markets, restaurants, and shops. Learn it as one breathing unit.',
  },
  {
    word: 'Mimo że vs. Pomimo + Genitive',
    ctx: 'It is raining. You went for a walk anyway. Two ways to say this.',
    opts: [
      'Mimo że (+ full clause with verb) and Pomimo (+ Genitive noun phrase) mean the same but use different grammar',
      'Mimo że = formal written only; Pomimo = spoken only',
      'Mimo że = surprise; Pomimo = logical expectation',
      'They are completely interchangeable with no grammatical difference',
    ],
    correct: 'Mimo że (+ full clause with verb) and Pomimo (+ Genitive noun phrase) mean the same but use different grammar',
    explain:
      '"Mimo że padało, wyszłam na spacer." (full clause — verb padało) vs. "Pomimo deszczu, wyszłam na spacer." (noun phrase — deszczu is Genitive of deszcz). Same meaning, different structure. At B1 you must know both, because the written exam tests your ability to rephrase. Tip: if you see a noun after the concession marker, it is pomimo + Genitive. If you see a subject and verb, it is mimo że. Both are perfectly correct in formal and informal registers.',
  },
  {
    word: 'Skoro vs. Bo vs. Ponieważ',
    ctx: 'You want to justify leaving a party early — choosing the right connector matters.',
    opts: [
      'All three mean "because" and are freely interchangeable',
      'Bo = casual spoken; Ponieważ = formal/written; Skoro = because + shared known fact',
      'Skoro = spoken only; Bo and Ponieważ are both formal',
      'Bo = purpose; Ponieważ = cause; Skoro = condition',
    ],
    correct: 'Bo = casual spoken; Ponieważ = formal/written; Skoro = because + shared known fact',
    explain:
      '"Wyszłam wcześniej, bo byłam zmęczona." (casual, spoken — bo) / "Wyszłam wcześniej, ponieważ czułam się zmęczona." (written/formal — ponieważ) / "Skoro jesteś zmęczona, idź do domu." (skoro — the tiredness is already known/accepted by both parties). Skoro is the most precise: it signals shared knowledge and is more logical than emotional. On a B1 writing task, ponieważ signals register awareness. Bo at the start of a sentence is a sign marker of informal register and may cost marks in formal writing.',
  },
  {
    word: 'Nie dość, że… to jeszcze…',
    ctx: 'Your tram was late AND it was full AND it skipped your stop.',
    opts: [
      'Not enough that… but still…',
      'Not only… but on top of that… (compounding grievances)',
      'Neither… nor…',
      'Although… still…',
    ],
    correct: 'Not only… but on top of that… (compounding grievances)',
    explain:
      '"Nie dość, że tramwaj się spóźnił, to jeszcze był przepełniony." Not only did it run late — on top of that it was packed. You can even triple-stack: "Nie dość, że się spóźnił, to jeszcze był przepełniony, a do tego ominął mój przystanek!" Poles use this structure to narrate everyday disasters with dramatic flair. Each clause uses indicative past tense. The structure signals to the listener: brace yourself, more bad news is coming. Essential B1 spoken fluency.',
  },
  {
    word: 'Zamiast + Genitive (instead of)',
    ctx: 'You ordered a salad but ate a whole bowl of pierogi instead.',
    opts: [
      'zamiast sałatka (Nominative) — wrong',
      'zamiast sałatkę (Accusative) — wrong',
      'zamiast sałatki (Genitive) ✓',
      'zamiast z sałatką (Instrumental) — wrong',
    ],
    correct: 'zamiast sałatki (Genitive) ✓',
    explain:
      '"Zamiast sałatki zamówiłam pierogi." Zamiast always governs Genitive — no exceptions. It is one of the most reliable Genitive triggers in Polish: zamiast + Genitive noun. "Zamiast kawy wypiłam herbatę." "Zamiast iść na siłownię, oglądałam serial." (When followed by a verb, use the infinitive directly after zamiast — no Genitive on the verb.) Zamówiłam is perfective (I ordered — completed act). A daily-life grammar point that appears in every B1 grammar test.',
  },
  {
    word: 'Przyznać się do + Genitive',
    ctx: 'You ate the last pierogi in the fridge. Your flatmate is asking who did it.',
    opts: [
      'przyznać się do zjedzenia (Genitive of verbal noun) ✓',
      'przyznać się że zjadłam (że + clause — different construction)',
      'przyznać się zjedzenie (Accusative — wrong)',
      'przyznać się z zjedzenia (z + Genitive — wrong preposition)',
    ],
    correct: 'przyznać się do zjedzenia (Genitive of verbal noun) ✓',
    explain:
      '"Przyznałam się do zjedzenia pierogów." Przyznać się do requires Genitive — and if the thing you are admitting is an action, you use the verbal noun in Genitive: zjedzenie → zjedzenia. This is a very productive B1 pattern: do + verbal noun (Genitive) appears after many verbs — dojść do porozumienia (reach an agreement), przyznać się do winy (admit guilt), zdecydować się do… wait, that one is na + Accusative! Knowing which verbs take do + Gen vs. na + Acc is a core B1 skill.',
  },
  {
    word: 'Martwić się o + Accusative',
    ctx: 'Your mum calls every Sunday to say she worries about you.',
    opts: [
      'martwić się o ciebie (Accusative) ✓',
      'martwić się ciebie (bare Accusative — no preposition)',
      'martwić się z tobą (Instrumental)',
      'martwić się na ciebie (Accusative after na — wrong verb)',
    ],
    correct: 'martwić się o ciebie (Accusative) ✓',
    explain:
      '"Mama martwi się o ciebie." Martwić się governs o + Accusative. Contrast with obawiać się + bare Genitive (I fear something) — the two overlap in meaning but differ completely in grammar. Martwić się o = concern for a person or situation you care about; obawiać się + Gen = more formal, often used for feared outcomes. "Martwię się o zdrowie, o pieniądze, o klimat." All Accusative after o. Your mum would like you to call more often. Ta wiadomość jest od mamy.',
  },
];


// ─── DUEL QUESTIONS — B1 LEVEL (EVERYDAY LIFE) ───────────────────────────────
// 12 questions. Mix of: PL→EN translation, aspect choice, connector gap-fill,
// case selection, and register awareness. All in vivid everyday contexts.

export const DUEL_QUESTIONS = [
  // ── Counterfactual conditional
  {
    pl: 'Gdybym wiedziała, że będzie kolejka, wzięłabym książkę.',
    opts: [
      'When I know there will be a queue, I take a book.',
      'If I had known there would be a queue, I would have taken a book.',
      'If I knew there would be a queue, I would take a book.',
      'Because I knew there was a queue, I took a book.',
    ],
    correct: 'If I knew there would be a queue, I would take a book.',
  },
  // ── Aspect: perfective vs imperfective in past narrative
  {
    pl: 'Czytałam książkę, kiedy nagle zgasło światło.',
    opts: [
      'I read a book just as the light went out.',
      'I was reading a book when suddenly the light went out.',
      'I had read a book before the light went out.',
      'I read the whole book until the light went out.',
    ],
    correct: 'I was reading a book when suddenly the light went out.',
  },
  // ── Tęsknić za + Instrumental
  {
    pl: 'Odkąd wyprowadziłem się z domu, bardzo tęsknię za mamą.',
    opts: [
      'Since I moved out, I miss my mum a lot.',
      'Because I moved out, I am afraid of my mum.',
      'Since I moved out, I miss my mum\'s house a lot.',
      'After I move out, I will miss my mum.',
    ],
    correct: 'Since I moved out, I miss my mum a lot.',
  },
  // ── Nie dość że
  {
    pl: 'Nie dość, że zgubiłam klucze, to jeszcze zaczął padać deszcz.',
    opts: [
      'I lost my keys and it was not even raining.',
      'Not only did I lose my keys, but on top of that it started raining.',
      'Because I lost my keys, the rain started.',
      'I lost my keys so I did not get caught in the rain.',
    ],
    correct: 'Not only did I lose my keys, but on top of that it started raining.',
  },
  // ── Aspect choice: habit vs. single event
  {
    pl: 'W soboty zawsze ___ (kupować / kupić) warzywa na targu.',
    opts: [
      'kupić — perfective, because it is a completed act each time',
      'kupować — imperfective, because it is a regular Saturday habit',
      'Either works; habits can use both aspects',
      'kupić — because it refers to specific Saturdays',
    ],
    correct: 'kupować — imperfective, because it is a regular Saturday habit',
  },
  // ── Zamiast + Genitive
  {
    pl: 'Zamiast ___ na siłownię, cały dzień oglądałem serial.',
    opts: [
      'iść (infinitive after zamiast when verb follows) ✓',
      'pójście (verbal noun — Genitive, also possible) ✓',
      'pójść do (wrong preposition added)',
      'na siłownię (Accusative, skipped zamiast rule)',
    ],
    correct: 'iść (infinitive after zamiast when verb follows) ✓',
  },
  // ── Skoro in everyday context
  {
    pl: 'Skoro już tu jesteś, może zostaniesz na kolację?',
    opts: [
      'As soon as you are here, you can stay for dinner.',
      'Even if you are here, you may stay for dinner.',
      'Since you are already here, maybe you will stay for dinner?',
      'Because you were here, you stayed for dinner.',
    ],
    correct: 'Since you are already here, maybe you will stay for dinner?',
  },
  // ── Mimo że vs pomimo
  {
    pl: 'Pomimo zmęczenia, poszła na spacer z psem.',
    opts: [
      'Although she was tired, she went for a walk with the dog.',
      'Because she was tired, she did not walk the dog.',
      'She went for a walk with the dog and she was tired.',
      'She was so tired that she walked the dog.',
    ],
    correct: 'Although she was tired, she went for a walk with the dog.',
  },
  // ── Żeby + l-form with subject change
  {
    pl: 'Poprosiłam koleżankę, żeby zadzwoniła do mnie wieczorem.',
    opts: [
      'I asked my friend to call me in the evening.',
      'My friend asked me to call her in the evening.',
      'I wanted to call my friend in the evening.',
      'I asked my friend if she had called me in the evening.',
    ],
    correct: 'I asked my friend to call me in the evening.',
  },
  // ── Bać się + Genitive
  {
    pl: 'Mój brat boi się wysokości i nigdy nie wchodzi na dach.',
    opts: [
      'My brother is tired of heights and never goes on the roof.',
      'My brother is afraid of heights and never goes on the roof.',
      'My brother avoids heights because he never went on the roof.',
      'My brother is not fond of heights but sometimes goes on the roof.',
    ],
    correct: 'My brother is afraid of heights and never goes on the roof.',
  },
  // ── Udało mi się
  {
    pl: 'Udało jej się zarezerwować ostatni stolik w restauracji.',
    opts: [
      'She tried to reserve the last table at the restaurant.',
      'She was lucky the last table was available.',
      'She managed to reserve the last table at the restaurant.',
      'She had already reserved the last table at the restaurant.',
    ],
    correct: 'She managed to reserve the last table at the restaurant.',
  },
  // ── Connector: bo vs. ponieważ register
  {
    pl: 'Which sentence is more appropriate in a formal written complaint to a landlord?',
    opts: [
      '"Nie zapłaciłam czynszu, bo nie mam pieniędzy."',
      '"Nie uregulowałam czynszu, ponieważ znalazłam się w trudnej sytuacji finansowej."',
      '"Nie płacę, no bo po prostu nie mam kasy."',
      '"Czynsz? Nie zapłacę, skoro mieszkanie jest w złym stanie."',
    ],
    correct: '"Nie uregulowałam czynszu, ponieważ znalazłam się w trudnej sytuacji finansowej."',
  },
];


// ─── STORY DATA — B1 LEVEL (EVERYDAY LIFE) ───────────────────────────────────
// Three interconnected episodes. One bad day in Warsaw: a missed doctor's
// appointment, a supermarket disaster, and making up with a flatmate.
// Every choice teaches a precise B1 grammar or register rule.
// Outcomes are vivid, funny, and real.

export const STORY_PARTS = [
  {
    ep: 'Ep. 7 — Zły dzień w Warszawie',
    title: 'The Doctor\'s Receptionist',
    location: 'Warszawa, przychodnia — wtorek, 8:45',
    narration:
      'You are Zosia. You have a 9:00 doctor\'s appointment — your first in eighteen months because you have been avoiding it (you know why). You arrive at 9:07. The receptionist, Pani Basia, looks up from her screen with the expression of someone who has seen everything and forgiven nothing. "Wizyta była na dziewiątą," she says flatly. (The appointment was for nine o\'clock.) You have seven minutes of her shift left and one shot at this.',
    prompt:
      'Pani Basia taps the clock. "Jest pani spóźniona. Lekarz już przyjmuje następnego pacjenta." (You are late. The doctor is already seeing the next patient.) What do you say?',
    choices: [
      {
        pl: 'Przepraszam za spóźnienie — tramwaj się spóźnił i, mimo że wyszłam z domu wcześniej niż zwykle, nie zdążyłam na czas. Czy jest możliwość, żeby lekarz mnie jednak przyjął?',
        en: 'I am sorry for being late — the tram was delayed and, even though I left home earlier than usual, I did not make it on time. Is there any possibility that the doctor could still see me?',
        badge: 'smart',
        outcome: 'good',
        result:
          'Three grammar wins in one breath. (1) "Mimo że wyszłam wcześniej" — concessive clause, imperfective wyszłam matches the ongoing past frame. (2) "Żeby lekarz mnie przyjął" — żeby + l-form przyjął with a subject change (you want HIM to see you, not yourself). (3) "Czy jest możliwość" — formal indirect question, far more effective than a blunt demand. Pani Basia softens almost imperceptibly. "Proszę poczekać. Sprawdzę." You get seen. +70 XP.',
        xp: 70,
      },
      {
        pl: 'Spóźniłam się trochę, bo tramwaj nie przyjechał na czas. Mogę poczekać, jeśli to możliwe.',
        en: 'I am a little late because the tram did not arrive on time. I can wait, if that is possible.',
        badge: 'risky',
        outcome: 'neutral',
        result:
          'Grammatically clean. "Bo" is honest spoken Polish — it works, though ponieważ would signal more respect. "Jeśli to możliwe" is a polite hedge. But you have not apologised for the doctor\'s disrupted schedule, only explained yourself. In Polish medical culture, acknowledging the inconvenience to others carries real weight. Pani Basia tells you to wait and you are squeezed in thirty minutes later. Grammar note: "jeśli" introduces a real open condition (maybe possible); "gdyby" would imply you doubt it. +40 XP.',
        xp: 40,
      },
      {
        pl: 'Ale to tylko siedem minut! Czemu wszyscy tu są tacy sztywni?',
        en: 'But it\'s only seven minutes! Why is everyone here so uptight?',
        badge: 'bad',
        outcome: 'bad',
        result:
          '"Sztywni" (stiff / uptight) is grammatically correct but a catastrophic register choice when addressing a receptionist whose goodwill you need. Polish receptionists have long memories and control the waiting list. "Czemu" instead of "dlaczego" is informal — fine with friends, wrong here. Pani Basia informs you that the next available appointment is in six weeks. You leave into the rain. +5 XP for using the correct plural adjective form.',
        xp: 5,
      },
    ],
  },
  {
    ep: 'Ep. 7 — Part 2',
    title: 'The Supermarket Situation',
    location: 'Warszawa, Biedronka — wtorek, 13:20',
    narration:
      'Still rattled from the clinic, you stop at Biedronka. You are buying ingredients for tonight\'s dinner — you have promised your flatmate Tomek a proper home-cooked meal to apologise for eating his pierogi last week. You pick up the last jar of barszcz concentrate. Then, simultaneously, so does an older woman, Pani Krystyna. You both hold the jar. She looks at you. You look at her.',
    prompt:
      'Pani Krystyna says: "Wzięłam to pierwsza." (I took this first.) You are not sure that is true. What do you say?',
    choices: [
      {
        pl: 'Przepraszam, może miała pani rację — nie byłam pewna. Czy jest coś, czym mogłabym się zastąpić? Szukam czegoś do bigosu.',
        en: 'I am sorry, perhaps you were right — I was not sure. Is there something I could substitute? I am looking for something for bigos.',
        badge: 'smart',
        outcome: 'good',
        result:
          'Graceful Polish conflict de-escalation. "Może miała pani rację" concedes without fully admitting fault — face-saving for both sides. "Czym mogłabym się zastąpić" — Instrumental after zastąpić (to substitute with), plus the conditional mogłabym (I could — fem.) shows B1 fluency. Pani Krystyna melts. She tells you her recipe for barszcz from scratch, gives you her daughter\'s phone number for some reason, and lets you have the jar because "you look tired, kochanie." +70 XP.',
        xp: 70,
      },
      {
        pl: 'Chyba nie — moja ręka była tu wcześniej. Ale okej, niech pani bierze.',
        en: 'I am not sure about that — my hand was here first. But fine, please take it.',
        badge: 'risky',
        outcome: 'neutral',
        result:
          '"Niech pani bierze" (please take it — imperative with niech + third person) is correct Polish politeness grammar. "Chyba nie" (I\'m not sure / I doubt it) is honest but risks mild confrontation. You give up the jar graciously enough. You end up making żurek instead, which Tomek actually prefers. Grammar note: "niech" + third-person verb is one of the key B1 polite imperative forms — niech pani siada, niech pan mówi. +40 XP.',
        xp: 40,
      },
      {
        pl: 'Nie, JA wzięłam! To MOJE!',
        en: 'No, I took it! It is MINE!',
        badge: 'bad',
        outcome: 'bad',
        result:
          'Grammatically: correct use of emphatic "JA" (stressed pronoun in Polish requires a reason — here it is argument, which is one valid context). Pragmatically: you are having a public shouting match over beetroot concentrate in Biedronka on a Tuesday. Three other shoppers film it. Pani Krystyna starts crying. The security guard asks you to leave. Tomek sees the video on Twitter. You get żaden barszcz. +5 XP for correct emphatic pronoun stress.',
        xp: 5,
      },
    ],
  },
  {
    ep: 'Ep. 7 — Part 3',
    title: 'The Flatmate Conversation',
    location: 'Warszawa, mieszkanie — wtorek, 19:00',
    narration:
      'You are home. Dinner is nearly ready. Tomek comes in, sniffs the air, and looks suspicious. You need to finally address the pierogi incident — you ate his portion last week, he left a passive-aggressive note on the fridge, and you have not properly spoken since. You want to clear the air. He sits down at the kitchen table and waits.',
    prompt:
      'Tomek says: "Więc... chciałeś/chciałaś coś powiedzieć?" (So... did you want to say something?)',
    choices: [
      {
        pl: 'Chciałam przeprosić za te pierogi. Wiem, że to głupie, ale naprawdę mi wstyd. Gdybym wiedziała, że tak bardzo ci zależy, nigdy bym ich nie tknęła. Przyznałam ci się do winy, więc mam nadzieję, że możemy to zamknąć.',
        en: 'I wanted to apologise for the pierogi. I know it\'s silly, but I\'m genuinely embarrassed. If I had known you cared about them so much, I would never have touched them. I have admitted my fault, so I hope we can put this behind us.',
        badge: 'smart',
        outcome: 'good',
        result:
          'A B1 grammar showcase in natural spoken Polish. (1) "Gdybym wiedziała… nigdy bym nie tknęła" — past counterfactual conditional, both halves carrying conditional mood correctly. (2) "Zależy ci" — zależeć + Dative (ci = to you), not Accusative. (3) "Przyznałam się do winy" — przyznać się do + Genitive. (4) "Mam nadzieję, że możemy" — present tense after mieć nadzieję, not subjunctive. Tomek laughs. You eat dinner. The fridge note comes down. +70 XP.',
        xp: 70,
      },
      {
        pl: 'Przepraszam za pierogi. Nie powinnam była ich brać. Zrobiłam dzisiaj kolację, żebyś wiedział, że mi przykro.',
        en: 'I am sorry about the pierogi. I should not have taken them. I made dinner today so you would know that I am sorry.',
        badge: 'risky',
        outcome: 'neutral',
        result:
          'Solid B1 in action. "Nie powinnam była" — past modal (should not have + feminine), a real B1 grammar structure. "Żebyś wiedział" — żeby + ś ending (second person) + wiedział (l-form, masc.) — perfect subordinate purpose clause with subject change. Clean, honest, correct. Tomek appreciates it. Dinner is slightly awkward but fine. Grammar note: "powinnam była" (I should have) is the past modal — powinnam + było/była is frequently tested at B1. +45 XP.',
        xp: 45,
      },
      {
        pl: 'Look, to były tylko pierogi. Przesadzasz.',
        en: 'Look, they were just pierogi. You\'re overreacting.',
        badge: 'bad',
        outcome: 'bad',
        result:
          '"Przesadzasz" (you\'re exaggerating / overreacting) is a perfectly valid B1 verb — przesadzać, imperfective. The problem is not grammar but profound social miscalculation. The pierogi were not the point. Tomek puts his headphones on and eats in his room. You eat alone. The fridge note is replaced by a longer fridge note. Grammar note: "to były tylko pierogi" correctly uses the plural past of być (były) with a plural noun. Small win. Big loss. +5 XP.',
        xp: 5,
      },
    ],
  },
];
