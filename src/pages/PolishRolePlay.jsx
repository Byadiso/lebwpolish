import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCENARIOS = [
  {
    emoji: "🕵️",
    title: "Detektyw Pierogi",
    character: "Jesteś słynnym detektywem Desire.", 
    mission: "Dowiedz się, kto ukradł pierogi z lodówki.", 
    suspects: ["Kot", "Babcia", "Sąsiad Janusz", "Kosmita"],
    words: ["kto", "dlaczego", "podejrzany", "dowód", "lodówka", "pierogi"],
    phrases: [
      "Kto ukradł pierogi?",
      "To bardzo podejrzane.", 
      "Mam dowody!",
      "Gdzie byłeś wczoraj?"
    ],
    translation: "You are a detective investigating who stole the pierogi from the fridge."
  },
  {
    emoji: "👽",
    title: "Kosmita w Warszawie",
    character: "Wylądowałeś na Ziemi po raz pierwszy.", 
    mission: "Kup skarpetki i zapytaj, czym są pierogi.", 
    suspects: ["Sprzedawca", "Robot", "Gołąb"],
    words: ["ile kosztuje", "gdzie", "co to jest", "skarpetki", "pierogi"],
    phrases: [
      "Przepraszam, co to jest?",
      "Czy to jest normalne na Ziemi?",
      "Potrzebuję skarpetek."
    ],
    translation: "You are an alien trying to survive in Warsaw."
  },
  {
    emoji: "👑",
    title: "Król w Biedronce",
    character: "Jesteś średniowiecznym królem.", 
    mission: "Kup mleko, chleb i ogórki z królewską godnością.", 
    suspects: ["Rycerz", "Kasjerka", "Smok"],
    words: ["potrzebuję", "królestwo", "chleb", "mleko", "ogórki"],
    phrases: ["Poproszę chleb dla mojego królestwa.", "To jest rozkaz!"],
    translation: "A medieval king is shopping in a Polish supermarket."
  },
  {
    emoji: "🐧",
    title: "Zazdrosny Pingwin",
    character: "Pingwin jest obrażony.", 
    mission: "Przekonaj go, że jest twoim najlepszym przyjacielem.", 
    suspects: ["Foka", "Mewa", "Inny pingwin"],
    words: ["przyjaciel", "dlaczego", "kocham", "nie płacz"],
    phrases: ["Jesteś moim najlepszym przyjacielem.", "Nie bądź zazdrosny."],
    translation: "Comfort a jealous penguin using Polish."
  },
  {
    emoji: "🥔",
    title: "Detektyw Ziemniak",
    character: "Jesteś ziemniakiem z tajną misją.", 
    mission: "Odnajdź zaginione frytki.", 
    suspects: ["Ketchup", "Majonez", "Burger"],
    words: ["zaginiony", "misja", "tajny", "frytki"],
    phrases: ["To jest tajna misja.", "Gdzie są frytki?"],
    translation: "You are a potato detective searching for missing fries."
  },
  {
    emoji: "🚂",
    title: "Zagubiony Turysta",
    character: "Nie możesz znaleźć dworca.", 
    mission: "Zapytaj pięć osób o drogę.", 
    suspects: ["Konduktor", "Student", "Pies"],
    words: ["gdzie", "dworzec", "prosto", "w lewo", "w prawo"],
    phrases: ["Przepraszam, gdzie jest dworzec?"],
    translation: "Ask for directions in Polish."
  }
];

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const speak = (text, lang = "pl-PL") => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel(); 
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = lang.startsWith("pl") ? 0.85 : 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis?.cancel(); 
    setSpeaking(false);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return { speak, stop, speaking };
}

function TimerButton({ minutes }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]); 

  const start = () => setRemaining(minutes * 60);

  const label = remaining > 0
    ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
    : `${minutes} min`;

  return (
    <button onClick={start} className="pcs-filter-btn">
      ⏱️ {label}
    </button>
  );
}

export default function PolishRoleplay({ onXp = () => {} }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SCENARIOS.length));
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pcs-favorites") || "[]");
    } catch {
      return [];
    }
  }); 

  const scenario = useMemo(() => SCENARIOS[index], [index]); 
  const { speak, stop, speaking } = useSpeech(); 

  useEffect(() => {
    localStorage.setItem("pcs-favorites", JSON.stringify(favorites));
  }, [favorites]); 

  const generate = () => {
    let next = index;
    while (next === index) {
      next = Math.floor(Math.random() * SCENARIOS.length);
    }
    setIndex(next);
    onXp(10);
  };

  const toggleFavorite = () => {
    if (favorites.includes(scenario.title)) {
      setFavorites((f) => f.filter((x) => x !== scenario.title));
    } else {
      setFavorites((f) => [...f, scenario.title]);
      onXp(5);
    }
  };

  const isFavorite = favorites.includes(scenario.title);

  const fullPolishText = [
    scenario.character,
    scenario.mission,
    ...scenario.phrases,
  ].join(". ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');

        .pcs-root {
          min-height: 100%;
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          background:
            radial-gradient(ellipse 900px 500px at 15% 0%, rgba(99,102,241,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 600px 400px at 85% 100%, rgba(52,211,153,0.05) 0%, transparent 70%),
            #020617;
          padding: 24px 14px 80px;
        }

        .pcs-container {
          max-width: 980px;
          margin: 0 auto;
        }

        .pcs-card {
          background: rgba(8,14,28,0.94);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 28px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }

        .pcs-section {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .pcs-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: rgba(148,163,184,0.35);
          margin-bottom: 8px;
          font-family: 'DM Mono', monospace;
        }

        .pcs-filter-btn {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(226,232,240,0.8);
          font-family: 'DM Sans', sans-serif;
        }

        .pcs-primary {
          border: none;
          border-radius: 14px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(79,70,229,0.3);
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="pcs-root">
        <div className="pcs-container">
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "rgba(99,102,241,0.45)", 
                marginBottom: 6,
                fontFamily: "'DM Mono', monospace",
              }}>
              Fluency Playground
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 5vw, 3rem)", 
                lineHeight: 1.05,
                marginBottom: 8,
              }}>
              Laugh & Speak Polish 🎭
            </h1>
            <p style={{ fontSize: 14, color: "rgba(148,163,184,0.55)" }}>
              Build fluency through hilarious roleplay scenarios.
            </p>
          </div>

          <motion.div
            key={scenario.title}
            initial={{ opacity: 0, y: 18 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.35 }} 
            className="pcs-card"
          >
            <div
              style={{
                padding: 28,
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(52,211,153,0.08))",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <p className="pcs-label">Today's Mission</p>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                      fontSize: "clamp(1.6rem, 4vw, 2.5rem)", 
                      fontWeight: 700,
                    }}>
                    {scenario.emoji} {scenario.title}
                  </h2>
                </div>
                <button
                  onClick={toggleFavorite}
                  className="pcs-filter-btn"
                  title="Save favorite"
                >
                  {isFavorite ? "❤️ Saved" : "🤍 Save"}
                </button>
              </div>
            </div>

            <div className="pcs-section">
              <p className="pcs-label">Character</p>
              <p style={{ fontSize: 16, lineHeight: 1.7 }}>{scenario.character}</p>
            </div>

            <div className="pcs-section">
              <p className="pcs-label">Mission</p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#c4b5fd",
                  lineHeight: 1.3,
                }}>
                {scenario.mission}
              </p>
            </div>

            <div className="pcs-section">
              <p className="pcs-label">Required Words</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {scenario.words.map((word) => (
                  <span
                    key={word}
                    style={{
                      padding: "7px 11px",
                      borderRadius: 9,
                      background: "rgba(99,102,241,0.08)", 
                      border: "1px solid rgba(99,102,241,0.16)", 
                      color: "#818cf8",
                      fontWeight: 700,
                      fontSize: 12,
                    }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="pcs-section">
              <p className="pcs-label">Useful Phrases</p>
              <div style={{ display: "grid", gap: 10 }}>
                {scenario.phrases.map((phrase) => (
                  <div
                    key={phrase}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid rgba(255,255,255,0.06)", 
                    }}>
                    {phrase}
                  </div>
                ))}
              </div>
            </div>

            <div className="pcs-section">
              <p className="pcs-label">Translation</p>
              <p style={{ color: "#6ee7b7", fontStyle: "italic" }}>
                {scenario.translation}
              </p>
            </div>

            <div className="pcs-section">
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}>
                <button className="pcs-primary" onClick={generate}>
                  🎲 New Scenario
                </button>

                <button
                  className="pcs-filter-btn"
                  onClick={() =>
                    speaking ? stop() : speak(fullPolishText, "pl-PL")}
                >
                  {speaking ? "⏹️ Stop" : "🔊 Listen"}
                </button>

                <TimerButton minutes={1} />
                <TimerButton minutes={2} />
                <TimerButton minutes={5} />
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(52,211,153,0.06)", 
                  border: "1px solid rgba(52,211,153,0.16)", 
                  color: "#86efac",
                }}>
                🎤 Speak for 2 minutes only in Polish. Be dramatic. Make mistakes.
                Keep talking.
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {favorites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }} 
                className="pcs-card"
                style={{ marginTop: 18 }}>
                <div className="pcs-section" style={{ borderTop: "none" }}>
                  <p className="pcs-label">Saved Adventures</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {favorites.map((item) => (
                      <span
                        key={item}
                        className="pcs-filter-btn"
                        style={{ cursor: "default" }}>
                        ❤️ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
