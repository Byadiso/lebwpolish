import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 bg-gradient-to-br from-red-50 via-white to-blue-50 overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-red-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl animate-pulse"></div>

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter">
          LEBW<span className="text-red-600">POLISH</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
          {user ? (
            <>
              Witaj z powrotem, <span className="text-red-600 font-bold">{profile?.cityName || "Obywatelu"}</span>! 
              Ready to maintain your <span className="underline decoration-red-500">{profile?.streak || 0} day streak</span>?
            </>
          ) : (
            <>
              Learn by <span className="text-red-600 font-bold">writing</span>. 
              Join a level-based space and build your vocabulary with a community. 
              Stay consistent, or face the <span className="font-bold text-red-600 italic">brutal truth</span>.
            </>
          )}
        </p>

        {/* Dynamic Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/space"
            className="group relative bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:bg-red-600 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Enter Writing Space {user && <span className="text-sm bg-white/20 px-2 py-0.5 rounded uppercase tracking-tighter">{profile?.level}</span>}
            </span>
          </Link>

          {user ? (
            <Link
              to="/profile"
              className="bg-white border-2 border-slate-200 text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-sm hover:border-red-600 hover:text-red-600 transition-all duration-300"
            >
              Moje Postępy (My Progress)
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-white border-2 border-slate-200 text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-sm hover:border-red-600 hover:text-red-600 transition-all duration-300"
            >
              Member Login
            </Link>
          )}
        </div>
      </div>

      {/* Floating Status Indicator */}
      {user && (
        <div className="absolute top-24 animate-bounce bg-white shadow-lg border border-red-100 px-4 py-2 rounded-full text-sm font-bold text-red-600 flex items-center gap-2">
          <span>🔥</span> Your Polish is currently {profile?.streak > 0 ? 'Active' : 'at risk'}
        </div>
      )}

      {/* Footer Animation */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
          Cześć! Let's start writing.
        </p>
      </div>
    </div>
  );
}