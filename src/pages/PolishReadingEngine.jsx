import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PolishReadingEngine() {
  const [story, setStory] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isLoadingDef, setIsLoadingDef] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("polish_engine_last_page");
    return savedPage ? parseInt(savedPage, 10) : 0;
  });

  // Helper: Clean punctuation from words
  const cleanString = (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();

  // Load Story
  useEffect(() => {
    fetch("/stories/mala_syrenka.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load JSON");
        return res.json();
      })
      .then((data) => setStory(data))
      .catch((err) => console.error("Story Load Error:", err));
  }, []);

  // Sync Flashcards from LocalStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("polish_flashcards") || "[]");
    setFlashcards(saved);
  }, [showFlashcards]);

  // Handle Persistence & Global Keyboard Shortcuts
  useEffect(() => {
    localStorage.setItem("polish_engine_last_page", currentPage);
    if (!showFlashcards) window.scrollTo({ top: 0, behavior: "smooth" });

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setSelectedWord(null);
        setShowFlashcards(false);
      }
      if (!showFlashcards && !selectedWord) {
        if (e.key === "ArrowRight" && currentPage < (story?.pages?.length - 1)) setCurrentPage(p => p + 1);
        if (e.key === "ArrowLeft" && currentPage > 0) setCurrentPage(p => p - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, story, showFlashcards, selectedWord]);

  // Block scrolling when overlays are active
  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || selectedWord || showFlashcards) ? 'hidden' : 'unset';
  }, [isMenuOpen, selectedWord, showFlashcards]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "pl-PL";
    msg.rate = 0.85;
    window.speechSynthesis.speak(msg);
  }, []);

  const handleWordClick = async (rawWord) => {
    const cleanWord = cleanString(rawWord);
    
    // Check local JSON vocabulary first
    if (story.vocabulary && story.vocabulary[cleanWord]) {
      setSelectedWord({ pl: rawWord, ...story.vocabulary[cleanWord] });
      setIsSaved(false);
      return;
    }

    // Fallback: Dictionary API
    setSelectedWord({ pl: rawWord, en: "Searching...", desc: "Consulting dictionary...", type: "..." });
    setIsLoadingDef(true);
    setIsSaved(false);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      const data = await response.json();
      
      if (data.title === "No Definitions Found") {
        setSelectedWord({ pl: rawWord, en: "Word detected", desc: "No online definition found.", type: "Polish" });
      } else {
        setSelectedWord({
          pl: rawWord,
          en: data[0].meanings[0].definitions[0].definition,
          type: data[0].meanings[0].partOfSpeech,
          desc: "Automatic dictionary definition."
        });
      }
    } catch (error) {
      setSelectedWord({ pl: rawWord, en: "Lookup Failed", desc: "Check connection.", type: "Error" });
    } finally {
      setIsLoadingDef(false);
    }
  };

  const handleSaveFlashcard = () => {
    if (!selectedWord) return;
    const existing = JSON.parse(localStorage.getItem("polish_flashcards") || "[]");
    const isAlreadySaved = existing.some(item => cleanString(item.pl) === cleanString(selectedWord.pl));
    
    if (!isAlreadySaved) {
      const newList = [...existing, { ...selectedWord, id: Date.now() }];
      localStorage.setItem("polish_flashcards", JSON.stringify(newList));
      setFlashcards(newList);
    }
    setIsSaved(true);
  };

  const removeFlashcard = (id) => {
    const newList = flashcards.filter(card => card.id !== id);
    localStorage.setItem("polish_flashcards", JSON.stringify(newList));
    setFlashcards(newList);
    if (cardIndex >= newList.length && newList.length > 0) setCardIndex(newList.length - 1);
    setIsFlipped(false);
  };

  if (!story || !story.pages) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageData = story.pages[currentPage];
  const progress = ((currentPage + 1) / story.pages.length) * 100;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans antialiased relative overflow-x-hidden">
      
      {/* 🧭 ENGINE NAV */}
      <nav className="fixed top-[64px] inset-x-0 h-24 bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 z-[50] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="group w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center gap-1.5 hover:bg-indigo-500/20 transition-all cursor-pointer"
          >
            <div className={`h-0.5 bg-indigo-400 rounded-full transition-all ${isMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
            <div className={`w-4 h-0.5 bg-indigo-400 rounded-full transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <div className={`h-0.5 bg-indigo-400 rounded-full transition-all ${isMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-6'}`} />
          </button>
          <div className="hidden md:block">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 italic leading-none mb-1">PolishReadingEngine</h1>
            <p className="text-base font-bold text-slate-200 truncate max-w-[200px]">{story.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Progress</p>
            <div className="flex items-center gap-3 justify-end">
                <span className="text-sm font-bold text-indigo-400">{Math.round(progress)}%</span>
                <span className="text-[10px] text-slate-600 font-bold uppercase">Page {currentPage + 1}/{story.pages.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white/5 rounded-xl disabled:opacity-10 hover:bg-white/10 active:scale-90 transition-all cursor-pointer border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button disabled={currentPage === story.pages.length - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-indigo-600 rounded-xl disabled:opacity-10 hover:bg-indigo-500 active:scale-90 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 h-[3px] bg-white/5 w-full">
            <motion.div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </nav>

      {/* 📖 CONTENT CONTAINER */}
      <motion.main 
        animate={{ x: isMenuOpen ? 320 : 0, opacity: isMenuOpen ? 0.3 : 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="max-w-4xl mx-auto pt-64 pb-48 px-6"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage} 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-16"
          >
            {pageData.paragraphs.map((para, pIdx) => (
              <p key={pIdx} className="text-3xl md:text-5xl leading-[1.7] text-slate-100 font-serif font-medium">
                {para.split(" ").map((word, wIdx) => (
                  <span
                    key={wIdx}
                    onClick={() => handleWordClick(word)}
                    className="inline-block cursor-pointer hover:text-indigo-400 transition-all mr-[0.3em] border-b-2 border-transparent hover:border-indigo-500/40 rounded-sm active:scale-95"
                  >
                    {word}
                  </span>
                ))}
              </p>
            ))}

            <div className="mt-40 pt-20 border-t border-white/10">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-500/60 mb-8 block text-center">English Translation</span>
                <p className="text-slate-400 text-xl md:text-2xl italic leading-relaxed text-center max-w-3xl mx-auto font-serif">{pageData.translation}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* 📑 CHAPTER MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-x-0 bottom-0 z-[100] top-[160px]"> 
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" 
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-full max-w-[320px] bg-slate-900 border-r border-white/10 p-8 overflow-y-auto shadow-2xl h-full flex flex-col"
            >
              <div className="mb-10">
                <h2 className="text-2xl font-black text-white italic tracking-tighter">ENGINE</h2>
                <div className="w-10 h-1 bg-indigo-500 mt-2 rounded-full" />
              </div>

              <button 
                onClick={() => { setShowFlashcards(true); setIsMenuOpen(false); }}
                className="w-full mb-8 p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center gap-4 hover:bg-indigo-600/20 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10M7 12h10M7 16h10" /></svg>
                </div>
                <div className="text-left">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Review</p>
                    <p className="text-sm font-bold text-white">Flashcards</p>
                </div>
              </button>

              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Chapters</p>
                <div className="grid grid-cols-4 gap-3">
                    {story.pages.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setCurrentPage(idx); setIsMenuOpen(false); }}
                        className={`h-12 rounded-xl font-black transition-all border cursor-pointer text-sm ${
                        currentPage === idx 
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30" 
                        : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-white"
                        }`}
                    >
                        {idx + 1}
                    </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📑 FLASHCARD REVIEW OVERLAY */}
      <AnimatePresence>
        {showFlashcards && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[3000] bg-[#020617] flex flex-col items-center justify-center p-6"
            >
                <button 
                    onClick={() => setShowFlashcards(false)}
                    className="absolute top-8 right-8 p-4 text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest text-xs flex items-center gap-2 cursor-pointer"
                >
                    Close <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>

                {flashcards.length > 0 ? (
                    <div className="w-full max-w-lg">
                        <div className="mb-12 text-center">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block mb-2">Practice Mode</span>
                            <h2 className="text-3xl font-black italic text-white uppercase">Flashcards</h2>
                            <p className="text-slate-500 text-sm mt-2 font-bold">{cardIndex + 1} of {flashcards.length} words</p>
                        </div>

                        <div className="relative h-[400px] perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                            <motion.div 
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                className="w-full h-full relative preserve-3d"
                            >
                                <div className="absolute inset-0 backface-hidden bg-slate-900 border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-10 shadow-2xl">
                                    <span className="text-[10px] font-black text-indigo-500/50 uppercase tracking-widest absolute top-10">Polish</span>
                                    <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter text-center">
                                        {cleanString(flashcards[cardIndex].pl)}
                                    </h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); speak(flashcards[cardIndex].pl); }}
                                        className="mt-8 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                                    </button>
                                    <p className="absolute bottom-10 text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Tap to flip</p>
                                </div>

                                <div className="absolute inset-0 backface-hidden bg-indigo-600 border border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center p-10 shadow-2xl rotate-y-180">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest absolute top-10">Definition</span>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white leading-tight mb-4">{flashcards[cardIndex].en}</p>
                                        <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">
                                            {flashcards[cardIndex].type}
                                        </span>
                                    </div>
                                    <p className="absolute bottom-10 text-white/40 text-[10px] font-black uppercase tracking-widest italic">Tap to hide</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button 
                                onClick={() => { setCardIndex((cardIndex - 1 + flashcards.length) % flashcards.length); setIsFlipped(false); }}
                                className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => removeFlashcard(flashcards[cardIndex].id)}
                                className="px-8 py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                            >
                                Mastered
                            </button>
                            <button 
                                onClick={() => { setCardIndex((cardIndex + 1) % flashcards.length); setIsFlipped(false); }}
                                className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center max-w-xs">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Deck Empty</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8">Save words while reading to build your custom vocabulary list.</p>
                        <button onClick={() => setShowFlashcards(false)} className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer">Return to Story</button>
                    </div>
                )}
            </motion.div>
        )}
      </AnimatePresence>

      {/* 📑 WORD MODAL CARD */}
      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedWord(null)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8 md:hidden" />
              <div className="flex justify-between items-start gap-4 mb-8">
                <div className={`flex-1 ${isLoadingDef ? "animate-pulse" : ""}`}>
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">{cleanString(selectedWord.pl)}</h2>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">{selectedWord.type}</span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium tracking-wide">Polish Vocabulary</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => speak(selectedWord.pl)} className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/40 cursor-pointer hover:bg-indigo-500 transition-colors">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                </motion.button>
              </div>
              <div className="space-y-6">
                <div className="bg-white/[0.03] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-inner backdrop-blur-sm">
                  <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest block mb-2">Definition</span>
                  <p className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">{selectedWord.en}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button onClick={handleSaveFlashcard} disabled={isSaved} className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all border flex items-center justify-center gap-2 ${isSaved ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer"}`}>
                    {isSaved ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> Saved</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> Save Flashcard</>}
                  </motion.button>
                  <button onClick={() => setSelectedWord(null)} className="flex-1 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all cursor-pointer hover:bg-slate-100 shadow-xl">Dismiss</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}