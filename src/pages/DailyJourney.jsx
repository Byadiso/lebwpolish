import IconText from "../components/IconText";
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { missions, examSkills } from '../data/journey';
import { readProgress, STORAGE_KEY, normalizeAnswer, completeMission, reviewWord, dayKey, weekDays } from '../lib/journeyProgress';
import { useLearningStorage, useLearningPersistence, useLearningValue } from '../hooks/useLearningStorage';
import { AccountSaveStatus } from '../context/LearningProgressContext';
import { emptyProgress } from '../lib/journeyProgress';
import { mergeJourney } from '../lib/learningSync';
import './DailyJourney.css';
import './LearningRefresh.css';
const b1Checks = ['I can find key details in everyday recordings.', 'I can understand notices, emails, and straightforward texts.', 'I can use common cases and verb forms in context.', 'I can write a connected message that covers the task.', 'I can describe experiences and explain an opinion.'];
export default function DailyJourney() {
  const [params, setParams] = useSearchParams();
  const tab = ['review', 'b1'].includes(params.get('tab')) ? params.get('tab') : 'journey';
  const accountStorage = useLearningStorage();
  const { saveLocal } = useLearningPersistence();
  const [storedProgress, setProgress] = useLearningValue(STORAGE_KEY, emptyProgress());
  const progress = readProgress({ getItem: () => JSON.stringify(storedProgress) });
  const guestProgress = accountStorage.uid ? readProgress(accountStorage.storage) : emptyProgress();
  const canImportGuest = accountStorage.uid && guestProgress.completed.some(id => !progress.completed.includes(id));
  const [mission, setMission] = useState(null);
  const [step, setStep] = useState(-1);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const [savedLevel, setLevel] = useLearningValue('lebw.journey.level', 'All');
  const level = ['All', 'A1', 'A2', 'B1'].includes(savedLevel) ? savedLevel : 'All';
  const [revealed, setRevealed] = useState(false);
  const [recall, setRecall] = useState('');
  const [saved, setSaved] = useState(true);
  const [audioMessage, setAudioMessage] = useState('');
  const [clock, setClock] = useState(Date.now);
  const [savedGoal, setGoal] = useLearningValue('lebw.journey.goal', 3);
  const goal = [1, 3, 5].includes(savedGoal) ? savedGoal : 3;
  const [checks, setChecks] = useLearningValue('lebw.b1.reflection', []);
  const answerRef = useRef(null);
  const feedbackRef = useRef(null);
  const headingRef = useRef(null);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(() => Date.now()), 30000);
    return () => {
      window.clearInterval(timer);
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);
  useEffect(() => {
    if (mission) headingRef.current?.focus();
  }, [mission, step]);
  function persist(next) {
    setProgress(next);
    setSaved(saveLocal(STORAGE_KEY, next));
  }
  function resetAnswer() {
    setAnswer('');
    setFeedback(null);
    setHint(false);
    setAssisted(false);
  }
  function setTab(id) {
    window.speechSynthesis?.cancel();
    setAudioMessage('');
    setParams(id === 'journey' ? {} : {
      tab: id
    });
    setMission(null);
    setRevealed(false);
    setRecall('');
    setClock(() => Date.now());
  }
  function openMission(item) {
    window.speechSynthesis?.cancel();
    setAudioMessage('');
    setMission(item);
    setStep(-1);
    resetAnswer();
  }
  function listen(text) {
    if (!window.speechSynthesis) {
      setAudioMessage('Audio is unavailable in this browser. Try reading the example aloud.');
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'pl-PL';
    speech.rate = .85;
    speech.onerror = () => setAudioMessage('Audio could not play. Check your device’s Polish voice settings.');
    setAudioMessage('Device-generated Polish audio. Voice quality varies.');
    window.speechSynthesis.speak(speech);
  }
  const due = Object.values(progress.words).filter(w => w.due <= clock).sort((a, b) => a.due - b.due);
  const word = due[0];
  const task = mission?.tasks[step];
  const finished = mission && step === mission.tasks.length;
  const candidates = missions.filter(m => level === 'All' || m.level === level);
  const nextMission = candidates.find(m => !progress.completed.includes(m.id)) || candidates[0];
  const today = dayKey(new Date(clock));
  const actions = Array.isArray(progress.daily?.[today]) ? progress.daily[today].length : 0;
  const week = weekDays(new Date(clock));
  const badges = [{
    name: 'First conversation',
    icon: 'chat',
    earned: progress.completed.length >= 1
  }, {
    name: 'Curious explorer',
    icon: 'compass',
    earned: progress.completed.length >= 4
  }, {
    name: 'Memory builder',
    icon: 'brain',
    earned: Object.values(progress.words).filter(w => w.box >= 2).length >= 3
  }, {
    name: 'A week of showing up',
    icon: 'calendar',
    earned: progress.days.length >= 7
  }];
  function rate(remembered) {
    persist(reviewWord(progress, word.id, remembered));
    setRevealed(false);
    setRecall('');
    setClock(() => Date.now());
  }
  return <main className="journey-root"><div className="journey-shell">
  <header className="journey-header"><div><span className="journey-eyebrow">MAŁE KROKI. WIELKIE MOŻLIWOŚCI.</span><h1>Your Polish.<br /><em>A little more every day.</em></h1><p>Real-life words. Small wins. A clear path towards B1.</p></div><div className="journey-stats"><strong><IconText>{progress.xp}</IconText><small>journey XP</small></strong><strong><IconText>{Object.keys(progress.words).length}</IconText><small>review phrases</small></strong><strong><IconText>{progress.days.length}</IconText><small>active days</small></strong></div></header>
  {!saved && <p role="alert">Progress could not be saved in this browser. Copy any work you want to keep before leaving.</p>}
  {canImportGuest && <aside className="journey-note"><b>Have an earlier guest journey on this device?</b><p>Guest history is kept separate from your account. Import it only if it belongs to you.</p><button className="journey-primary" onClick={() => persist(mergeJourney(progress, guestProgress))}>Import my guest journey</button></aside>}
  <nav className="journey-tabs" aria-label="Learning sections">{[['journey', 'compass', 'Daily journey'], ['review', 'leaf', `Memory garden · ${due.length}`], ['b1', 'target', 'B1 compass']].map(([id, icon, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}><AppIcon name={icon} /> <IconText>{label}</IconText></button>)}</nav>
  {tab === 'journey' && !mission && <>
   <section className="journey-rhythm" aria-label="Your learning rhythm"><div><span className="journey-eyebrow">YOUR RHYTHM</span><h2><IconText>{actions >= goal ? 'You reached today’s small goal.' : 'A few small wins add up.'}</IconText></h2><p>A mission or a reviewed phrase counts as one win.</p><div className="journey-goal"><progress aria-label="Daily small wins" max={goal} value={Math.min(actions, goal)} /><span><IconText>{actions}</IconText> / <IconText>{goal}</IconText></span><label>Daily goal <select value={goal} onChange={e => {
                  const g = Number(e.target.value);
                  setGoal(g);
                  setSaved(saveLocal('lebw.journey.goal', g));
                }}>{[1, 3, 5].map(g => <option key={g} value={g}>{g} {g === 1 ? 'win' : 'wins'}</option>)}</select></label></div></div><div className="journey-week">{week.map(d => <div key={d.key} className={`${progress.days.includes(d.key) ? 'active' : ''} ${d.key === today ? 'today' : ''}`}><span><IconText>{d.label}</IconText></span><b aria-label={`${d.label}${progress.days.includes(d.key) ? ': practised' : ': no practice yet'}`}>{progress.days.includes(d.key) ? <AppIcon name="check" /> : <span className="journey-day-dot" />}</b></div>)}</div></section>
   <section className="journey-feature"><div><span className="journey-eyebrow">YOUR NEXT SMALL WIN · ABOUT 5 MINUTES</span><h2><IconText>{nextMission.title}</IconText></h2><p><IconText>{nextMission.subtitle}</IconText> Learn a pattern, try it, then use it in your life.</p><button className="journey-primary" onClick={() => openMission(nextMission)}>Let’s do this <AppIcon name="arrow" /></button><small><IconText>{progress.days.includes(today) ? 'You showed up today. Anything more is a bonus.' : 'No lost lives. No rush. Just one useful thing.'}</IconText></small></div><div className="journey-illustration" aria-hidden="true"><span><IconText>{nextMission.icon}</IconText></span><b>Cześć!</b><i>One conversation closer.</i></div></section>
   {due.length > 0 && <button className="journey-review-nudge" onClick={() => setTab('review')}><AppIcon name="leaf" /><span><b><IconText>{due.length}</IconText> phrases ready to grow</b><small>A quick recall round helps your new words stick.</small></span><AppIcon name="arrow" /></button>}
   <div className="journey-section-heading"><h2>Small steps, real conversations</h2><Link to="/explore">Explore all activities <AppIcon name="arrow" /></Link></div>
   <div className="refresh-chips journey-levels" aria-label="Mission levels">{['All', 'A1', 'A2', 'B1'].map(l => <button key={l} aria-pressed={level === l} onClick={() => {
            setLevel(l);
            setSaved(saveLocal('lebw.journey.level', l));
          }}><IconText>{l === 'All' ? 'All starting points' : l}</IconText></button>)}<span>{progress.completed.filter(id => candidates.some(m => m.id === id)).length} / <IconText>{candidates.length}</IconText> missions completed</span></div>
   <section className="journey-missions">{candidates.map(item => <button className="journey-mission" key={item.id} onClick={() => openMission(item)}><span className="journey-mission-top"><b><IconText>{item.icon}</IconText></b><span><IconText>{item.level}</IconText> · 5 MIN</span></span><h3><IconText>{item.title}</IconText></h3><p><IconText>{item.subtitle}</IconText></p><span className="journey-mission-bottom"><IconText>{progress.completed.includes(item.id) ? 'Completed · practise again' : 'Learn → try → use'}</IconText><AppIcon name={progress.completed.includes(item.id) ? 'check' : 'arrow'} /></span></button>)}</section>
   <section className="journey-badges" aria-label="Learning milestones">{badges.map(b => <div key={b.name} className={b.earned ? 'earned' : ''}><AppIcon name={b.icon} size={24} /><span><IconText>{b.name}</IconText></span><small><IconText>{b.earned ? 'Earned' : 'Growing towards it'}</IconText></small></div>)}</section>
   <aside className="journey-note"><b>A habit that fits your life.</b><p>Five focused minutes count. Review a few words, try a conversation, and stop at a good moment. Your progress will be here when you return.</p></aside>
  </>}
  {tab === 'journey' && mission && <section className="journey-lesson" aria-label={mission.title}><button className="journey-back" onClick={() => setMission(null)}><AppIcon name="back" /> Back to your journey</button><div className="journey-section-heading"><span><IconText>{mission.level}</IconText> · <IconText>{mission.title}</IconText></span><span><IconText>{finished ? 'Complete' : step < 0 ? 'Discover' : `Try ${step + 1} of ${mission.tasks.length}`}</IconText></span></div><progress aria-label="Mission progress" max={mission.tasks.length + 1} value={step + 1} />
   {step < 0 ? <><span className="journey-big-icon"><IconText>{mission.icon}</IconText></span><h2 tabIndex={-1} ref={headingRef}><IconText>{mission.rule}</IconText></h2><p><IconText>{mission.explanation}</IconText></p><div className="journey-example"><strong lang="pl"><IconText>{mission.example}</IconText></strong><p><IconText>{mission.translation}</IconText></p><button onClick={() => listen(mission.example)}><AppIcon name="volume" /> Hear the phrase</button></div><button className="journey-primary" onClick={() => setStep(0)}>Try it yourself <AppIcon name="arrow" /></button></> : finished ? <><span className="journey-big-icon"><AppIcon name="trophy" /></span><h2 tabIndex={-1} ref={headingRef}>A small win you can use.</h2><p>You completed <IconText>{mission.title.toLowerCase()}</IconText>. Your phrases are now in your memory garden.</p><div className="journey-example"><b>Take it into real life</b><p><IconText>{mission.transfer}</IconText></p></div><button className="journey-primary" onClick={() => setTab('review')}>Practise your new phrases <AppIcon name="arrow" /></button><button className="journey-back" onClick={() => setMission(null)}>Done for now — save my place</button></> : <form onSubmit={e => {
          e.preventDefault();
          setFeedback(task.answers.some(a => normalizeAnswer(a) === normalizeAnswer(answer)) ? 'correct' : 'retry');
        }}><h2 tabIndex={-1} ref={headingRef}><IconText>{task.prompt}</IconText></h2><label htmlFor="journey-answer">Your Polish answer</label><input id="journey-answer" ref={answerRef} lang="pl" autoComplete="off" value={answer} disabled={feedback === 'correct'} onChange={e => {
            setAnswer(e.target.value);
            setFeedback(null);
          }} />
    {step === 0 && <div className="journey-word-bank" aria-label="Word hints"><span>Need a starting point? Try a phrase:</span>{[...new Set(mission.words.map(w => w.pl))].map(w => <button key={w} type="button" disabled={feedback === 'correct'} onClick={() => {
              setAnswer(w);
              setFeedback(null);
              answerRef.current?.focus();
            }} lang="pl"><IconText>{w}</IconText></button>)}</div>}
    <div className="journey-characters" aria-label="Polish letters">{'ąćęłńóśźż'.split('').map(c => <button type="button" aria-label={`Insert ${c}`} disabled={feedback === 'correct'} key={c} onClick={() => {
              const input = answerRef.current;
              const start = input.selectionStart ?? answer.length;
              const end = input.selectionEnd ?? start;
              setAnswer(answer.slice(0, start) + c + answer.slice(end));
              setFeedback(null);
              requestAnimationFrame(() => {
                input.focus();
                input.setSelectionRange(start + 1, start + 1);
              });
            }}><IconText>{c}</IconText></button>)}</div><button type="button" className="journey-back" aria-expanded={hint} onClick={() => setHint(!hint)}><AppIcon name="lightbulb" /> A little help?</button>{hint && <p><IconText>{task.hint}</IconText></p>}
    <div aria-live="polite" ref={feedbackRef} tabIndex={-1}>{feedback === 'retry' && <div className="journey-feedback"><b>Almost. Let’s build it together.</b><p><IconText>{task.hint}</IconText> Check Polish letters too.</p><button type="button" onClick={() => {
                setHint(true);
                setAssisted(true);
                setAnswer(task.answers[0]);
                setFeedback(null);
                answerRef.current?.focus();
              }}>Show an example to practise</button></div>}{feedback === 'correct' && <div className="journey-feedback success"><b><AppIcon name="check" /> <IconText>{assisted ? 'Good practice. Now read it aloud.' : 'Dobrze! You’ve got it.'}</IconText></b><p><IconText>{task.why}</IconText></p></div>}</div>
    {feedback === 'correct' ? <button type="button" className="journey-primary" onClick={() => {
            if (step === mission.tasks.length - 1) persist(completeMission(progress, mission));
            setStep(step + 1);
            resetAnswer();
          }}>Continue <AppIcon name="arrow" /></button> : <button className="journey-primary" disabled={!answer.trim()}>Check my answer <AppIcon name="arrow" /></button>}
   </form>}<p className="journey-audio-note" role="status"><IconText>{audioMessage}</IconText></p></section>}
  {tab === 'review' && <section className="journey-lesson"><span className="journey-eyebrow">MEMORY GARDEN</span><h2>Let your vocabulary take root.</h2><p>Recall before revealing. Remembered phrases return after 1, 3, 7, 14, then 30 days. Tricky ones return after 10 minutes.</p>{word ? <div className="journey-review"><span><IconText>{due.length}</IconText> phrases ready · How would you say…</span><h3><IconText>{word.en}</IconText></h3>{!revealed ? <form onSubmit={e => {
            e.preventDefault();
            setRevealed(true);
          }}><label htmlFor="recall-answer">Try from memory (optional)</label><input id="recall-answer" value={recall} lang="pl" autoComplete="off" onChange={e => setRecall(e.target.value)} placeholder="Your Polish phrase…" /><button className="journey-primary">Reveal Polish <AppIcon name="arrow" /></button></form> : <><strong lang="pl"><IconText>{word.pl}</IconText></strong><p lang="pl"><IconText>{word.example}</IconText></p>{recall.trim() && <p><IconText>{normalizeAnswer(recall) === normalizeAnswer(word.pl) ? 'That matches. Nicely recalled.' : 'Compare your phrase with the example. Check endings and Polish letters.'}</IconText></p>}<button className="journey-back" onClick={() => listen(word.example)}><AppIcon name="volume" /> Listen</button><p>Did you recall it before revealing?</p><div className="journey-review-actions"><button className="refresh-secondary" onClick={() => rate(false)}>Still learning</button><button className="journey-primary" onClick={() => rate(true)}>Remembered <AppIcon name="check" /></button></div></>}</div> : <div className="journey-example"><AppIcon name="leaf" size={32} /><h3><IconText>{Object.keys(progress.words).length ? 'All caught up. Nicely done.' : 'Your garden starts with one phrase.'}</IconText></h3><p><IconText>{Object.keys(progress.words).length ? 'Your phrases will return when their next review is due.' : 'Complete a mission to plant your first useful phrases.'}</IconText></p>{Object.values(progress.words).length > 0 && <p>Next review: {new Date(Math.min(...Object.values(progress.words).map(w => w.due))).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}</p>}<button className="journey-primary" onClick={() => setTab('journey')}>Explore a mission <AppIcon name="arrow" /></button></div>}<p className="journey-audio-note" role="status"><IconText>{audioMessage}</IconText></p></section>}
  {tab === 'b1' && <><section className="journey-feature"><div><span className="journey-eyebrow">THE B1 COMPASS · ADULT EXAM</span><h2>Build every skill.<br />One step at a time.</h2><p>The adult B1 exam tests five skills. You need at least 50% in each part. Journey XP rewards practice; it is not an exam score.</p><a href="https://certyfikatpolski.pl/o-egzaminie/struktura-egzaminu/" target="_blank" rel="noreferrer"><IconText>Official exam structure [icon:sparkles]</IconText></a></div><div className="journey-illustration" aria-hidden="true"><span><AppIcon name="compass" /></span><b>Krok po kroku.</b><i>Step by step.</i></div></section><section className="journey-skill-grid">{examSkills.map((skill, i) => <Link className="journey-mission" key={skill.title} to={skill.path}><AppIcon name={['headphones', 'book', 'brain', 'pen', 'mic'][i]} size={28} /><span className="journey-eyebrow"> <IconText>{skill.time}</IconText></span><h3><IconText>{skill.title}</IconText></h3><p><IconText>{skill.desc}</IconText></p><span className="journey-mission-bottom">Open practice <AppIcon name="arrow" /></span></Link>)}</section><section className="journey-note"><b>Your can-do reflection</b><p>Tick what you feel confident doing. This is self-reflection, not a test result.</p><div className="refresh-checklist">{b1Checks.map((c, i) => <label key={c}><input type="checkbox" checked={Array.isArray(checks) && checks.includes(i)} onChange={e => {
                const current = Array.isArray(checks) ? checks : [];
                const next = e.target.checked ? [...current, i] : current.filter(n => n !== i);
                setChecks(next);
                setSaved(saveLocal('lebw.b1.reflection', next));
              }} /><span><IconText>{c}</IconText></span></label>)}</div></section><aside className="journey-note"><b>Turn practice into exam preparation.</b><p>The twelve missions introduce everyday patterns. Add full-length timed papers, authentic listening, and teacher feedback on speaking and writing.</p><a href="https://certyfikatpolski.pl/o-egzaminie/zbiory-zadan/" target="_blank" rel="noreferrer"><IconText>Get official sample tasks [icon:sparkles]</IconText></a></aside></>}
  <footer className="journey-footer"><AccountSaveStatus /> <Link to="/explore">Explore all LEBWPOLISH activities <AppIcon name="arrow" /></Link></footer>
 </div></main>;
}
