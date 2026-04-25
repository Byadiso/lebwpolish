import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#6366f1";
const NAVBAR_H = 30;   // your existing navbar height in px — adjust if needed
const PLAYER_H = 62;   // the player bar height
const TOP_OFFSET = NAVBAR_H + PLAYER_H; // 118px total before content starts

// ── Animated bars ─────────────────────────────────────────────────────────────
function NowPlayingBars({ active }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 13 }}>
      {[0.6, 1, 0.4].map((h, i) => (
        <motion.span
          key={i}
          animate={active ? { scaleY: [h, 1, 0.3, 0.9, h] } : { scaleY: 0.3 }}
          transition={active ? { duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" } : { duration: 0.3 }}
          style={{ display: "block", width: 3, height: "100%", borderRadius: 2, background: ACCENT, transformOrigin: "bottom" }}
        />
      ))}
    </span>
  );
}

// ── Seekable progress bar ─────────────────────────────────────────────────────
function AudioProgress({ audioRef }) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const barRef = useRef(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    return () => { el.removeEventListener("timeupdate", onTime); el.removeEventListener("loadedmetadata", onMeta); };
  }, [audioRef]);

  const seek = (e) => {
    if (!barRef.current || !audioRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  };

  const fmt = (s) => !s || isNaN(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div ref={barRef} onClick={seek}
        style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 9999, cursor: "pointer", position: "relative" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25, ease: "linear" }}
          style={{ position: "absolute", top: 0, left: 0, height: "100%", background: ACCENT, borderRadius: 9999 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", fontVariantNumeric: "tabular-nums" }}>{fmt(progress)}</span>
        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", fontVariantNumeric: "tabular-nums" }}>{fmt(duration)}</span>
      </div>
    </div>
  );
}

// ── Word tap ripple ───────────────────────────────────────────────────────────
function WordRipple({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.span key={trigger}
          initial={{ scale: 0.5, opacity: 0.5 }} animate={{ scale: 2.2, opacity: 0 }} exit={{}}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, borderRadius: 6, background: "rgba(99,102,241,0.22)", pointerEvents: "none" }}
        />
      )}
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LirycznaSymfonia() {
  const playlist = ["sanah_01.json", "sanah_02.json", "sanah_03.json"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [song, setSong] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordsLearned, setWordsLearned] = useState(new Set());
  const [lastTapped, setLastTapped] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setSong(null);
    setSelectedWord(null);
    fetch(`/songs/${playlist[currentIndex]}`)
      .then(r => r.json())
      .then(setSong)
      .catch(console.error);
  }, [currentIndex]);

  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [song]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.paused ? el.play().then(() => setIsPlaying(true)).catch(() => {}) : (el.pause(), setIsPlaying(false));
  }, []);

  const handleNext = useCallback(() => setCurrentIndex(p => (p + 1) % playlist.length), []);
  const handlePrev = useCallback(() => setCurrentIndex(p => (p - 1 + playlist.length) % playlist.length), []);
  const selectSong = (idx) => { setCurrentIndex(idx); setIsMenuOpen(false); setIsPlaying(true); };

  const tapWord = (word) => {
    setSelectedWord(prev => prev?.pl === word.pl ? null : word);
    setLastTapped(word.pl + Date.now());
  };

  const saveWord = () => {
    if (!selectedWord) return;
    setWordsLearned(prev => new Set([...prev, selectedWord.pl]));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  if (!song) return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.15)", borderTopColor: ACCENT }} />
    </div>
  );

  const learnedCount = wordsLearned.size;

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(99,102,241,0.35); }
        .word-btn {
          position: relative; display: inline-block;
          background: none; border: none; cursor: pointer;
          padding: 2px 3px; border-radius: 5px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; letter-spacing: -0.02em; line-height: 1.2;
          transition: color 0.15s;
        }
        .word-btn:hover { color: #a5b4fc !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 9999px; }
      `}</style>

      <audio ref={audioRef} onEnded={handleNext} preload="auto">
        <source src={song.audioUrl} type="audio/mpeg" />
      </audio>

      {/* ── LIBRARY DRAWER ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 400 }}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed", left: 0, top: 0, bottom: 0,
                width: "min(320px, 88vw)",
                background: "#090f1e",
                borderRight: "1px solid rgba(99,102,241,0.14)",
                zIndex: 401, padding: "2rem 1.5rem",
                overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.5)", marginBottom: 4 }}>Song library</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#e2e8f0" }}>Playlist</h2>
                </div>
                <button onClick={() => setIsMenuOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.6)", cursor: "pointer", fontSize: 13 }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {playlist.map((fileName, idx) => {
                  const active = currentIndex === idx;
                  return (
                    <button key={idx} onClick={() => selectSong(idx)} style={{
                      display: "flex", alignItems: "center", gap: 12, width: "100%",
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${active ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.05)"}`,
                      transition: "background 0.18s",
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: active ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {active ? <NowPlayingBars active={isPlaying} /> : <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(148,163,184,0.35)", fontWeight: 700 }}>0{idx + 1}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: active ? "rgba(99,102,241,0.65)" : "rgba(148,163,184,0.3)", marginBottom: 3 }}>Track 0{idx + 1}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#c7d2fe" : "rgba(226,232,240,0.6)", textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {fileName.replace(".json", "").replace(/_/g, " ")}
                        </div>
                      </div>
                      {active && <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0, boxShadow: `0 0 8px ${ACCENT}` }} />}
                    </button>
                  );
                })}
              </div>

              {learnedCount > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: "auto", padding: "12px 14px", borderRadius: 12, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>🏆</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6ee7b7" }}>{learnedCount} word{learnedCount > 1 ? "s" : ""} saved</div>
                    <div style={{ fontSize: 10, color: "rgba(110,231,183,0.45)", marginTop: 1 }}>Keep exploring!</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PLAYER BAR — sits directly under the existing navbar ─────────────
           top: NAVBAR_H = 56px  →  matches your app's top-14 (3.5rem = 56px)  */}
      <header style={{
        position: "fixed",
        top: NAVBAR_H,
        left: 0, right: 0,
        zIndex: 90,                           // below your navbar (assumed z-[90]+)
        height: PLAYER_H,
        background: "rgba(2,6,23,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center",
        padding: "0 16px",
      }}>
        <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>

          {/* Menu toggle */}
          <button onClick={() => setIsMenuOpen(true)} style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            color: ACCENT, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <span style={{ display: "block", width: 15, height: 2, background: "currentColor", borderRadius: 2 }} />
            <span style={{ display: "block", width: 15, height: 2, background: "currentColor", borderRadius: 2 }} />
          </button>

          {/* App name — hidden on small screens */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexShrink: 0 }} className="ls-title">
            <style>{`.ls-title{display:none!important}@media(min-width:640px){.ls-title{display:flex!important}}`}</style>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap" }}>Liryczna</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(148,163,184,0.28)", whiteSpace: "nowrap" }}>Symfonia</span>
          </div>

          {/* Controls pill */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 13, padding: "7px 14px", minWidth: 0,
          }}>
            <button onClick={handlePrev} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.4)", padding: "2px 4px", flexShrink: 0, display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
            </button>

            <motion.button whileTap={{ scale: 0.9 }} onClick={togglePlay} style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: ACCENT, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
              boxShadow: isPlaying ? "0 0 18px rgba(99,102,241,0.45)" : "none",
              transition: "box-shadow 0.3s",
            }}>
              {isPlaying
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              }
            </motion.button>

            <button onClick={handleNext} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.4)", padding: "2px 4px", flexShrink: 0, display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18 14.5 12 6 6v12zm10-12v12h2V6h-2z" /></svg>
            </button>

            {/* Track info + progress */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              {isPlaying && <span style={{ flexShrink: 0 }}><NowPlayingBars active={true} /></span>}
              <div style={{ flexShrink: 0, minWidth: 0, maxWidth: 160 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(99,102,241,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.artist}</div>
              </div>
              <AudioProgress audioRef={audioRef} />
            </div>
          </div>

          {/* Words saved badge */}
          <AnimatePresence>
            {learnedCount > 0 && (
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 9, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 10 }}>✦</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#6ee7b7" }}>{learnedCount}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────────── */}
      {/*  paddingTop = NAVBAR_H + PLAYER_H + 24px breathing room = 142px        */}
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        paddingTop: TOP_OFFSET + 24,
        paddingBottom: "6rem",
        paddingLeft: 24, paddingRight: 24,
        display: "grid",
        /* 
          Two columns on ≥1024px: lyrics left, vocab right.
          minmax(0,…) prevents lyrics from overflowing into the vocab column.
        */
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: 32,
      }}
        className="ls-main"
      >
        <style>{`
          @media(min-width:1024px){
            .ls-main {
              grid-template-columns: minmax(0, 1fr) 380px !important;
              align-items: start;
            }
          }
          @media(max-width:1023px){
            .ls-vocab-desktop { display: none !important; }
          }
        `}</style>

        {/* ── LEFT: LYRICS ─────────────────────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>  {/* minWidth:0 is critical — forces the column to respect its grid lane */}

          {/* Song title */}
          <div style={{ marginBottom: "2.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(99,102,241,0.5)", marginBottom: 8 }}>Now reading</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.05, color: "#f1f5f9", letterSpacing: "-0.01em", marginBottom: 6 }}>
              {song.title}
            </h1>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(148,163,184,0.35)" }}>{song.artist}</p>
          </div>

          {/* Lyric lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {song.fullLyrics.map((line, lineIdx) => (
              <motion.div
                key={`${currentIndex}-${lineIdx}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-6%" }}
                transition={{ duration: 0.4, delay: Math.min(lineIdx * 0.04, 0.25) }}
                style={{ paddingLeft: "1rem", borderLeft: "2px solid rgba(255,255,255,0.04)" }}
              >
                {/* Words — flex-wrap so they stay within column */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 6px", marginBottom: 10 }}>
                  {line.words.map((word, wIdx) => {
                    const isSelected = selectedWord?.pl === word.pl;
                    const isLearned = wordsLearned.has(word.pl);
                    return (
                      <span key={wIdx} style={{ position: "relative", display: "inline-block" }}>
                        {isSelected && <WordRipple trigger={lastTapped} />}
                        <button
                          className="word-btn"
                          onClick={() => tapWord(word)}
                          style={{
                            fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
                            color: isLearned ? "#6ee7b7" : isSelected ? "#818cf8" : "rgba(226,232,240,0.85)",
                          }}
                        >
                          {word.pl}
                          {/* Green dot for saved words */}
                          {isLearned && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                              style={{ position: "absolute", top: 0, right: -2, width: 7, height: 7, borderRadius: "50%", background: "#6ee7b7", boxShadow: "0 0 5px #6ee7b7" }} />
                          )}
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Translation — italic, muted */}
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(0.78rem, 1.8vw, 0.95rem)", color: "rgba(148,163,184,0.38)", lineHeight: 1.65 }}>
                  {line.translation}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: VOCAB — fixed so it doesn't scroll away ───────────────── */}
        {/*
          The <aside> in the grid reserves the 380px column.
          The inner div is position:fixed so it stays on screen while scrolling,
          but is sized to match the reserved column.
        */}
        <aside className="ls-vocab-desktop" style={{ position: "relative", height: 1 }}>
          <div style={{
            position: "fixed",
            top: TOP_OFFSET + 24,
            right: 0,
            width: 380,
            padding: "0 24px 0 0",
            maxHeight: `calc(100vh - ${TOP_OFFSET + 40}px)`,
            overflowY: "auto",
          }}
            className="ls-vocab-inner"
          >
            <style>{`
              @media(min-width:1280px){
                .ls-vocab-inner {
                  right: calc(50vw - 640px) !important;
                }
              }
              .ls-vocab-inner::-webkit-scrollbar { width: 3px; }
              .ls-vocab-inner::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 9999px; }
            `}</style>

            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.45)", marginBottom: 12 }}>Vocabulary</div>

            <AnimatePresence mode="wait">
              {selectedWord ? (
                <motion.div
                  key={selectedWord.pl}
                  initial={{ y: 10, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -8, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    background: "#0c1427",
                    border: "1px solid rgba(99,102,241,0.24)",
                    borderRadius: 20, padding: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(99,102,241,0.55)" }}>Polish</span>
                    <button onClick={() => setSelectedWord(null)}
                      style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(148,163,184,0.4)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ✕
                    </button>
                  </div>

                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)", color: "#f1f5f9", lineHeight: 1.05, marginBottom: "0.5rem", wordBreak: "break-word" }}>
                    {selectedWord.pl}
                  </h2>

                  <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#a5b4fc", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {selectedWord.en}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ padding: "4px 11px", borderRadius: 9999, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(165,180,252,0.6)" }}>
                      {selectedWord.type}
                    </span>
                    <motion.button whileTap={{ scale: 0.94 }} onClick={saveWord} style={{
                      padding: "7px 16px", borderRadius: 10, cursor: "pointer",
                      background: wordsLearned.has(selectedWord.pl) ? "rgba(52,211,153,0.1)" : "rgba(99,102,241,0.12)",
                      border: `1px solid ${wordsLearned.has(selectedWord.pl) ? "rgba(52,211,153,0.28)" : "rgba(99,102,241,0.28)"}`,
                      color: wordsLearned.has(selectedWord.pl) ? "#6ee7b7" : "#a5b4fc",
                      fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em",
                      transition: "all 0.2s",
                    }}>
                      {wordsLearned.has(selectedWord.pl) ? "✓ Saved" : "Save word"}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {savedFlash && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        style={{ marginTop: 12, padding: "9px 14px", borderRadius: 10, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)", fontSize: 11, fontWeight: 700, color: "#6ee7b7", textAlign: "center", letterSpacing: "0.04em" }}>
                        🌟 Added to your vocab list!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ border: "1.5px dashed rgba(255,255,255,0.05)", borderRadius: 20, padding: "2.5rem 1.5rem", textAlign: "center" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", margin: "0 auto 12px", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.13)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(99,102,241,0.45)">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(148,163,184,0.22)", marginBottom: 4 }}>Tap any word</p>
                  <p style={{ fontSize: 11, color: "rgba(148,163,184,0.16)" }}>to explore its meaning</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* ── MOBILE BOTTOM SHEET ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedWord && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              className="ls-mobile-only"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 150, background: "#0d1526", borderTop: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px 20px 0 0", padding: "0 1.25rem 2.5rem" }}
              className="ls-mobile-only"
            >
              <style>{`@media(min-width:1024px){.ls-mobile-only{display:none!important}}`}</style>

              <div onClick={() => setSelectedWord(null)} style={{ width: 34, height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.1)", margin: "13px auto 18px", cursor: "pointer" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.55)", marginBottom: 4 }}>Polish</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.7rem, 7vw, 2.3rem)", color: "#f1f5f9", lineHeight: 1 }}>
                    {selectedWord.pl}
                  </h2>
                </div>
                <span style={{ marginTop: 4, padding: "4px 10px", borderRadius: 9999, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(165,180,252,0.6)" }}>
                  {selectedWord.type}
                </span>
              </div>

              <div style={{ marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.55)", marginBottom: 4 }}>English</div>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "#a5b4fc" }}>{selectedWord.en}</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setSelectedWord(null)} style={{ flex: 1, padding: 13, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(148,163,184,0.5)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer" }}>
                  Dismiss
                </button>
                <button onClick={() => { saveWord(); setSelectedWord(null); }} style={{
                  flex: 2, padding: 13, borderRadius: 12,
                  background: wordsLearned.has(selectedWord.pl) ? "rgba(52,211,153,0.1)" : "rgba(99,102,241,0.12)",
                  border: `1px solid ${wordsLearned.has(selectedWord.pl) ? "rgba(52,211,153,0.28)" : "rgba(99,102,241,0.28)"}`,
                  color: wordsLearned.has(selectedWord.pl) ? "#6ee7b7" : "#a5b4fc",
                  fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer",
                }}>
                  {wordsLearned.has(selectedWord.pl) ? "✓ Saved" : "Save word"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}