// src/components/EnrollmentGuard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Icons remain the same (LockIcon, BookIcon, MicIcon, ZapIcon, VaultIcon)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
);
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const VaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="3" x2="7" y1="7" y2="7"/><line x1="3" x2="7" y1="17" y2="17"/><line x1="17" x2="21" y1="7" y2="7"/><line x1="17" x2="21" y1="17" y2="17"/></svg>
);

export default function EnrollmentGuard({ children, user, featureName = "module" }) {
  if (user) return children;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#fafafa] px-6 py-12 md:py-20">
      
      {/* 1. PRIMARY ACTION: OPEN ACCESS (Now at the top) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mb-12"
      >
        <div className="text-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Available Now</h2>
          <p className="text-slate-900 font-bold text-lg">Start training with our Open Access Labs</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'Grammar', path: '/grammar', icon: <BookIcon />, desc: 'Core structures' },
            { name: 'Shadowing', path: '/shadow-protocol', icon: <MicIcon />, desc: 'Pronunciation' },
            { name: 'Vocabulary', path: '/vocabularyvault', icon: <VaultIcon />, desc: 'Word storage' },
            { name: 'Simplified', path: '/polish-simplified', icon: <ZapIcon />, desc: 'Speed learning' }
          ].map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className="flex items-center gap-4 bg-white border border-slate-200 p-5 rounded-[1.5rem] hover:border-red-500 hover:shadow-xl hover:shadow-red-500/5 transition-all group"
            >
              <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 transition-colors">
                {item.icon}
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-900">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* 2. SECONDARY ACTION: THE PREMIUM UPGRADE (The "Guard") */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xl bg-white border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-400"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-6">
          <LockIcon />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Reserved Area</span>
        </div>

        <div className="space-y-4 mb-10">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
            Unlock Full <br />
            <span className="text-red-600 italic">Persistence</span>
          </h3>
          
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            The <span className="text-slate-900 font-bold">{featureName}</span> requires a verified profile to save XP and track your long-term fluency streaks.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xs mx-auto mb-8">
          <Link 
            to="/signup" 
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Claim Invitation
          </Link>
          
          <Link to="/login" className="group">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-red-600 transition-colors">
              Already Member? <span className="underline underline-offset-4 decoration-slate-200">Log in</span>
            </span>
          </Link>
        </div>

        {/* Premium Benefits Row */}
        <div className="pt-8 border-t border-slate-50 flex justify-around">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Vault</p>
            <p className="text-[11px] font-bold text-slate-900 uppercase">XP Core</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-100"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Metrics</p>
            <p className="text-[11px] font-bold text-slate-900 uppercase">Streaks</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-100"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Rank</p>
            <p className="text-[11px] font-bold text-slate-900 uppercase">Badges</p>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-12 text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">
        Nganatech Managed Environment • 2026
      </p>
    </div>
  );
}