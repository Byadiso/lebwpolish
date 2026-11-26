import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homePaths,homeSkills,getHomePath} from '../src/data/homeGuide.js';
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
test('home guide links resolve to public routes',()=>{const routes=[...app.matchAll(/<Route\s+path=["']([^"']+)["']\s+element=\{([^\n]*?)(?=\s*\/>)/g)];for(const [url] of [...homePaths.flatMap(p=>p.steps),...homeSkills]){const route=routes.find(r=>r[1]===url.split('?')[0]);assert.ok(route,url);assert.ok(!route[2].includes('ProtectedRoute'),url);}});
test('level selection defaults safely and each path has three steps',()=>{assert.equal(getHomePath('').id,'A1');assert.equal(getHomePath('unknown').id,'A1');for(const p of homePaths){assert.equal(getHomePath(p.id),p);assert.equal(p.steps.length,3);}});
