import {dayKey,normalizeAnswer} from './journeyProgress.js';
export const KEY='lebw.active.v1';
export const EMPTY={cards:{},days:{}};
export function record(state,id,correct,now=Date.now()){
 const old=state.cards[id]; if(old?.due>now)return state;
 const box=correct?Math.min(5,(old?.box||0)+1):0;
 const day=dayKey(new Date(now));
 return {cards:{...state.cards,[id]:{box,due:now+(correct?[0,1,3,7,14,30][box]*86400000:600000),updatedAt:now}},days:{...state.days,[day]:{...state.days[day],[id]:Math.max(state.days[day]?.[id]||0,correct?2:1)}}};
}
export function mergeActive(a,b){const cards={...a.cards},days={...a.days};for(const [id,c] of Object.entries(b.cards))if(!cards[id]||c.updatedAt>=cards[id].updatedAt)cards[id]=c;for(const [day,entries] of Object.entries(b.days)){days[day]={...days[day]};for(const [id,n] of Object.entries(entries))days[day][id]=Math.max(days[day][id]||0,n);}return {cards,days};}
export function matches(a,b){return normalizeAnswer(a)===normalizeAnswer(b);}
export function metrics(state,words,now=Date.now()){const due=words.filter(w=>state.cards[w.id]&&state.cards[w.id].due<=now).length;const mastered=words.filter(w=>state.cards[w.id]?.box>=4).length;const xp=Object.values(state.days).flatMap(Object.values).reduce((n,v)=>n+(v===2?10:2),0);return {due,mastered,xp};}
export function streak(days,now=new Date()){const d=new Date(now);if(!days.includes(dayKey(d)))d.setDate(d.getDate()-1);let n=0;while(days.includes(dayKey(d))){n++;d.setDate(d.getDate()-1);}return n;}
