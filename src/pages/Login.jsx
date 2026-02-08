import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = "byadiso@gmail.com";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (normalizedEmail === ADMIN_EMAIL) {
        // --- ADMIN LOGIN (Standard Firebase Auth) ---
        await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      } else {
        // --- STUDENT LOGIN (6-Digit Access Key) ---
        const q = query(
          collection(db, "pending_users"), 
          where("email", "==", normalizedEmail),
          where("passcode", "==", pass.trim())
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          throw new Error("Invalid email or access key.");
        }

        try {
          // Try standard login with the passcode
          await signInWithEmailAndPassword(auth, normalizedEmail, pass.trim());
        } catch (signInErr) {
          // If first-time user, create the account silently
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            await createUserWithEmailAndPassword(auth, normalizedEmail, pass.trim());
          } else {
            throw signInErr;
          }
        }
      }

      setSuccess(true);
      setTimeout(() => navigate('/space'), 1200);
      
    } catch (err) {
      setError(err.message.includes("access key") 
        ? "Błędny e-mail lub kod dostępu." 
        : "Logowanie nieudane. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleLogin} 
          className="p-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100"
        >
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-red-600 tracking-tighter uppercase italic">
              LEBW<span className="text-slate-900">POLISH</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Writing Space</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 text-red-600 text-xs font-bold rounded-2xl animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-100 text-green-600 text-xs font-bold rounded-2xl">
              ✅ Autoryzacja pomyślna...
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">E-mail</label>
              <input 
                required
                type="email" 
                placeholder="twoj@email.com" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold" 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">
                {email.toLowerCase() === ADMIN_EMAIL ? "Hasło Admina" : "Kod Dostępu"}
              </label>
              <input 
                required
                type="password" 
                placeholder={email.toLowerCase() === ADMIN_EMAIL ? "••••••••" : "Kod 6-cyfrowy"} 
                className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold tracking-widest" 
                onChange={e => setPass(e.target.value)} 
              />
            </div>

            <button 
              disabled={loading || success}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 mt-4 ${
                loading || success ? "bg-slate-300" : "bg-red-600 hover:bg-red-700 shadow-red-100"
              }`}
            >
              {loading ? "Weryfikacja..." : "Zaloguj się"}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
          Brak kodu? Napisz do <span className="text-red-500 underline cursor-pointer">Administratora</span>
        </p>
      </div>
    </div>
  );
}