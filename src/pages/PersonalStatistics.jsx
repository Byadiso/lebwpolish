import { Link } from 'react-router-dom';
import { useLearningValue } from '../hooks/useLearningStorage';
import { KEY, EMPTY, metrics, streak } from '../lib/activePractice';
import { STORAGE_KEY, emptyProgress, weekDays } from '../lib/journeyProgress';
import { words } from '../data/wordBank';
import './PersonalStatistics.css';

const initialJourney = emptyProgress();
const icons = { flame: 'M12 22c-4 0-7-3-7-7 0-3 2-6 5-9 0 4 2 5 2 5 3-3 4-6 3-9 5 5 7 9 7 13 0 4-4 7-10 7Z', zap:'m13 2-9 12h7l-1 8 10-12h-7l1-8Z', book:'M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-3H4Zm16 0h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-3h5Z', target:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 4v2', review:'M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 14-2l1 6M4 12l1 6a8 8 0 0 0 14-2' };
function Icon({name}) { return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name]}/></svg>; }
export default function PersonalStatistics() {
 const [state] = useLearningValue(KEY, EMPTY);
 const [journey] = useLearningValue(STORAGE_KEY, initialJourney);
 const m = metrics(state, words);
 const days = [...new Set([...Object.keys(state.days), ...(journey.days || [])])];
 const week = weekDays();
 const active = week.filter(d => days.includes(d.key)).length;
 const run = streak(days);
 const percent = words.length ? Math.round(m.mastered / words.length * 100) : 0;
 const categories = [...new Set(words.map(w => w.category))].map(name => { const group = words.filter(w => w.category === name); return {name, total: group.length, mastered: metrics(state, group).mastered}; });
 const cards = [['zap',m.xp,'Word Bank XP'],['book',m.mastered,'Words mastered'],['target',journey.completed?.length || 0,'Missions completed'],['review',m.due,'Words due for review']];
 return <main className="ps-root">
 <header className="ps-header"><div><p className="ps-eyebrow">My learning dashboard</p><h1>Progress that counts<span>.</span></h1><p>See what you have learned and find your next step.</p></div><Link className="ps-outline" to="/learn">Continue learning <span aria-hidden="true">→</span></Link></header>
 <section className="ps-streak" aria-labelledby="ps-streak-title"><div><div className="ps-streak-label"><Icon name="flame"/> Learning streak</div><h2 id="ps-streak-title">{run} {run === 1 ? 'day' : 'days'}</h2><p>{run ? 'Keep building your Polish habit.' : 'Start your streak with a short practice session.'}</p></div><div className="ps-week"><div className="ps-week-head"><strong>Last seven days</strong><span>{active}/7 days practised</span></div><div className="ps-days">{week.map(d => <div key={d.key} className="ps-day"><span>{d.label}</span><div className={days.includes(d.key) ? 'ps-day-mark ps-done' : 'ps-day-mark'} aria-label={`${d.key}: ${days.includes(d.key) ? 'practised' : 'no practice recorded'}`} title={d.key}>{days.includes(d.key) ? '✓' : '–'}</div></div>)}</div></div></section>
 <div className="ps-kpis">{cards.map(([icon,n,label]) => <section className="ps-card ps-kpi" key={label}><div className="ps-icon"><Icon name={icon}/></div><strong>{n.toLocaleString('en-GB')}</strong><span>{label}</span></section>)}</div>
 <div className="ps-grid"><section className="ps-card ps-mastery"><h2>Vocabulary mastery</h2><p>Build lasting recall across your Word Bank.</p><div className="ps-overview"><div className="ps-ring" style={{'--ps-percent':`${percent}%`}} role="img" aria-label={`${percent}% mastered`}><div><strong>{percent}%</strong><span>Mastered</span></div></div><div><h3>{m.mastered} of {words.length} words</h3><p>{words.length-m.mastered} still to master</p><Link to="/word-bank">Explore Word Bank →</Link></div></div><div className="ps-categories">{categories.map(c => <div key={c.name}><div className="ps-category-label"><span>{c.name}</span><strong>{c.mastered}/{c.total}</strong></div><progress max={c.total} value={c.mastered} aria-label={`${c.name} mastery`}/></div>)}</div><p className="ps-note">Mastery means four successful spaced recalls, not exam readiness.</p></section>
 <aside className="ps-side"><section className="ps-card ps-next"><div className="ps-icon"><Icon name={m.due ? 'review' : 'target'}/></div><h2>Your next move</h2><h3>{m.due ? 'Time for a quick review.' : 'Build your recall.'}</h3><p>{m.due ? `${m.due} words are ready for review.` : 'Try a short Word Bank challenge to build your vocabulary.'}</p><Link className="ps-primary" to="/word-bank">{m.due ? 'Review vocabulary' : 'Start practice'} <span aria-hidden="true">→</span></Link></section><section className="ps-card"><h2>Daily Journey</h2><p>Put your vocabulary into practice with guided missions.</p><Link className="ps-outline" to="/learn">Explore missions →</Link></section></aside></div>
 <p className="ps-note">Based on Word Bank and Daily Journey practice, not page visits.</p>
 </main>;
}
