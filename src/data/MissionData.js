export const missions = [
  // --- BLOCK 1: SURVIVAL & SHOPPING ---
  {
    id: "mission_01",
    title: "The Silent Baker",
    context: "The bakery is out of 'Chleb Razowy'. You need to ask for a recommendation and state your allergy.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask for a recommendation",
        correct: "Co pani poleca zamiast tego?",
        hint: "What (Co) + Pani + recommends (poleca) + instead of (zamiast) + that (tego)",
        caseFocus: "Genitive (zamiast)"
      },
      {
        id: "obj_2",
        label: "Explain allergy",
        correct: "Mam alergię na orzechy",
        hint: "I have (Mam) + allergy (alergię) + on (na) + nuts (orzechy)",
        caseFocus: "Accusative"
      }
    ]
  },
  {
    id: "mission_02",
    title: "Market Negotiation",
    context: "You are at a local market. The tomatoes look a bit old. Ask for a lower price.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask for half a kilo",
        correct: "Poproszę pół kilograma pomidorów",
        hint: "Please (Poproszę) + half (pół) + kilo (kilograma) + tomatoes (pomidorów)",
        caseFocus: "Genitive Plural"
      },
      {
        id: "obj_2",
        label: "Ask if they can be cheaper",
        correct: "Czy może być taniej?",
        hint: "Can (Czy może) + be (być) + cheaper (taniej)?",
        caseFocus: "Adverbs / Comparison"
      }
    ]
  },
  {
    id: "mission_03",
    title: "The Grocery Receipt",
    context: "You think the cashier made a mistake on your bill at Biedronka.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say there is a mistake",
        correct: "Chyba jest błąd na paragonie",
        hint: "Perhaps (Chyba) + is (jest) + mistake (błąd) + on the receipt (na paragonie)",
        caseFocus: "Locative"
      },
      {
        id: "obj_2",
        label: "Point out the price difference",
        correct: "Cena na półce była inna",
        hint: "Price (Cena) + on the shelf (na półce) + was (była) + different (inna)",
        caseFocus: "Past Tense"
      }
    ]
  },

  // --- BLOCK 2: HOUSING & LOGISTICS ---
  {
    id: "mission_04",
    title: "The Landlord's Debt",
    context: "The radiator is broken. You need to tell the landlord it is freezing and ask when he will arrive.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State the problem",
        correct: "Kaloryfer jest zepsuty",
        hint: "Radiator (Kaloryfer) + is (jest) + broken (zepsuty)",
        caseFocus: "Nominative"
      },
      {
        id: "obj_2",
        label: "Ask for time",
        correct: "O której godzinie pan będzie?",
        hint: "At what hour (O której godzinie) + Pan + will be (będzie)?",
        caseFocus: "Future Tense"
      }
    ]
  },
  {
    id: "mission_05",
    title: "The Missing Package",
    context: "The InPost courier didn't leave your code. You are calling support.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say you didn't get the SMS",
        correct: "Nie dostałem kodu odbioru",
        hint: "I didn't get (Nie dostałem - m / dostałam - f) + code (kodu) + of pickup (odbioru)",
        caseFocus: "Genitive (Negation)"
      },
      {
        id: "obj_2",
        label: "Ask to send it again",
        correct: "Proszę wysłać go ponownie",
        hint: "Please (Proszę) + to send (wysłać) + it (go) + again (ponownie)",
        caseFocus: "Imperative / Pronouns"
      }
    ]
  },

  // --- BLOCK 3: MEDICAL & EMERGENCY ---
  {
    id: "mission_06",
    title: "The Pharmacy Visit",
    context: "You have a terrible headache and need something strong.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Describe the pain",
        correct: "Strasznie boli mnie głowa",
        hint: "Terribly (Strasznie) + pains (boli) + me (mnie) + head (głowa)",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Ask for advice",
        correct: "Co może pani polecić?",
        hint: "What (Co) + can (może) + pani + recommend (polecić)?",
        caseFocus: "Modal Verbs"
      }
    ]
  },
  {
    id: "mission_07",
    title: "Doctor's Appointment",
    context: "You need to make an appointment for a flu check-up.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask to see the doctor",
        correct: "Chciałbym się umówić do lekarza",
        hint: "I would like (Chciałbym) + reflexive (się) + to appoint (umówić) + to doctor (do lekarza)",
        caseFocus: "Conditional / Genitive"
      },
      {
        id: "obj_2",
        label: "State urgency",
        correct: "To jest pilna sprawa",
        hint: "This (To) + is (jest) + urgent (pilna) + matter (sprawa)",
        caseFocus: "Adjectives"
      }
    ]
  },

  // --- BLOCK 4: WORK & OFFICE ---
  {
    id: "mission_08",
    title: "The Late Employee",
    context: "There was a traffic jam. Explain your lateness to your boss.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Apologize for being late",
        correct: "Przepraszam za spóźnienie",
        hint: "I apologize (Przepraszam) + for (za) + lateness (spóźnienie)",
        caseFocus: "Accusative (za)"
      },
      {
        id: "obj_2",
        label: "Blame the traffic",
        correct: "Były ogromne korki w mieście",
        hint: "There were (Były) + huge (ogromne) + traffic jams (korki) + in the city (w mieście)",
        caseFocus: "Past Tense / Locative"
      }
    ]
  },
  {
    id: "mission_09",
    title: "The Coffee Machine Crisis",
    context: "The coffee machine at work is leaking. Tell the office manager.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Report the leak",
        correct: "Ekspres do kawy przecieka",
        hint: "Machine (Ekspres) + to coffee (do kawy) + leaks (przecieka)",
        caseFocus: "Present Tense"
      },
      {
        id: "obj_2",
        label: "Ask for a repair",
        correct: "Trzeba zawołać serwisanta",
        hint: "One must (Trzeba) + call (zawołać) + service technician (serwisanta)",
        caseFocus: "Accusative"
      }
    ]
  },

  // --- BLOCK 5: TRAVEL & TRANSPORT ---
  {
    id: "mission_10",
    title: "Train Delay",
    context: "Your Intercity train is 40 minutes late. Ask the conductor about your connection.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask about the connection",
        correct: "Czy zdążę na przesiadkę?",
        hint: "Will I make it (Czy zdążę) + on (na) + transfer (przesiadkę)?",
        caseFocus: "Future Tense / Accusative"
      },
      {
        id: "obj_2",
        label: "Ask if the train will wait",
        correct: "Czy pociąg na mnie poczeka?",
        hint: "Will train (Czy pociąg) + on (na) + me (mnie) + wait (poczeka)?",
        caseFocus: "Aspect (Poczekać)"
      }
    ]
  },
  {
    id: "mission_11",
    title: "The Wrong Ticket",
    context: "You bought a student ticket but forgot your ID. Explain to the inspector.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Admit you forgot it",
        correct: "Zapomniałem legitymacji z domu",
        hint: "I forgot (Zapomniałem) + ID (legitymacji) + from home (z domu)",
        caseFocus: "Genitive"
      },
      {
        id: "obj_2",
        label: "Ask to show it later",
        correct: "Czy mogę ją pokazać jutro?",
        hint: "Can I (Czy mogę) + it (ją) + show (pokazać) + tomorrow (jutro)?",
        caseFocus: "Pronouns (Accusative)"
      }
    ]
  },

  // --- BLOCK 6: RESTAURANTS & SOCIAL ---
  {
    id: "mission_12",
    title: "The Reserved Table",
    context: "You booked a table for 8 PM but it's not ready.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State your name and time",
        correct: "Mam rezerwację na ósmą godzinę",
        hint: "I have (Mam) + reservation (rezerwację) + on (na) + eighth hour (ósmą godzinę)",
        caseFocus: "Ordinal Numbers / Accusative"
      },
      {
        id: "obj_2",
        label: "Ask how much longer",
        correct: "Jak długo musimy czekać?",
        hint: "How long (Jak długo) + we must (musimy) + wait (czekać)?",
        caseFocus: "Modal Verbs"
      }
    ]
  },
  {
    id: "mission_13",
    title: "Paying the Bill",
    context: "You want to pay separately at a dinner with friends.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask for the bill",
        correct: "Czy mogę prosić o rachunek?",
        hint: "Can I (Czy mogę) + ask (prosić) + about (o) + bill (rachunek)?",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Request split payment",
        correct: "Chcielibyśmy zapłacić osobno",
        hint: "We would like (Chcielibyśmy) + to pay (zapłacić) + separately (osobno)",
        caseFocus: "Conditional Mood"
      }
    ]
  },

  // --- BLOCK 7: ADVANCED B1 SCENARIOS (Aspect/Complex Cases) ---
  {
    id: "mission_14",
    title: "Returning a Gift",
    context: "You are returning a shirt because it's too small.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State the reason for return",
        correct: "Ta koszula jest za mała",
        hint: "This shirt (Ta koszula) + is (jest) + too (za) + small (mała)",
        caseFocus: "Nominative"
      },
      {
        id: "obj_2",
        label: "Ask for a refund",
        correct: "Czy mogę dostać zwrot pieniędzy?",
        hint: "Can I (Czy mogę) + get (dostać) + return (zwrot) + of money (pieniędzy)?",
        caseFocus: "Genitive Plural"
      }
    ]
  },
  {
    id: "mission_15",
    title: "Asking for Directions",
    context: "You're lost in Kraków. You need to find the main square.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask the way",
        correct: "Jak dojść do Rynku Głównego?",
        hint: "How (Jak) + to get to (dojść) + to (do) + Market (Rynku Głównego)?",
        caseFocus: "Genitive"
      },
      {
        id: "obj_2",
        label: "Ask if it's far on foot",
        correct: "Czy to jest daleko stąd pieszo?",
        hint: "Is it (Czy to jest) + far (daleko) + from here (stąd) + on foot (pieszo)?",
        caseFocus: "Adverbs of Place"
      }
    ]
  },

  // Note: For brevity in this message, I've provided 15 detailed ones. 
  // I can generate 15-20 more in the next block if you'd like, 
  // focusing on even more specific B1 grammar like "Participles" or "Passive Voice".
  // --- BLOCK 8: THE OFFICE & BUREAUCRACY (Urząd) ---
  {
    id: "mission_16",
    title: "The Resident Card",
    context: "You are at the 'Urząd Wojewódzki'. You need to ask if your residence card is ready for pickup.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask if the card is ready",
        correct: "Czy moja karta jest do odbioru?",
        hint: "Is (Czy) + my (moja) + card (karta) + for (do) + pickup (odbioru - Genitive)?",
        caseFocus: "Genitive"
      },
      {
        id: "obj_2",
        label: "Ask about missing documents",
        correct: "Czy brakuje jakichś dokumentów?",
        hint: "Is missing (Czy brakuje) + any (jakichś - Gen. Plural) + documents (dokumentów)?",
        caseFocus: "Genitive Plural (Negation/Lack)"
      }
    ]
  },
  {
    id: "mission_17",
    title: "Registered Mail",
    context: "You received a 'Awizo' (notification). You are at the Post Office to collect it.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say you have an 'Awizo'",
        correct: "Chciałbym odebrać list polecony",
        hint: "I would like (Chciałbym) + to pick up (odebrać) + registered letter (list polecony)",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Show your ID",
        correct: "Oto mój dowód osobisty",
        hint: "Here is (Oto) + my (mój) + ID (dowód osobisty)",
        caseFocus: "Nominative"
      }
    ]
  },

  // --- BLOCK 9: BANKING & FINANCE ---
  {
    id: "mission_18",
    title: "The ATM Error",
    context: "The ATM (Bankomat) ate your card. You are calling the bank's emergency line.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Report the captured card",
        correct: "Bankomat wciągnął moją kartę",
        hint: "ATM (Bankomat) + sucked in (wciągnął) + my (moją) + card (kartę)",
        caseFocus: "Past Tense / Accusative"
      },
      {
        id: "obj_2",
        label: "Ask to block the account",
        correct: "Proszę zablokować moje konto",
        hint: "Please (Proszę) + to block (zablokować) + my (moje) + account (konto)",
        caseFocus: "Imperative / Accusative"
      }
    ]
  },
  {
    id: "mission_19",
    title: "Opening an Account",
    context: "You want to open a savings account with low fees.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask about opening an account",
        correct: "Chcę założyć konto oszczędnościowe",
        hint: "I want (Chcę) + to set up (założyć) + savings account (konto oszczędnościowe)",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Ask about monthly fees",
        correct: "Ile kosztuje prowadzenie konta?",
        hint: "How much (Ile) + costs (kosztuje) + maintaining (prowadzenie) + of account (konta)?",
        caseFocus: "Genitive"
      }
    ]
  },

  // --- BLOCK 10: AUTOMOTIVE & DRIVING ---
  {
    id: "mission_20",
    title: "The Flat Tire",
    context: "You are at a car workshop (Warsztat). You have a nail in your tire.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Explain the tire issue",
        correct: "Mam gwóźdź w oponie",
        hint: "I have (Mam) + nail (gwóźdź) + in (w) + tire (oponie - Locative)",
        caseFocus: "Locative"
      },
      {
        id: "obj_2",
        label: "Ask for repair time",
        correct: "Kiedy auto będzie gotowe?",
        hint: "When (Kiedy) + car (auto) + will be (będzie) + ready (gotowe)?",
        caseFocus: "Future Tense"
      }
    ]
  },
  {
    id: "mission_21",
    title: "The Gas Station",
    context: "The pump isn't working. Tell the staff.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say the pump is broken",
        correct: "Dystrybutor numer pięć nie działa",
        hint: "Pump (Dystrybutor) + number five + doesn't work (nie działa)",
        caseFocus: "Nominative"
      },
      {
        id: "obj_2",
        label: "Ask for a different pump",
        correct: "Czy mogę skorzystać z innego?",
        hint: "Can I (Czy mogę) + use (skorzystać) + from (z) + another (innego)?",
        caseFocus: "Genitive (skorzystać z)"
      }
    ]
  },

  // --- BLOCK 11: EDUCATION & LANGUAGE ---
  {
    id: "mission_22",
    title: "The Language School",
    context: "You want to sign up for a B1 preparation course.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask about the course level",
        correct: "Szukam kursu na poziomie B jeden",
        hint: "I search (Szukam) + course (kursu) + on level (na poziomie) + B1",
        caseFocus: "Genitive (szukać) / Locative"
      },
      {
        id: "obj_2",
        label: "Ask about the price per hour",
        correct: "Jaka jest cena za godzinę?",
        hint: "What (Jaka) + is (jest) + price (cena) + for (za) + hour (godzinę)?",
        caseFocus: "Accusative"
      }
    ]
  },
  {
    id: "mission_23",
    title: "Clarification",
    context: "Your teacher said something too fast. Ask for a repetition politely.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask to repeat",
        correct: "Czy może pani to powtórzyć?",
        hint: "Can (Czy może) + pani + it (to) + repeat (powtórzyć)?",
        caseFocus: "Modal Verbs / Aspect"
      },
      {
        id: "obj_2",
        label: "Ask to write it down",
        correct: "Proszę to zapisać na tablicy",
        hint: "Please (Proszę) + it (to) + write down (zapisać) + on board (na tablicy)",
        caseFocus: "Locative"
      }
    ]
  },

  // --- BLOCK 12: BEAUTY & HYGIENE ---
  {
    id: "mission_24",
    title: "At the Barber",
    context: "You want a simple haircut—shorter on the sides.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Request shorter sides",
        correct: "Poproszę krócej po bokach",
        hint: "Please (Poproszę) + shorter (krócej) + on sides (po bokach)",
        caseFocus: "Adverbs / Locative"
      },
      {
        id: "obj_2",
        label: "Ask to keep the top long",
        correct: "Góra ma zostać długa",
        hint: "Top (Góra) + has (ma) + to stay (zostać) + long (długa)",
        caseFocus: "Adjectives"
      }
    ]
  },

  // --- BLOCK 13: FAMILY & EVENTS ---
  {
    id: "mission_25",
    title: "The Wedding Invitation",
    context: "A friend invited you to a wedding. You need to confirm your attendance.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Confirm you are coming",
        correct: "Potwierdzam moje przybycie",
        hint: "I confirm (Potwierdzam) + my (moje) + arrival (przybycie)",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Mention a plus one",
        correct: "Będę z osobą towarzyszącą",
        hint: "I will be (Będę) + with (z) + person accompanying (osobą towarzyszącą)",
        caseFocus: "Instrumental (z)"
      }
    ]
  },

  // --- BLOCK 14: TECHNOLOGY ---
  {
    id: "mission_26",
    title: "The Cracked Screen",
    context: "You dropped your phone. You need to ask about the repair cost.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State the screen is broken",
        correct: "Szybka w telefonie jest pęknięta",
        hint: "Glass (Szybka) + in phone (w telefonie) + is (jest) + cracked (pęknięta)",
        caseFocus: "Locative / Adjectives"
      },
      {
        id: "obj_2",
        label: "Ask for repair price",
        correct: "Ile kosztuje wymiana ekranu?",
        hint: "How much + costs + replacement (wymiana) + of screen (ekranu)?",
        caseFocus: "Genitive"
      }
    ]
  },

  // --- BLOCK 15: WEATHER & LEISURE ---
  {
    id: "mission_27",
    title: "The Mountain Hike",
    context: "You are asking a local in Zakopane about the weather on the trail.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask if the trail is safe",
        correct: "Czy szlak jest teraz bezpieczny?",
        hint: "Is (Czy) + trail (szlak) + now + safe (bezpieczny)?",
        caseFocus: "Nominative"
      },
      {
        id: "obj_2",
        label: "Ask if it will rain",
        correct: "Czy będzie dzisiaj padać?",
        hint: "Will (Czy będzie) + today + to rain (padać)?",
        caseFocus: "Future Tense"
      }
    ]
  },
  {
    id: "mission_28",
    title: "The Gym Membership",
    context: "You want to cancel your membership because you are moving.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say you are moving",
        correct: "Przeprowadzam się do innego miasta",
        hint: "I am moving (Przeprowadzam się) + to (do) + another city (innego miasta)",
        caseFocus: "Genitive"
      },
      {
        id: "obj_2",
        label: "Ask to cancel the contract",
        correct: "Chcę rozwiązać umowę",
        hint: "I want (Chcę) + to dissolve/cancel (rozwiązać) + contract (umowę)",
        caseFocus: "Accusative"
      }
    ]
  },
  {
    id: "mission_29",
    title: "The Library",
    context: "You want to return books that are a few days overdue.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Apologize for being late",
        correct: "Przepraszam za kilka dni zwłoki",
        hint: "Sorry (Przepraszam) + for (za) + few days (kilka dni) + of delay (zwłoki)",
        caseFocus: "Genitive"
      },
      {
        id: "obj_2",
        label: "Ask about the fine",
        correct: "Ile wynosi kara?",
        hint: "How much (Ile) + amounts to (wynosi) + fine (kara)?",
        caseFocus: "Nominative"
      }
    ]
  },
  {
    id: "mission_30",
    title: "The Neighbor's Party",
    context: "Your neighbor is playing music very loud at 1 AM. Ask him to be quiet.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask to lower the volume",
        correct: "Czy może pan ciszej puszczać muzykę?",
        hint: "Can you (Czy może pan) + quieter (ciszej) + play (puszczać) + music (muzykę)?",
        caseFocus: "Accusative / Adverbs"
      },
      {
        id: "obj_2",
        label: "Remind about 'night silence'",
        correct: "Jest już cisza nocna",
        hint: "Is + already + night silence (cisza nocna)",
        caseFocus: "Nominative"
      }
    ]
  },
  // --- BLOCK 16: THE JOB INTERVIEW (Praca) ---
  {
    id: "mission_31",
    title: "The Interview Intro",
    context: "You are introducing yourself at a job interview. State your experience.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say you have 3 years of experience",
        correct: "Mam trzy lata doświadczenia",
        hint: "I have (Mam) + three (trzy) + years (lata) + of experience (doświadczenia)",
        caseFocus: "Genitive (after numbers)"
      },
      {
        id: "obj_2",
        label: "Say you are looking for challenges",
        correct: "Szukam nowych wyzwań zawodowych",
        hint: "I search (Szukam) + new (nowych) + challenges (wyzwań) + professional (zawodowych)",
        caseFocus: "Genitive Plural (szukać)"
      }
    ]
  },
  {
    id: "mission_32",
    title: "Salary Negotiation",
    context: "The recruiter asks about your expectations. Answer professionally.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State your expected monthly net salary",
        correct: "Chciałbym zarabiać pięć tysięcy na rękę",
        hint: "I would like (Chciałbym) + to earn (zarabiać) + 5000 + on hand (na rękę)",
        caseFocus: "Conditional / Idioms"
      },
      {
        id: "obj_2",
        label: "Ask about the type of contract",
        correct: "Jaki to rodzaj umowy?",
        hint: "What (Jaki) + this + kind (rodzaj) + of contract (umowy)?",
        caseFocus: "Genitive"
      }
    ]
  },

  // --- BLOCK 17: SOCIAL DINNER & ETIQUETTE ---
  {
    id: "mission_33",
    title: "The Dinner Guest",
    context: "You are at a Polish friend's house. You want to offer help with the dishes.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Offer help",
        correct: "Czy mogę w czymś pomóc?",
        hint: "Can I (Czy mogę) + in (w) + something (czymś - Locative) + help (pomóc)?",
        caseFocus: "Locative"
      },
      {
        id: "obj_2",
        label: "Compliment the food",
        correct: "To jedzenie jest pyszne",
        hint: "This (To) + food (jedzenie) + is + delicious (pyszne)",
        caseFocus: "Adjectives"
      }
    ]
  },
  {
    id: "mission_34",
    title: "Declining Vodka",
    context: "A classic Polish situation. You are driving and must decline alcohol.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say you are driving",
        correct: "Dziękuję, jestem dzisiaj autem",
        hint: "Thank you + I am + today + by car (autem - Instrumental)",
        caseFocus: "Instrumental (Method of transport)"
      },
      {
        id: "obj_2",
        label: "Ask for water instead",
        correct: "Poproszę tylko wodę niegazowaną",
        hint: "Please (Poproszę) + only + water (wodę) + still (niegazowaną)",
        caseFocus: "Accusative"
      }
    ]
  },

  // --- BLOCK 18: AT THE AIRPORT ---
  {
    id: "mission_35",
    title: "Baggage Claim",
    context: "Your suitcase is missing at Chopin Airport. Report it.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say your luggage is gone",
        correct: "Moja walizka zginęła",
        hint: "My (Moja) + suitcase (walizka) + disappeared/got lost (zginęła)",
        caseFocus: "Past Tense (Perfective)"
      },
      {
        id: "obj_2",
        label: "Describe the color",
        correct: "Była duża i czarna",
        hint: "It was (Była) + big (duża) + and (i) + black (czarna)",
        caseFocus: "Past Tense / Gender Agreement"
      }
    ]
  },
  {
    id: "mission_36",
    title: "The Gate Change",
    context: "You are confused about the gate number. Ask an employee.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask where the gate is",
        correct: "Gdzie jest bramka numer siedem?",
        hint: "Where + is + gate (bramka) + number seven?",
        caseFocus: "Nominative"
      },
      {
        id: "obj_2",
        label: "Ask if boarding has started",
        correct: "Czy boarding już się zaczął?",
        hint: "Is + boarding + already + reflexive (się) + started (zaczął)?",
        caseFocus: "Past Tense / Reflexive"
      }
    ]
  },

  // --- BLOCK 19: CONFLICT & COMPLAINTS ---
  {
    id: "mission_37",
    title: "The Noisy Neighbor (Advanced)",
    context: "The neighbor's dog is barking all day while they are out.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say the dog is barking",
        correct: "Państwa pies szczeka cały dzień",
        hint: "Your (Państwa - formal plural) + dog (pies) + barks (szczeka) + whole day",
        caseFocus: "Accusative (Duration)"
      },
      {
        id: "obj_2",
        label: "Ask them to do something",
        correct: "Proszę coś z tym zrobić",
        hint: "Please (Proszę) + something (coś) + with (z) + that (tym - Instrumental) + to do (zrobić)",
        caseFocus: "Instrumental"
      }
    ]
  },
  {
    id: "mission_38",
    title: "The Bad Service",
    context: "The soup you ordered is cold. Tell the waiter.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Complain about temperature",
        correct: "Ta zupa jest zupełnie zimna",
        hint: "This (Ta) + soup (zupa) + is + completely (zupełnie) + cold (zimna)",
        caseFocus: "Adjectives"
      },
      {
        id: "obj_2",
        label: "Ask to heat it up",
        correct: "Czy może ją pan podgrzać?",
        hint: "Can (Czy może) + it (ją) + pan + heat up (podgrzać)?",
        caseFocus: "Object Pronouns"
      }
    ]
  },

  // --- BLOCK 20: EMERGENCIES ---
  {
    id: "mission_39",
    title: "The Stolen Wallet",
    context: "You are at the police station reporting a theft.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say someone stole your wallet",
        correct: "Ktoś ukradł mi portfel",
        hint: "Someone (Ktoś) + stole (ukradł) + me (mi - Dative) + wallet (portfel)",
        caseFocus: "Dative (Possession/Interest)"
      },
      {
        id: "obj_2",
        label: "Say there were documents inside",
        correct: "W środku były dokumenty",
        hint: "In (W) + middle/inside (środku - Locative) + were + documents",
        caseFocus: "Locative"
      }
    ]
  },
  {
    id: "mission_40",
    title: "Calling an Ambulance",
    context: "Someone fainted on the street. Call 112.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say a person is unconscious",
        correct: "Ta osoba jest nieprzytomna",
        hint: "This + person + is + unconscious (nieprzytomna)",
        caseFocus: "Adjectives"
      },
      {
        id: "obj_2",
        label: "Give your location",
        correct: "Jestem na ulicy Długiej",
        hint: "I am + on (na) + street (ulicy - Locative) + Długa (Długiej)",
        caseFocus: "Locative"
      }
    ]
  },

  // --- BLOCK 21: FUTURE PLANS & OPINIONS ---
  {
    id: "mission_41",
    title: "Moving House",
    context: "Tell a friend why you are moving to a new apartment.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say it's closer to the center",
        correct: "Jest bliżej do centrum",
        hint: "It's + closer (bliżej) + to (do) + center (centrum - Genitive)",
        caseFocus: "Adverbs / Genitive"
      },
      {
        id: "obj_2",
        label: "Say you have more space",
        correct: "Mam więcej miejsca",
        hint: "I have + more (więcej) + space (miejsca - Genitive)",
        caseFocus: "Genitive (after quantity)"
      }
    ]
  },
  {
    id: "mission_42",
    title: "Expressing Opinion",
    context: "A friend asks if you liked the movie. You didn't.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say the film was boring",
        correct: "Film był bardzo nudny",
        hint: "Film + was + very + boring (nudny)",
        caseFocus: "Past Tense"
      },
      {
        id: "obj_2",
        label: "Say you didn't like the ending",
        correct: "Nie podobało mi się zakończenie",
        hint: "Not + pleased (podobało) + me (mi) + reflexive (się) + ending (zakończenie)",
        caseFocus: "Dative / Negation"
      }
    ]
  },

  // --- BLOCK 22: SHOPPING & TECH ---
  {
    id: "mission_43",
    title: "Mobile Plan",
    context: "You want to change your pre-paid to a monthly subscription.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask for an offer",
        correct: "Chcę podpisać nową umowę",
        hint: "I want (Chcę) + to sign (podpisać) + new (nową) + contract (umowę)",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Ask about internet GB",
        correct: "Ile gigabajtów jest w pakiecie?",
        hint: "How many (Ile) + gigabytes (gigabajtów - Gen. Plural) + is + in package (w pakiecie)?",
        caseFocus: "Genitive Plural / Locative"
      }
    ]
  },

  // --- BLOCK 23: WORK MEETING ---
  {
    id: "mission_44",
    title: "The Project Deadline",
    context: "Tell your team the project will be finished on Friday.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State the completion day",
        correct: "Skończymy projekt w piątek",
        hint: "We will finish (Skończymy) + project + in (w) + Friday (piątek)",
        caseFocus: "Future Tense (Perfective) / Accusative"
      },
      {
        id: "obj_2",
        label: "Ask for feedback",
        correct: "Czekam na wasze opinie",
        hint: "I wait (Czekam) + on (na) + your (wasze) + opinions (opinie)",
        caseFocus: "Accusative (na)"
      }
    ]
  },

  // --- BLOCK 24: REPAIRS ---
  {
    id: "mission_45",
    title: "Broken Laptop",
    context: "The computer won't turn on. Take it to a technician.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say it won't start",
        correct: "Laptop nie chce się włączyć",
        hint: "Laptop + not + wants + reflexive (się) + to turn on (włączyć)",
        caseFocus: "Reflexive Verbs"
      },
      {
        id: "obj_2",
        label: "Ask for an estimate",
        correct: "Jaki jest koszt naprawy?",
        hint: "What + is + cost (koszt) + of repair (naprawy - Genitive)?",
        caseFocus: "Genitive"
      }
    ]
  },

  // --- BLOCK 25: CLOTHES & STYLE ---
  {
    id: "mission_46",
    title: "Fitting Room",
    context: "The shoes are too tight. Ask for a larger size.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say they are too tight",
        correct: "Te buty są za ciasne",
        hint: "These + shoes (buty) + are + too (za) + tight (ciasne)",
        caseFocus: "Nominative Plural"
      },
      {
        id: "obj_2",
        label: "Ask for size 42",
        correct: "Czy ma pani rozmiar czterdzieści dwa?",
        hint: "Does + pani + have + size (rozmiar) + 42?",
        caseFocus: "Accusative"
      }
    ]
  },

  // --- BLOCK 26: PETS ---
  {
    id: "mission_47",
    title: "At the Vet",
    context: "Your cat hasn't eaten for two days.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Explain the lack of appetite",
        correct: "Mój kot nie je od dwóch dni",
        hint: "My + cat + not + eats + since (od) + two (dwóch - Genitive) + days",
        caseFocus: "Genitive (after 'od')"
      },
      {
        id: "obj_2",
        label: "Ask if it's dangerous",
        correct: "Czy to jest groźne?",
        hint: "Is + this + dangerous (groźne)?",
        caseFocus: "Adjectives"
      }
    ]
  },

  // --- BLOCK 27: HOBBIES ---
  {
    id: "mission_48",
    title: "Booking a Court",
    context: "You want to book a tennis court for Saturday afternoon.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Request the court",
        correct: "Chciałbym zarezerwować kort",
        hint: "I would like + to reserve (zarezerwować) + court",
        caseFocus: "Conditional / Accusative"
      },
      {
        id: "obj_2",
        label: "Specify the time",
        correct: "W sobotę po południu",
        hint: "In (W) + Saturday (sobotę) + after (po) + afternoon (południu - Locative)",
        caseFocus: "Locative"
      }
    ]
  },

  // --- BLOCK 28: EMOTIONS ---
  {
    id: "mission_49",
    title: "Feeling Sick",
    context: "Explain to your teacher you can't come to class.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Say you feel unwell",
        correct: "Źle się dzisiaj czuję",
        hint: "Badly + reflexive (się) + today + I feel (czuję)",
        caseFocus: "Adverbs / Reflexive"
      },
      {
        id: "obj_2",
        label: "Say you have a fever",
        correct: "Mam wysoką gorączkę",
        hint: "I have + high (wysoką) + fever (gorączkę)",
        caseFocus: "Accusative"
      }
    ]
  },

  // --- BLOCK 29: GRADUATION ---
  {
    id: "mission_50",
    title: "Mission Complete",
    context: "You are picking up your B1 Polish Certificate at the office.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State why you are here",
        correct: "Przyszedłem odebrać certyfikat",
        hint: "I came (Przyszedłem - m / Przyszłam - f) + to pick up + certificate",
        caseFocus: "Past Tense / Accusative"
      },
      {
        id: "obj_2",
        label: "Thank the staff",
        correct: "Dziękuję bardzo za pomoc",
        hint: "Thank you + very + for (za) + help (pomoc)",
        caseFocus: "Accusative"
      }
    ]
  }
];