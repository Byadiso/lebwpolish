import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const ACCENT      = "#6366f1";
const ACCENT_GLOW = "rgba(99,102,241,0.35)";
const ACCENT_SOFT = "rgba(99,102,241,0.1)";
const ACCENT_MID  = "rgba(99,102,241,0.22)";
const GREEN       = "#34d399";
const BG          = "#020617";
const SURFACE     = "#080f1f";
const CARD        = "#0c1427";

/*
  NAVBAR_H — height of the existing app navbar in px.
  Adjust this single constant to match your navbar.
  The player bar will sit flush beneath it via paddingTop on the page wrapper.
*/
const NAVBAR_H = 56;   // e.g. top-14 = 3.5rem = 56px
const PLAYER_H = 68;

/* ─── Animated EQ bars ──────────────────────────────────────────────────── */
function EqBars({ active, color = ACCENT, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2.5, height: size }}>
      {[0.55, 1, 0.38, 0.75].map((h, i) => (
        <motion.span
          key={i}
          animate={active
            ? { scaleY: [h, 1, 0.25, 0.85, h], opacity: [0.7, 1, 0.6, 1, 0.7] }
            : { scaleY: 0.25, opacity: 0.3 }}
          transition={active
            ? { duration: 0.75, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }
            : { duration: 0.3 }}
          style={{
            display: "block", width: 3, height: "100%",
            borderRadius: 2, background: color, transformOrigin: "bottom",
          }}
        />
      ))}
    </span>
  );
}

/* ─── Seekable progress bar ─────────────────────────────────────────────── */
function AudioProgress({ audioRef }) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered]   = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  }, [audioRef]);

  const seek = (e) => {
    if (!barRef.current || !audioRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    audioRef.current.currentTime =
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  };

  const fmt  = (s) => (!s || isNaN(s)) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct  = duration ? (progress / duration) * 100 : 0;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        ref={barRef}
        onClick={seek}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: hovered ? 5 : 3, background: "rgba(255,255,255,0.07)",
          borderRadius: 9999, cursor: "pointer", position: "relative",
          transition: "height 0.15s ease",
        }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25, ease: "linear" }}
          style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            background: `linear-gradient(90deg, ${ACCENT}, #818cf8)`,
            borderRadius: 9999,
          }}
        />
        {/* Scrubber thumb */}
        <motion.div
          animate={{ left: `${pct}%`, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "linear" }}
          style={{
            position: "absolute", top: "50%",
            transform: "translate(-50%, -50%)",
            width: 11, height: 11, borderRadius: "50%",
            background: "#fff",
            boxShadow: `0 0 0 2px ${ACCENT}`,
            transition: "opacity 0.15s",
            pointerEvents: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.38)", fontVariantNumeric: "tabular-nums", fontFamily: "monospace" }}>{fmt(progress)}</span>
        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.22)", fontVariantNumeric: "tabular-nums", fontFamily: "monospace" }}>{fmt(duration)}</span>
      </div>
    </div>
  );
}

/* ─── Word tap ripple ───────────────────────────────────────────────────── */
function WordRipple({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.span
          key={trigger}
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 2.4, opacity: 0 }}
          exit={{}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: 8,
            background: "rgba(99,102,241,0.2)", pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Vocab card ────────────────────────────────────────────────────────── */
function VocabCard({ word, isLearned, onSave, onClose, savedFlash }) {
  return (
    <motion.div
      key={word.pl}
      initial={{ y: 12, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -8, opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        background: CARD, border: `1px solid ${ACCENT_MID}`,
        borderRadius: 22, overflow: "hidden",
      }}
    >
      {/* Colour strip */}
      <div style={{
        height: 3,
        background: isLearned
          ? `linear-gradient(90deg, ${GREEN}, #6ee7b7)`
          : `linear-gradient(90deg, ${ACCENT}, #818cf8)`,
      }} />

      <div style={{ padding: "1.4rem 1.5rem" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.3em", color: "rgba(99,102,241,0.55)",
          }}>Polish</span>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(148,163,184,0.4)", cursor: "pointer",
              fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Polish word */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontStyle: "italic", lineHeight: 1.05, marginBottom: "0.5rem",
          fontSize: "clamp(2rem, 3vw, 2.6rem)", color: "#f1f5f9",
          wordBreak: "break-word",
        }}>{word.pl}</h2>

        {/* Type badge */}
        <span style={{
          display: "inline-block", marginBottom: "0.9rem",
          padding: "3px 10px", borderRadius: 9999,
          background: ACCENT_SOFT, border: `1px solid ${ACCENT_MID}`,
          fontSize: 9, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.18em", color: "rgba(165,180,252,0.7)",
        }}>{word.type}</span>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: "0.9rem" }} />

        {/* English */}
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(148,163,184,0.3)", marginBottom: 5 }}>English</p>
          <p style={{ fontSize: "1.15rem", fontWeight: 600, color: "#a5b4fc", lineHeight: 1.4 }}>{word.en}</p>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onSave}
          style={{
            width: "100%", padding: "11px", borderRadius: 12, cursor: "pointer",
            background: isLearned ? "rgba(52,211,153,0.1)" : ACCENT_SOFT,
            border: `1px solid ${isLearned ? "rgba(52,211,153,0.3)" : ACCENT_MID}`,
            color: isLearned ? GREEN : "#a5b4fc",
            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.18em", transition: "all 0.2s",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {isLearned ? "✓  Saved" : "+ Save word"}
        </motion.button>

        {/* Flash confirmation */}
        <AnimatePresence>
          {savedFlash && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              style={{
                marginTop: 10, padding: "8px 14px", borderRadius: 10,
                background: "rgba(52,211,153,0.07)",
                border: "1px solid rgba(52,211,153,0.18)",
                fontSize: 11, fontWeight: 700, color: GREEN,
                textAlign: "center", letterSpacing: "0.04em",
              }}
            >
              🌟 Added to your vocab list!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Empty vocab state ─────────────────────────────────────────────────── */
function VocabEmpty() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        border: "1.5px dashed rgba(255,255,255,0.06)",
        borderRadius: 22, padding: "2.5rem 1.5rem", textAlign: "center",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: "50%", margin: "0 auto 12px",
        background: ACCENT_SOFT, border: `1px solid ${ACCENT_MID}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(99,102,241,0.5)">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.24em", color: "rgba(148,163,184,0.2)", marginBottom: 4 }}>Tap any word</p>
      <p style={{ fontSize: 11, color: "rgba(148,163,184,0.14)" }}>to explore its meaning</p>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function LirycznaSymfonia() {
  const playlist = ["sanah_01.json", "sanah_02.json", "sanah_03.json"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [song, setSong]                 = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [wordsLearned, setWordsLearned] = useState(new Set());
  const [lastTapped, setLastTapped]     = useState(null);
  const [savedFlash, setSavedFlash]     = useState(false);
  const audioRef = useRef(null);

  /* ── Load song ── */
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
    el.paused
      ? el.play().then(() => setIsPlaying(true)).catch(() => {})
      : (el.pause(), setIsPlaying(false));
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

  /* ── Loading spinner ── */
  if (!song) return (
    <div style={{
      minHeight: "100vh", background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        style={{
          width: 38, height: 38, borderRadius: "50%",
          border: "3px solid rgba(99,102,241,0.12)",
          borderTopColor: ACCENT,
        }}
      />
    </div>
  );

  const learnedCount = wordsLearned.size;

  return (
    <div className="ls-root ls-grain" style={{
      minHeight: "100%", background: BG, color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden",
      position: "relative", isolation: "isolate",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

        /* Scoped reset — only elements inside .ls-root */
        .ls-root *, .ls-root *::before, .ls-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Scoped scrollbars — only inside .ls-root */
        .ls-root ::-webkit-scrollbar { width: 4px; }
        .ls-root ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.18); border-radius: 9999px; }

        /* Word buttons */
        .ls-root .ls-word {
          position: relative; display: inline-block;
          background: none; border: none; cursor: pointer;
          padding: 3px 4px; border-radius: 6px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; letter-spacing: -0.02em; line-height: 1.15;
          transition: color 0.15s, background 0.15s;
        }
        .ls-root .ls-word:hover { background: rgba(99,102,241,0.1); }

        /* Responsive grid */
        @media (min-width: 1024px) {
          .ls-root .ls-grid { grid-template-columns: minmax(0, 1fr) 360px !important; }
          .ls-root .ls-vocab-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .ls-root .ls-vocab-desktop { display: none !important; }
        }
        @media (min-width: 1280px) {
          .ls-root .ls-vocab-fixed { right: calc(50vw - 620px) !important; }
        }

        /* Grain overlay — scoped to .ls-root */
        .ls-root.ls-grain::before {
          content: '';
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025;
        }
      `}</style>

      <div className="ls-grain" />

      <audio ref={audioRef} onEnded={handleNext} preload="auto">
        <source src={song.audioUrl} type="audio/mpeg" />
      </audio>

      {/* ─────────────────────────────────────────────────────────────────────
          LIBRARY DRAWER
          ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
                zIndex: 400,
              }}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed", left: 0, top: 0, bottom: 0,
                width: "min(300px, 85vw)",
                background: "#090f1e",
                borderRight: `1px solid ${ACCENT_MID}`,
                zIndex: 401, padding: "2rem 1.5rem",
                overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem",
              }}
            >
              {/* Drawer header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.45)", marginBottom: 5 }}>Song library</p>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#e2e8f0" }}>Playlist</h2>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(148,163,184,0.5)", cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
              </div>

              {/* Track list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {playlist.map((fileName, idx) => {
                  const active = currentIndex === idx;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectSong(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        width: "100%", padding: "12px 14px", borderRadius: 14,
                        cursor: "pointer", textAlign: "left", border: "none",
                        background: active ? "rgba(99,102,241,0.09)" : "rgba(255,255,255,0.02)",
                        outline: `1px solid ${active ? ACCENT_MID : "rgba(255,255,255,0.05)"}`,
                        transition: "background 0.18s",
                      }}
                    >
                      {/* Track number / EQ indicator */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? ACCENT_MID : "rgba(255,255,255,0.06)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {active
                          ? <EqBars active={isPlaying} />
                          : <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(148,163,184,0.3)", fontWeight: 700 }}>0{idx + 1}</span>
                        }
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: active ? "rgba(99,102,241,0.6)" : "rgba(148,163,184,0.28)", marginBottom: 3 }}>Track 0{idx + 1}</p>
                        <p style={{
                          fontSize: 13, fontWeight: 700,
                          color: active ? "#c7d2fe" : "rgba(226,232,240,0.55)",
                          textTransform: "capitalize",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {fileName.replace(".json", "").replace(/_/g, " ")}
                        </p>
                      </div>

                      {active && (
                        <span style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: ACCENT, flexShrink: 0,
                          boxShadow: `0 0 10px ${ACCENT_GLOW}`,
                        }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Words saved summary */}
              {learnedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: "auto", padding: "13px 16px", borderRadius: 14,
                    background: "rgba(52,211,153,0.06)",
                    border: "1px solid rgba(52,211,153,0.18)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🏆</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7" }}>{learnedCount} word{learnedCount > 1 ? "s" : ""} saved</p>
                    <p style={{ fontSize: 10, color: "rgba(110,231,183,0.4)", marginTop: 2 }}>Keep exploring!</p>
                  </div>
                </motion.div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────
          PLAYER BAR
          Sits right below the app's existing navbar using margin-top instead
          of fixed positioning — so it never overlaps the navbar and always
          stacks naturally in the page flow at the correct scroll position.
          We then make it sticky so it follows the user while scrolling.
          ───────────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,              /* sticks to top of the scrollable viewport — your navbar is already fixed above */
        zIndex: 89,          /* below your app navbar (assumes navbar ≥ z-90) */
        height: PLAYER_H,
        background: "rgba(2,6,23,0.96)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center",
        padding: "0 16px",
      }}>
        <div style={{
          maxWidth: 1280, width: "100%", margin: "0 auto",
          display: "flex", alignItems: "center", gap: 12,
        }}>

          {/* Hamburger */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMenuOpen(true)}
            style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: ACCENT_SOFT, border: `1px solid ${ACCENT_MID}`,
              color: ACCENT, cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4.5,
            }}
          >
            {[1, 0.7].map((w, i) => (
              <span key={i} style={{
                display: "block", width: 14 * w, height: 2,
                background: "currentColor", borderRadius: 2,
              }} />
            ))}
          </motion.button>

          {/* App name */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexShrink: 0 }}
            className="ls-appname"
          >
            <style>{`.ls-root .ls-appname{display:none!important}@media(min-width:560px){.ls-root .ls-appname{display:flex!important}}`}</style>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap" }}>Liryczna</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(148,163,184,0.22)", whiteSpace: "nowrap" }}>Symfonia</span>
          </div>

          {/* Controls pill */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 15, padding: "8px 14px", minWidth: 0,
          }}>
            {/* Prev */}
            <button
              onClick={handlePrev}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.35)", padding: "2px 4px", flexShrink: 0, display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(148,163,184,0.75)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.35)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
            </button>

            {/* Play/Pause */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={togglePlay}
              style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: `linear-gradient(135deg, ${ACCENT}, #4f46e5)`,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                boxShadow: isPlaying ? `0 0 20px ${ACCENT_GLOW}` : "none",
                transition: "box-shadow 0.3s",
              }}
            >
              {isPlaying
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              }
            </motion.button>

            {/* Next */}
            <button
              onClick={handleNext}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.35)", padding: "2px 4px", flexShrink: 0, display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(148,163,184,0.75)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.35)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18 14.5 12 6 6v12zm10-12v12h2V6h-2z" /></svg>
            </button>

            {/* Track info + progress */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              {isPlaying && <span style={{ flexShrink: 0 }}><EqBars active size={12} /></span>}
              <div style={{ flexShrink: 0, minWidth: 0, maxWidth: 150 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 1 }}>
                  {song.title}
                </p>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(99,102,241,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {song.artist}
                </p>
              </div>
              <AudioProgress audioRef={audioRef} />
            </div>
          </div>

          {/* Learned badge */}
          <AnimatePresence>
            {learnedCount > 0 && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                style={{
                  flexShrink: 0, padding: "6px 12px", borderRadius: 10,
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.2)",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <span style={{ fontSize: 9 }}>✦</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#6ee7b7" }}>{learnedCount}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────
          MAIN LAYOUT
          ───────────────────────────────────────────────────────────────── */}
      <div
        className="ls-grid"
        style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "48px 24px 96px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 40,
          position: "relative", zIndex: 1,
        }}
      >
        {/* ── LEFT: LYRICS ──────────────────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>

          {/* Song header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "3rem" }}
          >
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.32em", color: "rgba(99,102,241,0.45)", marginBottom: 10 }}>Now reading</p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700,
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)", lineHeight: 1.02,
              color: "#f1f5f9", letterSpacing: "-0.015em", marginBottom: 8,
            }}>
              {song.title}
            </h1>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(148,163,184,0.3)" }}>
              {song.artist}
            </p>
            <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 16, borderRadius: 9999 }} />
          </motion.div>

          {/* Lyric lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {song.fullLyrics.map((line, lineIdx) => (
              <motion.div
                key={`${currentIndex}-${lineIdx}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.45, delay: Math.min(lineIdx * 0.035, 0.22) }}
                style={{
                  paddingLeft: "1.1rem",
                  borderLeft: `2px solid rgba(99,102,241,0.1)`,
                  position: "relative",
                }}
              >
                {/* Words */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", marginBottom: 12 }}>
                  {line.words.map((word, wIdx) => {
                    const isSelected = selectedWord?.pl === word.pl;
                    const isLearned  = wordsLearned.has(word.pl);
                    return (
                      <span key={wIdx} style={{ position: "relative", display: "inline-block" }}>
                        {isSelected && <WordRipple trigger={lastTapped} />}
                        <button
                          className="ls-word"
                          onClick={() => tapWord(word)}
                          style={{
                            fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
                            color: isLearned
                              ? "#6ee7b7"
                              : isSelected
                                ? "#a5b4fc"
                                : "rgba(226,232,240,0.82)",
                          }}
                        >
                          {word.pl}
                          {isLearned && (
                            <motion.span
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              style={{
                                position: "absolute", top: 1, right: -1,
                                width: 6, height: 6, borderRadius: "50%",
                                background: GREEN, boxShadow: `0 0 6px ${GREEN}`,
                              }}
                            />
                          )}
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Translation */}
                <p style={{
                  fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                  fontSize: "clamp(0.78rem, 1.8vw, 0.9rem)",
                  color: "rgba(148,163,184,0.32)", lineHeight: 1.7,
                }}>
                  {line.translation}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: VOCAB SIDEBAR (desktop) ───────────────────────────── */}
        <aside className="ls-vocab-desktop" style={{ position: "relative" }}>
          <div
            className="ls-vocab-fixed"
            style={{
              position: "sticky",
              top: PLAYER_H + 24,          /* clears the sticky player bar */
              width: 360,
              maxHeight: `calc(100vh - ${PLAYER_H + 48}px)`,
              overflowY: "auto",
              paddingBottom: 8,
            }}
          >
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.4)", marginBottom: 14 }}>Vocabulary</p>

            <AnimatePresence mode="wait">
              {selectedWord ? (
                <VocabCard
                  word={selectedWord}
                  isLearned={wordsLearned.has(selectedWord.pl)}
                  onSave={saveWord}
                  onClose={() => setSelectedWord(null)}
                  savedFlash={savedFlash}
                />
              ) : (
                <VocabEmpty />
              )}
            </AnimatePresence>

            {/* Learned words mini-list */}
            {learnedCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ marginTop: 16 }}
              >
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.24em", color: "rgba(52,211,153,0.4)", marginBottom: 10 }}>Saved words</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[...wordsLearned].map((w) => (
                    <span key={w} style={{
                      padding: "4px 10px", borderRadius: 9999,
                      background: "rgba(52,211,153,0.07)",
                      border: "1px solid rgba(52,211,153,0.18)",
                      fontSize: 11, fontWeight: 700, color: "#6ee7b7",
                    }}>
                      {w}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </aside>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE BOTTOM SHEET
          ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedWord && (
          <div className="ls-vocab-mobile">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              style={{
                position: "fixed", inset: 0, zIndex: 140,
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
              }}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 150,
                background: "#0d1526",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "22px 22px 0 0",
                padding: "0 1.25rem 2.5rem",
              }}
            >
              {/* Drag handle */}
              <div
                onClick={() => setSelectedWord(null)}
                style={{
                  width: 36, height: 4, borderRadius: 9999,
                  background: "rgba(255,255,255,0.1)",
                  margin: "14px auto 20px", cursor: "pointer",
                }}
              />

              {/* Colour strip */}
              <div style={{
                height: 2, borderRadius: 9999, marginBottom: 20,
                background: wordsLearned.has(selectedWord.pl)
                  ? `linear-gradient(90deg, ${GREEN}, #6ee7b7)`
                  : `linear-gradient(90deg, ${ACCENT}, #818cf8)`,
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.5)", marginBottom: 5 }}>Polish</p>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                    fontWeight: 700, fontSize: "clamp(1.8rem, 8vw, 2.4rem)",
                    color: "#f1f5f9", lineHeight: 1,
                  }}>
                    {selectedWord.pl}
                  </h2>
                </div>
                <span style={{
                  marginTop: 4, padding: "4px 10px", borderRadius: 9999,
                  background: ACCENT_SOFT, border: `1px solid ${ACCENT_MID}`,
                  fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.15em", color: "rgba(165,180,252,0.65)",
                }}>
                  {selectedWord.type}
                </span>
              </div>

              <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(148,163,184,0.3)", marginBottom: 5 }}>English</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "#a5b4fc" }}>{selectedWord.en}</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setSelectedWord(null)}
                  style={{
                    flex: 1, padding: 14, borderRadius: 13,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(148,163,184,0.45)", fontSize: 10, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Dismiss
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { saveWord(); setSelectedWord(null); }}
                  style={{
                    flex: 2, padding: 14, borderRadius: 13, cursor: "pointer",
                    background: wordsLearned.has(selectedWord.pl) ? "rgba(52,211,153,0.1)" : ACCENT_SOFT,
                    border: `1px solid ${wordsLearned.has(selectedWord.pl) ? "rgba(52,211,153,0.3)" : ACCENT_MID}`,
                    color: wordsLearned.has(selectedWord.pl) ? GREEN : "#a5b4fc",
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {wordsLearned.has(selectedWord.pl) ? "✓ Saved" : "Save word"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
