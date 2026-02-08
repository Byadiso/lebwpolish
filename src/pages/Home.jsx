import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-12 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      
      {/* Dynamic Background Accents */}
      <div className="absolute -top-24 -left-24 w-64 h-64 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 md:w-[30rem] md:h-[30rem] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating Status Badge (Mobile Optimized) */}
      {user && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-8 md:top-24 bg-white/80 backdrop-blur-md shadow-xl border border-red-100 px-4 py-2 rounded-full text-[10px] md:text-sm font-black text-red-600 flex items-center gap-2 z-20"
        >
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          STREAK: {profile?.streak || 0} DAYS {profile?.streak > 0 ? '🔥' : '💀'}
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center max-w-4xl">
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl sm:text-7xl md:text-[10rem] font-black text-slate-900 mb-4 md:mb-6 tracking-[ -0.05em] leading-none"
        >
          LEBW<span className="text-red-600">POL</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-xl md:text-2xl text-slate-600 max-w-2xl mb-10 md:mb-12 leading-snug md:leading-relaxed font-medium"
        >
          {user ? (
            <span className="px-2">
              Witaj z powrotem, <span className="text-red-600 font-black italic">{profile?.cityName || "Obywatelu"}</span>. 
              Don't let your <span className="underline decoration-red-500 decoration-2 underline-offset-4">Polish engine</span> stall.
            </span>
          ) : (
            <span className="px-2">
              Learn by <span className="text-red-600 font-black uppercase italic">writing</span>. 
              A level-based space built for consistency. 
              Write every day, or face the <span className="font-black text-slate-900">brutal truth</span>.
            </span>
          )}
        </motion.p>

        {/* Dynamic Action Grid */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto px-6 sm:px-0"
        >
          <Link
            to="/space"
            className="group relative bg-slate-900 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg shadow-2xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
          >
            ENTER SPACE
            {user && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-tighter">
                {profile?.level}
              </span>
            )}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {user ? (
            <Link
              to="/profile"
              className="bg-white border-2 border-slate-200 text-slate-700 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg shadow-sm hover:border-red-600 hover:text-red-600 transition-all duration-300 text-center active:scale-95"
            >
              MY PROGRESS
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-white border-2 border-slate-200 text-slate-700 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg shadow-sm hover:border-red-600 hover:text-red-600 transition-all duration-300 text-center active:scale-95"
            >
              MEMBER LOGIN
            </Link>
          )}
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 md:bottom-12 flex flex-col items-center gap-3 opacity-60">
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400">
          Warszawa • Kraków • Wrocław
        </p>
      </div>
    </div>
  );
}