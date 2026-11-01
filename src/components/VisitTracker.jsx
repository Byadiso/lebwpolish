import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { realtimeDb } from '../firebase';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const id = () => crypto.randomUUID();
const getId = (storage, key) => { try { let v = storage.getItem(key); if (!v) { v = id(); storage.setItem(key, v); } return v; } catch { return id(); } };
const visitorId = getId(localStorage, 'lebw.analytics.visitor');
const sessionId = getId(sessionStorage, 'lebw.analytics.session');
const startedAt = Date.now();
const counters = { paths: {}, activeMs: 0 };
let lastTick = Date.now();
let active = document.visibilityState === 'visible' && document.hasFocus();
let lastSent = 0;
let writer = null;
let pending = Promise.resolve();
function tick() { const now = Date.now(); if (active) counters.activeMs += Math.max(0, Math.min(now - lastTick, 60000)); lastTick = now; }
function persist(force = false) {
  if (!writer || (!force && Date.now() - lastSent < 15000)) return;
  lastSent = Date.now();
  const { database, uid, signedInUserId } = writer;
  const payload = { visitorId, sessionId, userId: uid, signedInUserId: signedInUserId || '',
    visitorType: signedInUserId ? 'authenticated' : 'guest', startedAt, lastSeenAt: Date.now(),
    activeMs: Math.round(counters.activeMs), paths: Object.entries(counters.paths).map(([path, count]) => ({ path, count })),
    pageCount: Object.values(counters.paths).reduce((a,b) => a+b,0) };
  pending = pending.catch(() => {}).then(() => set(ref(database, `visit_sessions/${sessionId}`), payload))
    .catch(e => console.warn('Analytics write unavailable:', e.code || e.message));
}
export default function VisitTracker() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    if (!realtimeDb) return;
    const primary = getApp();
    const analyticsApp = getApps().find(a => a.name === 'lebw-analytics') || initializeApp(primary.options, 'lebw-analytics');
    const anonymousAuth = getAuth(analyticsApp);
    const analyticsDb = getDatabase(analyticsApp);
    const unsubscribe = onAuthStateChanged(anonymousAuth, async account => {
      if (!account) { try { await signInAnonymously(anonymousAuth); } catch (e) { console.warn('Guest analytics auth:', e.code); } return; }
      // The analytics instance owns session writes, preserving the primary learner login.
      writer = { database: analyticsDb, uid: account.uid, signedInUserId: user?.uid || '' };
      persist(true);
    });
    return () => { unsubscribe(); writer = null; };
  }, []);
  useEffect(() => { if (writer) writer.signedInUserId = user?.uid || ''; persist(true); }, [user?.uid]);
  useEffect(() => { counters.paths[pathname] = (counters.paths[pathname] || 0) + 1; persist(true); }, [pathname]);
  useEffect(() => {
    const change = () => { tick(); active = document.visibilityState === 'visible' && document.hasFocus(); persist(true); };
    const interval = setInterval(() => { tick(); persist(); }, 15000);
    const leave = () => { tick(); persist(true); };
    document.addEventListener('visibilitychange', change);
    window.addEventListener('focus', change);
    window.addEventListener('blur', change);
    window.addEventListener('pagehide', leave);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', change); window.removeEventListener('focus', change); window.removeEventListener('blur', change); window.removeEventListener('pagehide', leave); };
  }, []);
  return null;
}
