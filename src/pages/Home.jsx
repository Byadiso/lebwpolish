import { useLayoutEffect, useRef } from 'react';
import HomeGuide from '../components/HomeGuide';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const endRef = useRef(null);
  useLayoutEffect(() => {
    const end = endRef.current;
    if (!end) return;
    let frame = 0;
    const root = document.documentElement;
    const measure = () => {
      const rect = end.getBoundingClientRect();
      const lift = Math.max(0, window.innerHeight - rect.top);
      root.style.setProperty('--lebw-footer-lift', `${Math.ceil(lift)}px`);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(end);
    observer?.observe(end.parentElement);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
      root.style.removeProperty('--lebw-footer-lift');
    };
  }, [user]);
  return (
    <div className="home-refined min-h-screen bg-[#fafafa] text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <header className="home-intro">
          <h1>Learn Polish <span>by doing.</span></h1>
          <p>Build everyday confidence and prepare for B1 with practical Polish exercises.</p>
          {user && <Link className="home-continue" to="/learn">Continue your daily journey <span aria-hidden="true">→</span></Link>}
        </header>
        <HomeGuide />
      </main>
      <div ref={endRef} className="home-end">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {!user && <section className="home-account" aria-label="Create an account">
          <div><h2>Keep your progress.</h2><p>Create a free account to save your learning progress.</p></div>
          <Link to="/signup">Create account <span aria-hidden="true">→</span></Link>
        </section>}
        </div>
      <footer className="home-footer">
        <span>© 2026 LEBWPOL </span>
        <Link to="/privacy">Privacy Policy</Link>
      </footer>
      </div>
    </div>
  );
}
