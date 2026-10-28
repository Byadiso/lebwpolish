import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
// Award once per lesson, atomically, against the same profile the auth provider reads.
export async function recordLessonCompletion(user, field, id, xp, pointsField, points) {
 if(!user || !db)return false;
 const ref=doc(db,'users',user.uid);
 return runTransaction(db,async transaction=>{
  const snap=await transaction.get(ref);
  const profile=snap.exists()?snap.data():{};
  const completed=Array.isArray(profile[field])?profile[field]:[];
  if(completed.includes(id))return false;
  transaction.set(ref,{[field]:[...completed,id],xp:(Number(profile.xp)||0)+xp,[pointsField]:(Number(profile[pointsField])||0)+points},{merge:true});
  return true;
 });
}
