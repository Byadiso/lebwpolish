import test from 'node:test';
import assert from 'node:assert/strict';
import {GRAMMAR_GUIDE} from '../src/data/grammarGuide.js';
import {GRAMMAR_VAULT} from '../src/data/grammarVault.js';
import {normalizeAudioText} from '../src/lib/polishAudio.js';
test('all existing lesson IDs have beginner guides',()=>assert.deepEqual(Object.keys(GRAMMAR_GUIDE),GRAMMAR_VAULT.map(x=>x.id)));
for(const [id,g] of Object.entries(GRAMMAR_GUIDE))test(`${id}: examples and check are structurally valid`,()=>{assert.ok(g.examples.length>=2);for(const [pl,en,highlight] of g.examples){assert.ok(pl&&en&&highlight);assert.ok(pl.toLowerCase().includes(highlight.toLowerCase()));assert.equal(normalizeAudioText(pl),pl)}assert.ok(g.check[1][g.check[2]]);assert.ok(g.check[3]);const old=GRAMMAR_VAULT.find(x=>x.id===id);assert.ok(old.challenge.options.includes(old.challenge.correct));});
test('Polish text normalization retains diacritics',()=>assert.equal(normalizeAudioText('  Żółć   źródło  '),'Żółć źródło'));
