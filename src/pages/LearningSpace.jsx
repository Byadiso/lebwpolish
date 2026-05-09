import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection, query, onSnapshot, addDoc, serverTimestamp,
  orderBy, doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, limit
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import confetti from 'canvas-confetti';

const ADMIN_EMAIL = "byadiso@gmail.com";
const POLISH_CHARS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

const MISSIONS = [
  { id: 1, label: "Hipoteza",    prompt: "Co byś zrobił/a, gdybyś wygrał/a milion złotych?",          icon: "💰", xp: 50, color: "#FFD700" },
  { id: 2, label: "Wspomnienie", prompt: "Opisz swoje ulubione miejsce z dzieciństwa.",                icon: "🏠", xp: 40, color: "#FF6B9D" },
  { id: 3, label: "Opinia",      prompt: "Czy lepiej mieszkać w mieście czy na wsi? Dlaczego?",        icon: "🏙️", xp: 60, color: "#818cf8" },
  { id: 4, label: "Plany",       prompt: "Gdzie pojedziesz na następne wakacje? Użyj czasu przyszłego.", icon: "🏖️", xp: 70, color: "#34d399" }
];

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500];
const LEVEL_NAMES  = ["Nowicjusz","Uczeń","Praktykant","Adept","Mistrz","Ekspert","Legenda"];

const getLevel = (xp) => {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  return level;
};
const getXpProgress = (xp) => {
  const level = getLevel(xp);
  if (level >= LEVEL_NAMES.length - 1) return 100;
  const current = xp - LEVEL_THRESHOLDS[level];
  const needed  = LEVEL_THRESHOLDS[level + 1] - LEVEL_THRESHOLDS[level];
  return Math.min((current / needed) * 100, 100);
};

export default function LearningSpace() {
  const { profile, user, loading: authLoading } = useAuth();

  const [posts, setPosts]             = useState([]);
  const [resources, setResources]     = useState([]);
  const [text, setText]               = useState("");
  const [vocab, setVocab]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);

  const [showVault, setShowVault]         = useState(false);
  const [vaultSearch, setVaultSearch]     = useState("");
  const [editingId, setEditingId]         = useState(null);
  const [editText, setEditText]           = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentText, setCommentText]     = useState("");
  const [comments, setComments]           = useState({});

  // Game state
  const [xp, setXp]                     = useState(0);
  const [combo, setCombo]               = useState(0);
  const [showXpPop, setShowXpPop]       = useState(null);
  const [showCombo, setShowCombo]       = useState(false);
  const [lastPostTime, setLastPostTime] = useState(null);
  const [pulseEditor, setPulseEditor]   = useState(false);
  const [slotSpin, setSlotSpin]         = useState(false);
  const [newPostIds, setNewPostIds]     = useState(new Set());

  const mainTextareaRef = useRef(null);
  const vocabInputRef   = useRef(null);
  const editPostRef     = useRef(null);

  const isAdmin        = user?.email === ADMIN_EMAIL;
  const effectiveLevel = profile?.level || (isAdmin ? "C1" : "A1");
  const totalXp        = (profile?.xp || 0) + xp;
  const currentLevel   = getLevel(totalXp);
  const xpProgress     = getXpProgress(totalXp);

  const getWordCount = (str) => str.trim() ? str.trim().split(/\s+/).length : 0;
  const wordCount = getWordCount(text);

  const getMilestone = (count) => {
    if (count === 0)   return { label: "Gotowy do walki?", color: "#64748b", stars: 0 };
    if (count < 10)    return { label: "ROZGRZEWKA",       color: "#818cf8", stars: 1 };
    if (count < 25)    return { label: "PŁYNNA MYŚL",      color: "#34d399", stars: 2 };
    if (count < 40)    return { label: "MISTRZ SŁOWA",     color: "#f59e0b", stars: 3 };
    return              { label: "LEGENDARNY!",            color: "#ef4444", stars: 4 };
  };
  const milestone = getMilestone(wordCount);

  const insertChar = (char, ref, currentText, setter) => {
    const input = ref.current;
    if (!input) return;
    const start = input.selectionStart, end = input.selectionEnd;
    setter(currentText.substring(0, start) + char + currentText.substring(end));
    setTimeout(() => { input.focus(); input.setSelectionRange(start + 1, start + 1); }, 0);
  };

  useEffect(() => {
    const q = query(collection(db, "global_posts"), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const newPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(prev => {
        const prevIds = new Set(prev.map(p => p.id));
        const fresh   = newPosts.filter(p => !prevIds.has(p.id)).map(p => p.id);
        if (fresh.length > 0) {
          setNewPostIds(s => new Set([...s, ...fresh]));
          setTimeout(() => setNewPostIds(s => { const n = new Set(s); fresh.forEach(id => n.delete(id)); return n; }), 2000);
        }
        return newPosts;
      });
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "resources"), limit(50));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (!a.timestamp && !b.timestamp) ? 0 : !a.timestamp ? 1 : !b.timestamp ? -1 : b.timestamp.seconds - a.timestamp.seconds);
      setResources(data);
    });
  }, []);

  useEffect(() => {
    if (combo > 0) { const t = setTimeout(() => setCombo(0), 30000); return () => clearTimeout(t); }
  }, [combo]);

  const triggerXpPop = (amount) => { setShowXpPop(amount); setTimeout(() => setShowXpPop(null), 1500); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true); setSlotSpin(true);
    try {
      const vocabList = vocab.split(',').map(v => v.trim().toLowerCase()).filter(v => v !== "");
      const now = Date.now();
      const isHotStreak = lastPostTime && (now - lastPostTime) < 600000;
      const newCombo    = isHotStreak ? combo + 1 : 1;
      const baseXp      = activeMission.xp + Math.min(wordCount * 2, 100);
      const comboBonus  = Math.min(newCombo * 10, 100);
      const totalEarned = baseXp + comboBonus;

      await addDoc(collection(db, "global_posts"), {
        content: text, vocabulary: vocabList, wordCount,
        missionType: activeMission.label, author: profile?.cityName || (isAdmin ? "Instruktor" : "Student"),
        authorEmail: user.email, authorLevel: effectiveLevel, uid: user.uid,
        likes: [], timestamp: serverTimestamp(),
      });

      if (vocabList.length > 0) {
        await setDoc(doc(db, "users", user.uid), { vocabulary: arrayUnion(...vocabList), xp: (profile?.xp || 0) + totalEarned }, { merge: true });
      } else {
        await setDoc(doc(db, "users", user.uid), { xp: (profile?.xp || 0) + totalEarned }, { merge: true });
      }

      setXp(prev => prev + totalEarned);
      setCombo(newCombo);
      setLastPostTime(now);
      triggerXpPop(totalEarned);

      if (newCombo >= 2) { setShowCombo(true); setTimeout(() => setShowCombo(false), 2000); }

      const particleCount = Math.min(wordCount * 5, 200);
      confetti({ particleCount, spread: 90, origin: { y: 0.7 }, colors: [activeMission.color, '#818cf8', '#34d399'] });
      if (wordCount >= 40) {
        setTimeout(() => confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0 }, colors: ['#f59e0b'] }), 300);
        setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f59e0b'] }), 500);
      }

      setText(""); setVocab("");
      setPulseEditor(true); setTimeout(() => setPulseEditor(false), 1000);
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); setTimeout(() => setSlotSpin(false), 800); }
  };

  const handleRemoveVocab = async (word) => {
    try { await updateDoc(doc(db, "users", user.uid), { vocabulary: arrayRemove(word) }); } catch (err) { console.error(err); }
  };

  const handleEditPost = async (postId) => {
    if (!editText.trim()) return;
    await updateDoc(doc(db, "global_posts", postId), { content: editText, edited: true });
    setEditingId(null);
  };

  const toggleComments = (postId) => {
    if (activeCommentBox === postId) return setActiveCommentBox(null);
    setActiveCommentBox(postId); setCommentText("");
    const q = query(collection(db, "global_posts", postId, "comments"), orderBy('timestamp', 'asc'));
    onSnapshot(q, (snap) => setComments(prev => ({ ...prev, [postId]: snap.docs.map(d => ({ id: d.id, ...d.data() })) })));
  };

  const handlePostComment = async (postId, isCorrection = false) => {
    if (!commentText.trim()) return;
    await addDoc(collection(db, "global_posts", postId, "comments"), {
      content: commentText, author: profile?.cityName || (isAdmin ? "Admin" : "User"),
      uid: user.uid, isCorrection, timestamp: serverTimestamp(),
    });
    setCommentText(""); triggerXpPop(10); setXp(prev => prev + 10);
  };

  const handleLike = async (p) => {
    const isLiked = p.likes?.includes(user.uid);
    await updateDoc(doc(db, "global_posts", p.id), { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    if (!isLiked) { triggerXpPop(5); setXp(prev => prev + 5); }
  };

  const confirmDelete = async (id) => { await deleteDoc(doc(db, "global_posts", id)); setDeleteConfirmId(null); };

  if (authLoading) return (
    <div style={{ background: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
      <div style={{ fontSize: '52px', animation: 'spin 1s linear infinite' }}>✦</div>
      <p style={{ color: '#818cf8', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, letterSpacing: '0.3em', fontSize: '11px', textTransform: 'uppercase', animation: 'pulse 1s ease-in-out infinite' }}>
        Ładowanie areny...
      </p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── Root wrapper (no min-height override, no fixed positioning) ── */
        .ls-root {
          background: #020617;
          color: #f0f0ff;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 80px;
          overflow-x: hidden;
          position: relative;
        }
        .ls-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 800px 400px at 20% 20%, rgba(99,102,241,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 600px 300px at 80% 80%, rgba(52,211,153,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── XP Pop ── */
        .ls-xp-pop {
          position: fixed;
          top: 80px; right: 24px;
          background: linear-gradient(135deg, #6366f1, #34d399);
          color: white;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.01em;
          padding: 12px 24px;
          border-radius: 18px;
          z-index: 9999;
          animation: lsXpPop 1.5s ease-out forwards;
          box-shadow: 0 0 40px rgba(99,102,241,0.5);
          pointer-events: none;
        }
        @keyframes lsXpPop {
          0%   { transform: translateY(20px) scale(0.85); opacity: 0; }
          20%  { transform: translateY(-8px) scale(1.08); opacity: 1; }
          60%  { transform: translateY(-18px) scale(1); opacity: 1; }
          100% { transform: translateY(-55px) scale(0.92); opacity: 0; }
        }

        /* ── Combo banner ── */
        .ls-combo-banner {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          text-align: center;
          animation: lsComboBurst 2s ease-out forwards;
          pointer-events: none;
        }
        .ls-combo-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(52px, 10vw, 100px);
          background: linear-gradient(135deg, #f59e0b, #ef4444, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(245,158,11,0.7));
        }
        @keyframes lsComboBurst {
          0%   { transform: translate(-50%,-50%) scale(0.3) rotate(-5deg); opacity: 0; }
          30%  { transform: translate(-50%,-50%) scale(1.2) rotate(2deg);  opacity: 1; }
          65%  { transform: translate(-50%,-50%) scale(1) rotate(0deg);    opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.3);               opacity: 0; }
        }

        /* ── Layout ── */
        .ls-main {
          max-width: 1320px;
          margin: 0 auto;
          padding: 32px 20px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 1024px) {
          .ls-main { grid-template-columns: 1fr 360px; }
        }

        /* ── Card base ── */
        .ls-card {
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          transition: border-color 0.3s;
        }
        .ls-card-glow {
          box-shadow: 0 0 48px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        /* ── Mission tabs ── */
        .ls-mission-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .ls-mission-tabs::-webkit-scrollbar { display: none; }

        .ls-mission-tab {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          border: 1px solid transparent;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
        }
        .ls-mission-tab:hover {
          background: rgba(99,102,241,0.14);
          color: #c4b5fd;
          border-color: rgba(99,102,241,0.35);
        }
        .ls-mission-tab.active {
          color: white;
          border-color: currentColor;
          box-shadow: 0 0 14px currentColor;
        }

        /* ── Textarea ── */
        .ls-textarea {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 20px 24px;
          font-size: 17px;
          line-height: 1.75;
          color: #e8e8ff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          resize: none;
          min-height: 160px;
          outline: none;
          transition: all 0.2s;
          caret-color: #818cf8;
        }
        .ls-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .ls-textarea:focus {
          border-color: rgba(99,102,241,0.45);
          background: rgba(10,8,25,0.7);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 0 28px rgba(99,102,241,0.07);
        }
        .ls-textarea.pulse-success { animation: lsSuccessPulse 0.8s ease-out; }
        @keyframes lsSuccessPulse {
          0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.55); }
          50%  { box-shadow: 0 0 0 18px rgba(52,211,153,0); }
          100% { box-shadow: none; }
        }

        /* ── Vocab input ── */
        .ls-vocab-input {
          flex: 1;
          background: rgba(10,8,25,0.5);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #d0c8ff;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .ls-vocab-input::placeholder { color: rgba(255,255,255,0.18); }
        .ls-vocab-input:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(10,8,25,0.8);
          box-shadow: 0 0 0 2px rgba(52,211,153,0.08);
        }

        /* ── Polish char buttons ── */
        .ls-char-btn {
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          color: #c4b5fd;
          font-family: 'DM Sans', sans-serif;
        }
        .ls-char-btn:hover {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 10px rgba(99,102,241,0.25);
          transform: scale(1.1);
        }
        .ls-char-btn:active { transform: scale(0.88); }

        /* ── Submit button ── */
        .ls-submit-btn {
          padding: 15px 28px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          cursor: pointer;
          border: none;
          color: white;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .ls-submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.4s;
        }
        .ls-submit-btn:hover::before { left: 100%; }
        .ls-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(99,102,241,0.45); }
        .ls-submit-btn:active { transform: scale(0.97); }
        .ls-submit-btn:disabled { opacity: 0.22; cursor: not-allowed; transform: none; }

        /* ── Word meter ── */
        .ls-word-meter {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        /* ── Combo bar ── */
        .ls-combo-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.22);
          border-radius: 16px;
          margin-top: 14px;
        }

        /* ── Post cards ── */
        .ls-post-card {
          padding: 28px;
          transition: all 0.3s;
          cursor: default;
        }
        @media (min-width: 768px) { .ls-post-card { padding: 32px; } }
        .ls-post-card:hover {
          border-color: rgba(99,102,241,0.22);
          background: rgba(99,102,241,0.04);
        }
        .ls-post-card.new-post {
          animation: lsSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
          border-color: rgba(99,102,241,0.35);
          box-shadow: 0 0 32px rgba(99,102,241,0.12);
        }
        @keyframes lsSlideIn {
          from { transform: translateX(-12px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }

        .ls-post-avatar {
          width: 46px; height: 46px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 20px; color: white;
          font-family: 'Playfair Display', serif;
          flex-shrink: 0;
        }
        .ls-post-content {
          font-size: 16px;
          line-height: 1.75;
          color: rgba(240,240,255,0.88);
          font-style: italic;
          font-family: 'Playfair Display', serif;
          padding: 18px 20px;
          border-left: 3px solid rgba(99,102,241,0.35);
          background: rgba(255,255,255,0.02);
          border-radius: 0 14px 14px 0;
          margin: 16px 0;
        }
        .ls-vocab-tag {
          font-size: 9px;
          font-weight: 700;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.4);
          padding: 4px 10px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'DM Sans', sans-serif;
        }
        .ls-action-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.28);
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          padding: 7px 12px;
          border-radius: 10px;
        }
        .ls-action-btn:hover { color: #c4b5fd; background: rgba(99,102,241,0.1); }
        .ls-action-btn.liked { color: #ef4444; }
        .ls-action-btn.liked:hover { background: rgba(239,68,68,0.1); }
        .ls-action-btn .icon { font-size: 17px; transition: transform 0.2s; }
        .ls-action-btn:hover .icon { transform: scale(1.25) rotate(-5deg); }
        @keyframes lsHeartBeat {
          0% { transform: scale(1); } 50% { transform: scale(1.5); } 100% { transform: scale(1.2); }
        }
        .ls-action-btn.liked:active .icon { animation: lsHeartBeat 0.3s ease-out; }

        /* ── Comment zone ── */
        .ls-comment-zone {
          margin-top: 18px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          padding: 20px;
        }
        .ls-comment-item {
          display: flex; gap: 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .ls-comment-input {
          width: 100%;
          background: rgba(10,8,25,0.5);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 14px;
          color: #d0c8ff;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          resize: none;
          transition: all 0.2s;
          margin-top: 12px;
        }
        .ls-comment-input:focus {
          border-color: rgba(99,102,241,0.4);
          background: rgba(10,8,25,0.85);
          box-shadow: 0 0 0 2px rgba(99,102,241,0.09);
        }
        .ls-comment-input::placeholder { color: rgba(255,255,255,0.18); }

        /* ── Edit zone ── */
        .ls-edit-textarea {
          width: 100%;
          background: rgba(10,8,25,0.6);
          border: 1.5px solid rgba(99,102,241,0.3);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 15px;
          color: #e0d8ff;
          font-family: 'DM Sans', sans-serif;
          resize: none;
          outline: none;
          font-weight: 500;
          line-height: 1.65;
          transition: all 0.2s;
        }
        .ls-edit-textarea:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 2px rgba(99,102,241,0.12);
        }

        /* ── Sidebar cards ── */
        .ls-shadow-card {
          background: #090e1a;
          border: 1px solid rgba(52,211,153,0.18);
          border-radius: 24px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          display: block;
          text-decoration: none;
        }
        .ls-shadow-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(52,211,153,0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ls-shadow-card:hover {
          transform: scale(1.02);
          border-color: rgba(52,211,153,0.38);
          box-shadow: 0 20px 60px rgba(52,211,153,0.09);
        }
        .ls-shadow-card:hover::before { opacity: 1; }
        .ls-shadow-card:active { transform: scale(0.98); }

        .ls-live-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #34d399;
          position: relative;
        }
        .ls-live-dot::before {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 50%;
          background: rgba(52,211,153,0.4);
          animation: lsPing 1.5s ease-in-out infinite;
        }
        @keyframes lsPing {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .ls-vocab-card {
          background: linear-gradient(135deg, #0d0d2a, #0a1220);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 24px;
          padding: 26px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          text-align: left;
          color: white;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }
        .ls-vocab-card::after {
          content: '';
          position: absolute;
          bottom: -30px; right: -30px;
          width: 120px; height: 120px;
          background: #6366f1;
          border-radius: 50%;
          opacity: 0.08;
          transition: all 0.5s;
        }
        .ls-vocab-card:hover { transform: scale(1.02); box-shadow: 0 20px 60px rgba(99,102,241,0.18); }
        .ls-vocab-card:hover::after { transform: scale(2); opacity: 0.14; }
        .ls-vocab-card:active { transform: scale(0.98); }

        /* ── Vault modal ── */
        .ls-vault-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .ls-vault-modal {
          background: #0d1526;
          border: 1px solid rgba(99,102,241,0.28);
          border-radius: 28px;
          width: 100%; max-width: 600px; max-height: 85vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 40px 100px rgba(99,102,241,0.18);
          animation: lsVaultOpen 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes lsVaultOpen {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        .ls-vault-search {
          width: 100%;
          background: rgba(10,8,25,0.6);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 500;
          color: #d0c8ff;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
          margin-bottom: 16px;
        }
        .ls-vault-search:focus {
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 0 0 2px rgba(99,102,241,0.09);
        }
        .ls-vault-search::placeholder { color: rgba(255,255,255,0.18); }
        .ls-vault-word {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 11px 16px;
          transition: all 0.2s;
        }
        .ls-vault-word:hover { border-color: rgba(99,102,241,0.32); background: rgba(99,102,241,0.09); }

        /* ── Library / tip / link cards ── */
        .ls-library-card {
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 24px;
        }
        .ls-library-item {
          display: block;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid transparent;
          text-decoration: none;
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .ls-library-item:last-child { margin-bottom: 0; }
        .ls-library-item:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.22); }

        .ls-tip-card {
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.18);
          border-radius: 22px;
          padding: 20px 24px;
        }
        .ls-link-card {
          background: rgba(99,102,241,0.04);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 18px;
          padding: 16px 20px;
          text-decoration: none;
          display: block;
          transition: all 0.2s;
        }
        .ls-link-card:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.35);
          transform: translateX(3px);
        }

        /* ── Misc buttons ── */
        .ls-btn-danger  { background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 9px; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ls-btn-danger:hover { background: #dc2626; }
        .ls-btn-cancel  { background: rgba(255,255,255,0.06); color: rgba(200,195,255,0.7); border: none; padding: 6px 14px; border-radius: 9px; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ls-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #e8e4ff; }
        .ls-btn-icon    { background: none; border: none; cursor: pointer; padding: 7px; border-radius: 9px; transition: all 0.2s; font-size: 16px; }
        .ls-btn-icon:hover { background: rgba(99,102,241,0.18); transform: scale(1.15); }
        .ls-btn-save    { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; padding: 10px 22px; border-radius: 12px; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
        .ls-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
        .ls-btn-cancel-text { background: none; border: none; padding: 10px 14px; color: rgba(180,170,255,0.45); font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Sans', sans-serif; border-radius: 10px; transition: all 0.2s; }
        .ls-btn-cancel-text:hover { color: #c4b5fd; background: rgba(99,102,241,0.1); }
        .ls-btn-correction { background: none; border: none; padding: 8px 12px; font-size: 10px; font-weight: 700; color: rgba(239,68,68,0.7); cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ls-btn-correction:hover { color: #ef4444; }
        .ls-btn-send { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; padding: 10px 22px; border-radius: 12px; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ls-btn-send:hover { transform: translateY(-1px); opacity: 0.9; }
        .ls-btn-close { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); border: none; cursor: pointer; color: rgba(255,255,255,0.45); font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .ls-btn-close:hover { background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.35); }

        .ls-edited-badge {
          font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.28);
          text-transform: uppercase; letter-spacing: 0.1em;
          background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 6px;
          margin-left: 6px;
        }
        .ls-section-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 9px; font-weight: 700;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 0.22em;
          margin-bottom: 20px;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {/* ── XP Pop ── */}
      {showXpPop && <div className="ls-xp-pop">+{showXpPop} XP ✦</div>}

      {/* ── Combo banner ── */}
      {showCombo && (
        <div className="ls-combo-banner">
          <div className="ls-combo-text">x{combo} Combo!</div>
        </div>
      )}

      {/* ── Vault modal ── */}
      {showVault && (
        <div className="ls-vault-overlay" onClick={() => setShowVault(false)}>
          <div className="ls-vault-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '26px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
                  Słownik <span style={{ color: '#818cf8' }}>Vault</span>
                </p>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                  Twoje zasoby językowe
                </p>
              </div>
              <button className="ls-btn-close" onClick={() => setShowVault(false)}>✕</button>
            </div>
            <div style={{ padding: '20px 28px', flex: 1, overflowY: 'auto' }}>
              <input type="text" className="ls-vault-search" placeholder="Szukaj słowa..." value={vaultSearch} onChange={e => setVaultSearch(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {profile?.vocabulary?.filter(w => w.toLowerCase().includes(vaultSearch.toLowerCase())).map((word, i) => (
                  <div key={i} className="ls-vault-word">
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c4b5fd' }}>{word}</span>
                    <button onClick={() => handleRemoveVocab(word)} style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(239,68,68,0.5)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'color 0.2s', fontFamily: "'DM Sans', sans-serif" }}
                      onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = 'rgba(239,68,68,0.5)'}>
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <main className="ls-main">

        {/* ════ LEFT COLUMN ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

          {/* ── XP / Level bar ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
            padding: '16px 24px',
            background: '#0d1526',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}>✦</div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginBottom: '3px', fontFamily: "'DM Sans', sans-serif" }}>Poziom</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '18px', color: '#c4b5fd', fontWeight: 700, letterSpacing: '-0.01em' }}>{LEVEL_NAMES[currentLevel]}</p>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: "'DM Sans', sans-serif" }}>XP</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', fontFamily: "'DM Sans', sans-serif" }}>{totalXp}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpProgress}%`, background: 'linear-gradient(90deg, #6366f1, #34d399)', borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '22px', color: combo >= 5 ? '#ef4444' : combo >= 3 ? '#f59e0b' : 'white', fontWeight: 700 }}>{combo}</span>
              <span style={{ fontSize: '16px' }}>🔥</span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: "'DM Sans', sans-serif" }}>Combo</span>
            </div>
          </div>

          {/* ── Editor card ── */}
          <div className="ls-card ls-card-glow" style={{ overflow: 'visible' }}>
            {/* Glow orb */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, background: `radial-gradient(circle, ${activeMission.color}18, transparent)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'all 0.5s' }} />

            <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>

              {/* Mission tabs */}
              <div className="ls-mission-tabs" style={{ marginBottom: '20px' }}>
                {MISSIONS.map(m => (
                  <button key={m.id} onClick={() => setActiveMission(m)}
                    className={`ls-mission-tab ${activeMission.id === m.id ? 'active' : ''}`}
                    style={activeMission.id === m.id ? { color: m.color, borderColor: m.color + '99', boxShadow: `0 0 14px ${m.color}44` } : {}}
                  >
                    {m.icon} {m.label}
                    <span style={{ fontSize: '9px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, opacity: 0.65, marginLeft: '4px' }}>+{m.xp}xp</span>
                  </button>
                ))}
              </div>

              {/* Prompt */}
              <div style={{
                fontSize: 'clamp(15px, 2.8vw, 20px)', fontWeight: 700, lineHeight: 1.45, color: 'white',
                marginBottom: '22px', padding: '18px 22px',
                borderRadius: '18px', borderLeft: `3px solid ${activeMission.color}`,
                background: 'rgba(255,255,255,0.025)',
                fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                color: `${activeMission.color}dd`,
              }}>
                "{activeMission.prompt}"
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Polish chars — main textarea */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {POLISH_CHARS.map(char => (
                    <button key={char} type="button" className="ls-char-btn"
                      style={{ width: '34px', height: '34px' }}
                      onClick={() => insertChar(char, mainTextareaRef, text, setText)}>
                      {char}
                    </button>
                  ))}
                </div>

                <textarea ref={mainTextareaRef} required value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Napisz coś ambitnego..."
                  className={`ls-textarea ${pulseEditor ? 'pulse-success' : ''}`}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Polish chars — vocab input */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {POLISH_CHARS.map(char => (
                      <button key={char} type="button" className="ls-char-btn"
                        style={{ width: '28px', height: '28px', fontSize: '11px' }}
                        onClick={() => insertChar(char, vocabInputRef, vocab, setVocab)}>
                        {char}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <input ref={vocabInputRef} value={vocab} onChange={e => setVocab(e.target.value)}
                      placeholder="Słówka (oddzielone przecinkiem)..."
                      className="ls-vocab-input" />
                    <button disabled={!text.trim() || isSubmitting}
                      className={`ls-submit-btn ${slotSpin ? 'spinning' : ''}`}
                      style={slotSpin ? { opacity: 0.7 } : {}}>
                      {isSubmitting ? "✦" : "OPUBLIKUJ ✦"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Word meter */}
              <div className="ls-word-meter">
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: milestone.color, fontFamily: "'DM Sans', sans-serif" }}>{milestone.label}</div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '5px' }}>
                    {[1,2,3,4].map(i => <span key={i} style={{ fontSize: '11px', opacity: i <= milestone.stars ? 1 : 0.14 }}>⭐</span>)}
                  </div>
                </div>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', maxWidth: '200px' }}>
                  <div style={{ height: '100%', borderRadius: '99px', width: `${Math.min((wordCount / 40) * 100, 100)}%`, background: `linear-gradient(90deg, ${milestone.color}88, ${milestone.color})`, transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{wordCount} słów</span>
              </div>

              {/* Combo bar */}
              {combo >= 2 && (
                <div className="ls-combo-bar">
                  <span style={{ fontSize: '20px' }}>{combo >= 4 ? '🔥🔥🔥' : combo >= 3 ? '🔥🔥' : '🔥'}</span>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '15px', color: '#f59e0b', fontWeight: 700 }}>Combo Aktywny</div>
                    <div style={{ fontSize: '9px', color: 'rgba(245,158,11,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px', fontFamily: "'DM Sans', sans-serif" }}>Pisz częściej, zarabiaj więcej XP!</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#f59e0b', fontWeight: 700, textShadow: '0 0 18px rgba(245,158,11,0.7)' }}>x{combo}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Feed ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map(p => (
              <article key={p.id} className={`ls-card ls-post-card ${newPostIds.has(p.id) ? 'new-post' : ''}`}>
                {/* Post header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="ls-post-avatar" style={{
                      background: p.authorEmail === ADMIN_EMAIL
                        ? 'linear-gradient(135deg, #6366f1, #34d399)'
                        : 'linear-gradient(135deg, #1a1a2e, #2a2a3e)',
                      border: `1px solid ${p.authorEmail === ADMIN_EMAIL ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                      {p.author.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'DM Sans', sans-serif" }}>{p.author}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 9px', borderRadius: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontFamily: "'DM Sans', sans-serif" }}>{p.authorLevel}</span>
                        {p.edited && <span className="ls-edited-badge">edytowano</span>}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '3px', fontFamily: "'DM Sans', sans-serif" }}>
                        {p.missionType || 'Wolna Myśl'} · {p.wordCount || 0} słów
                      </div>
                    </div>
                  </div>

                  {(p.uid === user.uid || isAdmin) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {deleteConfirmId === p.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => confirmDelete(p.id)} className="ls-btn-danger">Tak</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="ls-btn-cancel">Nie</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {p.uid === user.uid && (
                            <button onClick={() => { setEditingId(p.id); setEditText(p.content); }} className="ls-btn-icon" title="Edytuj">✍️</button>
                          )}
                          <button onClick={() => setDeleteConfirmId(p.id)} className="ls-btn-icon" title="Usuń">🗑️</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingId === p.id ? (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '20px', margin: '16px 0' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {POLISH_CHARS.map(char => (
                        <button key={char} type="button" className="ls-char-btn" style={{ width: '28px', height: '28px', fontSize: '11px' }}
                          onClick={() => insertChar(char, editPostRef, editText, setEditText)}>{char}</button>
                      ))}
                    </div>
                    <textarea ref={editPostRef} value={editText} onChange={e => setEditText(e.target.value)} className="ls-edit-textarea" rows={4} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={() => handleEditPost(p.id)} className="ls-btn-save">Zapisz</button>
                      <button onClick={() => setEditingId(null)} className="ls-btn-cancel-text">Anuluj</button>
                    </div>
                  </div>
                ) : (
                  <p className="ls-post-content">"{p.content}"</p>
                )}

                {p.vocabulary?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {p.vocabulary.map((v, i) => <span key={i} className="ls-vocab-tag">{v}</span>)}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => handleLike(p)} className={`ls-action-btn ${p.likes?.includes(user.uid) ? 'liked' : ''}`}>
                    <span className="icon">{p.likes?.includes(user.uid) ? '❤️' : '🤍'}</span>
                    <span>{p.likes?.length || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(p.id)} className="ls-action-btn">
                    <span className="icon">💬</span>
                    <span>Komentarze</span>
                  </button>
                </div>

                {/* Comments */}
                {activeCommentBox === p.id && (
                  <div className="ls-comment-zone">
                    {comments[p.id]?.map(c => (
                      <div key={c.id} className="ls-comment-item">
                        <div style={{ width: '3px', borderRadius: '99px', background: c.isCorrection ? '#ef4444' : '#6366f1', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c4b5fd', fontFamily: "'DM Sans', sans-serif" }}>
                            {c.author} {c.isCorrection && <span style={{ color: '#ef4444', fontSize: '9px' }}>✍️ POPRAWKA</span>}
                          </div>
                          <div style={{ fontSize: '14px', color: 'rgba(240,240,255,0.7)', marginTop: '4px', lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{c.content}</div>
                        </div>
                      </div>
                    ))}
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {POLISH_CHARS.map(char => (
                          <button key={char} type="button" className="ls-char-btn" style={{ width: '28px', height: '28px', fontSize: '11px' }}
                            onClick={() => { const ref = { current: document.getElementById(`comment-${p.id}`) }; insertChar(char, ref, commentText, setCommentText); }}>{char}</button>
                        ))}
                      </div>
                      <textarea id={`comment-${p.id}`} value={commentText} onChange={e => setCommentText(e.target.value)}
                        placeholder="Napisz feedback..." className="ls-comment-input" rows={3} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                        <button onClick={() => handlePostComment(p.id, true)} className="ls-btn-correction">✍️ Poprawka</button>
                        <button onClick={() => handlePostComment(p.id, false)} className="ls-btn-send">Wyślij</button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Shadow Protocol */}
            <Link to="/shadow-protocol" className="ls-shadow-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="ls-live-dot" />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.25em', fontFamily: "'DM Sans', sans-serif" }}>System: Active</span>
                </div>
                <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(52,211,153,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(52,211,153,0.2)', padding: '3px 8px', borderRadius: '6px', fontFamily: "'DM Sans', sans-serif" }}>B1 Protocol</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '24px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
                    Shadow<span style={{ color: '#34d399' }}> Protocol</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', marginTop: '5px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    Inicjuj symulację<br /><span style={{ color: 'rgba(52,211,153,0.5)' }}>Autoryzacja wymagana...</span>
                  </div>
                </div>
                <div style={{ width: '46px', height: '46px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, transition: 'all 0.3s' }}>⚡</div>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '18px' }}>
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '3px', flex: 1, borderRadius: '99px', background: i < 4 ? '#34d399' : 'rgba(255,255,255,0.06)' }} />)}
              </div>
            </Link>

            {/* Vocab card */}
            <button onClick={() => setShowVault(true)} className="ls-vocab-card">
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(99,102,241,0.55)', marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>Mój Słownik</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '52px', fontWeight: 700, lineHeight: 1, background: 'linear-gradient(135deg, #6366f1, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {profile?.vocabulary?.length || 0}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '5px', fontFamily: "'DM Sans', sans-serif" }}>Poznane słowa</div>
                </div>
                <span style={{ fontSize: '40px' }}>📚</span>
              </div>
            </button>

            {/* Library */}
            <div className="ls-library-card">
              <div className="ls-section-label">
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                Biblioteka B1
              </div>
              {resources.map(res => (
                <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="ls-library-item">
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(220,215,255,0.82)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'DM Sans', sans-serif" }}>{res.title}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '3px', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>{res.type}</div>
                </a>
              ))}
            </div>

            {/* Tip */}
            <div className="ls-tip-card">
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>Wskazówka Dnia</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '13px', fontWeight: 400, color: 'rgba(245,158,11,0.78)', lineHeight: 1.65 }}>
                "Używaj spójników takich jak 'ponieważ', 'chociaż' oraz 'dlatego', aby Twoje zdania brzmiały bardziej naturalnie."
              </div>
            </div>

            {/* Link cards */}
            {[
              { to: "/vocabularyvault",       label: "Vocabulary Vault",        text: "Otwórz pełny skarbiec słówek 🔑" },
              { to: "/polish-simplified",     label: "Learn Polish Vocabulary", text: "Polish Simplified 🎮" },
              { to: "/polish-music",          label: "Music & Polish",          text: "Listen to Polish vibe 🎵" },
              { to: "/reading-practice",      label: "Reading Practice",        text: "Practice Reading 📖" },
              { to: "/conjugation-practice",  label: "Conjugations",            text: "Practice Conjugations 🧠" },
              { to: "/play",                  label: "Learn Polish via Play",   text: "Practice grammar & vocabulary with games" },
              { to: "/PolishMeme",                  label: "Learn Polish via Polish Meme",   text: "Practice grammar & vocabulary with Meme" },
              { to: "/PolishRolePlay",        label: "Speak Polish via Role Play",   text: "Practice Speaking polish spontaneously" },
            ].map(({ to, label, text }) => (
              <Link key={to} to={to} className="ls-link-card">
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(99,102,241,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '5px', fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif' " }}>{text}</div>
              </Link>
            ))}

          </div>
        </aside>
      </main>
    </>
  );
}
