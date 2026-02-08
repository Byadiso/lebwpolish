import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export default function Navbar() {
  const { user, profile } = useAuth();

  return (
    <nav className="bg-red-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tighter">LEBW POLISH</Link>
        <div className="space-x-4 flex items-center">
          <Link to="/space" className="hover:underline">Learning Space</Link>
          {user ? (
            <>
              <Link to="/profile" className="bg-white text-red-600 px-3 py-1 rounded-full font-bold">
                {profile?.cityName || 'Obywatel'}
              </Link>
              {profile?.role === 'admin' && <Link to="/admin" className="text-yellow-300">Admin</Link>}
              <button onClick={() => auth.signOut()} className="text-sm opacity-80">Logout</button>
            </>
          ) : (
            <Link to="/login" className="border border-white px-4 py-1 rounded">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}