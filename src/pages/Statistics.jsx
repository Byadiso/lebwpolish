import { useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { Link } from 'react-router-dom';
import { realtimeDb, auth } from '../firebase';
import './StatisticsDashboard.css';

const fmt = ms => `${Math.floor(ms / 60000)}m ${Math.floor(ms % 60000 / 1000)}s`;
const dates = [{ label: '7 days', days: 7 }, { label: '30 days', days: 30 }, { label: 'All time', days: 0 }];
export default function Statistics() {
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try {
      // AuthProvider resolves the initial auth state before ProtectedRoute mounts.
      if (!auth || !realtimeDb) throw new Error('Firebase is not configured');
      if (!auth.currentUser) throw new Error('Sign in as administrator first');
      const snap = await get(ref(realtimeDb, 'visit_sessions'));
      setSessions(snap.exists() ? Object.values(snap.val()) : []);
    } catch (err) {
      const detail = err.code || err.message || 'Unknown error';
      const denied = /permission[_ -]?denied/i.test(detail);
      setError(`Unable to read statistics (${detail}).${denied ? ' Check administrator email verification and Realtime Database rules.' : ''}`);
    }
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
  const max = Math.max(1, ...data.days.map(([,count]) => count));
  const share = data.sessions ? Math.round(data.loggedIn / data.sessions * 100) : 0;
  const number = n => n.toLocaleString('en-GB');
  const cards = [['Unique visitors',number(data.visitors),'Distinct browser identifiers'],['Sessions',number(data.sessions),'Recorded visits'],['Page views',number(data.pageviews),'Across all tracked pages'],['Avg. active time',fmt(data.avg),'Per recorded session']];
  return <main className="stats-dashboard"><div className="stats-shell">
    <header className="stats-header"><div><Link to="/admin" className="stats-back">← Admin dashboard</Link><p className="stats-kicker">LEARN BY DOING / ANALYTICS</p><h1>Site statistics<span>.</span></h1><p>Understand how learners discover and use your platform.</p></div><button className="stats-refresh" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : '↻ Refresh data'}</button></header>
    <div className="stats-toolbar"><div><strong>Overview</strong><small>{dates.find(d=>d.days===period)?.label} · Recorded activity</small></div><div className="stats-filters" role="group" aria-label="Date range">{dates.map(d=><button key={d.days} aria-pressed={period===d.days} onClick={()=>setPeriod(d.days)}>{d.label}</button>)}</div></div>
    {error && <div className="stats-error" role="alert">{error} <button onClick={load} disabled={loading}>Try again</button></div>}
    {loading && <p role="status" className="stats-status">Loading statistics…</p>}
    {!loading && !error && !data.sessions && <p className="stats-status">No recorded visits in this period. Try a wider date range.</p>}
    {(!error || sessions.length>0) && <div aria-busy={loading}>
    {error && <p className="stats-status">Showing previously loaded data.</p>}
    <div className="stats-kpis">{cards.map(([label,value,detail])=><section className="stats-panel stats-kpi" key={label}><p>{label}</p><strong>{loading&&!sessions.length?'—':value}</strong><small>{detail}</small></section>)}</div>
    <div className="stats-grid"><section className="stats-panel"><div className="stats-section-head"><div><p className="stats-kicker">TRAFFIC</p><h2>Daily visits</h2></div><strong>{number(data.sessions)} visits</strong></div><p className="stats-muted">Sessions by recorded day</p>{data.days.length ? <div className="stats-chart" tabIndex={0} aria-label="Daily visit counts"><div className="stats-bars" style={{minWidth:Math.max(0,data.days.length*38)}}>{data.days.map(([day,count])=><div className="stats-bar-col" key={day}><span>{count}</span><div className="stats-bar-track"><div style={{height:`${count/max*100}%`}}/></div><small title={day}>{day}</small></div>)}</div></div>:<p className="stats-empty">No traffic recorded.</p>}</section>
    <section className="stats-panel"><p className="stats-kicker">AUDIENCE</p><h2>Visitor breakdown</h2><div className="stats-ring" style={{background:data.sessions?`conic-gradient(#dc2626 ${share}%, #e2e8f0 0)`:'#e2e8f0'}}><div><strong>{data.sessions?`${share}%`:'—'}</strong><small>Signed-in sessions</small></div></div><div className="stats-legend"><span><i/>Logged-in sessions</span><strong>{number(data.loggedIn)}</strong><span><i className="stats-guest"/>Guest sessions</span><strong>{number(data.guests)}</strong></div><div className="stats-foot">Distinct signed-in learners <strong>{number(data.signedIn)}</strong></div></section></div>
    <div className="stats-grid"><section className="stats-panel"><p className="stats-kicker">CONTENT</p><h2>Most visited pages</h2><p className="stats-muted">Top 15 by recorded page views</p>{data.paths.length?data.paths.slice(0,15).map(([path,count],i)=><div className="stats-path" key={path}><div><span>{i+1}. {path}</span><strong>{number(count)}</strong></div><div className="stats-meter"><div style={{width:`${count/Math.max(1,data.paths[0][1])*100}%`}}/></div></div>):<p className="stats-empty">No page views recorded.</p>}</section><section className="stats-panel"><p className="stats-kicker">ENGAGEMENT</p><h2>Active learning time</h2><div className="stats-big">{fmt(data.total)}</div><p className="stats-muted">Total recorded active time</p><div className="stats-foot">Average per visit <strong>{fmt(data.avg)}</strong></div><div className="stats-foot">Page views per visit <strong>{data.sessions?(data.pageviews/data.sessions).toFixed(1):'—'}</strong></div><p className="stats-note">Active time measures visible, focused tabs, not verified learning outcomes.</p></section></div></div>}
    <footer className="stats-note">Statistics are approximate. Unique visitors represent browser identifiers, not verified individuals. Active time may be undercounted if a visitor leaves before a write completes. No geographic location is collected.</footer>
  </div></main>;
}
