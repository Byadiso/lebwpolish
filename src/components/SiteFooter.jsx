import { Link } from 'react-router-dom';
export default function SiteFooter() {
  return <footer className="border-t border-slate-200 bg-[#fafafa] px-6 py-8" aria-label="Site footer"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"><Link to="/" className="text-sm font-black tracking-tight text-slate-900">LEBW<span className="text-red-600">POL</span></Link><div className="flex flex-wrap items-center justify-center gap-5"><Link to="/privacy" className="text-xs font-semibold text-slate-500 transition-colors hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600">Privacy Policy</Link><span className="text-xs text-slate-400">© 2026 LEBWPOLISH</span></div></div></footer>;
}
