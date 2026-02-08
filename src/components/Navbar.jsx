import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    setIsOpen(false);
    navigate('/login');
  };

  const isAdmin = user?.email === "byadiso@gmail.com";
  const displayLocation = isAdmin ? "Admin" : (user?.email || "Obywatel");

  // Helper to close menu on link click
  const closeMenu = () => setIsOpen(false);

  // Shared Link Style
  const navLinkStyle = "text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors duration-200";

  return (
    <nav className="bg-slate-900 text-white py-4 px-6 shadow-2xl sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" onClick={closeMenu} className="text-2xl font-black tracking-tighter flex items-center gap-2">
          LEBW<span className="text-red-600">POLISH</span>
          <span className="hidden xs:block text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">v2.0</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/space" className={navLinkStyle}>Writing Space</Link>
          <Link to="/practice" className={navLinkStyle}>Practice Listen</Link>
          <Link to="/grammar" className={navLinkStyle}>Practice Grammar</Link>
          
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
              {isAdmin && (
                <Link to="/admin" className="bg-red-600 hover:bg-white hover:text-red-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Admin Panel
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black group-hover:border-red-500 transition text-red-500">
                  {displayLocation.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase leading-none">Status</span>
                  <span className="text-xs font-black uppercase tracking-tighter">{displayLocation}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition text-[10px] font-black uppercase tracking-widest">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold transition">Login</Link>
          )}
        </div>

        {/* MOBILE HAMBURGER ICON */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex flex-col gap-1.5 z-[110]"
        >
          <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 bg-slate-950/95 backdrop-blur-xl lg:hidden transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 text-center p-6">
          <Link to="/space" onClick={closeMenu} className="text-2xl font-black uppercase tracking-widest">Writing Space</Link>
          <Link to="/practice" onClick={closeMenu} className="text-2xl font-black uppercase tracking-widest">Practice Listen</Link>
          <Link to="/grammar" onClick={closeMenu} className="text-2xl font-black uppercase tracking-widest">Practice Grammar</Link>
          
          <div className="w-full h-px bg-slate-800 my-4 max-w-[200px]"></div>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={closeMenu} className="text-red-500 text-lg font-black uppercase tracking-[0.2em]">Admin Console</Link>
              )}
              <Link to="/profile" onClick={closeMenu} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-xl font-black">
                  {displayLocation.charAt(0).toUpperCase()}
                </div>
                <span className="font-black uppercase tracking-widest">{displayLocation}</span>
              </Link>
              <button onClick={handleLogout} className="mt-4 text-slate-500 font-black uppercase tracking-widest border border-slate-800 px-8 py-3 rounded-2xl">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} className="bg-red-600 w-full max-w-xs py-4 rounded-2xl font-black text-xl">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}