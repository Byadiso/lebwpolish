// Original, instructional questions. This is NOT an official examination or score.
export const DIAGNOSTIC = [
 {id:'case-i',skill:'Grammar',prompt:'Jestem ___ (nauczyciel).',options:['nauczycielem','nauczycielu','nauczyciela'],answer:0,why:'After jestem + profession, use instrumental (narzędnik): nauczycielem.'},
 {id:'case-l',skill:'Grammar',prompt:'Pracuję w ___ (biuro).',options:['biurem','biurze','biuro'],answer:1,why:'For a static location after w, use locative (miejscownik): w biurze.'},
 {id:'aspect',skill:'Grammar',prompt:'Wczoraj ___ formularz i oddałem go w urzędzie.',options:['wypełniałem','wypełnię','wypełniłem'],answer:2,why:'Wypełniłem emphasizes a completed action in the past (masculine speaker).'},
 {id:'formal',skill:'Writing',prompt:'Choose the most appropriate opening for a formal email to an office.',options:['Szanowni Państwo,','Cześć!','Hej, co tam?'],answer:0,why:'Szanowni Państwo is a conventional formal salutation.'},
 {id:'request',skill:'Speaking',prompt:'Which is the most polite request to an unfamiliar official?',options:['Daj mi dokument.','Czy mogłaby Pani wyjaśnić, jakie dokumenty są potrzebne?','Co jest?'],answer:1,why:'Czy mogłaby Pani… is a polite formal request; adjust Pan/Pani to the addressee.'},
 {id:'connect',skill:'Writing',prompt:'Nie mogę przyjść, ___ mam wizytę u lekarza.',options:['chociaż','dlatego','ponieważ'],answer:2,why:'Ponieważ introduces a reason; dlatego introduces a consequence.'},
 {id:'read-1',skill:'Reading',passage:'Uwaga! W piątek biuro będzie czynne tylko do godziny 13:00. W poniedziałek wracamy do zwykłych godzin.',prompt:'When does the office close on Friday?',options:['At 13:00','At 15:00','It is closed all day'],answer:0,why:'„Tylko do godziny 13:00” indicates the closing time.'},
 {id:'read-2',skill:'Reading',passage:'Pociąg do Krakowa jest opóźniony o dwadzieścia minut z powodu awarii. Podróżni mogą czekać na peronie drugim.',prompt:'Why is the train delayed?',options:['Bad weather','A breakdown','A strike'],answer:1,why:'„Z powodu awarii” means because of a breakdown.'},
 {id:'opinion',skill:'Speaking',prompt:'Which phrase introduces a balanced comparison?',options:['Jak najszybciej','Od razu','Z jednej strony…, z drugiej strony…'],answer:2,why:'Use this pair to contrast two points of view and support an opinion.'},
 {id:'admin',skill:'Vocabulary',prompt:'Chciałbym ___ wniosek o kartę pobytu.',options:['złożyć','zgubić','odwołać'],answer:0,why:'Złożyć wniosek is the standard collocation for submitting an application.'},
 {id:'housing',skill:'Vocabulary',prompt:'W mieszkaniu nie działa ogrzewanie. Muszę ___ usterkę.',options:['przeprowadzić','zgłosić','zapomnieć'],answer:1,why:'Zgłosić usterkę means report a fault; zgłaszać is the imperfective partner.'},
 {id:'travel',skill:'Vocabulary',prompt:'Spóźniłem się ___ pociąg.',options:['do','w','na'],answer:2,why:'Spóźnić się na + accusative is used for being late for a train or appointment.'}
];
export const SKILL_ROUTES = [
 {name:'Vocabulary',path:'/b1-vocabulary',action:'Recall thematic chunks and revise difficult phrases'},
 {name:'Grammar',path:'/practice-polish-case',action:'Practice cases and explain why each ending is used'},
 {name:'Reading',path:'/Reading-comprehension',action:'Read texts and identify information and intention'},
 {name:'Writing',path:'/B1-writing',action:'Draft formal and informal messages with a checklist'},
 {name:'Speaking',path:'/PolishRolePlay',action:'Rehearse real-life requests, explanations and opinions'},
 {name:'Listening',path:'/practice',action:'Listen and reconstruct Polish phrases'}
];
export const WRITING_CHECKLIST = [
 'I addressed the reader using the correct formal or informal register.',
 'I answered every part of the prompt and included relevant details.',
 'I gave a reason, consequence, or example using connectors.',
 'I checked case endings, verb aspect, agreement and word order.',
 'I used a suitable opening and closing and checked spelling.'
];
export function sanitizeReadiness(raw){
 const result={answers:{},checks:{}};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const q of DIAGNOSTIC){const v=raw.answers?.[q.id];if(Number.isInteger(v)&&v>=0&&v<q.options.length)result.answers[q.id]=v;}
 for(let i=0;i<WRITING_CHECKLIST.length;i++)if(raw.checks?.[i]===true)result.checks[i]=true;
 return result;
}
export function readinessSummary(answers){
 const groups={};for(const q of DIAGNOSTIC){const g=groups[q.skill]??={correct:0,total:0,answered:0};g.total++;if(Object.hasOwn(answers,q.id)){g.answered++;if(answers[q.id]===q.answer)g.correct++;}}
 return groups;
}
