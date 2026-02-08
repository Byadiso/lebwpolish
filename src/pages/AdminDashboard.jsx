import { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { 
  collection, addDoc, serverTimestamp, query, where, 
  getDocs, onSnapshot, deleteDoc, doc, updateDoc 
} from "firebase/firestore";

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
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState("Article");
  const [drillPolish, setDrillPolish] = useState("");
  const [drillEnglish, setDrillEnglish] = useState("");
  const [drillLevel, setDrillLevel] = useState("A1");

  // Grammar Lab States
  const [gramQuestion, setGramQuestion] = useState("");
  const [gramAnswer, setGramAnswer] = useState("");
  const [gramCategory, setGramCategory] = useState("Tenses");
  const [gramLevel, setGramLevel] = useState("A1");

  // Live Lists
  const [resources, setResources] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [drills, setDrills] = useState([]);
  const [grammarTasks, setGrammarTasks] = useState([]);

  useEffect(() => {
    // Strategy: Remove orderBy from server queries and sort locally to avoid index errors
    
    const unsubRes = onSnapshot(collection(db, "resources"), (s) => {
      const docs = s.docs.map(d => ({id: d.id, ...d.data()}));
      setResources(docs.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    });

    const unsubUsers = onSnapshot(collection(db, "pending_users"), (s) => {
      const docs = s.docs.map(d => ({id: d.id, ...d.data()}));
      setPendingUsers(docs.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    const unsubDrills = onSnapshot(collection(db, "drills"), (s) => {
      const docs = s.docs.map(d => ({id: d.id, ...d.data()}));
      setDrills(docs.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    const unsubGram = onSnapshot(collection(db, "grammar_lab"), (s) => {
      const docs = s.docs.map(d => ({id: d.id, ...d.data()}));
      setGrammarTasks(docs.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    return () => { unsubRes(); unsubUsers(); unsubDrills(); unsubGram(); };
  }, []);

  const showStatus = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // --- HANDLERS ---
  const handleAddGrammar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "grammar_lab"), {
        question: gramQuestion.trim(),
        answer: gramAnswer.trim(),
        category: gramCategory,
        level: gramLevel,
        createdAt: serverTimestamp()
      });
      showStatus("Grammar Task Deployed!");
      setGramQuestion(""); setGramAnswer("");
    } catch (err) { 
      showStatus("Deployment failed.", "error"); 
    } finally { setLoading(false); }
  };

  const handleAddDrill = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await addDoc(collection(db, "drills"), {
        polish: drillPolish.trim(), 
        english: drillEnglish.trim(), 
        level: drillLevel, 
        createdAt: serverTimestamp()
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter italic">Admin <span className="text-indigo-600">Core</span></h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-1">Terminal Active: {user.email}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            {/* GRAMMAR LAB */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border-4 border-indigo-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🧠</div>
                <h2 className="text-xl font-black uppercase">Grammar Lab</h2>
              </div>
              <form onSubmit={handleAddGrammar} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required value={gramQuestion} onChange={(e) => setGramQuestion(e.target.value)} 
                    className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="Question (e.g. 'On ___ (być)')" />
                  <input required value={gramAnswer} onChange={(e) => setGramAnswer(e.target.value)} 
                    className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="Correct Answer" />
                </div>
                <div className="flex gap-4">
                  <select value={gramCategory} onChange={(e) => setGramCategory(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold">
                    <option>Basics</option><option>Tenses</option><option>Pronouns</option><option>Prepositions</option>
                  </select>
                  <select value={gramLevel} onChange={(e) => setGramLevel(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold">
                    <option>A1</option><option>B1</option><option>C1</option>
                  </select>
                  <button disabled={loading} className="px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase hover:bg-indigo-700 active:scale-95">Deploy ⚡</button>
                </div>
              </form>
            </section>

            {/* DRILL FACTORY */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border-4 border-red-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🎙️</div>
                <h2 className="text-xl font-black uppercase">Drill Factory</h2>
              </div>
              <form onSubmit={handleAddDrill} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required value={drillPolish} onChange={(e) => setDrillPolish(e.target.value)} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-red-500 outline-none" placeholder="Polish Sentence" />
                  <input required value={drillEnglish} onChange={(e) => setDrillEnglish(e.target.value)} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-red-500 outline-none" placeholder="English Translation" />
                </div>
                <div className="flex gap-4">
                  <select value={drillLevel} onChange={(e) => setDrillLevel(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold">
                    <option value="A1">Level A1</option><option value="B1">Level B1</option><option value="C1">Level C1</option>
                  </select>
                  <button disabled={loading} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase hover:bg-red-700 active:scale-95">Deploy 🚀</button>
                </div>
              </form>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {message.text && (
              <div className={`p-6 rounded-[2rem] border-2 animate-bounce ${message.type === "error" ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                <p className="font-black text-sm">{message.text}</p>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="font-black text-xs uppercase mb-4 text-slate-400">🔑 Key Generator</h3>
              {!generatedKey ? (
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <input required type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500" placeholder="Email" />
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-600">Generate</button>
                </form>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-black bg-indigo-50 py-6 rounded-3xl mb-4 tracking-widest text-indigo-700">{generatedKey}</div>
                  <button onClick={() => setGeneratedKey("")} className="text-indigo-600 font-black text-[10px] uppercase">Issue New Key</button>
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl h-[600px] flex flex-col">
              <h3 className="font-black text-xs uppercase text-indigo-400 mb-6 shrink-0 tracking-widest">System Monitor</h3>
              <div className="space-y-6 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Grammar Feed</p>
                  {grammarTasks.map(g => (
                    <div key={g.id} className="group flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                      <div>
                        <p className="text-[11px] font-bold text-slate-200">{g.question}</p>
                        <p className="text-[9px] text-indigo-400 font-black uppercase">{g.category} • {g.level}</p>
                      </div>
                      <button onClick={() => handleDelete('grammar_lab', g.id)} className="text-slate-500 hover:text-red-500 text-xl">×</button>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">User Matrix</p>
                  {pendingUsers.map(u => (
                    <div key={u.id} className="group flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                      <p className="text-[11px] font-bold text-slate-300 truncate w-32">{u.email}</p>
                      <button onClick={() => handleDelete('pending_users', u.id)} className="text-slate-500 hover:text-red-500 text-xl">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;