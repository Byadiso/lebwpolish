import { useEffect, useRef } from 'react';
import './SiteFooter.css';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = footer.getBoundingClientRect();
        // Lift both fixed controls ABOVE the footer as it enters the viewport.
        // Do not shift the footer itself or alter the controls' appearance.
        const visibleFooter = Math.max(0, Math.min(rect.height, window.innerHeight - rect.top));
        document.documentElement.style.setProperty(
          '--lebw-footer-lift',
          `${Math.ceil(visibleFooter > 0 ? visibleFooter + 12 : 0)}px`
        );
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(footer);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
      document.documentElement.style.removeProperty('--lebw-footer-lift');
    };
  }, []);

  return <footer ref={footerRef} className="lebw-site-footer border-t border-slate-200 bg-[#fafafa] px-6 py-8" aria-label="Site footer"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"><Link to="/" className="text-sm font-black tracking-tight text-slate-900">LEBW<span className="text-red-600">POL</span></Link><div className="flex flex-wrap items-center justify-center gap-5"><Link to="/privacy" className="text-xs font-semibold text-slate-500 transition-colors hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">Privacy Policy</Link><span className="text-xs text-slate-400">© 2026 LEBWPOLISH</span></div></div></footer>;
}
