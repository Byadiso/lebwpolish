export const STORAGE_KEY = 'lebwpolish.journey.v1';
export const emptyProgress = () => ({ completed: [], words: {}, days: [], xp: 0, daily: {} });
export function readProgress(storage) {
 try {
  const p=JSON.parse(storage.getItem(STORAGE_KEY));
  if(!p || !Array.isArray(p.completed) || !Array.isArray(p.days) || !p.words || Array.isArray(p.words) || typeof p.words!=='object' || !Number.isFinite(p.xp))return emptyProgress();
  const words=Object.fromEntries(Object.entries(p.words).filter(([,w])=>w&&typeof w.pl==='string'&&typeof w.en==='string'&&typeof w.example==='string'&&Number.isFinite(w.due)).map(([id,w])=>[id,{...w,id,box:Math.max(0,Math.min(5,Number(w.box)||0))}]));
  return {...emptyProgress(),...p,completed:p.completed.filter(id=>typeof id==='string'),days:p.days.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)),xp:Math.max(0,p.xp),words,daily:p.daily&&typeof p.daily==='object'&&!Array.isArray(p.daily)?p.daily:{}};
 } catch { return emptyProgress(); }
}
export function dayKey(now=new Date()) {return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function normalizeAnswer(text) {return text.normalize('NFC').trim().toLocaleLowerCase('pl').replace(/[.,!?;:]/gu,'').replace(/\s+/g,' ');}
function markPractice(progress,key,now) {
 const day=dayKey(new Date(now));
 const prior=progress.daily?.[day];
 const entries=Array.isArray(prior)?prior:[];
 return {...progress,days:[...new Set([...progress.days,day])],daily:{...progress.daily,[day]:[...new Set([...entries,key])]}};
}
export function completeMission(progress,mission,now=Date.now()) {
 const first=!progress.completed.includes(mission.id);
 const words={...progress.words};
 mission.words.forEach(word=>{if(!words[word.id])words[word.id]={...word,box:0,due:now,updatedAt:now};});
 return markPractice({...progress,words,completed:[...new Set([...progress.completed,mission.id])],xp:progress.xp+(first?30:0)},`mission:${mission.id}`,now);
}
export function reviewWord(progress,id,remembered,now=Date.now()) {
 const word=progress.words[id];
 if(!word || word.due>now)return progress;
 const box=remembered?Math.min((word.box||0)+1,5):0;
 const delay=remembered?[1,1,3,7,14,30][box]*86400000:600000;
 return markPractice({...progress,words:{...progress.words,[id]:{...word,box,due:now+delay,updatedAt:now}}},`review:${id}`,now);
}
export function weekDays(now=new Date()) {
 return Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);return {key:dayKey(d),label:d.toLocaleDateString('en',{weekday:'short'})};});
}
