import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createServer}=await import('vite');
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {MemoryRouter}=require('react-router-dom');
const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
globalThis.localStorage=storage;globalThis.window={localStorage:storage,innerWidth:390,innerHeight:844,matchMedia:()=>({matches:false,addListener(){},removeListener(){}}),addEventListener(){},removeEventListener(){}};
for(const key of ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'])process.env[key]='';
const server=await createServer({root:new URL('../',import.meta.url).pathname,server:{middlewareMode:true,host:'127.0.0.1'},appType:'custom'});
const {AuthProvider}=await server.ssrLoadModule('/src/context/AuthContext.jsx');
const {LearningProgressProvider}=await server.ssrLoadModule('/src/context/LearningProgressContext.jsx');
const pages=['ClozeLab','Home','DailyJourney','Explore','WritingStudio','PracticeLab','GrammarGauntlet','VocabularyVault','PolishWarForge','LirycznaSymfonia','ScenarioEngine','PolishReadingEngine','PolishCaseCodex','ReadingComprehension','KoniugacjaMaster','B1ShadowBoxer','PolishArena/PolishArena','PolishWithMeme','PolishRolePlay'];
let failed=0;
for(const name of pages){
 try{
  const {default:Page}=await server.ssrLoadModule('/src/pages/'+name+'.jsx');
  const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/learn']},React.createElement(AuthProvider,null,React.createElement(LearningProgressProvider,null,React.createElement(Page)))));
  const text=html.replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,'');
  if(text.includes('[icon:'))throw Error('Visible unresolved icon token');
  if(/\p{Extended_Pictographic}/u.test(text))throw Error('Visible emoji remains');
  console.log('PASS',name,html.length,'bytes');
 }catch(e){failed++;console.log('FAIL',name,e.stack?.split('\n').slice(0,3).join(' '));}
}
await server.close();if(failed)process.exitCode=1;
