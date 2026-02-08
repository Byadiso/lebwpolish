import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  // Define admin check
  const isAdmin = user?.email === "byadiso@gmail.com";

  // Priority: Admin Label -> Profile cityName -> Default fallback
  const displayLocation = isAdmin ? "Admin" : (user?.email || "Obywatel");

  console.log(displayLocation)

  return (
    <nav className="bg-slate-900 text-white py-4 px-6 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          LEBW<span className="text-red-600">POLISH</span>
          <span className="hidden md:block text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">v2.0</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/space" className="text-sm font-bold uppercase tracking-widest hover:text-red-500 transition">Writing Space</Link>
          <Link to="/practice" className="text-sm font-bold uppercase tracking-widest hover:text-red-500 transition">Practice Listen</Link>
          <Link to="/grammar" className="text-sm font-bold uppercase tracking-widest hover:text-red-500 transition">Practice Grammar</Link>
          {user ? (
            <div className="flex items-center gap-4">
              {/* Admin Panel Button */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="bg-red-600 hover:bg-white hover:text-red-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20"
                >
                  Admin Panel
                </Link>
              )}

              {/* Profile / City Display */}
              <Link 
                to="/profile" 
                className="flex items-center gap-2 group border-l border-slate-700 pl-4"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black group-hover:border-red-500 transition text-red-500">
                  {displayLocation.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="hidden sm:block text-[10px] font-black text-slate-500 uppercase leading-none">Lokalizacja</span>
                  <span className="hidden sm:block text-xs font-black uppercase tracking-tighter">
                    {displayLocation}
                  </span>
                </div>
              </Link>

              <button 
                onClick={handleLogout} 
                className="ml-2 text-slate-500 hover:text-red-500 transition text-[10px] font-black uppercase tracking-widest"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-2xl font-bold transition shadow-lg shadow-red-900/20"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}