import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LirycznaSymfonia() {
  const playlist = ["sanah_01.json", "sanah_02.json", "sanah_03.json"]; 
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [song, setSong] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setSong(null);
    setSelectedWord(null);
    
    fetch(`/songs/${playlist[currentIndex]}`) 
      .then((res) => res.json())
      .then((data) => setSong(data))
      .catch((err) => console.error("Playlist Load Error:", err));
  }, [currentIndex]);

  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [song]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % playlist.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);

  const selectSong = (index) => {
    setCurrentIndex(index);
    setIsMenuOpen(false);
    setIsPlaying(true);
  };

  if (!song) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans antialiased">
      <audio ref={audioRef} onEnded={handleNext} preload="auto">
        <source src={song.audioUrl} type="audio/mpeg" />
      </audio>

      {/* 📂 SONG LIBRARY MENU - FULL WIDTH ON MOBILE */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200]"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-full sm:w-[85%] max-w-sm bg-slate-900 border-r border-white/10 z-[201] p-6 sm:p-8 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black italic tracking-tighter uppercase">Library</h2>
                <button onClick={() => setIsMenuOpen(false)} className="bg-white/5 px-4 py-2 rounded-lg text-slate-400 font-bold text-xs uppercase tracking-widest">Close</button>
              </div>
              <div className="space-y-3">
                {playlist.map((fileName, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSong(idx)}
                    className={`w-full text-left p-5 rounded-2xl transition-all border ${
                      currentIndex === idx 
                        ? "bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/20" 
                        : "bg-white/5 border-transparent active:bg-white/10"
                    }`}
                  >
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${currentIndex === idx ? "text-indigo-200" : "text-indigo-500"}`}>
                      Track 0{idx + 1}
                    </p>
                    <p className="font-bold text-base truncate capitalize">
                      {fileName.replace('.json', '').replace('_', ' ')}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🎵 PLAYER HEADER - MOBILE OPTIMIZED */}
      <header className="fixed top-14 left-0 right-0 z-[90] bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-3 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center gap-1 hover:bg-indigo-500/20 active:scale-90 transition-all"
            >
              <div className="w-4 h-0.5 bg-indigo-500 rounded-full" />
              <div className="w-4 h-0.5 bg-indigo-500 rounded-full" />
            </button>
            <h1 className="text-lg font-black italic tracking-tighter uppercase hidden md:block">
              Liryczna <span className="text-slate-500">Symfonia</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-4 flex-1 justify-end">
            <button onClick={handlePrev} className="p-2 text-slate-400 active:text-white active:scale-75">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>

            <div className="bg-slate-900/50 border border-white/10 p-1 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
              <button 
                onClick={togglePlay}
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-600 flex items-center justify-center active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                {isPlaying ? <span className="text-sm sm:text-lg font-black italic">II</span> : <div className="ml-1 w-0 h-0 border-t-[5px] border-t-transparent border-l-[10px] border-l-white border-b-[5px] border-b-transparent" />}
              </button>
              <div className="pr-3 max-w-[120px] sm:max-w-[180px]">
                <p className="text-[7px] font-black uppercase tracking-widest text-indigo-400 truncate hidden sm:block mb-1">{song.artist}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-100 truncate">{song.title}</p>
              </div>
            </div>

            <button onClick={handleNext} className="p-2 text-slate-400 active:text-white active:scale-75">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* 📖 MAIN CONTENT */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 p-4 md:p-8 pt-36 pb-32 items-start">
        
        {/* LYRICS COLUMN */}
        <div className="lg:col-span-7 space-y-12 sm:space-y-20">
          {song.fullLyrics.map((line, lineIdx) => (
            <motion.div 
              key={`${currentIndex}-${lineIdx}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              className="relative pl-4 sm:pl-6 border-l-2 border-white/5"
            >
              <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-x-3 sm:gap-y-2 mb-4">
                {line.words.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    onClick={() => setSelectedWord(word)}
                    className={`text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black transition-all duration-200 uppercase tracking-tighter ${
                      selectedWord?.pl === word.pl 
                        ? "text-indigo-500 scale-105" 
                        : "text-slate-200/90 hover:text-indigo-400"
                    }`}
                  >
                    {word.pl}
                  </button>
                ))}
              </div>
              <p className="text-sm sm:text-lg font-medium text-slate-500 italic">
                {line.translation}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 📚 DESKTOP VOCABULARY BOX */}
        <aside className="lg:col-span-5 hidden lg:block h-full relative min-h-[500px]">
          <div className="sticky top-40">
            <AnimatePresence mode="wait">
              {selectedWord ? (
                <motion.div
                  key={selectedWord.pl}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                  className="bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl border border-white/10"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-4 block">Definition</span>
                  <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-2 break-words leading-none">{selectedWord.pl}</h2>
                  <p className="text-2xl font-bold text-indigo-100 mb-8 border-b border-white/10 pb-6">{selectedWord.en}</p>
                  <div className="space-y-6">
                    <p className="font-bold text-white text-lg bg-black/20 px-4 py-1 rounded-full inline-block">{selectedWord.type}</p>
                    <button className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all">Forge into Memory</button>
                  </div>
                </motion.div>
              ) : (
                <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Select a word</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* 📱 MOBILE BOTTOM SHEET - UX OPTIMIZED */}
        <AnimatePresence>
          {selectedWord && (
            <>
              {/* Tap backdrop to close */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedWord(null)}
                className="lg:hidden fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed inset-x-0 bottom-0 z-[150] bg-slate-900 rounded-t-[2.5rem] p-6 pb-10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" onClick={() => setSelectedWord(null)} />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Polish</span>
                    <h2 className="text-3xl font-black italic text-white uppercase">{selectedWord.pl}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Type</span>
                    <p className="text-xs font-bold text-slate-300 uppercase">{selectedWord.type}</p>
                  </div>
                </div>
                <div className="mb-8">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">English</span>
                  <p className="text-xl font-bold text-indigo-100">{selectedWord.en}</p>
                </div>
                <button 
                  onClick={() => setSelectedWord(null)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-transform"
                >
                  Got it
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}