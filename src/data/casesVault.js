export const CASES_VAULT = [
  {
    id: "mianownik",
    icon: "👤",
    label: "Case 1",
    concept: "Mianownik",
    lesson: "The Nominative case is the subject of your sentence. It answers 'Kto? Co?' (Who? What?). This is the default dictionary form.",
    sections: [
      {
        title: "Primary Use",
        content: "Used for the person or thing performing the action.",
        ex: "Student (kto?) czyta książkę."
      }
    ],
    challenge: {
      q: "Identify the subject form: '______ (kobieta) pracuje.'",
      options: ["Kobietę", "Kobieta", "Kobiety", "Kobiecie"],
      correct: "Kobieta"
    }
  },
  {
    id: "dopełniacz",
    icon: "🚫",
    label: "Case 2",
    concept: "Dopełniacz",
    lesson: "The Genitive is the 'B1 Priority'. Use it after 'NIE' (negation), for possession, or after quantities.",
    sections: [
      {
        title: "The Negation Rule",
        content: "If you negate a verb that takes the Accusative, it switches to Genitive.",
        ex: "Mam czas -> Nie mam czasu."
      },
      {
        title: "Feminine Change",
        content: "Ending -a changes to -y or -i.",
        ex: "Nie ma kawy (kawa)."
      }
    ],
    challenge: {
      q: "Negate this: 'Nie mam ______ (pieniądze/pieniądz).'",
      options: ["pieniądz", "pieniądza", "pieniądzem", "pieniądzu"],
      correct: "pieniądza"
    }
  },
  {
    id: "celownik",
    icon: "🎁",
    label: "Case 3",
    concept: "Celownik",
    lesson: "The Dative case means 'to someone'. Used with verbs like 'dać' (give), 'pomagać' (help), or 'dziękować' (thank).",
    sections: [
      {
        title: "Masculine Ending",
        content: "Usually ends in -owi.",
        ex: "Daję prezent bratu (brat)."
      },
      {
        title: "Feminine Ending",
        content: "Usually ends in -e (softening the consonant).",
        ex: "Pomagam mamie (mama)."
      }
    ],
    challenge: {
      q: "Help someone: 'Pomagam ______ (student).'",
      options: ["studenta", "studentem", "studentowi", "studencie"],
      correct: "studentowi"
    }
  },
  {
    id: "biernik",
    icon: "🎯",
    label: "Case 4",
    concept: "Biernik",
    lesson: "The Accusative case is the direct object. Remember the Masculine rule: Animate (living) gets -a, Inanimate (objects) stays the same.",
    sections: [
      {
        title: "Feminine Rule",
        content: "Nouns ending in -a change to -ę.",
        ex: "Mam kawę (kawa)."
      },
      {
        title: "Masculine Inanimate",
        content: "Things like phones or bread do not change.",
        ex: "Kupuję chleb (chleb)."
      }
    ],
    challenge: {
      q: "Fill the direct object: 'Widzę ______ (brat).'",
      options: ["brat", "brata", "bratu", "bratem"],
      correct: "brata"
    }
  },
  {
    id: "narzednik",
    icon: "🤝",
    label: "Case 5",
    concept: "Narzędnik",
    lesson: "The Instrumental case describes 'with whom' (z kim) or 'with what' (z czym). Also used for professions.",
    sections: [
      {
        title: "The 'With' Rule",
        content: "Always use Narzędnik after the preposition 'z'.",
        ex: "Idę z kolegą."
      },
      {
        title: "Identity",
        content: "Feminine ending is always -ą.",
        ex: "Jestem nauczycielką."
      }
    ],
    challenge: {
      q: "Complete the sentence: 'Interesuję się ______ (historia).'",
      options: ["historię", "historii", "historią", "historia"],
      correct: "historią"
    }
  },
  {
    id: "miejscownik",
    icon: "📍",
    label: "Case 6",
    concept: "Miejscownik",
    lesson: "The Locative is used ONLY after prepositions like 'o' (about), 'w' (in), or 'na' (on).",
    sections: [
      {
        title: "Talking About",
        content: "Mówię o... (I'm talking about...)",
        ex: "Mówię o bracie."
      },
      {
        title: "Location",
        content: "Used for being at a location.",
        ex: "Na uniwersytecie."
      }
    ],
    challenge: {
      q: "Location check: 'Mieszkam w ______ (dom).'",
      options: ["dom", "doma", "domu", "domem"],
      correct: "domu"
    }
  },
  {
    id: "wolacz",
    icon: "📣",
    label: "Case 7",
    concept: "Wołacz",
    lesson: "The Vocative is used when calling or addressing someone directly. While informal Polish uses Nominative, Vocative is essential for formal/polite address.",
    sections: [
      {
        title: "Common Use",
        content: "Used for titles and family members.",
        ex: "Panie Profesorze! (Professor!)"
      },
      {
        title: "Feminine Names",
        content: "Names ending in -a often change to -o.",
        ex: "Anno! (Anna!)"
      }
    ],
    challenge: {
      q: "Call your mother: '______! (mama), chodź tutaj!'",
      options: ["Mama", "Mamo", "Mamie", "Mamą"],
      correct: "Mamo"
    }
  }
];