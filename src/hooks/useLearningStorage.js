import { useContext, useMemo, useSyncExternalStore } from 'react';
import { LearningContext } from '../context/LearningStateContext';
export function useLearningStorage(){
 const store=useContext(LearningContext);if(!store)throw Error('LearningProgressProvider is missing');
 useSyncExternalStore(store.subscribe,store.snapshot,store.serverSnapshot);return store;
}
export function useLearningPersistence(){
 const store=useLearningStorage();
 return useMemo(()=>({loadLocal:(key,fallback)=>{try{return JSON.parse(store.getItem(key))??fallback;}catch{return fallback;}},saveLocal:(key,value)=>{try{store.setItem(key,JSON.stringify(value));return true;}catch{return false;}}}),[store]);
}
export function useLearningValue(key,fallback){
 const store=useLearningStorage();const raw=store.getItem(key);
 const value=useMemo(()=>{try{return JSON.parse(raw)??fallback;}catch{return fallback;}},[raw,fallback]);
 function setValue(next){const current=(()=>{try{return JSON.parse(store.getItem(key))??fallback;}catch{return fallback;}})();store.setItem(key,JSON.stringify(typeof next==='function'?next(current):next));}
 return [value,setValue];
}
