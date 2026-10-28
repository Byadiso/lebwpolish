export const CASES_VAULT = [
  {
    id: "mianownik",
    icon: "[icon:user]",
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
        content: "Masculine and feminine plural nouns often use -y, -i, or -e. Many neuter nouns use -a. Masculine personal nouns have additional patterns; learn examples with each noun.",
        ex: "Dwa domy, Trzy kobiety, Cztery okna."
      }
    ],
    challenge: {
      q: "Identify the plural subject: 'Moje ______ (okno) są otwarte.'",
      options: ["oknie", "okna", "oknu", "oknem"],
      correct: "okna",
      hint: "For this noun, learn okno → okna. Many neuter nouns follow this pattern, but there are exceptions."
    }
  },
  {
    id: "dopełniacz",
    icon: "[icon:warning]",
    label: "Case 2",
    concept: "Dopełniacz (The 'Empty' Case)",
    lesson: "Use this for possession, many quantities, and the direct object of a negated verb that normally takes the accusative. Not every sentence containing nie uses this case.",
    sections: [
      {
        title: "How to swap letters",
        content: "[icon:user] Boy adjectives get -ego. [icon:user] Girl adjectives get -ej. [icon:user] Girl nouns: -a turns into -y/-i.",
        ex: "Nie mam zimnej wody. Szukam mojego brata."
      },
      {
        title: "Plural Forms",
        content: "[icon:folder] Adjectives: -ych / -ich. [icon:user] Boys: often -ów. [icon:user] Girls/Neuter: usually the ending is removed.",
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
    icon: "[icon:gift]",
    label: "Case 3",
    concept: "Celownik (The 'Gift' Case)",
    lesson: "The 'To/For' case. Use it when you give, help, or say thanks to someone.",
    sections: [
      {
        title: "How to swap letters",
        content: "Masculine nouns often take -owi, but learn common exceptions: brat → bratu, pies → psu. Feminine nouns often take -e or -i, with spelling changes. Masculine/neuter adjectives use -emu.",
        ex: "Daję to bratu. Pomagam koleżance."
      },
      {
        title: "Plural Forms",
        content: "[icon:folder] Adjectives: -ym / -im. [icon:users] Nouns: ALWAYS end in -om regardless of gender.",
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
    icon: "[icon:target]",
    label: "Case 4",
    concept: "Biernik (The 'Action' Case)",
    lesson: "Use this for the target of your action (Buying, seeing, eating).",
    sections: [
      {
        title: "Living vs. Inanimate",
        content: "[icon:user] Boys (Living): add -a. [icon:folder] Objects: No change. [icon:user] Girls: -a turns to -ę (adjective -ą).",
        ex: "Widzę psa (living). Widzę dom (object). Piję kawę."
      },
      {
        title: "Plural Forms",
        content: "Masculine personal plural takes forms like dobrych studentów. Other plural nouns usually share their nominative forms here: widzę nowe domy, kobiety, okna.",
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
    icon: "[icon:users]",
    label: "Case 5",
    concept: "Narzędnik (The 'With' Case)",
    lesson: "Use this after 'Z' (With) or when talking about your job.",
    sections: [
      {
        title: "How to swap letters",
        content: "Masculine and neuter nouns often take -em; feminine nouns take -ą. Adjectives use -ym/-im for masculine/neuter and -ą for feminine. Learn spelling changes through examples.",
        ex: "Z bratem. Z mamą. Jestem uczniem."
      },
      {
        title: "Plural Forms",
        content: "[icon:folder] Adjectives: -ymi / -imi. [icon:users] Most nouns take -ami; learn common exceptions: dzieci → dziećmi, ludzie → ludźmi.",
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
    icon: "[icon:pin]",
    label: "Case 6",
    concept: "Miejscownik (The 'Location' Case)",
    lesson: "Only used after: W (in), NA (on), O (about), Przy (at).",
    sections: [
      {
        title: "The tricky swap",
        content: "Location endings depend on the noun: w domu, w parku, w szkole, na ulicy. Learn the preposition and noun together. Adjectives use -ym/-im or feminine -ej.",
        ex: "W domu. Na stole. O mamie."
      },
      {
        title: "Plural Forms",
        content: "[icon:folder] Adjectives: -ych / -ich. [icon:users] Nouns: ALWAYS end in -ach regardless of gender.",
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
    icon: "[icon:volume]",
    label: "Case 7",
    concept: "Wołacz (The 'Calling' Case)",
    lesson: "Used for calling names or direct address.",
    sections: [
      {
        title: "How to swap letters",
        content: "[icon:user] Many feminine names use -o, but forms vary (Anna → Anno, Maria → Mario). Masculine forms often use -u or -ie; learn names as whole chunks.",
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