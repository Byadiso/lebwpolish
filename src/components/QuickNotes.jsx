import FeatureIcon from './FeatureIcon';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createNote } from '../lib/notes';
import './QuickNotes.css';

export default function QuickNotes() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { setOpen(false); setSaved(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);
  if (pathname === '/' || pathname === '/notes') return null;
  const save = e => {
    e.preventDefault();
    try {
      if (createNote(draft, pathname)) { setDraft(''); setSaved(true); setTimeout(() => setSaved(false), 2200); }
    } catch { setSaved(false); alert('Could not save your note. Please check your browser storage.'); }
  };
  return <div className="lebw-quicknotes">
    {open && <section className="lebw-quicknotes-panel" aria-label="Quick notes">
      <div className="lebw-quicknotes-head"><div><strong>Quick note</strong><small>Capture it now, revisit it later.</small></div><button type="button" aria-label="Close notes" onClick={() => setOpen(false)}><FeatureIcon name="close" size={18} /></button></div>
      <form onSubmit={save}>
        <label htmlFor="lebw-note-draft">What would you like to remember?</label>
        <textarea id="lebw-note-draft" ref={inputRef} maxLength={4000} rows={5} value={draft} onChange={e => { setDraft(e.target.value); setSaved(false); }} placeholder="A new Polish phrase, grammar tip, or question…" />
        <div className="lebw-quicknotes-actions"><Link to="/notes">View all notes →</Link><button type="submit" disabled={!draft.trim()}>Save note</button></div>
        {saved && <p className="lebw-quicknotes-saved" role="status"><FeatureIcon name="check" size={16} /> Note saved on this device</p>}
      </form>
    </section>}
    <button className="lebw-quicknotes-trigger" type="button" aria-label={open ? 'Close quick notes' : 'Open quick notes'} aria-expanded={open} onClick={() => setOpen(v => !v)}><FeatureIcon name="note" size={19} /><span>Notes</span></button>
  </div>;
}
