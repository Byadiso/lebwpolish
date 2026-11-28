import { playAudio, stopAudio } from '../lib/polishAudio';
import "./MemeLab.css";
import IconText from "../components/IconText";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, limit, increment } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";
const ADMIN_EMAIL = "byadiso@gmail.com";
const POLISH_CHARS = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"];
const TRENDING = ["gdyby", "ponieważ", "wcale", "przecież", "dopiero", "jakoś", "właśnie"];
const LEVELS = ["Nowicjusz", "Uczeń", "Adept", "Mistrz", "Ekspert", "Legenda"];
const PROMPTS = ["Opisz ten mem jednym zdaniem po polsku…", "Użyj słowa 'przecież' w komentarzu…", "Napisz, co czujesz — po polsku!", "Spróbuj użyć czasu przeszłego…", "Dodaj komentarz z pytaniem po polsku…"];
const getLevel = (xp = 0) => {
  if (xp < 100) return 0;
  if (xp < 300) return 1;
  if (xp < 700) return 2;
  if (xp < 1400) return 3;
  if (xp < 2500) return 4;
  return 5;
};
const fmt = ts => {
  if (!ts?.toDate) return "";
  const d = ts.toDate(),
    now = new Date();
  const m = Math.floor((now - d) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
};
const randomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

/* ── Bilingual TTS hook (each call = independent instance) ── */
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState("pl");
  const speak = useCallback((plText, enText) => {
    playAudio(lang === "pl" ? plText : enText || plText,{lang:lang === "pl" || !enText ? "pl-PL" : "en-US",rate:lang === "pl" || !enText ? 1 : .9,onStart:()=>setSpeaking(true),onEnd:()=>setSpeaking(false)});
  }, [lang]);
  const stop = useCallback(() => {
    stopAudio();
    setSpeaking(false);
  }, []);
  const toggle = useCallback(() => setLang(l => l === "pl" ? "en" : "pl"), []);
  useEffect(() => () => stopAudio(), []);
  return {
    speak,
    stop,
    speaking,
    lang,
    toggle
  };
}

/* ── TTSButton — bilingual pill + speaker ── */
function TTSButton({
  plText,
  enText,
  compact = false
}) {
  const {
    speak,
    stop,
    speaking,
    lang,
    toggle
  } = useTTS();
  return <div style={{
    display: "flex",
    alignItems: "center",
    gap: 3
  }}>
      <button onClick={e => {
      e.stopPropagation();
      toggle();
    }} title={`Switch to ${lang === "pl" ? "English" : "Polish"}`} style={{
      padding: "3px 7px",
      borderRadius: 7,
      background: lang === "pl" ? "rgba(99,102,241,0.14)" : "rgba(245,158,11,0.14)",
      border: `1px solid ${lang === "pl" ? "rgba(99,102,241,0.3)" : "rgba(245,158,11,0.3)"}`,
      color: lang === "pl" ? "#a5b4fc" : "#fcd34d",
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "0.12em",
      cursor: "pointer",
      fontFamily: "'DM Mono',monospace",
      transition: "all .18s"
    }}><IconText>{lang === "pl" ? "PL" : "EN"}</IconText></button>
      <motion.button whileTap={{
      scale: .87
    }} onClick={e => {
      e.stopPropagation();
      speaking ? stop() : speak(plText, enText);
    }} title={speaking ? "Stop" : `Read in ${lang === "pl" ? "Polish" : "English"}`} style={{
      display: "flex",
      alignItems: "center",
      gap: compact ? 0 : 5,
      padding: compact ? "5px 7px" : "6px 11px",
      borderRadius: 9,
      border: "none",
      cursor: "pointer",
      flexShrink: 0,
      background: speaking ? "rgba(52,211,153,0.14)" : "rgba(255,255,255,0.05)",
      outline: `1px solid ${speaking ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"}`,
      color: speaking ? "#34d399" : "rgba(255,255,255,0.45)",
      fontSize: 11,
      fontWeight: 700,
      transition: "all .18s",
      fontFamily: "'DM Sans',sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
        {speaking ? <SoundWave /> : <span style={{
        fontSize: compact ? 13 : 14
      }}><IconText>[icon:volume]</IconText></span>}
        {!compact && <span style={{
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}>
            <IconText>{speaking ? "Stop" : lang === "pl" ? "Czytaj" : "Read"}</IconText>
          </span>}
      </motion.button>
    </div>;
}
function SoundWave() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      {[{
      x: 0,
      h: 4,
      d: 0
    }, {
      x: 4,
      h: 10,
      d: .15
    }, {
      x: 8,
      h: 14,
      d: .3
    }, {
      x: 12,
      h: 10,
      d: .15
    }].map(b => <motion.rect key={b.x} x={b.x} y={(16 - b.h) / 2} width={3} height={b.h} rx={1.5} animate={{
      scaleY: [1, .3, 1]
    }} transition={{
      duration: .7,
      repeat: Infinity,
      delay: b.d,
      ease: "easeInOut"
    }} />)}
    </svg>;
}
function XpBurst({
  amount,
  onDone
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 10,
    scale: .7
  }} animate={{
    opacity: 1,
    y: -10,
    scale: 1
  }} exit={{
    opacity: 0,
    y: -70,
    scale: 1.15
  }} transition={{
    duration: 1.5,
    ease: "easeOut"
  }} onAnimationComplete={onDone} style={{
    position: "fixed",
    top: 80,
    right: 24,
    zIndex: 9999,
    pointerEvents: "none",
    background: "linear-gradient(135deg,#6366f1,#34d399)",
    padding: "10px 20px",
    borderRadius: 16,
    fontFamily: "'DM Sans',sans-serif",
    fontWeight: 800,
    fontSize: 14,
    color: "#fff",
    letterSpacing: "0.06em",
    boxShadow: "0 8px 28px rgba(99,102,241,0.45)"
  }}>
      +<IconText>{amount}</IconText> XP ✦
    </motion.div>;
}
function HeartPop({
  x,
  y
}) {
  return <motion.div initial={{
    opacity: 1,
    scale: .5,
    x,
    y
  }} animate={{
    opacity: 0,
    scale: 2.8,
    y: y - 90
  }} exit={{
    opacity: 0
  }} transition={{
    duration: .75,
    ease: "easeOut"
  }} style={{
    position: "fixed",
    zIndex: 9998,
    fontSize: 24,
    pointerEvents: "none"
  }}><IconText>[icon:heart]</IconText></motion.div>;
}
function CharBar({
  textRef,
  value,
  setter
}) {
  const inject = char => {
    const el = textRef?.current;
    if (!el) {
      setter(v => v + char);
      return;
    }
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    setter(value.slice(0, s) + char + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 1, s + 1);
    });
  };
  return <div style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6
  }}>
      {POLISH_CHARS.map(c => <button key={c} type="button" onClick={() => inject(c)} style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "1px solid rgba(99,102,241,0.2)",
      background: "rgba(99,102,241,0.08)",
      color: "#a5b4fc",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      transition: "all .15s",
      fontFamily: "'DM Sans',sans-serif"
    }} onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(99,102,241,0.22)";
      e.currentTarget.style.transform = "scale(1.1)";
    }} onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(99,102,241,0.08)";
      e.currentTarget.style.transform = "scale(1)";
    }}><IconText>{c}</IconText></button>)}
    </div>;
}
function Fullscreen({
  src,
  caption,
  onClose
}) {
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} onClick={onClose} style={{
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.97)",
    backdropFilter: "blur(28px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    cursor: "zoom-out"
  }}>
      <button onClick={onClose} style={{
      position: "fixed",
      top: 20,
      right: 20,
      width: 42,
      height: 42,
      borderRadius: 13,
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.6)",
      cursor: "pointer",
      fontSize: 18,
      zIndex: 1001,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>✕</button>
      <div style={{
      position: "fixed",
      top: 26,
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.18)",
      fontFamily: "monospace"
    }}>ESC or tap to close</div>
      <motion.div initial={{
      scale: .88,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      type: "spring",
      damping: 28,
      stiffness: 250
    }} onClick={e => e.stopPropagation()} style={{
      position: "relative",
      maxWidth: "min(92vw,1000px)",
      maxHeight: "88vh"
    }}>
        <img src={src} alt="" style={{
        width: "100%",
        maxHeight: "88vh",
        objectFit: "contain",
        borderRadius: 18,
        boxShadow: "0 50px 120px rgba(0,0,0,0.9)",
        display: "block"
      }} />
        {caption && <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "60px 24px 22px",
        background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 100%)",
        borderRadius: "0 0 18px 18px"
      }}>
            <p style={{
          fontFamily: "'Playfair Display',serif",
          fontStyle: "italic",
          fontSize: "clamp(1.1rem,2.5vw,1.7rem)",
          fontWeight: 700,
          color: "#f1f5f9",
          lineHeight: 1.2,
          textShadow: "0 4px 20px rgba(0,0,0,0.7)"
        }}><IconText>{caption}</IconText></p>
          </div>}
      </motion.div>
    </motion.div>;
}

/* ── Delete modal — no inline layout shift ── */
function DeleteModal({
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} onClick={onCancel} style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(14px)",
    zIndex: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }}>
      <motion.div initial={{
      scale: .9,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: .93,
      opacity: 0
    }} transition={{
      type: "spring",
      damping: 26,
      stiffness: 270
    }} onClick={e => e.stopPropagation()} style={{
      background: "#0c1427",
      borderRadius: 22,
      padding: "26px 28px",
      border: "1px solid rgba(239,68,68,0.28)",
      boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
      maxWidth: 340,
      width: "100%",
      textAlign: "center"
    }}>
        <p style={{
        fontSize: 28,
        marginBottom: 10
      }}><IconText>[icon:trash]</IconText></p>
        <p style={{
        fontFamily: "'Playfair Display',serif",
        fontStyle: "italic",
        fontSize: "1.2rem",
        color: "#f1f5f9",
        marginBottom: 6
      }}>Delete this meme?</p>
        <p style={{
        fontSize: 12,
        color: "#a8b6ca",
        marginBottom: 20,
        fontFamily: "'DM Sans',sans-serif"
      }}>This cannot be undone.</p>
        <div style={{
        display: "flex",
        gap: 10
      }}>
          <button onClick={onConfirm} style={{
          flex: 1,
          padding: "11px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg,#ef4444,#dc2626)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 11,
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: "'DM Sans',sans-serif"
        }}>Delete</button>
          <button onClick={onCancel} style={{
          flex: 1,
          padding: "11px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(148,163,184,0.5)",
          fontWeight: 700,
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "'DM Sans',sans-serif"
        }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>;
}

/* ── Comment section ── */
function CommentSection({
  postId,
  user,
  profile
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showChars, setShowChars] = useState(false);
  const [prompt] = useState(randomPrompt);
  const inputRef = useRef(null);
  useEffect(() => {
    const q = query(collection(db, "memes", postId, "comments"), orderBy("createdAt", "asc"), limit(40));
    return onSnapshot(q, snap => setComments(snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))));
  }, [postId]);
  const submit = async () => {
    if (!text.trim() || sending || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, "memes", postId, "comments"), {
        text: text.trim(),
        author: profile?.cityName || "Student",
        authorEmail: user.email,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "memes", postId), {
        commentCount: increment(1)
      });
      setText("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  };
  return <div style={{
    padding: "4px 16px 18px"
  }}>
      {comments.length > 0 && <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 12,
      maxHeight: 260,
      overflowY: "auto"
    }}>
          {comments.map(c => <motion.div key={c.id} initial={{
        opacity: 0,
        x: -8
      }} animate={{
        opacity: 1,
        x: 0
      }} style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start"
      }}>
              <div style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          flexShrink: 0,
          background: c.authorEmail === ADMIN_EMAIL ? "linear-gradient(135deg,#6366f1,#34d399)" : "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#818cf8"
        }}><IconText>{c.author?.charAt(0)}</IconText></div>
              <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "8px 12px",
          minWidth: 0
        }}>
                <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
            flexWrap: "wrap"
          }}>
                  <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.authorEmail === ADMIN_EMAIL ? "#34d399" : "#818cf8"
            }}><IconText>{c.author}</IconText></span>
                  {c.authorEmail === ADMIN_EMAIL && <span style={{
              fontSize: 7,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "rgba(52,211,153,0.6)",
              padding: "1px 5px",
              borderRadius: 4,
              border: "1px solid rgba(52,211,153,0.2)",
              background: "rgba(52,211,153,0.06)"
            }}>Admin</span>}
                  <span style={{
              fontSize: 9,
              color: "rgba(148,163,184,0.28)",
              marginLeft: "auto",
              fontFamily: "monospace"
            }}><IconText>{fmt(c.createdAt)}</IconText></span>
                </div>
                <p style={{
            fontSize: 13,
            color: "rgba(226,232,240,0.82)",
            lineHeight: 1.55,
            fontFamily: "'DM Sans',sans-serif",
            wordBreak: "break-word"
          }}><IconText>{c.text}</IconText></p>
              </div>
            </motion.div>)}
        </div>}
      {!text && <p style={{
      fontSize: 10,
      fontWeight: 700,
      color: "rgba(99,102,241,0.4)",
      marginBottom: 6,
      fontFamily: "'DM Mono',monospace",
      letterSpacing: "0.1em"
    }}><IconText>[icon:lightbulb] </IconText><IconText>{prompt}</IconText></p>}
      <div style={{
      marginBottom: 6
    }}>
        <button type="button" onClick={() => setShowChars(s => !s)} style={{
        padding: "3px 9px",
        borderRadius: 7,
        background: "rgba(99,102,241,0.07)",
        border: "1px solid rgba(99,102,241,0.16)",
        color: "rgba(99,102,241,0.55)",
        fontSize: 9,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'DM Mono',monospace",
        letterSpacing: "0.1em",
        marginBottom: 4,
        transition: "all .15s"
      }}>
          <IconText>{showChars ? "▲ hide PL keys" : "▼ ą ć ę … PL keys"}</IconText>
        </button>
        <AnimatePresence>
          {showChars && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: "auto"
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: .2
        }} style={{
          overflow: "hidden"
        }}>
              <CharBar textRef={inputRef} value={text} setter={setText} />
            </motion.div>}
        </AnimatePresence>
      </div>
      <div style={{
      display: "flex",
      gap: 8
    }}>
        <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submit();
        }
      }} placeholder="Napisz po polsku…" rows={2} style={{
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 13,
        padding: "10px 13px",
        color: "#fff",
        outline: "none",
        fontSize: 13,
        fontFamily: "'DM Sans',sans-serif",
        resize: "none",
        transition: "border-color .2s",
        minWidth: 0
      }} onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        <motion.button whileTap={{
        scale: .9
      }} onClick={submit} disabled={!text.trim() || sending} style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        alignSelf: "flex-end",
        background: text.trim() ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(255,255,255,0.05)",
        color: text.trim() ? "#fff" : "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .2s"
      }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </motion.button>
      </div>
    </div>;
}

/* ── Learn panel — own TTS instances, no conflict with card ── */
function LearnPanel({
  post,
  onClose
}) {
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const allPl = [post.caption, post.grammarRule, post.explanation].filter(Boolean).join(". ");
  const allEn = [post.translation, post.explanation].filter(Boolean).join(". ");
  const blocks = [{
    key: "translation",
    label: "[icon:globe] Translation",
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.2)",
    text: "#c4b5fd",
    plVal: post.caption,
    enVal: post.translation
  }, {
    key: "grammarRule",
    label: "[icon:bolt] Grammar Insight",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
    text: "#6ee7b7",
    plVal: post.grammarRule,
    enVal: null
  }, {
    key: "explanation",
    label: "[icon:sparkles] Why It's Funny",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
    text: "#fcd34d",
    plVal: post.explanation,
    enVal: post.explanation
  }].filter(b => b.plVal);
  return <motion.div initial={{
    opacity: 0,
    height: 0
  }} animate={{
    opacity: 1,
    height: "auto"
  }} exit={{
    opacity: 0,
    height: 0
  }} transition={{
    duration: .28,
    ease: "easeOut"
  }} style={{
    overflow: "hidden"
  }}>
      <div style={{
      margin: "0 14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 9
    }}>
        <div style={{
        height: 2,
        background: "linear-gradient(90deg,#6366f1,#34d399,transparent)",
        borderRadius: 9999
      }} />
        <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
          <span style={{
          fontSize: 9,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#a8b6ca",
          fontFamily: "'DM Mono',monospace"
        }}>Read everything:</span>
          <TTSButton plText={allPl} enText={allEn} />
        </div>
        {post.translation && <div className="pm-recall">
          <strong>Try it before revealing</strong>
          <p>What does the Polish caption mean in English?</p>
          <textarea aria-label="Your translation" value={guess} onChange={e => setGuess(e.target.value)} placeholder="Write your own translation…" rows={2} />
          <button type="button" onClick={() => setRevealed(v => !v)}>{revealed ? "Hide reference" : "Reveal reference translation"}</button>
          {revealed && <p role="status">Compare your meaning with the reference below. Different wording can also be correct.</p>}
        </div>}
        {blocks.filter(b => b.key !== "translation" || revealed || !post.translation).map(b => <div key={b.key} style={{
        padding: "12px 14px",
        borderRadius: 13,
        background: b.bg,
        border: `1px solid ${b.border}`
      }}>
            <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 5,
          gap: 8
        }}>
              <p style={{
            fontSize: 8,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: b.text,
            opacity: .65,
            fontFamily: "'DM Mono',monospace"
          }}><IconText>{b.label}</IconText></p>
              <TTSButton plText={b.plVal} enText={b.enVal} compact />
            </div>
            <p style={{
          fontSize: 13,
          color: b.text,
          lineHeight: 1.6,
          fontFamily: "'DM Sans',sans-serif"
        }}><IconText>{b.plVal}</IconText></p>
            {b.enVal && b.key !== "explanation" && <p style={{
          fontSize: 12,
          color: b.text,
          fontStyle: "italic",
          marginTop: 4,
          fontFamily: "'DM Sans',sans-serif"
        }}><IconText>{b.enVal}</IconText></p>}
          </div>)}
        <button onClick={onClose} style={{
        padding: "8px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        background: "rgba(255,255,255,0.03)",
        color: "#a8b6ca",
        fontSize: 9,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        fontFamily: "'DM Sans',sans-serif"
      }}>Close</button>
      </div>
    </motion.div>;
}

/* ── Edit modal ── */
function EditModal({
  post,
  onClose
}) {
  const [caption, setCaption] = useState(post.caption || "");
  const [translation, setTranslation] = useState(post.translation || "");
  const [grammarRule, setGrammarRule] = useState(post.grammarRule || "");
  const [explanation, setExplanation] = useState(post.explanation || "");
  const [saving, setSaving] = useState(false);
  const captionRef = useRef(null);
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const save = async () => {
    if (!caption.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "memes", post.id), {
        caption,
        translation,
        grammarRule,
        explanation,
        edited: true,
        editedAt: serverTimestamp()
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} onClick={onClose} style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(16px)",
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflowY: "auto"
  }}>
      <motion.div initial={{
      scale: .93,
      opacity: 0,
      y: 16
    }} animate={{
      scale: 1,
      opacity: 1,
      y: 0
    }} exit={{
      scale: .95,
      opacity: 0
    }} transition={{
      type: "spring",
      damping: 26,
      stiffness: 270
    }} onClick={e => e.stopPropagation()} style={{
      width: "100%",
      maxWidth: 560,
      maxHeight: "90vh",
      overflowY: "auto",
      background: "#0c1427",
      borderRadius: 26,
      border: "1px solid rgba(99,102,241,0.25)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
        <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
          <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontStyle: "italic",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: "#f1f5f9"
        }}><IconText>Edit Post [icon:pen]</IconText></h2>
          <button onClick={onClose} style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(148,163,184,0.5)",
          cursor: "pointer",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>✕</button>
        </div>
        {[{
        label: "Polish Caption *",
        value: caption,
        set: setCaption,
        useRef: captionRef,
        rows: 2
      }, {
        label: "English Translation",
        value: translation,
        set: setTranslation,
        useRef: null,
        rows: 2
      }, {
        label: "Grammar Insight",
        value: grammarRule,
        set: setGrammarRule,
        useRef: null,
        rows: 3
      }, {
        label: "Why It's Funny",
        value: explanation,
        set: setExplanation,
        useRef: null,
        rows: 3
      }].map((f, i) => <div key={i}>
            {i === 0 && <CharBar textRef={captionRef} value={caption} setter={setCaption} />}
            <label style={{
          fontSize: 9,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "rgba(148,163,184,0.35)",
          display: "block",
          marginBottom: 5,
          fontFamily: "'DM Mono',monospace"
        }}><IconText>{f.label}</IconText></label>
            <textarea ref={f.useRef || undefined} value={f.value} onChange={e => f.set(e.target.value)} rows={f.rows} style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "11px 13px",
          color: "#f1f5f9",
          outline: "none",
          fontSize: 13,
          resize: "none",
          fontFamily: "'DM Sans',sans-serif",
          lineHeight: 1.6,
          transition: "border-color .2s"
        }} onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          </div>)}
        <motion.button whileTap={{
        scale: .97
      }} onClick={save} disabled={saving || !caption.trim()} style={{
        padding: "14px",
        borderRadius: 14,
        border: "none",
        cursor: "pointer",
        background: saving ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
        color: saving ? "#e2e8f0" : "#fff",
        fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        boxShadow: saving ? "none" : "0 10px 26px rgba(79,70,229,0.3)",
        transition: "all .2s"
      }}>
          <IconText>{saving ? "Saving…" : "Save Changes ✦"}</IconText>
        </motion.button>
      </motion.div>
    </motion.div>;
}

/* ── Upload modal ── */
function UploadModal({
  user,
  profile,
  onClose,
  onSuccess
}) {
  const [caption, setCaption] = useState("");
  const [translation, setTranslation] = useState("");
  const [grammarRule, setGrammarRule] = useState("");
  const [explanation, setExplanation] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const fileRef = useRef(null);
  const captionRef = useRef(null);
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);
  };
  const handleDrop = e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);
  };
  const handleUpload = async () => {
    if (!image || !caption.trim()) {
      setError("Image and Polish caption are required.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", image);
      fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");
      await addDoc(collection(db, "memes"), {
        imageUrl: data.secure_url,
        caption,
        translation,
        grammarRule,
        explanation,
        likes: [],
        commentCount: 0,
        author: profile?.cityName || "Student",
        authorEmail: user.email,
        uid: user.uid,
        level: profile?.level || "A1",
        createdAt: serverTimestamp()
      });
      confetti({
        particleCount: 200,
        spread: 110,
        origin: {
          y: .65
        },
        colors: ["#818cf8", "#34d399", "#f59e0b", "#c4b5fd"]
      });
      onSuccess(50);
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} onClick={onClose} style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.82)",
    backdropFilter: "blur(18px)",
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflowY: "auto"
  }}>
      <motion.div initial={{
      scale: .9,
      opacity: 0,
      y: 24
    }} animate={{
      scale: 1,
      opacity: 1,
      y: 0
    }} exit={{
      scale: .94,
      opacity: 0
    }} transition={{
      type: "spring",
      damping: 26,
      stiffness: 270
    }} onClick={e => e.stopPropagation()} style={{
      width: "100%",
      maxWidth: 580,
      maxHeight: "92vh",
      overflowY: "auto",
      background: "#0a1020",
      borderRadius: 28,
      border: "1px solid rgba(99,102,241,0.28)",
      boxShadow: "0 50px 100px rgba(0,0,0,0.7)",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }}>
        <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }}>
          <div>
            <p style={{
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color: "rgba(99,102,241,0.5)",
            marginBottom: 5,
            fontFamily: "'DM Mono',monospace"
          }}>Step <IconText>{step}</IconText> of 2</p>
            <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontStyle: "italic",
            fontSize: "clamp(1.3rem,4vw,1.7rem)",
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1
          }}><IconText>{step === 1 ? "Drop your meme [icon:image]" : "Add the lesson [icon:sparkles]"}</IconText></h2>
          </div>
          <button onClick={onClose} style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(148,163,184,0.5)",
          cursor: "pointer",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>✕</button>
        </div>
        <div style={{
        display: "flex",
        gap: 6
      }}>
          {[1, 2].map(s => <div key={s} style={{
          flex: 1,
          height: 3,
          borderRadius: 9999,
          background: step >= s ? "linear-gradient(90deg,#6366f1,#34d399)" : "rgba(255,255,255,0.06)",
          transition: "all .4s"
        }} />)}
        </div>
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => !preview && fileRef.current?.click()} style={{
        borderRadius: 18,
        overflow: "hidden",
        cursor: preview ? "default" : "pointer",
        border: `2px dashed ${preview ? "rgba(52,211,153,0.35)" : "rgba(99,102,241,0.22)"}`,
        background: preview ? "transparent" : "rgba(99,102,241,0.04)",
        minHeight: preview ? "auto" : 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "all .2s"
      }}>
          {preview ? <div style={{
          position: "relative",
          width: "100%"
        }}>
              <img src={preview} alt="" style={{
            width: "100%",
            maxHeight: 240,
            objectFit: "contain",
            display: "block",
            borderRadius: 16,
            background: "#050810"
          }} />
              <button onClick={e => {
            e.stopPropagation();
            setImage(null);
            setPreview(null);
            setStep(1);
          }} style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 9999,
            border: "none",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>✕</button>
              <button onClick={e => {
            e.stopPropagation();
            fileRef.current?.click();
          }} style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            padding: "5px 12px",
            borderRadius: 9,
            border: "none",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>Change</button>
            </div> : <div style={{
          textAlign: "center",
          padding: 24
        }}>
              <div style={{
            fontSize: "2.2rem",
            marginBottom: 8
          }}><IconText>[icon:image]</IconText></div>
              <p style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(99,102,241,0.6)",
            marginBottom: 4,
            fontFamily: "'DM Sans',sans-serif"
          }}>Drop meme image here or click to browse</p>
              <p style={{
            fontSize: 10,
            color: "#a8b6ca",
            fontFamily: "'DM Mono',monospace"
          }}>PNG · JPG · GIF · WEBP</p>
            </div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{
        display: "none"
      }} />
        <AnimatePresence>
          {step === 2 && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} style={{
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
              <div>
                <label style={{
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(99,102,241,0.55)",
              display: "block",
              marginBottom: 5,
              fontFamily: "'DM Mono',monospace"
            }}>Polish Caption (required) *</label>
                <CharBar textRef={captionRef} value={caption} setter={setCaption} />
                <textarea ref={captionRef} value={caption} onChange={e => setCaption(e.target.value)} rows={2} placeholder="Napisz podpis po polsku…" style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: `1.5px solid ${!caption.trim() ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 13,
              padding: "12px 14px",
              color: "#f1f5f9",
              outline: "none",
              fontSize: 14,
              resize: "none",
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.6,
              transition: "border-color .2s"
            }} onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"} onBlur={e => e.target.style.borderColor = !caption.trim() ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.08)"} />
              </div>
              {[{
            label: "English Translation",
            ph: "What does it mean in English?",
            value: translation,
            set: setTranslation,
            rows: 2
          }, {
            label: "Grammar Insight",
            ph: "What rule does this meme illustrate?",
            value: grammarRule,
            set: setGrammarRule,
            rows: 3
          }, {
            label: "Why It's Funny (Cultural Note)",
            ph: "Context for non-native speakers…",
            value: explanation,
            set: setExplanation,
            rows: 3
          }].map((f, i) => <div key={i}>
                  <label style={{
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#a8b6ca",
              display: "block",
              marginBottom: 5,
              fontFamily: "'DM Mono',monospace"
            }}><IconText>{f.label}</IconText></label>
                  <textarea value={f.value} onChange={e => f.set(e.target.value)} rows={f.rows} placeholder={f.ph} style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 13,
              padding: "11px 13px",
              color: "#f1f5f9",
              outline: "none",
              fontSize: 13,
              resize: "none",
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.6,
              transition: "border-color .2s"
            }} onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>)}
            </motion.div>}
        </AnimatePresence>
        {error && <p style={{
        fontSize: 12,
        color: "#f43f5e",
        fontFamily: "'DM Sans',sans-serif",
        padding: "8px 12px",
        borderRadius: 10,
        background: "rgba(244,63,94,0.08)",
        border: "1px solid rgba(244,63,94,0.2)"
      }}><IconText>{error}</IconText></p>}
        <motion.button whileTap={{
        scale: .97
      }} onClick={step === 1 ? () => fileRef.current?.click() : handleUpload} disabled={step === 2 && uploading} style={{
        padding: "15px",
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        background: uploading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
        color: uploading ? "#e2e8f0" : "#fff",
        fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.24em",
        boxShadow: uploading ? "none" : "0 12px 30px rgba(79,70,229,0.3)",
        transition: "all .25s"
      }}>
          <IconText>{step === 1 ? "Choose Image [icon:image]" : uploading ? "Publishing…" : "Publish Meme ✦"}</IconText>
        </motion.button>
      </motion.div>
    </motion.div>;
}

/* ── Meme card ── */
function MemeCard({
  post,
  user,
  profile,
  onXp,
  isAdmin
}) {
  const [showLearn, setShowLearn] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hearts, setHearts] = useState([]);
  const isOwner = user?.uid === post.uid;
  const liked = post.likes?.includes(user?.uid);
  // Independent TTS for caption — no conflict with LearnPanel TTS
  const captionTTS = useTTS();
  const rewardedLearn = useRef(false);
  const handleLike = async e => {
    if (!user) return;
    await updateDoc(doc(db, "memes", post.id), {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
    if (!liked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setHearts(h => [...h, {
        id,
        x: rect.left + rect.width / 2 - 12,
        y: rect.top - 12
      }]);
      setTimeout(() => setHearts(h => h.filter(hh => hh.id !== id)), 900);

      confetti({
        particleCount: 22,
        spread: 55,
        origin: {
          y: .8
        },
        colors: ["#818cf8", "#f43f5e", "#34d399"]
      });
    }
  };
  const handleDelete = async () => {
    await deleteDoc(doc(db, "memes", post.id));
    setShowDeleteModal(false);
  };
  return <>
      <AnimatePresence>{hearts.map(h => <HeartPop key={h.id} x={h.x} y={h.y} />)}</AnimatePresence>
      <AnimatePresence>{showFullscreen && <Fullscreen src={post.imageUrl} caption={post.caption} onClose={() => setShowFullscreen(false)} />}</AnimatePresence>
      <AnimatePresence>{showEdit && <EditModal post={post} onClose={() => setShowEdit(false)} />}</AnimatePresence>
      <AnimatePresence>{showDeleteModal && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />}</AnimatePresence>

      <motion.article className="pm-card" initial={{
      opacity: 0,
      y: 18
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: .38,
      ease: "easeOut"
    }} style={{
      background: "rgba(8,14,28,0.94)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 22,
      overflow: "hidden",
      backdropFilter: "blur(20px)",
      boxShadow: "0 6px 32px rgba(0,0,0,0.3)",
      transition: "border-color .3s, box-shadow .3s",
      breakInside: "avoid"
    }} whileHover={{
      borderColor: "rgba(99,102,241,0.2)",
      boxShadow: "0 12px 50px rgba(99,102,241,0.1)"
    }}>

        {/* Header */}
        <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px 10px"
      }}>
          <div style={{
          display: "flex",
          gap: 9,
          alignItems: "center",
          minWidth: 0
        }}>
            <div style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            flexShrink: 0,
            background: post.authorEmail === ADMIN_EMAIL ? "linear-gradient(135deg,#6366f1,#34d399)" : "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'Playfair Display',serif",
            boxShadow: post.authorEmail === ADMIN_EMAIL ? "0 0 16px rgba(99,102,241,0.35)" : "none"
          }}><IconText>{post.author?.charAt(0)}</IconText></div>
            <div style={{
            minWidth: 0
          }}>
              <div style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap"
            }}>
                <span style={{
                fontWeight: 700,
                fontSize: 12,
                color: "#f1f5f9",
                fontFamily: "'DM Sans',sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 90
              }}><IconText>{post.author}</IconText></span>
                {post.authorEmail === ADMIN_EMAIL && <span style={{
                fontSize: 7,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#34d399",
                padding: "1px 5px",
                borderRadius: 4,
                border: "1px solid rgba(52,211,153,0.28)",
                background: "rgba(52,211,153,0.07)",
                flexShrink: 0
              }}>Admin</span>}
                {post.edited && <span style={{
                fontSize: 7,
                fontWeight: 700,
                color: "#a8b6ca",
                background: "rgba(255,255,255,0.04)",
                padding: "1px 5px",
                borderRadius: 4,
                fontFamily: "'DM Mono',monospace",
                flexShrink: 0
              }}>edited</span>}
              </div>
              <div style={{
              fontSize: 9,
              color: "#a8b6ca",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              marginTop: 2,
              fontFamily: "'DM Mono',monospace"
            }}><IconText>{post.level}</IconText> · <IconText>{fmt(post.createdAt)}</IconText></div>
            </div>
          </div>
          {/* Bilingual TTS + edit/delete — no inline confirm */}
          <div style={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          flexShrink: 0
        }}>
            {post.caption && <TTSButton plText={post.caption} enText={post.translation} compact />}
            {(isOwner || isAdmin) && <>
                {isOwner && <button onClick={() => setShowEdit(true)} title="Edit" style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(148,163,184,0.45)",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .18s"
            }} onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(99,102,241,0.14)";
              e.currentTarget.style.color = "#a5b4fc";
            }} onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(148,163,184,0.45)";
            }}><IconText>[icon:pen]</IconText></button>}
                <button onClick={() => setShowDeleteModal(true)} title="Delete" style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              border: "1px solid rgba(239,68,68,0.15)",
              background: "rgba(239,68,68,0.06)",
              color: "rgba(239,68,68,0.5)",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .18s"
            }} onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.18)";
              e.currentTarget.style.color = "#f87171";
            }} onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.06)";
              e.currentTarget.style.color = "rgba(239,68,68,0.5)";
            }}><IconText>[icon:trash]</IconText></button>
              </>}
          </div>
        </div>

        {/* Image */}
        <div style={{
        position: "relative",
        background: "#000",
        cursor: "zoom-in",
        overflow: "hidden"
      }} onClick={() => setShowFullscreen(true)} onDoubleClick={e => {
        e.stopPropagation();
        handleLike(e);
      }}>
          <img src={post.imageUrl} loading="lazy" alt={post.caption || "Community meme"} style={{
          width: "100%",
          display: "block",
          objectFit: "contain",
          maxHeight: 460,
          background: "#000",
          transition: "transform .35s ease"
        }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.012)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
          <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "55px 14px 14px",
          background: "linear-gradient(to top,rgba(2,6,23,0.92) 0%,rgba(2,6,23,0.4) 55%,transparent 100%)",
          pointerEvents: "none"
        }}>
            <p style={{
            fontFamily: "'Playfair Display',serif",
            fontStyle: "italic",
            fontSize: "clamp(.9rem,3.2vw,1.35rem)",
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.25,
            textShadow: "0 4px 18px rgba(0,0,0,0.7)"
          }}><IconText>{post.caption}</IconText></p>
          </div>
          <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "flex-end"
        }}>
            {[["[icon:search] zoom", "z"], ["[icon:heart] 2× like", "l"]].map(([t, k]) => <div key={k} style={{
            padding: "3px 8px",
            borderRadius: 9999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            fontSize: 8,
            fontWeight: 700,
            color: "#e2e8f0",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "'DM Mono',monospace"
          }}><IconText>{t}</IconText></div>)}
          </div>
        </div>

        {/* Actions */}
        <div style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexWrap: "wrap"
      }}>
          <motion.button whileTap={{
          scale: .85
        }} onClick={handleLike} style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          borderRadius: 11,
          cursor: "pointer",
          background: liked ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${liked ? "rgba(244,63,94,0.28)" : "rgba(255,255,255,0.07)"}`,
          color: liked ? "#f43f5e" : "#dbe4ef",
          fontSize: 12,
          fontWeight: 700,
          transition: "all .2s",
          fontFamily: "'DM Sans',sans-serif"
        }}>
            <motion.span animate={liked ? {
            scale: [1, 1.45, 1]
          } : {}} transition={{
            duration: .3
          }}><IconText>{liked ? "[icon:heart]" : "[icon:heart]"}</IconText></motion.span>
            <IconText>{post.likes?.length || 0}</IconText>
          </motion.button>
          <motion.button whileTap={{
          scale: .92
        }} onClick={() => setShowComments(s => !s)} style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          borderRadius: 11,
          cursor: "pointer",
          background: showComments ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${showComments ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.07)"}`,
          color: showComments ? "#818cf8" : "#dbe4ef",
          fontSize: 12,
          fontWeight: 700,
          transition: "all .2s",
          fontFamily: "'DM Sans',sans-serif"
        }}><IconText>
            [icon:chat] </IconText><IconText>{post.commentCount || 0} Comments</IconText>
          </motion.button>
          <div style={{
          flex: 1
        }} />
          <motion.button whileTap={{
          scale: .94
        }} onClick={() => {
          setShowLearn(s => !s);
          if (!showLearn && !rewardedLearn.current) { rewardedLearn.current = true; onXp(10); }
        }} style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          borderRadius: 11,
          cursor: "pointer",
          background: showLearn ? "rgba(52,211,153,0.12)" : "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(52,211,153,0.09))",
          border: `1px solid ${showLearn ? "rgba(52,211,153,0.28)" : "rgba(99,102,241,0.2)"}`,
          color: showLearn ? "#6ee7b7" : "#a5b4fc",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          transition: "all .2s",
          fontFamily: "'DM Sans',sans-serif"
        }}>
            <IconText>{showLearn ? "✓ Learning" : "[icon:sparkles] Decode meme"}</IconText>
          </motion.button>
        </div>

        <AnimatePresence>{showLearn && <LearnPanel post={post} onClose={() => setShowLearn(false)} />}</AnimatePresence>
        <AnimatePresence>
          {showComments && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: "auto"
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: .27
        }} style={{
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.05)"
        }}>
              <div style={{
            paddingTop: 12
          }}><CommentSection postId={post.id} user={user} profile={profile} /></div>
            </motion.div>}
        </AnimatePresence>
      </motion.article>
    </>;
}

/* ── Main ── */
export default function PolishMeme() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [xpItems, setXpItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(12);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  const [word, setWord] = useState(0);
  const [wordReveal, setWordReveal] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const totalXp = profile?.xp || 0;
  const words = [["gdyby", "if (hypothetical)", "Gdyby padało, zostałbym w domu."], ["ponieważ", "because", "Uczę się, ponieważ lubię polski."], ["przecież", "after all", "Przecież to proste!"], ["dopiero", "only just / not until", "Dopiero zaczynam."]];
  useEffect(() => {
    setPosts([]); setStatus("loading");
    if (!db) { setStatus("unavailable"); return; }
    return onSnapshot(collection(db, "memes"), snap => {
      setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0) || a.id.localeCompare(b.id)));
      setStatus("ready");
    }, err => { setPosts([]); setStatus(err.code === "permission-denied" ? "denied" : "error"); });
  }, [user?.uid, retry]);
  const triggerXp = useCallback(amount => { setXpItems(p => [...p, { id: Date.now() + Math.random(), amount }]); }, []);
  const removeXp = useCallback(id => setXpItems(p => p.filter(x => x.id !== id)), []);
  const filtered = posts.filter(p => (filter !== "my" || p.uid === user?.uid) && (filter !== "hot" || (p.likes?.length || 0) > 0) && [p.caption,p.translation,p.author,p.grammarRule,p.explanation].some(v => String(v || "").toLocaleLowerCase("pl").includes(search.trim().toLocaleLowerCase("pl"))));
  if (filter === "hot") filtered.sort((a,b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  return <div className="pmfeed-root">
    <AnimatePresence>{xpItems.map(x => <XpBurst key={x.id} amount={x.amount} onDone={() => removeXp(x.id)} />)}</AnimatePresence>
    <AnimatePresence>{showUpload && <UploadModal user={user} profile={profile} onClose={() => setShowUpload(false)} onSuccess={triggerXp} />}</AnimatePresence>
    <div className="pm-shell">
      <header className="pm-hero"><div><span className="pm-kicker">Polish in real life</span><h1>Laugh. Learn. <em>Repeat.</em></h1><p>Discover memes from the whole community. Decode the joke, listen to Polish and try a comment of your own.</p></div>{user && <button className="pm-primary" onClick={() => setShowUpload(true)}>+ Share a meme</button>}</header>
      <div className="pm-layout"><main className="pm-main">
        <div className="pm-toolbar"><h2>Community memes</h2><div className="pm-tabs" aria-label="Feed filter">{[["all","All memes"],["hot","Popular"],["my","My memes"]].filter(([v]) => v !== "my" || user).map(([v,label]) => <button key={v} aria-pressed={filter===v} onClick={() => {setFilter(v);setVisible(12);}}>{label}</button>)}</div><input type="search" aria-label="Search memes" placeholder="Search captions, words or authors…" value={search} onChange={e => {setSearch(e.target.value);setVisible(12);}} /></div>
        {status === "loading" ? <p role="status" className="pm-message">Loading community memes…</p> : status !== "ready" ? <div role="alert" className="pm-message"><strong>Could not load community memes.</strong><p>{status === "denied" ? "Firestore denied access to the shared memes collection. Ask an administrator to check read permissions." : "Check your connection or Firebase configuration."}</p><button onClick={() => setRetry(v => v+1)}>Try again</button></div> : <><p className="pm-count" role="status">Showing {Math.min(visible,filtered.length)} of {filtered.length} memes</p>{filtered.length === 0 ? <div className="pm-message">{search ? "No matching memes. Try another word." : filter === "my" ? "Your shared memes will appear here." : filter === "hot" ? "No liked memes yet." : "No community memes yet. Share the first one!"}</div> : <div className="pm-grid">{filtered.slice(0,visible).map(post => <MemeCard key={post.id} post={post} user={user} profile={profile} onXp={triggerXp} isAdmin={isAdmin} />)}</div>}{visible < filtered.length && <button className="pm-more" onClick={() => setVisible(v => v+12)}>Load more memes</button>}</>}
      </main><aside className="pm-side">
        <section className="pm-panel"><h2>Your learning</h2><strong className="pm-rank">{LEVELS[getLevel(totalXp)]}</strong><div className="pm-metrics"><div><strong>{totalXp.toLocaleString()}</strong><span>Profile XP</span></div><div><strong>{profile?.streak || 0}</strong><span>Day streak</span></div></div></section>
        <section className="pm-panel"><span className="pm-kicker">Quick recall</span><h2>{words[word][0]}</h2><p>Can you remember the meaning?</p>{wordReveal && <div className="pm-reference"><strong>{words[word][1]}</strong><p>{words[word][2]}</p></div>}<button className="pm-primary" onClick={() => setWordReveal(v => !v)}>{wordReveal ? "Hide meaning" : "Reveal meaning"}</button><button onClick={() => {setWord(v => (v+1)%words.length);setWordReveal(false);}}>Next word →</button></section>
        <section className="pm-panel"><h2>Try a comment</h2><p>Use one of these starters under a meme:</p><strong>To jest zabawne, ponieważ…</strong><strong>Moim zdaniem…</strong><p>One sentence is enough to start.</p></section>
        <section className="pm-panel"><h2>Keep practising</h2><Link to="/shadow-protocol">Speaking practice →</Link><Link to="/reading-practice">Reading practice →</Link></section>
      </aside></div>
    </div>
  </div>;
}
