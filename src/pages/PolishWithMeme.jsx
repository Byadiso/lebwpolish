import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const ADMIN_EMAIL = "byadiso@gmail.com";
const TRENDING = ["gdyby", "ponieważ", "wcale", "przecież", "dopiero"];
const LEVELS = ["Nowicjusz", "Uczeń", "Adept", "Mistrz", "Ekspert", "Legenda"];

const getLevel = (xp = 0) => {
  if (xp < 100) return 0; if (xp < 300) return 1; if (xp < 700) return 2;
  if (xp < 1400) return 3; if (xp < 2500) return 4; return 5;
};

const fmt = (ts) => {
  if (!ts?.toDate) return "";
  const d = ts.toDate(), now = new Date();
  const mins = Math.floor((now - d) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

/* ─── Text-to-Speech hook ────────────────────────────────────────────────── */
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pl-PL";
    utter.rate = 0.88;
    utter.pitch = 1;

    // Try to find a Polish voice
    const voices = window.speechSynthesis.getVoices();
    const plVoice = voices.find((v) => v.lang.startsWith("pl"));
    if (plVoice) utter.voice = plVoice;

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  // Cancel on unmount
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return { speak, stop, speaking };
}

/* ─── Floating XP ────────────────────────────────────────────────────────── */
function XpBurst({ amount, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -60, scale: 1.1 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{
        position: "fixed", top: 88, right: 28, zIndex: 9999,
        background: "linear-gradient(135deg,#6366f1,#34d399)",
        padding: "12px 22px", borderRadius: 18,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 15,
        color: "#fff", letterSpacing: "0.06em",
        boxShadow: "0 12px 30px rgba(99,102,241,0.4)", pointerEvents: "none",
      }}
    >
      +{amount} XP ✦
    </motion.div>
  );
}

/* ─── Heart animation ────────────────────────────────────────────────────── */
function HeartPop({ x, y }) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.5, x: x - 12, y: y - 12 }}
      animate={{ opacity: 0, scale: 2.5, y: y - 80 }}
      exit={{}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{ position: "fixed", zIndex: 9998, fontSize: 22, pointerEvents: "none" }}
    >❤️</motion.div>
  );
}

/* ─── Fullscreen Image Modal ─────────────────────────────────────────────── */
function FullscreenImage({ src, caption, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.96)",
          backdropFilter: "blur(24px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px",
          cursor: "zoom-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "fixed", top: 20, right: 20,
            width: 44, height: 44, borderRadius: 14,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1001, transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "#fca5a5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        >✕</button>

        {/* ESC hint */}
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          fontSize: 9, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace",
          zIndex: 1001,
        }}>Press ESC or tap to close</div>

        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative", maxWidth: "min(90vw, 900px)",
            maxHeight: "85vh", cursor: "default",
          }}
        >
          <img
            src={src}
            alt="meme fullscreen"
            style={{
              width: "100%", height: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 20,
              boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
              display: "block",
            }}
          />
          {/* Caption overlay */}
          {caption && (
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              padding: "50px 28px 24px",
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
              borderRadius: "0 0 20px 20px",
            }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic", fontSize: "clamp(1.2rem,3vw,1.8rem)",
                fontWeight: 700, color: "#f1f5f9",
                lineHeight: 1.25, textShadow: "0 4px 20px rgba(0,0,0,0.7)",
              }}>{caption}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── TTS Button ─────────────────────────────────────────────────────────── */
function TTSButton({ text, style = {} }) {
  const { speak, stop, speaking } = useTTS();

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={() => speaking ? stop() : speak(text)}
      title={speaking ? "Stop reading" : "Read aloud in Polish"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "10px 14px", borderRadius: 13, border: "none", cursor: "pointer",
        background: speaking
          ? "rgba(52,211,153,0.15)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${speaking ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: speaking ? "#34d399" : "rgba(255,255,255,0.55)",
        fontSize: 13, fontWeight: 700, transition: "all 0.2s",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative", overflow: "hidden",
        ...style,
      }}
    >
      {/* Ripple pulse when speaking */}
      {speaking && (
        <motion.div
          style={{
            position: "absolute", inset: 0, borderRadius: 13,
            background: "rgba(52,211,153,0.08)",
          }}
          animate={{ opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {speaking ? (
        <>
          <SoundWaveIcon />
          <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Stop</span>
        </>
      ) : (
        <>
          🔊
          <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Czytaj</span>
        </>
      )}
    </motion.button>
  );
}

/* Animated sound wave icon */
function SoundWaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      {[
        { x: 0, h: 4, delay: 0 },
        { x: 4, h: 10, delay: 0.15 },
        { x: 8, h: 14, delay: 0.3 },
        { x: 12, h: 10, delay: 0.15 },
      ].map((bar) => (
        <motion.rect
          key={bar.x}
          x={bar.x} y={(16 - bar.h) / 2}
          width={3} height={bar.h}
          rx={1.5}
          animate={{ scaleY: [1, 0.35, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: bar.delay, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/* ─── Comment section ────────────────────────────────────────────────────── */
function CommentSection({ postId, user, profile }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "memes", postId, "comments"),
      orderBy("createdAt", "asc"),
      limit(30)
    );
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [postId]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "memes", postId, "comments"), {
        text: text.trim(),
        author: profile?.cityName || "Student",
        authorEmail: user?.email || "",
        uid: user?.uid,
        createdAt: serverTimestamp(),
      });
      setText("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "0 16px 18px" }}>
      {comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                background: c.authorEmail === ADMIN_EMAIL
                  ? "linear-gradient(135deg,#6366f1,#34d399)"
                  : "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#818cf8",
              }}>
                {c.author?.charAt(0)}
              </div>
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "9px 13px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.authorEmail === ADMIN_EMAIL ? "#34d399" : "#818cf8" }}>
                    {c.author}
                  </span>
                  {c.authorEmail === ADMIN_EMAIL && (
                    <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(52,211,153,0.6)", padding: "1px 6px", borderRadius: 4, border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.06)" }}>Admin</span>
                  )}
                  <span style={{ fontSize: 10, color: "rgba(148,163,184,0.3)", marginLeft: "auto", fontFamily: "monospace" }}>{fmt(c.createdAt)}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(226,232,240,0.8)", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
          placeholder="Napisz komentarz po polsku…"
          style={{
            flex: 1, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "12px 14px",
            color: "#fff", outline: "none", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            minWidth: 0, transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.4)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={submit}
          disabled={!text.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: 13, border: "none", cursor: "pointer",
            background: text.trim() ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(255,255,255,0.05)",
            color: text.trim() ? "#fff" : "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Learn panel ────────────────────────────────────────────────────────── */
function LearnPanel({ post, onClose }) {
  // Build the full lesson text for TTS
  const lessonText = [
    post.caption && `Podpis: ${post.caption}.`,
    post.translation && `Tłumaczenie: ${post.translation}.`,
    post.grammarRule && `Zasada gramatyczna: ${post.grammarRule}.`,
    post.explanation && `Wyjaśnienie: ${post.explanation}.`,
  ].filter(Boolean).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      <div style={{ margin: "0 16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 2, background: "linear-gradient(90deg,#6366f1,#34d399,transparent)", borderRadius: 9999 }} />

        {/* TTS for full lesson */}
        {lessonText && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <TTSButton text={lessonText} />
          </div>
        )}

        {post.translation && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(99,102,241,0.5)", fontFamily: "'DM Mono', monospace" }}>Translation</p>
              <TTSButton text={post.translation} style={{ padding: "5px 10px", fontSize: 11 }} />
            </div>
            <p style={{ fontSize: 14, color: "#c4b5fd", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>{post.translation}</p>
          </div>
        )}

        {post.grammarRule && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(52,211,153,0.5)", fontFamily: "'DM Mono', monospace" }}>Grammar Insight</p>
              <TTSButton text={post.grammarRule} style={{ padding: "5px 10px", fontSize: 11 }} />
            </div>
            <p style={{ fontSize: 14, color: "#6ee7b7", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{post.grammarRule}</p>
          </div>
        )}

        {post.explanation && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(148,163,184,0.4)", fontFamily: "'DM Mono', monospace" }}>Why It's Funny</p>
              <TTSButton text={post.explanation} style={{ padding: "5px 10px", fontSize: 11 }} />
            </div>
            <p style={{ fontSize: 14, color: "rgba(226,232,240,0.75)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{post.explanation}</p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          style={{
            padding: "10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", background: "rgba(255,255,255,0.04)",
            color: "rgba(148,163,184,0.5)", fontSize: 10, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.18em",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >Close</motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Meme card ──────────────────────────────────────────────────────────── */
function MemeCard({ post, user, profile, onXp }) {
  const [showLearn, setShowLearn]           = useState(false);
  const [showComments, setShowComments]     = useState(false);
  const [hearts, setHearts]                 = useState([]);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const liked = post.likes?.includes(user?.uid);

  const handleLike = async (e) => {
    if (!user) return;
    await updateDoc(doc(db, "memes", post.id), {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
    if (!liked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setHearts((h) => [...h, { id, x: rect.left + rect.width / 2, y: rect.top }]);
      setTimeout(() => setHearts((h) => h.filter((hh) => hh.id !== id)), 800);
      onXp(5);
      confetti({ particleCount: 18, spread: 50, origin: { y: 0.8 }, colors: ["#818cf8","#34d399","#f59e0b"] });
    }
  };

  const toggleLearn = () => {
    setShowLearn((s) => !s);
    if (!showLearn) onXp(10);
  };

  return (
    <>
      <AnimatePresence>
        {hearts.map((h) => <HeartPop key={h.id} x={h.x} y={h.y} />)}
      </AnimatePresence>

      {/* Fullscreen image viewer */}
      <AnimatePresence>
        {showFullscreen && (
          <FullscreenImage
            src={post.imageUrl}
            caption={post.caption}
            onClose={() => setShowFullscreen(false)}
          />
        )}
      </AnimatePresence>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          background: "rgba(8,15,30,0.92)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 26, overflow: "hidden",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.04)",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        whileHover={{ borderColor: "rgba(99,102,241,0.2)", boxShadow: "0 16px 60px rgba(99,102,241,0.1)" }}
      >
        {/* ── Card header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13, flexShrink: 0,
              background: post.authorEmail === ADMIN_EMAIL
                ? "linear-gradient(135deg,#6366f1,#34d399)"
                : "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 800, color: "#fff",
              fontFamily: "'Playfair Display', serif",
              boxShadow: post.authorEmail === ADMIN_EMAIL ? "0 0 18px rgba(99,102,241,0.35)" : "none",
            }}>
              {post.author?.charAt(0)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>{post.author}</span>
                {post.authorEmail === ADMIN_EMAIL && (
                  <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#34d399", padding: "2px 6px", borderRadius: 5, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)" }}>Admin</span>
                )}
              </div>
              <div style={{ fontSize: 9, color: "rgba(148,163,184,0.35)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                {post.level} · {fmt(post.createdAt)}
              </div>
            </div>
          </div>
          {/* TTS for the caption — always visible in header */}
          {post.caption && (
            <TTSButton text={post.caption} style={{ padding: "8px 12px" }} />
          )}
        </div>

        {/* ── Image — click to fullscreen, double-tap to like ── */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#000",
            cursor: "zoom-in",
          }}
          onClick={() => setShowFullscreen(true)}
          onDoubleClick={(e) => { e.stopPropagation(); handleLike(e); }}
        >
          <img
            src={post.imageUrl}
            alt=""
            style={{
              width: "100%",
              display: "block",
              objectFit: "contain",          // ← fit: no cropping
              maxHeight: "480px",
              background: "#000",
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.015)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
          {/* Tap hints overlay */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end",
          }}>
            <div style={{
              padding: "4px 9px", borderRadius: 9999,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em",
              fontFamily: "'DM Mono', monospace",
            }}>tap to zoom 🔍</div>
            <div style={{
              padding: "4px 9px", borderRadius: 9999,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em",
              fontFamily: "'DM Mono', monospace",
            }}>double tap ❤️</div>
          </div>

          {/* Bottom caption overlay */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            padding: "50px 18px 16px",
            background: "linear-gradient(to top, rgba(2,6,23,0.9) 0%, rgba(2,6,23,0.3) 60%, transparent 100%)",
            pointerEvents: "none",
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif", fontStyle: "italic",
              fontSize: "clamp(1rem,3.5vw,1.6rem)", fontWeight: 700,
              color: "#f1f5f9", lineHeight: 1.25,
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}>
              {post.caption}
            </p>
          </div>
        </div>

        {/* ── Action row ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexWrap: "wrap",
        }}>
          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleLike}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", borderRadius: 13, border: "none", cursor: "pointer",
              background: liked ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${liked ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.07)"}`,
              color: liked ? "#f43f5e" : "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: 700, transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              {liked ? "❤️" : "🤍"}
            </motion.span>
            {post.likes?.length || 0}
          </motion.button>

          {/* Comment */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowComments((s) => !s)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", borderRadius: 13, border: "none", cursor: "pointer",
              background: showComments ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showComments ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.07)"}`,
              color: showComments ? "#818cf8" : "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: 700, transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            💬 {post.commentCount > 0 ? post.commentCount : ""}
          </motion.button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Learn this */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={toggleLearn}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", borderRadius: 13, border: "none", cursor: "pointer",
              background: showLearn
                ? "rgba(52,211,153,0.12)"
                : "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(52,211,153,0.1))",
              border: `1px solid ${showLearn ? "rgba(52,211,153,0.3)" : "rgba(99,102,241,0.22)"}`,
              color: showLearn ? "#6ee7b7" : "#a5b4fc",
              fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
              textTransform: "uppercase", transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {showLearn ? "✓ Learning" : "✨ Learn"}
          </motion.button>
        </div>

        {/* ── Learn panel ── */}
        <AnimatePresence>
          {showLearn && <LearnPanel post={post} onClose={() => setShowLearn(false)} />}
        </AnimatePresence>

        {/* ── Comments ── */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28 }}
              style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div style={{ paddingTop: 14 }}>
                <CommentSection postId={post.id} user={user} profile={profile} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </>
  );
}

/* ─── Upload modal ───────────────────────────────────────────────────────── */
function UploadModal({ user, profile, onClose, onSuccess }) {
  const [caption, setCaption]         = useState("");
  const [translation, setTranslation] = useState("");
  const [grammarRule, setGrammarRule] = useState("");
  const [explanation, setExplanation] = useState("");
  const [image, setImage]             = useState(null);
  const [preview, setPreview]         = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState("");
  const fileRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    setImage(f); setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!image || !caption.trim()) { setError("Image and caption are required."); return; }
    setError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", image);
      fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      await addDoc(collection(db, "memes"), {
        imageUrl: data.secure_url,
        caption, translation, grammarRule, explanation,
        likes: [], commentCount: 0,
        author: profile?.cityName || "Student",
        authorEmail: user.email,
        uid: user.uid, level: profile?.level || "A1",
        createdAt: serverTimestamp(),
      });

      confetti({ particleCount: 180, spread: 100, origin: { y: 0.65 }, colors: ["#818cf8","#34d399","#f59e0b","#c4b5fd"] });
      onSuccess(50);
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(16px)", zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", overflowY: "auto",
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto",
          background: "#0c1427", borderRadius: 28,
          border: "1px solid rgba(99,102,241,0.22)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
          padding: "24px",
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(99,102,241,0.5)", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>New Post</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.4rem,4vw,1.8rem)", fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
              Upload Meme ✨
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.5)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
          onClick={() => !preview && fileRef.current?.click()}
          style={{
            borderRadius: 18, overflow: "hidden",
            cursor: preview ? "default" : "pointer",
            border: `2px dashed ${preview ? "rgba(52,211,153,0.3)" : "rgba(99,102,241,0.2)"}`,
            background: preview ? "transparent" : "rgba(99,102,241,0.04)",
            minHeight: preview ? "auto" : 140,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", transition: "all 0.2s",
          }}
        >
          {preview ? (
            <div style={{ position: "relative", width: "100%" }}>
              <img src={preview} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "contain", display: "block", borderRadius: 16, background: "#050810" }} />
              <button onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 9999, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>📸</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(99,102,241,0.6)", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Drop image or click to browse</p>
              <p style={{ fontSize: 10, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono', monospace" }}>PNG, JPG, GIF, WEBP</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

        {/* Fields */}
        {[
          { value: caption, set: setCaption, placeholder: "Polish meme caption (the funny text)…", required: true, rows: 2 },
          { value: translation, set: setTranslation, placeholder: "English translation…", rows: 2 },
          { value: grammarRule, set: setGrammarRule, placeholder: "Grammar insight — what rule does this show?…", rows: 3 },
          { value: explanation, set: setExplanation, placeholder: "Why is this funny in Polish culture?…", rows: 3 },
        ].map((f, i) => (
          <textarea
            key={i}
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            placeholder={f.placeholder}
            rows={f.rows}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${f.required && !f.value.trim() ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, padding: "12px 14px",
              color: "#f1f5f9", outline: "none", fontSize: 13, resize: "none",
              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.4)"}
            onBlur={(e) => e.target.style.borderColor = f.required && !f.value.trim() ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.08)"}
          />
        ))}

        {error && (
          <p style={{ fontSize: 12, color: "#f43f5e", fontFamily: "'DM Sans', sans-serif", padding: "8px 12px", borderRadius: 10, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>{error}</p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleUpload}
          disabled={uploading}
          style={{
            width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
            background: uploading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: uploading ? "rgba(255,255,255,0.3)" : "#fff",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 12,
            textTransform: "uppercase", letterSpacing: "0.24em",
            boxShadow: uploading ? "none" : "0 12px 30px rgba(79,70,229,0.3)",
            transition: "all 0.25s",
          }}
        >
          {uploading ? "Uploading…" : "Publish Meme ✦"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function PolishMeme() {
  const { user, profile } = useAuth();
  const [posts, setPosts]           = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [xpItems, setXpItems]       = useState([]);

  const totalXp      = profile?.xp || 0;
  const currentLevel = LEVELS[getLevel(totalXp)];
  const streak       = profile?.streak || 0;

  useEffect(() => {
    const q = query(collection(db, "memes"), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const triggerXp = useCallback((amount) => {
    const id = Date.now() + Math.random();
    setXpItems((prev) => [...prev, { id, amount }]);
  }, []);

  const removeXp = useCallback((id) => {
    setXpItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');

        .pm-root *, .pm-root *::before, .pm-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pm-root ::-webkit-scrollbar { width: 4px; }
        .pm-root ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 9999px; }

        .pm-root {
          min-height: 100%;
          background:
            radial-gradient(ellipse 800px 500px at 10% 0%, rgba(99,102,241,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 600px 400px at 90% 100%, rgba(52,211,153,0.05) 0%, transparent 70%),
            #020617;
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          isolation: isolate;
        }

        .pm-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px 16px 80px;
        }
        @media (min-width: 1080px) {
          .pm-layout { grid-template-columns: 1fr 300px; align-items: start; padding: 28px 20px 80px; }
        }

        .pm-feed {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 1080px) { .pm-feed { max-width: 100%; } }

        .pm-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 1080px) {
          .pm-sidebar { position: sticky; top: 24px; }
        }

        .pm-side-card {
          background: #0c1427;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 18px 20px;
          transition: border-color 0.2s;
        }
        .pm-side-card:hover { border-color: rgba(99,102,241,0.15); }

        .pm-upload-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 10px 28px rgba(79,70,229,0.28);
          touch-action: manipulation;
        }
        .pm-upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(79,70,229,0.38);
        }
        .pm-upload-btn:active { transform: scale(0.98); }

        .pm-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: rgba(148,163,184,0.35);
          margin-bottom: 10px;
          font-family: 'DM Mono', monospace;
        }

        .pm-trending-tag {
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.16);
          color: #818cf8;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          touch-action: manipulation;
        }
        .pm-trending-tag:hover { background: rgba(99,102,241,0.16); transform: translateY(-1px); }

        .pm-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(148,163,184,0.3);
        }

        /* Mobile feed top bar */
        .pm-mobile-upload {
          display: none;
        }
        @media (max-width: 1079px) {
          .pm-mobile-upload { display: block; }
          .pm-desktop-upload { display: none; }
        }
        @media (min-width: 1080px) {
          .pm-mobile-upload { display: none; }
          .pm-desktop-upload { display: block; }
        }

        /* Ensure buttons are tappable on mobile */
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div className="pm-root">
        {/* XP bursts */}
        <AnimatePresence>
          {xpItems.map((x) => (
            <XpBurst key={x.id} amount={x.amount} onDone={() => removeXp(x.id)} />
          ))}
        </AnimatePresence>

        {/* Upload modal */}
        <AnimatePresence>
          {showUpload && (
            <UploadModal
              user={user}
              profile={profile}
              onClose={() => setShowUpload(false)}
              onSuccess={triggerXp}
            />
          )}
        </AnimatePresence>

        <div className="pm-layout">
          {/* ── FEED ── */}
          <div className="pm-feed">
            {/* Feed header */}
            <div style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(99,102,241,0.45)", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
                Community Feed
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.5rem,5vw,2.2rem)", color: "#f1f5f9", lineHeight: 1.05 }}>
                Polish Meme Lab
              </h1>
              <p style={{ fontSize: 13, color: "rgba(148,163,184,0.4)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
                Learn Polish through humour. Tap ✨ on any post.
              </p>
            </div>

            {/* Mobile upload button */}
            <div className="pm-mobile-upload">
              <button className="pm-upload-btn" onClick={() => setShowUpload(true)}>Upload Meme ✦</button>
            </div>

            {posts.length === 0 ? (
              <div className="pm-empty">
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🥟</div>
                <p style={{ fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>No memes yet.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Be the first to post one!</p>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.4 }}
                >
                  <MemeCard post={post} user={user} profile={profile} onXp={triggerXp} />
                </motion.div>
              ))
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="pm-sidebar">
            {/* Profile / level card */}
            <div className="pm-side-card" style={{ border: "1px solid rgba(99,102,241,0.18)" }}>
              <div style={{ height: 2, background: "linear-gradient(90deg,#6366f1,#34d399,transparent)", borderRadius: 9999, marginBottom: 16 }} />
              <p className="pm-label">Polish Brain Level</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.6rem", color: "#f1f5f9", marginBottom: 6 }}>
                {currentLevel}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", fontWeight: 700, color: "#818cf8" }}>{totalXp.toLocaleString()} XP</span>
                <span style={{ color: "#34d399", fontSize: 13 }}>✦</span>
              </div>
              <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 9999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (totalXp % 500) / 5)}%`, background: "linear-gradient(90deg,#6366f1,#34d399)", borderRadius: 9999, transition: "width 0.6s ease" }} />
              </div>
            </div>

            {/* Streak */}
            <div className="pm-side-card">
              <p className="pm-label">Daily Streak</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <motion.span
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: "2.2rem", filter: "drop-shadow(0 0 10px rgba(245,158,11,0.5))" }}
                >🔥</motion.span>
                <div>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.8rem", color: "#f59e0b" }}>{streak}</span>
                  <span style={{ fontSize: 12, color: "rgba(245,158,11,0.5)", marginLeft: 5, fontWeight: 700 }}>days</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>Keep the flame alive 🔥</p>
            </div>

            {/* Trending vocab */}
            <div className="pm-side-card">
              <p className="pm-label">Trending This Week</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TRENDING.map((word) => (
                  <span key={word} className="pm-trending-tag">🔥 {word}</span>
                ))}
              </div>
            </div>

            {/* Desktop upload */}
            <div className="pm-desktop-upload">
              <button className="pm-upload-btn" onClick={() => setShowUpload(true)}>
                Upload New Meme ✦
              </button>
            </div>

            {/* Post count */}
            <div className="pm-side-card" style={{ textAlign: "center" }}>
              <p className="pm-label" style={{ marginBottom: 6 }}>Community</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.8rem", color: "#818cf8" }}>{posts.length}</p>
              <p style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono', monospace" }}>memes published</p>
            </div>

            {/* Shadow Protocol link */}
            <Link to="/shadow-protocol" style={{ textDecoration: "none" }}>
              <div className="pm-side-card" style={{ border: "1px solid rgba(52,211,153,0.15)", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(52,211,153,0.15)"}
              >
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(52,211,153,0.5)", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Shadow Protocol</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.1rem", fontWeight: 700, color: "#34d399" }}>Continue Training ⚡</p>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
