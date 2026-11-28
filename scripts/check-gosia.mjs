import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'public/audio/gosia');
const groups=JSON.parse(fs.readFileSync(path.join(root,'scripts/gosia-coverage.json'),'utf8'));const file=path.join(out,'manifest.json');const manifest=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const ready=t=>{const f=manifest[t];return typeof f==='string'&&/^[a-f0-9]{64}\.mp3$/.test(f)&&fs.existsSync(path.join(out,f))&&fs.statSync(path.join(out,f)).size>0;};
let missing=0;for(const [name,texts] of Object.entries(groups)){const n=texts.filter(ready).length;missing+=texts.length-n;console.log(`${name}: ${n}/${texts.length} (${Math.round(100*n/Math.max(1,texts.length))}%)`);}if(missing)process.exitCode=1;
