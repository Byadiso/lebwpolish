import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { activities } from '../src/data/activities.js';
import { resetScenarioStorage, scenarioKeys } from '../src/lib/scenarioStorage.js';
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
test('all activity links resolve to declared routes, including the new learning entry points',()=>{
 const routes=[...app.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map(m=>m[1].toLowerCase());
 for(const activity of activities)assert.ok(routes.includes(activity.path.toLowerCase()),`No route for ${activity.title}`);
 for(const route of ['/learn','/explore','/b1-writing'])assert.ok(routes.includes(route));
});
test('lazy page imports have matching project files',()=>{
 for(const [,path] of app.matchAll(/import\(["'](\.\/pages\/[^"']+)["']\)/g))assert.ok(['.jsx','.js','/index.js'].some(ext=>existsSync(new URL('../src/'+path.slice(2)+ext,import.meta.url))),path);
});
test('resetting everyday missions preserves other learning progress and preferences',()=>{
 const values=new Map([...scenarioKeys.map(key=>[key,'saved']),['lebwpolish.journey.v1','my journey'],['lebw.writing.drafts','my writing']]);
 resetScenarioStorage({removeItem:key=>values.delete(key)});
 assert.equal(values.size,2);assert.equal(values.get('lebwpolish.journey.v1'),'my journey');assert.equal(values.get('lebw.writing.drafts'),'my writing');
});
