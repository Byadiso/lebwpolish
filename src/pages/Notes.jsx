import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createNote, readNotes, writeNotes } from '../lib/notes';
import './Notes.css';

export default function Notes() {
  const [notes, setNotes] = useState(readNotes);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { const update = () => setNotes(readNotes()); window.addEventListener('lebw-notes-updated', update); window.addEventListener('storage', update); return () => { window.removeEventListener('lebw-notes-updated', update); window.removeEventListener('storage', update); }; }, []);
  const visible = useMemo(() => notes.filter(n => n.text.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [notes, search]);
  const update = next => { try { writeNotes(next); setNotes(next); setError(''); } catch { setError('Could not save changes. Check your browser storage.'); } };
  const add = e => { e.preventDefault(); try { if (createNote(draft)) { setDraft(''); setNotes(readNotes()); setError(''); } } catch { setError('Could not save your note. Check your browser storage.'); } };
  const remove = id => { if (window.confirm('Delete this note? This cannot be undone.')) update(notes.filter(n => n.id !== id)); };
  const saveEdit = id => { if (!editText.trim()) return; update(notes.map(n => n.id === id ? { ...n, text: editText.trim(), updatedAt: new Date().toISOString() } : n)); setEditing(null); };
  return <main className="lebw-notes-page"><div className="lebw-notes-container">
    <div className="lebw-notes-eyebrow">YOUR LEARNING SPACE</div><h1>My notes<span>.</span></h1><p className="lebw-notes-intro">Keep new Polish words, useful phrases, and little discoveries in one place. Pick up where you left off.</p>
    <div className="lebw-notes-layout"><section className="lebw-notes-compose"><h2>Capture a thought</h2><form onSubmit={add}><label htmlFor="new-note">Your note</label><textarea id="new-note" rows={5} maxLength={4000} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Dzisiaj nauczyłem się…" /><button disabled={!draft.trim()} type="submit">+ Save note</button></form><p>Saved in this browser on this device. Notes aren't synced to your account.</p></section>
    <section className="lebw-notes-collection" aria-label="Saved notes"><div className="lebw-notes-listhead"><div><h2>Saved notes</h2><span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span></div><input aria-label="Search notes" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…" /></div>
    {error && <p className="lebw-notes-error" role="alert">{error}</p>}
    {visible.length === 0 ? <div className="lebw-notes-empty"><div aria-hidden="true">✎</div><h3>{search ? 'No matching notes' : 'Your notebook starts here'}</h3><p>{search ? 'Try another search term.' : 'Save your first note while studying, or write one here.'}</p>{search && <button type="button" onClick={() => setSearch('')}>Clear search</button>}</div> : <div className="lebw-notes-cards">{visible.map(n => <article className="lebw-note-card" key={n.id}><div className="lebw-note-meta"><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })}</time>{n.source && <Link to={n.source}>From {n.source}</Link>}</div>{editing === n.id ? <div className="lebw-note-edit"><textarea aria-label="Edit note" maxLength={4000} rows={5} value={editText} onChange={e => setEditText(e.target.value)} /><div><button disabled={!editText.trim()} onClick={() => saveEdit(n.id)}>Save changes</button><button className="secondary" onClick={() => setEditing(null)}>Cancel</button></div></div> : <><p className="lebw-note-text">{n.text}</p><div className="lebw-note-actions"><button onClick={() => { setEditing(n.id); setEditText(n.text); }}>Edit</button><button className="danger" onClick={() => remove(n.id)}>Delete</button></div></>}</article>)}</div>}
    </section></div></div></main>;
}
