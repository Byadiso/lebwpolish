import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAIL = "byadiso@gmail.com";
const SUPPORT_EMAIL = "nganatech@gmail.com"; // New Support Email

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
        await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      } else {
        const q = query(
          collection(db, "pending_users"), 
          where("email", "==", normalizedEmail),
          where("passcode", "==", pass.trim())
        );
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Invalid email or access key.");

        try {
          await signInWithEmailAndPassword(auth, normalizedEmail, pass.trim());
        } catch (signInErr) {
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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-1 bg-red-600 z-50 shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <form 
          onSubmit={handleLogin} 
          className="p-8 md:p-12 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative z-10"
        >
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              LEBW<span className="text-red-600">POL</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="h-[1px] w-4 bg-slate-200"></span>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">Secure Access</p>
              <span className="h-[1px] w-4 bg-slate-200"></span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[11px] font-black uppercase tracking-tight rounded-r-xl"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest transition-colors group-focus-within:text-red-600">
                Email Address
              </label>
              <input 
                required
                type="email" 
                placeholder="name@example.com" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold text-slate-900" 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest transition-colors group-focus-within:text-red-600">
                {email.toLowerCase() === ADMIN_EMAIL ? "Admin Password" : "6-Digit Access Key"}
              </label>
              <input 
                required
                type="password" 
                placeholder={email.toLowerCase() === ADMIN_EMAIL ? "••••••••" : "000 000"} 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold tracking-[0.3em] text-slate-900 placeholder:tracking-normal" 
                onChange={e => setPass(e.target.value)} 
              />
            </div>

            <button 
              disabled={loading || success}
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] text-white transition-all active:scale-[0.98] mt-4 shadow-lg ${
                loading || success ? "bg-slate-300" : "bg-slate-900 hover:bg-red-600 shadow-slate-200"
              }`}
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </div>
        </form>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
            Brak kodu? Napisz do: <br className="md:hidden" />
            <a 
              href={`mailto:${SUPPORT_EMAIL}?subject=Access Key Request`}
              className="text-red-500 underline decoration-2 underline-offset-4 cursor-pointer hover:text-slate-900 transition-colors ml-1"
            >
              Administratora ({SUPPORT_EMAIL})
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}