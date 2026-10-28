export const VOCAB_VAULT = [
  {
    id: 'Emotions_B1', label: 'Psychology', icon: "[icon:brain]",
    concept: "Advanced Emotions",
    lesson: "B1 speakers move beyond basic states. You don't just feel 'happy' (wesoły); you express degrees of satisfaction, gratitude, and concern to sound more native.",
    sections: [
      { title: "Positive Nuance", content: "Expressing deeper levels of satisfaction.", ex: "Zachwycony (delighted), Wdzięczny (grateful)" },
      { title: "Negative Nuance", content: "Expressing frustration or doubt with precision.", ex: "Rozczarowany (disappointed), Zaniepokojony (concerned)" }
    ],
    challenge: {
        q: "If someone did a great favor for you, how would you describe your state?",
        options: ["Rozczarowany", "Wdzięczny", "Zaniepokojony", "Wściekły"],
        correct: "Wdzięczny"
    },
    tip: "Use 'Wdzięczny' followed by the preposition 'za' + Accusative (e.g., Wdzięczny za pomoc)."
  },
  {
    id: 'Digital_B1', label: 'Modern Life', icon: "[icon:screen]",
    concept: "The Digital World",
    lesson: "To function in a Polish office or remote environment, you must master technical verbs that describe digital interactions beyond just 'kliknąć'.",
    sections: [
      { title: "Actions", content: "Essential verbs for the internet age.", ex: "Udostępniać (to share), Pobierać (to download), Załączyć (to attach)" },
      { title: "Security", content: "Terms for maintaining digital safety.", ex: "Hasło (password), Prywatność (privacy)" }
    ],
    challenge: {
        q: "How do you say 'to share a photo' in a social media context?",
        options: ["Pobierać zdjęcie", "Udostępniać zdjęcie", "Kasować zdjęcie", "Drukować zdjęcie"],
        correct: "Udostępniać zdjęcie"
    },
    tip: "Most digital verbs like 'Udostępniać' are imperfective; use 'Udostępnić' if you are referring to a single, completed post."
  },
  {
    id: 'Debate_B1', label: 'Diplomacy', icon: "[icon:scales]",
    concept: "Conflict & Agreement",
    lesson: "B1 proficiency is defined by your ability to navigate disagreements. You need 'softeners' to express your opinion without being confrontational.",
    sections: [
      { title: "Softening", content: "Phrases used to disagree politely or express a subjective view.", ex: "Wydaje mi się, że... (It seems to me...), Mam wrażenie... (I have the impression...)" },
      { title: "Resolution", content: "Reaching a middle ground in a discussion.", ex: "Dogadać się (to reach an understanding), Przekonać (to convince)" }
    ],
    challenge: {
        q: "Which phrase is the most professional way to start a polite disagreement?",
        options: ["Nie masz racji!", "Wydaje mi się, że...", "To jest głupie", "Nienawidzę tego"],
        correct: "Wydaje mi się, że..."
    },
    tip: "Starting with 'Moim zdaniem' (In my opinion) or 'Wydaje mi się' allows you to disagree while staying respectful in Polish culture."
  },
  {
    id: 'Wellness_B1', label: 'Survival', icon: "[icon:building]",
    concept: "Health & Wellness",
    lesson: "Moving beyond 'I am sick'. At this level, you must describe specific symptoms and preventive measures to doctors or colleagues.",
    sections: [
      { title: "Symptoms", content: "Describing physical ailments with detail.", ex: "Przeziębienie (a cold), Zawroty głowy (dizziness), Skutki uboczne (side effects)" },
      { title: "Prevention", content: "Discussing healthy habits and biology.", ex: "Odżywiać się (to nourish oneself), Odporność (immunity)" }
    ],
    challenge: {
        q: "What is the specific Polish word for 'Immunity'?",
        options: ["Choroba", "Odporność", "Apteka", "Lekarstwo"],
        correct: "Odporność"
    },
    tip: "To say 'I have a cold', use 'Mam przeziębienie' or simply 'Jestem przeziębiony/a'."
  },
  {
    id: 'Ecology_B1', label: 'Social Issues', icon: "[icon:leaf]",
    concept: "Environment & Ecology",
    lesson: "Ecology is a standard B1 exam topic. You need the vocabulary to discuss climate change and your daily 'green' habits.",
    sections: [
      { title: "Sustainability", content: "Terms for environmentally friendly living.", ex: "Oszczędzać energię (save energy), Segregować śmieci (sort trash)" },
      { title: "Threats", content: "Common environmental issues in the media.", ex: "Zanieczyszczenie (pollution), Zmiany klimatu (climate change)" }
    ],
    challenge: {
        q: "How do you say 'to sort the trash'?",
        options: ["Wyrzucać śmieci", "Segregować śmieci", "Kupować śmieci", "Palić śmieci"],
        correct: "Segregować śmieci"
    },
    tip: "In Poland, 'Segregować' specifically refers to the act of dividing glass, plastic, and paper into different bins."
  },
  {
    id: 'Logistics_B1', label: 'Travel', icon: "[icon:plane]",
    concept: "Travel & Logistics",
    lesson: "Travel at B1 isn't just about buying a ticket; it's about managing logistics when things go wrong, like delays or cancellations.",
    sections: [
      { title: "Delays", content: "Vocabulary for transport issues.", ex: "Opóźnienie (delay), Odwołany (cancelled), Przesiąść się (to change trains/planes)" },
      { title: "Booking", content: "Managing accommodation and finance.", ex: "Zaliczka (deposit), Potwierdzenie (confirmation)" }
    ],
    challenge: {
        q: "If the departures board says your flight is 'odwołany', what happened?",
        options: ["It's late", "It's on time", "It's cancelled", "It's overbooked"],
        correct: "It's cancelled"
    },
    tip: "Use 'Przesiąść się' when you have a connecting flight or train (a 'przesiadka')."
  },
  {
    id: 'Finance_B1', label: 'Economy', icon: "[icon:wallet]",
    concept: "Banking & Finance",
    lesson: "Essential for residents. You need to understand the difference between a simple payment and a bank transfer or mortgage.",
    sections: [
      { title: "Operations", content: "Daily banking actions.", ex: "Przelew (transfer), Konto oszczędnościowe (savings account), Pobrać pieniądze (withdraw money)" },
      { title: "Loans", content: "Long-term financial commitments.", ex: "Kredyt hipoteczny (mortgage), Odsetki (interest)" }
    ],
    challenge: {
        q: "You want to send money digitally to a friend. You need to make a:",
        options: ["Kredyt", "Przelew", "Podatek", "Portfel"],
        correct: "Przelew"
    },
    tip: "The word 'Przelew' is also used colloquially to ask if someone has sent your salary yet."
  },
  {
    id: 'Skills_B1', label: 'Career', icon: "[icon:sparkles]",
    concept: "Education & Skills",
    lesson: "B1 students focus on mastery. Use specific verbs to describe how you perfect your skills or master a new language.",
    sections: [
      { title: "Learning", content: "Verbs describing the educational process.", ex: "Opanować (to master), Doskonalić (to perfect), Kurs doszkalający (refresher course)" },
      { title: "Results", content: "Terms for academic and professional achievement.", ex: "Dyplom (degree), Stypendium (scholarship)" }
    ],
    challenge: {
        q: "Which verb specifically means 'to master' a language or a difficult skill?",
        options: ["Zapomnieć", "Opanować", "Zacząć", "Szukać"],
        correct: "Opanować"
    },
    tip: "'Opanować' comes from 'Pan' (Master/Lord) — literally 'to become the master' of a subject."
  },
  {
    id: 'Law_B1', label: 'Politics', icon: "[icon:scales]",
    concept: "Society & Law",
    lesson: "To engage with Polish news or legal requirements, you must understand your rights (prawa) and your duties (obowiązki).",
    sections: [
      { title: "Citizenship", content: "Legal rights and social roles.", ex: "Obowiązek (duty), Prawo (law/right), Obywatel (citizen)" },
      { title: "Social Issues", content: "Economic and social challenges.", ex: "Bezrobocie (unemployment), Ubóstwo (poverty)" }
    ],
    challenge: {
        q: "What is the term for 'Unemployment' in a social context?",
        options: ["Praca", "Bezrobocie", "Zatrudnienie", "Wynagrodzenie"],
        correct: "Bezrobocie"
    },
    tip: "The prefix 'bez-' means 'without'. 'Bezrobocie' is literally the state of being 'without work'."
  },
  {
    id: 'Character_B1', label: 'Identity', icon: "[icon:sparkles]",
    concept: "Description & Character",
    lesson: "Move beyond 'miły' (nice). Describe personality with nuance to tell stories or explain why you trust or dislike someone.",
    sections: [
      { title: "Virtues", content: "Positive traits and character strengths.", ex: "Cierpliwy (patient), Uczciwy (honest), Odważny (brave)" },
      { title: "Flaws", content: "Negative traits or difficult personalities.", ex: "Uparty (stubborn), Skąpy (stingy), Nieśmiały (shy)" }
    ],
    challenge: {
        q: "A person who is 'patient' and doesn't get angry easily is:",
        options: ["Uparty", "Cierpliwy", "Szybki", "Głośny"],
        correct: "Cierpliwy"
    },
    tip: "Adjectives like 'Uczciwy' (honest) are crucial in professional and legal contexts."
  }
];