import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function B1UltimateMastery() {
  const [userInput, setUserInput] = useState("");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const inputRef = useRef(null);

  const challenges = [
    { context: "Possession", prompt: "To jest samochód (mój, starszy brat).", target: "mojego starszego brata", logic: "Possession always requires Genitive.", tutorTip: "Masculine personal Genitive: Adjectives -ego, Nouns -a." },
    { context: "Negation", prompt: "Szukam (dobra praca), ale nie widzę (żadna oferta).", target: "dobrej pracy żadnej oferty", logic: "Negative verbs trigger Genitive Case.", tutorTip: "Feminine Genitive: Adjectives -ej, Nouns -y/-i." },
    { context: "Profession", prompt: "Mój ojciec jest (emerytowany policjant).", target: "emerytowanym policjantem", logic: "Identity/Role after 'być' = Instrumental.", tutorTip: "Masculine Instrumental: Adjectives -ym, Nouns -em." },
    { context: "Quantity", prompt: "W tym biurze pracuje siedem (młoda kobieta).", target: "młodych kobiet", logic: "Numbers 5+ trigger Genitive Plural.", tutorTip: "Adjectives take -ych, Nouns drop endings or take -er." },
    { context: "Interests", prompt: "Interesuję się (nowoczesna architektura).", target: "nowoczesną architekturą", logic: "Interests trigger Instrumental Case.", tutorTip: "Feminine Instrumental: Both end in -ą." },
    { context: "Travel", prompt: "Mieszkam w (stara, piękna kamienica).", target: "starej pięknej kamienicy", logic: "Location 'w' triggers Prepositional Case.", tutorTip: "Feminine Prepositional: Adjectives -ej, Nouns -y/-i." },
    { context: "Giving", prompt: "Daję (ten, mały pies) trochę (woda).", target: "temu małemu psu wody", logic: "Recipient = Dative; Part of a whole = Genitive.", tutorTip: "Dative: -u for most masculine nouns." },
    { context: "Wait/Object", prompt: "Czekam na (moja, nowa paczka).", target: "moją nową paczkę", logic: "Waiting 'na' (object) = Accusative.", tutorTip: "Accusative Feminine: Adjectives -ą, Nouns -ę." },
    { context: "Time", prompt: "Uczę się polskiego od (trzy miesiące).", target: "trzech miesięcy", logic: "Duration 'od' triggers Genitive Plural.", tutorTip: "Numerical Genitive is a B1 Exam favorite." },
    { context: "Plurality", prompt: "Nie mam (twoje stare klucze).", target: "twoich starych kluczy", logic: "Negative Plural = Genitive Plural.", tutorTip: "Plural Genitive Adjectives: -ych/-ich." },
    { context: "Helping", prompt: "Pomagam (twoja, młodsza siostra) w nauce.", target: "twojej młodszej siostrze", logic: "'Pomagać' triggers Dative Case.", tutorTip: "Dative Feminine: Adjectives -ej, Nouns -e/-i." },
    { context: "Location", prompt: "Spotykamy się przy (okrągły stół).", target: "okrągłym stole", logic: "Preposition 'przy' = Prepositional Case.", tutorTip: "Look for 'ł' to 'l' softening in the noun." },
    { context: "Transportation", prompt: "Pojadę do Krakowa (nocny pociąg).", target: "nocnym pociągiem", logic: "Instrument of transport = Instrumental.", tutorTip: "Always use Narzędnik for 'by means of'." },
    { context: "Comparison", prompt: "Mój dom jest większy niż (twoje stare mieszkanie).", target: "twoje stare mieszkanie", logic: "Comparison 'niż' keeps the Case of the first noun.", tutorTip: "Nominative stays Nominative here." },
    { context: "Negation", prompt: "Nie lubię (ten, głośny sąsiad).", target: "tego głośnego sąsiada", logic: "Dislike 'nie lubić' = Genitive Case.", tutorTip: "Personal Genitive: -ego and -a." },
    { context: "Preposition", prompt: "Zostawiłem telefon u (moja, dobra koleżanka).", target: "mojej dobrej koleżanki", logic: "Preposition 'u' = Genitive Case.", tutorTip: "Commonly used for people's houses." },
    { context: "Aspects", prompt: "Zawsze (pić - Past) kawę, ale dziś (wypić - Past) herbatę.", target: "piłem wypiłem", logic: "Habit vs. One-time completion.", tutorTip: "Distinguish Imperfective vs Perfective." },
    { context: "Condition", prompt: "Gdybym miał czas, (pisać - Conditional) książkę.", target: "pisałbym", logic: "Conditional mood: Verb + bym/byś/by.", tutorTip: "The particle 'by' attaches to the verb." },
    { context: "Reflexive", prompt: "Zawsze (spóźniać się - Present) na lekcje.", target: "spóźniam się", logic: "Reflexive verbs keep 'się'.", tutorTip: "'Się' can float but usually stays after verb." },
    { context: "Final Boss", prompt: "To zależy od (nasza, wspólna decyzja).", target: "naszej wspólnej decyzji", logic: "Depend on 'zależeć od' = Genitive.", tutorTip: "Exam tip: 'od' is one of the most used prepositions." }
  ];

  const current = challenges[currentLevel] || challenges[0];
  const polishChars = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"];

  const verifyAnswer = useCallback(() => {
    const cleanInput = userInput.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTarget = current.target.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    if (cleanInput === cleanTarget) {
      setIsSuccess(true);
      setStreak(s => s + 1);
      setTimeout(() => {
        setIsSuccess(false);
        if (currentLevel < challenges.length - 1) {
          setCurrentLevel(prev => prev + 1);
          setUserInput("");
          setShowHint(false);
        } else {
          setIsComplete(true);
        }
      }, 1200);
    } else {
      setIsError(true);
      setStreak(0);
      setTimeout(() => setIsError(false), 800);
    }
  }, [userInput, current, currentLevel]);

  if (isComplete) return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
        <motion.div initial={{scale:0.8}} animate={{scale:1}} className="text-center p-20 bg-indigo-600 rounded-[3rem] shadow-2xl">
            <h1 className="text-6xl font-black italic text-white mb-4">B1 MASTERED</h1>
            <p className="text-indigo-200 font-bold tracking-widest uppercase">20 Scenarios Completed</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase italic tracking-tighter hover:scale-105 transition-transform">Restart Training</button>
        </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans flex flex-col">
      
      {/* 🚀 NAV: FIXING THE PERCENTAGE & COUNTER */}
      <nav className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#020617]/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          
          <div className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-orange-400">Streak</span>
            <span className="text-sm font-bold text-orange-500">🔥 {streak}</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-20 flex flex-col items-center">
            <div className="w-full flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                <span>Course Completion</span>
                <span className={currentLevel === 19 ? "text-emerald-400" : ""}>{Math.round(((currentLevel + 1) / 20) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${((currentLevel + 1) / 20) * 100}%` }} className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
            </div>
        </div>

        <div className="px-6 py-2 bg-indigo-600 rounded-xl text-xs font-black italic tracking-widest shadow-lg shadow-indigo-600/20">
          UNIT {currentLevel + 1} / 20
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* 🥊 LEFT: INTERACTIVE */}
        <div className="lg:col-span-7 p-12 lg:p-24 flex flex-col justify-center border-r border-white/5 bg-gradient-to-br from-[#020617] to-[#080c1d]">
          <motion.div key={currentLevel} initial={{opacity:0}} animate={{opacity:1}}>
            <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 rounded">Scenario: {current.context}</span>
            <h2 className="text-4xl lg:text-7xl font-black italic tracking-tighter leading-[1.05] mb-12 text-slate-100">
              {current.prompt}
            </h2>

            <div className="max-w-3xl relative">
              <input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyAnswer()}
                placeholder="Enter the transformed words..."
                className={`w-full bg-transparent border-b-4 py-6 text-3xl lg:text-5xl font-black italic focus:outline-none transition-all
                  ${isSuccess ? 'border-emerald-500 text-emerald-400' : isError ? 'border-red-600 animate-shake' : 'border-white/10 focus:border-indigo-500'}
                `}
                autoFocus
              />

              <div className="flex flex-wrap gap-2 mt-8 mb-12">
                {polishChars.map(c => (
                  <button key={c} onClick={() => {
                    const start = inputRef.current.selectionStart;
                    setUserInput(userInput.slice(0,start) + c + userInput.slice(start));
                    inputRef.current.focus();
                  }} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl hover:bg-indigo-600 transition-all">
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-8">
                <button onClick={verifyAnswer} className="bg-indigo-600 hover:bg-indigo-500 px-14 py-6 rounded-[1.5rem] font-black uppercase italic tracking-tighter text-2xl shadow-2xl active:scale-95 transition-all">Verify Answer</button>
                <button onClick={() => setShowHint(!showHint)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline underline-offset-8">Get Hint (Ctrl+H)</button>
              </div>

              <AnimatePresence>
                {showHint && (
                  <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} className="mt-10 overflow-hidden">
                    <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem]">
                        <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2">Target Solution</span>
                        <p className="text-2xl font-bold italic tracking-tight text-indigo-200">{current.target}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 🧠 RIGHT: FIXED LOGIC PANEL */}
        <div className="lg:col-span-5 p-12 lg:p-20 bg-[#03081c]/50">
            <div className="sticky top-40 space-y-12">
                <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Grammar Intelligence</h3>
                    <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 shadow-inner">
                        <p className="text-3xl font-bold italic text-slate-200 leading-tight">
                            "{current.logic}"
                        </p>
                    </div>
                </section>

                <section className="bg-indigo-500/5 p-12 rounded-[3.5rem] border border-indigo-500/10 group hover:bg-indigo-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">B1 Mastery Tip</span>
                    </div>
                    <p className="text-lg text-slate-400 italic leading-relaxed font-medium">
                        {current.tutorTip}
                    </p>
                </section>
            </div>
        </div>
      </main>

      {/* 🟠 ORANGE MASTERY MODAL (FOR ERRORS) */}
      <AnimatePresence>
        {isError && (
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-orange-500 p-12 rounded-[4rem] text-center shadow-[0_0_100px_rgba(249,115,22,0.4)]">
                <h4 className="text-7xl font-black italic text-white mb-8">Ouch!</h4>
                <div className="bg-black/20 p-8 rounded-3xl mb-8">
                    <p className="text-white font-bold text-xl leading-relaxed italic">"{current.logic}"</p>
                </div>
                <p className="text-white/80 font-black uppercase tracking-widest text-xs">Try again • Remember the case rules!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}