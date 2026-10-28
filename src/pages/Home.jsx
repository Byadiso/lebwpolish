import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PathIcon = ({ type }) => {
  const icons = {
    grammar: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/>
      </svg>
    ),
    shadow: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
    ),
    vault: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="3" x2="7" y1="7" y2="7"/><line x1="17" x2="21" y1="17" y2="17"/>
      </svg>
    ),
    zap: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

const learningPaths = [
  {
    name: "Grammar Labs",
    path: "/grammar",
    type: "grammar",
    tag: "Structure",
    desc: "Internalize Polish cases, verb forms, and sentence patterns through targeted writing drills — no charts required.",
    accentColor: "group-hover:border-blue-400",
    tagColor: "text-blue-600 bg-blue-50",
  },
  {
    name: "Shadow Protocol",
    path: "/shadow-protocol",
    type: "shadow",
    tag: "Audio",
    desc: "Repeat after native speakers in real time. Close the gap between what you read and what you actually hear.",
    accentColor: "group-hover:border-red-500",
    tagColor: "text-red-600 bg-red-50",
  },
  {
    name: "Vocabulary Vault",
    path: "/vocabularyvault",
    type: "vault",
    tag: "Memory",
    desc: "Build an active word bank through spaced repetition and contextual sentences — not isolated flashcards.",
    accentColor: "group-hover:border-slate-500",
    tagColor: "text-slate-600 bg-slate-100",
  },
  {
    name: "Simplified Polish",
    path: "/polish-simplified",
    type: "zap",
    tag: "Speed",
    desc: "The fastest path to conversational Polish. Core phrases, everyday structures, and zero fluff.",
    accentColor: "group-hover:border-amber-400",
    tagColor: "text-amber-700 bg-amber-50",
  },
];

const howItWorks = [
  {
    n: "01",
    title: "Translate & Type",
    desc: "Every session gives you English sentences. You produce the Polish — no word banks, no multiple choice.",
  },
  {
    n: "02",
    title: "Hear Native Audio",
    desc: "Every drill includes real Polish pronunciation. Shadow it, slow it down, or listen on repeat.",
  },
  {
    n: "03",
    title: "Track Your Streak",
    desc: "XP and streak counters keep you accountable. Watch your level climb as your output gets sharper.",
  },
  {
    n: "04",
    title: "Unlock Deeper Modules",
    desc: "Sign up for access to Polish music breakdowns, daily writing feedback, and advanced immersion tools.",
  },
];

export default function Home() {
  const { user, profile } = useAuth();
  const [showBriefing, setShowBriefing] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-[#fafafa] selection:bg-red-600 selection:text-white overflow-x-hidden">

      {/* Dot grid background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "36px 36px" }}
      />

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-5 z-50 left-1/2 -translate-x-1/2 flex items-center gap-5 px-6 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm"
      >
        <span className="font-black text-slate-900 tracking-tighter text-sm">LEBW<span className="text-red-600">POL</span></span>
        <div className="w-px h-4 bg-slate-200" />
        {user ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Streak {profile?.streak || 0}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lvl {profile?.level || 1}</span>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowBriefing(true)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              How it works
            </button>
            <Link
              to="/signup"
              className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 px-4 py-1.5 rounded-full hover:bg-red-600 transition-colors"
            >
              Start free
            </Link>
          </>
        )}
      </motion.nav>

      {/* ── HERO ── */}
      <main className="relative z-10 w-full max-w-6xl px-6 pt-32 md:pt-44 pb-16 text-center">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[9px] font-black tracking-[0.3em] text-red-600 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Writing · Listening · Mastery
          </span>
        </motion.div>

        {/* Headline — explains the product directly */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-5xl sm:text-7xl md:text-[8rem] font-black text-slate-900 tracking-tighter leading-[0.85] mb-6"
        >
          Learn Polish<br />
          <span className="text-red-600 italic">by doing.</span>
        </motion.h1>

        {/* Sub — what the product actually is */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto mb-4 leading-relaxed font-medium"
        >
          {user ? (
            <>
              Welcome back,{" "}
              <span className="text-slate-900 font-bold italic">{profile?.cityName || "Operator"}</span>.
              Your Immersion Protocol is live.
            </>
          ) : (
            <>
              LebwPol is an active-output trainer. You read English, you produce Polish — then hear it spoken by a
              native voice. No passive review. No word banks. Just the discipline of
              actually making the language.
            </>
          )}
        </motion.p>

        {/* Social proof micro-line */}
        {!user && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12"
          >
            Free to start · No credit card
          </motion.p>
        )}

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-20"
        >
          <Link
            to="/space"
            className="group bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
          >
            {user ? "Resume Training" : "Start practicing — free"}
            <span className="group-hover:translate-x-1.5 transition-transform">→</span>
          </Link>
          {!user && (
            <button
              onClick={() => setShowBriefing(true)}
              className="bg-white border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-red-500 hover:text-red-600 transition-all"
            >
              See how it works
            </button>
          )}
        </motion.div>

        {/* ── HOW IT WORKS (inline — visible without clicking) ── */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-[2rem] overflow-hidden border border-slate-200 mb-20 shadow-sm"
          >
            {howItWorks.map((step, i) => (
              <div
                key={step.n}
                className="bg-white p-6 md:p-8 text-left group hover:bg-slate-900 transition-colors duration-300"
              >
                <div className="text-red-600 font-black text-xl italic mb-4 group-hover:text-red-400 transition-colors">
                  {step.n}.
                </div>
                <h4 className="font-black text-[11px] uppercase tracking-widest text-slate-900 mb-2 group-hover:text-white transition-colors">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                  {step.desc}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── LEARNING PATHS ── */}
        <div className="text-left mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Training Modules</h2>
          <p className="text-lg font-black text-slate-900 tracking-tight">Pick your starting point</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20"
        >
          {learningPaths.map((item, i) => (
            <Link
              key={item.name}
              to={item.path}
              className={`group bg-white border-2 border-slate-100 p-7 rounded-[1.75rem] text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${item.accentColor}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 transition-colors">
                  <PathIcon type={item.type} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2 tracking-tight group-hover:text-red-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-5">
                {item.desc}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                Enter Module
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </main>

      {/* ── MEMBER UNLOCK SECTION ── */}
      {!user && (
        <section className="relative z-10 w-full max-w-6xl px-6 pb-24">
          <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
            {/* Red glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/15 blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-10 md:gap-16 items-start">
              <div className="flex-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500 mb-4 block">
                  Members only
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight mb-5">
                  Go deeper with<br />
                  <span className="text-red-500 italic">full immersion.</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-7 max-w-sm">
                  Free access opens the core modules. An account unlocks Polish music breakdowns, daily writing
                  feedback, and your personal XP profile — everything that keeps you accountable over time.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 bg-red-600 text-white px-7 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95"
                >
                  Create free account <span>→</span>
                </Link>
              </div>

              <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                {[
                  {
                    title: "Liryczna Symfonia",
                    desc: "Learn grammar and slang through Polish music. Every song is a lesson in rhythm, vocabulary, and culture.",
                  },
                  {
                    title: "Muscle Memory Forge",
                    desc: "Daily writing challenges that force your brain to recall and produce — the only way to build true fluency.",
                  },
                  {
                    title: "XP Profile & Streak Tracking",
                    desc: "See your progress over time. Every drill, every streak, every rank — all saved to your account.",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="flex gap-4 items-start bg-white/5 border border-white/8 p-5 rounded-2xl backdrop-blur-sm"
                  >
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <h4 className="text-white font-black text-[11px] uppercase tracking-widest mb-1">{f.title}</h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST BAR ── */}
      <div className="w-full border-y border-slate-100 bg-white py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            "Free practice space",
            "Native Polish audio",
            "Real-time XP tracking",
            "No passive review",
          ].map((text) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center text-[8px] font-black">✓</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="py-10 w-full bg-[#fafafa] flex flex-col items-center gap-3">
        <span className="font-black text-slate-900 tracking-tighter text-lg">LEBW<span className="text-red-600">POL</span></span>
        <p className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-400">
          Engineered by{" "}
          <a href="https://www.nganatech.com" className="text-slate-600 hover:text-red-600 transition-colors">
            Nganatech
          </a>{" "}
          · 2026
        </p>
      </footer>

      {/* ── HOW IT WORKS MODAL ── */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md"
            onClick={() => setShowBriefing(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 rounded-t-[2.5rem]" />

              <button
                onClick={() => setShowBriefing(false)}
                className="absolute top-7 right-8 text-[10px] font-black tracking-widest text-slate-400 hover:text-red-600 transition-colors"
              >
                CLOSE ✕
              </button>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                How LebwPol works
              </h2>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                Most language apps let you passively tap through content. LebwPol forces you to produce — because that's the only way fluency actually happens.
              </p>

              <div className="space-y-5 mb-10">
                {howItWorks.map((step) => (
                  <div key={step.n} className="flex gap-4 text-left">
                    <span className="text-red-600 font-black text-lg italic shrink-0 w-8">{step.n}.</span>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">{step.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/space"
                  onClick={() => setShowBriefing(false)}
                  className="flex-1 bg-slate-900 text-white text-center py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all"
                >
                  Try it free
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setShowBriefing(false)}
                  className="flex-1 bg-white border-2 border-slate-200 text-slate-700 text-center py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:border-red-500 hover:text-red-600 transition-all"
                >
                  Create account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
