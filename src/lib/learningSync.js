import { STORAGE_KEY, emptyProgress } from './journeyProgress.js';
export function mergeJourney(a=emptyProgress(), b=emptyProgress()) {
 const completed=[...new Set([...(a.completed||[]),...(b.completed||[])])];
 const words={...a.words};
 for(const [id,word] of Object.entries(b.words||{})) {
  const old=words[id];
  if(!old || (word.updatedAt||0) >= (old.updatedAt||0))words[id]=word;
 }
 const daily={...a.daily};
 for(const [day,entries] of Object.entries(b.daily||{}))daily[day]=[...new Set([...(daily[day]||[]),...entries])];
 return {...a,...b,completed,words,daily,days:[...new Set([...(a.days||[]),...(b.days||[])])],xp:Math.max(a.xp||0,b.xp||0,completed.length*30)};
}
export function applyLearningOperation(values,op) {
 const next={...values};
 if(op.value===null){delete next[op.key];return next;}
 let value=op.value;
 try {
  if(op.key===STORAGE_KEY)value=JSON.stringify(mergeJourney(JSON.parse(next[op.key]||'null')||emptyProgress(),JSON.parse(value)));
  if(op.key==='lebw.writing.drafts') {
   const remote=JSON.parse(next[op.key]||'{}'), before=JSON.parse(op.before||'{}'), incoming=JSON.parse(value);
   for(const key of new Set([...Object.keys(before),...Object.keys(incoming)])) {
    if(before[key]===incoming[key])continue;
    if(Object.hasOwn(incoming,key))remote[key]=incoming[key];else delete remote[key];
   }
   value=JSON.stringify(remote);
  }
 } catch { /* Legacy non-JSON values remain plain strings. */ }
 next[op.key]=value;
 return next;
}
// Shared engine is independent of React/Firebase so account isolation and recovery can be tested.
export class LearningStore {
 constructor({uid=null,storage,flushDelay=300}) {
  this.flushDelay=flushDelay;this.inflight=new Set();
  this.uid=uid;this.storage=storage;this.listeners=new Set();this.version=0;this.pending=[];this.values={};this.remote=null;this.flushing=false;this.sequence=0;
  this.prefix=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  this.status=uid?'loading':'guest';this.ready=!uid;this.backedUp=true;
  if(uid)try {const cache=JSON.parse(storage.getItem(this.cacheKey)||'null');if(cache&&cache.values&&Array.isArray(cache.pending)){this.values=cache.values;this.pending=cache.pending;this.hasCache=true;}}catch{/* start from server */}
 }
 beginLoading(){if(!this.ready){this.status='loading';this.emit();}}
 attachRemote(remote){this.remote=remote;}
 detachRemote(){clearTimeout(this.flushTimer);this.remote=null;}
 get cacheKey(){return `lebw.account.${this.uid}.learning-cache.v1`;}
 subscribe=listener=>{this.listeners.add(listener);return()=>this.listeners.delete(listener);};
 snapshot=()=>this.version;
 serverSnapshot=()=>0;
 emit(){this.version++;for(const listener of this.listeners)listener();}
 backup(){try{this.storage.setItem(this.cacheKey,JSON.stringify({values:this.values,pending:this.pending}));this.backedUp=true;}catch{this.backedUp=false;}}
 getItem=key=>{if(this.uid||Object.hasOwn(this.values,key))return this.values[key]??null;try{return this.storage.getItem(key);}catch{return null;}};
 setItem=(key,value)=>{
  value=String(value);
  if(value===this.getItem(key))return;
  if(!this.uid){this.values[key]=value;try{this.storage.setItem(key,value);this.status='guest';}catch{this.status='guest-error';}this.emit();return;}
  this.enqueue({key,value,before:this.getItem(key),id:`${this.prefix}-${++this.sequence}`});
 };
 removeItem=key=>{
  if(!this.uid){this.values[key]=null;try{this.storage.removeItem(key);this.status='guest';}catch{this.status='guest-error';}this.emit();return;}
  this.enqueue({key,value:null,before:this.getItem(key),id:`${this.prefix}-${++this.sequence}`});
 };
 enqueue(op){
  const index=this.pending.findIndex(old=>old.key===op.key&&!this.inflight.has(old.id));
  if(index>=0){op={...op,id:this.pending[index].id,before:this.pending[index].before};this.pending[index]=op;}else this.pending.push(op);
  this.values=applyLearningOperation(this.values,op);this.status='syncing';this.backup();this.emit();
  clearTimeout(this.flushTimer);
  if(this.flushDelay===0)queueMicrotask(()=>void this.flush());else this.flushTimer=setTimeout(()=>void this.flush(),this.flushDelay);
 }
 receive(values){this.ready=true;this.values=this.pending.reduce(applyLearningOperation,values||{});this.status=this.pending.length?'syncing':'saved';this.backup();this.emit();void this.flush();}
 unavailable(){this.ready=!!this.hasCache||this.ready;this.status='error';this.emit();}
 async flush(){
  if(!this.remote||!this.ready||this.flushing)return;
  this.flushing=true;
  try {
   while(this.pending.length){
    const batch=this.remote.commitBatch?this.pending.slice(0,20):this.pending.slice(0,1);
    this.inflight=new Set(batch.map(op=>op.id));
    const result=await (this.remote.commitBatch?this.remote.commitBatch(batch):this.remote.commit(batch[0]));
    this.pending=this.pending.filter(op=>!this.inflight.has(op.id));this.inflight.clear();
    this.values=this.pending.reduce(applyLearningOperation,result);this.backup();this.emit();
   }
   this.status='saved';
  }catch{this.status='error';this.backup();}
  finally{this.inflight.clear();this.flushing=false;this.emit();}
 }
 retry=()=>{if(this.ready&&this.pending.length){this.status='syncing';this.emit();void this.flush();}else this.remote?.retry();};
}
