export function loadLocal(key, fallback) {
  try { const value=JSON.parse(window.localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}
export function saveLocal(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
