import test from 'node:test';
import assert from 'node:assert/strict';
import { tasks, skills } from '../src/data/skillPractice.js';
import { recordEvidence, mergeEvidence, summarizeEvidence, EVIDENCE_KEY } from '../src/lib/skillEvidence.js';
import { applyLearningOperation } from '../src/lib/learningSync.js';
test('all skills covered, unique ids and valid options',()=>{assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);for(const s of skills)assert.ok(tasks.some(t=>t.skill===s));for(const t of tasks)if(t.options)assert.ok(t.options[t.correct]);});
test('incorrect answers due after ten minutes',()=>{const e=recordEvidence({},tasks[0],'incorrect',1000);assert.equal(summarizeEvidence(tasks,e,600999).length,0);assert.equal(summarizeEvidence(tasks,e,601000).length,1);});
test('concurrent different tasks merge without losing legacy keys',()=>{const a=recordEvidence({},tasks[0],'correct',1000),b=recordEvidence({},tasks[1],'incorrect',2000);const result=applyLearningOperation({legacy:'keep',[EVIDENCE_KEY]:JSON.stringify(a)},{key:EVIDENCE_KEY,value:JSON.stringify(b)});assert.equal(result.legacy,'keep');assert.equal(Object.keys(JSON.parse(result[EVIDENCE_KEY])).length,2);});
test('older results do not overwrite newer evidence',()=>{const a=recordEvidence({},tasks[0],'correct',2000),b=recordEvidence({},tasks[0],'incorrect',1000);assert.deepEqual(mergeEvidence(a,b),a);});
