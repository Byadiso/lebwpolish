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
  { id: 1, label: "Hipoteza", prompt: "Co byś zrobił/a, gdybyś wygrał/a milion złotych?", icon: "💰", xp: 50, color: "#FFD700" },
  { id: 2, label: "Wspomnienie", prompt: "Opisz swoje ulubione miejsce z dzieciństwa.", icon: "🏠", xp: 40, color: "#FF6B9D" },
  { id: 3, label: "Opinia", prompt: "Czy lepiej mieszkać w mieście czy na wsi? Dlaczego?", icon: "🏙️", xp: 60, color: "#00E5FF" },
  { id: 4, label: "Plany", prompt: "Gdzie pojedziesz na następne wakacje? Użyj czasu przyszłego.", icon: "🏖️", xp: 70, color: "#7C3AED" }
];

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500];
const LEVEL_NAMES = ["Nowicjusz", "Uczeń", "Praktykant", "Adept", "Mistrz", "Ekspert", "Legenda"];
const LEVEL_COLORS = ["#6B7280", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

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
  const needed = LEVEL_THRESHOLDS[level + 1] - LEVEL_THRESHOLDS[level];
  return Math.min((current / needed) * 100, 100);
};

const COMBO_MESSAGES = ["NIEŹLE! +5 COMBO", "ŚWIETNIE! +10 COMBO", "OGIEŃ! +20 COMBO", "LEGENDARNY! +50 COMBO"];

export default function LearningSpace() {
  const { profile, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [text, setText] = useState("");
  const [vocab, setVocab] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  
  const [showVault, setShowVault] = useState(false);
  const [vaultSearch, setVaultSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 
  const [activeCommentBox, setActiveCommentBox] = useState(null); 
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});

  // Game state
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showXpPop, setShowXpPop] = useState(null);
  const [showCombo, setShowCombo] = useState(false);
  const [lastPostTime, setLastPostTime] = useState(null);
  const [pulseEditor, setPulseEditor] = useState(false);
  const [slotSpin, setSlotSpin] = useState(false);
  const [newPostIds, setNewPostIds] = useState(new Set());

  const mainTextareaRef = useRef(null);
  const vocabInputRef = useRef(null);
  const editPostRef = useRef(null);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const effectiveLevel = profile?.level || (isAdmin ? "C1" : "A1");

  const totalXp = (profile?.xp || 0) + xp;
  const currentLevel = getLevel(totalXp);
  const xpProgress = getXpProgress(totalXp);

  const getWordCount = (str) => str.trim() ? str.trim().split(/\s+/).length : 0;
  const wordCount = getWordCount(text);

  const getMilestone = (count) => {
    if (count === 0) return { label: "Gotowy do walki?", color: "#6B7280", stars: 0 };
    if (count < 10) return { label: "ROZGRZEWKA", color: "#3B82F6", stars: 1 };
    if (count < 25) return { label: "PŁYNNA MYŚL", color: "#10B981", stars: 2 };
    if (count < 40) return { label: "MISTRZ SŁOWA", color: "#F59E0B", stars: 3 };
    return { label: "LEGENDARNY!", color: "#EC4899", stars: 4 };
  };

  const milestone = getMilestone(wordCount);

  const insertChar = (char, ref, currentText, setter) => {
    const input = ref.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText = currentText.substring(0, start) + char + currentText.substring(end);
    setter(newText);
    setTimeout(() => { input.focus(); input.setSelectionRange(start + 1, start + 1); }, 0);
  };

  useEffect(() => {
    const q = query(collection(db, "global_posts"), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const newPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(prev => {
        const prevIds = new Set(prev.map(p => p.id));
        const fresh = newPosts.filter(p => !prevIds.has(p.id)).map(p => p.id);
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

  // Combo timer
  useEffect(() => {
    if (combo > 0) {
      const timer = setTimeout(() => setCombo(0), 30000);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  const triggerXpPop = (amount) => {
    setShowXpPop(amount);
    setTimeout(() => setShowXpPop(null), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSlotSpin(true);

    try {
      const vocabList = vocab.split(',').map(v => v.trim().toLowerCase()).filter(v => v !== "");
      const now = Date.now();
      const isHotStreak = lastPostTime && (now - lastPostTime) < 600000; // 10min
      const newCombo = isHotStreak ? combo + 1 : 1;
      const baseXp = activeMission.xp + Math.min(wordCount * 2, 100);
      const comboBonus = Math.min(newCombo * 10, 100);
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

      if (newCombo >= 2) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 2000);
      }

      const particleCount = Math.min(wordCount * 5, 200);
      confetti({ particleCount, spread: 90, origin: { y: 0.7 }, colors: [activeMission.color, '#FFD700', '#FF6B9D'] });
      if (wordCount >= 40) {
        setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700'] }), 300);
        setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700'] }), 500);
      }

      setText(""); setVocab("");
      setPulseEditor(true);
      setTimeout(() => setPulseEditor(false), 1000);
    } catch (err) { console.error(err); } finally {
      setIsSubmitting(false);
      setTimeout(() => setSlotSpin(false), 800);
    }
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
    setActiveCommentBox(postId);
    setCommentText("");
    const q = query(collection(db, "global_posts", postId, "comments"), orderBy('timestamp', 'asc'));
    onSnapshot(q, (snap) => setComments(prev => ({ ...prev, [postId]: snap.docs.map(d => ({ id: d.id, ...d.data() })) })));
  };

  const handlePostComment = async (postId, isCorrection = false) => {
    if (!commentText.trim()) return;
    await addDoc(collection(db, "global_posts", postId, "comments"), {
      content: commentText, author: profile?.cityName || (isAdmin ? "Admin" : "User"),
      uid: user.uid, isCorrection, timestamp: serverTimestamp(),
    });
    setCommentText("");
    triggerXpPop(10);
    setXp(prev => prev + 10);
  };

  const handleLike = async (p) => {
    const isLiked = p.likes?.includes(user.uid);
    await updateDoc(doc(db, "global_posts", p.id), { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    if (!isLiked) { triggerXpPop(5); setXp(prev => prev + 5); }
  };

  const confirmDelete = async (id) => {
    await deleteDoc(doc(db, "global_posts", id));
    setDeleteConfirmId(null);
  };

  if (authLoading) return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px', animation: 'spin 1s linear infinite' }}>🎰</div>
      <p style={{ color: '#7C3AED', fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.3em', fontSize: '12px', textTransform: 'uppercase', animation: 'pulse 1s ease-in-out infinite' }}>Ładowanie areny...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </div>
  );

  const streakDays = profile?.streak || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        :root {
          --neon-purple: #7C3AED;
          --neon-pink: #EC4899;
          --neon-cyan: #00E5FF;
          --neon-gold: #FFD700;
          --neon-green: #10B981;
          --bg-void: #0A0A0F;
          --bg-card: #12121A;
          --bg-card2: #1A1A26;
          --border-glow: rgba(124, 58, 237, 0.3);
          --text-primary: #F0F0FF;
          --text-muted: #6B7280;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .ls-root { 
          min-height: 100vh; 
          background: var(--bg-void); 
          color: var(--text-primary);
          font-family: 'Space Grotesk', sans-serif;
          padding-bottom: 80px;
          position: relative;
          overflow-x: hidden;
        }

        .ls-root::before {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(ellipse 800px 400px at 20% 10%, rgba(124,58,237,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 600px 300px at 80% 80%, rgba(236,72,153,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* XP POP */
        .xp-pop {
          position: fixed;
          top: 80px; right: 24px;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          color: white;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.1em;
          padding: 12px 24px;
          border-radius: 16px;
          z-index: 9999;
          animation: xpPop 1.5s ease-out forwards;
          box-shadow: 0 0 40px rgba(124,58,237,0.6);
          pointer-events: none;
        }
        @keyframes xpPop {
          0% { transform: translateY(20px) scale(0.8); opacity: 0; }
          20% { transform: translateY(-10px) scale(1.1); opacity: 1; }
          60% { transform: translateY(-20px) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(0.9); opacity: 0; }
        }

        /* COMBO BANNER */
        .combo-banner {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          text-align: center;
          animation: comboBurst 2s ease-out forwards;
          pointer-events: none;
        }
        .combo-banner-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 10vw, 96px);
          background: linear-gradient(135deg, #FFD700, #FF6B9D, #7C3AED);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          filter: drop-shadow(0 0 30px rgba(255,215,0,0.8));
          letter-spacing: 0.05em;
        }
        @keyframes comboBurst {
          0% { transform: translate(-50%,-50%) scale(0.3) rotate(-5deg); opacity: 0; }
          30% { transform: translate(-50%,-50%) scale(1.2) rotate(2deg); opacity: 1; }
          60% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.3) rotate(0deg); opacity: 0; }
        }  
             


        /* MAIN LAYOUT */
        .ls-main {
          max-width: 1280px;
          margin: auto auto;
          padding: 32px 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 1024px) {
          .ls-main { grid-template-columns: 1fr 380px; }
        }

        /* CARD BASE */
        .ls-card {
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          overflow: hidden;
          position: relative;
        }
        .ls-card-glow {
          box-shadow: 0 0 40px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* MISSION SELECTOR */
        .mission-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mission-tabs::-webkit-scrollbar { display: none; }
        .mission-tab {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          border: 1px solid transparent;
          background: rgba(255,255,255,0.04);
          color: var(--text-muted);
        }
        .mission-tab:hover { background: rgba(124,58,237,0.18); color: #C4B5FD; border-color: rgba(124,58,237,0.4); }
        .mission-tab.active {
          color: white;
          border-color: currentColor;
          box-shadow: 0 0 16px currentColor;
        }
        .mission-xp-badge {
          display: inline-block;
          font-size: 9px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          opacity: 0.7;
          margin-left: 4px;
        }

        /* EDITOR CARD */
        .editor-card {
          padding: 28px;
        }
        @media (min-width: 768px) { .editor-card { padding: 36px; } }

        .mission-prompt {
          font-size: clamp(16px, 3vw, 22px);
          font-weight: 700;
          line-height: 1.4;
          color: white;
          margin: 20px 0 24px;
          padding: 20px 24px;
          border-radius: 16px;
          border-left: 3px solid;
          background: rgba(255,255,255,0.03);
          font-style: italic;
        }

        .polish-chars {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }
        .polish-char-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
        }
        .polish-char-btn:hover {
          background: var(--neon-purple);
          border-color: var(--neon-purple);
          box-shadow: 0 0 12px rgba(124,58,237,0.5);
          transform: scale(1.1);
        }
        .polish-char-btn.small {
          width: 26px; height: 26px;
          font-size: 11px;
          border-radius: 6px;
        }

        .main-textarea {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          font-size: 18px;
          line-height: 1.7;
          color: #E8E8FF;
          font-family: 'Space Grotesk', sans-serif;
          resize: none;
          min-height: 160px;
          outline: none;
          transition: all 0.2s;
          caret-color: var(--neon-purple);
          -webkit-text-fill-color: #E8E8FF;
        }
        .main-textarea::placeholder { color: rgba(255,255,255,0.2); -webkit-text-fill-color: rgba(255,255,255,0.2); }
        .main-textarea:focus {
          border-color: rgba(124,58,237,0.5);
          background: rgba(15,10,30,0.8);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1), 0 0 30px rgba(124,58,237,0.1);
          color: #E8E8FF;
          -webkit-text-fill-color: #E8E8FF;
        }
        .main-textarea.pulse-success {
          animation: successPulse 0.8s ease-out;
        }
        @keyframes successPulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          50% { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
          100% { box-shadow: none; }
        }

        .vocab-input {
          width: 100%;
          background: rgba(15,10,30,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 14px;
          color: #D0C8FF;
          -webkit-text-fill-color: #D0C8FF;
          font-family: 'Space Grotesk', sans-serif;
          outline: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .vocab-input::placeholder { color: rgba(255,255,255,0.2); -webkit-text-fill-color: rgba(255,255,255,0.2); }
        .vocab-input:focus {
          border-color: rgba(236,72,153,0.4);
          background: rgba(15,10,30,0.8);
          box-shadow: 0 0 0 2px rgba(236,72,153,0.1);
          color: #D0C8FF;
          -webkit-text-fill-color: #D0C8FF;
        }

        /* WORD COUNT / METER */
        .word-meter {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .word-meter-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-family: 'JetBrains Mono', monospace;
        }
        .word-meter-bar {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          overflow: hidden;
          max-width: 200px;
        }
        .word-meter-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        .word-count-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .star-rating {
          display: flex;
          gap: 2px;
        }

        /* SUBMIT BUTTON */
        .submit-btn {
          padding: 16px 32px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          border: none;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.4s;
        }
        .submit-btn:hover::before { left: 100%; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,0.5); }
        .submit-btn:active { transform: scale(0.97); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .submit-btn.spinning {
          animation: slotSpin 0.15s linear infinite;
        }
        @keyframes slotSpin {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* COMBO BAR */
        .combo-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255,215,0,0.06);
          border: 1px solid rgba(255,215,0,0.2);
          border-radius: 12px;
          margin-top: 12px;
        }
        .combo-flames { font-size: 20px; }
        .combo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          letter-spacing: 0.1em;
          color: var(--neon-gold);
        }
        .combo-desc {
          font-size: 10px;
          color: rgba(255,215,0,0.5);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .combo-multiplier {
          margin-left: auto;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          color: var(--neon-gold);
          text-shadow: 0 0 20px rgba(255,215,0,0.8);
        }

        /* FEED POSTS */
        .post-card {
          padding: 24px;
          transition: all 0.3s;
        }
        @media (min-width: 768px) { .post-card { padding: 28px 32px; } }
        .post-card:hover {
          border-color: rgba(124,58,237,0.2);         
          background: rgb(44, 40, 97);
        }
        .post-card.new-post {
          animation: newPostSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 0 30px rgba(124,58,237,0.15);
        }
        @keyframes newPostSlide {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .post-avatar {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900;
          font-size: 18px;
          color: white;
          font-family: 'Bebas Neue', sans-serif;
          flex-shrink: 0;
        }
        .post-author { font-size: 13px; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.05em; }
        .post-level {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .post-mission {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: 2px;
        }

        .post-content {
          font-size: 17px;
          line-height: 1.75;
          color: rgba(240,240,255,0.9);
          font-style: italic;
          padding: 16px 20px;
          border-left: 3px solid rgba(124,58,237,0.3);
          background: rgba(255,255,255,0.02);
          border-radius: 0 12px 12px 0;
          margin: 16px 0;
        }

        .vocab-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .vocab-tag {
          font-size: 9px;
          font-weight: 800;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          padding: 4px 10px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: 'JetBrains Mono', monospace;
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .action-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3);
          font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.1em;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          padding: 6px 10px;
          border-radius: 8px;
        }
        .action-btn:hover { color: #C4B5FD; background: rgba(124,58,237,0.12); }
        .action-btn.liked { color: #EF4444; }
        .action-btn.liked:hover { color: #EF4444; background: rgba(239,68,68,0.1); }
        .action-btn span.icon { font-size: 18px; transition: transform 0.2s; }
        .action-btn:hover span.icon { transform: scale(1.3) rotate(-5deg); }
        .action-btn.liked:active span.icon { animation: heartBeat 0.3s ease-out; }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1.2); }
        }

        /* COMMENT ZONE */
        .comment-zone {
          margin-top: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
        }
        .comment-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          margin-bottom: 8px;
        }
        .comment-stripe { width: 3px; border-radius: 99px; flex-shrink: 0; }
        .comment-author { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #C4B5FD; }
        .comment-text { font-size: 14px; color: rgba(240,240,255,0.7); margin-top: 4px; line-height: 1.5; }
        .comment-input {
          width: 100%;
          background: rgba(15,10,30,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #D0C8FF;
          -webkit-text-fill-color: #D0C8FF;
          font-family: 'Space Grotesk', sans-serif;
          outline: none;
          resize: none;
          transition: all 0.2s;
          margin-top: 12px;
        }
        .comment-input:focus {
          border-color: rgba(124,58,237,0.4);
          background: rgba(15,10,30,0.9);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
          color: #D0C8FF;
          -webkit-text-fill-color: #D0C8FF;
        }
        .comment-input::placeholder { color: rgba(255,255,255,0.2); -webkit-text-fill-color: rgba(255,255,255,0.2); }

        /* EDIT ZONE */
        .edit-zone {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          margin: 16px 0;
        }
        .edit-textarea {
          width: 100%;
          background: rgba(15,10,30,0.7);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 15px;
          color: #E0D8FF;
          -webkit-text-fill-color: #E0D8FF;
          font-family: 'Space Grotesk', sans-serif;
          resize: none;
          outline: none;
          font-weight: 500;
          line-height: 1.6;
          transition: all 0.2s;
        }
        .edit-textarea:focus {
          background: rgba(15,10,30,0.9);
          border-color: rgba(124,58,237,0.6);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.15);
          color: #E0D8FF;
          -webkit-text-fill-color: #E0D8FF;
        }

        /* SIDEBAR */
        .sidebar { display: flex; flex-direction: column; gap: 20px; }

        /* SHADOW PROTOCOL */
        .shadow-card {
          background: #0D0D14;
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 22px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          display: block;
          text-decoration: none;
        }
        .shadow-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(16,185,129,0.06), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .shadow-card:hover { transform: scale(1.02); border-color: rgba(16,185,129,0.4); box-shadow: 0 20px 60px rgba(16,185,129,0.1); }
        .shadow-card:hover::before { opacity: 1; }
        .shadow-card:active { transform: scale(0.98); }
        .shadow-live-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #10B981;
          position: relative;
        }
        .shadow-live-dot::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: rgba(16,185,129,0.4);
          animation: ping 1.5s ease-in-out infinite;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2); opacity: 0; }
        }
        .shadow-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.05em;
          color: white;
        }
        .shadow-title span { color: #10B981; }
        .shadow-arrow {
          width: 48px; height: 48px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
          color: #10B981;
          font-size: 20px;
          flex-shrink: 0;
        }
        .shadow-card:hover .shadow-arrow {
          background: #10B981;
          color: black;
        }
        .shadow-progress-bars { display: flex; gap: 4px; margin-top: 20px; }
        .shadow-bar { height: 3px; flex: 1; border-radius: 99px; }

        /* VOCAB CARD */
        .vocab-card {
          background: linear-gradient(135deg, #1a0533, #0f0f2a);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 22px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          text-align: left;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
        }
        .vocab-card::after {
          content: '';
          position: absolute;
          bottom: -30px; right: -30px;
          width: 120px; height: 120px;
          background: var(--neon-purple);
          border-radius: 50%;
          opacity: 0.1;
          transition: all 0.5s;
        }
        .vocab-card:hover { transform: scale(1.02); box-shadow: 0 20px 60px rgba(124,58,237,0.2); }
        .vocab-card:hover::after { transform: scale(2); opacity: 0.15; }
        .vocab-card:active { transform: scale(0.98); }
        .vocab-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 56px;
          line-height: 1;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* VAULT MODAL */
        .vault-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .vault-modal {
          background: #0F0F1A;
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 28px;
          width: 100%;
          max-width: 600px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(124,58,237,0.2);
          animation: vaultOpen 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        @keyframes vaultOpen {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .vault-header {
          padding: 28px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(124,58,237,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vault-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.05em;
        }
        .vault-title span { color: var(--neon-purple); }
        .vault-close {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          font-size: 18px;
          font-weight: 800;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .vault-close:hover { background: rgba(239,68,68,0.25); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.4); }
        .vault-search {
          width: 100%;
          background: rgba(15,10,30,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 15px;
          color: #D0C8FF;
          -webkit-text-fill-color: #D0C8FF;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .vault-search:focus { 
          border-color: rgba(124,58,237,0.4);
          background: rgba(15,10,30,0.9);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
          color: #D0C8FF;
          -webkit-text-fill-color: #D0C8FF;
        }
        .vault-search::placeholder { color: rgba(255,255,255,0.2); -webkit-text-fill-color: rgba(255,255,255,0.2); }
        .vault-word {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 12px 16px;
          transition: all 0.2s;
        }
        .vault-word:hover { border-color: rgba(124,58,237,0.35); background: rgba(124,58,237,0.1); }
        .vault-word-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #C4B5FD;
        }
        .vault-remove-btn {
          font-size: 10px;
          font-weight: 800;
          color: rgba(239,68,68,0.5);
          background: none;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: color 0.2s;
          opacity: 0;
          font-family: 'Space Grotesk', sans-serif;
        }
        .vault-word:hover .vault-remove-btn { opacity: 1; }
        .vault-remove-btn:hover { color: #EF4444; }

        /* LIBRARY */
        .library-card {
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          padding: 24px;
        }
        .library-item {
          display: block;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid transparent;
          text-decoration: none;
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .library-item:last-child { margin-bottom: 0; }
        .library-item:hover { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.25); }
        .library-title { font-size: 12px; font-weight: 800; color: rgba(220,215,255,0.85); text-transform: uppercase; letter-spacing: 0.05em; }
        .library-item:hover .library-title { color: #C4B5FD; }
        .library-type { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; margin-top: 3px; font-style: italic; }

        /* TIP */
        .tip-card {
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 18px;
          padding: 20px 24px;
        }
        .tip-label { font-size: 9px; font-weight: 800; color: #F59E0B; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
        .tip-text { font-size: 13px; font-weight: 600; color: rgba(245,158,11,0.8); font-style: italic; line-height: 1.6; }

        .link-card {
          background: rgba(245,158,11,0.04);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 16px;
          padding: 16px 20px;
          text-decoration: none;
          display: block;
          transition: all 0.2s;
        }
        .link-card:hover { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.45); transform: translateX(3px); }
        .link-card:hover .link-card-label { color: rgba(251,191,36,0.8); }
        .link-card:hover .link-card-text { color: #FCD34D; }
        .link-card-label { font-size: 9px; font-weight: 800; color: rgba(245,158,11,0.5); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 6px; transition: color 0.2s; }
        .link-card-text { font-size: 11px; font-weight: 800; color: #F59E0B; text-transform: uppercase; letter-spacing: 0.05em; transition: color 0.2s; }

        /* SECTION LABELS */
        .section-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 24px;
          font-family: 'JetBrains Mono', monospace;
        }
        .section-label-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* DELETE CONFIRM */
        .delete-confirm { display: flex; gap: 6px; align-items: center; }
        .btn-danger { background: #EF4444; color: white; border: none; padding: 6px 14px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .btn-danger:hover { background: #DC2626; }
        .btn-cancel { background: rgba(255,255,255,0.06); color: rgba(200,195,255,0.7); border: none; padding: 6px 14px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .btn-cancel:hover { background: rgba(255,255,255,0.12); color: #E8E4FF; }
        .btn-small-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; font-size: 16px; }
        .btn-small-icon:hover { background: rgba(124,58,237,0.2); transform: scale(1.15); }

        .btn-save { background: var(--neon-purple); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .btn-save:hover { background: #6D28D9; }
        .btn-cancel-text { background: none; border: none; padding: 10px 16px; color: rgba(180,170,255,0.5); font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; border-radius: 8px; }
        .btn-cancel-text:hover { color: #C4B5FD; background: rgba(124,58,237,0.12); }
        
        .btn-correction { background: none; border: none; padding: 8px 12px; font-size: 10px; font-weight: 800; color: #EF4444; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; opacity: 0.7; transition: opacity 0.2s; }
        .btn-correction:hover { opacity: 1; }
        .btn-send { background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 10px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .btn-send:hover { opacity: 0.9; transform: translateY(-1px); }

        .edited-badge {
          font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.3);
          text-transform: uppercase; letter-spacing: 0.1em;
          background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 6px;
          margin-left: 8px;
        }
      `}</style>

      {/* XP POP */}
      {showXpPop && <div className="xp-pop">+{showXpPop} XP ⚡</div>}

      {/* COMBO BANNER */}
      {showCombo && (
        <div className="combo-banner">
          <div className="combo-banner-text">x{combo} COMBO!</div>
        </div>
      )}

      {/* VOCABULARY VAULT */}
      {showVault && (
        <div className="vault-overlay" onClick={() => setShowVault(false)}>
          <div className="vault-modal" onClick={e => e.stopPropagation()}>
            <div className="vault-header">
              <div>
                <div className="vault-title">SŁOWNIK<span>VAULT</span></div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>Twoje zasoby językowe</div>
              </div>
              <button className="vault-close" onClick={() => setShowVault(false)}>✕</button>
            </div>
            <div style={{ padding: '20px 28px', flex: 1, overflowY: 'auto' }}>
              <input type="text" className="vault-search" placeholder="Szukaj słowa..." value={vaultSearch} onChange={(e) => setVaultSearch(e.target.value)} style={{ marginBottom: '16px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {profile?.vocabulary?.filter(w => w.toLowerCase().includes(vaultSearch.toLowerCase())).map((word, i) => (
                  <div key={i} className="vault-word">
                    <span className="vault-word-text">{word}</span>
                    <button className="vault-remove-btn" onClick={() => handleRemoveVocab(word)}>Usuń</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    

      <main className="ls-main">

        {/* LEFT: EDITOR + FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

          {/* EDITOR CARD */}
          <div className="ls-card ls-card-glow" style={{ position: 'relative', overflow: 'visible' }}>
            {/* Decorative glow orb */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${activeMission.color}22, transparent)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'all 0.5s' }} />

            <div className="editor-card" style={{ position: 'relative', zIndex: 1 }}>
              {/* MISSION TABS */}
              <div className="mission-tabs">
                {MISSIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMission(m)}
                    className={`mission-tab ${activeMission.id === m.id ? 'active' : ''}`}
                    style={activeMission.id === m.id ? { color: m.color, borderColor: m.color + '88', boxShadow: `0 0 16px ${m.color}44` } : {}}
                  >
                    {m.icon} {m.label} <span className="mission-xp-badge">+{m.xp}xp</span>
                  </button>
                ))}
              </div>

              {/* PROMPT */}
              <div className="mission-prompt" style={{ borderLeftColor: activeMission.color, color: `${activeMission.color}dd` }}>
                "{activeMission.prompt}"
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* POLISH CHARS */}
                <div className="polish-chars">
                  {POLISH_CHARS.map(char => (
                    <button key={char} type="button" className="polish-char-btn" onClick={() => insertChar(char, mainTextareaRef, text, setText)}>
                      {char}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={mainTextareaRef}
                  required value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Napisz coś ambitnego..."
                  className={`main-textarea ${pulseEditor ? 'pulse-success' : ''}`}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="polish-chars">
                    {POLISH_CHARS.map(char => (
                      <button key={char} type="button" className="polish-char-btn small" onClick={() => insertChar(char, vocabInputRef, vocab, setVocab)}>
                        {char}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <input ref={vocabInputRef} value={vocab} onChange={(e) => setVocab(e.target.value)} placeholder="Słówka (oddzielone przecinkiem)..." className="vocab-input" style={{ flex: 1 }} />
                    <button disabled={!text.trim() || isSubmitting} className={`submit-btn ${slotSpin ? 'spinning' : ''}`}>
                      {isSubmitting ? "🎰" : `OPUBLIKUJ ⚡`}
                    </button>
                  </div>
                </div>
              </form>

              {/* WORD METER */}
              <div className="word-meter">
                <div>
                  <div className="word-meter-label" style={{ color: milestone.color }}>{milestone.label}</div>
                  <div className="star-rating" style={{ marginTop: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <span key={i} style={{ fontSize: '12px', opacity: i <= milestone.stars ? 1 : 0.15 }}>⭐</span>
                    ))}
                  </div>
                </div>
                <div className="word-meter-bar">
                  <div className="word-meter-fill" style={{ width: `${Math.min((wordCount / 40) * 100, 100)}%`, background: `linear-gradient(90deg, ${milestone.color}88, ${milestone.color})` }} />
                </div>
                <div className="word-count-num">{wordCount} słów</div>
              </div>

              {/* COMBO BAR */}
              {combo >= 2 && (
                <div className="combo-bar" style={{ animation: 'newPostSlide 0.3s ease-out' }}>
                  <div className="combo-flames">{combo >= 4 ? '🔥🔥🔥' : combo >= 3 ? '🔥🔥' : '🔥'}</div>
                  <div>
                    <div className="combo-text">COMBO AKTYWNY</div>
                    <div className="combo-desc">Pisz częściej, zarabiaj więcej XP!</div>
                  </div>
                  <div className="combo-multiplier">x{combo}</div>
                </div>
              )}
            </div>
          </div>

          {/* FEED */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((p) => (
              <article key={p.id} className={`ls-card post-card ${newPostIds.has(p.id) ? 'new-post' : ''}`}>
                {/* POST HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="post-avatar" style={{ background: p.authorEmail === ADMIN_EMAIL ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'linear-gradient(135deg, #1E1E2E, #2A2A3E)', border: `1px solid ${p.authorEmail === ADMIN_EMAIL ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                      {p.author.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="post-author">{p.author}</span>
                        <span className="post-level" style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>{p.authorLevel}</span>
                        {p.edited && <span className="edited-badge">editado</span>}
                      </div>
                      <div className="post-mission">{p.missionType || 'Wolna Myśl'} · {p.wordCount || 0} słów</div>
                    </div>
                  </div>

                  {(p.uid === user.uid || isAdmin) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {deleteConfirmId === p.id ? (
                        <div className="delete-confirm">
                          <button onClick={() => confirmDelete(p.id)} className="btn-danger">TAK</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="btn-cancel">NIE</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {p.uid === user.uid && (
                            <button onClick={() => { setEditingId(p.id); setEditText(p.content); }} className="btn-small-icon" title="Edit">✍️</button>
                          )}
                          <button onClick={() => setDeleteConfirmId(p.id)} className="btn-small-icon" title="Delete">🗑️</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingId === p.id ? (
                  <div className="edit-zone">
                    <div className="polish-chars" style={{ marginBottom: '8px' }}>
                      {POLISH_CHARS.map(char => (
                        <button key={char} type="button" className="polish-char-btn small" onClick={() => insertChar(char, editPostRef, editText, setEditText)}>{char}</button>
                      ))}
                    </div>
                    <textarea ref={editPostRef} value={editText} onChange={(e) => setEditText(e.target.value)} className="edit-textarea" rows={4} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={() => handleEditPost(p.id)} className="btn-save">Zapisz</button>
                      <button onClick={() => setEditingId(null)} className="btn-cancel-text">Anuluj</button>
                    </div>
                  </div>
                ) : (
                  <p className="post-content">"{p.content}"</p>
                )}

                {p.vocabulary?.length > 0 && (
                  <div className="vocab-tags">
                    {p.vocabulary.map((v, i) => <span key={i} className="vocab-tag">{v}</span>)}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="post-actions">
                  <button onClick={() => handleLike(p)} className={`action-btn ${p.likes?.includes(user.uid) ? 'liked' : ''}`}>
                    <span className="icon">{p.likes?.includes(user.uid) ? '❤️' : '🤍'}</span>
                    <span>{p.likes?.length || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(p.id)} className="action-btn">
                    <span className="icon">💬</span>
                    <span>Komentarze</span>
                  </button>
                </div>

                {/* COMMENTS */}
                {activeCommentBox === p.id && (
                  <div className="comment-zone">
                    {comments[p.id]?.map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-stripe" style={{ background: c.isCorrection ? '#EF4444' : '#7C3AED' }} />
                        <div>
                          <div className="comment-author">{c.author} {c.isCorrection && <span style={{ color: '#EF4444', fontSize: '9px' }}>✍️ POPRAWKA</span>}</div>
                          <div className="comment-text">{c.content}</div>
                        </div>
                      </div>
                    ))}
                    <div>
                      <div className="polish-chars" style={{ marginBottom: '6px' }}>
                        {POLISH_CHARS.map(char => (
                          <button key={char} type="button" className="polish-char-btn small"
                            onClick={() => { const ref = { current: document.getElementById(`comment-${p.id}`) }; insertChar(char, ref, commentText, setCommentText); }}>
                            {char}
                          </button>
                        ))}
                      </div>
                      <textarea id={`comment-${p.id}`} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Napisz feedback..." className="comment-input" rows={3} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                        <button onClick={() => handlePostComment(p.id, true)} className="btn-correction">✍️ Poprawka</button>
                        <button onClick={() => handlePostComment(p.id, false)} className="btn-send">Wyślij</button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* SHADOW PROTOCOL */}
            <Link to="/shadow-protocol" className="shadow-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="shadow-live-dot" />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.25em' }}>System: Active</span>
                </div>
                <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(16,185,129,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 8px', borderRadius: '6px' }}>B1 Protocol</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div className="shadow-title">Shadow<span>Protocol</span></div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginTop: '4px', lineHeight: 1.5 }}>Inicjuj symulację<br/><span style={{ color: 'rgba(16,185,129,0.5)' }}>Autoryzacja wymagana...</span></div>
                </div>
                <div className="shadow-arrow">⚡</div>
              </div>
              <div className="shadow-progress-bars">
                {[1,2,3,4,5,6].map(i => <div key={i} className="shadow-bar" style={{ background: i < 4 ? '#10B981' : 'rgba(255,255,255,0.06)' }} />)}
              </div>
            </Link>

            {/* VOCAB CARD */}
            <button onClick={() => setShowVault(true)} className="vocab-card">
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(124,58,237,0.6)', marginBottom: '12px' }}>Mój Słownik</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div className="vocab-count">{profile?.vocabulary?.length || 0}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Poznane słowa</div>
                </div>
                <div style={{ fontSize: '40px', transition: 'transform 0.3s' }}>📚</div>
              </div>
            </button>

            {/* LIBRARY */}
            <div className="library-card">
              <div className="section-label">
                <div className="section-label-dot" style={{ background: 'var(--neon-purple)' }} />
                Biblioteka B1
              </div>
              <div>
                {resources.map(res => (
                  <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="library-item">
                    <div className="library-title">{res.title}</div>
                    <div className="library-type">{res.type}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* TIP */}
            <div className="tip-card">
              <div className="tip-label">Wskazówka Dnia</div>
              <div className="tip-text">"Używaj spójników takich jak 'ponieważ', 'chociaż' oraz 'dlatego', aby Twoje zdania brzmiały bardziej naturalnie."</div>
            </div>

            {/* LINK CARDS */}
            {[
              { to: "/vocabularyvault", label: "Vocabulary Vault", text: "Otwórz pełny skarbiec słówek 🔑" },
              { to: "/polish-simplified", label: "learn Polish vocabulary", text: "Polish Simplified 🎮" },
              { to: "/polish-music", label: "Music & Polish", text: "Listen to Polish vibe 🎵" },
              { to: "/reading-practice", label: "Reading Practice", text: "Practice Reading 📖" },
              { to: "/conjugation-practice", label: "Conjugations", text: "Practice Conjugations 🧠" },
              { to: "/play", label: "Learn Polish via Play", text: "Practice grammar rules, build vocabulary with games logics" },
            ].map(({ to, label, text }) => (
              <Link key={to} to={to} className="link-card">
                <div className="link-card-label">{label}</div>
                <div className="link-card-text">{text}</div>
              </Link>
            ))}

          </div>
        </aside>
      </main>
    </>
  );
}
