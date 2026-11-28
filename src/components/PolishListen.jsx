import { useEffect, useRef, useState } from 'react';
import { playAudio } from '../lib/polishAudio';
import './PolishListen.css';
export function readAudioRate(fallback=1){try{const r=Number(localStorage.getItem('lebw.audio.rate'));return [.75,1,1.25].includes(r)?r:fallback;}catch{return fallback;}}
export function saveAudioRate(r){try{localStorage.setItem('lebw.audio.rate',String(r));}catch{}}
export function AudioGlyph({kind}) {return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">{kind==='speaker'?<g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12"/></g>:kind==='stop'?<rect x="6" y="6" width="12" height="12" rx="2"/>:kind==='pause'?<><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>:<path d="M8 5v14l12-7z"/>}</svg>}
export default function PolishListen({text, compact=false, label='Listen', normalRate, slowRate=.75}) {
 const [state,setState]=useState('idle'),[rate,setRate]=useState(normalRate??1),[error,setError]=useState(false);const own=useRef(null);
 useEffect(()=>{setState('idle');setError(false);return()=>own.current?.();},[text]);
 function toggle(next){if(state!=='idle'&&rate===next){own.current?.();return;}own.current?.();setRate(next);setError(false);setState('loading');own.current=playAudio(text,{rate:next,onStart:()=>setState('playing'),onEnd:()=>setState('idle'),onError:()=>setError(true)});}
 if(typeof text!=='string'||!text.trim())return null;
 const busy=state!=='idle';return <span className={'pl-listen'+(compact?' pl-listen-compact':'')}><span className="pl-listen-buttons"><button type="button" className={busy?'pl-active':error?'pl-error':''} onClick={()=>toggle(busy?rate:normalRate??1)} aria-label={busy?'Stop audio':error?'Retry audio':label} title={busy?'Stop audio':error?'Retry audio':label}>{state==='loading'?<span className="pl-spinner"/>:<AudioGlyph kind={busy?'stop':'speaker'}/>}</button></span>{error&&<span className="pl-listen-status pl-listen-error" role="status">Could not play audio. Tap to retry.</span>}</span>;
}
