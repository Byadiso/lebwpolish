import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { READING_VAULT } from "../data/readingVault";

export default function PolishReadingEngine() {
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showGrammarNote, setShowGrammarNote] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const activeData = READING_VAULT.find((t) => t.id === selectedTextId);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    activeData.questions.forEach((q) => {
      if (answers[q.id] === q.correct) score++;
    });
    return score;
  };

  /**
   * Renders the text by splitting it into individual words.
   * If a word exists in the glossary, it highlights it.
   * If not, it still allows clicking for a general meaning (placeholder).
   */
  const renderInteractiveText = (text, glossary = {}) => {
    const words = text.split(/(\s+)/); // Keep spaces for correct formatting

    return words.map((part, i) => {
      // Clean word of punctuation for matching
      const cleanWord = part.toLowerCase().replace(/[.,„”()]/g, "").trim();
      const hasDefinition = glossary && glossary[cleanWord];

      if (cleanWord.length > 0) {
        return (
          <span key={i} className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === i ? null : i);
              }}
              className={`transition-colors px-0.5 rounded cursor-help ${
                hasDefinition 
                  ? "text-indigo-400 font-bold border-b border-indigo-500/50 hover:bg-indigo-500/10" 
                  : "hover:text-indigo-300"
              }`}
            >
              {part}
            </button>
            <AnimatePresence>
              {activeTooltip === i && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-3 bg-indigo-600 text-[11px] leading-tight rounded-xl shadow-2xl z-50 text-white not-italic font-sans text-center"
                >
                  <p className="font-black uppercase mb-1 border-b border-white/20 pb-1">
                    {hasDefinition ? "Znaczenie" : "Słowo"}
                  </p>
                  {hasDefinition || "Kliknięto słowo (Brak w słowniku)"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-indigo-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        );
      }
      return part;
    });
  };

  // --- MENU VIEW ---
  if (!selectedTextId) {
    return (
      <div className="w-full bg-[#020617] min-h-screen text-white">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          <header className="mb-16 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
              B1 READING <span className="text-indigo-500 font-serif">CODEX</span>
            </h1>
            <div className="h-1.5 w-32 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.6)]" />
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {READING_VAULT.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTextId(item.id)}
                className="relative bg-[#0f172a] border border-white/10 p-8 rounded-[2.5rem] text-left hover:border-indigo-500/50 hover:bg-[#1e293b] transition-all group overflow-hidden shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span 
                    onClick={(e) => toggleFavorite(e, item.id)}
                    className={`text-2xl cursor-pointer p-2 rounded-full hover:bg-white/5 transition-colors ${favorites.includes(item.id) ? 'text-indigo-500' : 'text-slate-700'}`}
                  >
                    {favorites.includes(item.id) ? "★" : "☆"}
                  </span>
                </div>
                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">{item.category}</h3>
                <h2 className="text-2xl font-bold mb-6 leading-tight group-hover:text-indigo-100 transition-colors">{item.title}</h2>
                <div className="mt-auto flex items-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <span>View Analysis</span>
                  <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SIMULATOR VIEW ---
  return (
    <div className="w-full bg-[#020617] min-h-screen text-white" onClick={() => setActiveTooltip(null)}>
      <div className="max-w-4xl mx-auto p-4 md:p-10">
        <header className="mb-8 border-b border-white/10 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
              B1 <span className="text-indigo-500 font-serif">Simulator</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em]">{activeData.title}</p>
          </div>
          <button
            onClick={() => { setSelectedTextId(null); setShowGrammarNote(false); setShowResults(false); setIsStarted(false); setAnswers({}); }}
            className="text-[10px] font-black bg-slate-900 border border-white/10 hover:bg-slate-800 px-5 py-2.5 rounded-full uppercase tracking-widest transition-all"
          >
            Exit Codex
          </button>
        </header>

        {!isStarted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a] p-8 md:p-16 rounded-[3.5rem] border border-white/5 text-center shadow-2xl">
            <div className="text-8xl mb-6">{activeData.icon}</div>
            <h2 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tight">{activeData.title}</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed italic">
              "Deep analysis mode engaged. Verify facts, identify linguistic traps, and master the B1 lexicon."
            </p>
            <button
              onClick={() => setIsStarted(true)}
              className="bg-indigo-600 hover:bg-indigo-500 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] active:scale-95"
            >
              Start Analysis
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6 md:space-y-12 pb-20" onClick={(e) => e.stopPropagation()}>
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="bg-[#0f172a] p-6 md:p-14 rounded-[3rem] border border-indigo-500/20 leading-relaxed text-xl md:text-2xl italic font-serif shadow-2xl relative"
            >
              <div className="text-slate-100">
                {renderInteractiveText(activeData.text, activeData.glossary)}
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest italic order-2 sm:order-1 flex items-center">
                    <span className="mr-2 text-base">💡</span> Click terms for B1 meaning
                  </p>
                  {activeData.grammarNote && (
                    <button 
                      onClick={() => setShowGrammarNote(!showGrammarNote)}
                      className="w-full sm:w-auto text-[10px] font-black uppercase bg-indigo-600/10 hover:bg-indigo-600/20 px-6 py-3 rounded-full border border-indigo-500/30 transition-all order-1 sm:order-2 text-indigo-300"
                    >
                      {showGrammarNote ? "Close Grammar Insight" : "View Grammar Insight"}
                    </button>
                  )}
              </div>

              <AnimatePresence>
                {showGrammarNote && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-8 p-6 bg-indigo-950/30 rounded-[2rem] border border-indigo-500/10 text-sm md:text-base text-indigo-100 not-italic leading-relaxed">
                      <span className="font-black uppercase text-indigo-400 block mb-3 tracking-widest text-xs underline underline-offset-8">Grammar Spotlight</span>
                      {activeData.grammarNote}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="space-y-6">
              {activeData.questions.map((q, idx) => (
                <div key={q.id} className="bg-[#0f172a] p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <p className="font-bold mb-8 text-slate-100 text-lg md:text-xl leading-snug">
                    <span className="text-indigo-500 mr-3 opacity-50">0{idx + 1}.</span> {q.q}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      const isCorrect = opt === q.correct;
                      return (
                        <button
                          key={opt}
                          disabled={showResults}
                          onClick={() => handleSelect(q.id, opt)}
                          className={`py-5 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                            showResults
                              ? isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : isSelected ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900 border-white/5 opacity-30"
                              : isSelected ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]" : "bg-slate-900 border-white/5 hover:border-slate-500 hover:bg-slate-800"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(answers).length < activeData.questions.length}
                className="w-full py-7 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-2xl disabled:opacity-10 disabled:grayscale"
              >
                Submit Analysis
              </button>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12 bg-indigo-700 rounded-[3.5rem] shadow-2xl">
                <h3 className="text-4xl font-black uppercase italic mb-3 tracking-tighter">Result: {calculateScore()} / {activeData.questions.length}</h3>
                <p className="text-indigo-200 text-[11px] mb-10 font-black uppercase tracking-[0.3em]">Module Competency Achieved</p>
                <button
                  onClick={() => { setIsStarted(false); setShowResults(false); setAnswers({}); setSelectedTextId(null); setShowGrammarNote(false); }}
                  className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
                >
                  Return to Codex
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}