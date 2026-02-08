import { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { 
  collection, addDoc, serverTimestamp, query, where, 
  getDocs, onSnapshot, deleteDoc, doc, updateDoc 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const POLISH_CITIES = ["Warszawa", "Kraków", "Wrocław", "Łódź", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Białystok"];
const ADMIN_EMAIL = "byadiso@gmail.com";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Identity States
  const [studentEmail, setStudentEmail] = useState("");
  const [assignedLevel, setAssignedLevel] = useState("A1");
  const [generatedKey, setGeneratedKey] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("A1");

  // Content States
  const [drillPolish, setDrillPolish] = useState("");
  const [drillEnglish, setDrillEnglish] = useState("");
  const [drillLevel, setDrillLevel] = useState("A1");
  const [gramQuestion, setGramQuestion] = useState("");
  const [gramAnswer, setGramAnswer] = useState("");
  const [gramCategory, setGramCategory] = useState("Tenses");
  const [gramLevel, setGramLevel] = useState("A1");

  // Live Lists
  const [pendingUsers, setPendingUsers] = useState([]);
  const [drills, setDrills] = useState([]);
  const [grammarTasks, setGrammarTasks] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "pending_users"), (s) => {
      setPendingUsers(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    const unsubDrills = onSnapshot(collection(db, "drills"), (s) => {
      setDrills(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    const unsubGram = onSnapshot(collection(db, "grammar_lab"), (s) => {
      setGrammarTasks(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => { unsubUsers(); unsubDrills(); unsubGram(); };
  }, []);

  const showStatus = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleAddGrammar = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await addDoc(collection(db, "grammar_lab"), {
        question: gramQuestion.trim(), answer: gramAnswer.trim(),
        category: gramCategory, level: gramLevel, createdAt: serverTimestamp()
      });
      showStatus("Grammar Task Deployed!");
      setGramQuestion(""); setGramAnswer("");
    } catch (err) { showStatus("Deployment failed.", "error"); } 
    finally { setLoading(false); }
  };

  const handleAddDrill = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await addDoc(collection(db, "drills"), {
        polish: drillPolish.trim(), english: drillEnglish.trim(), 
        level: drillLevel, createdAt: serverTimestamp()
      });
      showStatus("Drill Online!");
      setDrillPolish(""); setDrillEnglish("");
    } catch (err) { showStatus("Drill failed.", "error"); }
    finally { setLoading(false); }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault(); setLoading(true);
    const accessKey = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const emailLower = studentEmail.trim().toLowerCase();
      const q = query(collection(db, "pending_users"), where("email", "==", emailLower));
      const existing = await getDocs(q);
      if (!existing.empty) return showStatus("User already in system.", "error");
      
      await addDoc(collection(db, "pending_users"), {
        email: emailLower, level: assignedLevel, passcode: accessKey,
        cityName: POLISH_CITIES[Math.floor(Math.random() * POLISH_CITIES.length)],
        role: "user", claimed: false, xp: 0, streak: 0, createdAt: serverTimestamp()
      });
      setGeneratedKey(accessKey); setStudentEmail("");
      showStatus("Access Key Generated!");
    } catch (error) { showStatus("Write rejected.", "error"); }
    finally { setLoading(false); }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const q = query(collection(db, "pending_users"), where("email", "==", searchEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) { showStatus("User not found.", "error"); setTargetUser(null); }
      else {
        const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setTargetUser(userData); setNewName(userData.name || ""); setNewLevel(userData.level || "A1");
        showStatus("Profile Loaded.");
      }
    } finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await updateDoc(doc(db, "pending_users", targetUser.id), { name: newName, level: newLevel });
      showStatus("Identity Updated!"); setTargetUser(null); setSearchEmail("");
    } finally { setLoading(false); }
  };

  const handleDelete = async (col, id) => {
    if(!window.confirm("Confirm deletion?")) return;
    try {
      await deleteDoc(doc(db, col, id));
      showStatus("Purged from Database.");
    } catch (err) { showStatus("Delete failed.", "error"); }
  };

  if (authLoading) return <div className="p-10 text-center font-black animate-pulse text-indigo-600">AUTHENTICATING...</div>;
  if (!user || user.email !== ADMIN_EMAIL) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black uppercase tracking-[0.5em]">Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none">
              ADMIN <span className="text-indigo-600">CORE</span>
            </h1>
            <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-2">
              System Terminal • {user.email}
            </p>
          </div>
          
          <AnimatePresence>
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className={`px-6 py-3 rounded-xl border-2 shadow-lg ${message.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
              >
                <p className="font-bold text-xs uppercase tracking-tight">{message.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* MAIN COLUMN: FORMS */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            
            {/* GRAMMAR LAB CARD */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-indigo-200 shadow-lg">🧠</div>
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Grammar Lab</h2>
              </div>
              <form onSubmit={handleAddGrammar} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <input required value={gramQuestion} onChange={(e) => setGramQuestion(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm focus:border-indigo-500 outline-none transition-all" placeholder="Question / Sentence" />
                  <input required value={gramAnswer} onChange={(e) => setGramAnswer(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm focus:border-indigo-500 outline-none transition-all" placeholder="Correct Answer" />
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <select value={gramCategory} onChange={(e) => setGramCategory(e.target.value)} className="w-full md:flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm">
                    <option>Basics</option><option>Tenses</option><option>Pronouns</option><option>Prepositions</option>
                  </select>
                  <select value={gramLevel} onChange={(e) => setGramLevel(e.target.value)} className="w-full md:w-32 bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm text-center">
                    <option>A1</option><option>B1</option><option>C1</option>
                  </select>
                  <button disabled={loading} className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 active:scale-95 transition-all">Deploy ⚡</button>
                </div>
              </form>
            </section>

            {/* DRILL FACTORY CARD */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white text-lg shadow-rose-200 shadow-lg">🎙️</div>
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Drill Factory</h2>
              </div>
              <form onSubmit={handleAddDrill} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <input required value={drillPolish} onChange={(e) => setDrillPolish(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm focus:border-rose-500 outline-none transition-all" placeholder="Polish Sentence" />
                  <input required value={drillEnglish} onChange={(e) => setDrillEnglish(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm focus:border-rose-500 outline-none transition-all" placeholder="English Translation" />
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <select value={drillLevel} onChange={(e) => setDrillLevel(e.target.value)} className="w-full md:flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-xl md:rounded-2xl font-bold text-sm">
                    <option value="A1">Level A1</option><option value="B1">Level B1</option><option value="C1">Level C1</option>
                  </select>
                  <button disabled={loading} className="w-full md:w-auto px-8 py-4 bg-rose-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-xs hover:bg-rose-700 active:scale-95 transition-all">Deploy 🚀</button>
                </div>
              </form>
            </section>
          </div>

          {/* SIDE COLUMN: USERS & MONITOR */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            
            {/* IDENTITY & KEYS TABS (Mobile Optimized) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
              
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-[10px] uppercase mb-4 text-slate-400 tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Identity Manager
                </h3>
                {!targetUser ? (
                  <form onSubmit={handleSearchUser} className="space-y-3">
                    <input required value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500" placeholder="User email..." />
                    <button className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black uppercase text-[10px] hover:bg-indigo-600 hover:text-white transition-all">Find Profile</button>
                  </form>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-indigo-600 text-white p-3 rounded-xl mb-1 text-center truncate">
                      <p className="font-bold text-[10px]">{targetUser.email}</p>
                    </div>
                    <input required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none" placeholder="Name" />
                    <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs">
                      <option value="A1">A1</option><option value="B1">B1</option><option value="C1">C1</option>
                    </select>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px]">Save</button>
                      <button type="button" onClick={() => setTargetUser(null)} className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px]">Exit</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-[10px] uppercase mb-4 text-slate-400 tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> Key Generator
                </h3>
                {!generatedKey ? (
                  <form onSubmit={handleCreateStudent} className="space-y-3">
                    <input required type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500" placeholder="Student email..." />
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] hover:bg-indigo-600">Generate</button>
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-black bg-indigo-50 py-4 rounded-xl mb-3 tracking-[0.2em] text-indigo-700">{generatedKey}</div>
                    <button onClick={() => setGeneratedKey("")} className="text-indigo-600 font-black text-[9px] uppercase hover:underline">Reset</button>
                  </div>
                )}
              </div>
            </div>

            {/* SYSTEM MONITOR (Dark Mode UI) */}
            <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl h-[400px] md:h-[500px] flex flex-col border border-white/5">
              <h3 className="font-black text-[10px] uppercase text-indigo-400 mb-6 shrink-0 tracking-[0.3em]">System Monitor</h3>
              <div className="space-y-8 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                
                {/* Grammar Feed */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest sticky top-0 bg-slate-900 py-1">Grammar Feed</p>
                  {grammarTasks.length === 0 && <p className="text-xs text-slate-700 italic">No tasks found...</p>}
                  {grammarTasks.map(g => (
                    <div key={g.id} className="group flex justify-between items-start border-b border-white/5 pb-3">
                      <div className="min-w-0 pr-4">
                        <p className="text-xs font-bold text-slate-200 line-clamp-1">{g.question}</p>
                        <p className="text-[8px] text-indigo-400 font-black uppercase mt-1">{g.category} • {g.level}</p>
                      </div>
                      <button onClick={() => handleDelete('grammar_lab', g.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* User Matrix */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest sticky top-0 bg-slate-900 py-1">User Matrix</p>
                  {pendingUsers.map(u => (
                    <div key={u.id} className="group flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-300 truncate w-32 md:w-48">{u.email}</p>
                        <p className="text-[8px] text-slate-500 uppercase">{u.claimed ? "Claimed" : "Pending Key"}</p>
                      </div>
                      <button onClick={() => handleDelete('pending_users', u.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;