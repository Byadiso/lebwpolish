export const GRAMMAR_VAULT = [
  { 
    id: 'Genders', label: 'Basics', icon: '🎭',
    concept: "The Gender Trio",
    lesson: "Gender is the 'DNA' of Polish. Every noun, adjective, and past-tense verb must align with this identity to maintain structural integrity.",
    sections: [
      { title: "Masculine", content: "Ends in a consonant. Adjectives take -y / -i.", ex: "Nowy projekt (New project)" },
      { title: "Feminine", content: "Ends in -a. Adjectives take -a.", ex: "Wielka szansa (Great chance)" },
      { title: "Neuter", content: "Ends in -o, -e, -ę. Adjectives take -e.", ex: "Dobre życie (Good life)" }
    ],
    challenge: {
        q: "Select the correct phrase for 'A young child' (Child = Dziecko, Young = Młody)",
        options: ["Młody dziecko", "Młoda dziecko", "Młode dziecko"],
        correct: "Młode dziecko"
    },
    tip: "99% of the time, the last letter of the noun dictates the entire sentence structure."
  },
  { 
    id: 'Aspects', label: 'B1 Core', icon: '⏳',
    concept: "Aspect: Done vs. Doing",
    lesson: "In B1, verbs come in pairs. 'Imperfective' for habits/processes, and 'Perfective' for a single, completed strike of action.",
    sections: [
      { title: "Imperfective (Robić)", content: "Focus on the duration or repetition.", ex: "Robiłem obiad (I was making dinner)" },
      { title: "Perfective (Zrobić)", content: "Focus on the finished result.", ex: "Zrobiłem obiad (Dinner is done)" }
    ],
    challenge: {
        q: "You finished writing a report and it's ready to send. Which verb do you use?",
        options: ["Pisałem raport", "Napisałem raport"],
        correct: "Napisałem raport"
    },
    tip: "If you can say 'I finished it', you almost always need the Perfective (usually with a prefix like za-, z-, na-)."
  },
  { 
    id: 'Cases_1', label: 'Syntax', icon: '🎯',
    concept: "Biernik (The Target)",
    lesson: "The Accusative case transforms the 'Object' of your action. It is the most frequent transition in daily Polish.",
    sections: [
      { title: "Feminine Shift", content: "The ending -a strictly evolves into -ę.", ex: "Kawa ➔ Piję kawę" },
      { title: "Masculine Inanimate", content: "Physical objects usually remain unchanged.", ex: "Kupuję komputer" }
    ],
    challenge: {
        q: "Translate: 'I see a beautiful woman' (Woman = Kobieta, Beautiful = Piękna)",
        options: ["Widzę piękna kobieta", "Widzę piękną kobietę", "Widzę pięknej kobiecie"],
        correct: "Widzę piękną kobietę"
    },
    tip: "B1 precision requires matching the adjective (-ą) with the noun (-ę)."
  },
  { 
    id: 'Conditional', label: 'Hypotheticals', icon: '☁️',
    concept: "Tryb Przypuszczający",
    lesson: "The marker '-by' is the 'magic particle' of Polish. It allows you to exit reality and enter the realm of possibility, politeness, and dreams.",
    sections: [
      { title: "The Formula", content: "Verb (Past Tense) + Person Marker + 'by'.", ex: "Zrobiłbym (I would do)" },
      { title: "Polite Requests", content: "Softens a command into a suggestion.", ex: "Chciałabym kawę (I would like a coffee)" },
      { title: "If... Then...", content: "Essential for hypothetical logic.", ex: "Gdybym był bogaty... (If I were rich...)" }
    ],
    challenge: {
        q: "How would a woman say 'I would go' (to go = pójść)?",
        options: ["Poszedłbym", "Poszłabym", "Poszłybyśmy"],
        correct: "Poszłabym"
    },
    tip: "The '-by' particle usually attaches to the 3rd person past tense form. Precision in gender is mandatory here."
  },
  { 
    id: 'Instrumental', label: 'Identity', icon: '🛠️',
    concept: "Narzędnik (The Bridge)",
    lesson: "This case defines who you are (profession/nationality) and what you use to navigate the world.",
    sections: [
      { title: "Identity", content: "Use after 'Jestem' for roles.", ex: "Jestem menedżerem" },
      { title: "Tools / Transport", content: "Use for 'by means of'.", ex: "Jadę autem / Piszę długopisem" }
    ],
    challenge: {
        q: "How do you say 'I am a Pole' (masculine)? (Pole = Polak)",
        options: ["Jestem Polak", "Jestem Polakiem", "Jestem Polaka"],
        correct: "Jestem Polakiem"
    },
    tip: "Whenever you describe a 'permanent role' or 'transport mode', Narzędnik is your go-to tool."
  },
  { 
    id: 'RelativeClauses', label: 'Architecture', icon: '🔗',
    concept: "The 'Który' Connector",
    lesson: "B1 sentences aren't short. To build complex thoughts, you must master 'Który'. It acts as a bridge between two ideas.",
    sections: [
      { title: "Gender Agreement", content: "Matches the noun it describes.", ex: "Kobieta, która wie... (The woman who knows...)" },
      { title: "Case Shift", content: "The ending changes based on the action in the second clause.", ex: "Dom, w którym mieszkam (The house in which I live)" }
    ],
    challenge: {
        q: "Choose the correct connector: 'To jest książka, ____ czytam.' (This is the book that I am reading - Book is Fem. Accusative target)",
        options: ["Która", "Którą", "Którym"],
        correct: "Którą"
    },
    tip: "Always identify the role of the object in the *second* clause to choose the correct case for 'Który'."
  },
  { 
    id: 'Motion', label: 'B1 Strategy', icon: '✈️',
    concept: "Motion Dynamics",
    lesson: "Polish distinguishes between movement on foot and movement by vehicle. Swapping these is a common indicator of a beginner.",
    sections: [
      { title: "Pedestrian", content: "Iść / Chodzić (On foot).", ex: "Idę do kina" },
      { title: "Vehicular", content: "Jechać / Jeździć (By engine/wheels).", ex: "Jadę do Krakowa" }
    ],
    challenge: {
        q: "You are taking a flight to New York. Which verb is appropriate?",
        options: ["Idę do Nowego Jorku", "Jadę do Nowego Jorku", "Lecę do Nowego Jorku"],
        correct: "Lecę do Nowego Jorku"
    },
    tip: "B1 mastery requires choosing the specific mode of transport (Lecę, Jadę, Płynę) rather than a generic 'go'."
  },
  { 
    id: 'Negation', label: 'Logic', icon: '🚫',
    concept: "The Genitive Trap",
    lesson: "A simple 'Nie' (Negation) is a powerful force that pulls objects from the Accusative into the Genitive case.",
    sections: [
      { title: "Positive", content: "Uses Accusative (Biernik).", ex: "Mam czas" },
      { title: "Negative", content: "Forces Genitive (Dopełniacz).", ex: "Nie mam czasu" }
    ],
    challenge: {
        q: "How do you say 'I don't have a car' (Car = Auto)?",
        options: ["Nie mam auto", "Nie mam auta", "Nie mam autu"],
        correct: "Nie mam auta"
    },
    tip: "Whenever you see 'NIE', expect the following noun's ending to change. This is the most tested rule in B1 exams."
  }
];