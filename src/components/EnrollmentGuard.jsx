// src/components/EnrollmentGuard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* ── Icons ───────────────────────────────────────────────────────────────── */
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
    <path d="M8 7h6"/><path d="M8 11h8"/>
  </svg>
);
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const VaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="3" x2="7" y1="7" y2="7"/>
    <line x1="17" x2="21" y1="17" y2="17"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────────────── */
const OPEN_MODULES = [
  { name: "Grammar Labs",    path: "/grammar",          icon: <BookIcon />, desc: "Drill Polish structures through active writing" },
  { name: "Shadow Protocol", path: "/shadow-protocol",  icon: <MicIcon />,  desc: "Repeat after native speakers, sharpen your ear" },
  { name: "Vocab Vault",     path: "/vocabularyvault",  icon: <VaultIcon />, desc: "Build an active word bank in context" },
  { name: "Simplified Polish", path: "/polish-simplified", icon: <ZapIcon />, desc: "Core phrases and structures — fast track" },
];

const MEMBER_BENEFITS = [
  "Your XP and streak saved permanently",
  "Personal rank profile and level badges",
  "Polish music breakdowns (Liryczna Symfonia)",
  "Daily writing challenges with feedback",
];

/* ── Component ───────────────────────────────────────────────────────────── */
export default function EnrollmentGuard({ children, user, featureName = "this module" }) {
  if (user) return children;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#fafafa] selection:bg-red-600 selection:text-white overflow-x-hidden">

      {/* Dot-grid background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "36px 36px" }}
      />

      <div className="relative z-10 w-full max-w-2xl px-5 py-14 md:py-20 flex flex-col gap-6">

        {/* ── TOP LABEL ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link
            to="/"
            className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 hover:text-slate-600 transition-colors mb-6 inline-block"
          >
            ← Back to home
          </Link>

          {/* Feature name badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
              {featureName}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-3">
            Sign in to save your progress
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            You can practice for free right now. Create a free account to keep your XP, streaks, and rank between sessions.
          </p>
        </motion.div>

        {/* ── SIGN UP CARD (primary action — prominent) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]"
        >
          {/* Red top bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 rounded-t-[2rem]" />
          {/* Subtle red glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">

            {/* Left: benefits */}
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-red-500 mb-3">
                Free account includes
              </p>
              <ul className="space-y-2.5">
                {MEMBER_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="text-[12px] text-slate-300 font-medium leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTAs */}
            <div className="flex flex-col gap-3 w-full md:w-48 shrink-0">
              <Link
                to="/signup"
                className="w-full bg-red-600 hover:bg-red-500 text-white text-center py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.25em] transition-all shadow-[0_8px_24px_rgba(220,38,38,0.35)] active:scale-95"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white text-center py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.25em] transition-all"
              >
                Log in
              </Link>
              <p className="text-[9px] text-slate-600 text-center font-medium">
                No credit card required
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── DIVIDER ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 shrink-0">
            Or practice without an account
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </motion.div>

        {/* ── OPEN ACCESS MODULES ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 text-center">
            Free modules — no account needed
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OPEN_MODULES.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="group flex items-center gap-4 bg-white border-2 border-slate-100 hover:border-red-500 p-5 rounded-[1.5rem] transition-all duration-250 hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-red-50 border border-slate-100 group-hover:border-red-100 flex items-center justify-center text-slate-400 group-hover:text-red-600 transition-colors shrink-0">
                  {item.icon}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-0.5 group-hover:text-red-600 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-snug truncate">
                    {item.desc}
                  </p>
                </div>
                <span className="ml-auto text-slate-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all text-sm font-bold shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* Nudge — without an account, nothing is saved */}
          <p className="text-center text-[10px] text-slate-400 font-medium mt-4 leading-relaxed">
            Progress won't be saved.{" "}
            <Link to="/signup" className="text-red-600 font-black hover:underline underline-offset-2">
              Create a free account
            </Link>{" "}
            to keep it.
          </p>
        </motion.div>

        {/* ── FOOTER ── */}
        <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 mt-4">
          Nganatech Managed Environment · 2026
        </p>
      </div>
    </div>
  );
}
