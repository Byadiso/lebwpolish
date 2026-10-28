import test from 'node:test';
import assert from 'node:assert/strict';
import { LearningStore, applyLearningOperation, mergeJourney } from '../src/lib/learningSync.js';
import { emptyProgress, completeMission, reviewWord, STORAGE_KEY } from '../src/lib/journeyProgress.js';
import { missions } from '../src/data/journey.js';
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('guest history and account caches stay isolated when switching users',()=>{
 const storage=memory();storage.setItem(STORAGE_KEY,'guest history');
 const guest=new LearningStore({flushDelay:0,storage});assert.equal(guest.getItem(STORAGE_KEY),'guest history');
 const a=new LearningStore({flushDelay:0,uid:'alice',storage});assert.equal(a.getItem(STORAGE_KEY),null);assert.equal(a.ready,false);
 a.receive({});a.setItem('lesson','alice only');
 const b=new LearningStore({flushDelay:0,uid:'bob',storage});b.receive({});assert.equal(b.getItem('lesson'),null);
 const restored=new LearningStore({flushDelay:0,uid:'alice',storage});assert.equal(restored.getItem('lesson'),'alice only');
 assert.equal(new LearningStore({flushDelay:0,storage}).getItem(STORAGE_KEY),'guest history');
});
test('signed-in changes commit remotely and another device restores them',async()=>{
 const a=new LearningStore({flushDelay:0,uid:'alice',storage:memory()});let remote={};
 a.remote={commit:async op=>(remote=applyLearningOperation(remote,op))};a.receive(remote);
 a.setItem('lebw.journey.goal','5');await settle();assert.equal(a.status,'saved');assert.equal(a.pending.length,0);
 const b=new LearningStore({flushDelay:0,uid:'alice',storage:memory()});b.receive(remote);assert.equal(b.getItem('lebw.journey.goal'),'5');
});
test('failed sync retains the outbox across reload and retries without losing work',async()=>{
 const storage=memory(),a=new LearningStore({flushDelay:0,uid:'alice',storage});
 a.remote={commit:async()=>{throw Error('offline');}};a.receive({});a.setItem('draft','my work');await settle();
 assert.equal(a.status,'error');assert.equal(a.pending.length,1);
 const b=new LearningStore({flushDelay:0,uid:'alice',storage});let remote={};b.remote={commit:async op=>(remote=applyLearningOperation(remote,op))};b.receive({});await settle();
 assert.equal(b.status,'saved');assert.equal(remote.draft,'my work');assert.equal(b.pending.length,0);
});
test('journeys from two devices merge missions and rewards without duplicate XP',()=>{
 const a=completeMission(emptyProgress(),missions[0],1000),b=completeMission(emptyProgress(),missions[1],2000);
 const merged=mergeJourney(a,b);assert.equal(merged.completed.length,2);assert.equal(merged.xp,60);
 assert.equal(mergeJourney(merged,a).xp,60);assert.equal(Object.keys(merged.words).length,4);
});
test('the latest recall result survives an older device snapshot',()=>{
 let a=completeMission(emptyProgress(),missions[0],1000);a=reviewWord(a,'kawa',true,1000);
 let b=reviewWord(a,'kawa',false,a.words.kawa.due);
 assert.equal(mergeJourney(b,a).words.kawa.box,0);
 assert.equal(mergeJourney(a,b).words.kawa.due,b.words.kawa.due);
});
test('editing a draft on one device preserves another prompt from a different device',()=>{
 const values={'lebw.writing.drafts':JSON.stringify({invite:'remote invite',change:'remote appointment'})};
 const next=applyLearningOperation(values,{key:'lebw.writing.drafts',before:JSON.stringify({invite:'old invite'}),value:JSON.stringify({invite:'new invite'})});
 assert.deepEqual(JSON.parse(next['lebw.writing.drafts']),{invite:'new invite',change:'remote appointment'});
});
test('removal clears only the chosen saved key',()=>{
 assert.deepEqual(applyLearningOperation({one:'1',two:'2'},{key:'one',value:null}),{two:'2'});
});
test('blocked guest storage keeps temporary work but reports the saving failure',()=>{
 const store=new LearningStore({flushDelay:0,storage:{getItem:()=>null,setItem:()=>{throw Error('blocked');}}});
 store.setItem('draft','temporary');assert.equal(store.getItem('draft'),'temporary');assert.equal(store.status,'guest-error');
});

test('offline draft typing coalesces into one pending update and saves the final text',async()=>{
 const a=new LearningStore({uid:'alice',storage:memory(),flushDelay:0});a.receive({});
 for(const text of ['H','He','Hello'])a.setItem('lebw.writing.drafts',JSON.stringify({invite:text}));
 assert.equal(a.pending.length,1);
 let writes=0;let remote={};a.remote={commitBatch:async ops=>{writes++;return remote=ops.reduce(applyLearningOperation,remote);}};
 await a.flush();assert.equal(writes,1);assert.equal(JSON.parse(remote['lebw.writing.drafts']).invite,'Hello');
});
test('new edits during an in-flight write are preserved for the next commit',async()=>{
 const a=new LearningStore({uid:'alice',storage:memory(),flushDelay:0});let release;let remote={};
 a.remote={commit:op=>new Promise(resolve=>{release=()=>resolve(remote=applyLearningOperation(remote,op));})};a.receive({});
 a.setItem('draft','first');await settle();a.setItem('draft','second');assert.equal(a.pending.length,2);
 release();await settle();release();await settle();assert.equal(remote.draft,'second');assert.equal(a.pending.length,0);
});
