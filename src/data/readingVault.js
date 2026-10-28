/**
 * READING_VAULT — Polish Reading Comprehension Dataset
 *
 * difficulty: 1 = A2/B1 entry, 2 = B1 solid, 3 = B1/B2 challenge
 * readTime:   estimated minutes for a learner
 * hook:       one-line reason why this topic is fascinating — shown before article loads
 * culturalNote: deeper insight beyond grammar — makes Poland feel real
 */

export const READING_VAULT = [

  // ── 1. EKOLOGIA ──────────────────────────────────────────────────────────
  {
    id: "r1",
    category: "Ekologia",
    difficulty: 1,
    readTime: 3,
    title: "Zielona Rewolucja w Mieście",
    icon: "🌱",
    hook: "Poland has some of the most polluted cities in Europe — and it's fighting back harder than you'd think.",
    grammarNote: "Notice 'na rzecz' (in favor of / for the benefit of) — a B1 phrase used when describing a trade-off or shift in priorities. Pattern: rezygnować z X na rzecz Y.",
    culturalNote: "Smog in Polish cities like Kraków is so severe that 'smog alerts' cancel outdoor PE lessons. The coal heating culture is deeply rooted — changing it is social, not just political.",
    text: `Coraz więcej mieszkańców polskich aglomeracji, takich jak Wrocław czy Gdańsk, rezygnuje z samochodu na rzecz roweru lub hulajnogi elektrycznej. Władze miejskie inwestują w nowoczesne ścieżki rowerowe oraz flotę autobusów elektrycznych, aby zachęcić do zmiany nawyków.

Celem nie jest wyłącznie zmniejszenie korków, ale przede wszystkim poprawa jakości powietrza. Smog pozostaje jednym z największych wyzwań współczesnej Polski — w sezonie grzewczym stężenie pyłów PM2.5 w niektórych miastach przekracza normy Światowej Organizacji Zdrowia nawet dziesięciokrotnie.

Rząd oferuje dopłaty do wymiany starych pieców węglowych na ekologiczne systemy ogrzewania. Program „Czyste Powietrze" pochłonął już miliardy złotych, jednak eksperci ostrzegają, że tempo zmian jest wciąż zbyt wolne wobec skali problemu.`,
    glossary: {
      "aglomeracji":   "urban agglomerations / metro areas",
      "hulajnogi":     "scooters",
      "flotę":         "fleet",
      "nawyków":       "habits",
      "stężenie":      "concentration (of particles)",
      "pyłów":         "dust / particulate matter",
      "normy":         "standards / norms",
      "dopłaty":       "subsidies",
      "wymiany":       "replacement / exchange",
      "pochłonął":     "consumed / absorbed (money/resources)",
      "wciąż":         "still",
      "wobec":         "in relation to / given"
    },
    questions: [
      {
        id: "r1_q1",
        q: "Głównym powodem promowania rowerów jest wyłącznie chęć uniknięcia korków.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text says the goal is 'not only' reducing traffic but 'above all' improving air quality."
      },
      {
        id: "r1_q2",
        q: "Program 'Czyste Powietrze' jest finansowany przez władze miejskie, a nie przez rząd.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Rząd' means the national government, not city authorities ('władze miejskie')."
      },
      {
        id: "r1_q3",
        q: "Eksperci są w pełni zadowoleni z dotychczasowego tempa zmian.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "Experts warn the pace of change is 'still too slow given the scale of the problem'."
      }
    ]
  },

  // ── 2. TECHNOLOGIA ───────────────────────────────────────────────────────
  {
    id: "r2",
    category: "Technologia",
    difficulty: 2,
    readTime: 3,
    title: "Cyfrowy Nomadyzm",
    icon: "💻",
    hook: "Poland's IT sector is one of the fastest-growing in Europe — Warsaw is nicknamed 'the Silicon Valley of Central Europe'.",
    grammarNote: "'Tzw.' stands for 'tak zwane' (so-called). In formal and journalistic Polish, abbreviations like 'ww.' (wyżej wymienione = aforementioned) and 'itp.' (i tym podobne = etc.) are essential to recognize.",
    culturalNote: "Remote work exploded in Poland after 2020, but the cultural norm of 'presence = productivity' is still strong in older companies. Young Poles in tech often have salaries rivalling Western Europe while living in much cheaper cities.",
    text: `Praca zdalna stała się w Polsce standardem w sektorze IT, zatrudniającym już ponad pół miliona specjalistów. Choć oszczędność czasu na dojazdach jest ogromną zaletą, psycholodzy ostrzegają przed stopniowym zacieraniem granicy między życiem prywatnym a zawodowym.

Wiele firm wprowadza tzw. „prawo do odłączenia się" — regulację, która pozwala pracownikom ignorować służbowe maile i wiadomości po godzinach pracy bez ponoszenia konsekwencji. Rozwiązanie to, znane wcześniej we Francji i Niemczech, powoli wchodzi do polskiego prawa pracy.

Nie wszyscy jednak przyjmują zmiany entuzjastycznie. Część menedżerów starej daty uważa, że pracownik widoczny w biurze jest pracownikiem bardziej zaangażowanym. Młodsze pokolenia odpowiadają, że efektywność mierzy się wynikami, a nie przesiadywaniem przy biurku.`,
    glossary: {
      "zatrudniającym":    "employing",
      "dojazdach":         "commuting",
      "zaletą":            "advantage / benefit",
      "zacieraniem":       "blurring / erasing",
      "odłączenia":        "disconnection",
      "konsekwencji":      "consequences",
      "regulację":         "regulation",
      "entuzjastycznie":   "enthusiastically",
      "zaangażowanym":     "engaged / committed",
      "efektywność":       "efficiency / effectiveness",
      "przesiadywaniem":   "sitting around / loitering"
    },
    questions: [
      {
        id: "r2_q1",
        q: "Wszystkie branże w Polsce pracują obecnie wyłącznie zdalnie.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text specifies the IT sector — it doesn't claim all industries work remotely."
      },
      {
        id: "r2_q2",
        q: "Prawo do odłączenia się jest oryginalnym polskim pomysłem prawnym.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text explicitly says this was known earlier in France and Germany."
      },
      {
        id: "r2_q3",
        q: "Wszyscy menedżerowie popierają ideę pracy zdalnej.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "Some managers ('starej daty' = old-school) believe office presence equals greater commitment."
      }
    ]
  },

  // ── 3. KULTURA ───────────────────────────────────────────────────────────
  {
    id: "r3",
    category: "Kultura",
    difficulty: 1,
    readTime: 3,
    title: "Nowoczesna Kuchnia Polska",
    icon: "🥟",
    hook: "Polish pierogi are now on Michelin-starred menus in Paris. How did peasant food become European fine dining?",
    grammarNote: "'Rezygnować z' always takes the Genitive case. Pattern: rezygnować z + [noun in Genitive]. This is one of the most common verbs requiring Genitive at B1 level.",
    culturalNote: "The 'bigos' (hunter's stew) debate — with or without tomatoes? — is the Polish equivalent of arguing about carbonara. Food identity runs deep here, and the new fusion scene is genuinely controversial among older generations.",
    text: `Polska kuchnia przechodzi cichą rewolucję. Młodzi kucharze, inspirowani podróżami i kursami za granicą, łączą tradycyjne receptury z nowoczesnymi technikami gotowania, tworząc oryginalną kuchnię „fusion". Pierogi z nadzieniem z krewetek czy bigos z dodatkiem czerwonego wina nie są już rarytasem wyłącznie w Warszawie.

Dużą popularnością cieszą się targi śniadaniowe i bazary produktów lokalnych, gdzie rolnicy sprzedają warzywa, sery i wędliny bezpośrednio mieszkańcom, omijając pośredników. Polacy coraz częściej rezygnują z supermarketów na rzecz świadomych zakupów i wspierania lokalnej gospodarki.

Jednak nie wszyscy akceptują zmiany. Starsze pokolenie uważa, że tradycyjna kuchnia polska powinna pozostać niezmieniona, bo jest częścią tożsamości narodowej. Dyskusja ta wykracza poza talerz i dotyka głębszych pytań o to, czym jest polskość w XXI wieku.`,
    glossary: {
      "receptury":       "recipes",
      "nadzieniem":      "filling / stuffing",
      "krewetek":        "shrimps",
      "rarytasem":       "delicacy / rarity",
      "targi":           "markets / fairs",
      "bazary":          "bazaars / open-air markets",
      "wędliny":         "cured meats / cold cuts",
      "pośredników":     "middlemen / intermediaries",
      "tożsamości":      "identity",
      "wykracza":        "goes beyond / exceeds",
      "polskość":        "Polishness (national identity)"
    },
    questions: [
      {
        id: "r3_q1",
        q: "Kuchnia fusion z polskimi tradycjami jest popularna wyłącznie w Warszawie.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text says Warsaw is no longer the ONLY place — implying it has spread."
      },
      {
        id: "r3_q2",
        q: "Starsze pokolenie nie akceptuje zmian w kuchni polskiej.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "The text explicitly states the older generation believes traditional Polish cuisine should remain unchanged."
      },
      {
        id: "r3_q3",
        q: "Autor tekstu uważa, że kuchnia fusion jest lepsza niż tradycyjna.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Nie ma w tekście",
        explanation: "The text presents both sides without the author expressing a personal opinion."
      }
    ]
  },

  // ── 4. ZDROWIE ───────────────────────────────────────────────────────────
  {
    id: "r4",
    category: "Zdrowie",
    difficulty: 2,
    readTime: 3,
    title: "Aktywność to Konieczność",
    icon: "🏃",
    hook: "The number of Poles running marathons has tripled in 10 years. What's behind the fitness boom?",
    grammarNote: "'Świadomie' (consciously) is derived from 'świadomość' (awareness/consciousness). This suffix pattern -ość creates abstract nouns from adjectives: wolny → wolność, pewny → pewność.",
    culturalNote: "The Warsaw Marathon is now one of the largest in Europe. Running has replaced football as the aspirational sport of the Polish middle class — it signals discipline, success, and health-consciousness.",
    text: `Siedzący tryb życia stał się w Polsce problemem społecznym. Lekarze alarmują: przeciętny Polak spędza przed ekranem ponad dziewięć godzin dziennie, co ma bezpośredni wpływ na układ sercowo-naczyniowy i zdrowie psychiczne.

Odpowiedzią na ten kryzys jest dynamiczny wzrost popularności sportu amatorskiego. Liczba uczestników biegów ulicznych potroiła się w ciągu dekady, a siłownie i studia jogi odnotowują rekordy frekwencji. Lekarze podkreślają jednak, że nie trzeba biegać maratonów — nawet trzydzieści minut szybkiego marszu dziennie obniża ryzyko chorób serca o ponad dwadzieścia procent.

Równolegle rośnie świadomość żywieniowa. Polacy coraz częściej świadomie ograniczają spożycie przetworzonej żywności, cukru i czerwonego mięsa. Dieta śródziemnomorska zyskuje na popularności, wypierając tradycyjne, tłuste potrawy. Eksperci ostrzegają jednak przed skrajnościami — ortoreksja, czyli obsesja na punkcie zdrowego jedzenia, staje się nowym problemem klinicznym.`,
    glossary: {
      "przeciętny":          "average",
      "układ sercowo-naczyniowy": "cardiovascular system",
      "wzrost":              "growth / increase",
      "potroiła się":        "tripled",
      "frekwencji":          "attendance",
      "marszu":              "walk / march",
      "świadomość żywieniowa": "nutritional awareness",
      "przetworzonej":       "processed",
      "wypierając":          "displacing / replacing",
      "skrajnościami":       "extremes",
      "ortoreksja":          "orthorexia (obsession with healthy eating)"
    },
    questions: [
      {
        id: "r4_q1",
        q: "Według lekarzy, tylko intensywny sport może chronić serce.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "Doctors say even 30 minutes of brisk walking daily lowers heart disease risk by over 20%."
      },
      {
        id: "r4_q2",
        q: "Ortoreksja jest w tekście przedstawiana jako pozytywny efekt dbania o zdrowie.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text calls orthorexia a 'new clinical problem' — clearly negative."
      },
      {
        id: "r4_q3",
        q: "Liczba uczestników biegów ulicznych w Polsce wzrosła trzykrotnie w ciągu dziesięciu lat.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "'Potroiła się w ciągu dekady' = tripled in a decade. This is directly stated."
      }
    ]
  },

  // ── 5. HISTORIA ──────────────────────────────────────────────────────────
  {
    id: "r5",
    category: "Historia",
    difficulty: 2,
    readTime: 4,
    title: "Solidarność — Ruch, Który Zmienił Świat",
    icon: "✊",
    hook: "A shipyard electrician started a movement that ended communist rule across an entire continent. This is that story.",
    grammarNote: "The text uses many nouns in Genitive plural — 'strajków' (of strikes), 'robotników' (of workers), 'lat' (of years). Genitive plural is one of the hardest forms: it often has no ending or an irregular one.",
    culturalNote: "Poles are intensely proud of Solidarność (Solidarity). It's not just history — it's a lived identity. Understanding it explains modern Polish politics, the distrust of central authority, and the deep sense of national resilience.",
    text: `W sierpniu 1980 roku w Gdańsku wybuchł strajk, który zmienił oblicze Europy. Robotnicy Stoczni Gdańskiej, pod przywództwem elektryka Lecha Wałęsy, zażądali prawa do zakładania niezależnych związków zawodowych. W ciągu kilku tygodni ruch „Solidarność" skupił ponad dziesięć milionów członków — stając się największym niezależnym związkiem zawodowym w historii bloku wschodniego.

Władze komunistyczne odpowiedziały wprowadzeniem stanu wojennego w grudniu 1981 roku. Tysiące działaczy trafiło do więzień, a organizacja zeszła do podziemia. Jednak idei nie można było aresztować.

Po latach negocjacji, w 1989 roku, przy Okrągłym Stole, komuniści zgodzili się na częściowo wolne wybory. Solidarność wygrała miażdżąco. Ten historyczny przełom zapoczątkował dominoefekt, który doprowadził do upadku murów — nie tylko berlińskiego — i rozwiązania Związku Radzieckiego dwa lata później.`,
    glossary: {
      "wybuchł":            "broke out / erupted",
      "oblicze":            "face / character",
      "stoczni":            "shipyard",
      "przywództwem":       "leadership",
      "zażądali":           "demanded",
      "związków zawodowych": "trade unions",
      "stanu wojennego":    "martial law",
      "działaczy":          "activists",
      "podziemia":          "underground (movement)",
      "miażdżąco":          "crushingly / overwhelmingly",
      "przełom":            "breakthrough / turning point",
      "zapoczątkował":      "initiated / started"
    },
    questions: [
      {
        id: "r5_q1",
        q: "Strajk w Gdańsku wybuchł z powodu złych warunków finansowych pracowników stoczni.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Nie ma w tekście",
        explanation: "The text says workers demanded the right to form independent trade unions — financial conditions aren't mentioned."
      },
      {
        id: "r5_q2",
        q: "Stan wojenny był odpowiedzią władz komunistycznych na działalność Solidarności.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "Directly stated: 'Władze komunistyczne odpowiedziały wprowadzeniem stanu wojennego'."
      },
      {
        id: "r5_q3",
        q: "W wyborach 1989 roku komuniści i Solidarność uzyskali podobną liczbę głosów.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Miażdżąco' means crushingly/overwhelmingly — Solidarity won by a landslide."
      }
    ]
  },

  // ── 6. PSYCHOLOGIA ───────────────────────────────────────────────────────
  {
    id: "r6",
    category: "Psychologia",
    difficulty: 2,
    readTime: 4,
    title: "Pokolenie Z i Kryzys Sensu",
    icon: "🧠",
    hook: "Polish Gen Z are the most anxious generation in Polish history — and they know exactly why.",
    grammarNote: "'Mimo że' (even though / despite the fact that) introduces a concessive clause — it's used to present a contradiction. Don't confuse it with 'chociaż' — both work here, but 'mimo że' is more formal.",
    culturalNote: "Polish youth face a paradox: their generation has the highest standard of living in Polish history, yet mental health problems are surging. The collapse of traditional community structures — church, family, neighborhood — has left a vacuum that social media can't fill.",
    text: `Polskie nastolatki i młodzi dorośli są pokoleniem paradoksów. Mimo że mają dostęp do większej liczby możliwości niż jakiekolwiek poprzednie pokolenie, badania CBOS wskazują, że poziom lęku i depresji wśród osób poniżej trzydziestego roku życia osiągnął rekordowe wartości.

Psycholodzy wskazują kilka przyczyn. Po pierwsze, media społecznościowe kreują nierealistyczne wzorce sukcesu i wyglądu, prowadząc do chronicznego porównywania się z innymi. Po drugie, niepewność rynku pracy — mimo niskiego bezrobocia — sprawia, że stałe zatrudnienie i własne mieszkanie stają się dla wielu nieosiągalnym marzeniem.

Jednak eksperci dostrzegają też sygnały nadziei. Pokolenie Z częściej niż poprzednicy szuka pomocy psychologicznej i rozmawia otwarcie o zdrowiu psychicznym. Terapia powoli traci stygmat w Polsce, a liczba praktykujących psychologów wzrasta każdego roku. Być może najważniejszą zmianą jest to, że młodzi Polacy po raz pierwszy głośno mówią: „nie jest ze mną dobrze i to jest w porządku, żeby szukać pomocy".`,
    glossary: {
      "paradoksów":      "paradoxes",
      "jakiekolwiek":    "any (whatsoever)",
      "poprzednie":      "previous",
      "lęku":            "anxiety / fear",
      "nierealistyczne": "unrealistic",
      "wzorce":          "patterns / models",
      "chronicznego":    "chronic",
      "bezrobocia":      "unemployment",
      "nieosiągalnym":   "unattainable",
      "stygmat":         "stigma",
      "praktykujących":  "practicing"
    },
    questions: [
      {
        id: "r6_q1",
        q: "Poziom lęku wśród młodych Polaków nigdy wcześniej nie był tak wysoki.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "'Osiągnął rekordowe wartości' = reached record levels. Directly confirmed."
      },
      {
        id: "r6_q2",
        q: "W Polsce bezrobocie wśród młodych jest główną przyczyną kryzysu psychicznego.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text mentions 'despite low unemployment' — so unemployment isn't the main cause. Social media and housing unaffordability are mentioned."
      },
      {
        id: "r6_q3",
        q: "Terapia psychologiczna jest w Polsce powszechnie akceptowana bez żadnego piętna społecznego.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text says therapy is 'slowly' losing its stigma — implying the stigma still exists but is decreasing."
      }
    ]
  },

  // ── 7. BIZNES ────────────────────────────────────────────────────────────
  {
    id: "r7",
    category: "Biznes",
    difficulty: 3,
    readTime: 4,
    title: "Startup Nation nad Wisłą",
    icon: "🚀",
    hook: "Polish startups have raised over $4 billion in the last 5 years. Who are the founders rewriting the rules?",
    grammarNote: "The text uses the conditional 'gdyby' (if/were it not for). 'Gdyby nie wsparcie funduszy...' = 'Were it not for fund support...'. This is B2-level syntax but worth recognizing at B1.",
    culturalNote: "Poland's tech boom is partly fueled by a massive diaspora returning from London and Berlin with capital and contacts. The 'returning Pole' phenomenon is reshaping Warsaw's startup scene.",
    text: `Warszawa, Kraków i Wrocław wchodzą na mapę globalnego ekosystemu startupowego. Polskie firmy takie jak Booksy, DocPlanner czy Brainly zdobyły setki milionów dolarów finansowania i rozszerzyły działalność na dziesiątki krajów, udowadniając, że innowacja nie jest wyłączną domeną Doliny Krzemowej.

Za sukcesem stoi kilka czynników. Polska dysponuje jedną z najlepiej wykształconych siły roboczej informatycznej w Europie, przy jednoczesnych kosztach pracy niższych niż na Zachodzie. Gdyby nie wsparcie funduszy unijnych w ramach programów takich jak PARP czy NCBiR, wiele przełomowych projektów nigdy nie ujrzałoby światła dziennego.

Wyzwaniem pozostaje jednak skalowalność. Polskie startupy z trudem wychodzą poza rynek środkowoeuropejski, napotykając bariery językowe i kulturowe. Eksperci wskazują, że brakuje odważnych inwestorów gotowych podjąć ryzyko na miarę Sequoia czy Andreessen Horowitz. Pytanie nie brzmi już, czy Polska może produkować technologicznych gigantów, lecz kiedy.`,
    glossary: {
      "ekosystemu":        "ecosystem",
      "finansowania":      "financing / funding",
      "rozszerzyły":       "expanded",
      "udowadniając":      "proving",
      "domeną":            "domain / realm",
      "siły roboczej":     "workforce",
      "informatycznej":    "IT / computing",
      "ujrzałoby":         "would have seen",
      "skalowalność":      "scalability",
      "napotykając":       "encountering",
      "bariery":           "barriers",
      "gigantów":          "giants"
    },
    questions: [
      {
        id: "r7_q1",
        q: "Polskie startupy rozwinęły się wyłącznie dzięki funduszom unijnym.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "EU funds are one factor, but the text also mentions skilled workforce and lower labor costs."
      },
      {
        id: "r7_q2",
        q: "Polskie firmy technologiczne nadal mają trudności z ekspansją poza Europę Środkową.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "'Z trudem wychodzą poza rynek środkowoeuropejski' = they struggle to move beyond Central European markets."
      },
      {
        id: "r7_q3",
        q: "Autor sugeruje, że Polska nigdy nie stworzy globalnych gigantów technologicznych.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The final sentence shifts the question from 'whether' to 'when' — implying it's a matter of time, not possibility."
      }
    ]
  },

  // ── 8. LITERATURA ────────────────────────────────────────────────────────
  {
    id: "r8",
    category: "Literatura",
    difficulty: 2,
    readTime: 3,
    title: "Olga Tokarczuk — Głos Polski na Świecie",
    icon: "📚",
    hook: "She won the Nobel Prize by writing about Polish guilt, memory, and the violence of history. Poland had complex feelings about it.",
    grammarNote: "Note 'której' — the Genitive/Dative feminine form of the relative pronoun 'który' (who/which). 'Pisarka, której twórczość...' = 'The writer whose work...' Relative clauses with 'którego/której/któremu' are essential for B1 reading.",
    culturalNote: "Tokarczuk's Nobel acceptance speech, in which she called Poles 'perpetrators' of historical violence (not only victims), caused a national debate. She received death threats. Understanding this tension is essential to understanding modern Polish identity.",
    text: `W 2019 roku Olga Tokarczuk odebrała Nagrodę Nobla w dziedzinie literatury, stając się drugą Polką uhonorowaną tym wyróżnieniem — po Wisławie Szymborskiej. Pisarka, której twórczość jest tłumaczona na ponad pięćdziesiąt języków, uchodzi za jeden z najważniejszych głosów współczesnej prozy europejskiej.

Jej powieści, takie jak „Bieguni" czy „Księgi Jakubowe", eksplorują tematy tożsamości, pamięci zbiorowej i wielokulturowości — pojęcia niebanalne w kraju, który w XX wieku doświadczył zarówno Holocaustu, jak i dekad totalitaryzmu.

Nagroda nie przyszła jednak bez kontrowersji. Wcześniej Tokarczuk stwierdziła publicznie, że Polska prowadziła kolonialne i zbrodnicze działania na ludach, które zamieszkiwały jej tereny. Słowa te wywołały burzę — część Polaków zarzuciła jej zdradę narodową, podczas gdy inni okrzyknęli ją odważną głosicielką trudnych prawd. Debata ta ujawniła głęboki podział w polskim społeczeństwie dotyczący interpretacji historii.`,
    glossary: {
      "uhonorowaną":       "honored",
      "wyróżnieniem":      "distinction / award",
      "uchodzi za":        "is considered / regarded as",
      "eksplorują":        "explore",
      "zbiorowej":         "collective",
      "niebanalne":        "non-trivial / profound",
      "totalitaryzmu":     "totalitarianism",
      "kolonialne":        "colonial",
      "zbrodnicze":        "criminal / atrocious",
      "zarzuciła":         "accused / charged",
      "okrzyknęli":        "proclaimed / hailed",
      "głosicielką":       "proclaimer / advocate (feminine)"
    },
    questions: [
      {
        id: "r8_q1",
        q: "Tokarczuk jest pierwszą Polką, która otrzymała Nagrodę Nobla w dziedzinie literatury.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "She is the SECOND — Wisława Szymborska was first. 'Drugą Polką' = second Polish woman."
      },
      {
        id: "r8_q2",
        q: "Wszyscy Polacy zareagowali negatywnie na słowa Tokarczuk o historii Polski.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text describes a split: some accused her of betrayal, while others hailed her as a brave truth-teller."
      },
      {
        id: "r8_q3",
        q: "Kontrowersje wokół Tokarczuk ujawniły podziały w polskim podejściu do historii.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "'Debata ta ujawniła głęboki podział w polskim społeczeństwie dotyczący interpretacji historii' — directly stated."
      }
    ]
  },

  // ── 9. GOSPODARKA ────────────────────────────────────────────────────────
  {
    id: "r9",
    category: "Gospodarka",
    difficulty: 3,
    readTime: 4,
    title: "Inflacja i Portfel Polaka",
    icon: "💸",
    hook: "In 2022, Polish inflation hit 17% — the highest in 25 years. How did ordinary Poles survive it?",
    grammarNote: "The impersonal construction 'dało się' (it was possible / one could) is very common in Polish narrative. 'Nie dało się' = it was impossible / you couldn't. This avoids specifying who did something.",
    culturalNote: "Poles are historically traumatized by hyperinflation — many remember the early 1990s when prices changed daily. This 'inflation memory' makes Poles unusually sensitive to price rises and explains why gold and real estate are beloved savings vehicles.",
    text: `W 2022 roku inflacja w Polsce osiągnęła poziom niewidziany od ćwierćwiecza — ponad siedemnaście procent. Ceny żywności, energii i paliwa rosły w zawrotnym tempie, zmuszając miliony rodzin do rewizji codziennych nawyków konsumpcyjnych.

W odpowiedzi na kryzys rząd wprowadził tarczę antyinflacyjną, obejmującą czasowe obniżki VAT na żywność i paliwo. Ekonomiści oceniali skuteczność tych działań różnie — jedni uważali je za niezbędne koło ratunkowe, drudzy za rozwiązanie doraźne, które napędza spiralę cenową.

Polacy radzili sobie na własną rękę. Zakupy w dyskontach pobiły rekordy, a sprzedaż produktów marek własnych wzrosła o kilkadziesiąt procent. Portale z ogłoszeniami odnotowały boom na sprzedaż używanych rzeczy. W trudnych czasach odrodziły się też stare praktyki: słoikowanie, przerabianie ubrań i dzielenie się z sąsiadami. Okazało się, że nie dało się zniszczyć polskiej zaradności.`,
    glossary: {
      "ćwierćwiecza":      "quarter-century",
      "zawrotnym":         "dizzying / staggering",
      "nawyków":           "habits",
      "konsumpcyjnych":    "consumption-related",
      "tarczę":            "shield",
      "obejmującą":        "covering / encompassing",
      "doraźne":           "short-term / makeshift",
      "napędza":           "drives / fuels",
      "dyskontach":        "discount stores",
      "słoikowanie":       "jarring (preserving food in jars)",
      "przerabianie":      "altering / repurposing",
      "zaradności":        "resourcefulness / ingenuity"
    },
    questions: [
      {
        id: "r9_q1",
        q: "Wszyscy ekonomiści popierali rządową tarczę antyinflacyjną.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Oceniali skuteczność tych działań różnie' — they assessed it differently. Some criticized it."
      },
      {
        id: "r9_q2",
        q: "W czasie kryzysu inflacyjnego Polacy kupowali mniej w dyskontach.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Zakupy w dyskontach pobiły rekordy' = discount store shopping broke records — the opposite."
      },
      {
        id: "r9_q3",
        q: "Słoikowanie jest tradycją ponownie odkrytą podczas kryzysu, a nie nowym zjawiskiem.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "'Odrodziły się stare praktyki' = old practices were revived — meaning they existed before."
      }
    ]
  },

  // ── 10. SPOŁECZEŃSTWO ────────────────────────────────────────────────────
  {
    id: "r10",
    category: "Społeczeństwo",
    difficulty: 2,
    readTime: 4,
    title: "Polska Wieś XXI Wieku",
    icon: "🌾",
    hook: "Almost a third of Poles live in rural areas. But the modern Polish village looks nothing like the stereotype.",
    grammarNote: "The word 'niezależnie od' (regardless of) is a very useful B1 preposition phrase. 'Niezależnie od miejsca zamieszkania' = regardless of where you live. It always takes the Genitive case.",
    culturalNote: "The urban-rural divide in Poland is intense — politically, culturally, and economically. Understanding it explains PiS's electoral success, the church's influence, and the massive internal migration of the last 30 years.",
    text: `Stereotyp polskiej wsi — zaściankowość, religijność i zacofanie — coraz bardziej rozmija się z rzeczywistością. Współczesna polska wioska to często prężnie działające centrum usług, z szybkim internetem, aktywnymi sołtysami i ambicjami rozwojowymi nieprzystającymi do jej rozmiarów.

Fundusze unijne zmieniły infrastrukturę: drogi, kanalizacja i ośrodki kultury wyrównały część różnic między wsią a miastem. Jednak migracja wewnętrzna pozostaje bolączką — młodzi ludzie masowo opuszczają małe miejscowości, szukając pracy i rozrywki w aglomeracjach.

Paradoksalnie, pandemia odwróciła ten trend, przynajmniej częściowo. Praca zdalna i wzrost cen nieruchomości w miastach skłoniły wiele miejskich rodzin do wyprowadzki na wieś. Nowi mieszkańcy przynoszą ze sobą inne oczekiwania i styl życia, co tworzy niekiedy napięcia z wieloletnimi mieszkańcami.

Niezależnie od tych zmian, tożsamość wiejska pozostaje silna. Dożynki, odpusty i lokalne święta przyciągają coraz więcej uczestników — nie jako zabytek przeszłości, ale jako żywa tradycja budująca wspólnotę w niepewnych czasach.`,
    glossary: {
      "zaściankowość":   "parochialism / provincialism",
      "zacofanie":       "backwardness",
      "rozmija się z":   "diverges from / doesn't match",
      "prężnie":         "dynamically / vigorously",
      "sołtysami":       "village mayors / sołtys",
      "bolączką":        "pain point / ailment",
      "aglomeracjach":   "urban agglomerations",
      "skłoniły":        "prompted / induced",
      "dożynki":         "harvest festival (Polish tradition)",
      "odpusty":         "parish fairs",
      "wspólnotę":       "community"
    },
    questions: [
      {
        id: "r10_q1",
        q: "Pandemia całkowicie zatrzymała migrację Polaków ze wsi do miast.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Przynajmniej częściowo' = at least partially — the reversal was partial, not total."
      },
      {
        id: "r10_q2",
        q: "Tradycyjne święta wiejskie, takie jak dożynki, tracą na popularności.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Przyciągają coraz więcej uczestników' = attract more and more participants — the opposite."
      },
      {
        id: "r10_q3",
        q: "Nowi mieszkańcy ze miast i starzy mieszkańcy wsi zawsze żyją w harmonii.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Tworzy niekiedy napięcia' = sometimes creates tensions between new and long-term residents."
      }
    ]
  },

  // ── 11. ŚRODOWISKO ───────────────────────────────────────────────────────
  {
    id: "r11",
    category: "Środowisko",
    difficulty: 3,
    readTime: 4,
    title: "Bieszczady — Ostatnia Dzicz Polski",
    icon: "🐺",
    hook: "Wolves are returning to Poland in numbers not seen for 100 years. Shepherds are terrified. Ecologists are celebrating.",
    grammarNote: "Notice 'w odróżnieniu od' (unlike / in contrast to) — a formal comparative phrase at B2 level worth learning passively at B1. Pattern: 'w odróżnieniu od + Genitive'.",
    culturalNote: "The Bieszczady mountains are Poland's mythic wilderness — wild, unpopulated, and culturally liminal. After WWII, the entire population was expelled and resettled elsewhere. The resulting emptiness allowed nature to reclaim the land, creating Europe's largest wolf population outside Russia.",
    text: `Bieszczady, pasmo górskie na południowo-wschodnim krańcu Polski, uchodzi za ostatni prawdziwie dziki zakątek kraju. Niska gęstość zaludnienia — miejscami zaledwie kilka osób na kilometr kwadratowy — pozwoliła naturze odzyskać to, co przez wieki należało do człowieka.

Symbolem tego odrodzenia jest wilk. Polska populacja wilków przekracza dziś dwa tysiące osobników i dynamicznie rośnie. Ekologowie świętują powrót drapieżnika szczytowego jako dowód na rewitalizację ekosystemu. Hodowcy owiec widzą to inaczej — straty materialne rosną każdego roku, a odszkodowania od państwa przychodzą z opóźnieniem.

W odróżnieniu od wielu krajów europejskich, Polska zachowała rozległe kompleksy leśne, które stanowią naturalne korytarze migracyjne dla zwierząt. Rysie, niedźwiedzie i żubry — symbol polskiej przyrody — mają tu przestrzeń do życia.

Jednak największym zagrożeniem nie są myśliwi ani wilki. To drogi. Budowa nowych autostrad i dróg ekspresowych fragmentuje siedliska, uniemożliwiając migrację i zwiększając śmiertelność wśród dzikich zwierząt. Trwa wyścig między rozwojem infrastruktury a ochroną ostatnich ostoi dzikiej natury.`,
    glossary: {
      "pasmo":              "mountain range / band",
      "gęstość zaludnienia":"population density",
      "odzyskać":           "to regain / reclaim",
      "osobników":          "individuals (animals)",
      "drapieżnika":        "predator",
      "szczytowego":        "apex (of a food chain)",
      "rewitalizację":      "revitalization",
      "hodowcy":            "breeders / farmers",
      "odszkodowania":      "compensation / damages",
      "korytarze":          "corridors",
      "fragmentuje":        "fragments",
      "siedliska":          "habitats",
      "ostoi":              "refuges / strongholds"
    },
    questions: [
      {
        id: "r11_q1",
        q: "Hodowcy owiec są zadowoleni z powrotu wilków do Polski.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Hodowcy owiec widzą to inaczej' — they see it differently (negatively), with growing material losses."
      },
      {
        id: "r11_q2",
        q: "Głównym zagrożeniem dla dzikich zwierząt w Bieszczadach są myśliwi.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text explicitly states: 'Największym zagrożeniem nie są myśliwi' — the main threat is roads."
      },
      {
        id: "r11_q3",
        q: "Polska posiada naturalne korytarze migracyjne dla dzikich zwierząt.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Prawda",
        explanation: "Directly stated: preserved forest complexes form natural migration corridors."
      }
    ]
  },

  // ── 12. MUZYKA ───────────────────────────────────────────────────────────
  {
    id: "r12",
    category: "Muzyka",
    difficulty: 1,
    readTime: 3,
    title: "Hip-Hop po Polsku",
    icon: "🎤",
    hook: "Polish hip-hop is the country's most popular music genre. And it's been talking about immigration, inequality, and trauma since the 1990s.",
    grammarNote: "The verb 'utożsamiać się z' (to identify with) always takes the Instrumental case. 'Utożsamiają się z przekazem' = they identify with the message. This verb+case pairing is very common in social commentary.",
    culturalNote: "Polish hip-hop emerged from housing projects ('blokowiska') built under communism. Artists like Tede, Peja, and Sokół gave voice to a generation that felt left behind by the post-1989 transformation. Today, artists like Mata and Young Leosia represent a new wave mixing Polish identity with global sound.",
    text: `Polska scena hip-hopowa, zrodzona w blokowych podwórkach lat dziewięćdziesiątych, stała się dziś jednym z najważniejszych zjawisk kulturalnych w kraju. Raperzy tacy jak Mata, Young Leosia czy Quebonafide wyprzedają największe hale koncertowe i zbierają miliony wyświetleń w serwisach streamingowych.

Co sprawia, że polski hip-hop rezonuje tak silnie z odbiorcami? Eksperyci wskazują na autentyczność. Artyści śpiewają o blokowiskach, imigracji zarobkowej rodziców, trudnościach dorastania w systemie transformacyjnym — tematach, z którymi miliony Polaków utożsamiają się głęboko, niezależnie od pokolenia.

Język jest kluczem. Polski hip-hop dokonał czegoś niezwykłego: udowodnił, że język polski — z jego długimi słowami, trudną fleksją i bogactwem slangowym — idealnie nadaje się do rytmicznego rapowania. Artyści bawią się odmianą słów, tworzą neologizmy i odwołują się do klasycznej literatury z iście postmodernistyczną swobodą.

Dziś gatunek ten wychodzi poza Polskę — polskie teksty pojawiają się w europejskich playlistach, a festiwale hip-hopowe przyciągają słuchaczy z całego kontynentu.`,
    glossary: {
      "zrodzona":        "born / originated",
      "blokowych":       "of housing estates / blocks",
      "wyprzedają":      "sell out",
      "wyświetleń":      "views / plays",
      "rezonuje":        "resonates",
      "blokowiskach":    "large housing projects",
      "imigracji zarobkowej": "labor immigration",
      "transformacyjnym":"transformation-era (post-communist)",
      "utożsamiają się": "identify with",
      "fleksją":         "inflection / declension",
      "neologizmy":      "neologisms / new words",
      "iście":           "truly / genuinely"
    },
    questions: [
      {
        id: "r12_q1",
        q: "Sukces polskiego hip-hopu wynika głównie z globalnych trendów muzycznych.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text attributes success to authenticity and locally resonant themes — not global trends."
      },
      {
        id: "r12_q2",
        q: "Język polski jest według tekstu trudny do zaadaptowania w muzyce hip-hopowej.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "'Idealnie nadaje się do rytmicznego rapowania' = perfectly suited for rhythmic rapping — the opposite."
      },
      {
        id: "r12_q3",
        q: "Polski hip-hop jest słuchany wyłącznie przez Polaków mieszkających w Polsce.",
        options: ["Prawda", "Fałsz", "Nie ma w tekście"],
        correct: "Fałsz",
        explanation: "The text says Polish texts appear in European playlists and festivals attract listeners from across the continent."
      }
    ]
  }
];
