// Static Gosia clips first; no remote synthesis service or API key.
export const normalizeAudioText = text => text.normalize('NFC').trim().replace(/\s+/gu,' ');
let active, manifest;
const listeners=new Set();
export function subscribeAudio(fn){listeners.add(fn);fn(Boolean(active));return ()=>listeners.delete(fn);}
function notify(){for(const fn of listeners)fn(Boolean(active));}
export function stopAudio(){const old=active;active=null;old?.stop();globalThis.speechSynthesis?.cancel();notify();}
export function playAudio(text,{rate=1,lang='pl-PL',onStart=()=>{},onEnd=()=>{},onError=()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event('lebw:audio-error'));},onSource=()=>{},onTime=()=>{}}={}){
 if(typeof text!=='string'||!text.trim())return;
 stopAudio(); let audio,utterance; const token={stop(){if(audio){audio.pause();audio.removeAttribute('src');audio.load();}onEnd();}};active=token;notify();
 const finish=(error=false)=>{if(active!==token)return;active=null;if(error&&audio){audio.pause();audio.removeAttribute('src');audio.load();}notify();onEnd();if(error)onError();};
 const fallback=()=>{if(active!==token)return;try{const synth=globalThis.speechSynthesis;if(!synth||!globalThis.SpeechSynthesisUtterance)return finish(true);utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang;utterance.rate=rate;const voice=synth.getVoices().find(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));if(voice)utterance.voice=voice;else if(lang.toLowerCase().startsWith('pl')&&synth.getVoices().length)return finish(true);utterance.onstart=()=>{if(active===token){onSource('browser');onStart();}};utterance.onend=()=>finish();utterance.onerror=()=>finish(true);synth.speak(utterance);}catch{finish(true);}};
 const cancel=()=>{if(active===token)stopAudio();};
 if(!lang.toLowerCase().startsWith('pl')){fallback();return cancel;}
 const base=import.meta.env?.BASE_URL||'/';
 manifest??=fetch(`${base}audio/gosia/manifest.json`,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Audio index unavailable');return r.json();}).catch(()=>{manifest=null;return {};});
 manifest.then(map=>{if(active!==token)return;const file=map[normalizeAudioText(text)];if(typeof file!=='string'||! /^[a-f0-9]{64}\.mp3$/.test(file)){manifest=null;fallback();return;}try{audio=new Audio(`${base}audio/gosia/${file}`);audio.playbackRate=rate;audio.preservesPitch=true;let failed=false;const recover=()=>{if(failed||active!==token)return;failed=true;audio.pause();audio.removeAttribute('src');audio.load();audio=null;manifest=null;onTime(0,0);fallback();};audio.ontimeupdate=()=>{if(active===token&&audio)onTime(audio.currentTime,audio.duration);};audio.onloadedmetadata=audio.ontimeupdate;audio.onended=()=>{if(!failed)finish();};audio.onerror=recover;audio.play().then(()=>{if(active===token&&!failed){onSource('gosia');onStart();}}).catch(recover);}catch{manifest=null;fallback();}});
 cancel.pause=()=>{if(active!==token)return;if(audio&&!audio.error)audio.pause();else globalThis.speechSynthesis?.pause();};
 cancel.resume=()=>{if(active!==token)return;if(audio&&!audio.error)audio.play().catch(()=>finish(true));else globalThis.speechSynthesis?.resume();};
 cancel.seek=t=>{if(active===token&&audio&&Number.isFinite(audio.duration))audio.currentTime=t;};
 cancel.setRate=r=>{if(active===token&&audio)audio.playbackRate=r;};
 return cancel;
}
