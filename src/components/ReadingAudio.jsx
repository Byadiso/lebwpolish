import {useEffect,useRef,useState} from 'react';
import {playAudio} from '../lib/polishAudio';
import {AudioGlyph} from './PolishListen';
import './PolishListen.css';
import './ReadingAudio.css';
const fmt=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
export default function ReadingAudio({text,label='Listen to the passage',compact=false}){
 const [state,setState]=useState('idle'),[time,setTime]=useState(0),[duration,setDuration]=useState(0),[error,setError]=useState(false),[rate,setRate]=useState(1);const own=useRef(null);
 useEffect(()=>{setState('idle');setTime(0);setDuration(0);setError(false);return()=>own.current?.();},[text]);
 const busy=state!=='idle';
 function toggle(){if(busy){own.current?.();setTime(0);return;}setError(false);setTime(0);setDuration(0);setState('loading');own.current=playAudio(text,{rate:compact?1:rate,onStart:()=>setState('playing'),onEnd:()=>setState('idle'),onError:()=>setError(true),onTime:(t,d)=>{setTime(t);if(Number.isFinite(d))setDuration(d);}});}
 const action=state==='loading'?'Cancel loading':busy?'Stop audio':label;
 return <div className={compact?'reading-audio-minimal':'pl-reading-audio'}>{!compact&&<strong>{label}</strong>}<button type="button" onClick={toggle} aria-label={action} title={action}>{state==='loading'?<span className="pl-spinner"/>:<AudioGlyph kind={busy?'stop':compact?'speaker':'play'}/>}{compact&&<span>{busy?state==='loading'?'Cancel':'Stop listening':label}</span>}</button>{(!compact||busy)&&<><input aria-label="Playback position" type="range" min="0" max={duration||1} step=".1" value={Math.min(time,duration)} disabled={!duration||!busy} onChange={e=>{const t=Number(e.target.value);own.current?.seek(t);setTime(t);}}/><span className="reading-audio-time">{fmt(time)} / {duration?fmt(duration):'—'}</span></>}{!compact&&<select aria-label="Playback speed" value={rate} onChange={e=>{setRate(Number(e.target.value));if(busy){own.current?.();setTime(0);}}}>{[.75,1,1.25].map(r=><option key={r} value={r}>{r}×</option>)}</select>}{error&&<span className="reading-audio-error" role="status">Audio unavailable. Try again.</span>}</div>;
}
