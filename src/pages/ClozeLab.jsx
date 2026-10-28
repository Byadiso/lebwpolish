import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLearningStorage } from '../hooks/useLearningStorage';
const KEY='lebw.cloze.b1.v1';
export default function ClozeLab(){
 const storage=useLearningStorage(),frame=useRef(null),latest=useRef(storage);
 useEffect(()=>{latest.current=storage;},[storage]);
 function send(type='LEBW_CLOZE_STATE'){
  const store=latest.current;
  frame.current?.contentWindow?.postMessage({type,raw:store.getItem(KEY),account:!!store.uid,status:store.status==='guest-error'?'error':store.status},window.location.origin);
 }
 useEffect(()=>{
  function receive(event){
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||!event.data||typeof event.data!=='object')return;
   if(event.data.type==='LEBW_CLOZE_READY')send('LEBW_CLOZE_INIT');
   else if(event.data.type==='LEBW_CLOZE_SAVE'&&typeof event.data.raw==='string'&&event.data.raw.length<=5000000){
    try{
     const value=JSON.parse(event.data.raw);
     if(value.version!==1||!Array.isArray(value.sentences)||!value.stats||typeof value.cards!=='object')return;
     latest.current.setItem(KEY,event.data.raw);send('LEBW_CLOZE_STATE');
    }catch{frame.current?.contentWindow?.postMessage({type:'LEBW_CLOZE_STATUS',account:!!latest.current.uid,status:'error'},window.location.origin);}
   }else if(event.data.type==='LEBW_CLOZE_HEIGHT'&&Number.isFinite(event.data.height)){
    if(frame.current)frame.current.style.height=`${Math.max(600,Math.min(20000,event.data.height+4))}px`;
   }
  }
  window.addEventListener('message',receive);
  return()=>window.removeEventListener('message',receive);
 },[]);
 const raw=storage.getItem(KEY),status=storage.status;
 useEffect(()=>{send();},[raw,status]);
 return <main style={{background:'#fafafa',minHeight:'100vh'}}><div style={{maxWidth:1100,margin:'auto',padding:'16px 24px 0',fontSize:12}}><Link to="/explore" className="text-red-600 font-bold">← Explore all activities</Link></div><iframe ref={frame} title="Polish B1 sentence practice" src="/cloze-b1.html?embedded=1" onLoad={()=>send('LEBW_CLOZE_INIT')} sandbox="allow-scripts allow-same-origin allow-downloads" style={{display:'block',width:'100%',height:1050,border:0}}/></main>;
}
