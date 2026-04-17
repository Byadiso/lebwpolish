export const GRAMMAR_VAULT = [
  { 
    id: 'Genders', label: 'Basics', icon: '🎭',
    difficulty: 'B1 Foundation',
    concept: "The Gender Trio",
    lesson: "Gender is the 'DNA' of Polish. Every noun, adjective, and past-tense verb must align with this identity to maintain structural integrity.",
    memory: "Think of Polish nouns as having a 'personality type'. The noun's last letter is its ID card — consonant = masculine, -a = feminine, -o/-e/-ę = neuter. The adjective is a chameleon that must match.",
    sections: [
      { title: "Masculine", content: "Ends in a consonant. Adjectives take -y / -i.", ex: "Nowy projekt (New project)" },
      { title: "Feminine", content: "Ends in -a. Adjectives take -a.", ex: "Wielka szansa (Great chance)" },
      { title: "Neuter", content: "Ends in -o, -e, -ę. Adjectives take -e.", ex: "Dobre życie (Good life)" }
    ],
    mistake: { wrong: "Młody dziecko", explanation: "Dziecko ends in -o → it's neuter. The adjective must take the neuter ending -e, not masculine -y." },
    challenge: {
        q: "Select the correct phrase for 'A young child' (Child = Dziecko, Young = Młody)",
        options: ["Młody dziecko", "Młoda dziecko", "Młode dziecko"],
        correct: "Młode dziecko",
        why: "Dziecko ends in -o, making it neuter. Neuter adjectives must use the -e ending: Młode."
    },
    tip: "99% of the time, the last letter of the noun dictates the entire sentence structure."
  },
  { 
    id: 'Aspects', label: 'B1 Core', icon: '⏳',
    difficulty: 'B1 Essential',
    concept: "Aspect: Done vs. Doing",
    lesson: "In B1, verbs come in pairs. 'Imperfective' for habits/processes, and 'Perfective' for a single, completed strike of action.",
    memory: "Imperfective = a film playing on screen (ongoing). Perfective = a photograph of the finished result. Ask yourself: am I describing a movie or a snapshot?",
    sections: [
      { title: "Imperfective (Robić)", content: "Focus on the duration or repetition.", ex: "Robiłem obiad (I was making dinner)" },
      { title: "Perfective (Zrobić)", content: "Focus on the finished result.", ex: "Zrobiłem obiad (Dinner is done)" }
    ],
    mistake: { wrong: "Pisałem raport (when the report is done)", explanation: "Pisałem focuses on the process of writing — it implies the writing was ongoing, not complete. To say it's finished and ready, use the perfective Napisałem." },
    challenge: {
        q: "You finished writing a report and it's ready to send. Which verb do you use?",
        options: ["Pisałem raport", "Napisałem raport"],
        correct: "Napisałem raport",
        why: "Napisałem is perfective — it conveys a completed result. Pisałem (imperfective) only describes the activity in progress, not a finished report."
    },
    tip: "If you can say 'I finished it', you almost always need the Perfective (usually with a prefix like za-, z-, na-)."
  },
  { 
    id: 'Cases_1', label: 'Syntax', icon: '🎯',
    difficulty: 'B1 Essential',
    concept: "Biernik (The Target)",
    lesson: "The Accusative case transforms the 'Object' of your action. It is the most frequent transition in daily Polish.",
    memory: "Think of Accusative as 'the target in your crosshairs.' The action hits the object, and the feminine -a takes the hit, changing to -ę. Adjectives follow suit with -ą.",
    sections: [
      { title: "Feminine Shift", content: "The ending -a strictly evolves into -ę.", ex: "Kawa ➔ Piję kawę" },
      { title: "Masculine Inanimate", content: "Physical objects usually remain unchanged.", ex: "Kupuję komputer" }
    ],
    mistake: { wrong: "Widzę piękna kobieta", explanation: "Both the noun (kobieta → kobietę) and the adjective (piękna → piękną) must shift to accusative. Leaving them in nominative is the #1 learner error." },
    challenge: {
        q: "Translate: 'I see a beautiful woman' (Woman = Kobieta, Beautiful = Piękna)",
        options: ["Widzę piękna kobieta", "Widzę piękną kobietę", "Widzę pięknej kobiecie"],
        correct: "Widzę piękną kobietę",
        why: "Both noun and adjective are accusative targets. Kobieta → kobietę, Piękna → piękną. The -ą adjective ending and -ę noun ending must move together."
    },
    tip: "B1 precision requires matching the adjective (-ą) with the noun (-ę)."
  },
  { 
    id: 'Negation', label: 'Logic', icon: '🚫',
    difficulty: 'B1 Essential',
    concept: "The Genitive Trap",
    lesson: "A simple 'Nie' (Negation) is a powerful force that pulls objects from the Accusative into the Genitive case.",
    memory: "NIE acts like a magnet that pulls the object one case 'further away'. Accusative becomes Genitive. Think: when something disappears (negation), it recedes into Genitive.",
    sections: [
      { title: "Positive", content: "Uses Accusative (Biernik).", ex: "Mam czas" },
      { title: "Negative", content: "Forces Genitive (Dopełniacz).", ex: "Nie mam czasu" }
    ],
    mistake: { wrong: "Nie mam auto", explanation: "After NIE, the accusative object auto must shift to genitive. Auto (neuter) → auta in genitive. Leaving it as auto is accusative — incorrect after negation." },
    challenge: {
        q: "How do you say 'I don't have a car' (Car = Auto)?",
        options: ["Nie mam auto", "Nie mam auta", "Nie mam autu"],
        correct: "Nie mam auta",
        why: "NIE triggers Genitive. Auto is neuter; the genitive of neuter nouns ending in -o replaces it with -a: auta."
    },
    tip: "Whenever you see 'NIE', expect the following noun's ending to change. This is the most tested rule in B1 exams."
  },
  {
    id: 'Genitive', label: 'Possession', icon: '🔑',
    difficulty: 'B1 Foundation',
    concept: "Dopełniacz (The Possessive)",
    lesson: "Genitive is the case of 'of' — it expresses possession, origin, and absence. It also follows critical prepositions: do, bez, dla, z, od, u.",
    memory: "The English word 'of' is almost always Genitive in Polish. 'A cup of coffee' = filiżanka kawy. Ownership = Genitive. Absence = Genitive. Prepositions do/bez/dla = always Genitive.",
    sections: [
      { title: "Possession", content: "Replaces 'apostrophe-s'. Masculine -a, Feminine -y/-i.", ex: "Samochód brata (Brother's car)" },
      { title: "Prepositions", content: "Do (to/of), Bez (without), Dla (for), Z (from).", ex: "Idę do sklepu / Kawa bez cukru" },
      { title: "Quantities", content: "Used after numbers 5+ and words like dużo, mało, trochę.", ex: "Dużo czasu / Pięć minut" }
    ],
    mistake: { wrong: "Idę do sklep", explanation: "Do always requires Genitive. Sklep (masc.) → sklepu in genitive. Never use nominative after do." },
    challenge: {
        q: "How do you say 'I am going to the shop' (Shop = Sklep)?",
        options: ["Idę do sklep", "Idę do sklepu", "Idę do sklepie"],
        correct: "Idę do sklepu",
        why: "Do always triggers Genitive. Masculine nouns like sklep take the -u ending in genitive: sklepu."
    },
    tip: "Memorize the prepositions that trigger Genitive: do, bez, dla, z, od, u, koło, obok, podczas."
  },
  {
    id: 'Dative', label: 'Recipients', icon: '🎁',
    difficulty: 'B1 Advanced',
    concept: "Celownik (The Giver)",
    lesson: "Dative marks the indirect object — the recipient of an action. It is also the case behind the 'podoba mi się' construction, the #1 B1 exam trap.",
    memory: "Celownik = 'Celować' (to aim at someone). You are 'directing' something towards a recipient. In English: 'to/for someone'. The personal pronouns (mi, ci, mu, jej) are its shorthand forms.",
    sections: [
      { title: "Recipient", content: "Marks who receives something. Masc/Neut → -owi, Fem → -ie/-y.", ex: "Dałem książkę bratu (I gave a book to my brother)" },
      { title: "Podoba mi się", content: "Literally 'It pleases to me.' The thing you like is the subject, not you.", ex: "Podoba mi się ten film (I like this film)" },
      { title: "Pronouns", content: "Mnie/Mi (me), Tobie/Ci (you), Jemu/Mu (him), Jej (her).", ex: "To mi nie odpowiada (That doesn't suit me)" }
    ],
    mistake: { wrong: "Lubię ten film (as translation of 'This film appeals to me')", explanation: "While Lubię works for general liking, 'podoba mi się' signals aesthetic appreciation. The film is the grammatical subject — Ci podoba się ta muzyka means 'You like this music' literally as 'This music pleases to you'." },
    challenge: {
        q: "How do you say 'Do you like this song?' using the podoba construction? (Song = Piosenka)",
        options: ["Lubisz tę piosenkę?", "Podoba ci się ta piosenka?", "Podobasz ci tę piosenkę?"],
        correct: "Podoba ci się ta piosenka?",
        why: "Podoba ci się = 'it pleases to you'. The song (ta piosenka) is nominative subject. Ci is dative 'to you'. The verb agrees with piosenka, not with 'you'."
    },
    tip: "'Podoba mi się' is singular. 'Podobają mi się' is plural (for multiple things you like). This agreement is tested heavily."
  },
  { 
    id: 'Conditional', label: 'Hypotheticals', icon: '☁️',
    difficulty: 'B1 Advanced',
    concept: "Tryb Przypuszczający",
    lesson: "The marker '-by' is the 'magic particle' of Polish. It allows you to exit reality and enter the realm of possibility, politeness, and dreams.",
    memory: "The -by particle is like a 'dream mode' switch. Past tense form + by + person ending = 'would do'. Chciałbym = I would want. Gdybym = If I were. Learn these two structures cold.",
    sections: [
      { title: "The Formula", content: "Verb (Past Tense) + Person Marker + 'by'.", ex: "Zrobiłbym (I would do)" },
      { title: "Polite Requests", content: "Softens a command into a suggestion.", ex: "Chciałabym kawę (I would like a coffee)" },
      { title: "If... Then...", content: "Essential for hypothetical logic.", ex: "Gdybym był bogaty... (If I were rich...)" }
    ],
    mistake: { wrong: "Poszedłbym (said by a woman)", explanation: "The conditional encodes gender through the past tense base. A woman uses poszłabym (feminine past poszła + by + m). Using the masculine form poszedłbym is a grammatical gender error." },
    challenge: {
        q: "How would a woman say 'I would go' (to go = pójść)?",
        options: ["Poszedłbym", "Poszłabym", "Poszłybyśmy"],
        correct: "Poszłabym",
        why: "The conditional uses the past tense base. Feminine singular past of pójść is poszła → add by + m for first person: poszłabym. Gender must match the speaker."
    },
    tip: "The '-by' particle usually attaches to the 3rd person past tense form. Precision in gender is mandatory here."
  },
  { 
    id: 'Instrumental', label: 'Identity', icon: '🛠️',
    difficulty: 'B1 Essential',
    concept: "Narzędnik (The Bridge)",
    lesson: "This case defines who you are (profession/nationality) and what you use to navigate the world.",
    memory: "Narzędnik comes from narzędzie (tool). It's the 'by means of' case. I travel by car → Jadę autem. I write by pen → Piszę długopisem. I am [role] → Jestem + Instrumental.",
    sections: [
      { title: "Identity", content: "Use after 'Jestem' for roles.", ex: "Jestem menedżerem" },
      { title: "Tools / Transport", content: "Use for 'by means of'.", ex: "Jadę autem / Piszę długopisem" }
    ],
    mistake: { wrong: "Jestem Polak", explanation: "After Jestem for identity/role, Polish requires Instrumental. Polak → Polakiem. Leaving it in nominative (Polak) is a very common error — it sounds ungrammatical to native speakers." },
    challenge: {
        q: "How do you say 'I am a Pole' (masculine)? (Pole = Polak)",
        options: ["Jestem Polak", "Jestem Polakiem", "Jestem Polaka"],
        correct: "Jestem Polakiem",
        why: "Jestem + profession/nationality always triggers Instrumental. Polak → Polakiem (masculine -em ending)."
    },
    tip: "Whenever you describe a 'permanent role' or 'transport mode', Narzędnik is your go-to tool."
  },
  { 
    id: 'RelativeClauses', label: 'Architecture', icon: '🔗',
    difficulty: 'B1 Advanced',
    concept: "The 'Który' Connector",
    lesson: "B1 sentences aren't short. To build complex thoughts, you must master 'Który'. It acts as a bridge between two ideas.",
    memory: "Który = 'which/who/that' but it's a chameleon. Step 1: match the gender of the noun it replaces. Step 2: match the case its role demands in the second clause. Two-step rule, never skip.",
    sections: [
      { title: "Gender Agreement", content: "Matches the noun it describes.", ex: "Kobieta, która wie... (The woman who knows...)" },
      { title: "Case Shift", content: "The ending changes based on the action in the second clause.", ex: "Dom, w którym mieszkam (The house in which I live)" }
    ],
    mistake: { wrong: "To jest książka, która czytam", explanation: "Która is nominative, but in the second clause czytam needs an accusative object. Book is the thing being read = accusative target. So który must take the feminine accusative form: którą." },
    challenge: {
        q: "Choose the correct connector: 'To jest książka, ____ czytam.' (This is the book that I am reading - Book is Fem. Accusative target)",
        options: ["Która", "Którą", "Którym"],
        correct: "Którą",
        why: "Książka is feminine. In the second clause, it is the object of czytam (I am reading it) → accusative. Feminine accusative of który = którą."
    },
    tip: "Always identify the role of the object in the *second* clause to choose the correct case for 'Który'."
  },
  { 
    id: 'Motion', label: 'B1 Strategy', icon: '✈️',
    difficulty: 'B1 Essential',
    concept: "Motion Dynamics",
    lesson: "Polish distinguishes between movement on foot and movement by vehicle. Swapping these is a common indicator of a beginner.",
    memory: "Polish has a verb for every vehicle. Feet → Iść/Chodzić. Wheels → Jechać/Jeździć. Plane → Lecieć/Latać. Boat → Płynąć/Pływać. Match the method of travel, not just the destination.",
    sections: [
      { title: "Pedestrian", content: "Iść / Chodzić (On foot).", ex: "Idę do kina" },
      { title: "Vehicular", content: "Jechać / Jeździć (By engine/wheels).", ex: "Jadę do Krakowa" }
    ],
    mistake: { wrong: "Jadę do Nowego Jorku (for a flight)", explanation: "Jadę implies ground transport with wheels. A transatlantic journey uses Lecę (to fly). Using jadę for a flight sounds like you're driving across the Atlantic — a native-speaker red flag." },
    challenge: {
        q: "You are taking a flight to New York. Which verb is appropriate?",
        options: ["Idę do Nowego Jorku", "Jadę do Nowego Jorku", "Lecę do Nowego Jorku"],
        correct: "Lecę do Nowego Jorku",
        why: "Lecę (I am flying) is from lecieć — the correct verb for air travel. Jadę = ground/wheeled transport. Idę = on foot. Precision in motion verbs is a key B1 marker."
    },
    tip: "B1 mastery requires choosing the specific mode of transport (Lecę, Jadę, Płynę) rather than a generic 'go'."
  },
  {
    id: 'Numbers', label: 'Counting', icon: '🔢',
    difficulty: 'B1 Advanced',
    concept: "Number Agreement",
    lesson: "Polish numbers are grammatical landmines. The noun's case changes depending on whether the quantity is 1, 2–4, or 5+. This three-way split is one of the most tested B1 rules.",
    memory: "The 1/2-4/5+ rule: 1 = nominative singular. 2-4 = nominative plural. 5+ = genitive plural. Think of it as: small numbers let the noun 'stand up' (nominative), large numbers 'press it down' (genitive).",
    sections: [
      { title: "1 → Nominative Singular", content: "The noun uses its base form.", ex: "Jeden pies (One dog)" },
      { title: "2–4 → Nominative Plural", content: "The noun uses a regular plural.", ex: "Dwa / Trzy / Cztery psy" },
      { title: "5+ → Genitive Plural", content: "The noun shifts to genitive plural — a unique form.", ex: "Pięć psów / Dziesięć minut" }
    ],
    mistake: { wrong: "Pięć psy", explanation: "Psy is nominative plural — only correct for 2–4. After 5+, Polish requires genitive plural. Pies → psy (nom. pl.) → psów (gen. pl.). So: pięć psów." },
    challenge: {
        q: "How do you say 'seven minutes' (Minute = Minuta)?",
        options: ["Siedem minuta", "Siedem minuty", "Siedem minut"],
        correct: "Siedem minut",
        why: "7 falls in the 5+ category, which requires genitive plural. Minuta → minuty (gen. sg.) → minut (gen. pl., with the -a dropped). Siedem minut."
    },
    tip: "Memorize genitive plural forms separately — they're irregular and don't follow nominative plural rules."
  }
];
