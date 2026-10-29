import IconText from "../components/IconText";
// src/pages/Signup.jsx
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { activateStudent } from "../lib/activateStudent";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const REDIRECT_PATH = "/learn";

/* ── Error mapping ───────────────────────────────────────────────────────── */
const getSignupError = err => {
  switch (err.code) {
    case "app/invalid-key":
      return "Invalid email or access key. If you've already activated your account, log in instead.";
    case "auth/email-already-in-use":
      return "This account already exists with a different access key. Please contact the admin to reset it.";
    case "auth/weak-password":
      return "Access key must be at least 6 characters.";
    case "auth/invalid-email":
      return "That email address doesn't look right. Please check it.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
    case "unavailable":
      return "Network problem. Please check your connection and try again.";
    case "permission-denied":
      return "Activation couldn't be completed (permissions). Please contact the admin.";
    default:
      return "Something went wrong. Check your connection and try again.";
  }
};

/* ── Icons ───────────────────────────────────────────────────────────────── */
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>;
const ArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>;

/* ── Component ───────────────────────────────────────────────────────────── */
export default function Signup() {
  const [email, setEmail] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showPassword, setShowPassword] = useState(false); // reveals the access key field
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const redirectTimer = useRef(null);
  const isValidEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  // Clear pending redirect if the component unmounts
  useEffect(() => () => clearTimeout(redirectTimer.current), []);
  const copyEmail = () => {
    navigator.clipboard.writeText("nganatech@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // When user blurs the email field, reveal the access key field if the email looks valid
  const handleEmailBlur = () => {
    if (isValidEmail) setShowPassword(true);
  };
  const handleSignup = async e => {
    e.preventDefault();
    if (loading) return;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedKey = accessKey.trim();
    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    // First step ("Check my invite"): just reveal the access key field
    if (!showPassword) {
      setShowPassword(true);
      return;
    }
    if (!normalizedKey) {
      setError("Enter the access key you received.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Verifies the invite, creates the account, moves pending_users -> users
      await activateStudent(auth, db, normalizedEmail, normalizedKey);
      setSuccess(true);
      redirectTimer.current = setTimeout(() => navigate(REDIRECT_PATH, {
        replace: true
      }), 1400);
    } catch (err) {
      console.error("Activation failed:", err.code, err.message);
      setError(getSignupError(err));
    } finally {
      setLoading(false);
    }
  };
  return <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-5 py-14 overflow-hidden selection:bg-red-600 selection:text-white">

      {/* Dot grid */}
      <div className="absolute inset-0 z-0 opacity-[0.035] pointer-events-none" style={{
      backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
      backgroundSize: "36px 36px"
    }} />

      <motion.div initial={{
      opacity: 0,
      y: 18
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      ease: "easeOut"
    }} className="relative z-10 w-full max-w-md flex flex-col items-center">

        {/* ── BRAND ── */}
        <Link to="/" className="mb-10 text-center group">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase group-hover:text-slate-700 transition-colors">
            LEBW<span className="text-red-600 italic">POL</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 mt-1">
            Fluency Protocol
          </p>
        </Link>

        {/* ── MAIN CARD ── */}
        <div className="w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* Red top accent */}
          <div className="h-1 w-full bg-red-600" />

          <div className="p-8 md:p-10">

            {/* Card header */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Invite-only access
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-2">
                Activate your account
              </h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                LebwPol is invite-only. Enter your invited email address and the access key you received to activate your profile and start training.
              </p>
            </div>

            {/* ── SUCCESS STATE ── */}
            <AnimatePresence mode="wait">
              {success ? <motion.div key="success" initial={{
              opacity: 0,
              scale: 0.96
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircleIcon />
                  </div>
                  <p className="font-black text-slate-900 text-base uppercase tracking-tight">Account activated</p>
                  <p className="text-sm text-slate-400 font-medium">Taking you to your training space…</p>
                </motion.div> : (/* ── FORM ── */
            <motion.form key="form" onSubmit={handleSignup} className="flex flex-col gap-5">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Invited email address
                    </label>
                    <input type="email" autoComplete="email" placeholder="your@email.com" value={email} onChange={e => {
                  setEmail(e.target.value);
                  setError("");
                  setShowPassword(false);
                }} onBlur={handleEmailBlur} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/8 transition-all" />
                    {/* Email status indicator */}
                    <AnimatePresence>
                      {email.length > 4 && <motion.p initial={{
                    opacity: 0,
                    height: 0
                  }} animate={{
                    opacity: 1,
                    height: "auto"
                  }} exit={{
                    opacity: 0,
                    height: 0
                  }} className={`text-[10px] font-black uppercase tracking-widest px-1 ${isValidEmail ? "text-emerald-600" : "text-slate-400"}`}>
                          <IconText>{isValidEmail ? "✓ Now enter your access key" : "Enter a valid email address"}</IconText>
                        </motion.p>}
                    </AnimatePresence>
                  </div>

                  {/* Access key — reveals when the email is valid */}
                  <AnimatePresence>
                    {showPassword && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: "auto"
                }} exit={{
                  opacity: 0,
                  height: 0
                }} className="flex flex-col gap-1.5 overflow-hidden">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Access key
                        </label>
                        <input type="password" inputMode="numeric" autoComplete="off" placeholder="6-digit access key" value={accessKey} onChange={e => {
                    setAccessKey(e.target.value);
                    setError("");
                  }} required autoFocus className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/8 transition-all" />
                      </motion.div>}
                  </AnimatePresence>

                  {/* Error */}
                  <AnimatePresence>
                    {error && <motion.div initial={{
                  opacity: 0,
                  y: -4
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0
                }} className="flex items-start gap-2.5 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl" role="alert">
                        <span className="text-red-500 mt-0.5 shrink-0"><IconText>[icon:warning]</IconText></span>
                        <p className="text-[11px] font-bold text-red-700 leading-snug"><IconText>{error}</IconText></p>
                      </motion.div>}
                  </AnimatePresence>

                  {/* Submit */}
                  <button type="submit" disabled={loading || !email} className="w-full flex items-center justify-center gap-2.5 py-4 bg-slate-900 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]">
                    {loading ? <span className="flex items-center gap-2">
                        <motion.span animate={{
                    rotate: 360
                  }} transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear"
                  }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                        Activating…
                      </span> : <>
                        <IconText>{showPassword ? "Activate account" : "Check my invite"}</IconText>
                        <ArrowIcon />
                      </>}
                  </button>

                  {/* Log in link */}
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Already active?<IconText>{" "}</IconText>
                    <Link to="/login" className="text-red-600 hover:text-red-700 underline underline-offset-4 decoration-red-200 transition-colors">
                      Log in
                    </Link>
                  </p>
                </motion.form>)}
            </AnimatePresence>
          </div>
        </div>

        {/* ── NOT INVITED YET ── */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.25
      }} className="w-full mt-4 bg-white border border-slate-200 rounded-[1.75rem] p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 text-center">
            Don't have an invite?
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl w-full">
              <MailIcon />
              <span className="text-[12px] font-black text-slate-700 tracking-tight">nganatech@gmail.com</span>
            </div>
            <button onClick={copyEmail} className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95 ${copied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600"}`}>
              {copied ? <><CheckCircleIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center mt-3 leading-relaxed">
            Email us to request access. We'll add you to the invite list.
          </p>
        </motion.div>

        {/* ── FOOTER ── */}
        <p className="mt-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
          Engineered by<IconText>{" "}</IconText>
          <a href="https://www.nganatech.com" className="hover:text-slate-500 transition-colors">
            Nganatech
          </a><IconText>{" "}</IconText>
          · 2026
        </p>
      </motion.div>
    </div>;
}
