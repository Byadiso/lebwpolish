import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeAudioText} from '../src/lib/polishAudio.js';
import {words} from '../src/data/wordBank.js';
import {missions} from '../src/data/journey.js';
import {tasks} from '../src/data/skillPractice.js';
import {READING_VAULT} from '../src/data/readingVault.js';
import {GRAMMAR_GUIDE} from '../src/data/grammarGuide.js';
import {GRAMMAR_VAULT} from '../src/data/grammarVault.js';
import {casePractice} from '../src/data/casePractice.js';
import {CASES_VAULT} from '../src/data/casesVault.js';
import {VOCAB_VAULT} from '../src/data/vocabVault.js';
import {B1_BLOCKS} from '../src/data/b1VocabularyBlocks.js';
import {FORGE_DATA} from '../src/data/ForgeData.js';
import {missions as everyday} from '../src/data/MissionData.js';
import * as arena from '../src/pages/PolishArena/data.js';
import {DIAGNOSTIC} from '../src/data/b1Readiness.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const groups={};let group;
const add=x=>{if(typeof x==='string'&&x.trim()&&/\p{L}/u.test(x))groups[group].add(normalizeAudioText(x));};
const use=(name,fn)=>{group=name;groups[name]=new Set();fn();};
// Evaluate only known, checked-in literal data declarations, never user content.
function literal(file,name){const source=read('src/pages/'+file+'.jsx');const match=new RegExp('const '+name+'\\s*=\\s*').exec(source);if(!match)throw Error(name);const tail=source.slice(match.index+match[0].length);const end=tail.indexOf(';\n');if(end<0)throw Error(name);return Function('return ('+tail.slice(0,end)+')')();}
function walk(x,keys){if(Array.isArray(x))x.forEach(v=>walk(v,keys));else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){if(keys.includes(k)){if(Array.isArray(v))v.forEach(add);else add(v);}walk(v,keys);}}
const cleanStory=s=>s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"«»—]/g,'').toLowerCase().trim();
use('Word Bank',()=>{words.forEach(w=>add(w.pl));for(const [word,sentence] of literal('WordBank','drills')){add(sentence.replace('___','…'));add(sentence.replace('___',word));}});
use('Daily Journey',()=>{for(const m of missions){add(m.example);for(const w of m.words){add(w.pl);add(w.example);}for(const t of m.tasks)t.answers.forEach(add);}});
use('Skills Practice',()=>{for(const t of tasks){add(t.source);if(t.options){if(t.skill!=='Vocabulary')add(t.prompt.replace(/_{2,}/g,' … '));t.options.forEach(add);}else add(t.feedback);}});
use('Practice Studio',()=>{for(const d of JSON.parse(read('src/data/drills.json'))){add(d.polish);d.alternatives?.forEach(add);}add('Świetnie!');add('Spróbuj ponownie.');});
use('Reading Detective',()=>{for(const r of READING_VAULT){add(r.text);r.text.split(/\n\s*\n/).forEach(add);Object.keys(r.glossary).forEach(add);r.text.split(/\s+/).forEach(add);}});
use('Read a Story',()=>{const story=literal('PolishReadingEngine','STORY_DATA');for(const p of story.pages){add(p.paragraphs.join(' '));p.paragraphs.forEach(s=>{add(s);s.split(' ').map(cleanStory).forEach(add);});}Object.keys(story.vocabulary).forEach(add);Object.keys(literal('PolishReadingEngine','POLISH_DICTIONARY')).forEach(add);});
for(const [name,data] of [['Grammar Codex',GRAMMAR_VAULT],['Case Codex',CASES_VAULT],['Vocabulary Vault',VOCAB_VAULT]])use(name,()=>{for(const d of data){for(const s of d.sections||[])add(s.ex?.replace(/\([^)]*\)/g,''));walk(d,['options','correct','wrong']);}});
group='Case Codex';for(const c of Object.values(casePractice)){for(const e of c.examples)add(e[0]);for(const q of c.questions)add(q.full);}
group='Grammar Codex';for(const g of Object.values(GRAMMAR_GUIDE))for(const e of g.examples)add(e[0]);
use('Verb Workshop',()=>walk(literal('KoniugacjaMaster','CONJUGATION_DATA'),['infinitive','perfective','form','example']));
use('Role-play Studio',()=>{const scenarios=literal('PolishRolePlay','SCENARIOS');walk(scenarios,['words','phrases','character','mission','suspects','title']);for(const s of scenarios)add([s.character,s.mission,...s.phrases].join('. '));});
use('Writing Studio',()=>walk(literal('WritingStudio','prompts'),['opening','ending']));
use('One Word Closer',()=>walk(literal('B1ShadowBoxer','challenges'),['prompt','target']));
use('B1 Vocabulary',()=>walk(B1_BLOCKS,['phrase','answer','options']));
use('Sentence Forge',()=>{for(const d of FORGE_DATA){add(d.translation);add(d.correctSequence.join(' '));d.correctSequence.forEach(add);d.distractors.forEach(add);}});
use('Everyday Missions',()=>walk(everyday,['correct']));
use('B1 Readiness',()=>{for(const d of DIAGNOSTIC){add(d.passage);if(d.prompt.includes('___'))add(d.prompt.replace(/_{2,}/g,' … '));if(d.skill!=='Reading')d.options.forEach(add);}});
use('Polish Arena',()=>{walk(arena,['pl','word']);for(const d of arena.STORY_PARTS)add((d.prompt.match(/"([^"]+)"/)||[])[1]);for(const s of arena.SUBJECTS)for(const v of arena.VERBS)for(const o of arena.OBJECTS)add([s.pl,v.pl,o.pl].join(' '));});
use('Music vocabulary',()=>{for(const file of fs.readdirSync(path.join(root,'public/songs')).filter(f=>f.endsWith('.json')))walk(JSON.parse(read('public/songs/'+file)),['pl']);});
const all=[...new Set(Object.values(groups).flatMap(s=>[...s]))];
fs.writeFileSync(path.join(root,'scripts/gosia-texts.json'),JSON.stringify(all,null,2));fs.writeFileSync(path.join(root,'scripts/gosia-coverage.json'),JSON.stringify(Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,[...v]])),null,2));console.log(`${all.length} unique clips across ${Object.keys(groups).length} groups`);
