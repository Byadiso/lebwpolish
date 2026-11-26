import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import './DailyJourney.css';
import './LearningRefresh.css';
import { useLearningStorage } from '../hooks/useLearningStorage';
import { AccountSaveStatus } from '../context/LearningProgressContext';
import { DIAGNOSTIC, SKILL_ROUTES, WRITING_CHECKLIST, readinessSummary, sanitizeReadiness } from '../data/b1Readiness';

const KEY='lebw.b1.readiness.coach.v1';
export default function B1ReadinessCoach(){
 const store=useLearningStorage();
 const raw=store.getItem(KEY);
 const data=useMemo(()=>{try{return sanitizeReadiness(JSON.parse(raw));}catch{return sanitizeReadiness(null);}},[raw]);
 const [index,setIndex]=useState(0);
 const [error,setError]=useState('');
 const question=DIAGNOSTIC[index];
 const answered=Object.hasOwn(data.answers,question.id);
 const answeredCount=Object.keys(data.answers).length;
 const summary=readinessSummary(data.answers);
 function update(next){try{store.setItem(KEY,JSON.stringify(sanitizeReadiness(next)));setError('');}catch{setError('Progress could not be saved. Please check your connection or storage settings.');}}
 function select(value){if(answered)return;update({...data,answers:{...data.answers,[question.id]:value}});}
 function toggleCheck(i,checked){update({...data,checks:{...data.checks,[i]:checked}});}
 const weaker=Object.entries(summary).filter(([,v])=>v.answered>0).sort((a,b)=>a[1].correct/a[1].answered-b[1].correct/b[1].answered);
 return <main className="journey-root"><div className="journey-shell">
 <header className="journey-header"><div><span className="journey-eyebrow">B1 · YOUR LEARNING COMPASS</span><h1>Know your strengths.<br/><em>Find your next step.</em></h1><p>Short checks, helpful explanations, and a personal practice route.</p></div><div className="journey-stats"><strong>{answeredCount}<small>questions tried</small></strong><strong>{DIAGNOSTIC.length}<small>questions total</small></strong></div></header>
 <section className="journey-rhythm" aria-label="Diagnostic progress"><div><span className="journey-eyebrow">YOUR PROGRESS</span><h2>A little clearer with every answer.</h2><p role="status">{answeredCount} of {DIAGNOSTIC.length} diagnostic questions attempted.</p><progress value={answeredCount} max={DIAGNOSTIC.length} aria-label="Diagnostic completion"/><p>This learning diagnostic is not an official B1 exam, pass prediction, or certification result. Listening, extended writing, and live speaking need separate assessment.</p><AccountSaveStatus/>{error&&<p role="alert">{error}</p>}</div></section>
 <div className="journey-section-heading"><h2>Quick diagnostic</h2><Link to="/learn?tab=b1">Back to B1 compass</Link></div>
 <section className="journey-lesson" aria-labelledby="diagnostic-heading"><span className="journey-eyebrow">{question.skill} · QUESTION {index+1} OF {DIAGNOSTIC.length}</span><h2 id="diagnostic-heading">Practice one useful pattern.</h2><progress value={index+1} max={DIAGNOSTIC.length} aria-label="Current question"/>{question.passage&&<blockquote className="journey-example">{question.passage}</blockquote>}<div className="journey-example"><h3>{question.prompt}</h3></div>
 <fieldset disabled={answered}><legend className="sr-only">Select one answer</legend><div className="grid gap-3">{question.options.map((option,i)=><label key={i} className="journey-mission flex items-center gap-3 !mb-0 !p-4"><input className="!w-auto" type="radio" name={`b1-diagnostic-${question.id}`} checked={data.answers[question.id]===i} onChange={()=>select(i)}/><span>{option}</span></label>)}</div></fieldset>
 {answered&&<div className={`journey-feedback ${data.answers[question.id]===question.answer?'success':''}`} role="status" aria-live="polite"><strong>{data.answers[question.id]===question.answer?'Correct — good recall.':'Not quite — here is the useful pattern.'}</strong><p>Answer: <strong>{question.options[question.answer]}</strong></p><p>{question.why}</p></div>}
 <div className="journey-review-actions"><button type="button" className="journey-back" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Previous</button><button type="button" className="journey-primary" disabled={index===DIAGNOSTIC.length-1} onClick={()=>setIndex(i=>i+1)}>Next question <AppIcon name="arrow"/></button></div></section>
 <div className="journey-section-heading"><h2>Your learning roadmap</h2></div><p>Choose a skill to practice. Priorities reflect only answered diagnostic questions.</p>{weaker.length>0&&<div className="journey-note"><b>Suggested starting point: {weaker[0][0]}</b><p>Revisit the explanation and practice that skill.</p></div>}
 <section className="journey-missions" aria-label="Practice routes">{SKILL_ROUTES.map(skill=>{const result=summary[skill.name];return <div key={skill.name} className="journey-mission"><span className="journey-eyebrow">B1 PRACTICE</span><h3>{skill.name}</h3><p>{skill.action}</p><p>{result?.answered?`${result.correct} of ${result.answered} diagnostic answers correct`:'Not assessed by this short diagnostic'}</p><Link className="journey-mission-bottom" to={skill.path}>Open practice <AppIcon name="arrow"/></Link></div>;})}</section>
 <section className="journey-note"><b>Writing self-review</b><p>After writing in the existing studio, check each step. This is a reflection checklist, not automated essay grading.</p><div className="refresh-checklist">{WRITING_CHECKLIST.map((label,i)=><label key={i}><input type="checkbox" checked={!!data.checks[i]} onChange={event=>toggleCheck(i,event.target.checked)}/><span>{label}</span></label>)}</div><Link to="/B1-writing">Open Writing Studio</Link></section>
 <footer className="journey-footer"><AccountSaveStatus/><Link to="/learn">Return to Daily Journey</Link></footer>
 </div></main>;
}
