import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {words} from '../src/data/wordBank.js';import {READING_VAULT} from '../src/data/readingVault.js';import {normalizeAudioText,playAudio,stopAudio,subscribeAudio} from '../src/lib/polishAudio.js';
const texts=new Set(JSON.parse(fs.readFileSync(new URL('../scripts/gosia-texts.json',import.meta.url))));
test('every Word Bank word indexed',()=>{for(const w of words)assert.ok(texts.has(normalizeAudioText(w.pl)),w.pl);});
test('all reading passages and paragraphs indexed',()=>{for(const r of READING_VAULT){assert.ok(texts.has(normalizeAudioText(r.text)));for(const p of r.text.split(/\n\s*\n/))assert.ok(texts.has(normalizeAudioText(p)));}});
test('normalization keeps Polish letters',()=>assert.equal(normalizeAudioText('  zażółć\n gęślą  '),'zażółć gęślą'));
test('stop cancels pending playback and resets state',()=>{let ended=0;const states=[];const unsub=subscribeAudio(v=>states.push(v));const cancel=playAudio('dom',{onEnd:()=>ended++});cancel();stopAudio();unsub();assert.equal(ended,1);assert.ok(states.includes(true));assert.equal(states.at(-1),false);});
