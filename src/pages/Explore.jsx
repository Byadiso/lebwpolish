import IconText from "../components/IconText";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { activities } from '../data/activities';
import { useLearningPersistence, useLearningValue } from '../hooks/useLearningStorage';
import './LearningRefresh.css';
export default function Explore() {
  const {loadLocal, saveLocal} = useLearningPersistence();
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('All');
  const [quick, setQuick] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [storedSaved, setSaved] = useLearningValue('lebw.favourites', []);
  const saved = Array.isArray(storedSaved) ? storedSaved : [];
  const [notice, setNotice] = useState('');
  const [surprise, setSurprise] = useState(null);
  const filtered = activities.filter(a => (skill === 'All' || a.skill === skill) && (!quick || a.minutes <= 5) && (!onlySaved || saved.includes(a.path)) && `${a.title} ${a.description} ${a.level}`.toLowerCase().includes(query.toLowerCase()));
  const recent = (Array.isArray(loadLocal('lebw.recent', [])) ? loadLocal('lebw.recent', []) : []).slice(0, 3).map(path => activities.find(a => a.path === path)).filter(Boolean);
  function toggle(path) {
    const next = saved.includes(path) ? saved.filter(p => p !== path) : [...saved, path];
    setSaved(next);
    if (!saveLocal('lebw.favourites', next)) setNotice('Favourites could not be saved in this browser.');
  }
  return <main className="refresh-root"><header className="refresh-heading"><span className="refresh-kicker">YOUR POLISH PLAYGROUND</span><h1>Follow your curiosity.</h1><p>One language. Many ways in. Find something you feel like doing today.</p><div className="refresh-actions"><Link className="refresh-button" to="/learn">Continue my journey <AppIcon name="arrow" /></Link><button className="refresh-secondary" disabled={!filtered.length} onClick={() => setSurprise(filtered[Math.floor(Math.random() * filtered.length)])}><AppIcon name="shuffle" /> Surprise me</button></div>{surprise && <div className="refresh-surprise" role="status"><AppIcon name={surprise.icon} /><span>Your next adventure: <b><IconText>{surprise.title}</IconText></b></span><Link to={surprise.path}>Try it <AppIcon name="arrow" /></Link></div>}</header>
 {recent.length > 0 && <section className="refresh-recent"><span>Recently explored</span>{recent.map(a => <Link key={a.path} to={a.path}><IconText>{a.title}</IconText> <AppIcon name="arrow" /></Link>)}</section>}
 <section className="refresh-filters" aria-label="Find an activity"><label className="refresh-search"><AppIcon name="search" /><input aria-label="Search learning activities" placeholder="Try stories, travel, grammar…" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="refresh-chips">{['All', 'Play', 'Vocabulary', 'Listening', 'Reading', 'Speaking', 'Writing', 'Grammar', 'Mixed'].map(s => <button key={s} aria-pressed={skill === s} onClick={() => setSkill(s)}><IconText>{s}</IconText></button>)}</div><div className="refresh-filter-options"><label><input type="checkbox" checked={quick} onChange={e => setQuick(e.target.checked)} /> Five minutes or less</label><label><input type="checkbox" checked={onlySaved} onChange={e => setOnlySaved(e.target.checked)} /> My saved activities</label><span aria-live="polite"><IconText>{filtered.length}</IconText> activities</span></div></section>
 <p role="status"><IconText>{notice}</IconText></p><section className="refresh-grid" aria-label="Learning activities">{filtered.map(a => <article className="refresh-activity" key={a.path}><div className="refresh-card-top"><span className="refresh-icon-tile"><AppIcon name={a.icon} size={25} /></span><button className="refresh-save" aria-label={`${saved.includes(a.path) ? 'Unsave' : 'Save'} ${a.title}`} aria-pressed={saved.includes(a.path)} onClick={() => toggle(a.path)}><AppIcon name="star" /></button></div><span className="refresh-meta"><IconText>{a.skill}</IconText> · <IconText>{a.level}</IconText> · <IconText>{a.minutes}</IconText> min</span><h2><Link to={a.path}><IconText>{a.title}</IconText></Link></h2><p><IconText>{a.description}</IconText></p><Link className="refresh-card-link" to={a.path}><IconText>{a.account ? 'Sign in to write' : 'Let’s try it'}</IconText> <AppIcon name="arrow" /></Link></article>)}</section>{!filtered.length && <div className="refresh-empty"><AppIcon name="search" size={32} /><h2>No activities here yet.</h2><p>Try another skill or clear the filters.</p><button className="refresh-secondary" onClick={() => {
        setSkill('All');
        setQuery('');
        setQuick(false);
        setOnlySaved(false);
      }}>Clear filters</button></div>}</main>;
}
