import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../public/cloze-b1.html',import.meta.url),'utf8');
const get=id=>html.match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)<\\/script>`))[1];
const context=vm.createContext({});vm.runInContext(get('cloze-core'),context);const C=context.ClozeCore;
const sentences=JSON.parse(get('starter-data')),hints=JSON.parse(get('grammar-hints')),topics=JSON.parse(get('sentence-topics'));
const now=Date.UTC(2026,9,28,12),state=()=>C.fresh(sentences,now);
test('standalone data has 60 valid sentences, five balanced topics, and grammar hints',()=>{
 assert.equal(C.validateSentences(sentences).length,60);assert.equal(new Set(sentences.map(s=>s.id)).size,60);
 for(const topic of ['daily','work','health','shopping','travel'])assert.equal(Object.values(topics).filter(t=>t===topic).length,12);
 for(const s of sentences){assert.ok(hints[s.id]);assert.equal(C.blankParts(s)[1].toLocaleLowerCase('pl'),s.targetWord.toLocaleLowerCase('pl'));}
});
test('Fast Track introduces at most ten new sentences in rank order after due reviews',()=>{
 const s=state();const last=s.sentences.at(-1);s.cards[last.id]={level:2,introduced:true,due:now-1000};
 const p=C.plan(s,now);assert.equal(p.reviews[0],last.id);assert.equal(p.newIds.length,10);
 const ranks=p.newIds.map(id=>s.sentences.find(x=>x.id===id).frequencyRank);assert.deepEqual([...ranks],[...ranks].sort((a,b)=>a-b));
 s.session=C.createSession(s,now);assert.equal(s.session.queue[0],last.id);assert.equal(s.session.newIds.length,10);
});
test('accepted answers schedule exactly 1, 2, 4, 8, and 16 days, capped at mastery five',()=>{
 const s=state(),sentence=s.sentences[0];let clock=now;
 for(const [i,delay] of [1,2,4,8,16,16].entries()){
  s.session={...C.createSession(s,clock),queue:[sentence.id]};C.answer(s,sentence.targetWord,'typing',clock);
  assert.equal(s.cards[sentence.id].level,Math.min(i+1,5));assert.equal(s.cards[sentence.id].due,clock+delay*C.DAY);clock=s.cards[sentence.id].due;
 }
});
test('mistakes reset mastery and reappear after up to three other cards in the same run',()=>{
 const s=state();s.session=C.createSession(s,now);const id=s.session.queue[0];s.cards[id]={level:4,introduced:true,due:now};
 C.answer(s,'wrong','typing',now);assert.equal(s.cards[id].level,0);assert.equal(s.cards[id].due,now);assert.equal(s.session.queue[4],id);
 C.advance(s);assert.equal(s.session.queue[3],id);assert.equal(s.stats.xp,0);
});
test('answer matching keeps exact Polish spelling separate from missing-diacritic almost',()=>{
 assert.equal(C.verdict('  MAMY  ','mamy'),'correct');assert.equal(C.verdict('pociagiem','pociągiem'),'almost');assert.equal(C.verdict('  ŁÓDŹ  ','łódź'),'correct');assert.equal(C.verdict('lodz','łódź'),'almost');assert.equal(C.verdict('pociąg','pociągiem'),'wrong');
});
test('typing, almost and choice give different rewards; repeat submission cannot farm XP',()=>{
 for(const [mode,missing,points] of [['typing',false,20],['typing',true,15],['choice',false,10]]){
  const s=state(),sentence=s.sentences.find(x=>x.targetWord==='są');s.session={...C.createSession(s,now),queue:[sentence.id]};
  C.answer(s,missing?'sa':'są',mode,now);assert.equal(s.stats.xp,points);assert.equal(C.answer(s,'są',mode,now),null);assert.equal(s.stats.attempts,1);
 }
});
test('four-choice answers are unique and contain the correct form exactly once',()=>{
 const sentence=sentences[0],options=C.options(sentence,sentences,()=>.4);assert.equal(options.length,4);assert.equal(new Set(options).size,4);assert.equal(options.filter(w=>w===sentence.targetWord).length,1);
});
test('free play does not alter review dates, XP, accuracy, or practice streak',()=>{
 const s=state(),sentence=s.sentences[0];s.cards[sentence.id]={level:3,introduced:true,due:now+C.DAY};s.session=C.createSession(s,now,true);
 const before=JSON.stringify({cards:s.cards,stats:s.stats});C.answer(s,sentence.targetWord,'typing',now);assert.equal(JSON.stringify({cards:s.cards,stats:s.stats}),before);
});
test('backups round-trip progress and validation rejects malformed schedules and ambiguous imports',()=>{
 const s=state();s.session=C.createSession(s,now);const sentence=s.sentences.find(x=>x.id===s.session.queue[0]);C.answer(s,sentence.targetWord,'typing',now);
 const restored=C.validateBackup(JSON.stringify({kind:'lebw-cloze-backup',state:s}));assert.equal(restored.stats.xp,20);assert.equal(restored.sentences.length,60);assert.equal(restored.session,null);
 const broken=JSON.parse(JSON.stringify(s));broken.cards[sentence.id].level=8;assert.throws(()=>C.validateBackup(broken));
 assert.throws(()=>C.validateSentences([{...sentences[0],targetWord:'missing'}]));assert.throws(()=>C.validateSentences([{...sentences[0],id:'__proto__'}]));assert.throws(()=>C.validateSentences([sentences[0],sentences[0]]));
});
test('streak bridges yesterday, handles month boundaries, and does not count opening the game',()=>{
 const local=new Date(2026,9,28,12).getTime(),today=C.dayKey(local),yesterday=C.previousDay(today),before=C.previousDay(yesterday);
 assert.equal(C.streak({},local),0);assert.equal(C.streak({[today]:{attempts:0}},local),0);assert.equal(C.streak({[yesterday]:{attempts:1},[before]:{attempts:1}},local),2);assert.equal(C.streak({[today]:{attempts:1},[before]:{attempts:1}},local),1);assert.equal(C.previousDay('2026-03-01'),'2026-02-28');
});
test('the deliverable has no external dependency URLs or framework scripts',()=>{
 assert.equal(html.includes('localStorage.clear'),false);assert.equal(/<script[^>]+src=/i.test(html),false);assert.equal(/<link[^>]+href=/i.test(html),false);assert.equal(/@import|https?:\/\//i.test(html.replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"/g,'')),false);
 new vm.Script(get('cloze-ui'));assert.ok(html.includes('LEBWPOLISH')||html.includes('LEBW'));
});
