export const NOTES_KEY = 'lebw.notes.v1';
export function readNotes() {
  try {
    const value = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    return Array.isArray(value) ? value.filter(n => n && typeof n.id === 'string' && typeof n.text === 'string') : [];
  } catch { return []; }
}
export function writeNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  window.dispatchEvent(new Event('lebw-notes-updated'));
}
export function createNote(text, source = '') {
  const clean = text.trim();
  if (!clean) return false;
  const notes = readNotes();
  writeNotes([{ id: crypto.randomUUID(), text: clean, source, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...notes]);
  return true;
}
