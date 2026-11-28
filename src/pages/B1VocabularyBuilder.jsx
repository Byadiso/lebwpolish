import PolishListen from '../components/PolishListen';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import './DailyJourney.css';
import './LearningRefresh.css';
import { B1_BLOCKS, evaluateRecall, sanitizeVocabularyProgress } from '../data/b1VocabularyBlocks';
import { useLearningStorage } from '../hooks/useLearningStorage';
import { AccountSaveStatus } from '../context/LearningProgressContext';

const KEY='lebw.b1.vocabulary.v1';
export default function B1VocabularyBuilder(){
 const store=useLearningStorage();
 const [blockId,setBlockId]=useState(B1_BLOCKS[0].id);
 const [index,setIndex]=useState(0);
 const [choice,setChoice]=useState('');
 const [feedback,setFeedback]=useState(null);
 const raw=store.getItem(KEY);
 const progress=useMemo(()=>{try{return sanitizeVocabularyProgress(JSON.parse(raw));}catch{return {}; }},[raw]);
 const block=B1_BLOCKS.find(item=>item.id===blockId)||B1_BLOCKS[0];
 const card=block.cards[index];
 const completed=Object.values(progress).filter(value=>value.correct>0).length;
 const total=B1_BLOCKS.reduce((sum,item)=>sum+item.cards.length,0);
 const attempts=Object.values(progress).reduce((sum,item)=>sum+item.attempts,0);
 const correct=Object.values(progress).reduce((sum,item)=>sum+item.correct,0);
 function chooseBlock(id){setBlockId(id);setIndex(0);setChoice('');setFeedback(null);}
 function next(){setIndex(value=>(value+1)%block.cards.length);setChoice('');setFeedback(null);}
 function check(event){event.preventDefault();if(!choice||feedback)return;const ok=evaluateRecall(card,choice);const nextProgress={...progress,[card.id]:{attempts:Math.min(9999,(progress[card.id]?.attempts||0)+1),correct:Math.min(9999,(progress[card.id]?.correct||0)+(ok?1:0))}};try{store.setItem(KEY,JSON.stringify(nextProgress));setFeedback(ok?'correct':'review');}catch{setFeedback(ok?'correct':'review');}}
 return <main className="journey-root"><div className="journey-shell">
 <header className="journey-header"><div><span className="journey-eyebrow">B1 · VOCABULARY GARDEN</span><h1>Useful Polish.<br/><em>One phrase at a time.</em></h1><p>Learn the pattern, recall it in context, and use it in your everyday life.</p></div><div className="journey-stats"><strong>{completed}<small>chunks recalled</small></strong><strong>{total}<small>learning chunks</small></strong><strong>{attempts ? Math.round(100*correct/attempts) : 0}%<small>practice accuracy</small></strong></div></header>
 <section className="journey-rhythm" aria-label="Practice progress"><div><span className="journey-eyebrow">YOUR LEARNING RHYTHM</span><h2>Small steps build lasting vocabulary.</h2><p role="status">{completed} of {total} chunks recalled correctly at least once.</p><progress value={completed} max={total} aria-label="Chunks recalled correctly"/><p>These are learning indicators, not an official B1 exam score.</p><AccountSaveStatus/></div></section>
 <div className="journey-section-heading"><h2>Choose your everyday theme</h2><Link to="/learn">Back to Daily Journey</Link></div>
 <nav className="refresh-chips journey-levels" aria-label="Vocabulary themes">{B1_BLOCKS.map(item=><button key={item.id} type="button" aria-pressed={blockId===item.id} onClick={()=>chooseBlock(item.id)}>{item.title}</button>)}</nav>
 <section className="journey-lesson" aria-labelledby="block-title"><span className="journey-eyebrow">ACTIVE RECALL · {card.kind}</span><h2 id="block-title">{block.title}</h2><p>{block.goal}</p><progress value={index+1} max={block.cards.length} aria-label="Current chunk"/><p>Chunk {index+1} of {block.cards.length}</p><div className="journey-example"><h3>{card.cue}</h3></div>
 <form onSubmit={check}><fieldset disabled={!!feedback}><legend className="sr-only">Choose the correct Polish expression</legend><div className="grid gap-3">{card.options.map(option=><label key={option} className="journey-mission flex items-center gap-3 !mb-0 !p-4"><input type="radio" className="!w-auto" name="recall-answer" checked={choice===option} onChange={()=>setChoice(option)}/><span>{option}</span></label>)}</div></fieldset>{!feedback&&<button type="submit" disabled={!choice} className="journey-primary">Check my answer <AppIcon name="arrow"/></button>}</form>
 {feedback&&<div className={`journey-feedback ${feedback==='correct'?'success':''}`} role="status" aria-live="polite"><strong>{feedback==='correct'?'Well done — you recalled the chunk.':'Good practice — review the pattern and try it again later.'}</strong><p>Answer: <strong>{card.answer}</strong> <PolishListen text={card.answer} compact /></p><p>{card.why}</p><p>Pattern: {card.pair}</p><p>Meaning: {card.meaning}</p><button type="button" className="journey-primary" onClick={next}>Next chunk <AppIcon name="arrow"/></button></div>}
 </section>
 <section className="journey-note"><b>Use it in writing</b><p>{block.writing}</p><p>Self-check: state your purpose, add relevant details, use an appropriate register, and connect ideas with a reason or consequence.</p><Link to="/B1-writing">Open B1 Writing Studio</Link></section>
 <footer className="journey-footer"><AccountSaveStatus/><Link to="/learn">Return to Daily Journey</Link></footer>
 </div></main>;
}
