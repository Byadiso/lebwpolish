import { useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { Link } from 'react-router-dom';
import { realtimeDb, auth } from '../firebase';

const fmt = ms => `${Math.floor(ms / 60000)}m ${Math.floor(ms % 60000 / 1000)}s`;
const dates = [{ label: '7 days', days: 7 }, { label: '30 days', days: 30 }, { label: 'All time', days: 0 }];
export default function Statistics() {
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { await auth.authStateReady(); if (!auth.currentUser) throw new Error('Sign in as administrator first'); const snap = await get(ref(realtimeDb, 'visit_sessions')); setSessions(snap.exists() ? Object.values(snap.val()) : []); }
    catch (err) { setError(`Unable to read statistics (${err.code || err.message}). Check Realtime Database rules.`); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const data = useMemo(() => {
    const cutoff = period ? Date.now() - period * 86400000 : 0;
    const selected = sessions.filter(s => s.startedAt >= cutoff);
    const visitors = new Set(selected.map(s => s.visitorId));
    const signedIn = new Set(selected.filter(s => s.signedInUserId).map(s => s.signedInUserId));
    const guests = selected.filter(s => !s.signedInUserId).length; const loggedIn = selected.length - guests; const paths = {};
    selected.forEach(s => {
      const entries = Array.isArray(s.paths) ? s.paths.map(item => [item.path, item.count]) : Object.entries(s.paths || {});
      entries.forEach(([path, count]) => { if (typeof path === 'string' && Number.isFinite(Number(count))) paths[path] = (paths[path] || 0) + Number(count); });
    });
    const total = selected.reduce((sum,s) => sum + (s.activeMs || 0), 0);
    const days = {};
    selected.forEach(s => { const day = new Date(s.startedAt).toLocaleDateString('en-CA'); days[day] = (days[day] || 0) + 1; });
    return { sessions: selected.length, visitors: visitors.size, signedIn: signedIn.size, guests, loggedIn, total, avg: selected.length ? total / selected.length : 0, pageviews: Object.values(paths).reduce((a,b)=>a+b,0), paths: Object.entries(paths).sort((a,b)=>b[1]-a[1]), days: Object.entries(days).sort((a,b)=>a[0].localeCompare(b[0])) };
  }, [sessions, period]);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-10 text-slate-900 font-sans"><div className="max-w-7xl mx-auto space-y-7">
    <header className="flex flex-wrap justify-between items-center gap-4"><div><Link to="/admin" className="text-sm font-bold text-indigo-600">← Admin dashboard</Link><h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2">SITE <span className="text-indigo-600">STATISTICS</span></h1><p className="text-slate-500 mt-2">Visits and active learning time, collected in Firebase Realtime Database.</p></div><button onClick={load} disabled={loading} className="rounded-xl bg-slate-900 text-white px-5 py-3 font-bold disabled:opacity-50">{loading ? 'Loading…' : 'Refresh data'}</button></header>
    <div className="flex flex-wrap gap-2">{dates.map(d => <button key={d.days} onClick={() => setPeriod(d.days)} className={`rounded-full px-4 py-2 text-sm font-bold ${period === d.days ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'}`}>{d.label}</button>)}</div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">{[['Unique visitors',data.visitors],['Visits / sessions',data.sessions],['Signed-in learners',data.signedIn],['Guest sessions',data.guests],['Logged-in sessions',data.loggedIn],['Page views',data.pageviews],['Total active time',fmt(data.total)],['Avg. active time / visit',fmt(data.avg)]].map(([label,value]) => <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><p className="text-xs uppercase tracking-wide font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl md:text-4xl font-black break-words">{value}</p></div>)}</div>
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-semibold">Guests: {data.guests}</span><span className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-semibold">Logged in: {data.loggedIn}</span></div><div className="grid lg:grid-cols-2 gap-5"><section className="bg-white rounded-2xl border border-slate-200 p-5"><h2 className="text-xl font-black mb-4">Most visited pages</h2>{data.paths.length ? data.paths.slice(0,15).map(([path,count])=><div key={path} className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm"><span className="break-all">{path}</span><strong>{count}</strong></div>) : <p className="text-slate-500">No visits recorded yet.</p>}</section><section className="bg-white rounded-2xl border border-slate-200 p-5"><h2 className="text-xl font-black mb-4">Daily visits</h2>{data.days.length ? data.days.map(([day,count])=><div key={day} className="flex items-center gap-3 py-2"><span className="text-xs text-slate-500 w-24 shrink-0">{day}</span><div className="h-3 rounded-full bg-indigo-500" style={{width:`${Math.max(3, count / Math.max(...data.days.map(d=>d[1])) * 100)}%`}}/><strong className="text-xs">{count}</strong></div>) : <p className="text-slate-500">No visits recorded yet.</p>}</section></div>
    <p className="text-sm text-slate-500">Active time counts only when the tab is visible and focused, sampled periodically. Numbers are approximate and may be undercounted if visitors leave before a write completes. Unique visitors are based on browser identifiers, not verified individuals. No geographic location is collected.</p>
  </div></main>;
}
