import test from 'node:test';
import assert from 'node:assert/strict';
import {DIAGNOSTIC,SKILL_ROUTES,readinessSummary,sanitizeReadiness} from '../src/data/b1Readiness.js';
test('diagnostic questions have valid unique answers',()=>{assert.equal(new Set(DIAGNOSTIC.map(q=>q.id)).size,DIAGNOSTIC.length);for(const q of DIAGNOSTIC){assert.ok(q.options.length>=3);assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(q.why.length>15);}});
test('saved state strips unknown keys and invalid answers',()=>{const s=sanitizeReadiness({answers:{[DIAGNOSTIC[0].id]:0,evil:2,[DIAGNOSTIC[1].id]:999},checks:{0:true,1:'yes',999:true}});assert.deepEqual(s.answers,{[DIAGNOSTIC[0].id]:0});assert.deepEqual(s.checks,{0:true});});
test('readiness summary only scores answered items',()=>{const q=DIAGNOSTIC[0];const s=readinessSummary({[q.id]:q.answer});assert.equal(s[q.skill].answered,1);assert.equal(s[q.skill].correct,1);});
test('skill links are distinct and local',()=>{assert.equal(new Set(SKILL_ROUTES.map(s=>s.path)).size,SKILL_ROUTES.length);assert.ok(SKILL_ROUTES.every(s=>s.path.startsWith('/')));});
