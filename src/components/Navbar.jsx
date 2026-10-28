import IconText from "./IconText";
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import AppIcon from './AppIcon';
import './Navbar.css';
const links = [['/learn', 'compass', 'Daily Journey'], ['/explore', 'search', 'Explore'], ['/play', 'game', 'Play'], ['/learn?tab=b1', 'target', 'B1 path']];
export default function Navbar() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActivePath = path => path.includes('?') ? location.pathname === '/learn' && location.search.includes('tab=b1') : location.pathname === path && !(path === '/learn' && location.search.includes('tab=b1'));
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  function close() {
    setOpen(false);
  }
  async function logout() {
    try {
      await auth?.signOut();
      close();
      navigate('/learn');
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }
  return <><a className="app-skip" href="#app-content">Skip to content</a><header className="app-nav"><div className="app-nav-inner"><Link className="app-brand" to="/" onClick={close}>LEBW<span>POLISH</span><small>LEARN BY DOING</small></Link><nav className="app-nav-desktop" aria-label="Main navigation">{links.map(([path, icon, label]) => <Link key={path} to={path} aria-current={isActivePath(path) ? "page" : undefined} className={`app-nav-link ${isActivePath(path) ? "active" : ""}`}><AppIcon name={icon} /><IconText>{label}</IconText></Link>)}</nav><div className="app-nav-account">{user ? <><Link to="/profile" aria-label="Your profile" className="app-profile"><AppIcon name="user" /></Link>{user.email === 'byadiso@gmail.com' && <Link to="/admin" className="app-nav-link">Admin</Link>}<button className="app-signout" onClick={logout}>Sign out</button></> : <Link className="app-login" to="/login">Sign in</Link>}<button className="app-menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="app-mobile-nav" onClick={() => setOpen(!open)}><AppIcon name={open ? 'close' : 'menu'} size={24} /></button></div></div>{open && <nav id="app-mobile-nav" className="app-mobile-nav" aria-label="Mobile navigation" onKeyDown={e => {
        if (e.key === 'Escape') close();
      }}>{links.map(([path, icon, label]) => <Link key={path} to={path} onClick={close}><AppIcon name={icon} /><IconText>{label}</IconText></Link>)}<Link to="/space" onClick={close}><AppIcon name="users" />Community writing</Link>{user && <Link to="/profile" onClick={close}><AppIcon name="user" />My profile</Link>}</nav>}{error && <p role="alert"><IconText>{error}</IconText></p>}</header></>;
}
