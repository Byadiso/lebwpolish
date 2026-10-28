import { useState, useEffect, useCallback, useRef } from "react";

// ─── Story Data ───────────────────────────────────────────────────────────────
const STORY_DATA = {
  title: "Mała Syrenka",
  pages: [
    { id: 1, paragraphs: ["Hen, daleko od brzegów, aż na środku morza, gdzie nic nie widać, tylko błękit nad falami, gdzie woda przezroczysta jak kryształ najczystszy, a ciemnoszafirowa jak bławatek, jest głębia niezmierzona, otchłań tak głęboka, iż żaden okręt tutaj przystanąć nie może, bo kotwica dna nie dosięgnie.", "W tej niezgłębionej otchłani mieszkały piękne Syreny. Dno piaszczyste i równe pokrywały lasy dziwacznych drzew i roślin, wysmukłych a giętkich, drżących za najlżejszym poruszeniem wody jak żyjące istoty."], translation: "Far away from the shores, in the middle of the sea where only blue is visible above the waves, the water is clear as crystal. In this bottomless abyss lived beautiful Mermaids among strange, flexible trees that moved with the water." },
    { id: 2, paragraphs: ["Pośród drzew przemykały się ryby figlarne, wielkie i małe, zatrzymując się niekiedy na gałązkach niby ptaki na drzewach. A na najgłębszym miejscu stał pałac królewski.", "Wspaniały to był pałac władcy morza: mury z koralu, okna bursztynowe, a dach z muszli perłowych, które się otwierały albo zamykały, ażeby wpuszczać lub wypuszczać wodę. W każdej zaś muszli jaśniały perły kosztowne."], translation: "Playful fish darted through the trees like birds. At the deepest point stood the royal palace of the sea ruler, with coral walls, amber windows, and a roof of pearl shells that opened and closed to let water in and out." },
    { id: 3, paragraphs: ["W tym pałacu mieszkał król morza z rodziną. Przed wielu laty owdowiał i odtąd matka jego wychowywała mu córki. Była to pani bardzo poważna i mądra, lecz tak dumna ze swego rodu, że nosiła dwanaście ostryg na ogonie.", "Księżniczek było sześć, a wszystkie piękne, lecz najmłodsza ze wszystkich najpiękniejsza. Przecudne złote włosy okalały twarzyczkę delikatną niby płatek róży, oczy błękitne jak najgłębsza woda, a zamiast nóg — mieniący się srebrem i złotem, łuską pokryty ogon."], translation: "The sea king lived there with his family. His mother, a wise but proud lady who wore twelve oysters on her tail, raised his daughters. Of the six princesses, the youngest was the most beautiful, with rose-petal skin and a silver-gold tail." },
    { id: 4, paragraphs: ["Dokoła zamku był ogród wspaniały, pełen ognistych i błękitnych kwiatów; liście na drzewach były jak płomienie, owoce niby złoto błyszczące. Grunt stanowił piasek bardzo drobny, błękitnawy jak płomień siarki.", "Wnętrze zaś wód napełniał jakiś blask łagodny, lekko błękitny, a taki przejrzysty, iż zdawać by się mogło, że to głębia nieba, nie otchłań morska. W dni pogodne widać było w górze słońce niby kwiat purpurowy."], translation: "The castle was surrounded by a magnificent garden of fiery flowers and golden fruit. The water was filled with a gentle blue glow so clear it felt like the sky. On clear days, the sun looked like a purple flower above." },
    { id: 5, paragraphs: ["Dziwne to było dziecko ta mała królewna — zawsze ciche, zamyślone. Gdy inne siostry dzieliły się chciwie skarbami z rozbitego o skały okrętu, ona wybrała sobie tylko marmurowy, prześliczny posąg chłopca.", "Umieściła go następnie w ogrodzie pod płaczącą wierzbą o purpurowych liściach. Nie było dla niej większej przyjemności, jak słuchać opowiadania o ludziach. Babka po tysiąc razy musiała powtarzać wszystko, co wiedziała o świecie."], translation: "The youngest princess was quiet and pensive. While her sisters took treasures from shipwrecks, she only wanted a marble statue of a boy under a willow tree. She loved hearing her grandmother's stories about the world of humans." },
    { id: 6, paragraphs: ["— Każda z was to zobaczy — mówiła im zwykle — gdy skończy lat piętnaście. Wtedy będziecie mogły wypływać nocami na powierzchnię morza i przy blasku księżyca patrzeć na okręty, odległe miasta, lasy.", "Najmłodsza Syrena jeszcze pięć lat musiała oczekiwać chwili wypłynięcia. W nocy stawała w oknie i przez ciemne wody patrzyła w górę, śledząc cienie wielorybów lub statków przepływających nad nią."], translation: "'You will see it when you turn fifteen,' the grandmother promised. The youngest had five years to wait. At night, she stared up through the dark water, watching the shadows of whales and ships passing above her." },
    { id: 7, paragraphs: ["Na koniec najstarsza w dniu swoich urodzin pierwszy raz wypłynęła. Gdy powróciła, opowiadała o blasku księżyca na piaszczystej ławie i o dalekich miastach błyszczących tysiącami świateł.", "Słuchała dalekiej muzyki, turkotu wozów i głosu dzwonów kościelnych. Najmłodsza księżniczka milczała, myśląc o tych miastach, których głos daleki zdawał się płynąć aż do niej przez fale."], translation: "The eldest sister finally turned fifteen and visited the surface. She told stories of city lights, music, and church bells. The youngest listened in silence, imagining those distant sounds traveling through the waves." },
    { id: 8, paragraphs: ["Następnego roku druga siostra mogła znowu wypłynąć. Ta wynurzyła się w chwili, gdy słońce miało tonąć w morzu. Niebo jaśniało niby złoto roztopione, a złociste i purpurowe obłoki płynęły w stronę słońca.", "Trzecia księżniczka była odważniejsza, popłynęła aż do ujścia wielkiej rzeki. Ujrzała zielone winnice i zamki. Spostrzegła gromadkę kąpiących się dzieci, które miały 'dwie podpórki' do biegania zamiast ogonów."], translation: "The second sister saw the sunset, with the sky looking like molten gold. The third sister was bolder; she swam up a river and saw vineyards, castles, and human children with their 'two supports' for running." },
    { id: 9, paragraphs: ["Urodziny piątej siostry przypadały w zimie. Gdy wychyliła głowę, ujrzała morze zielone, a po nim, niby perły, pływały olbrzymie góry lodowe, większe niż kościelne wieże, błyszczące w słońcu niby diamenty.", "Usiadła na najwyższej, skąd mogła spojrzeniem objąć przestrzeń bez końca. Wiatr igrał z jej długimi złotymi włosami, a strwożeni żeglarze odwracali oczy i odpływali śpiesznie w inną stronę."], translation: "The fifth sister's birthday fell in winter. She saw green seas and giant icebergs floating like pearls, larger than church towers. She sat on the highest one, her golden hair blowing in the wind, while frightened sailors steered away." },
    { id: 10, paragraphs: ["Nadszedł na koniec ten dzień uroczysty. 'Jesteś dorosła' — rzekła do niej babka — 'możesz wypłynąć na górę, ale cię muszę przedtem ubrać odpowiednio. Jesteś księżniczką'.", "Umieściła jej na złotych włosach wieniec liliowy, gdzie każdy płatek stanowiło pół perły olbrzymiej; a na ogonie babka przypięła jej osiem srebrzystych ostryg. 'Och, jak to boli!' — skarżyła się mała."], translation: "Finally, the big day arrived. 'You are grown up now,' said her grandmother. She placed a wreath of pearls on her hair and attached eight oysters to her tail. 'Oh, how it hurts!' the little mermaid complained." },
    { id: 11, paragraphs: ["Słońce już zaszło, kiedy wychyliła głowę z fali. Lecz oto na fali ujrzała okręt, piękny trójmasztowiec. Na pokładzie roiło się od ludzi, muzyka grała, a setki kolorowych świateł lśniły w ciemności.", "Syrena podpłynęła do okna kajuty. I tutaj pełno ludzi; najpiękniejszy z nich był młody królewicz o wielkich, czarnych oczach. Nie miał więcej nad szesnaście lat. Jakże chciałaby przemówić ludzkim głosem!"], translation: "The sun had set when she surfaced. She saw a three-masted ship filled with people and music. She swam to the cabin window and saw a young prince, no more than sixteen years old, with beautiful dark eyes." },
    { id: 12, paragraphs: ["Noc płynęła, lecz księżniczka nie mogła oderwać oczu od królewicza. Nagle wiatr zaczął dąć silniej, fale wzbierały potężnie. Burza idzie! Okręt mknie coraz szybciej, a Syrena za nim.", "Bałwany uderzały o boki statku z wściekłością. Wreszcie maszt wielki padł, złamany niby trzcina, okręt pochylił się na bok, a woda wdarła się do środka. Jeszcze chwila — zatonie."], translation: "The night went on, but she couldn't look away. Suddenly, a storm hit. The waves grew massive, and the ship's mast snapped like a reed. The ship tilted, water poured in, and it began to sink." },
    { id: 13, paragraphs: ["Syrena drży o księcia. Gdy okręt się zanurzył, rzuciła się na fale pomiędzy belki i odłamki masztów. Szuka go z zapałem, zanurza się w odmęty, aż spostrzega go, gdy bezsilny zapadał w otchłań.", "Pochwyciła go w ramiona i łagodnie wyniosła na powierzchnię. Nad ranem burza ustąpiła. Blask słońca padał na twarz królewicza, lecz jego oczy pozostawały zamknięte. Czyżby go nie ocaliła?"], translation: "She trembled for the prince. Diving between the wreckage, she found him sinking into the abyss. She caught him in her arms and brought him to the surface. By morning, the sun shone on his face, but his eyes remained closed." },
    { id: 14, paragraphs: ["Złożyła ciało młodzieńca na gorącym piasku bezpiecznej zatoki. Wkrótce jedna z dziewcząt z pobliskiego domu znalazła go na brzegu. Syrena widziała, jak książę otworzył oczy i uśmiechnął się do swoich wybawców.", "Nie wiedział, że to ona ocaliła mu życie. Smutna Syrena zanurzyła się w morzu. Odąd zawsze bywała cicha i zamyślona, często powracając w to miejsce, by patrzeć na ląd, lecz księcia nigdzie nie widziała."], translation: "She laid him on the warm sand of a bay. A young girl found him, and the prince awoke, smiling at her. He didn't know the mermaid had saved him. She returned to the sea, becoming quieter and more pensive than ever." },
    { id: 15, paragraphs: ["Na koniec zwierzyła się jednej z sióstr. Wkrótce wszystkie wiedziały, a jedna z syren pokazała jej, gdzie leży państwo królewicza. Pałac był z jasnych, błyszczących kamieni z marmurowymi schodami prowadzącymi do morza.", "Odtąd wiedziała, gdzie mieszka jej królewicz. Przypływała tam nocami, siadając pod oknem balkonu. Słyszała rozmowy rybaków, którzy chwalili dobroć księcia. Serce jej drżało z radości, że uratowała tak dobrego człowieka."], translation: "She eventually told her sisters, and they found the prince's kingdom. It had a palace of shining stone and marble steps. She began visiting every night, watching him from the shadows and hearing how much his people loved him." },
    { id: 16, paragraphs: ["Mała Syrena spytała babkę: 'Czy ludzie wiecznie żyją?'. Babka odrzekła: 'Umierają także, a ich życie jest krótsze niż nasze. My żyjemy lat trzysta, a potem zmieniamy się w pianę morską. Nie mamy duszy nieśmiertelnej'.", "'Dlaczego my nie mamy duszy?' — spytała smutno. 'Oddałabym setki lat życia, by choć jeden dzień być człowiekiem i wiedzieć, że po śmierci będę żyć wiecznie w nowym świecie'."], translation: "She asked her grandmother if humans live forever. 'No,' she replied, 'they die sooner than we do. We live 300 years and then turn into sea foam because we have no immortal soul.' The mermaid wished to trade her long life for just one day as a human with a soul." },
    { id: 17, paragraphs: ["'Czy nie ma sposobu, ażebym zdobyła duszę?' — 'Nie,' rzekła babka. 'Chyba gdyby człowiek ukochał cię więcej niż ojca i matkę, a ksiądz związałby wam ręce. Wtedy połowa jego duszy przeniknęłaby w ciebie. Lecz to się stać nie może.'", "Syrena westchnęła ze smutkiem, patrząc na swój srebrzysty ogon. 'Trzysta lat życia to dosyć' — dodała babka — 'póki żyjemy, bawmy się wesoło. Dzisiaj w pałacu odbędzie się bal dworski'."], translation: "'Is there no way to get a soul?' — 'Only if a human loved you more than anything and married you,' said the grandmother. 'Then a part of his soul would flow into you.' The mermaid sighed, looking at her tail, as her grandmother announced a grand ball." },
    { id: 18, paragraphs: ["Syrena postanowiła udać się do morskiej wiedźmy. Droga była straszna, przez wiry ryczące i gorące błoto. Wiedźma mieszkała pośród lasu polipów, które chwytały wszystko, co przepływało obok.", "'Wiem, po co przychodzisz' — rzekła wiedźma. 'Chcesz pozbyć się ogona i mieć dwie podpórki, aby młody książę cię pokochał i abyś zdobyła duszę nieśmiertelną. To bardzo nierozsądne, ale pomogę ci'."], translation: "She decided to visit the Sea Witch. The path was terrifying, through whirlpools and slime. 'I know why you are here,' the witch said. 'You want to trade your tail for legs to win the prince and a soul. It's foolish, but I will help you.'" },
    { id: 19, paragraphs: ["'Przygotuję ci napój,' mówiła wiedźma. 'Musisz go wypić na brzegu. Twój ogon zmieni się w nogi, ale każdy krok będzie ci sprawiał ból, jakbyś stąpała po ostrych nożach. Jeśli książę ożeni się z inną, staniesz się pianą morską.'", "'Zgadzam się' — rzekła Syrena, choć była blada jak śmierć. 'Ale zapłatą będzie twój głos, najpiękniejszy głos w całym morzu. Odetnę ci język' — dodała wiedźma."], translation: "'I will make a potion. Your tail will become legs, but every step will feel like walking on sharp knives. If the prince marries another, you will turn to foam.' The mermaid agreed. 'But you must pay with your voice,' the witch added." },
    { id: 20, paragraphs: ["Mała Syrena wypiła napój na schodach pałacu i zemdlała z bólu. Gdy się obudziła, stał nad nią królewicz. Nie miała już ogona, lecz dwie białe nogi. Książę spytał, kim jest, lecz ona nie mogła już wymówić ani słowa.", "Książę wziął ją za rękę i wprowadził do pałacu. Każdy krok sprawiał jej ból nieopisany, ale szła lekko jak bańka mydlana, a wszyscy dziwili się jej wdziękowi i błękitnym, smutnym oczom."], translation: "She drank the potion and fainted from the pain. When she awoke, the prince was there. Her tail was gone, replaced by legs. He asked who she was, but she could not speak. He led her into the palace; every step was agony, yet she moved with unmatched grace." },
  ],
  vocabulary: {
    "bławatek": { en: "cornflower", type: "noun", desc: "A bright blue flower often found in fields — evokes the pure blue of the sea." },
    "otchłań": { en: "abyss / chasm", type: "noun", desc: "A deep, bottomless chasm — used here for the deepest part of the ocean." },
    "owdowiał": { en: "became a widower", type: "verb", desc: "The sea king lost his wife many years ago — widowed, left alone." },
    "łuską": { en: "scales", type: "noun", desc: "The small, thin plates covering a fish's body — part of the mermaid's tail." },
    "wierzbą": { en: "willow tree", type: "noun", desc: "A graceful tree with drooping branches — the mermaid's favourite spot in the garden." },
    "trójmasztowiec": { en: "three-masted ship", type: "noun", desc: "A grand sailing vessel with three masts — the prince's ship in the storm." },
    "bałwany": { en: "huge waves / billows", type: "noun", desc: "Enormous crashing sea waves — battered the ship during the storm." },
    "odmęty": { en: "depths / swirling waters", type: "noun", desc: "Dark, turbulent deep waters — where the prince was sinking." },
    "nieśmiertelnej": { en: "immortal", type: "adjective", desc: "Never dying, living forever — the soul the mermaid longs to possess." },
    "wiedźma": { en: "witch", type: "noun", desc: "A woman with dark magic powers — the terrifying sea witch who makes the deal." },
    "wdziękowi": { en: "grace / charm", type: "noun", desc: "The quality of moving beautifully — everyone admired how the mermaid walked." },
    "syrenka": { en: "little mermaid", type: "noun", desc: "The story's heroine — half girl, half fish, longing for the human world." },
    "głębia": { en: "depth / the deep", type: "noun", desc: "Profound depth, often of water — the vast deep ocean where the mermaids live." },
    "błękit": { en: "blue / blueness", type: "noun", desc: "A vivid, sky-like blue — the colour of the sea and the mermaid's eyes." },
    "morze": { en: "sea", type: "noun", desc: "A large body of salt water — the world the mermaid eventually leaves behind." },
    "pałac": { en: "palace", type: "noun", desc: "A magnificent royal residence — both the underwater palace and the prince's castle." },
    "królewicz": { en: "prince", type: "noun", desc: "A young royal — the prince whose life the mermaid saves and falls in love with." },
    "syrena": { en: "mermaid / siren", type: "noun", desc: "A mythical being, half-human, half-fish — the creature at the heart of this tale." },
    "burza": { en: "storm / tempest", type: "noun", desc: "A violent weather event — the storm that wrecks the prince's ship." },
    "dusza": { en: "soul", type: "noun", desc: "The immortal spiritual part of a human — what the mermaid sacrifices everything to obtain." },
    "ogon": { en: "tail", type: "noun", desc: "The fish tail — what the mermaid trades to the witch for legs." },
    "głos": { en: "voice", type: "noun", desc: "The ability to speak and sing — the price the witch demands from the mermaid." },
    "księżniczka": { en: "princess", type: "noun", desc: "A daughter of royalty — there are six mermaid princesses, youngest being our heroine." },
    "babka": { en: "grandmother", type: "noun", desc: "The sea king's mother who raises the princesses and tells them about the human world." },
    "kotwica": { en: "anchor", type: "noun", desc: "A heavy metal device that holds a ship in place — too short to reach the ocean floor here." },
  }
};

// ─── Comprehensive Polish Word Dictionary (full-story backup) ─────────────────
const POLISH_DICTIONARY = {
  // Common words
  "hen": { en: "far away / yonder", type: "adverb", desc: "An old-fashioned Polish word meaning 'far off in the distance' — sets the fairy-tale tone." },
  "daleko": { en: "far / far away", type: "adverb", desc: "At a great distance — emphasising how remote the mermaid's kingdom is." },
  "brzegów": { en: "shores / banks", type: "noun", desc: "The edges of land meeting water — far from which the mermaids live." },
  "środku": { en: "middle / centre", type: "noun", desc: "The very centre — here the centre of the vast open sea." },
  "widać": { en: "one can see / visible", type: "verb", desc: "To be visible — nothing can be seen from here except blue sky and waves." },
  "tylko": { en: "only / just", type: "adverb", desc: "A limiting word — only the blue above the waves is visible." },
  "falami": { en: "waves", type: "noun", desc: "The rolling movements of sea water — the mermaid's world is shaped by them." },
  "woda": { en: "water", type: "noun", desc: "The essential element — the mermaids' home and the sea itself." },
  "przezroczysta": { en: "transparent / clear", type: "adjective", desc: "So clear you can see right through it — describing the crystal-clear ocean." },
  "kryształ": { en: "crystal", type: "noun", desc: "A clear, sparkling mineral — used to compare the purity of the water." },
  "najczystszy": { en: "purest / clearest", type: "adjective", desc: "The superlative of pure — the water is the clearest imaginable." },
  "ciemnoszafirowa": { en: "dark sapphire blue", type: "adjective", desc: "A deep, jewel-like blue — the rich colour of the deep ocean." },
  "niezmierzona": { en: "immeasurable / boundless", type: "adjective", desc: "Too vast to measure — describing the unfathomable depth of the sea." },
  "głęboka": { en: "deep", type: "adjective", desc: "Of great depth — the ocean is so deep no anchor can reach the bottom." },
  "żaden": { en: "no / none / not any", type: "pronoun", desc: "A negative — not a single ship can anchor here." },
  "okręt": { en: "ship / vessel", type: "noun", desc: "A large sailing ship — no ship can anchor in these deep waters." },
  "przystanąć": { en: "to stop / to anchor", type: "verb", desc: "To come to a halt or drop anchor — impossible in such deep water." },
  "dna": { en: "bottom / floor", type: "noun", desc: "The floor of the ocean — too deep for any anchor to reach." },
  "dosięgnie": { en: "will reach / can reach", type: "verb", desc: "To reach, to extend far enough — the anchor cannot reach the sea bottom." },
  "niezgłębionej": { en: "unfathomable / bottomless", type: "adjective", desc: "Impossible to sound or measure — describing the deepest ocean abyss." },
  "mieszkały": { en: "lived / dwelt", type: "verb", desc: "To live somewhere — the mermaids made their home in these depths." },
  "piękne": { en: "beautiful", type: "adjective", desc: "Lovely, attractive — the mermaids are described as beautiful beings." },
  "dno": { en: "bottom / floor", type: "noun", desc: "The seabed — covered in fine sand and strange underwater plants." },
  "piaszczyste": { en: "sandy", type: "adjective", desc: "Covered with sand — the seabed is described as sandy and even." },
  "równe": { en: "even / flat / smooth", type: "adjective", desc: "Level and smooth — the sandy seabed stretches flat in all directions." },
  "pokrywały": { en: "covered / were covering", type: "verb", desc: "To cover a surface — strange trees and plants covered the seafloor." },
  "lasy": { en: "forests / woods", type: "noun", desc: "Thick groupings of trees — here referring to underwater forests of strange plants." },
  "dziwacznych": { en: "strange / bizarre / weird", type: "adjective", desc: "Oddly shaped and unusual — the underwater plants look unlike anything above." },
  "drzew": { en: "trees", type: "noun", desc: "Tall plants with trunks — underwater, strange tree-like plants grow on the seabed." },
  "roślin": { en: "plants", type: "noun", desc: "Living growing things — a variety of underwater plants fills the mermaid's world." },
  "wysmukłych": { en: "slender / tall and slim", type: "adjective", desc: "Long and graceful — the underwater plants are described as slim and elegant." },
  "giętkich": { en: "flexible / supple / pliant", type: "adjective", desc: "Bending easily — the plants sway with every movement of the water." },
  "drżących": { en: "trembling / quivering", type: "verb", desc: "Shaking slightly — the plants tremble at the slightest current of water." },
  "najlżejszym": { en: "lightest / slightest", type: "adjective", desc: "The very smallest — even the gentlest movement of water makes the plants shiver." },
  "poruszeniem": { en: "movement / motion", type: "noun", desc: "A stirring or movement — the water's tiniest motion sets the plants trembling." },
  "żyjące": { en: "living / alive", type: "adjective", desc: "Having life — the plants move so much they seem to be living creatures." },
  "istoty": { en: "beings / creatures", type: "noun", desc: "Living things — the swaying plants look like living beings." },
  // Page 2
  "pośród": { en: "among / amidst", type: "preposition", desc: "In the middle of, surrounded by — fish dart among the underwater trees." },
  "drzew": { en: "trees", type: "noun", desc: "Tall plants — here the strange underwater tree-like growths." },
  "przemykały": { en: "darted / slipped through", type: "verb", desc: "To move quickly and nimbly — fish flash through the underwater plants." },
  "ryby": { en: "fish", type: "noun", desc: "Aquatic creatures — playful fish weave through the underwater forest." },
  "figlarne": { en: "playful / mischievous", type: "adjective", desc: "Full of fun and tricks — the fish are described as lively and playful." },
  "wielkie": { en: "large / great", type: "adjective", desc: "Big in size — both large and small fish swim together." },
  "małe": { en: "small / little", type: "adjective", desc: "Small in size — tiny fish alongside the large ones." },
  "zatrzymując": { en: "stopping / pausing", type: "verb", desc: "Coming to a halt — fish pause on branches just as birds rest in trees." },
  "niekiedy": { en: "sometimes / occasionally", type: "adverb", desc: "From time to time — occasionally the fish stop and perch on branches." },
  "gałązkach": { en: "branches / twigs", type: "noun", desc: "Small branches of plants — the fish rest on them like birds." },
  "niby": { en: "like / as if / just as", type: "conjunction", desc: "A comparing word — used to draw vivid comparisons throughout the tale." },
  "ptaki": { en: "birds", type: "noun", desc: "Winged animals — the fish are compared to birds perching in trees." },
  "najgłębszym": { en: "deepest", type: "adjective", desc: "The superlative of deep — at the very lowest point of the ocean." },
  "miejscu": { en: "place / spot", type: "noun", desc: "A location — the deepest spot on the ocean floor." },
  "stał": { en: "stood / was standing", type: "verb", desc: "To stand — the royal palace stood at the deepest point." },
  "królewski": { en: "royal / kingly", type: "adjective", desc: "Belonging to a king — the magnificent royal palace of the sea king." },
  "wspaniały": { en: "magnificent / splendid", type: "adjective", desc: "Impressively grand — the sea king's palace is truly splendid." },
  "władcy": { en: "ruler / lord", type: "noun", desc: "A person who rules — the sea king is the ruler of the ocean realm." },
  "mury": { en: "walls", type: "noun", desc: "The outer walls of a building — here built from coral." },
  "koralu": { en: "coral", type: "noun", desc: "A hard colourful substance from the sea — used to build the palace walls." },
  "okna": { en: "windows", type: "noun", desc: "Openings in a wall — the palace windows are made of amber." },
  "bursztynowe": { en: "amber / of amber", type: "adjective", desc: "Made of amber, a golden fossilised resin — the windows glow warmly." },
  "dach": { en: "roof", type: "noun", desc: "The top covering of a building — the palace roof is made of pearl shells." },
  "muszli": { en: "shells", type: "noun", desc: "The hard outer coverings of sea creatures — used as roof tiles on the palace." },
  "perłowych": { en: "pearly / of pearl", type: "adjective", desc: "Made of pearl or pearl-like — the shells that form the palace roof." },
  "otwierały": { en: "opened", type: "verb", desc: "To open — the shells could open to let water flow in." },
  "zamykały": { en: "closed", type: "verb", desc: "To close — and close again to keep water out." },
  "ażeby": { en: "in order to / so that", type: "conjunction", desc: "A purpose word — the shells opened and closed so that water could flow through." },
  "wpuszczać": { en: "to let in / to admit", type: "verb", desc: "To allow something to enter — letting water into the palace." },
  "wypuszczać": { en: "to let out / to release", type: "verb", desc: "To allow something to leave — releasing water from the palace." },
  "muszli": { en: "shells", type: "noun", desc: "The beautiful shells decorating every part of the palace." },
  "jaśniały": { en: "shone / gleamed", type: "verb", desc: "To shine or glow — precious pearls gleamed inside every shell." },
  "perły": { en: "pearls", type: "noun", desc: "Precious round gems formed inside oysters — glowing inside every shell." },
  "kosztowne": { en: "precious / costly / valuable", type: "adjective", desc: "Of great value — the pearls inside the shells are described as precious." },
  // Page 3
  "pałacu": { en: "palace", type: "noun", desc: "In the palace — the sea king's magnificent underwater home." },
  "mieszkał": { en: "lived / resided", type: "verb", desc: "To live in a place — the sea king made his home in this palace." },
  "król": { en: "king", type: "noun", desc: "A male ruler — the sea king rules over all the ocean." },
  "rodziną": { en: "family", type: "noun", desc: "One's relatives — the king lives with his family in the palace." },
  "wielu": { en: "many", type: "adjective", desc: "A large number of — many years ago the king became a widower." },
  "laty": { en: "years", type: "noun", desc: "Units of time — many years had passed since the queen died." },
  "odtąd": { en: "from then on / since then", type: "adverb", desc: "From that point in time — since the queen died, his mother raised the girls." },
  "matka": { en: "mother", type: "noun", desc: "One's female parent — the king's mother stepped in to raise his daughters." },
  "wychowywała": { en: "raised / brought up", type: "verb", desc: "To raise and educate children — the grandmother raised the six princesses." },
  "córki": { en: "daughters", type: "noun", desc: "Female children — the king's six daughters, all beautiful mermaids." },
  "pani": { en: "lady / madam / woman", type: "noun", desc: "A respectful title for a woman — used here for the grandmother." },
  "bardzo": { en: "very / very much", type: "adverb", desc: "To a great degree — the grandmother was very serious and very wise." },
  "poważna": { en: "serious / solemn", type: "adjective", desc: "Dignified and earnest — the grandmother carried herself with great gravity." },
  "mądra": { en: "wise / smart", type: "adjective", desc: "Having great wisdom — the grandmother was celebrated for her wisdom." },
  "lecz": { en: "but / however", type: "conjunction", desc: "A contrasting word — she was wise, but also very proud of her noble lineage." },
  "dumna": { en: "proud", type: "adjective", desc: "Feeling great pride — the grandmother was proud of her royal ancestry." },
  "rodu": { en: "lineage / family / descent", type: "noun", desc: "One's family line or ancestry — she was proud of her noble heritage." },
  "nosiła": { en: "wore / carried", type: "verb", desc: "To wear or bear — she wore twelve oysters on her tail as a status symbol." },
  "dwanaście": { en: "twelve", type: "noun", desc: "The number 12 — twelve oysters signalled her high rank." },
  "ostryg": { en: "oysters", type: "noun", desc: "Shellfish that can contain pearls — worn on the tail as a sign of nobility." },
  "księżniczek": { en: "princesses", type: "noun", desc: "Daughters of royalty — all six were beautiful, but the youngest most of all." },
  "sześć": { en: "six", type: "noun", desc: "The number 6 — the sea king had six daughters." },
  "wszystkie": { en: "all / every one", type: "pronoun", desc: "Each and every one — all six princesses were beautiful." },
  "najmłodsza": { en: "youngest", type: "adjective", desc: "The one born last — the youngest mermaid is the story's heroine." },
  "wszystkich": { en: "of all / among all", type: "pronoun", desc: "Among everyone — the youngest was most beautiful of all." },
  "najpiękniejsza": { en: "most beautiful", type: "adjective", desc: "Surpassingly lovely — the superlative of beautiful." },
  "przecudne": { en: "wonderful / exquisite", type: "adjective", desc: "Extraordinarily beautiful — used to describe her golden hair." },
  "złote": { en: "golden", type: "adjective", desc: "The colour of gold — her hair shone with a beautiful golden colour." },
  "włosy": { en: "hair", type: "noun", desc: "The hair on one's head — the youngest mermaid had beautiful golden hair." },
  "okalały": { en: "framed / surrounded", type: "verb", desc: "To encircle or frame — her golden hair framed her delicate face." },
  "twarzyczkę": { en: "little face", type: "noun", desc: "A small, delicate face — the diminutive form expresses tenderness." },
  "delikatną": { en: "delicate", type: "adjective", desc: "Fragile and fine — her face was as delicate as a rose petal." },
  "płatek": { en: "petal / flake", type: "noun", desc: "The leaf-like part of a flower — her face was like a soft rose petal." },
  "róży": { en: "rose", type: "noun", desc: "A classic flower associated with beauty — her face was as soft as a rose petal." },
  "oczy": { en: "eyes", type: "noun", desc: "The organs of sight — her eyes were as blue as the deepest water." },
  "błękitne": { en: "sky blue / azure", type: "adjective", desc: "The bright blue of the sky — her eyes shimmered with this colour." },
  "zamiast": { en: "instead of", type: "preposition", desc: "In place of — instead of legs, she had a fish tail." },
  "nóg": { en: "legs", type: "noun", desc: "The limbs used for walking — she had none; only a beautiful shimmering tail." },
  "mieniący": { en: "shimmering / iridescent", type: "adjective", desc: "Glittering with changing colours — her tail shimmered silver and gold." },
  "srebrem": { en: "silver", type: "noun", desc: "A precious shining metal — her tail gleamed with silver hues." },
  "złotem": { en: "gold", type: "noun", desc: "A precious yellow metal — her tail glittered with gold alongside the silver." },
  "pokryty": { en: "covered", type: "adjective", desc: "Having a covering — her tail was covered in glittering scales." },
  // Page 4
  "dokoła": { en: "all around / surrounding", type: "adverb", desc: "On all sides — the magnificent garden surrounded the palace on all sides." },
  "zamku": { en: "castle / palace", type: "noun", desc: "A grand fortified residence — the underwater palace with its beautiful garden." },
  "ogród": { en: "garden", type: "noun", desc: "A cultivated outdoor space — a spectacular garden of glowing flowers." },
  "wspaniały": { en: "magnificent / splendid", type: "adjective", desc: "Impressively beautiful — the garden was truly spectacular." },
  "pełen": { en: "full of", type: "adjective", desc: "Filled with — the garden was full of fiery and blue flowers." },
  "ognistych": { en: "fiery / flame-coloured", type: "adjective", desc: "The colour of fire — the flowers burned red and orange like flames." },
  "kwiatów": { en: "flowers", type: "noun", desc: "Blossoming plants — the garden bloomed with extraordinary underwater flowers." },
  "liście": { en: "leaves", type: "noun", desc: "The flat green parts of plants — the tree leaves glowed like flames." },
  "płomienie": { en: "flames", type: "noun", desc: "Tongues of fire — the leaves looked like brilliant dancing flames." },
  "owoce": { en: "fruit", type: "noun", desc: "The edible produce of plants — the fruit gleamed like gold." },
  "błyszczące": { en: "gleaming / sparkling", type: "adjective", desc: "Shining brightly — the golden fruit sparkled in the underwater light." },
  "grunt": { en: "ground / soil / earth", type: "noun", desc: "The surface of the earth — here the sandy seafloor." },
  "stanowił": { en: "constituted / formed / made up", type: "verb", desc: "To make up or form something — the ground was made of fine sand." },
  "piasek": { en: "sand", type: "noun", desc: "Tiny grains of rock — the garden floor was covered in the finest sand." },
  "drobny": { en: "fine / tiny", type: "adjective", desc: "Very small in size — the sand was ground incredibly fine." },
  "błękitnawy": { en: "bluish", type: "adjective", desc: "Tinged with blue — the sand had a faint bluish colour." },
  "płomień": { en: "flame", type: "noun", desc: "A tongue of fire — here compared to the colour of burning sulphur." },
  "siarki": { en: "sulphur", type: "noun", desc: "A yellow chemical element that burns with a blue flame." },
  "wnętrze": { en: "interior / inside", type: "noun", desc: "The inside — the interior of the ocean depths." },
  "zaś": { en: "whereas / and / while", type: "conjunction", desc: "A connecting word used for contrast or continuation in formal Polish." },
  "wód": { en: "waters", type: "noun", desc: "Bodies of water — the interior of the ocean waters glowed softly." },
  "napełniał": { en: "filled / suffused", type: "verb", desc: "To fill completely — a gentle blue glow filled the ocean depths." },
  "jakiś": { en: "some kind of / a certain", type: "pronoun", desc: "An indefinite word — some sort of gentle glow filled the waters." },
  "blask": { en: "glow / radiance / shine", type: "noun", desc: "A soft light — the water was filled with a beautiful gentle radiance." },
  "łagodny": { en: "gentle / mild / soft", type: "adjective", desc: "Soft and soothing — the glow was warm and gentle." },
  "lekko": { en: "lightly / slightly / gently", type: "adverb", desc: "In a light, subtle way — the glow was lightly blue-tinged." },
  "przejrzysty": { en: "clear / transparent / lucid", type: "adjective", desc: "So clear it can be seen through — the water was brilliantly transparent." },
  "zdawać": { en: "to seem / to appear", type: "verb", desc: "To give the impression of — it seemed as though the ocean were the sky." },
  "mogło": { en: "could / was able to", type: "verb", desc: "Expressing possibility — one could be forgiven for thinking it was the sky." },
  "nieba": { en: "sky / heaven", type: "noun", desc: "The sky above — the clear blue water looked just like the sky." },
  "morska": { en: "marine / of the sea", type: "adjective", desc: "Relating to the sea — the ocean abyss, not a piece of sky." },
  "pogodne": { en: "clear / fair / sunny", type: "adjective", desc: "Of fine weather — on clear days, sunlight penetrated the depths." },
  "widać": { en: "one can see / visible", type: "verb", desc: "To be seen — on clear days, the sun was visible from below." },
  "górze": { en: "above / up high", type: "noun", desc: "High up — looking upward from the seabed toward the surface." },
  "słońce": { en: "sun", type: "noun", desc: "The star that gives light and warmth — seen from below as a purple flower." },
  "purpurowy": { en: "purple / crimson", type: "adjective", desc: "A rich dark red or purple — the sun's colour when seen through deep water." },
  // Page 5
  "dziwne": { en: "strange / unusual", type: "adjective", desc: "Not like others — this little princess was a curious, unusual child." },
  "dziecko": { en: "child", type: "noun", desc: "A young person — the youngest mermaid, still a child in heart and wonder." },
  "królewna": { en: "princess / king's daughter", type: "noun", desc: "A royal daughter — the young mermaid princess, quiet and dreamy." },
  "zawsze": { en: "always", type: "adverb", desc: "At all times — she was always quiet and always lost in thought." },
  "ciche": { en: "quiet / silent", type: "adjective", desc: "Making no noise — she was a quiet, peaceful child." },
  "zamyślone": { en: "pensive / lost in thought", type: "adjective", desc: "Deep in one's own thoughts — she was always daydreaming." },
  "inne": { en: "other", type: "adjective", desc: "Not the same — while her other sisters did one thing, she did another." },
  "siostry": { en: "sisters", type: "noun", desc: "Female siblings — the other five mermaid sisters." },
  "dzieliły": { en: "shared / divided", type: "verb", desc: "To divide or share among people — the sisters divided the ship's treasures." },
  "chciwie": { en: "greedily / eagerly", type: "adverb", desc: "With great desire and greed — the sisters eagerly grabbed the treasures." },
  "skarbami": { en: "treasures", type: "noun", desc: "Precious objects — the treasures from shipwrecked vessels on the rocks." },
  "rozbitego": { en: "wrecked / smashed", type: "adjective", desc: "Broken apart — a ship wrecked on the rocks at the bottom of the sea." },
  "skały": { en: "rocks / cliffs", type: "noun", desc: "Hard rock formations — ships were wrecked on these underwater rocks." },
  "wybrała": { en: "chose / selected", type: "verb", desc: "To make a choice — she chose only one thing among all the treasures." },
  "sobie": { en: "for herself / to herself", type: "pronoun", desc: "For one's own use — she chose only one treasure for herself." },
  "marmurowy": { en: "marble / of marble", type: "adjective", desc: "Made of marble, a smooth white stone — a beautiful marble statue." },
  "prześliczny": { en: "exquisite / lovely / beautiful", type: "adjective", desc: "Exceptionally beautiful — the marble statue was truly lovely." },
  "posąg": { en: "statue", type: "noun", desc: "A carved figure — a beautiful marble statue of a young boy." },
  "chłopca": { en: "boy / young man", type: "noun", desc: "A male child or youth — the statue depicted a young boy." },
  "umieściła": { en: "placed / put", type: "verb", desc: "To put something in a location — she placed the statue in her garden." },
  "następnie": { en: "then / next / afterwards", type: "adverb", desc: "After that — she then placed it in her garden." },
  "ogrodzie": { en: "garden", type: "noun", desc: "A cultivated space for plants — she put the statue in her beloved garden." },
  "płaczącą": { en: "weeping", type: "adjective", desc: "Appearing to cry — a weeping willow with drooping branches." },
  "purpurowych": { en: "purple / crimson", type: "adjective", desc: "Deep red-purple in colour — the willow had striking purple leaves." },
  "liściach": { en: "leaves", type: "noun", desc: "The flat parts of plants — the willow's purple leaves drifted in the current." },
  "większej": { en: "greater / bigger", type: "adjective", desc: "Of more importance — nothing gave her greater pleasure." },
  "przyjemności": { en: "pleasure / enjoyment", type: "noun", desc: "A feeling of happiness — her greatest pleasure was hearing stories of humans." },
  "słuchać": { en: "to listen / to hear", type: "verb", desc: "To pay attention to sounds or speech — she loved listening to tales of humans." },
  "opowiadania": { en: "stories / tales", type: "noun", desc: "Narrative accounts — the grandmother's stories of the human world above." },
  "ludziach": { en: "people / humans", type: "noun", desc: "Human beings — she longed to know everything about people." },
  "tysiąc": { en: "thousand", type: "noun", desc: "The number 1,000 — the grandmother had to repeat everything a thousand times." },
  "razy": { en: "times", type: "noun", desc: "Occasions, repetitions — a thousand times she asked to hear the same stories." },
  "musiała": { en: "had to / was obliged to", type: "verb", desc: "To be required — the grandmother had to repeat everything over and over." },
  "powtarzać": { en: "to repeat / to retell", type: "verb", desc: "To say again — she asked the grandmother to tell the same stories again." },
  "wiedziała": { en: "knew", type: "verb", desc: "To know — everything the grandmother knew about the world above." },
  "świecie": { en: "world", type: "noun", desc: "The earth and all upon it — the human world the mermaid longed to see." },
  // Page 6
  "każda": { en: "each / every", type: "pronoun", desc: "Each one of a group — each of the princesses would get their turn." },
  "zobaczy": { en: "will see", type: "verb", desc: "To see — each princess would see the surface world when she turned fifteen." },
  "mówiła": { en: "said / used to say", type: "verb", desc: "To speak — the grandmother used to say this to the princesses." },
  "zwykle": { en: "usually / normally", type: "adverb", desc: "As a rule — she usually told them this when they asked." },
  "skończy": { en: "will finish / will turn (age)", type: "verb", desc: "To complete — when each princess turned fifteen years old." },
  "lat": { en: "years (of age)", type: "noun", desc: "Years lived — the age of fifteen marked the transition to adulthood." },
  "piętnaście": { en: "fifteen", type: "noun", desc: "The number 15 — at fifteen, the mermaids were allowed to surface." },
  "wtedy": { en: "then / at that time", type: "adverb", desc: "At that point — then they would be allowed to go to the surface." },
  "będziecie": { en: "you will (plural)", type: "verb", desc: "Future tense plural — you (all of you) will be able to swim up." },
  "mogły": { en: "could / were able to", type: "verb", desc: "To have the ability — they could finally swim to the surface." },
  "wypływać": { en: "to swim out / to surface", type: "verb", desc: "To swim upward and out — to come up to the surface of the sea." },
  "nocami": { en: "at nights / during the nights", type: "noun", desc: "During the night hours — they could only surface at night." },
  "powierzchnię": { en: "surface", type: "noun", desc: "The top layer — the surface of the sea, above the waves." },
  "blasku": { en: "in the glow / by the light", type: "noun", desc: "By the light of — by the soft light of the moon." },
  "księżyca": { en: "moon", type: "noun", desc: "Earth's natural satellite — the moon lit the nighttime sea surface." },
  "patrzeć": { en: "to look / to gaze", type: "verb", desc: "To look at something — to gaze at ships, cities, and forests above." },
  "odległe": { en: "distant / faraway", type: "adjective", desc: "Far away — distant cities seen from the sea surface." },
  "miasta": { en: "cities / towns", type: "noun", desc: "Large settlements of people — the glittering cities of the human world." },
  "oczekiwać": { en: "to wait for / to await", type: "verb", desc: "To wait patiently — the youngest had five more years to wait." },
  "chwili": { en: "moment / instant", type: "noun", desc: "A point in time — the moment she could finally swim to the surface." },
  "wypłynięcia": { en: "of surfacing / of swimming out", type: "noun", desc: "The act of swimming up to the surface — the long-awaited moment." },
  "nocy": { en: "night", type: "noun", desc: "The dark hours — she spent her nights staring upward through the water." },
  "stawała": { en: "stood / used to stand", type: "verb", desc: "To stand — she would stand at her window at night." },
  "oknie": { en: "window", type: "noun", desc: "An opening in a wall — she stood at the palace window looking up." },
  "ciemne": { en: "dark", type: "adjective", desc: "Without light — the dark water above her." },
  "patrzyła": { en: "looked / gazed", type: "verb", desc: "To look — she gazed upward through the dark water." },
  "śledząc": { en: "watching / tracking / following", type: "verb", desc: "To follow with one's eyes — she tracked the shadows moving above her." },
  "cienie": { en: "shadows", type: "noun", desc: "Dark shapes cast by objects — the dark shapes of whales and ships." },
  "wielorybów": { en: "whales", type: "noun", desc: "The largest sea mammals — their huge shadows passed above the mermaid." },
  "statków": { en: "ships / vessels", type: "noun", desc: "Large boats — the shadows of ships crossing the sea above." },
  "przepływających": { en: "passing / sailing through", type: "verb", desc: "Moving through water — ships sailing across the sea above her." },
  // Page 7
  "koniec": { en: "end / finally", type: "noun", desc: "The end or conclusion — finally the long-awaited moment came." },
  "najstarsza": { en: "eldest / oldest", type: "adjective", desc: "The one born first — the eldest of the six mermaid sisters." },
  "dniu": { en: "day", type: "noun", desc: "A 24-hour period — on the day of her birthday, the moment arrived." },
  "swoich": { en: "her own / one's own", type: "pronoun", desc: "Belonging to oneself — her own birthday, her special day." },
  "urodzin": { en: "birthday", type: "noun", desc: "The anniversary of one's birth — the birthday that meant she could surface." },
  "pierwszy": { en: "first", type: "adjective", desc: "Coming before all others — for the first time she swam to the surface." },
  "raz": { en: "time / once", type: "noun", desc: "An occurrence — for the first time ever she went to the surface." },
  "wypłynęła": { en: "surfaced / swam up", type: "verb", desc: "To swim upward and emerge — she rose to the surface of the sea." },
  "powróciła": { en: "returned", type: "verb", desc: "To come back — when she returned, she had stories to share." },
  "opowiadała": { en: "told / narrated", type: "verb", desc: "To tell a story — she told her sisters everything she had seen." },
  "blasku": { en: "glow / shine", type: "noun", desc: "Radiant light — the glow of the moon on the sandy sea bottom." },
  "piaszczystej": { en: "sandy", type: "adjective", desc: "Covered with sand — the sandy banks stretching into the sea." },
  "ławie": { en: "sandbar / bench / bank", type: "noun", desc: "A long flat elevation — here a sandbar revealed by moonlight." },
  "dalekich": { en: "distant / faraway", type: "adjective", desc: "At a great distance — faraway cities shining with thousands of lights." },
  "błyszczących": { en: "glittering / gleaming", type: "adjective", desc: "Shining with many lights — the glittering cities of the human world." },
  "tysiącami": { en: "thousands", type: "noun", desc: "Many thousands — thousands of lights sparkled in the distant cities." },
  "świateł": { en: "lights", type: "noun", desc: "Points of illumination — the thousands of lights of human cities." },
  "słuchała": { en: "listened", type: "verb", desc: "To listen — the youngest sister listened intently to every detail." },
  "dalekiej": { en: "distant / faraway", type: "adjective", desc: "Far off — distant music drifting across the water." },
  "muzyki": { en: "music", type: "noun", desc: "Organised sound — music from the surface world drifted down to her." },
  "turkotu": { en: "rumble / clatter", type: "noun", desc: "The rattling sound of wheels — the rumble of carriages on cobblestones." },
  "wozów": { en: "wagons / carriages", type: "noun", desc: "Horse-drawn vehicles — the sound of carriages clattering on roads." },
  "dzwonów": { en: "bells", type: "noun", desc: "Resonant metal instruments — the peal of church bells ringing." },
  "kościelnych": { en: "church / of the church", type: "adjective", desc: "Relating to a church — the bells of a church ringing across the water." },
  "milczała": { en: "was silent / said nothing", type: "verb", desc: "To be silent — the youngest said nothing, lost in her dreams." },
  "myśląc": { en: "thinking", type: "verb", desc: "In the act of thinking — she sat thinking about those distant cities." },
  "tych": { en: "those / these", type: "pronoun", desc: "Referring to things mentioned — those faraway cities she had heard of." },
  "zdawał": { en: "seemed", type: "verb", desc: "To appear or seem — the sound seemed to travel all the way to her." },
  "płynąć": { en: "to flow / to travel / to swim", type: "verb", desc: "To move through a medium — the distant sounds seemed to flow to her through the waves." },
  "fale": { en: "waves", type: "noun", desc: "Undulations in the water — the waves carried the sound of the surface world." },
  // Page 8
  "następnego": { en: "next / following", type: "adjective", desc: "The one that comes after — the following year, the second sister's turn came." },
  "roku": { en: "year", type: "noun", desc: "A 12-month period — the next year brought the second sister's birthday." },
  "druga": { en: "second", type: "adjective", desc: "Number two — the second of the six mermaid sisters." },
  "mogła": { en: "could / was able to", type: "verb", desc: "Having the ability — the second sister could finally surface." },
  "znowu": { en: "again / once more", type: "adverb", desc: "Once more — used here loosely as 'in turn' or 'as well'." },
  "wynurzyła": { en: "emerged / surfaced", type: "verb", desc: "To come up out of the water — she rose to the surface." },
  "chwili": { en: "moment", type: "noun", desc: "A brief point in time — just at the moment the sun was sinking." },
  "tonąć": { en: "to sink / to set", type: "verb", desc: "To go below the surface — the sun was sinking below the horizon." },
  "niebo": { en: "sky / heaven", type: "noun", desc: "The atmosphere above — the sky blazed with golden sunset colours." },
  "jaśniało": { en: "glowed / shone brightly", type: "verb", desc: "To shine or glow — the sky glowed like molten gold." },
  "złoto": { en: "gold", type: "noun", desc: "A precious yellow metal — the sky shone like liquid gold." },
  "roztopione": { en: "molten / melted", type: "adjective", desc: "Liquefied by heat — the sky shone like melted, flowing gold." },
  "złociste": { en: "golden", type: "adjective", desc: "The colour of gold — golden clouds drifted toward the sun." },
  "purpurowe": { en: "purple / crimson", type: "adjective", desc: "Deep red-purple — the clouds were golden and crimson in the sunset." },
  "obłoki": { en: "clouds", type: "noun", desc: "Masses of water vapour in the sky — lit golden and purple by the sunset." },
  "płynęły": { en: "floated / drifted", type: "verb", desc: "To move gently through — clouds drifted toward the setting sun." },
  "stronę": { en: "direction / side / toward", type: "noun", desc: "A direction — the clouds moved toward the setting sun." },
  "trzecia": { en: "third", type: "adjective", desc: "Number three — the third of the six mermaid sisters." },
  "odważniejsza": { en: "bolder / braver", type: "adjective", desc: "More courageous — the third sister was the boldest of those who had surfaced." },
  "popłynęła": { en: "swam / sailed off", type: "verb", desc: "To swim away toward a destination — she swam all the way to a great river." },
  "ujścia": { en: "mouth / estuary", type: "noun", desc: "The place where a river meets the sea — she swam into the river mouth." },
  "wielkiej": { en: "great / large", type: "adjective", desc: "Of great size — a great, broad river she followed upstream." },
  "rzeki": { en: "river", type: "noun", desc: "A large flowing body of fresh water — she swam all the way up a river." },
  "ujrzała": { en: "saw / beheld", type: "verb", desc: "To catch sight of — she saw green vineyards and hilltop castles." },
  "zielone": { en: "green", type: "adjective", desc: "The colour of grass and leaves — lush green vineyards along the riverbanks." },
  "winnice": { en: "vineyards", type: "noun", desc: "Fields where grapes are grown — green vineyards climbing the hillsides." },
  "zamki": { en: "castles", type: "noun", desc: "Fortified stone buildings — grand castles rising on the hills." },
  "spostrzegła": { en: "noticed / caught sight of", type: "verb", desc: "To suddenly notice something — she spotted a group of swimming children." },
  "gromadkę": { en: "little group / small bunch", type: "noun", desc: "A small group — a little group of children playing in the water." },
  "kąpiących": { en: "bathing / swimming", type: "verb", desc: "In the act of bathing — children splashing and swimming in the river." },
  "dzieci": { en: "children", type: "noun", desc: "Young human beings — the first humans she had ever seen up close." },
  "miały": { en: "had", type: "verb", desc: "To possess or have — the children had two legs for running." },
  "podpórki": { en: "supports / props", type: "noun", desc: "Things used for support — the mermaid's charming word for human legs." },
  "biegania": { en: "running", type: "noun", desc: "The act of running — human legs were built for running on land." },
  "zamiast": { en: "instead of", type: "preposition", desc: "In place of — instead of tails, humans have legs." },
  // Page 9
  "urodziny": { en: "birthday", type: "noun", desc: "The anniversary of birth — the fifth sister's birthday came in winter." },
  "piątej": { en: "fifth", type: "adjective", desc: "Number five — the fifth of the six mermaid sisters." },
  "przypadały": { en: "fell / occurred", type: "verb", desc: "To occur on a specific date — her birthday happened to fall in winter." },
  "zimie": { en: "winter", type: "noun", desc: "The coldest season — the fifth sister's special day came in winter." },
  "wychyliła": { en: "leaned out / poked her head out", type: "verb", desc: "To lean or extend outward — she poked her head above the waves." },
  "głowę": { en: "head", type: "noun", desc: "The part of the body above the neck — she lifted her head above the water." },
  "ujrzała": { en: "saw / beheld", type: "verb", desc: "To catch sight of — she saw the wintry green sea." },
  "zielone": { en: "green", type: "adjective", desc: "The colour of grass — the sea looked green in winter." },
  "perły": { en: "pearls", type: "noun", desc: "Precious round gems — the icebergs looked like pearls floating on the sea." },
  "pływały": { en: "were floating", type: "verb", desc: "To float on water — huge icebergs drifted across the winter sea." },
  "olbrzymie": { en: "enormous / giant", type: "adjective", desc: "Of immense size — the icebergs were gigantic." },
  "góry": { en: "mountains / large masses", type: "noun", desc: "Huge elevated masses — here the enormous mountains of ice." },
  "lodowe": { en: "of ice / icy", type: "adjective", desc: "Made of ice — the floating mountains of ice, the icebergs." },
  "większe": { en: "larger / bigger than", type: "adjective", desc: "Of greater size — larger than church towers." },
  "kościelne": { en: "church", type: "adjective", desc: "Relating to a church — the tall towers of churches." },
  "wieże": { en: "towers", type: "noun", desc: "Tall pointed structures — church towers, which the icebergs dwarfed." },
  "błyszczące": { en: "glittering / sparkling", type: "adjective", desc: "Shining in the light — the icebergs sparkled like diamonds in the sun." },
  "diamenty": { en: "diamonds", type: "noun", desc: "The hardest and most brilliant gemstones — the icebergs shone like them." },
  "usiadła": { en: "sat down", type: "verb", desc: "To take a seated position — she sat on the highest iceberg." },
  "najwyższej": { en: "highest / tallest", type: "adjective", desc: "The superlative of high — she chose the tallest iceberg to sit upon." },
  "skąd": { en: "from where / whence", type: "adverb", desc: "From which place — from the top she could see in all directions." },
  "spojrzeniem": { en: "with a glance / with her gaze", type: "noun", desc: "A look or gaze — she could take in the endless horizon with one look." },
  "objąć": { en: "to encompass / to take in", type: "verb", desc: "To take in a view — her eyes could encompass the endless horizon." },
  "przestrzeń": { en: "space / expanse", type: "noun", desc: "A vast open area — the endless expanse of the winter sea." },
  "bez": { en: "without", type: "preposition", desc: "Lacking — space without end, the infinite horizon." },
  "końca": { en: "end", type: "noun", desc: "A termination point — the endless, boundless sea stretched to no end." },
  "wiatr": { en: "wind", type: "noun", desc: "Moving air — the cold wind played with her golden hair." },
  "igrał": { en: "played / toyed / danced", type: "verb", desc: "To play or frolic — the wind playfully tossed her golden hair." },
  "długimi": { en: "long", type: "adjective", desc: "Extended in length — her long golden hair blew in the wind." },
  "złotymi": { en: "golden", type: "adjective", desc: "The colour of gold — her beautiful golden hair." },
  "włosami": { en: "hair", type: "noun", desc: "The hair on one's head — her golden hair streamed in the winter wind." },
  "strwożeni": { en: "frightened / alarmed", type: "adjective", desc: "Filled with fear — the sailors were afraid when they saw her." },
  "żeglarze": { en: "sailors / mariners", type: "noun", desc: "People who sail ships — the sailors on the winter sea." },
  "odwracali": { en: "turned away", type: "verb", desc: "To turn in another direction — the frightened sailors looked away." },
  "odpływali": { en: "sailed away", type: "verb", desc: "To sail away from — the sailors quickly steered their ships away." },
  "śpiesznie": { en: "hurriedly / hastily", type: "adverb", desc: "In a great hurry — the sailors fled away as quickly as they could." },
  "inną": { en: "another / different", type: "adjective", desc: "A different one — they sailed off in the opposite direction." },
  // Page 10
  "nadszedł": { en: "came / arrived", type: "verb", desc: "To arrive — the long-awaited day finally came." },
  "uroczysty": { en: "solemn / festive / ceremonial", type: "adjective", desc: "Marked by ceremony and importance — her special, celebratory birthday." },
  "dorosła": { en: "grown up / adult", type: "adjective", desc: "Fully grown — the grandmother declared she was now an adult." },
  "rzekła": { en: "said / spoke", type: "verb", desc: "To say — the grandmother spoke these words to her." },
  "możesz": { en: "you can / you may", type: "verb", desc: "To be allowed or able — now she was allowed to swim to the surface." },
  "górę": { en: "up / upward / above", type: "noun", desc: "An upward direction — she could finally swim up to the surface world." },
  "ale": { en: "but", type: "conjunction", desc: "A contrasting word — but first the grandmother needed to dress her properly." },
  "muszę": { en: "I must / I have to", type: "verb", desc: "To be obligated — the grandmother had to dress her correctly first." },
  "przedtem": { en: "beforehand / first", type: "adverb", desc: "Before doing something — she had to be dressed first." },
  "ubrać": { en: "to dress / to clothe", type: "verb", desc: "To put clothes or adornments on someone — she dressed the mermaid for her debut." },
  "odpowiednio": { en: "properly / appropriately", type: "adverb", desc: "In the correct manner — dressed as befits a princess." },
  "jesteś": { en: "you are", type: "verb", desc: "Second person present of 'to be' — you are a princess, after all." },
  "umieściła": { en: "placed / put", type: "verb", desc: "To set in a position — she placed the wreath on the mermaid's hair." },
  "złotych": { en: "golden", type: "adjective", desc: "Made of gold or golden coloured — her golden hair received the wreath." },
  "wieniec": { en: "wreath / garland", type: "noun", desc: "A circular decoration worn on the head — a wreath of lily petals and pearls." },
  "liliowy": { en: "lily / of lily", type: "adjective", desc: "Made of or resembling lily flowers — the wreath was shaped from lily petals." },
  "każdy": { en: "each / every", type: "pronoun", desc: "Each individual one — each petal of the wreath was a half-pearl." },
  "płatek": { en: "petal", type: "noun", desc: "A single petal of a flower — each petal of the wreath was half a great pearl." },
  "stanowiło": { en: "constituted / made up / was", type: "verb", desc: "To form or make up — each petal was actually half of a huge pearl." },
  "pół": { en: "half", type: "noun", desc: "One of two equal parts — half of a giant pearl formed each petal." },
  "perły": { en: "pearl", type: "noun", desc: "A precious gem from a shell — the wreath was made from huge pearls." },
  "olbrzymiej": { en: "enormous / giant", type: "adjective", desc: "Of immense size — enormous pearls were split to make the wreath." },
  "ogonie": { en: "on the tail", type: "noun", desc: "On the fish tail — the grandmother attached oysters to her tail." },
  "babka": { en: "grandmother", type: "noun", desc: "One's father's or mother's mother — here the old sea queen." },
  "przypięła": { en: "pinned / attached", type: "verb", desc: "To fasten with a pin or clip — she attached oysters to the mermaid's tail." },
  "osiem": { en: "eight", type: "noun", desc: "The number 8 — eight silvery oysters were attached as a mark of rank." },
  "srebrzystych": { en: "silvery", type: "adjective", desc: "Gleaming like silver — the silvery oysters shimmered on her tail." },
  "boli": { en: "hurts / it aches", type: "verb", desc: "To cause pain — the oysters pinched and hurt her tender tail." },
  "skarżyła": { en: "complained / moaned", type: "verb", desc: "To complain — she complained that the oysters were painful." },
  "mała": { en: "little one / small", type: "adjective", desc: "Small or young — the little mermaid, youngest and smallest." },
  // Page 11
  "zaszło": { en: "had set / had gone down", type: "verb", desc: "To set below the horizon — the sun had already set when she surfaced." },
  "kiedy": { en: "when", type: "conjunction", desc: "At the time that — when she poked her head above the waves." },
  "wychyliła": { en: "poked out / leaned out", type: "verb", desc: "To extend beyond something — she poked her head above the surface." },
  "fali": { en: "wave", type: "noun", desc: "A moving ridge of water — she surfaced amidst the waves." },
  "lecz": { en: "but / however", type: "conjunction", desc: "A contrasting conjunction — but then she saw a ship on the waves." },
  "oto": { en: "behold / here / look", type: "particle", desc: "A word drawing attention — 'and behold, there on the wave was a ship'." },
  "ujrzała": { en: "saw / beheld", type: "verb", desc: "To catch sight of — she caught sight of a beautiful three-masted ship." },
  "okręt": { en: "ship", type: "noun", desc: "A large sea vessel — a beautiful three-masted ship on the waves." },
  "piękny": { en: "beautiful / handsome", type: "adjective", desc: "Attractive and fine — the ship was described as beautiful." },
  "pokładzie": { en: "deck", type: "noun", desc: "The flat surface of a ship — the deck was full of people and lights." },
  "roiło": { en: "swarmed / teemed", type: "verb", desc: "To swarm with — the deck teemed with people celebrating." },
  "ludzi": { en: "people", type: "noun", desc: "Human beings — the ship's deck was crowded with celebrating people." },
  "muzyka": { en: "music", type: "noun", desc: "Organised sound — music played on the ship's deck." },
  "grała": { en: "played", type: "verb", desc: "To play music — the band was playing on the deck." },
  "setki": { en: "hundreds", type: "noun", desc: "Many hundreds — hundreds of coloured lights glittered in the darkness." },
  "kolorowych": { en: "coloured / colourful", type: "adjective", desc: "Of many colours — hundreds of coloured lights adorned the ship." },
  "świateł": { en: "lights", type: "noun", desc: "Sources of illumination — coloured lights lit up the ship." },
  "lśniły": { en: "gleamed / shone", type: "verb", desc: "To shine brightly — the lights gleamed in the darkness." },
  "ciemności": { en: "darkness", type: "noun", desc: "The absence of light — the lights shone brilliantly in the dark night." },
  "podpłynęła": { en: "swam up to / approached by swimming", type: "verb", desc: "To swim toward something — she swam to the cabin window." },
  "okna": { en: "window", type: "noun", desc: "An opening in a wall — she peered through the ship's cabin window." },
  "kajuty": { en: "cabin", type: "noun", desc: "A room on a ship — the prince's cabin on the ship." },
  "tutaj": { en: "here", type: "adverb", desc: "In this place — inside the cabin there were also many people." },
  "pełno": { en: "full / lots of", type: "adverb", desc: "A great many — the cabin was full of people." },
  "najpiękniejszy": { en: "most handsome / most beautiful", type: "adjective", desc: "The superlative of beautiful — the most handsome among them." },
  "młody": { en: "young", type: "adjective", desc: "Not old — the young prince." },
  "wielkich": { en: "large / great", type: "adjective", desc: "Of great size — the prince had large, beautiful dark eyes." },
  "czarnych": { en: "black / dark", type: "adjective", desc: "The colour black — his large, dark, expressive eyes." },
  "oczach": { en: "eyes", type: "noun", desc: "The organs of sight — the prince's striking dark eyes." },
  "więcej": { en: "more / older than", type: "adverb", desc: "More in number — he was no more than sixteen years old." },
  "szesnaście": { en: "sixteen", type: "noun", desc: "The number 16 — the prince was only sixteen years old." },
  "chciałaby": { en: "she would like / she wished", type: "verb", desc: "To wish or desire — how much she wished she could speak to him." },
  "przemówić": { en: "to speak / to address", type: "verb", desc: "To speak to someone — she longed to address him with her voice." },
  "ludzkim": { en: "human", type: "adjective", desc: "Relating to humans — she wished she had a human voice." },
  // Page 12
  "noc": { en: "night", type: "noun", desc: "The dark hours — the night passed as she watched." },
  "płynęła": { en: "flowed / passed", type: "verb", desc: "To flow or pass — the night flowed on." },
  "księżniczka": { en: "princess", type: "noun", desc: "A royal daughter — the little mermaid princess." },
  "oderwać": { en: "to tear away / to detach", type: "verb", desc: "To pull away from — she could not tear her eyes away from the prince." },
  "oczu": { en: "eyes", type: "noun", desc: "The organs of sight — she could not take her eyes off him." },
  "nagle": { en: "suddenly", type: "adverb", desc: "All at once — suddenly the wind began to blow harder." },
  "zaczął": { en: "began / started", type: "verb", desc: "To begin doing something — the wind began to blow more strongly." },
  "dąć": { en: "to blow (of wind)", type: "verb", desc: "Wind blowing — the wind started blowing harder and harder." },
  "silniej": { en: "more strongly / harder", type: "adverb", desc: "With greater force — the wind blew harder and harder." },
  "wzbierały": { en: "rose / swelled", type: "verb", desc: "To increase in size — the waves swelled and grew enormous." },
  "potężnie": { en: "powerfully / mightily", type: "adverb", desc: "With great force — the waves rose powerfully." },
  "idzie": { en: "is coming / approaches", type: "verb", desc: "To come or approach — the storm is coming!" },
  "mknie": { en: "races / speeds along", type: "verb", desc: "To move very fast — the ship sped faster and faster." },
  "coraz": { en: "increasingly / more and more", type: "adverb", desc: "Gradually more — the ship moved faster and faster before the storm." },
  "szybciej": { en: "faster", type: "adverb", desc: "At greater speed — ever faster in the storm." },
  "uderzały": { en: "struck / beat against", type: "verb", desc: "To hit something hard — the waves struck the sides of the ship." },
  "boki": { en: "sides", type: "noun", desc: "The sides of a vessel — the waves battered the ship's sides." },
  "statku": { en: "ship", type: "noun", desc: "A vessel for sailing — the ship was being battered by the storm." },
  "wściekłością": { en: "fury / rage", type: "noun", desc: "Violent anger or force — the waves struck with the fury of a monster." },
  "wreszcie": { en: "finally / at last", type: "adverb", desc: "After a long time — finally the great mast gave way." },
  "maszt": { en: "mast", type: "noun", desc: "A tall pole on a ship — the main mast snapped in the storm." },
  "wielki": { en: "great / large", type: "adjective", desc: "Of great size — the great main mast of the ship." },
  "padł": { en: "fell / collapsed", type: "verb", desc: "To fall down — the mast fell, snapped by the storm." },
  "złamany": { en: "broken / snapped", type: "adjective", desc: "Snapped or fractured — the mast broke like a reed." },
  "trzcina": { en: "reed / cane", type: "noun", desc: "A tall hollow grass that bends easily — the mast snapped like a brittle reed." },
  "pochylił": { en: "tilted / leaned", type: "verb", desc: "To tilt to one side — the ship tilted dangerously." },
  "bok": { en: "side", type: "noun", desc: "One side — the ship tilted to one side." },
  "wdarła": { en: "forced in / flooded in", type: "verb", desc: "To force entry — water poured into the ship." },
  "środka": { en: "inside / interior", type: "noun", desc: "The inside — water flooded into the ship's interior." },
  "chwila": { en: "moment / instant", type: "noun", desc: "A brief moment in time — just one more moment and it would sink." },
  "zatonie": { en: "will sink", type: "verb", desc: "To sink below the water — the ship was about to go under." },
  // Page 13
  "drży": { en: "trembles / shakes", type: "verb", desc: "To tremble — she trembled with fear for the prince's life." },
  "księcia": { en: "prince (genitive)", type: "noun", desc: "The prince — she trembled with fear for the prince." },
  "zanurzył": { en: "sank / submerged", type: "verb", desc: "To sink below the surface — the ship sank below the waves." },
  "rzuciła": { en: "threw herself / plunged", type: "verb", desc: "To throw or fling — she plunged into the waves." },
  "pomiędzy": { en: "between / among", type: "preposition", desc: "In the space between — she swam among the broken beams and masts." },
  "belki": { en: "beams / planks", type: "noun", desc: "Structural timbers — floating beams from the wrecked ship." },
  "odłamki": { en: "fragments / splinters", type: "noun", desc: "Broken pieces — fragments of shattered masts in the water." },
  "masztów": { en: "masts", type: "noun", desc: "The poles of a ship — broken pieces of the ship's masts." },
  "szuka": { en: "searches / looks for", type: "verb", desc: "To search — she searched desperately for him." },
  "zapałem": { en: "eagerness / zeal", type: "noun", desc: "Keen enthusiasm — she searched with frantic determination." },
  "zanurza": { en: "dives / submerges", type: "verb", desc: "To plunge into water — she dived below the surface to find him." },
  "odmęty": { en: "the depths / swirling waters", type: "noun", desc: "Dark turbulent depths — she dived into the dark swirling depths." },
  "spostrzega": { en: "notices / spots", type: "verb", desc: "To catch sight of — she spotted him just as he was sinking." },
  "bezsilny": { en: "powerless / helpless", type: "adjective", desc: "Without strength — he was helpless, unable to save himself." },
  "zapadał": { en: "was sinking / was falling", type: "verb", desc: "To sink down — he was sinking helplessly into the abyss." },
  "pochwyciła": { en: "seized / grabbed", type: "verb", desc: "To grab and hold — she seized him in her arms." },
  "ramiona": { en: "arms", type: "noun", desc: "The upper limbs — she held him in her arms." },
  "łagodnie": { en: "gently / softly", type: "adverb", desc: "With care and tenderness — she gently carried him upward." },
  "wyniosła": { en: "carried up / brought to surface", type: "verb", desc: "To carry upward — she bore him up to the surface." },
  "powierzchnię": { en: "surface", type: "noun", desc: "The top level — she brought him up to the sea surface." },
  "ranem": { en: "in the morning", type: "noun", desc: "In the early morning — by morning the storm had passed." },
  "burza": { en: "storm", type: "noun", desc: "A violent weather event — the storm had finally abated." },
  "ustąpiła": { en: "subsided / gave way", type: "verb", desc: "To lessen or stop — the storm calmed and died away." },
  "blask": { en: "glow / radiance", type: "noun", desc: "A bright shining light — the sunlight shone on the prince's face." },
  "padał": { en: "fell / shone down", type: "verb", desc: "To fall upon — the sunlight fell upon the prince's face." },
  "twarz": { en: "face", type: "noun", desc: "The front of the head — the sun shone on his pale face." },
  "pozostawały": { en: "remained", type: "verb", desc: "To stay in a state — his eyes remained closed." },
  "zamknięte": { en: "closed", type: "adjective", desc: "Shut — his eyes remained shut." },
  "czyżby": { en: "could it be that / had she not…", type: "particle", desc: "Expressing doubt — had she failed to save him after all?" },
  "ocaliła": { en: "had saved", type: "verb", desc: "To save from death or danger — had she saved him, or was it too late?" },
  // Page 14
  "złożyła": { en: "laid / placed", type: "verb", desc: "To lay something down — she laid his body on the warm sand." },
  "ciało": { en: "body", type: "noun", desc: "The physical body — she laid his unconscious body on the sand." },
  "młodzieńca": { en: "young man", type: "noun", desc: "A youth — the unconscious body of the young man." },
  "gorącym": { en: "hot / warm", type: "adjective", desc: "Heated — the warm, sun-heated sand of the bay." },
  "piasku": { en: "sand", type: "noun", desc: "Fine granules of rock — she laid him on the warm sand." },
  "bezpiecznej": { en: "safe", type: "adjective", desc: "Free from danger — a sheltered, safe bay." },
  "zatoki": { en: "bay / cove", type: "noun", desc: "A sheltered body of water — the prince was safe in the quiet bay." },
  "wkrótce": { en: "soon / shortly", type: "adverb", desc: "After a short time — soon a young girl found him on the shore." },
  "jedna": { en: "one / a certain one", type: "pronoun", desc: "One among many — one of the girls from a nearby house." },
  "dziewcząt": { en: "girls", type: "noun", desc: "Young females — young girls from a nearby building." },
  "pobliskiego": { en: "nearby / close", type: "adjective", desc: "Near in distance — from the nearby house or building." },
  "domu": { en: "house / home", type: "noun", desc: "A place of residence — the house near the bay." },
  "znalazła": { en: "found", type: "verb", desc: "To discover — a girl found the prince lying on the shore." },
  "brzegu": { en: "shore / bank", type: "noun", desc: "The edge of land by water — the prince lay on the shore." },
  "widziała": { en: "saw / watched", type: "verb", desc: "To see — the mermaid watched from the water." },
  "jak": { en: "how / as / like", type: "conjunction", desc: "In the manner that — she watched how the prince opened his eyes." },
  "książę": { en: "prince", type: "noun", desc: "A royal title — the prince finally opened his eyes." },
  "otworzył": { en: "opened", type: "verb", desc: "To open — the prince opened his eyes at last." },
  "uśmiechnął": { en: "smiled", type: "verb", desc: "To smile — he smiled at the girl who had found him." },
  "wybawców": { en: "saviours / rescuers", type: "noun", desc: "Those who rescue — he smiled at those he thought had saved him." },
  "wiedział": { en: "knew", type: "verb", desc: "To know — he did not know it was the mermaid who had saved him." },
  "ocaliła": { en: "had saved", type: "verb", desc: "To have saved — the mermaid had saved his life." },
  "życie": { en: "life", type: "noun", desc: "The state of being alive — the mermaid had saved his life." },
  "smutna": { en: "sad", type: "adjective", desc: "Feeling sorrow — the sad mermaid returned to the sea." },
  "zanurzyła": { en: "sank / submerged", type: "verb", desc: "To go below the surface — she slipped back beneath the waves." },
  "odąd": { en: "from then on", type: "adverb", desc: "From that point — from then on she was always quiet and pensive." },
  "bywała": { en: "was / used to be", type: "verb", desc: "To tend to be — she was always quiet after that." },
  "cicha": { en: "quiet / silent", type: "adjective", desc: "Making no noise — she became even quieter than before." },
  "zamyślona": { en: "pensive / lost in thought", type: "adjective", desc: "Lost in one's thoughts — she was always lost in thought." },
  "często": { en: "often", type: "adverb", desc: "Frequently — she often returned to that spot." },
  "powracając": { en: "returning", type: "verb", desc: "To come back — she kept returning to the shore." },
  "miejscu": { en: "place", type: "noun", desc: "A location — she kept returning to that place." },
  "patrzeć": { en: "to look / to gaze", type: "verb", desc: "To look at — to gaze at the land she could not reach." },
  "ląd": { en: "land / shore", type: "noun", desc: "Solid ground — the human world on the land." },
  "nigdzie": { en: "nowhere", type: "adverb", desc: "In no place — she saw him nowhere; he was never there." },
  // Pages 15-20 common words
  "zwierzyła": { en: "confided / told a secret", type: "verb", desc: "To share a secret — she finally confided in one of her sisters." },
  "jednej": { en: "one (of them)", type: "pronoun", desc: "One among a group — one of her sisters." },
  "sióstr": { en: "sisters", type: "noun", desc: "Female siblings — she told one of her sisters her secret." },
  "pokazała": { en: "showed", type: "verb", desc: "To point out or show — a sister showed her where the prince's kingdom was." },
  "leży": { en: "lies / is located", type: "verb", desc: "To be situated — where the prince's kingdom lay." },
  "państwo": { en: "kingdom / state / country", type: "noun", desc: "A nation or kingdom — the prince's realm and his palace." },
  "jasnych": { en: "bright / light", type: "adjective", desc: "Shining or pale — the palace was built of bright, shining stones." },
  "błyszczących": { en: "gleaming / sparkling", type: "adjective", desc: "Catching the light — the bright gleaming stones of the palace." },
  "kamieni": { en: "stones", type: "noun", desc: "Pieces of rock — the palace was built of beautiful shining stones." },
  "marmurowymi": { en: "marble", type: "adjective", desc: "Made of marble — smooth marble steps leading down to the sea." },
  "schodami": { en: "stairs / steps", type: "noun", desc: "A series of steps — marble steps leading down to the water." },
  "prowadzącymi": { en: "leading / going", type: "verb", desc: "Extending toward a place — the steps led down to the sea." },
  "odtąd": { en: "from then on", type: "adverb", desc: "From that moment — from then on she knew where he lived." },
  "mieszka": { en: "lives / resides", type: "verb", desc: "To live somewhere — where her prince lived." },
  "przypływała": { en: "swam / used to swim there", type: "verb", desc: "To swim to a place repeatedly — she swam to his palace every night." },
  "siadając": { en: "sitting down / settling", type: "verb", desc: "To sit — she settled beneath his balcony window." },
  "balkonu": { en: "balcony", type: "noun", desc: "An elevated platform on a building — she sat below his balcony." },
  "słyszała": { en: "heard", type: "verb", desc: "To hear — she listened to conversations." },
  "rozmowy": { en: "conversations", type: "noun", desc: "Spoken exchanges — the conversations of fishermen." },
  "rybaków": { en: "fishermen", type: "noun", desc: "People who fish — the fishermen who talked about the prince." },
  "którzy": { en: "who / which (masculine plural)", type: "pronoun", desc: "Referring to people — the fishermen who praised the prince's goodness." },
  "chwalili": { en: "praised", type: "verb", desc: "To speak highly of — the fishermen praised the prince." },
  "dobroć": { en: "goodness / kindness", type: "noun", desc: "The quality of being good — the prince was known for his kindness." },
  "drżało": { en: "trembled / quivered", type: "verb", desc: "To tremble — her heart trembled with joy." },
  "radości": { en: "joy / happiness", type: "noun", desc: "A feeling of great pleasure — her heart trembled with joy." },
  "uratowała": { en: "had saved / rescued", type: "verb", desc: "To rescue from danger — she was glad she had saved such a good man." },
  "dobrego": { en: "good", type: "adjective", desc: "Having good qualities — such a good, kind man." },
  "człowieka": { en: "man / human being", type: "noun", desc: "A human person — she was glad to have saved such a good man." },
  // Pages 16-20
  "spytała": { en: "asked", type: "verb", desc: "To ask a question — the mermaid asked her grandmother." },
  "babkę": { en: "grandmother (accusative)", type: "noun", desc: "The grandmother — she asked her grandmother a question." },
  "ludzie": { en: "people / humans", type: "noun", desc: "Human beings — do humans live forever?" },
  "wiecznie": { en: "forever / eternally", type: "adverb", desc: "For all time — do humans live forever?" },
  "żyją": { en: "live / are living", type: "verb", desc: "To be alive — she wanted to know if humans live forever." },
  "odrzekła": { en: "answered / replied", type: "verb", desc: "To answer — the grandmother replied to her question." },
  "umierają": { en: "die / are dying", type: "verb", desc: "To cease living — yes, humans die too, the grandmother said." },
  "także": { en: "also / too / as well", type: "adverb", desc: "Additionally — humans also die, though sooner than mermaids." },
  "życie": { en: "life", type: "noun", desc: "The state of being alive — human life is shorter than mermaid life." },
  "krótsze": { en: "shorter", type: "adjective", desc: "Of less duration — human life is shorter than a mermaid's." },
  "nasze": { en: "our / ours", type: "pronoun", desc: "Belonging to us — our lives, the mermaids' lives." },
  "żyjemy": { en: "we live", type: "verb", desc: "First person plural present — we live for three hundred years." },
  "trzysta": { en: "three hundred", type: "noun", desc: "The number 300 — mermaids live for three hundred years." },
  "potem": { en: "then / afterwards", type: "adverb", desc: "After that — then they turn into sea foam." },
  "zmieniamy": { en: "we change / we turn into", type: "verb", desc: "To transform — mermaids become sea foam when they die." },
  "pianę": { en: "foam", type: "noun", desc: "Frothy bubbles on water — the mermaids turn into sea foam at death." },
  "morską": { en: "of the sea / marine", type: "adjective", desc: "Belonging to the sea — the sea foam they turn into." },
  "mamy": { en: "we have", type: "verb", desc: "To possess — we mermaids do not have immortal souls." },
  "dlaczego": { en: "why", type: "adverb", desc: "For what reason — why do we not have a soul?" },
  "smutno": { en: "sadly / with sadness", type: "adverb", desc: "In a sad manner — she asked sadly." },
  "oddałabym": { en: "I would give up / I would trade", type: "verb", desc: "To be willing to give something away — she would trade her long life." },
  "setki": { en: "hundreds", type: "noun", desc: "Many hundreds — hundreds of years of life." },
  "choć": { en: "even if / although", type: "conjunction", desc: "Even if — even if only for one single day." },
  "jeden": { en: "one", type: "adjective", desc: "The number one — just one day as a human." },
  "dzień": { en: "day", type: "noun", desc: "A 24-hour period — just one day of human life." },
  "być": { en: "to be", type: "verb", desc: "The infinitive of being — to be a human, even for one day." },
  "człowiekiem": { en: "a human being / a person", type: "noun", desc: "A member of the human race — she longed to be human." },
  "wiedzieć": { en: "to know", type: "verb", desc: "To have knowledge — to know that she would live forever after death." },
  "śmierci": { en: "death", type: "noun", desc: "The end of life — after death, humans may live forever." },
  "żyć": { en: "to live", type: "verb", desc: "To be alive — to live forever in a new world." },
  "wiecznie": { en: "forever / eternally", type: "adverb", desc: "Without end — to live eternally in the next world." },
  "nowym": { en: "new", type: "adjective", desc: "Not existing before — a new world after death." },
  "świecie": { en: "world", type: "noun", desc: "The earth or a realm — a new world after this one." },
  "sposobu": { en: "way / method", type: "noun", desc: "A means of doing something — is there any way to get a soul?" },
  "ażebym": { en: "in order that I / so that I", type: "conjunction", desc: "So that I might — so that she could obtain a soul." },
  "zdobyła": { en: "obtained / won", type: "verb", desc: "To acquire or gain — to obtain an immortal soul." },
  "chyba": { en: "unless / I suppose", type: "particle", desc: "An expression of exception or uncertainty — unless a human loved her." },
  "gdyby": { en: "if / were it to happen that", type: "conjunction", desc: "Expressing a hypothetical — if a human were to love her." },
  "człowiek": { en: "human / a person", type: "noun", desc: "A human being — if a person were to love her completely." },
  "ukochał": { en: "loved / came to love", type: "verb", desc: "To love deeply — if he loved her more than anyone." },
  "ojca": { en: "father", type: "noun", desc: "One's male parent — more than father and mother." },
  "matkę": { en: "mother", type: "noun", desc: "One's female parent — more than father and mother." },
  "ksiądz": { en: "priest", type: "noun", desc: "A Christian clergyman — a priest would join their hands in marriage." },
  "związałby": { en: "would bind / would join", type: "verb", desc: "To tie or join — if a priest joined their hands in marriage." },
  "ręce": { en: "hands", type: "noun", desc: "The hands — a priest would join their hands in the marriage ceremony." },
  "połowa": { en: "half", type: "noun", desc: "One of two equal parts — half of his soul would flow into her." },
  "przeniknęłaby": { en: "would flow into / would penetrate", type: "verb", desc: "To pass into or through — half his soul would enter into her." },
  "westchnęła": { en: "sighed", type: "verb", desc: "To breathe out slowly — she sighed sadly." },
  "smutkiem": { en: "sadness / sorrow", type: "noun", desc: "A feeling of unhappiness — she sighed with sadness." },
  "patrząc": { en: "looking / gazing", type: "verb", desc: "In the act of looking — she looked sadly at her shimmering tail." },
  "swój": { en: "her own", type: "pronoun", desc: "Belonging to the subject — her own beautiful tail." },
  "srebrzysty": { en: "silvery", type: "adjective", desc: "Gleaming like silver — her silver-gleaming tail." },
  "dosyć": { en: "enough", type: "adverb", desc: "Sufficient — three hundred years is enough to be satisfied." },
  "dodała": { en: "added / said further", type: "verb", desc: "To add something to what was said — the grandmother continued." },
  "póki": { en: "while / as long as", type: "conjunction", desc: "During the time that — as long as we are alive, let us enjoy it." },
  "bawmy": { en: "let us enjoy / let us have fun", type: "verb", desc: "To enjoy oneself — let us be merry while we live." },
  "wesoło": { en: "merrily / happily", type: "adverb", desc: "In a merry way — let us live merrily." },
  "dzisiaj": { en: "today", type: "adverb", desc: "On this day — today there will be a ball at the palace." },
  "odbędzie": { en: "will take place / will be held", type: "verb", desc: "To take place — the ball will take place today." },
  "bal": { en: "ball / grand dance", type: "noun", desc: "A formal dance event — a grand court ball at the palace." },
  "dworski": { en: "court / courtly", type: "adjective", desc: "Relating to a royal court — a formal ball at the royal court." },
  "postanowiła": { en: "decided / resolved", type: "verb", desc: "To make a decision — she decided to go to the sea witch." },
  "udać": { en: "to go / to betake oneself", type: "verb", desc: "To make one's way somewhere — to go to the sea witch." },
  "morskiej": { en: "of the sea / sea", type: "adjective", desc: "Belonging to the sea — the sea witch who lived in the depths." },
  "droga": { en: "road / way / journey", type: "noun", desc: "A path or route — the journey to the witch was terrifying." },
  "straszna": { en: "terrible / terrifying", type: "adjective", desc: "Causing terror — the path to the witch was horrible." },
  "wiry": { en: "whirlpools / eddies", type: "noun", desc: "Spinning currents of water — dangerous whirlpools along the way." },
  "ryczące": { en: "roaring", type: "adjective", desc: "Making a loud roaring noise — the roaring whirlpools." },
  "gorące": { en: "hot", type: "adjective", desc: "High in temperature — hot mud bubbled along the path." },
  "błoto": { en: "mud / slime", type: "noun", desc: "Wet, thick earth — hot, oozing mud on the path to the witch." },
  "mieszkała": { en: "lived", type: "verb", desc: "To reside — the witch lived among a forest of sea polyps." },
  "lasu": { en: "forest", type: "noun", desc: "A dense grouping — a forest of sea polyps." },
  "polipów": { en: "polyps / sea anemones", type: "noun", desc: "Sea creatures with tentacles — the witch lived among dangerous polyps." },
  "chwytały": { en: "grabbed / seized", type: "verb", desc: "To seize with a grip — the polyps grabbed everything that passed by." },
  "przepływało": { en: "swam past / passed by", type: "verb", desc: "To swim past — everything that swam by was seized." },
  "obok": { en: "past / beside", type: "adverb", desc: "To the side of or past something — past the polyps." },
  "przychodzisz": { en: "you come / you are coming", type: "verb", desc: "To come — 'I know why you come to me.'" },
  "chcesz": { en: "you want", type: "verb", desc: "To want — 'you want to be rid of your tail.'" },
  "pozbyć": { en: "to get rid of", type: "verb", desc: "To rid oneself of something — she wanted to be rid of her tail." },
  "podpórki": { en: "supports / props (legs)", type: "noun", desc: "The mermaid's word for human legs — two supports for walking." },
  "pokochał": { en: "would love / came to love", type: "verb", desc: "To fall in love — so the young prince would love her." },
  "nierozsądne": { en: "unwise / foolish", type: "adjective", desc: "Lacking good sense — the witch said it was very foolish." },
  "pomogę": { en: "I will help", type: "verb", desc: "To help someone — but despite that, the witch will help her." },
  "przygotuję": { en: "I will prepare", type: "verb", desc: "To make ready — the witch will prepare the magic potion." },
  "napój": { en: "drink / potion", type: "noun", desc: "A liquid to drink — the witch's magic potion." },
  "musisz": { en: "you must", type: "verb", desc: "To be obligated — you must drink it on the shore." },
  "wypić": { en: "to drink (up)", type: "verb", desc: "To consume a liquid — she must drink the potion on land." },
  "brzegu": { en: "shore / bank", type: "noun", desc: "The edge of land by water — drink it on the shore." },
  "zmieni": { en: "will change / will transform", type: "verb", desc: "To alter — her tail will change into legs." },
  "nogi": { en: "legs", type: "noun", desc: "The limbs for walking — her tail will become human legs." },
  "krok": { en: "step", type: "noun", desc: "A single step in walking — every step will be painful." },
  "sprawiał": { en: "caused / gave", type: "verb", desc: "To cause something — every step will cause her terrible pain." },
  "ból": { en: "pain", type: "noun", desc: "Physical suffering — every step will cause great pain." },
  "jakbyś": { en: "as if you were", type: "conjunction", desc: "As though — as if she were walking on sharp knives." },
  "stąpała": { en: "stepped / trod", type: "verb", desc: "To walk or step — walking on the sharpest of knives." },
  "ostrych": { en: "sharp", type: "adjective", desc: "Having a keen edge — sharp as the sharpest knives." },
  "nożach": { en: "knives", type: "noun", desc: "Sharp cutting tools — walking on knives was the price of legs." },
  "ożeni": { en: "marries", type: "verb", desc: "To marry — if the prince marries another woman." },
  "inną": { en: "another / different", type: "adjective", desc: "A different one — if he marries another woman." },
  "staniesz": { en: "you will become", type: "verb", desc: "To become — you will become sea foam." },
  "pianą": { en: "foam", type: "noun", desc: "Frothy water bubbles — you will dissolve into sea foam." },
  "zgadzam": { en: "I agree", type: "verb", desc: "To give agreement — she agreed to the witch's terms." },
  "rzekła": { en: "said", type: "verb", desc: "To say — she said, though she was pale as death." },
  "choć": { en: "although / even though", type: "conjunction", desc: "Despite the fact that — although she was as pale as death." },
  "blada": { en: "pale", type: "adjective", desc: "Having little colour in the face — pale with fear and resolve." },
  "śmierć": { en: "death", type: "noun", desc: "The end of life — she was as pale as death itself." },
  "zapłatą": { en: "payment / price", type: "noun", desc: "What is paid — the payment will be her voice." },
  "będzie": { en: "will be", type: "verb", desc: "Future tense of 'to be' — the price will be her voice." },
  "twój": { en: "your", type: "pronoun", desc: "Belonging to you — your voice, your beautiful voice." },
  "najpiękniejszy": { en: "most beautiful", type: "adjective", desc: "The superlative of beautiful — the most beautiful voice in the sea." },
  "całym": { en: "entire / whole", type: "adjective", desc: "All of — in the entire sea, her voice was the most beautiful." },
  "odetnę": { en: "I will cut off", type: "verb", desc: "To cut off — the witch will cut out her tongue." },
  "język": { en: "tongue / language", type: "noun", desc: "The organ of speech — the witch will cut out her tongue." },
  "wypiła": { en: "drank", type: "verb", desc: "To consume a drink — she drank the potion on the palace steps." },
  "schodach": { en: "on the steps / stairs", type: "noun", desc: "The steps of the palace — she drank it sitting on the marble steps." },
  "zemdlała": { en: "fainted", type: "verb", desc: "To lose consciousness — she fainted from the pain." },
  "obudziła": { en: "woke up", type: "verb", desc: "To wake from sleep — when she awoke, the prince was beside her." },
  "stał": { en: "stood", type: "verb", desc: "To stand — the prince was standing over her." },
  "miała": { en: "had", type: "verb", desc: "To possess — she no longer had a tail, but two white legs." },
  "już": { en: "already / no longer", type: "adverb", desc: "By now — she no longer had a tail." },
  "białe": { en: "white", type: "adjective", desc: "The colour of snow — two white, beautiful human legs." },
  "spytał": { en: "asked", type: "verb", desc: "To ask a question — the prince asked who she was." },
  "kim": { en: "who (asking about identity)", type: "pronoun", desc: "Asking about a person's identity — who are you?" },
  "lecz": { en: "but", type: "conjunction", desc: "A contrast — but she could not say a word." },
  "mogła": { en: "could", type: "verb", desc: "To be able — she could not utter a word." },
  "wymówić": { en: "to utter / to pronounce", type: "verb", desc: "To speak a word — she could not say a single word." },
  "ani": { en: "not even / nor", type: "conjunction", desc: "Not even — not even a single word." },
  "słowa": { en: "word", type: "noun", desc: "A unit of language — not a single word could she speak." },
  "wziął": { en: "took", type: "verb", desc: "To take — the prince took her hand." },
  "rękę": { en: "hand", type: "noun", desc: "The hand — he took her by the hand." },
  "wprowadził": { en: "led in / brought inside", type: "verb", desc: "To lead someone in — he led her into the palace." },
  "krok": { en: "step", type: "noun", desc: "A single footstep — every step caused her terrible pain." },
  "sprawiał": { en: "caused", type: "verb", desc: "To cause — every step caused indescribable pain." },
  "nieopisany": { en: "indescribable", type: "adjective", desc: "Too great to describe — indescribable pain with every step." },
  "lekko": { en: "lightly / gracefully", type: "adverb", desc: "Without heaviness — yet she moved lightly and gracefully." },
  "bańka": { en: "bubble", type: "noun", desc: "A fragile sphere of soapy water — she moved light as a soap bubble." },
  "mydlana": { en: "soapy / of soap", type: "adjective", desc: "Made of soap — a soap bubble, fragile and light." },
  "wszyscy": { en: "everyone / all", type: "pronoun", desc: "Each and every person — everyone admired her." },
  "dziwili": { en: "marvelled / were astonished", type: "verb", desc: "To be astonished — they all marvelled at her grace." },
  "wdziękowi": { en: "grace / charm", type: "noun", desc: "Beautiful movement — everyone admired her extraordinary grace." },
  "smutnym": { en: "sad", type: "adjective", desc: "Filled with sadness — her beautiful but sad blue eyes." },
};

const XP_PER_WORD = 10;
const XP_PER_PAGE = 50;
const COMBO_WINDOW_MS = 4000;
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000];
const LEVEL_TITLES = ["Nowicjusz", "Uczeń", "Czytelnik", "Słuchacz", "Znawca", "Mistrz", "Ekspert", "Erudyta", "Mędrzec", "Legenda"];

function getLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}
function getLevelProgress(xp) {
  const level = getLevel(xp);
  if (level >= LEVEL_TITLES.length - 1) return 100;
  const start = LEVEL_THRESHOLDS[level];
  const end = LEVEL_THRESHOLDS[level + 1];
  return Math.round(((xp - start) / (end - start)) * 100);
}
function cleanWord(str) {
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"""«»—]/g, "").toLowerCase().trim();
}

// Look up a word in our comprehensive dictionary (vocabulary + full dictionary)
function lookupWord(clean, story) {
  if (story.vocabulary[clean]) return { pl: clean, ...story.vocabulary[clean] };
  if (POLISH_DICTIONARY[clean]) return { pl: clean, ...POLISH_DICTIONARY[clean] };
  return null;
}

// ── Floating XP Particles ─────────────────────────────────────────────────────
function FloatingXP({ items }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}>
      {items.map(item => (
        <div key={item.id} style={{
          position: "fixed", left: item.x, top: item.y,
          transform: "translateX(-50%)",
          fontFamily: "'DM Serif Display', serif",
          fontWeight: 700,
          fontSize: item.combo > 2 ? "1.6rem" : "1.1rem",
          color: item.combo > 4 ? "#ef4444" : item.combo > 2 ? "#f59e0b" : "#818cf8",
          textShadow: "0 0 30px currentColor",
          animation: "floatUp 1.4s ease-out forwards",
          whiteSpace: "nowrap",
          letterSpacing: "-0.02em",
          pointerEvents: "none",
        }}>
          {item.combo > 2 ? `🔥 ×${item.combo}  ${item.text}` : item.text}
        </div>
      ))}
    </div>
  );
}

// ── Milestone Banner ──────────────────────────────────────────────────────────
function MilestoneBanner({ milestone, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <div style={{
        padding: "2rem 3rem",
        background: "linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%)",
        borderRadius: "2rem",
        border: "1px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 0 80px rgba(99,102,241,0.6), 0 40px 80px rgba(0,0,0,0.6)",
        animation: "milestoneIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{milestone.emoji}</div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "0.4rem" }}>Achievement Unlocked</div>
        <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>{milestone.title}</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginTop: "0.3rem" }}>{milestone.desc}</div>
      </div>
    </div>
  );
}

// ── Quick Definition Bubble ───────────────────────────────────────────────────
function QuickBubble({ word, onExpand, onClose, position }) {
  return (
    <div style={{
      position: "fixed",
      left: Math.min(position.x, window.innerWidth - 260),
      top: position.y - 80,
      zIndex: 3000,
      background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
      border: "1px solid rgba(99,102,241,0.5)",
      borderRadius: "1.25rem",
      padding: "0.9rem 1.1rem",
      minWidth: 200,
      maxWidth: 250,
      boxShadow: "0 0 40px rgba(99,102,241,0.3), 0 20px 40px rgba(0,0,0,0.5)",
      animation: "bubbleIn 0.18s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ color: "#c7d2fe", fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", fontStyle: "italic", fontWeight: 700 }}>
          {cleanWord(word.pl)}
        </span>
        <span style={{ padding: "2px 8px", background: "rgba(99,102,241,0.2)", borderRadius: 6, color: "#818cf8", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {word.type}
        </span>
      </div>
      <p style={{ color: "#f1f5f9", fontSize: "0.95rem", fontWeight: 600, margin: "0 0 0.65rem", lineHeight: 1.4 }}>
        {word.en}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onExpand} style={{
          flex: 1, padding: "0.45rem 0.75rem",
          background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: "0.75rem", color: "#a5b4fc", fontSize: "0.65rem", fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
        }}>More ›</button>
        <button onClick={onClose} style={{
          padding: "0.45rem 0.75rem",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.75rem", color: "#64748b", fontSize: "0.65rem", fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
        }}>✕</button>
      </div>
      <div style={{
        position: "absolute", bottom: -8, left: 24,
        width: 16, height: 8,
        background: "#1e1b4b",
        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
      }} />
    </div>
  );
}

// ── Full Word Card Modal ──────────────────────────────────────────────────────
function WordCard({ word, onClose, onSave, isSaved, onSpeak, isLoading }) {
  const [tab, setTab] = useState("meaning");
  const [pronouncing, setPronouncing] = useState(false);

  const handleSpeak = (text) => {
    setPronouncing(true);
    onSpeak(text);
    setTimeout(() => setPronouncing(false), 1200);
  };

  const exampleSentences = {
    noun: ["To jest {word}.", "Widzę {word}.", "To piękny {word}."],
    verb: ["Ja {word}.", "On {word} każdego dnia.", "My {word} razem."],
    adjective: ["{word} jest piękny.", "To bardzo {word} miejsce.", "Jak {word}!"],
  };
  const examples = (exampleSentences[word.type] || exampleSentences.noun).map(s => s.replace("{word}", cleanWord(word.pl)));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 4000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "1rem" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.88)", backdropFilter: "blur(20px)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 540,
        background: "linear-gradient(165deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
        border: "1px solid rgba(99,102,241,0.35)",
        borderRadius: "2.25rem 2.25rem 1.5rem 1.5rem",
        padding: "2rem",
        boxShadow: "0 -4px 60px rgba(99,102,241,0.2), 0 40px 80px rgba(0,0,0,0.7)",
        animation: "sheetUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ width: 48, height: 5, background: "rgba(255,255,255,0.12)", borderRadius: 9999, margin: "0 auto 1.75rem" }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.2rem,8vw,3.2rem)", fontWeight: 900, fontStyle: "italic", color: "#fff", margin: 0, lineHeight: 1, letterSpacing: "-0.03em" }}>
                {isLoading ? "..." : cleanWord(word.pl)}
              </h2>
              <span style={{ padding: "3px 10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#818cf8" }}>
                {word.type}
              </span>
            </div>
            <p style={{ color: "rgba(148,163,184,0.5)", fontSize: "0.7rem", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Słowo polskie</p>
          </div>
          <button onClick={() => handleSpeak(word.pl)} style={{
            width: 58, height: 58, borderRadius: "1.1rem", flexShrink: 0,
            background: pronouncing ? "linear-gradient(135deg, #6366f1, #ec4899)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: pronouncing ? "0 0 30px rgba(99,102,241,0.8)" : "0 8px 24px rgba(99,102,241,0.4)",
            transition: "all 0.2s",
            transform: pronouncing ? "scale(0.92)" : "scale(1)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
          </button>
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: "1.1rem", padding: 4, marginBottom: "1.25rem" }}>
          {[["meaning", "📖 Znaczenie"], ["examples", "✏️ Przykłady"], ["tips", "💡 Zapamiętaj"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "0.55rem 0", border: "none", cursor: "pointer",
              borderRadius: "0.8rem",
              background: tab === key ? "rgba(99,102,241,0.28)" : "transparent",
              color: tab === key ? "#c7d2fe" : "rgba(148,163,184,0.5)",
              fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ minHeight: 120, marginBottom: "1.25rem" }}>
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1.25rem" }}>
              <div style={{ width: 24, height: 24, border: "3px solid rgba(99,102,241,0.3)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "#475569", fontSize: "0.85rem" }}>Fetching definition…</span>
            </div>
          ) : tab === "meaning" ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1.25rem", padding: "1.25rem" }}>
              <p style={{ color: "rgba(129,140,248,0.7)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 0.4rem" }}>English</p>
              <p style={{ color: "#f1f5f9", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.9rem", lineHeight: 1.35 }}>{word.en}</p>
              {word.desc && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.75rem 0" }} />
                  <p style={{ color: "rgba(148,163,184,0.65)", fontSize: "0.85rem", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>{word.desc}</p>
                </>
              )}
            </div>
          ) : tab === "examples" ? (
            <div>
              {examples.slice(0, 3).map((ex, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "1rem", padding: "0.85rem 1rem", marginBottom: 8,
                }}>
                  <span style={{ color: "#6366f1", fontSize: "0.7rem", fontWeight: 900, minWidth: 20 }}>{i + 1}.</span>
                  <p style={{ color: "#e2e8f0", margin: 0, fontSize: "0.95rem", fontStyle: "italic", fontFamily: "'DM Serif Display', serif", flex: 1 }}>{ex}</p>
                  <button onClick={() => handleSpeak(ex)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(99,102,241,0.5)", padding: 4, flexShrink: 0, transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#818cf8"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(99,102,241,0.5)"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "1.25rem", padding: "1.25rem" }}>
              <p style={{ color: "#a5b4fc", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 0.75rem" }}>Mnemonic tip</p>
              <p style={{ color: "#e2e8f0", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: "#c7d2fe" }}>{cleanWord(word.pl)}</strong> → <strong style={{ color: "#86efac" }}>{word.en}</strong>.{" "}
                {word.desc || "Try saying it aloud three times while picturing the meaning."}
              </p>
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem" }}>🎯</span>
                <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "0.78rem", margin: 0, lineHeight: 1.5 }}>
                  Click the speaker to hear it pronounced correctly. Repeat 3× to remember.
                </p>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { onSave(); }} disabled={isSaved} style={{
            flex: 1, padding: "0.95rem", borderRadius: "1.1rem",
            cursor: isSaved ? "default" : "pointer",
            border: `1px solid ${isSaved ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.1)"}`,
            background: isSaved ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
            color: isSaved ? "#6ee7b7" : "#94a3b8",
            fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
            transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {isSaved ? "✓ Saved" : "+ Save Card"}
          </button>
          <button onClick={onClose} style={{
            flex: 1.4, padding: "0.95rem", borderRadius: "1.1rem", cursor: "pointer",
            border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
            fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          }}>Continue Reading ›</button>
        </div>
      </div>
    </div>
  );
}

// ── Flashcard Review ──────────────────────────────────────────────────────────
function FlashcardReview({ cards, onClose, onMastered, onSpeak }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [score, setScore] = useState({ known: 0, learning: 0 });

  if (cards.length === 0) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}>🌊</div>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: "2.2rem", fontStyle: "italic", marginBottom: 8 }}>Deck Empty</h3>
        <p style={{ color: "#475569", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.6 }}>Save words while reading to build your vocabulary deck. Tap any word to start.</p>
        <button onClick={onClose} style={{ padding: "0.9rem 2.5rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "1rem", cursor: "pointer", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Back to Story</button>
      </div>
    </div>
  );

  const card = cards[idx];
  const handleMaster = () => {
    setExiting(true);
    setScore(s => ({ ...s, known: s.known + 1 }));
    setTimeout(() => { onMastered(card.id); setIdx(i => Math.min(i, cards.length - 2)); setFlipped(false); setExiting(false); }, 320);
  };
  const next = () => { setIdx(i => (i + 1) % cards.length); setFlipped(false); };
  const prev = () => { setIdx(i => (i - 1 + cards.length) % cards.length); setFlipped(false); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p style={{ color: "#6366f1", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", margin: "0 0 2px" }}>Flashcard Review</p>
          <p style={{ color: "#334155", fontSize: "0.75rem", margin: 0, fontWeight: 600 }}>{idx + 1} / {cards.length} words</p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ color: "#6ee7b7", fontSize: "0.75rem", fontWeight: 800 }}>✓ {score.known} mastered</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Close ✕</button>
        </div>
      </div>
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.04)" }}>
        <div style={{ height: "100%", width: `${((idx + 1) / cards.length) * 100}%`, background: "linear-gradient(90deg,#6366f1,#a78bfa)", transition: "width 0.4s ease" }} />
      </div>
      <div style={{
        width: "100%", maxWidth: 420, perspective: "1200px",
        marginBottom: "2rem", cursor: "pointer",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(0.9) translateY(-20px)" : "scale(1)",
        transition: "all 0.3s ease",
      }} onClick={() => setFlipped(!flipped)}>
        <div style={{
          position: "relative", height: 280,
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "2rem",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem",
          }}>
            <p style={{ color: "rgba(99,102,241,0.5)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "1rem" }}>Polish</p>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: "2.8rem", fontStyle: "italic", fontWeight: 900, margin: "0 0 1.5rem", textAlign: "center" }}>{cleanWord(card.pl)}</h3>
            <button onClick={e => { e.stopPropagation(); onSpeak(card.pl); }} style={{
              width: 50, height: 50, background: "#6366f1", borderRadius: "1rem", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
            </button>
            <p style={{ position: "absolute", bottom: "1.25rem", color: "rgba(255,255,255,0.1)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em" }}>Tap to reveal →</p>
          </div>
          <div style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)",
            borderRadius: "2rem",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem",
            border: "1px solid rgba(167,139,250,0.25)",
          }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "0.75rem" }}>English</p>
            <p style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, textAlign: "center", lineHeight: 1.4, margin: "0 0 0.75rem" }}>{card.en}</p>
            <span style={{ padding: "4px 14px", background: "rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.65)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>{card.type}</span>
            {card.desc && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: "1rem", textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>{card.desc}</p>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 420 }}>
        <button onClick={prev} style={{ flex: 1, padding: "0.9rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", color: "#64748b", cursor: "pointer", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>← Prev</button>
        <button onClick={handleMaster} style={{
          padding: "0.9rem 1.1rem",
          background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: "1rem", color: "#6ee7b7", cursor: "pointer",
          fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}>✓ Mastered</button>
        <button onClick={next} style={{ flex: 1, padding: "0.9rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "1rem", color: "#fff", cursor: "pointer", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Next →</button>
      </div>
    </div>
  );
}

// ── Daily Challenge Panel ─────────────────────────────────────────────────────
function DailyChallenge({ wordsLookedUp, totalVocab, pagesRead, onClose }) {
  const goals = [
    { label: "Look up 5 words", target: 5, current: wordsLookedUp, emoji: "🔍", xp: 50 },
    { label: "Read 3 pages", target: 3, current: pagesRead, emoji: "📖", xp: 150 },
    { label: "Look up 15 words", target: 15, current: wordsLookedUp, emoji: "🧠", xp: 200 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 4500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.9)", backdropFilter: "blur(20px)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 420,
        background: "linear-gradient(165deg, #0f172a 0%, #1e1b4b 100%)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "2rem", padding: "2rem",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        animation: "sheetUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: "1.8rem", fontStyle: "italic", margin: "0 0 0.25rem" }}>Dzienne wyzwanie</h2>
        <p style={{ color: "#475569", fontSize: "0.75rem", marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>Daily Challenge</p>
        {goals.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const done = g.current >= g.target;
          return (
            <div key={i} style={{ marginBottom: "1rem", padding: "1rem 1.1rem", background: done ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.1rem" }}>{g.emoji}</span>
                  <span style={{ color: done ? "#6ee7b7" : "#e2e8f0", fontSize: "0.85rem", fontWeight: 700 }}>{g.label}</span>
                </div>
                <span style={{ color: done ? "#6ee7b7" : "#6366f1", fontSize: "0.7rem", fontWeight: 800 }}>{done ? "✓ Done" : `+${g.xp} XP`}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: done ? "linear-gradient(90deg,#34d399,#6ee7b7)" : "linear-gradient(90deg,#6366f1,#a78bfa)", borderRadius: 9999, transition: "width 0.8s ease" }} />
              </div>
              <p style={{ color: "#475569", fontSize: "0.65rem", margin: "0.4rem 0 0", textAlign: "right", fontWeight: 700 }}>{g.current} / {g.target}</p>
            </div>
          );
        })}
        <button onClick={onClose} style={{ width: "100%", padding: "0.9rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "1.1rem", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.5rem" }}>
          Back to Reading
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PolishReadingEngine() {
  const story = STORY_DATA;

  // Detect parent navbar height (for offset)
  const [parentNavHeight, setParentNavHeight] = useState(64);
  useEffect(() => {
    // Try to detect external navbar by measuring offset
    const detectNavHeight = () => {
      // Look for a nav element above our component
      const navs = document.querySelectorAll('nav, header, [class*="nav"], [class*="header"]');
      let maxHeight = 0;
      navs.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 5 && rect.height > 30 && rect.height < 200) {
          maxHeight = Math.max(maxHeight, rect.height);
        }
      });
      if (maxHeight > 0) setParentNavHeight(maxHeight);
    };
    detectNavHeight();
    window.addEventListener('resize', detectNavHeight);
    return () => window.removeEventListener('resize', detectNavHeight);
  }, []);

  const OUR_NAV_HEIGHT = 72;
  const TOTAL_OFFSET = parentNavHeight + OUR_NAV_HEIGHT;

  const [currentPage, setCurrentPage] = useState(() => { try { return parseInt(localStorage.getItem("pre_page") || "0", 10); } catch { return 0; } });
  const [quickBubble, setQuickBubble] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [flashcards, setFlashcards] = useState(() => { try { return JSON.parse(localStorage.getItem("pre_flashcards") || "[]"); } catch { return []; } });
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [visitedPages, setVisitedPages] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem("pre_visited") || "[]")); } catch { return new Set([0]); } });
  const [xp, setXp] = useState(() => { try { return parseInt(localStorage.getItem("pre_xp") || "0", 10); } catch { return 0; } });
  const [combo, setCombo] = useState(1);
  const [comboTimer, setComboTimer] = useState(null);
  const [floatingXPs, setFloatingXPs] = useState([]);
  const [streak, setStreak] = useState(() => { try { return parseInt(localStorage.getItem("pre_streak") || "0", 10); } catch { return 0; } });
  const [lastStudyDate, setLastStudyDate] = useState(() => { try { return localStorage.getItem("pre_last_date") || ""; } catch { return ""; } });
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [toast, setToast] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [wordsLookedUp, setWordsLookedUp] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem("pre_looked") || "[]")); } catch { return new Set(); } });
  const [isLoadingDef, setIsLoadingDef] = useState(false);
  const prevLevelRef = useRef(getLevel(xp));
  const xpRef = useRef(xp);
  xpRef.current = xp;

  useEffect(() => {
    try {
      localStorage.setItem("pre_page", currentPage);
      localStorage.setItem("pre_xp", xp);
      localStorage.setItem("pre_streak", streak);
      localStorage.setItem("pre_visited", JSON.stringify([...visitedPages]));
      localStorage.setItem("pre_looked", JSON.stringify([...wordsLookedUp]));
      localStorage.setItem("pre_flashcards", JSON.stringify(flashcards));
    } catch (e) { }
  }, [currentPage, xp, streak, visitedPages, wordsLookedUp, flashcards]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastStudyDate === yesterday) setStreak(s => s + 1);
      else if (lastStudyDate !== "" && lastStudyDate !== today) setStreak(1);
      else if (lastStudyDate === "") setStreak(1);
      setLastStudyDate(today);
      try { localStorage.setItem("pre_last_date", today); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (!visitedPages.has(currentPage)) {
      setVisitedPages(prev => new Set([...prev, currentPage]));
      setTimeout(() => addXp(XP_PER_PAGE, null, "📖"), 300);
    }
    setShowTranslation(false);
    setQuickBubble(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const looked = wordsLookedUp.size;
    const milestones = [
      { at: 1, emoji: "✨", title: "Pierwsza Iskra!", desc: "You looked up your first Polish word." },
      { at: 5, emoji: "🔍", title: "Słownik Zaczyna Żyć", desc: "5 words explored. You're building a vocabulary!" },
      { at: 10, emoji: "🌊", title: "Zanurzony w Języku", desc: "10 words! You're swimming in Polish now." },
      { at: 20, emoji: "🏆", title: "Mistrz Słownictwa", desc: "20 words discovered. You're unstoppable!" },
    ];
    const m = milestones.find(m => m.at === looked);
    if (m) { setMilestone(m); }
  }, [wordsLookedUp.size]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "pl-PL"; msg.rate = 0.82;
    window.speechSynthesis.speak(msg);
  }, []);

  const showToast = useCallback((msg, type = "info", duration = 2200) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  }, []);

  const addXp = useCallback((amount, clickPos, label) => {
    const newAmount = Math.round(amount);
    setXp(prev => {
      const newXp = prev + newAmount;
      const newLevel = getLevel(newXp);
      if (newLevel > prevLevelRef.current) {
        prevLevelRef.current = newLevel;
        setTimeout(() => {
          setLevelUpAnim(true);
          setMilestone({ emoji: "🎉", title: `Poziom ${newLevel} — ${LEVEL_TITLES[newLevel]}!`, desc: "You leveled up! Keep reading to unlock more titles." });
          setTimeout(() => setLevelUpAnim(false), 3000);
        }, 200);
      }
      return newXp;
    });
    if (clickPos) {
      const id = Date.now() + Math.random();
      setFloatingXPs(prev => [...prev, { id, x: clickPos.x, y: clickPos.y, text: `+${newAmount} XP`, combo }]);
      setTimeout(() => setFloatingXPs(prev => prev.filter(i => i.id !== id)), 1500);
    }
  }, [combo]);

  const handleWordClick = async (rawWord, e) => {
    const clean = cleanWord(rawWord);
    if (!clean || clean.length < 2) return;
    e.stopPropagation();

    const clickPos = { x: e.clientX, y: e.clientY };

    if (comboTimer) clearTimeout(comboTimer);
    const newCombo = Math.min(combo + 1, 10);
    setCombo(newCombo);
    const t = setTimeout(() => setCombo(1), COMBO_WINDOW_MS);
    setComboTimer(t);

    const isNew = !wordsLookedUp.has(clean);
    if (isNew) {
      setWordsLookedUp(prev => new Set([...prev, clean]));
      addXp(XP_PER_WORD * Math.min(newCombo, 4), clickPos, null);
      if (newCombo === 3) showToast("🔥 3x Combo!", "combo");
      if (newCombo === 5) showToast("⚡ 5x COMBO!", "combo");
      if (newCombo === 8) showToast("🌊 MEGA 8x COMBO!", "combo");
    } else {
      addXp(2, clickPos, null);
    }

    // Check our comprehensive local dictionary first (vocabulary + full dictionary)
    const localEntry = lookupWord(clean, story);

    if (localEntry) {
      // Found locally — show quick bubble immediately, no API call needed
      setQuickBubble({ word: localEntry, position: clickPos });
      setIsSaved(flashcards.some(f => cleanWord(f.pl) === clean));
    } else {
      // Not in local dictionary — try API, with a descriptive fallback
      setQuickBubble(null);
      setSelectedWord({ pl: rawWord, en: "Looking up…", type: "word", desc: "" });
      setIsSaved(flashcards.some(f => cleanWord(f.pl) === clean));
      setIsLoadingDef(true);
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 200,
            messages: [{
              role: "user",
              content: `You are a Polish language tutor. The user clicked the Polish word "${clean}" while reading "Mała Syrenka" by H.C. Andersen. Reply ONLY with a valid JSON object, no markdown fences, no preamble:
{"en":"English translation (1-4 words)","type":"noun or verb or adjective or adverb or conjunction or pronoun","desc":"One engaging sentence explaining what this word means in the context of this fairy tale, written for a language learner."}`
            }]
          })
        });
        const data = await response.json();
        const text = data.content?.map(c => c.text || "").join("") || "{}";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        setSelectedWord({ pl: rawWord, en: parsed.en || "—", type: parsed.type || "word", desc: parsed.desc || "" });
      } catch (err) {
        // Graceful fallback: show a generic entry rather than an error
        setSelectedWord({
          pl: rawWord,
          en: "Polish word",
          type: "word",
          desc: `"${clean}" appears in this fairy tale. Click the speaker button to hear it pronounced in Polish.`
        });
      } finally {
        setIsLoadingDef(false);
      }
    }
  };

  const handleSaveFlashcard = () => {
    const wordToSave = selectedWord || quickBubble?.word;
    if (!wordToSave || isSaved) return;
    const newCard = { ...wordToSave, id: Date.now() };
    setFlashcards(prev => [...prev, newCard]);
    setIsSaved(true);
    addXp(15, null, null);
    showToast("💾 Card saved! +15 XP", "save");
  };

  const handleMastered = (id) => {
    setFlashcards(prev => prev.filter(c => c.id !== id));
    addXp(25, null, null);
    showToast("🏆 Mastered! +25 XP", "save");
  };

  const level = getLevel(xp);
  const levelPct = getLevelProgress(xp);
  const pageData = story.pages[currentPage];
  const progress = ((currentPage + 1) / story.pages.length) * 100;

  useEffect(() => {
    const handler = () => setQuickBubble(null);
    if (quickBubble) { setTimeout(() => document.addEventListener("click", handler), 50); }
    return () => document.removeEventListener("click", handler);
  }, [quickBubble]);

  useEffect(() => {
    const handle = (e) => {
      if (selectedWord || showFlashcards || showMenu || quickBubble) {
        if (e.key === "Escape") { setSelectedWord(null); setShowFlashcards(false); setShowMenu(false); setQuickBubble(null); }
        return;
      }
      if (e.key === "ArrowRight" && currentPage < story.pages.length - 1) setCurrentPage(p => p + 1);
      if (e.key === "ArrowLeft" && currentPage > 0) setCurrentPage(p => p - 1);
      if (e.key === "t" || e.key === "T") setShowTranslation(t => !t);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [currentPage, selectedWord, showFlashcards, showMenu, quickBubble]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #020617 0%, #080818 50%, #020617 100%)",
      color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        @keyframes floatUp { 0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } 60% { opacity: 1; } 100% { transform: translateX(-50%) translateY(-90px) scale(0.85); opacity: 0; } }
        @keyframes sheetUp { 0% { transform: translateY(50px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes bubbleIn { 0% { transform: scale(0.85) translateY(8px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes milestoneIn { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.06); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes toastIn { 0% { transform: translateX(-50%) translateY(-16px); opacity: 0; } 100% { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes slideFromLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        ::selection { background: rgba(99,102,241,0.35); }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 9999px; }
        .word-token { display: inline-block; cursor: pointer; margin-right: 0.3em; border-radius: 4px; padding: 0 2px; transition: color 0.15s, background 0.15s, border-bottom-color 0.15s; border-bottom: 2px solid transparent; line-height: inherit; }
        .word-token:hover { color: #a78bfa !important; background: rgba(99,102,241,0.12) !important; border-bottom-color: rgba(99,102,241,0.6) !important; transform: translateY(-1px); }
        .word-token:active { transform: scale(0.95); }
      `}</style>

      <FloatingXP items={floatingXPs} />

      {/* Toast — offset below parent nav */}
      {toast && (
        <div style={{
          position: "fixed", top: parentNavHeight + 16, left: "50%",
          padding: "0.6rem 1.75rem",
          background: toast.type === "combo" ? "linear-gradient(135deg,#f59e0b,#ef4444)" : toast.type === "save" ? "rgba(15,23,42,0.97)" : "rgba(99,102,241,0.9)",
          border: toast.type === "save" ? "1px solid rgba(99,102,241,0.3)" : "none",
          borderRadius: "9999px", color: "#fff",
          fontSize: "0.8rem", fontWeight: 800,
          zIndex: 9000, whiteSpace: "nowrap",
          animation: "toastIn 0.3s ease-out",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}>
          {toast.msg}
        </div>
      )}

      {milestone && <MilestoneBanner milestone={milestone} onDone={() => setMilestone(null)} />}

      {/* ── NAVIGATION BAR — sits immediately below parent navbar ── */}
      <nav style={{
        position: "fixed",
        top: parentNavHeight,   // ← key fix: pushed down by parent nav height
        left: 0, right: 0,
        height: OUR_NAV_HEIGHT,
        zIndex: 200,
        background: "rgba(2,6,23,0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center",
        padding: "0 1rem",
        gap: 12,
      }}>
        {/* Menu button */}
        <button onClick={() => setShowMenu(!showMenu)} style={{
          width: 44, height: 44, borderRadius: "0.9rem",
          background: showMenu ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          flexShrink: 0, transition: "background 0.2s",
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              height: 2, background: "#818cf8", borderRadius: 9999,
              width: i === 1 ? (showMenu ? 0 : 14) : 20,
              transform: showMenu && i === 0 ? "rotate(45deg) translateY(7px)" : showMenu && i === 2 ? "rotate(-45deg) translateY(-7px)" : "none",
              transition: "all 0.2s",
            }} />
          ))}
        </button>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#6366f1", fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", margin: "0 0 1px" }}>Polish Reading Engine</p>
          <p style={{ fontFamily: "'DM Serif Display', serif", color: "#e2e8f0", fontSize: "1rem", fontStyle: "italic", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{story.title}</p>
        </div>

        {/* XP + Level */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {streak > 1 && <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#f59e0b" }}>🔥 {streak}</span>}
            {combo > 1 && (
              <span style={{
                padding: "2px 8px", borderRadius: "9999px",
                background: combo > 4 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)",
                border: `1px solid ${combo > 4 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.25)"}`,
                color: combo > 4 ? "#fca5a5" : "#fcd34d",
                fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
                animation: "pulse 0.8s infinite",
              }}>⚡ {combo}x</span>
            )}
            <span style={{
              padding: "3px 10px", borderRadius: "9999px",
              background: levelUpAnim ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: levelUpAnim ? "#fff" : "#818cf8",
              fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
              transition: "all 0.4s", whiteSpace: "nowrap",
            }}>Lv.{level} {LEVEL_TITLES[level]}</span>
          </div>
          <div style={{ width: 100, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${levelPct}%`,
              background: "linear-gradient(90deg, #4338ca, #818cf8, #c084fc)",
              borderRadius: 9999,
              transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: "0 0 8px rgba(129,140,248,0.5)",
            }} />
          </div>
        </div>

        {/* Page navigation */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} style={{
            width: 36, height: 36, borderRadius: "0.7rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            color: "#64748b", cursor: currentPage === 0 ? "default" : "pointer",
            opacity: currentPage === 0 ? 0.25 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
            transition: "opacity 0.2s",
          }}>‹</button>
          <button disabled={currentPage === story.pages.length - 1} onClick={() => setCurrentPage(p => p + 1)} style={{
            width: 36, height: 36, borderRadius: "0.7rem",
            background: currentPage < story.pages.length - 1 ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.04)",
            border: "none", color: "#fff",
            cursor: currentPage === story.pages.length - 1 ? "default" : "pointer",
            opacity: currentPage === story.pages.length - 1 ? 0.25 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
            boxShadow: currentPage < story.pages.length - 1 ? "0 4px 12px rgba(99,102,241,0.4)" : "none",
            transition: "all 0.2s",
          }}>›</button>
        </div>
      </nav>

      {/* Progress bar — immediately below OUR nav */}
      <div style={{ position: "fixed", top: parentNavHeight + OUR_NAV_HEIGHT, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.04)", zIndex: 200 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#4338ca,#6366f1,#a78bfa)", transition: "width 0.6s ease", boxShadow: "0 0 12px rgba(99,102,241,0.5)" }} />
      </div>

      {/* ── SIDE MENU — starts below both navbars ── */}
      {showMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, backdropFilter: "blur(6px)" }} onClick={() => setShowMenu(false)} />
          <div style={{
            position: "fixed",
            top: parentNavHeight,   // ← starts below parent nav
            left: 0, bottom: 0,
            width: 300, zIndex: 301,
            background: "linear-gradient(180deg,#0f172a 0%,#0a0a1a 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: `${OUR_NAV_HEIGHT + 24}px 1.5rem 2rem`,
            overflowY: "auto",
            animation: "slideFromLeft 0.25s ease-out",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
              {[
                { label: "Total XP", value: xp.toLocaleString(), icon: "⭐" },
                { label: "Level", value: `${LEVEL_TITLES[level]}`, icon: "🎯" },
                { label: "Day Streak", value: `${streak} 🔥`, icon: "🔥" },
                { label: "Words Found", value: wordsLookedUp.size, icon: "🔍" },
                { label: "Cards Saved", value: flashcards.length, icon: "💾" },
                { label: "Pages Read", value: visitedPages.size, icon: "📖" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "0.9rem" }}>
                  <p style={{ color: "rgba(148,163,184,0.4)", fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 3px" }}>{s.label}</p>
                  <p style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: 800, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
            {[
              { icon: "🃏", label: "Flashcards", sub: `${flashcards.length} saved`, action: () => { setShowFlashcards(true); setShowMenu(false); } },
              { icon: "🎯", label: "Daily Challenge", sub: `${wordsLookedUp.size} words found`, action: () => { setShowChallenge(true); setShowMenu(false); } },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={{
                width: "100%", padding: "1rem", marginBottom: "0.75rem",
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "1rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
              >
                <div style={{ width: 42, height: 42, background: "#6366f1", borderRadius: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                  {btn.icon}
                </div>
                <div>
                  <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 700, margin: "0 0 2px" }}>{btn.label}</p>
                  <p style={{ color: "#6366f1", fontSize: "0.65rem", fontWeight: 700, margin: 0 }}>{btn.sub}</p>
                </div>
              </button>
            ))}
            <p style={{ color: "rgba(148,163,184,0.35)", fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", margin: "1.25rem 0 0.75rem" }}>Chapters</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {story.pages.map((_, idx) => {
                const visited = visitedPages.has(idx);
                const active = idx === currentPage;
                return (
                  <button key={idx} onClick={() => { setCurrentPage(idx); setShowMenu(false); }} style={{
                    height: 44, borderRadius: "0.75rem", cursor: "pointer",
                    border: `1px solid ${active ? "#6366f1" : visited ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)"}`,
                    background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : visited ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                    color: active ? "#fff" : visited ? "#818cf8" : "#334155",
                    fontWeight: 800, fontSize: "0.85rem",
                    position: "relative",
                    boxShadow: active ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
                  }}>
                    {idx + 1}
                    {visited && !active && <div style={{ position: "absolute", top: 4, right: 4, width: 5, height: 5, background: "#6366f1", borderRadius: "50%" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── MAIN CONTENT — padded top to clear both navbars ── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: `${TOTAL_OFFSET + 24}px 1.5rem 7rem` }}>

        <div style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem" }}>
            <span style={{
              padding: "4px 12px", background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)", borderRadius: "9999px",
              color: "#818cf8", fontSize: "0.6rem", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.15em",
            }}>
              Part {currentPage + 1} / {story.pages.length}
            </span>
            <span style={{
              padding: "4px 12px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: "9999px",
              color: "rgba(148,163,184,0.5)", fontSize: "0.6rem", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.12em",
            }}>
              {wordsLookedUp.size} words explored
            </span>
          </div>
          <p style={{ color: "rgba(148,163,184,0.25)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>
            Click any word · press <kbd style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4, fontSize: "0.65rem" }}>T</kbd> for translation · <kbd style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4, fontSize: "0.65rem" }}>←→</kbd> to navigate
          </p>
        </div>

        {/* ── Story Text ── */}
        <div style={{ marginBottom: "4rem" }}>
          {pageData.paragraphs.map((para, pIdx) => (
            <p key={pIdx} style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(1.35rem, 3.8vw, 1.8rem)",
              lineHeight: 1.95,
              color: "#dde4f0",
              marginBottom: "2.5rem",
              letterSpacing: "0.01em",
            }}>
              {para.split(" ").map((word, wIdx) => {
                const clean = cleanWord(word);
                const isKnown = wordsLookedUp.has(clean);
                const isVocab = !!story.vocabulary[clean];
                const isInDict = !!POLISH_DICTIONARY[clean];
                return (
                  <span
                    key={wIdx}
                    className="word-token"
                    onClick={e => handleWordClick(word, e)}
                    style={{
                      borderBottomColor: isVocab ? "rgba(99,102,241,0.55)" : isInDict ? "rgba(167,139,250,0.35)" : isKnown ? "rgba(52,211,153,0.4)" : "transparent",
                      color: isVocab ? "#c7d2fe" : isKnown ? "#86efac" : "#dde4f0",
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          ))}
        </div>

        {/* Word legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: "2.5rem", flexWrap: "wrap" }}>
          {[
            { swatch: { background: "rgba(99,102,241,0.15)", borderBottom: "2px solid rgba(99,102,241,0.55)" }, label: "Featured vocabulary" },
            { swatch: { background: "rgba(167,139,250,0.08)", borderBottom: "2px solid rgba(167,139,250,0.35)" }, label: "In word dictionary" },
            { swatch: { background: "rgba(52,211,153,0.08)", borderBottom: "2px solid rgba(52,211,153,0.4)" }, label: "Already explored" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 28, height: 14, borderRadius: "3px 3px 0 0", ...item.swatch }} />
              <span style={{ color: "rgba(148,163,184,0.35)", fontSize: "0.65rem", fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* ── English Translation Toggle ── */}
        <div style={{ marginTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "2rem" }}>
          <button
            onClick={() => setShowTranslation(t => !t)}
            style={{
              display: "flex", alignItems: "center", gap: 10, background: "none", border: "none",
              cursor: "pointer", padding: "0.6rem 0",
              color: showTranslation ? "#818cf8" : "rgba(148,163,184,0.3)",
              fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em",
              transition: "color 0.2s", marginBottom: "0.75rem",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center",
              background: showTranslation ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showTranslation ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)"}`,
              transition: "all 0.2s",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {showTranslation ? <path d="M19 9l-7 7-7-7" /> : <path d="M5 15l7-7 7 7" />}
              </svg>
            </div>
            {showTranslation ? "Hide" : "Show"} English Translation
          </button>

          <div style={{
            maxHeight: showTranslation ? "300px" : "0",
            overflow: "hidden",
            transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <div style={{
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderLeft: "4px solid rgba(99,102,241,0.5)",
              borderRadius: "1.1rem",
              padding: "1.25rem 1.5rem",
            }}>
              <p style={{ color: "#818cf8", fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", margin: "0 0 0.6rem" }}>English translation</p>
              <p style={{
                fontFamily: "'DM Serif Display', serif",
                color: "#b0bec5",
                fontSize: "1.05rem",
                lineHeight: 1.85,
                fontStyle: "italic",
                margin: 0,
              }}>
                {pageData.translation}
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom navigation ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4rem" }}>
          <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} style={{
            padding: "0.9rem 1.75rem", borderRadius: "1rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            color: "#64748b", cursor: currentPage === 0 ? "default" : "pointer",
            fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em",
            opacity: currentPage === 0 ? 0.3 : 1, transition: "opacity 0.2s",
          }}>← Previous</button>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {story.pages.map((_, i) => {
              const visited = visitedPages.has(i);
              const active = i === currentPage;
              return (
                <div key={i} onClick={() => setCurrentPage(i)} style={{
                  width: active ? 24 : 7, height: 7, borderRadius: 9999,
                  background: active ? "#6366f1" : visited ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.08)",
                  transition: "all 0.3s", cursor: "pointer",
                  boxShadow: active ? "0 0 10px rgba(99,102,241,0.5)" : "none",
                }} />
              );
            })}
          </div>

          <button disabled={currentPage === story.pages.length - 1} onClick={() => setCurrentPage(p => p + 1)} style={{
            padding: "0.9rem 1.75rem", borderRadius: "1rem",
            background: currentPage < story.pages.length - 1 ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.04)",
            border: "none", color: "#fff",
            cursor: currentPage === story.pages.length - 1 ? "default" : "pointer",
            fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em",
            opacity: currentPage === story.pages.length - 1 ? 0.3 : 1,
            boxShadow: currentPage < story.pages.length - 1 ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
            transition: "all 0.2s",
          }}>Next Page →</button>
        </div>
      </main>

      {/* ── Quick Bubble ── */}
      {quickBubble && (
        <QuickBubble
          word={quickBubble.word}
          position={quickBubble.position}
          onExpand={() => {
            setSelectedWord(quickBubble.word);
            setIsSaved(flashcards.some(f => cleanWord(f.pl) === cleanWord(quickBubble.word.pl)));
            setQuickBubble(null);
          }}
          onClose={() => setQuickBubble(null)}
        />
      )}

      {/* ── Full Word Card Modal ── */}
      {selectedWord && !quickBubble && (
        <WordCard
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onSave={handleSaveFlashcard}
          isSaved={isSaved}
          onSpeak={speak}
          isLoading={isLoadingDef}
        />
      )}

      {showFlashcards && (
        <FlashcardReview
          cards={flashcards}
          onClose={() => setShowFlashcards(false)}
          onMastered={handleMastered}
          onSpeak={speak}
        />
      )}

      {showChallenge && (
        <DailyChallenge
          wordsLookedUp={wordsLookedUp.size}
          totalVocab={Object.keys(story.vocabulary).length}
          pagesRead={visitedPages.size}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </div>
  );
}
