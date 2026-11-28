export const EVIDENCE_KEY='lebw.skillEvidence.v1';
export function mergeEvidence(a={},b={}) {
 const result={...a};
 for(const [id,event] of Object.entries(b||{})) if(event && Number.isFinite(event.at) && (!result[id] || event.at>=result[id].at)) result[id]=event;
 return result;
}
export function recordEvidence(previous,task,result,at=Date.now()) {
 return mergeEvidence(previous,{[task.id]:{skill:task.skill,result,at,due:at+(result==='incorrect'?600000:86400000)}});
}
export function summarizeEvidence(tasks,evidence,now=Date.now()) {
 return tasks.map(t=>({...t,evidence:evidence?.[t.id]})).filter(t=>t.evidence && t.evidence.due<=now);
}
