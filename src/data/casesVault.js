export const CASES_VAULT = [
  {
    id: "mianownik",
    icon: "👤",
    label: "Case 1",
    concept: "Mianownik (The 'Who is it?' Case)",
    lesson: "The default form. No changes! Use it for the subject of the sentence.",
    sections: [
      {
        title: "Think of it like...",
        content: "The name tag on a person. It just tells you who they are.",
        ex: "To jest mój brat. Ta pizza jest duża."
      },
      {
        title: "Plural Forms (More than one)",
        content: "👦 Boys & 👧 Girls usually end in -e, -y, or -i. 📦 Neuter (Nijaki) ends in -a.",
        ex: "Dwa domy, Trzy kobiety, Cztery okna."
      }
    ],
    challenge: {
      q: "Identify the plural subject: 'Moje ______ (okno) są otwarte.'",
      options: ["oknie", "okna", "oknu", "oknem"],
      correct: "okna",
      hint: "For Neuter (Nijaki) nouns like 'okno', the plural ending is always -a."
    }
  },
  {
    id: "dopełniacz",
    icon: "🚫",
    label: "Case 2",
    concept: "Dopełniacz (The 'Empty' Case)",
    lesson: "Use this whenever you say 'NIE' (No), talk about possession, or quantities.",
    sections: [
      {
        title: "How to swap letters",
        content: "👦 Boy adjectives get -ego. 👧 Girl adjectives get -ej. 👧 Girl nouns: -a turns into -y/-i.",
        ex: "Nie mam zimnej wody. Szukam mojego brata."
      },
      {
        title: "Plural Forms",
        content: "📦 Adjectives: -ych / -ich. 👦 Boys: often -ów. 👧 Girls/Neuter: usually the ending is removed.",
        ex: "Nie mam nowych butów. Dużo kobiet."
      }
    ],
    challenge: {
      q: "Negate the plural: 'Nie mam ______ (nowe) samochodów.'",
      options: ["nowe", "nowych", "nowym", "nowymi"],
      correct: "nowych",
      hint: "In Genitive Plural, adjectives for all genders end in -ych or -ich."
    }
  },
  {
    id: "celownik",
    icon: "🎁",
    label: "Case 3",
    concept: "Celownik (The 'Gift' Case)",
    lesson: "The 'To/For' case. Use it when you give, help, or say thanks to someone.",
    sections: [
      {
        title: "How to swap letters",
        content: "👦 Boys: add -owi. 👧 Girls: -a becomes -e. 📦 Adjectives: add -emu.",
        ex: "Daję to bratu. Pomagam koleżance."
      },
      {
        title: "Plural Forms",
        content: "📦 Adjectives: -ym / -im. 👥 Nouns: ALWAYS end in -om regardless of gender.",
        ex: "Dziękuję dobrym ludziom."
      }
    ],
    challenge: {
      q: "Give to a group: 'Daję prezenty ______ (dzieci).'",
      options: ["dzieci", "dzieciach", "dzieciom", "dziećmi"],
      correct: "dzieciom",
      hint: "The 'Gift' case for plural nouns ALWAYS ends in -om, no matter the gender!"
    }
  },
  {
    id: "biernik",
    icon: "🎯",
    label: "Case 4",
    concept: "Biernik (The 'Action' Case)",
    lesson: "Use this for the target of your action (Buying, seeing, eating).",
    sections: [
      {
        title: "Living vs. Inanimate",
        content: "👦 Boys (Living): add -a. 📦 Objects: No change. 👧 Girls: -a turns to -ę (adjective -ą).",
        ex: "Widzę psa (living). Widzę dom (object). Piję kawę."
      },
      {
        title: "Plural Forms",
        content: "👦 People: -ych + -ów. 👧 Girls/Objects: Same as Case 1 plural (-e, -y, -a).",
        ex: "Mam nowe książki. Widzę dobrych kolegów."
      }
    ],
    challenge: {
      q: "Target a feminine noun: 'Mam ______ (nowa) pracę.'",
      options: ["nowa", "nowej", "nową", "nowym"],
      correct: "nową",
      hint: "For feminine singular words in the 'Action' case, adjectives change -a to -ą."
    }
  },
  {
    id: "narzednik",
    icon: "🤝",
    label: "Case 5",
    concept: "Narzędnik (The 'With' Case)",
    lesson: "Use this after 'Z' (With) or when talking about your job.",
    sections: [
      {
        title: "How to swap letters",
        content: "👦 Boys: Add -em. 👧 Girls: Add -ą. 📦 Adjectives: Add -ym/-im.",
        ex: "Z bratem. Z mamą. Jestem uczniem."
      },
      {
        title: "Plural Forms",
        content: "📦 Adjectives: -ymi / -imi. 👥 Nouns: ALWAYS end in -ami regardless of gender.",
        ex: "Idę z nowymi kolegami."
      }
    ],
    challenge: {
      q: "Company check: 'Idę na spacer z ______ (moje) psami.'",
      options: ["moje", "moich", "moimi", "moim"],
      correct: "moimi",
      hint: "When using 'Z' (with) in plural, adjectives end in -ymi or -imi."
    }
  },
  {
    id: "miejscownik",
    icon: "📍",
    label: "Case 6",
    concept: "Miejscownik (The 'Location' Case)",
    lesson: "Only used after: W (in), NA (on), O (about), Przy (at).",
    sections: [
      {
        title: "The tricky swap",
        content: "👦👧 Nouns: Usually -ie or -u. 📦 Adjectives: -ym/-im or -ej.",
        ex: "W domu. Na stole. O mamie."
      },
      {
        title: "Plural Forms",
        content: "📦 Adjectives: -ych / -ich. 👥 Nouns: ALWAYS end in -ach regardless of gender.",
        ex: "W tych dużych miastach."
      }
    ],
    challenge: {
      q: "Location plural: 'Byliśmy w ______ (te) parkach.'",
      options: ["tych", "tym", "te", "tymi"],
      correct: "tych",
      hint: "In the 'Location' case plural, adjectives end in -ych or -ich (just like Case 2 plural)."
    }
  },
  {
    id: "wolacz",
    icon: "📣",
    label: "Case 7",
    concept: "Wołacz (The 'Calling' Case)",
    lesson: "Used for calling names or direct address.",
    sections: [
      {
        title: "How to swap letters",
        content: "👧 Girls: -a changes to -o. 👦 Boys: add -u or -ie.",
        ex: "Mamo! Tato! Marku!"
      },
      {
        title: "Plural Forms",
        content: "IDENTICAL to Mianownik (Case 1) plural.",
        ex: "Drodzy studenci!"
      }
    ],
    challenge: {
      q: "Address your Dad: 'Kochany ______ (tata), słuchaj!'",
      options: ["tata", "tacie", "tato", "tatą"],
      correct: "tato",
      hint: "Even though 'tata' is a man, it ends in -a, so it follows the 'Girl rule' in Wołacz: change -a to -o."
    }
  }
];