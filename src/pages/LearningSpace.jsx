import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, query, onSnapshot, addDoc, serverTimestamp, 
  orderBy, doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { useAuth } from "../context/AuthContext";
import confetti from 'canvas-confetti';

const ADMIN_EMAIL = "byadiso@gmail.com";

export default function LearningSpace() {
  const { profile, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [text, setText] = useState("");
  const [vocab, setVocab] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 
  
  const [activeCommentBox, setActiveCommentBox] = useState(null); 
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({}); 

  const isAdmin = user?.email === ADMIN_EMAIL;
  // Level is still used for the UI and tagging posts
  const effectiveLevel = profile?.level || (isAdmin ? "C1" : "A1");

  const getWordCount = (str) => str.trim() ? str.trim().split(/\s+/).length : 0;
  const wordCount = getWordCount(text);

  const getMilestone = (count) => {
    if (count === 0) return { label: "Napisz coś...", color: "text-slate-400" };
    if (count < 5) return { label: "Dobry start! ✨", color: "text-blue-600" };
    if (count < 15) return { label: "Świetnie! 🚀", color: "text-emerald-600" };
    if (count < 30) return { label: "Niesamowicie! 🔥", color: "text-rose-600" };
    return { label: "Legenda! 👑", color: "text-amber-600 font-black" };
  };

  const milestone = getMilestone(wordCount);

  // 1. FIXED: Listen to a GLOBAL collection instead of a level-specific one
  useEffect(() => {
    const q = query(collection(db, "global_posts"), orderBy('timestamp', 'desc'));
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
      
      // 2. FIXED: Add post to the GLOBAL collection
      await addDoc(collection(db, "global_posts"), {
        content: text,
        vocabulary: vocabList,
        wordCount,
        author: profile?.cityName || (isAdmin ? "Admin" : "Obywatel"),
        authorEmail: user.email,
        authorLevel: effectiveLevel, // We tag the post with the user's level
        uid: user.uid,
        likes: [],
        timestamp: serverTimestamp(),
      });

      if (vocabList.length > 0) {
        await setDoc(doc(db, "users", user.uid), { vocabulary: arrayUnion(...vocabList) }, { merge: true });
      }
      confetti({ particleCount: Math.min(wordCount * 5, 200), spread: 70, origin: { y: 0.8 } });
      setText(""); setVocab("");
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
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
      content: commentText, 
      author: profile?.cityName || (isAdmin ? "Admin" : "User"), 
      uid: user.uid, 
      isCorrection, 
      timestamp: serverTimestamp(),
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

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400 animate-pulse uppercase tracking-widest">Wczytywanie...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 lg:pb-0">
      <nav className="border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur-md z-50 px-4 md:px-6">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <span className="font-black text-lg">P</span>
            </div>
            <div>
              <h1 className="font-black text-slate-900 leading-none">PolishSpace</h1>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter italic">Public Feed</span>
            </div>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-full">
            <p className="text-sm font-black text-rose-500 flex items-center gap-1">🔥 {profile?.streak || 0}</p>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-indigo-50 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <textarea 
                required value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Napisz coś do wszystkich..."
                className="w-full bg-transparent border-none text-lg md:text-xl focus:ring-0 placeholder:text-slate-400 resize-none min-h-[100px] font-medium text-slate-800"
              />
              {text.length > 0 && (
                <input 
                  value={vocab} onChange={(e) => setVocab(e.target.value)}
                  placeholder="Słówka (np. pies, dom, kawa)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 text-sm focus:border-indigo-400 focus:bg-white transition-all outline-none font-bold"
                />
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex flex-col w-full sm:w-auto">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${milestone.color}`}>{milestone.label}</span>
                    <div className="w-full sm:w-40 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${Math.min((wordCount / 40) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <button disabled={!text.trim() || isSubmitting} className="w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-200 shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                    {isSubmitting ? "Wysyłanie..." : "OPUBLIKUJ"}
                  </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {posts.map((p) => (
              <article key={p.id} className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-indigo-100 transition-all shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${p.authorEmail === ADMIN_EMAIL ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                      {p.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {p.author} 
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black">{p.authorLevel}</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.wordCount || 0} słów</p>
                        {p.edited && <span className="text-[9px] text-indigo-400 font-black italic uppercase">Edytowano</span>}
                      </div>
                    </div>
                  </div>

                  {(p.uid === user.uid || isAdmin) && (
                    <div className="flex items-center gap-1">
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <span className="text-[10px] font-black text-rose-500 uppercase">Usunąć?</span>
                          <button onClick={() => confirmDelete(p.id)} className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold">Tak</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold">Nie</button>
                        </div>
                      ) : (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Only author can edit, but both can delete */}
                          {p.uid === user.uid && (
                            <button onClick={() => { setEditingId(p.id); setEditText(p.content); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          )}
                          <button onClick={() => setDeleteConfirmId(p.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingId === p.id ? (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl mb-4">
                    <textarea 
                      value={editText} onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 font-bold outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPost(p.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight">Zapisz</button>
                      <button onClick={() => setEditingId(null)} className="bg-white border border-slate-200 text-slate-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight">Anuluj</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-800 text-[17px] leading-relaxed mb-4 whitespace-pre-wrap font-medium">"{p.content}"</p>
                )}

                {p.vocabulary?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.vocabulary.map((v, i) => (
                      <span key={i} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-tighter">{v}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
                  <button onClick={() => handleLike(p)} className={`flex items-center gap-2 ${p.likes?.includes(user.uid) ? 'text-rose-500' : 'text-slate-400'}`}>
                    <span className="text-xl">{p.likes?.includes(user.uid) ? '❤️' : '🤍'}</span>
                    <span className="text-xs font-black">{p.likes?.length || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(p.id)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors">
                    <span className="text-xl">💬</span>
                    <span className="text-xs font-black uppercase tracking-widest">Dyskusja</span>
                  </button>
                </div>

                {activeCommentBox === p.id && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
                      {comments[p.id]?.map(c => (
                        <div key={c.id} className="flex gap-3 text-sm">
                          <div className={`w-1 shrink-0 rounded-full ${c.isCorrection ? 'bg-rose-500' : 'bg-indigo-300'}`} />
                          <div className="flex-1">
                            <span className="font-bold text-slate-900 text-xs uppercase tracking-tight">{c.author}</span>
                            <p className="text-slate-600 mt-1 font-medium">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Napisz komentarz..." className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-none font-medium" />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => handlePostComment(p.id, true)} className="text-[10px] font-black text-rose-500 uppercase px-3 py-1">Korekta✍️</button>
                          <button onClick={() => handlePostComment(p.id, false)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase">Wyślij</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Twój Słownik</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-black">{profile?.vocabulary?.length || 0}</p>
                    <p className="text-[11px] font-bold opacity-80 uppercase leading-none">Unikalnych słówek</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📚</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Materiały</h3>
              <div className="space-y-3">
                {resources.map(res => (
                  <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all group">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{res.title}</p>
                      <p className="text-[9px] text-indigo-500 font-bold uppercase">{res.type}</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-600 transition-colors">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}