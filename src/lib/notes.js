export const NOTES_KEY = 'lebw.notes.v1';
export function readNotes() {
  try {
    const value = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, 200).filter(n => n && typeof n.id === 'string' && typeof n.text === 'string').map(n => ({ ...n, text: n.text.slice(0, 5000) })) : [];
  } catch { return []; }
}
export function writeNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes.slice(0, 200)));
    window.dispatchEvent(new Event('lebw-notes-updated'));
    return true;
  } catch { return false; }
}
export function createNote(text, source = '') {
  const clean = typeof text === 'string' ? text.trim().slice(0, 5000) : '';
  if (!clean) return false;
  const notes = readNotes();
  return writeNotes([{ id: crypto.randomUUID(), text: clean, source: String(source).slice(0, 150), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...notes]);
}
