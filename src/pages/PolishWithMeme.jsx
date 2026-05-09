import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove,
  deleteDoc, limit, increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const ADMIN_EMAIL  = "byadiso@gmail.com";
const POLISH_CHARS = ["ą","ć","ę","ł","ń","ó","ś","ź","ż"];
const TRENDING     = ["gdyby","ponieważ","wcale","przecież","dopiero","jakoś","właśnie"];
const LEVELS       = ["Nowicjusz","Uczeń","Adept","Mistrz","Ekspert","Legenda"];
const PROMPTS = [
  "Opisz ten mem jednym zdaniem po polsku…",
  "Użyj słowa 'przecież' w komentarzu…",
  "Napisz, co czujesz — po polsku!",
  "Spróbuj użyć czasu przeszłego…",
  "Dodaj komentarz z pytaniem po polsku…",
];

const getLevel = (xp = 0) => {
  if (xp < 100) return 0; if (xp < 300) return 1; if (xp < 700) return 2;
  if (xp < 1400) return 3; if (xp < 2500) return 4; return 5;
};

const fmt = (ts) => {
  if (!ts?.toDate) return "";
  const d = ts.toDate(), now = new Date();
  const m = Math.floor((now - d) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
};

const randomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

/* ─── TTS hook ──────────────────────────────────────────────────────────── */
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pl-PL"; u.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith("pl"));
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);
  const stop = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false); }, []);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return { speak, stop, speaking };
}

/* ─── XP Burst ──────────────────────────────────────────────────────────── */
function XpBurst({ amount, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.7 }}
      animate={{ opacity: 1, y: -10, scale: 1 }}
      exit={{ opacity: 0, y: -70, scale: 1.15 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{
        position: "fixed", top: 80, right: 24, zIndex: 9999, pointerEvents: "none",
        background: "linear-gradient(135deg,#6366f1,#34d399)",
        padding: "10px 20px", borderRadius: 16,
        fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14,
        color: "#fff", letterSpacing: "0.06em",
        boxShadow: "0 8px 28px rgba(99,102,241,0.45)",
      }}
    >+{amount} XP ✦</motion.div>
  );
}

/* ─── Heart pop ──────────────────────────────────────────────────────────── */
function HeartPop({ x, y, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.5, x, y }}
      animate={{ opacity: 0, scale: 2.8, y: y - 90 }}
      exit={{}}
      transition={{ duration: 0.75, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{ position: "fixed", zIndex: 9998, fontSize: 24, pointerEvents: "none" }}
    >❤️</motion.div>
  );
}

/* ─── Sound wave ─────────────────────────────────────────────────────────── */
function SoundWave() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      {[{x:0,h:4,d:0},{x:4,h:10,d:.15},{x:8,h:14,d:.3},{x:12,h:10,d:.15}].map(b => (
        <motion.rect key={b.x} x={b.x} y={(16-b.h)/2} width={3} height={b.h} rx={1.5}
          animate={{ scaleY:[1,.3,1] }} transition={{ duration:.7, repeat:Infinity, delay:b.d, ease:"easeInOut" }} />
      ))}
    </svg>
  );
}

/* ─── Polish char bar ────────────────────────────────────────────────────── */
function CharBar({ textRef, value, setter }) {
  const inject = (char) => {
    const el = textRef?.current;
    if (!el) { setter(v => v + char); return; }
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    const next = value.slice(0, s) + char + value.slice(e);
    setter(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s+1,s+1); });
  };
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:6 }}>
      {POLISH_CHARS.map(c => (
        <button key={c} type="button" onClick={() => inject(c)} style={{
          width:30, height:30, borderRadius:8, border:"1px solid rgba(99,102,241,0.2)",
          background:"rgba(99,102,241,0.08)", color:"#a5b4fc", fontWeight:700, fontSize:13,
          cursor:"pointer", transition:"all .15s", fontFamily:"'DM Sans',sans-serif",
        }}
        onMouseEnter={e => { e.currentTarget.style.background="rgba(99,102,241,0.22)"; e.currentTarget.style.transform="scale(1.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.background="rgba(99,102,241,0.08)"; e.currentTarget.style.transform="scale(1)"; }}
        >{c}</button>
      ))}
    </div>
  );
}

/* ─── Fullscreen viewer ──────────────────────────────────────────────────── */
function Fullscreen({ src, caption, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key==="Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(0,0,0,0.97)", backdropFilter:"blur(28px)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, cursor:"zoom-out",
      }}
    >
      <button onClick={onClose} style={{
        position:"fixed", top:20, right:20, width:42, height:42, borderRadius:13,
        background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
        color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:18, zIndex:1001,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>✕</button>
      <div style={{ position:"fixed", top:26, left:"50%", transform:"translateX(-50%)", fontSize:9, fontWeight:800, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", fontFamily:"monospace" }}>
        ESC or tap to close
      </div>
      <motion.div initial={{scale:.88,opacity:0}} animate={{scale:1,opacity:1}}
        transition={{type:"spring",damping:28,stiffness:250}}
        onClick={e=>e.stopPropagation()}
        style={{ position:"relative", maxWidth:"min(92vw,1000px)", maxHeight:"88vh" }}
      >
        <img src={src} alt="" style={{ width:"100%", maxHeight:"88vh", objectFit:"contain", borderRadius:18, boxShadow:"0 50px 120px rgba(0,0,0,0.9)", display:"block" }} />
        {caption && (
          <div style={{
            position:"absolute", left:0, right:0, bottom:0,
            padding:"60px 24px 22px",
            background:"linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 100%)",
            borderRadius:"0 0 18px 18px",
          }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,2.5vw,1.7rem)", fontWeight:700, color:"#f1f5f9", lineHeight:1.2, textShadow:"0 4px 20px rgba(0,0,0,0.7)" }}>{caption}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Comment section ────────────────────────────────────────────────────── */
function CommentSection({ postId, user, profile }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [prompt]                = useState(randomPrompt);
  const inputRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db,"memes",postId,"comments"), orderBy("createdAt","asc"), limit(40));
    return onSnapshot(q, snap => setComments(snap.docs.map(d => ({id:d.id,...d.data()}))));
  }, [postId]);

  const submit = async () => {
    if (!text.trim() || sending || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db,"memes",postId,"comments"), {
        text: text.trim(),
        author: profile?.cityName || "Student",
        authorEmail: user.email,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      // Increment comment count on parent doc
      await updateDoc(doc(db,"memes",postId), { commentCount: increment(1) });
      setText(""); inputRef.current?.focus();
    } finally { setSending(false); }
  };

  return (
    <div style={{ padding:"4px 16px 18px" }}>
      {comments.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
          {comments.map(c => (
            <motion.div key={c.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
              style={{ display:"flex", gap:9, alignItems:"flex-start" }}
            >
              <div style={{
                width:28, height:28, borderRadius:9, flexShrink:0,
                background: c.authorEmail===ADMIN_EMAIL ? "linear-gradient(135deg,#6366f1,#34d399)" : "rgba(99,102,241,0.15)",
                border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, color:"#818cf8",
              }}>{c.author?.charAt(0)}</div>
              <div style={{ flex:1, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"8px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, fontWeight:700, color: c.authorEmail===ADMIN_EMAIL ? "#34d399" : "#818cf8" }}>{c.author}</span>
                  {c.authorEmail===ADMIN_EMAIL && <span style={{ fontSize:7, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.18em", color:"rgba(52,211,153,0.6)", padding:"1px 5px", borderRadius:4, border:"1px solid rgba(52,211,153,0.2)", background:"rgba(52,211,153,0.06)" }}>Admin</span>}
                  <span style={{ fontSize:9, color:"rgba(148,163,184,0.28)", marginLeft:"auto", fontFamily:"monospace" }}>{fmt(c.createdAt)}</span>
                </div>
                <p style={{ fontSize:13, color:"rgba(226,232,240,0.82)", lineHeight:1.55, fontFamily:"'DM Sans',sans-serif" }}>{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Writing prompt nudge */}
      {!text && (
        <p style={{ fontSize:10, fontWeight:700, color:"rgba(99,102,241,0.4)", marginBottom:6, fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }}>
          💡 {prompt}
        </p>
      )}

      <CharBar textRef={inputRef} value={text} setter={setText} />

      <div style={{ display:"flex", gap:8 }}>
        <textarea ref={inputRef} value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();} }}
          placeholder="Napisz po polsku…"
          rows={2}
          style={{
            flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:13, padding:"10px 13px", color:"#fff", outline:"none", fontSize:13,
            fontFamily:"'DM Sans',sans-serif", resize:"none", transition:"border-color .2s", minWidth:0,
          }}
          onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.45)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}
        />
        <motion.button whileTap={{scale:.9}} onClick={submit} disabled={!text.trim()||sending}
          style={{
            width:42, height:42, borderRadius:12, border:"none", cursor:"pointer", flexShrink:0, alignSelf:"flex-end",
            background: text.trim() ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(255,255,255,0.05)",
            color: text.trim() ? "#fff" : "rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Learn panel ────────────────────────────────────────────────────────── */
function LearnPanel({ post, onClose }) {
  const { speak, stop, speaking } = useTTS();
  const fullText = [post.caption, post.translation, post.grammarRule, post.explanation].filter(Boolean).join(". ");

  const blocks = [
    { key:"translation",  label:"🌍 Translation",     color:"rgba(99,102,241,0.12)",  border:"rgba(99,102,241,0.2)",  text:"#c4b5fd", value: post.translation },
    { key:"grammarRule",  label:"⚡ Grammar Insight",  color:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.2)",  text:"#6ee7b7", value: post.grammarRule },
    { key:"explanation",  label:"😂 Why It's Funny",   color:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.18)", text:"#fcd34d", value: post.explanation },
  ].filter(b => b.value);

  return (
    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
      transition={{duration:.28, ease:"easeOut"}} style={{overflow:"hidden"}}
    >
      <div style={{ margin:"0 14px 16px", display:"flex", flexDirection:"column", gap:9 }}>
        <div style={{ height:2, background:"linear-gradient(90deg,#6366f1,#34d399,transparent)", borderRadius:9999 }} />

        {/* Read all */}
        <motion.button whileTap={{scale:.93}} onClick={() => speaking ? stop() : speak(fullText)}
          style={{
            alignSelf:"flex-start", display:"flex", alignItems:"center", gap:6,
            padding:"8px 14px", borderRadius:11, border:"none", cursor:"pointer",
            background: speaking ? "rgba(52,211,153,0.15)" : "rgba(99,102,241,0.1)",
            border: `1px solid ${speaking ? "rgba(52,211,153,0.35)" : "rgba(99,102,241,0.22)"}`,
            color: speaking ? "#6ee7b7" : "#a5b4fc", fontSize:10, fontWeight:800,
            textTransform:"uppercase", letterSpacing:"0.16em", fontFamily:"'DM Sans',sans-serif",
          }}
        >
          {speaking ? <><SoundWave /> Stop</> : <>🔊 Read all aloud</>}
        </motion.button>

        {blocks.map(b => (
          <div key={b.key} style={{ padding:"12px 14px", borderRadius:13, background:b.color, border:`1px solid ${b.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <p style={{ fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.22em", color:b.text, opacity:.65, fontFamily:"'DM Mono',monospace" }}>{b.label}</p>
              <button onClick={() => speak(b.value)} style={{
                padding:"3px 8px", borderRadius:8, border:"none", cursor:"pointer",
                background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)",
                fontSize:9, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
              }}>🔊</button>
            </div>
            <p style={{ fontSize:13, color:b.text, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{b.value}</p>
          </div>
        ))}

        <button onClick={onClose} style={{
          padding:"8px", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)",
          cursor:"pointer", background:"rgba(255,255,255,0.03)",
          color:"rgba(148,163,184,0.4)", fontSize:9, fontWeight:800,
          textTransform:"uppercase", letterSpacing:"0.18em", fontFamily:"'DM Sans',sans-serif",
        }}>Close</button>
      </div>
    </motion.div>
  );
}

/* ─── Edit modal ─────────────────────────────────────────────────────────── */
function EditModal({ post, onClose }) {
  const [caption,     setCaption]     = useState(post.caption     || "");
  const [translation, setTranslation] = useState(post.translation || "");
  const [grammarRule, setGrammarRule] = useState(post.grammarRule || "");
  const [explanation, setExplanation] = useState(post.explanation || "");
  const [saving, setSaving] = useState(false);
  const captionRef = useRef(null);

  useEffect(() => {
    const h = e => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  }, [onClose]);

  const save = async () => {
    if (!caption.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db,"memes",post.id), {
        caption, translation, grammarRule, explanation, edited: true, editedAt: serverTimestamp(),
      });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(16px)",
        zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16, overflowY:"auto",
      }}
    >
      <motion.div initial={{scale:.93,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}}
        exit={{scale:.95,opacity:0}} transition={{type:"spring",damping:26,stiffness:270}}
        onClick={e=>e.stopPropagation()}
        style={{
          width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto",
          background:"#0c1427", borderRadius:26,
          border:"1px solid rgba(99,102,241,0.25)",
          boxShadow:"0 40px 80px rgba(0,0,0,0.6)",
          padding:22, display:"flex", flexDirection:"column", gap:12,
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"1.4rem", fontWeight:700, color:"#f1f5f9" }}>Edit Post ✍️</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {[
          { label:"Polish Caption *", value:caption, set:setCaption, ref:captionRef, rows:2 },
          { label:"English Translation", value:translation, set:setTranslation, ref:null, rows:2 },
          { label:"Grammar Insight", value:grammarRule, set:setGrammarRule, ref:null, rows:3 },
          { label:"Why It's Funny", value:explanation, set:setExplanation, ref:null, rows:3 },
        ].map((f,i) => (
          <div key={i}>
            {i===0 && <CharBar textRef={captionRef} value={caption} setter={setCaption} />}
            <label style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.2em", color:"rgba(148,163,184,0.35)", display:"block", marginBottom:5, fontFamily:"'DM Mono',monospace" }}>{f.label}</label>
            <textarea ref={f.ref} value={f.value} onChange={e=>f.set(e.target.value)} rows={f.rows}
              style={{
                width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:12, padding:"11px 13px", color:"#f1f5f9", outline:"none",
                fontSize:13, resize:"none", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, transition:"border-color .2s",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.45)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}
            />
          </div>
        ))}

        <motion.button whileTap={{scale:.97}} onClick={save} disabled={saving||!caption.trim()}
          style={{
            padding:"14px", borderRadius:14, border:"none", cursor:"pointer",
            background: saving ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: saving ? "rgba(255,255,255,0.3)" : "#fff",
            fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:11,
            textTransform:"uppercase", letterSpacing:"0.22em",
            boxShadow: saving ? "none" : "0 10px 26px rgba(79,70,229,0.3)", transition:"all .2s",
          }}
        >{saving ? "Saving…" : "Save Changes ✦"}</motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Upload modal ───────────────────────────────────────────────────────── */
function UploadModal({ user, profile, onClose, onSuccess }) {
  const [caption,     setCaption]     = useState("");
  const [translation, setTranslation] = useState("");
  const [grammarRule, setGrammarRule] = useState("");
  const [explanation, setExplanation] = useState("");
  const [image,       setImage]       = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState("");
  const [step,        setStep]        = useState(1); // 1=image, 2=text
  const fileRef    = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    const h = e => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  }, [onClose]);

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    setImage(f); setPreview(URL.createObjectURL(f)); setStep(2);
  };
  const handleDrop = e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    setImage(f); setPreview(URL.createObjectURL(f)); setStep(2);
  };

  const handleUpload = async () => {
    if (!image || !caption.trim()) { setError("Image and Polish caption are required."); return; }
    setError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", image);
      fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      await addDoc(collection(db,"memes"), {
        imageUrl: data.secure_url, caption, translation, grammarRule, explanation,
        likes:[], commentCount:0,
        author: profile?.cityName || "Student",
        authorEmail: user.email, uid: user.uid,
        level: profile?.level || "A1",
        createdAt: serverTimestamp(),
      });

      confetti({ particleCount:200, spread:110, origin:{y:.65}, colors:["#818cf8","#34d399","#f59e0b","#c4b5fd"] });
      onSuccess(50); onClose();
    } catch(err) { setError(err.message || "Upload failed."); }
    finally { setUploading(false); }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(18px)",
        zIndex:500, display:"flex", alignItems:"center", justifyContent:"center",
        padding:16, overflowY:"auto",
      }}
    >
      <motion.div initial={{scale:.9,opacity:0,y:24}} animate={{scale:1,opacity:1,y:0}}
        exit={{scale:.94,opacity:0}} transition={{type:"spring",damping:26,stiffness:270}}
        onClick={e=>e.stopPropagation()}
        style={{
          width:"100%", maxWidth:580, maxHeight:"92vh", overflowY:"auto",
          background:"#0a1020", borderRadius:28,
          border:"1px solid rgba(99,102,241,0.28)",
          boxShadow:"0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)",
          padding:24, display:"flex", flexDirection:"column", gap:14,
        }}
      >
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.28em", color:"rgba(99,102,241,0.5)", marginBottom:5, fontFamily:"'DM Mono',monospace" }}>
              Step {step} of 2
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(1.3rem,4vw,1.7rem)", fontWeight:700, color:"#f1f5f9", lineHeight:1 }}>
              {step===1 ? "Drop your meme 📸" : "Add the lesson ✨"}
            </h2>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={{ display:"flex", gap:6 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:3, borderRadius:9999, background: step>=s ? "linear-gradient(90deg,#6366f1,#34d399)" : "rgba(255,255,255,0.06)", transition:"all .4s" }} />
          ))}
        </div>

        {/* Drop zone — always visible */}
        <div
          onDrop={handleDrop} onDragOver={e=>e.preventDefault()}
          onClick={() => !preview && fileRef.current?.click()}
          style={{
            borderRadius:18, overflow:"hidden", cursor: preview ? "default" : "pointer",
            border:`2px dashed ${preview ? "rgba(52,211,153,0.35)" : "rgba(99,102,241,0.22)"}`,
            background: preview ? "transparent" : "rgba(99,102,241,0.04)",
            minHeight: preview ? "auto" : 130,
            display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative", transition:"all .2s",
          }}
        >
          {preview ? (
            <div style={{ position:"relative", width:"100%" }}>
              <img src={preview} alt="" style={{ width:"100%", maxHeight:240, objectFit:"contain", display:"block", borderRadius:16, background:"#050810" }} />
              <button onClick={e=>{e.stopPropagation();setImage(null);setPreview(null);setStep(1);}}
                style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:9999, border:"none", background:"rgba(0,0,0,0.65)", color:"#fff", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              <button onClick={e=>{e.stopPropagation();fileRef.current?.click();}}
                style={{ position:"absolute", bottom:8, right:8, padding:"5px 12px", borderRadius:9, border:"none", background:"rgba(0,0,0,0.65)", color:"#fff", cursor:"pointer", fontSize:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Change</button>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:24 }}>
              <div style={{ fontSize:"2.2rem", marginBottom:8 }}>📸</div>
              <p style={{ fontSize:12, fontWeight:700, color:"rgba(99,102,241,0.6)", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Drop meme image here or click to browse</p>
              <p style={{ fontSize:10, color:"rgba(148,163,184,0.3)", fontFamily:"'DM Mono',monospace" }}>PNG · JPG · GIF · WEBP</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />

        {/* Step 2 fields */}
        <AnimatePresence>
          {step===2 && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* Caption — required */}
              <div>
                <label style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.2em", color:"rgba(99,102,241,0.55)", display:"block", marginBottom:5, fontFamily:"'DM Mono',monospace" }}>
                  Polish Caption (required) *
                </label>
                <CharBar textRef={captionRef} value={caption} setter={setCaption} />
                <textarea ref={captionRef} value={caption} onChange={e=>setCaption(e.target.value)} rows={2}
                  placeholder="Napisz podpis po polsku… (the funny Polish text)"
                  style={{
                    width:"100%", background:"rgba(255,255,255,0.04)", border:`1.5px solid ${!caption.trim()?"rgba(244,63,94,0.2)":"rgba(255,255,255,0.08)"}`,
                    borderRadius:13, padding:"12px 14px", color:"#f1f5f9", outline:"none",
                    fontSize:14, resize:"none", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, transition:"border-color .2s",
                  }}
                  onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.5)"}
                  onBlur={e=>e.target.style.borderColor=!caption.trim()?"rgba(244,63,94,0.2)":"rgba(255,255,255,0.08)"}
                />
              </div>

              {[
                { label:"English Translation", ph:"What does it mean in English?", value:translation, set:setTranslation, rows:2 },
                { label:"Grammar Insight", ph:"What rule does this meme illustrate? (e.g. instrumental case after 'być'…)", value:grammarRule, set:setGrammarRule, rows:3 },
                { label:"Why It's Funny (Cultural Note)", ph:"Context for non-native speakers…", value:explanation, set:setExplanation, rows:3 },
              ].map((f,i) => (
                <div key={i}>
                  <label style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.2em", color:"rgba(148,163,184,0.3)", display:"block", marginBottom:5, fontFamily:"'DM Mono',monospace" }}>{f.label}</label>
                  <textarea value={f.value} onChange={e=>f.set(e.target.value)} rows={f.rows} placeholder={f.ph}
                    style={{
                      width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:13, padding:"11px 13px", color:"#f1f5f9", outline:"none",
                      fontSize:13, resize:"none", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, transition:"border-color .2s",
                    }}
                    onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.4)"}
                    onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p style={{ fontSize:12, color:"#f43f5e", fontFamily:"'DM Sans',sans-serif", padding:"8px 12px", borderRadius:10, background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)" }}>{error}</p>
        )}

        <motion.button whileTap={{scale:.97}}
          onClick={step===1 ? ()=>fileRef.current?.click() : handleUpload}
          disabled={step===2 && uploading}
          style={{
            padding:"15px", borderRadius:16, border:"none", cursor:"pointer",
            background: uploading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: uploading ? "rgba(255,255,255,0.3)" : "#fff",
            fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:11,
            textTransform:"uppercase", letterSpacing:"0.24em",
            boxShadow: uploading ? "none" : "0 12px 30px rgba(79,70,229,0.3)", transition:"all .25s",
          }}
        >
          {step===1 ? "Choose Image 📸" : uploading ? "Publishing…" : "Publish Meme ✦"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Meme card ──────────────────────────────────────────────────────────── */
function MemeCard({ post, user, profile, onXp, isAdmin }) {
  const [showLearn,    setShowLearn]    = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [delConfirm,   setDelConfirm]   = useState(false);
  const [hearts,       setHearts]       = useState([]);

  const isOwner = user?.uid === post.uid;
  const liked   = post.likes?.includes(user?.uid);
  const { speak, speaking } = useTTS();

  const handleLike = async (e) => {
    if (!user) return;
    await updateDoc(doc(db,"memes",post.id), {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
    if (!liked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setHearts(h => [...h, { id, x: rect.left + rect.width/2 - 12, y: rect.top - 12 }]);
      setTimeout(() => setHearts(h => h.filter(hh => hh.id !== id)), 900);
      onXp(5);
      confetti({ particleCount:22, spread:55, origin:{y:.8}, colors:["#818cf8","#f43f5e","#34d399"] });
    }
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db,"memes",post.id));
  };

  return (
    <>
      <AnimatePresence>
        {hearts.map(h => <HeartPop key={h.id} x={h.x} y={h.y} onDone={() => setHearts(p => p.filter(hh=>hh.id!==h.id))} />)}
      </AnimatePresence>
      <AnimatePresence>{showFullscreen && <Fullscreen src={post.imageUrl} caption={post.caption} onClose={()=>setShowFullscreen(false)} />}</AnimatePresence>
      <AnimatePresence>{showEdit && <EditModal post={post} onClose={()=>setShowEdit(false)} />}</AnimatePresence>

      <motion.article
        initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.38,ease:"easeOut"}}
        style={{
          background:"rgba(8,14,28,0.94)", border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:22, overflow:"hidden", backdropFilter:"blur(20px)",
          boxShadow:"0 6px 32px rgba(0,0,0,0.3)",
          transition:"border-color .3s, box-shadow .3s",
          breakInside:"avoid",
        }}
        whileHover={{ borderColor:"rgba(99,102,241,0.2)", boxShadow:"0 12px 50px rgba(99,102,241,0.1)" }}
      >
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px 10px" }}>
          <div style={{ display:"flex", gap:9, alignItems:"center" }}>
            <div style={{
              width:36, height:36, borderRadius:11, flexShrink:0,
              background: post.authorEmail===ADMIN_EMAIL ? "linear-gradient(135deg,#6366f1,#34d399)" : "rgba(99,102,241,0.15)",
              border:"1px solid rgba(99,102,241,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, fontWeight:800, color:"#fff", fontFamily:"'Playfair Display',serif",
              boxShadow: post.authorEmail===ADMIN_EMAIL ? "0 0 16px rgba(99,102,241,0.35)" : "none",
            }}>{post.author?.charAt(0)}</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                <span style={{ fontWeight:700, fontSize:12, color:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" }}>{post.author}</span>
                {post.authorEmail===ADMIN_EMAIL && <span style={{ fontSize:7, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.15em", color:"#34d399", padding:"1px 5px", borderRadius:4, border:"1px solid rgba(52,211,153,0.28)", background:"rgba(52,211,153,0.07)" }}>Admin</span>}
                {post.edited && <span style={{ fontSize:7, fontWeight:700, color:"rgba(148,163,184,0.3)", background:"rgba(255,255,255,0.04)", padding:"1px 5px", borderRadius:4, fontFamily:"'DM Mono',monospace" }}>edited</span>}
              </div>
              <div style={{ fontSize:9, color:"rgba(148,163,184,0.32)", textTransform:"uppercase", letterSpacing:"0.14em", marginTop:2, fontFamily:"'DM Mono',monospace" }}>
                {post.level} · {fmt(post.createdAt)}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            {/* TTS */}
            {post.caption && (
              <button onClick={()=>speak(post.caption)} title="Read caption aloud"
                style={{
                  width:32, height:32, borderRadius:9, border:"1px solid rgba(255,255,255,0.07)",
                  background: speaking ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                  color: speaking ? "#34d399" : "rgba(148,163,184,0.5)",
                  cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s",
                }}>🔊</button>
            )}
            {/* Owner / admin controls */}
            {(isOwner || isAdmin) && !delConfirm && (
              <>
                {isOwner && (
                  <button onClick={()=>setShowEdit(true)} title="Edit"
                    style={{ width:32, height:32, borderRadius:9, border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.45)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>✍️</button>
                )}
                <button onClick={()=>setDelConfirm(true)} title="Delete"
                  style={{ width:32, height:32, borderRadius:9, border:"1px solid rgba(239,68,68,0.15)", background:"rgba(239,68,68,0.06)", color:"rgba(239,68,68,0.5)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>🗑️</button>
              </>
            )}
            {/* Delete confirm */}
            {delConfirm && (
              <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"rgba(244,63,94,0.7)", fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Delete?</span>
                <button onClick={handleDelete} style={{ padding:"4px 10px", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Yes</button>
                <button onClick={()=>setDelConfirm(false)} style={{ padding:"4px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"rgba(148,163,184,0.6)", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>No</button>
              </div>
            )}
          </div>
        </div>

        {/* Image — click to fullscreen, double-click to like */}
        <div style={{ position:"relative", background:"#000", cursor:"zoom-in", overflow:"hidden" }}
          onClick={()=>setShowFullscreen(true)}
          onDoubleClick={e=>{e.stopPropagation(); handleLike(e);}}
        >
          <img src={post.imageUrl} alt=""
            style={{ width:"100%", display:"block", objectFit:"contain", maxHeight:460, background:"#000", transition:"transform .35s ease" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.012)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
          />
          {/* Gradient + caption overlay */}
          <div style={{
            position:"absolute", left:0, right:0, bottom:0,
            padding:"55px 14px 14px",
            background:"linear-gradient(to top,rgba(2,6,23,0.92) 0%,rgba(2,6,23,0.4) 55%,transparent 100%)",
            pointerEvents:"none",
          }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(.9rem,3.2vw,1.35rem)", fontWeight:700, color:"#f1f5f9", lineHeight:1.25, textShadow:"0 4px 18px rgba(0,0,0,0.7)" }}>
              {post.caption}
            </p>
          </div>
          {/* Hints */}
          <div style={{ position:"absolute", top:8, right:8, display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end" }}>
            {[["🔍 zoom","zoom"],["❤️ 2× like","like"]].map(([t,k]) => (
              <div key={k} style={{ padding:"3px 8px", borderRadius:9999, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", fontSize:8, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:"'DM Mono',monospace" }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", flexWrap:"wrap" }}>
          {/* Like */}
          <motion.button whileTap={{scale:.85}} onClick={handleLike}
            style={{
              display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:11, border:"none", cursor:"pointer",
              background: liked ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.04)",
              border:`1px solid ${liked ? "rgba(244,63,94,0.28)" : "rgba(255,255,255,0.07)"}`,
              color: liked ? "#f43f5e" : "rgba(255,255,255,0.5)",
              fontSize:12, fontWeight:700, transition:"all .2s", fontFamily:"'DM Sans',sans-serif",
            }}
          >
            <motion.span animate={liked?{scale:[1,1.45,1]}:{}} transition={{duration:.3}}>
              {liked?"❤️":"🤍"}
            </motion.span>
            {post.likes?.length||0}
          </motion.button>

          {/* Comment */}
          <motion.button whileTap={{scale:.92}} onClick={()=>setShowComments(s=>!s)}
            style={{
              display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:11, border:"none", cursor:"pointer",
              background: showComments ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
              border:`1px solid ${showComments ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.07)"}`,
              color: showComments ? "#818cf8" : "rgba(255,255,255,0.5)",
              fontSize:12, fontWeight:700, transition:"all .2s", fontFamily:"'DM Sans',sans-serif",
            }}
          >💬 {post.commentCount||""}</motion.button>

          <div style={{flex:1}} />

          {/* Learn */}
          <motion.button whileTap={{scale:.94}} onClick={()=>{setShowLearn(s=>!s); if(!showLearn) onXp(10);}}
            style={{
              display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:11, border:"none", cursor:"pointer",
              background: showLearn ? "rgba(52,211,153,0.12)" : "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(52,211,153,0.09))",
              border:`1px solid ${showLearn ? "rgba(52,211,153,0.28)" : "rgba(99,102,241,0.2)"}`,
              color: showLearn ? "#6ee7b7" : "#a5b4fc",
              fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase",
              transition:"all .2s", fontFamily:"'DM Sans',sans-serif",
            }}
          >{showLearn?"✓ Learning":"✨ Learn"}</motion.button>
        </div>

        {/* Learn panel */}
        <AnimatePresence>
          {showLearn && <LearnPanel post={post} onClose={()=>setShowLearn(false)} />}
        </AnimatePresence>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              transition={{duration:.27}} style={{overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{paddingTop:12}}>
                <CommentSection postId={post.id} user={user} profile={profile} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function PolishMeme() {
  const { user, profile } = useAuth();
  const [posts,      setPosts]      = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [xpItems,    setXpItems]    = useState([]);
  const [filter,     setFilter]     = useState("new"); // new | hot | my

  const isAdmin    = user?.email === ADMIN_EMAIL;
  const totalXp    = profile?.xp || 0;
  const levelLabel = LEVELS[getLevel(totalXp)];
  const streak     = profile?.streak || 0;

  useEffect(() => {
    const q = query(collection(db,"memes"), orderBy("createdAt","desc"), limit(80));
    return onSnapshot(q, snap => setPosts(snap.docs.map(d => ({id:d.id,...d.data()}))));
  }, []);

  const triggerXp = useCallback((amount) => {
    const id = Date.now() + Math.random();
    setXpItems(p => [...p, {id, amount}]);
  }, []);
  const removeXp = useCallback(id => setXpItems(p => p.filter(x=>x.id!==id)), []);

  const filteredPosts = posts.filter(p => {
    if (filter==="my") return p.uid === user?.uid;
    if (filter==="hot") return (p.likes?.length||0) >= 1;
    return true;
  }).sort((a,b) => {
    if (filter==="hot") return (b.likes?.length||0)-(a.likes?.length||0);
    return 0;
  });

  // Split into two masonry columns
  const col1 = filteredPosts.filter((_,i)=>i%2===0);
  const col2 = filteredPosts.filter((_,i)=>i%2===1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');

        .pmfeed-root *, .pmfeed-root *::before, .pmfeed-root *::after { box-sizing:border-box; margin:0; padding:0; }
        .pmfeed-root ::-webkit-scrollbar { width:4px; }
        .pmfeed-root ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.2); border-radius:9999px; }
        button { -webkit-tap-highlight-color:transparent; }

        .pmfeed-root {
          min-height:100%;
          background:
            radial-gradient(ellipse 900px 500px at 15% 0%,rgba(99,102,241,0.07) 0%,transparent 70%),
            radial-gradient(ellipse 600px 400px at 85% 100%,rgba(52,211,153,0.05) 0%,transparent 70%),
            #020617;
          color:#f1f5f9;
          font-family:'DM Sans',sans-serif;
        }

        .pmfeed-layout {
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          max-width:1280px;
          margin:0 auto;
          padding:20px 14px 80px;
        }
        @media(min-width:1080px){
          .pmfeed-layout{grid-template-columns:1fr 268px;padding:24px 20px 80px;}
        }

        /* Two-column masonry feed */
        .pmfeed-masonry {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
          align-items:start;
        }
        @media(max-width:560px){
          .pmfeed-masonry{grid-template-columns:1fr;}
        }

        .pmfeed-col { display:flex; flex-direction:column; gap:14px; }

        .pmfeed-sidebar {
          display:flex; flex-direction:column; gap:12px;
        }
        @media(min-width:1080px){
          .pmfeed-sidebar{position:sticky;top:20px;}
        }

        .pmfeed-scard {
          background:#0b1220;
          border:1px solid rgba(255,255,255,0.06);
          border-radius:18px;
          padding:16px 18px;
          transition:border-color .2s;
        }
        .pmfeed-scard:hover{border-color:rgba(99,102,241,0.15);}

        .pmfeed-label {
          font-size:8px; font-weight:800; text-transform:uppercase;
          letter-spacing:0.26em; color:rgba(148,163,184,0.32);
          margin-bottom:8px; font-family:'DM Mono',monospace;
        }

        .pmfeed-upload-btn {
          width:100%; padding:13px; border:none; border-radius:14px;
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          color:#fff; font-family:'DM Sans',sans-serif; font-weight:800;
          font-size:10px; letter-spacing:0.22em; text-transform:uppercase;
          cursor:pointer; transition:all .25s;
          box-shadow:0 8px 24px rgba(79,70,229,0.3); touch-action:manipulation;
        }
        .pmfeed-upload-btn:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(79,70,229,0.4);}
        .pmfeed-upload-btn:active{transform:scale(.97);}

        .pmfeed-filter-btn {
          padding:7px 14px; border-radius:10px;
          font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
          cursor:pointer; border:1px solid transparent; transition:all .2s;
          font-family:'DM Sans',sans-serif;
        }
        .pmfeed-filter-btn.active {
          background:rgba(99,102,241,0.14); border-color:rgba(99,102,241,0.32); color:#818cf8;
        }
        .pmfeed-filter-btn:not(.active){
          background:rgba(255,255,255,0.04); color:rgba(148,163,184,0.4);
        }
        .pmfeed-filter-btn:not(.active):hover{color:#818cf8; background:rgba(99,102,241,0.08);}

        .pmfeed-trending {
          padding:7px 11px; border-radius:9px;
          background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.16);
          color:#818cf8; font-weight:700; font-size:11px; cursor:pointer;
          transition:all .15s; font-family:'DM Sans',sans-serif;
        }
        .pmfeed-trending:hover{background:rgba(99,102,241,0.18); transform:translateY(-1px);}

        @media(max-width:1079px){
          .pmfeed-sidebar{display:none;}
          .pmfeed-mobile-bar{display:block!important;}
        }
        .pmfeed-mobile-bar{display:none;}
      `}</style>

      <div className="pmfeed-root">
        {/* XP bursts */}
        <AnimatePresence>
          {xpItems.map(x => <XpBurst key={x.id} amount={x.amount} onDone={()=>removeXp(x.id)} />)}
        </AnimatePresence>

        {/* Upload modal */}
        <AnimatePresence>
          {showUpload && <UploadModal user={user} profile={profile} onClose={()=>setShowUpload(false)} onSuccess={triggerXp} />}
        </AnimatePresence>

        <div className="pmfeed-layout">

          {/* ════ FEED COLUMN ════ */}
          <div>
            {/* Feed header */}
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.3em", color:"rgba(99,102,241,0.45)", marginBottom:5, fontFamily:"'DM Mono',monospace" }}>Community Feed</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(1.4rem,5vw,2rem)", color:"#f1f5f9", lineHeight:1.05, marginBottom:5 }}>
                Polish Meme Lab 🧠
              </h1>
              <p style={{ fontSize:12, color:"rgba(148,163,184,0.4)", fontFamily:"'DM Sans',sans-serif" }}>
                Laugh your way to B1. Tap ✨ on any post to learn.
              </p>
            </div>

            {/* Mobile bar */}
            <div className="pmfeed-mobile-bar" style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <button className="pmfeed-upload-btn" onClick={()=>setShowUpload(true)} style={{ flex:1, minWidth:140 }}>Upload Meme ✦</button>
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
              {[["new","🕐 New"],["hot","🔥 Hot"],["my","👤 Mine"]].map(([v,l]) => (
                <button key={v} className={`pmfeed-filter-btn ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l}</button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(148,163,184,0.25)", fontFamily:"'DM Mono',monospace", alignSelf:"center" }}>
                {filteredPosts.length} posts
              </span>
            </div>

            {/* Masonry grid */}
            {filteredPosts.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(148,163,184,0.28)" }}>
                <div style={{ fontSize:"3rem", marginBottom:12 }}>🥟</div>
                <p style={{ fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                  {filter==="my" ? "You haven't posted yet." : "No memes yet — be first!"}
                </p>
              </div>
            ) : (
              <div className="pmfeed-masonry">
                <div className="pmfeed-col">
                  {col1.map((post,i) => (
                    <motion.div key={post.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.07,.3)}}>
                      <MemeCard post={post} user={user} profile={profile} onXp={triggerXp} isAdmin={isAdmin} />
                    </motion.div>
                  ))}
                </div>
                <div className="pmfeed-col">
                  {col2.map((post,i) => (
                    <motion.div key={post.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.07+.04,.35)}}>
                      <MemeCard post={post} user={user} profile={profile} onXp={triggerXp} isAdmin={isAdmin} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ SIDEBAR ════ */}
          <aside className="pmfeed-sidebar">

            {/* Upload */}
            <button className="pmfeed-upload-btn" onClick={()=>setShowUpload(true)}>Upload Meme ✦</button>

            {/* Profile */}
            <div className="pmfeed-scard" style={{ border:"1px solid rgba(99,102,241,0.18)" }}>
              <div style={{ height:2, background:"linear-gradient(90deg,#6366f1,#34d399,transparent)", borderRadius:9999, marginBottom:14 }} />
              <p className="pmfeed-label">Your Polish Brain</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:700, fontSize:"1.5rem", color:"#f1f5f9", marginBottom:4 }}>{levelLabel}</p>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:".95rem", fontWeight:700, color:"#818cf8" }}>{totalXp.toLocaleString()} XP</span>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <motion.span animate={{rotate:[-5,5,-5]}} transition={{duration:1.6,repeat:Infinity,ease:"easeInOut"}} style={{ fontSize:"1.1rem", filter:"drop-shadow(0 0 8px rgba(245,158,11,0.5))" }}>🔥</motion.span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:700, fontSize:"1rem", color:"#f59e0b" }}>{streak}d</span>
                </div>
              </div>
              <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:9999, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(100,(totalXp%500)/5)}%`, background:"linear-gradient(90deg,#6366f1,#34d399)", borderRadius:9999, transition:"width .7s ease" }} />
              </div>
            </div>

            {/* Trending vocab */}
            <div className="pmfeed-scard">
              <p className="pmfeed-label">Trending words</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {TRENDING.map(w => <span key={w} className="pmfeed-trending">🔥 {w}</span>)}
              </div>
            </div>

            {/* Community stats */}
            <div className="pmfeed-scard" style={{ textAlign:"center" }}>
              <p className="pmfeed-label" style={{ marginBottom:6 }}>Community</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:700, fontSize:"1.7rem", color:"#818cf8" }}>{posts.length}</p>
              <p style={{ fontSize:10, color:"rgba(148,163,184,0.3)", fontFamily:"'DM Mono',monospace" }}>memes published</p>
              <div style={{ marginTop:12, height:1, background:"rgba(255,255,255,0.05)" }} />
              <div style={{ marginTop:12, display:"flex", justifyContent:"center", gap:16 }}>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:700, fontSize:"1.2rem", color:"#f43f5e" }}>{posts.reduce((a,p)=>a+(p.likes?.length||0),0)}</p>
                  <p style={{ fontSize:9, color:"rgba(148,163,184,0.28)", fontFamily:"'DM Mono',monospace" }}>❤️ total</p>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:700, fontSize:"1.2rem", color:"#34d399" }}>{posts.reduce((a,p)=>a+(p.commentCount||0),0)}</p>
                  <p style={{ fontSize:9, color:"rgba(148,163,184,0.28)", fontFamily:"'DM Mono',monospace" }}>💬 total</p>
                </div>
              </div>
            </div>

            {/* Shadow Protocol link */}
            <Link to="/shadow-protocol" style={{ textDecoration:"none" }}>
              <div className="pmfeed-scard" style={{ border:"1px solid rgba(52,211,153,0.15)", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(52,211,153,0.32)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(52,211,153,0.15)"}
              >
                <p style={{ fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.22em", color:"rgba(52,211,153,0.5)", marginBottom:7, fontFamily:"'DM Mono',monospace" }}>Shadow Protocol</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"1.05rem", fontWeight:700, color:"#34d399" }}>Continue Training ⚡</p>
              </div>
            </Link>

            <Link to="/reading-practice" style={{ textDecoration:"none" }}>
              <div className="pmfeed-scard" style={{ cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(99,102,241,0.22)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}
              >
                <p style={{ fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.22em", color:"rgba(99,102,241,0.45)", marginBottom:7, fontFamily:"'DM Mono',monospace" }}>Reading Lab</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"1.05rem", fontWeight:700, color:"#818cf8" }}>Practice Reading 📖</p>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
