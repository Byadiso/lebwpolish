import { useState } from 'react';
import { useLearningPersistence } from './useLearningStorage';
export default function useLessonCompletion(field, profile, user) {
 const {loadLocal, saveLocal} = useLearningPersistence();
 const key=`lebw.lessons.${user?.uid || 'guest'}.${field}`;
 const [local,setLocal]=useState(()=>{const stored=loadLocal(key,[]);return Array.isArray(stored)?stored:[];});
 const fromProfile=Array.isArray(profile?.[field])?profile[field]:[];
 const completed=[...new Set([...fromProfile,...local])];
 function mark(id){const next=[...new Set([...local,id])];setLocal(next);saveLocal(key,next);}
 return [completed,mark];
}
