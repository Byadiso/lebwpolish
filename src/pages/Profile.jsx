import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const DAY_MS = 1000 * 60 * 60 * 24;
const ADMIN_EMAIL = "byadiso@gmail.com";

export default function Profile() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Calculate Days since account creation for Admin fallback
  const accountAgeDays = user?.metadata?.creationTime 
    ? Math.floor((new Date().getTime() - new Date(user.metadata.creationTime).getTime()) / DAY_MS)
    : 0;

  // ✅ DYNAMIC FALLBACK: If no profile exists for Admin, use actual account data
  const displayProfile = profile || (isAdmin ? {
    cityName: "Admin HQ",
    level: "All-Access",
    rank: "Grandmaster",
    streak: accountAgeDays, // Now reflects actual days since you joined
    vocabCount: 0,
    lastWrite: { toDate: () => new Date() } 
  } : null);

  if (!displayProfile) {
    return (
      <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center border border-slate-100">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-slate-800">Profil w przygotowaniu</h2>
        <p className="text-slate-500 mt-2">
          Your Polish identity is being forged...
        </p>
      </div>
    );
  }

  const lastWriteDate = displayProfile.lastWrite?.toDate?.();
  const diffDays = lastWriteDate
    ? Math.floor((new Date().getTime() - lastWriteDate.getTime()) / DAY_MS)
    : 0;

  // Logic: Streak is "Broken" if more than 24 hours have passed since last post
  const isBroken = diffDays > 1 && !isAdmin; // Admin is immune to the "Broken" UI state for testing

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      {/* Admin Quick Access Bar */}
      {isAdmin && (
        <div className="mb-4 bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔑</span>
            <div className="leading-tight">
              <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Admin Mode</p>
              <p className="text-xs font-bold">Manage Students</p>
            </div>
          </div>
          <Link to="/admin" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Dashboard
          </Link>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className={`h-32 w-full ${isBroken ? 'bg-slate-900' : 'bg-red-600'} flex items-end justify-center pb-4 relative`}>
           {isAdmin && (
             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/30">
               Chief Administrator
             </div>
           )}
           
           <div className="bg-white p-2 rounded-full shadow-lg translate-y-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
                {isBroken ? '💀' : isAdmin ? '👑' : '✍️'}
              </div>
           </div>
        </div>

        <div className="pt-16 pb-8 px-6 text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {displayProfile.cityName}
          </h2>
          
          <div className="flex justify-center gap-2 mt-2">
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
              Level {displayProfile.level}
            </span>
            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
              Rank: {displayProfile.rank || "Mieszczanin"}
            </span>
          </div>

          {/* DYNAMIC STREAK SECTION */}
          <div className={`mt-8 p-6 rounded-2xl transition-all ${
            isBroken 
            ? "bg-black text-white ring-4 ring-red-600 animate-pulse" 
            : "bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100"
          }`}>
            {isBroken ? (
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter text-red-500 italic text-center">BRUTAL ALERT!</h3>
                <p className="text-sm font-medium opacity-80 leading-snug">
                  Silence for <span className="text-red-500 text-lg font-bold">{diffDays}</span> days.
                </p>
                <Link to="/space" className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
                  Restore Streak
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Active Streak</p>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                  {displayProfile.streak ?? 0}
                  <span className="text-2xl ml-1 text-orange-500 font-bold uppercase">Days</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  {isAdmin ? "Admin Tenure" : "Keep the flame alive"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Words</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-slate-800">{displayProfile.vocabCount}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-slate-700 truncate">
                {displayProfile.rank}
              </p>
              <div className="w-full bg-slate-200 h-1 mt-3 rounded-full overflow-hidden">
                 <div className="bg-red-500 h-full w-full"></div>
              </div>
            </div>
          </div>

          <Link to="/space" className="mt-10 flex items-center justify-center gap-2 text-slate-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition-all">
            ← Back to Learning Space
          </Link>
        </div>
      </div>
    </div>
  );
}