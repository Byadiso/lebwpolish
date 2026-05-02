import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "byadiso@gmail.com";
const SUPPORT_EMAIL = "nganatech@gmail.com";

/* ── Icons ───────────────────────────────────────────────────────────────── */
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail]         = useState("");
  const [pass, setPass]           = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const navigate = useNavigate();

  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;
  const passLabel = isAdmin ? "Password" : "Access key";
  const passPlaceholder = isAdmin ? "Your password" : "6-digit access key";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass  = pass.trim();

    try {
      if (normalizedEmail === ADMIN_EMAIL) {
        await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPass);
      } else {
        const q = query(
          collection(db, "pending_users"),
          where("email",   "==", normalizedEmail),
          where("passcode","==", normalizedPass)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Invalid email or access key.");

        try {
          await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPass);
        } catch (signInErr) {
          if (
            signInErr.code === "auth/user-not-found" ||
            signInErr.code === "auth/invalid-credential"
          ) {
            await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPass);
          } else {
            throw signInErr;
          }
        }
      }

      setSuccess(true);
      setTimeout(() => navigate("/space"), 1300);
    } catch (err) {
      setError(
        err.message.includes("access key")
          ? "Incorrect email or access key. Check your details and try again."
          : "Sign in failed. Please check your connection and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fafafa] px-5 py-14 overflow-hidden selection:bg-red-600 selection:text-white">

      {/* Dot grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "36px 36px" }}
      />

      {/* Red top bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-red-600 z-50" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >

        {/* ── BRAND ── */}
        <Link to="/" className="mb-10 text-center group">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase group-hover:text-slate-700 transition-colors">
            LEBW<span className="text-red-600 italic">POL</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 mt-1">
            Secure access
          </p>
        </Link>

        {/* ── CARD ── */}
        <div className="w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="h-1 w-full bg-red-600" />

          <div className="p-8 md:p-10">

            {/* Card header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-1.5">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Sign in to resume your Polish training.
              </p>
            </div>

            <AnimatePresence mode="wait">

              {/* ── SUCCESS ── */}
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-10 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1">
                    <CheckIcon />
                  </div>
                  <p className="font-black text-slate-900 text-base uppercase tracking-tight">
                    Signed in
                  </p>
                  <p className="text-sm text-slate-400 font-medium">
                    Taking you to your training space…
                  </p>
                </motion.div>
              ) : (

                /* ── FORM ── */
                <motion.form
                  key="form"
                  onSubmit={handleLogin}
                  className="flex flex-col gap-5"
                >

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl"
                      >
                        <span className="text-red-500 shrink-0 mt-px">⚠</span>
                        <p className="text-[11px] font-bold text-red-700 leading-snug">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Email address
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/8 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Password / Access key */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {passLabel}
                      </label>
                      {/* Subtle hint for non-admin users */}
                      {!isAdmin && (
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                          Provided by admin
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        required
                        type={showPass ? "text" : "password"}
                        placeholder={passPlaceholder}
                        value={pass}
                        onChange={(e) => { setPass(e.target.value); setError(""); }}
                        className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/8 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showPass} />
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !email || !pass}
                    className="w-full flex items-center justify-center gap-2.5 py-4 mt-1 bg-slate-900 hover:bg-red-600 disabled:opacity-25 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                        />
                        Verifying…
                      </>
                    ) : (
                      <>Sign in <ArrowIcon /></>
                    )}
                  </button>

                  {/* Sign up link */}
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    New here?{" "}
                    <Link
                      to="/signup"
                      className="text-red-600 hover:text-red-700 underline underline-offset-4 decoration-red-200 transition-colors"
                    >
                      Request access
                    </Link>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── NO ACCESS KEY SECTION ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="w-full mt-4 bg-white border border-slate-200 rounded-[1.75rem] p-5"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 text-center">
            Don't have an access key?
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Access Key Request`}
            className="group flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-100 hover:border-red-300 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-2.5 text-slate-500 group-hover:text-red-600 transition-colors">
              <MailIcon />
              <span className="text-[12px] font-black text-slate-700 group-hover:text-red-600 tracking-tight transition-colors">
                {SUPPORT_EMAIL}
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500 transition-colors shrink-0">
              Email us →
            </span>
          </a>
        </motion.div>

        {/* ── FOOTER ── */}
        <p className="mt-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
          Engineered by{" "}
          <a href="https://www.nganatech.com" className="hover:text-slate-500 transition-colors">
            Nganatech
          </a>{" "}
          · 2026
        </p>
      </motion.div>
    </div>
  );
}
