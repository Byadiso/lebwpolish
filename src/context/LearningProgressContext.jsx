import { useEffect, useState, useSyncExternalStore } from 'react';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from './AuthContext';
import { applyLearningOperation, LearningStore } from '../lib/learningSync';
import { LearningContext } from './LearningStateContext';
import { useLearningStorage } from '../hooks/useLearningStorage';
function browserStorage(){try{return window.localStorage;}catch{return {getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');},removeItem:()=>{}};}}
function AccountProgress({uid,children}) {
 const [store]=useState(()=>new LearningStore({uid,storage:browserStorage()}));
 useSyncExternalStore(store.subscribe,store.snapshot,store.serverSnapshot);
 useEffect(()=>{
  if(!uid||!db)return;
  const ref=doc(db,'users',uid);let stop=()=>{};let timer;let active=true;
  function connect(){
   store.beginLoading();
   stop();clearTimeout(timer);
   timer=setTimeout(()=>{if(active&&!store.ready)store.unavailable();},8000);
   stop=onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
    if(!active||snapshot.metadata.fromCache)return;
    clearTimeout(timer);store.receive(snapshot.data()?.learningData||{});
   },()=>{if(active){clearTimeout(timer);store.unavailable();}});
  }
  store.attachRemote({retry:connect,commitBatch:operations=>runTransaction(db,async tx=>{
   const snapshot=await tx.get(ref);const profile=snapshot.data()||{};
   const applied=profile.learningApplied||[];
   let learningData=profile.learningData||{};
   const fresh=operations.filter(op=>!applied.includes(op.id));
   if(!fresh.length)return learningData;
   for(const op of fresh)learningData=applyLearningOperation(learningData,op);
   const changes={learningData,learningApplied:[...applied,...fresh.map(op=>op.id)].slice(-128)};
   if(snapshot.exists())tx.update(ref,changes);else tx.set(ref,changes);
   return learningData;
  })});
  connect();const online=()=>{connect();store.retry();};window.addEventListener('online',online);
  return()=>{active=false;clearTimeout(timer);stop();window.removeEventListener('online',online);store.detachRemote();};
 },[uid,store]);
 return <LearningContext.Provider value={store}>{store.ready?children:<main className="refresh-root"><h1 className="text-2xl font-black">{store.status==='error'?'Account progress could not load.':'Loading your account progress…'}</h1>{store.status==='error'&&<><p className="my-5">Check your connection and Firebase access, then retry. Your browser’s guest progress is kept separate.</p><button className="refresh-button" onClick={store.retry}>Retry account sync</button><button className="refresh-secondary ml-3" onClick={() => auth?.signOut().catch(() => store.unavailable())}>Sign out and practise as guest</button></>}</main>}</LearningContext.Provider>;
}
export function LearningProgressProvider({children}) {
 const {user}=useAuth();return <AccountProgress key={user?.uid||'guest'} uid={user?.uid||null}>{children}</AccountProgress>;
}
export function AccountSaveStatus(){
 const store=useLearningStorage();
 const text=!store.uid?(store.status==='guest-error'?'Browser saving is unavailable. Guest progress will be lost when you leave.':'Guest progress stays in this browser on this device.'):store.status==='saved'?'Progress saved to your account.':store.status==='syncing'?'Saving progress to your account…':store.backedUp?'Account sync is unavailable. Changes are kept on this device until sync succeeds.':'Account sync is unavailable. Keep this tab open to avoid losing unsynced changes.';
 return <span role="status">{text}{store.uid&&store.status==='error'&&<button className="underline ml-2" onClick={store.retry}>Retry sync</button>}</span>;
}

export function AccountSyncBanner(){
 const store=useLearningStorage();
 return store.uid && store.status!=='saved' ? <div className="app-guest-notice"><AccountSaveStatus /></div> : null;
}
