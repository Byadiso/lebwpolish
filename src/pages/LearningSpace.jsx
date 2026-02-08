import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, query, onSnapshot, addDoc, serverTimestamp, 
  orderBy, doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, limit 
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import confetti from 'canvas-confetti';

const ADMIN_EMAIL = "byadiso@gmail.com";

const MISSIONS = [
  { id: 1, label: "Hipoteza", prompt: "Co byś zrobił/a, gdybyś wygrał/a milion złotych?", icon: "💰" },
  { id: 2, label: "Wspomnienie", prompt: "Opisz swoje ulubione miejsce z dzieciństwa.", icon: "🏠" },
  { id: 3, label: "Opinia", prompt: "Czy lepiej mieszkać w mieście czy na wsi? Dlaczego?", icon: "🏙️" },
  { id: 4, label: "Plany", prompt: "Gdzie pojedziesz na następne wakacje? Użyj czasu przyszłego.", icon: "🏖️" }
];

export default function LearningSpace() {
  const { profile, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [text, setText] = useState("");
  const [vocab, setVocab] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  
  // UX States
  const [showVault, setShowVault] = useState(false);
  const [vaultSearch, setVaultSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 
  const [activeCommentBox, setActiveCommentBox] = useState(null); 
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({}); 

  const isAdmin = user?.email === ADMIN_EMAIL;
  const effectiveLevel = profile?.level || (isAdmin ? "C1" : "A1");

  const getWordCount = (str) => str.trim() ? str.trim().split(/\s+/).length : 0;
  const wordCount = getWordCount(text);

  const getMilestone = (count) => {
    if (count === 0) return { label: "Czekamy na Twój tekst...", color: "text-slate-400" };
    if (count < 10) return { label: "Rozgrzewka ✨", color: "text-blue-500" };
    if (count < 25) return { label: "Płynna Myśl 🌊", color: "text-emerald-500" };
    return { label: "Poziom B1: Ekspert! 🏆", color: "text-amber-500 font-black italic" };
  };

  const milestone = getMilestone(wordCount);

  useEffect(() => {
    const q = query(collection(db, "global_posts"), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "resources"), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const vocabList = vocab.split(',').map(v => v.trim().toLowerCase()).filter(v => v !== "");
      
      await addDoc(collection(db, "global_posts"), {
        content: text,
        vocabulary: vocabList,
        wordCount,
        missionType: activeMission.label,
        author: profile?.cityName || (isAdmin ? "Instruktor" : "Student"),
        authorEmail: user.email,
        authorLevel: effectiveLevel,
        uid: user.uid,
        likes: [],
        timestamp: serverTimestamp(),
      });

      if (vocabList.length > 0) {
        await setDoc(doc(db, "users", user.uid), { vocabulary: arrayUnion(...vocabList) }, { merge: true });
      }
      
      confetti({ 
        particleCount: Math.min(wordCount * 4, 150), 
        spread: 80, 
        origin: { y: 0.8 },
        colors: ['#4F46E5', '#FB7185', '#FBBF24']
      });
      setText(""); setVocab("");
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleRemoveVocab = async (word) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        vocabulary: arrayRemove(word)
      });
    } catch (err) { console.error("Error removing word:", err); }
  };

  const handleEditPost = async (postId) => {
    if (!editText.trim()) return;
    await updateDoc(doc(db, "global_posts", postId), { content: editText, edited: true });
    setEditingId(null);
  };

  const toggleComments = (postId) => {
    if (activeCommentBox === postId) return setActiveCommentBox(null);
    setActiveCommentBox(postId);
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
  };

  const handleLike = async (p) => {
    const isLiked = p.likes?.includes(user.uid);
    await updateDoc(doc(db, "global_posts", p.id), { 
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) 
    });
  };

  const confirmDelete = async (id) => {
    await deleteDoc(doc(db, "global_posts", id));
    setDeleteConfirmId(null);
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-400 animate-pulse tracking-widest uppercase italic">Wczytywanie Przestrzeni...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20">
      
      {/* VOCABULARY VAULT OVERLAY */}
      {showVault && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowVault(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter">SŁOWNIK<span className="text-indigo-600">VAULT</span></h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Twoje osobiste zasoby B1</p>
              </div>
              <button onClick={() => setShowVault(false)} className="w-12 h-12 rounded-2xl hover:bg-white hover:shadow-md text-slate-400 hover:text-indigo-600 transition-all font-black">✕</button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Szukaj słowa..." 
                  className="w-full bg-slate-100 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-400 transition-all outline-none"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                />
                <span className="absolute right-6 top-4 opacity-30">🔍</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile?.vocabulary?.filter(w => w.toLowerCase().includes(vaultSearch.toLowerCase())).map((word, i) => (
                  <div key={i} className="group flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                    <span className="font-black text-slate-700 uppercase text-sm tracking-tight">{word}</span>
                    <button 
                      onClick={() => handleRemoveVocab(word)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-all"
                    >
                      Usuń
                    </button>
                  </div>
                ))}
                {(!profile?.vocabulary || profile.vocabulary.length === 0) && (
                  <p className="col-span-full text-center py-10 text-slate-400 font-bold italic">Brak słówek w skarbcu. Dodaj je publikując post!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-xl z-50 px-6">
        <div className="max-w-6xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <span className="font-black text-xl italic">P</span>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">POLISH<span className="text-indigo-600">SPACE</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Feed Globalny</p>
            </div>
          </div>
          <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
            <p className="text-sm font-black text-rose-500 flex items-center gap-2 tracking-tight">🔥 {profile?.streak || 0} DNI</p>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="text-9xl font-black italic">B1</span>
            </div>

            <div className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-6">
                    {MISSIONS.map(m => (
                        <button 
                            key={m.id}
                            onClick={() => setActiveMission(m)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMission.id === m.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-6 italic">"{activeMission.prompt}"</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <textarea 
                        required value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="Napisz coś ambitnego..."
                        className="w-full bg-slate-50/50 border-none text-lg md:text-xl focus:ring-2 focus:ring-indigo-100 rounded-3xl p-6 placeholder:text-slate-300 resize-none min-h-[150px] font-medium transition-all"
                    />
                    
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <input 
                            value={vocab} onChange={(e) => setVocab(e.target.value)}
                            placeholder="Słówka (oddzielone przecinkiem)"
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:border-indigo-400 outline-none transition-all shadow-sm"
                        />
                        <button disabled={!text.trim() || isSubmitting} className="w-full md:w-auto px-10 py-4 rounded-2xl font-black text-xs tracking-[0.2em] bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all uppercase">
                            {isSubmitting ? "Wysyłanie..." : "OPUBLIKUJ"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                    <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${milestone.color}`}>{milestone.label}</span>
                        <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min((wordCount / 40) * 100, 100)}%` }} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter">{wordCount} słów</p>
                </div>
            </div>
          </div>

          <div className="space-y-8">
            {posts.map((p) => (
              <article key={p.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 hover:border-indigo-100 transition-all shadow-sm group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl ${p.authorEmail === ADMIN_EMAIL ? 'bg-indigo-600 rotate-3' : 'bg-slate-900 -rotate-3'}`}>
                      {p.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        {p.author} 
                        <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase font-black">{p.authorLevel}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.missionType || 'Wolna Myśl'}</p>
                    </div>
                  </div>
                  
                  {(p.uid === user.uid || isAdmin) && (
                    <div className="flex items-center gap-1">
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => confirmDelete(p.id)} className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold">TAK</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold">NIE</button>
                        </div>
                      ) : (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {p.uid === user.uid && (
                            <button onClick={() => { setEditingId(p.id); setEditText(p.content); }} className="p-2 text-slate-300 hover:text-indigo-600">✍️</button>
                          )}
                          <button onClick={() => setDeleteConfirmId(p.id)} className="p-2 text-slate-300 hover:text-rose-500">🗑️</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingId === p.id ? (
                  <div className="space-y-3 bg-slate-50 p-6 rounded-[1.5rem] mb-4">
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 font-bold outline-none" />
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPost(p.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Zapisz</button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 text-[10px] font-black uppercase px-4">Anuluj</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-800 text-[18px] leading-relaxed mb-6 font-medium italic border-l-4 border-indigo-50 pl-6">"{p.content}"</p>
                )}

                {p.vocabulary?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {p.vocabulary.map((v, i) => (
                      <span key={i} className="text-[9px] font-black bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-tighter hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default">{v}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-8 border-t border-slate-50 pt-6">
                  <button onClick={() => handleLike(p)} className={`flex items-center gap-2 transition-transform active:scale-125 ${p.likes?.includes(user.uid) ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}>
                    <span className="text-2xl">{p.likes?.includes(user.uid) ? '❤️' : '🤍'}</span>
                    <span className="text-xs font-black">{p.likes?.length || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(p.id)} className="flex items-center gap-2 text-slate-300 hover:text-indigo-500 transition-colors group">
                    <span className="text-2xl group-hover:rotate-12 transition-transform">💬</span>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Komentarze</span>
                  </button>
                </div>

                {activeCommentBox === p.id && (
                  <div className="mt-8 space-y-4">
                    <div className="bg-slate-50 rounded-[1.5rem] p-6 space-y-4">
                      {comments[p.id]?.map(c => (
                        <div key={c.id} className="flex gap-4 text-sm bg-white/50 p-3 rounded-xl">
                          <div className={`w-1 shrink-0 rounded-full ${c.isCorrection ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-indigo-300'}`} />
                          <div className="flex-1">
                            <span className="font-black text-slate-900 text-[10px] uppercase tracking-tighter">{c.author}</span>
                            <p className="text-slate-600 mt-1 font-medium">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Napisz feedback..." className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none font-medium" />
                        <div className="flex justify-end gap-3 mt-3">
                          <button onClick={() => handlePostComment(p.id, true)} className="text-[10px] font-black text-rose-500 uppercase px-3 py-1 hover:bg-rose-50 rounded-lg transition-colors">Poprawka✍️</button>
                          <button onClick={() => handlePostComment(p.id, false)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100">Wyślij</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-8">
            
            {/* CLICKABLE VOCABULARY CARD */}
            <button 
              onClick={() => setShowVault(true)}
              className="w-full text-left group bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
            >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-400 rounded-full blur-3xl opacity-40 group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-6">Mój Słownik</h3>
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-5xl font-black italic tracking-tighter">{profile?.vocabulary?.length || 0}</p>
                    <p className="text-[10px] font-bold text-indigo-100 uppercase mt-2 tracking-widest italic opacity-80">Poznane słowa</p>
                  </div>
                  <div className="text-4xl group-hover:rotate-12 transition-transform duration-300">📚</div>
                </div>
            </button>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Biblioteka B1
              </h3>
              <div className="space-y-4">
                {resources.map(res => (
                  <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="block p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter group-hover:text-indigo-600">{res.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 italic tracking-widest">{res.type}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Wskazówka Dnia:</p>
                <p className="text-xs font-bold text-amber-800 italic leading-relaxed">
                    "Używaj spójników takich jak 'ponieważ', 'chociaż' oraz 'dlatego', aby Twoje zdania brzmiały bardziej naturalnie na poziomie B1."
                </p>
            </div>

            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 relative overflow-hidden group transition-all hover:bg-amber-100/50">
  <div className="relative z-10">
    <div className="flex justify-between items-start mb-2">
      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
        Vocabulary Vault
      </p>
      <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
    </div>

   

    {/* THE NAV LINK */}
    <Link 
      to="/vocabularyvault" 
      className="inline-flex items-center text-[10px] font-black text-amber-600 uppercase tracking-tighter border-b-2 border-amber-200 hover:border-amber-500 transition-all pb-0.5"
    >
      Otwórz pełny skarbiec słówek 🔑
    </Link>
  </div>
</div>
          </div>
        </aside>
      </main>
    </div>
  );
}