import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KoniugacjaMaster() {
  const [activeGroupId, setActiveGroupId] = useState("group-m");
  const [activeVerbInfinitive, setActiveVerbInfinitive] = useState("Czytać");
  const [activeTense, setActiveTense] = useState("present");
  const [selectedForm, setSelectedForm] = useState(null);

  const groups = [
    { id: "group-m", title: "-m / -sz", color: "#6366f1" },
    { id: "group-e", title: "-ę / -esz", color: "#f43f5e" },
    { id: "group-i", title: "-ę / -isz", color: "#10b981" },
    { id: "irregular", title: "B1 Mastery", color: "#f59e0b" },
  ];

  const conjugationData = {
    "group-m": {
      verbs: [
        {
          infinitive: "Czytać", perfective: "Przeczytać", translation: "To read",
          present: [
            { person: "Ja", form: "Czytam", ending: "m", rule: "First Person: Stem + m" },
            { person: "Ty", form: "Czytasz", ending: "sz", rule: "Second Person: Stem + sz" },
            { person: "On/a", form: "Czyta", ending: "", rule: "Third Person: Pure Stem" },
            { person: "My", form: "Czytamy", ending: "my", rule: "Plural: Stem + my" },
            { person: "Wy", form: "Czytacie", ending: "cie", rule: "Plural: Stem + cie" },
            { person: "Oni/e", form: "Czytają", ending: "ją", rule: "B1 Critical: -ać stems take -ją" },
          ],
          past: [
            { person: "Ja (M)", form: "Czytałem", ending: "łem", rule: "Male suffix -łem" },
            { person: "Ja (F)", form: "Czytałam", ending: "łam", rule: "Female suffix -łam" },
            { person: "Oni (Men)", form: "Czytali", ending: "li", rule: "Masculine Personal: ł -> l softening." },
            { person: "One (Non-M)", form: "Czytały", ending: "ły", rule: "Non-masculine plural keeps ł." },
          ],
          future: [{ person: "Ja", form: "Będę czytać", ending: "Będę", rule: "Być (Future) + Infinitive" }],
          tips: "A-stems are the most stable group. In the past, remember the 'ł' to 'l' softening for masculine personal plural!"
        },
        {
            infinitive: "Pisać", perfective: "Napisać", translation: "To write",
            present: [
              { person: "Ja", form: "Piszę", ending: "zę", rule: "Consonant shift: s -> sz" },
              { person: "Ty", form: "Piszesz", ending: "zesz", rule: "Standard -e group endings" },
              { person: "Oni/e", form: "Piszą", ending: "zą", rule: "3rd person plural nasal" },
            ],
            past: [{ person: "On", form: "Pisał", ending: "ał", rule: "Standard past" }],
            future: [{ person: "Ja", form: "Będę pisać", ending: "Będę", rule: "Future imperfective" }],
            tips: "The 's' shifts to 'sz' in all present forms. Very common B1 pattern."
        }
      ]
    },
  };

  const currentGroup = conjugationData[activeGroupId] || conjugationData["group-m"];
  const currentVerb = useMemo(() => {
    return currentGroup.verbs.find(v => v.infinitive === activeVerbInfinitive) || currentGroup.verbs[0];
  }, [activeGroupId, activeVerbInfinitive, currentGroup.verbs]);

  const activeGroupObj = groups.find(g => g.id === activeGroupId);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-white/10 font-sans antialiased overflow-hidden flex flex-col">
      
      {/* 🛠️ HEADER */}
      <header className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 p-4 shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* <div className="font-black uppercase tracking-tighter italic text-xl flex items-center gap-2">
                <span className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white not-italic text-sm">L</span>
                LEBW <span className="text-red-600">POLISH</span>
            </div> */}
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <nav className="hidden md:flex gap-1 bg-white/5 p-1 rounded-xl">
                {groups.map((g) => (
                <button
                    key={g.id}
                    onClick={() => { setActiveGroupId(g.id); setActiveVerbInfinitive(conjugationData[g.id]?.verbs[0].infinitive || "Czytać"); setSelectedForm(null); }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeGroupId === g.id ? "bg-white text-black" : "text-slate-500 hover:text-white"}`}
                >
                    {g.title}
                </button>
                ))}
            </nav>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                {["present", "past", "future"].map((t) => (
                    <button
                        key={t}
                        onClick={() => { setActiveTense(t); setSelectedForm(null); }}
                        className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTense === t ? "bg-white text-black" : "text-slate-500 hover:text-white"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col relative">
        <section className="px-8 pt-6 shrink-0">
            <div className="max-w-[1600px] mx-auto flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{currentVerb.infinitive}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-2xl font-medium italic text-slate-400">"{currentVerb.translation}"</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-indigo-500/20">Pair: {currentVerb.perfective}</span>
                    </div>
                </div>
                
                <div className="flex gap-2 max-w-2xl overflow-x-auto no-scrollbar">
                    {currentGroup.verbs.map(v => (
                        <button
                            key={v.infinitive}
                            onClick={() => {setActiveVerbInfinitive(v.infinitive); setSelectedForm(null);}}
                            className={`px-6 py-3 rounded-2xl border transition-all whitespace-nowrap ${activeVerbInfinitive === v.infinitive ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"}`}
                        >
                            <span className="text-sm font-black uppercase italic tracking-tighter">{v.infinitive}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>

        <section className="flex-1 p-8 overflow-y-auto no-scrollbar relative">
            <div className={`max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${selectedForm ? 'blur-md grayscale opacity-20 pointer-events-none' : ''}`}>
                <AnimatePresence mode="popLayout">
                    {currentVerb[activeTense]?.map((item, idx) => (
                        <motion.button
                            key={`${activeTense}-${item.form}`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedForm(item)}
                            className="bg-white/5 border border-white/5 p-12 rounded-[2.5rem] text-left hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 block">{item.person}</span>
                            <span className="text-6xl font-black tracking-tighter italic text-white group-hover:scale-105 transition-transform origin-left block">
                                {item.form.includes(item.ending) && item.ending !== "" ? (
                                    <>
                                        {item.form.substring(0, item.form.lastIndexOf(item.ending))}
                                        <span style={{ color: activeGroupObj.color }}>{item.ending}</span>
                                    </>
                                ) : item.form}
                            </span>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* 💡 CONTEXTUAL MODAL - Fixed Size & Color Palette */}
            <AnimatePresence>
                {selectedForm && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center p-8 z-50 backdrop-blur-md bg-black/40"
                        onClick={() => setSelectedForm(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-xl w-full rounded-[3rem] p-12 shadow-2xl border border-white/10 relative overflow-hidden bg-[#0f172a]"
                            style={{ borderLeft: `6px solid ${activeGroupObj.color}` }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setSelectedForm(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all"
                            >✕</button>
                            
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Grammar Breakdown</span>
                            
                            <h3 className="text-6xl font-black italic text-white uppercase mb-8 leading-none tracking-tighter">
                                {selectedForm.form.substring(0, selectedForm.form.lastIndexOf(selectedForm.ending))}
                                <span style={{ color: activeGroupObj.color }}>{selectedForm.ending}</span>
                            </h3>
                            
                            <div className="bg-white/5 p-8 rounded-3xl mb-10 border border-white/5">
                                <p className="text-slate-200 font-bold text-2xl leading-snug">{selectedForm.rule}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mastery Tip</span>
                                </div>
                                <p className="text-slate-400 font-medium italic pl-6 text-xl leading-relaxed border-l border-white/10">
                                    "{currentVerb.tips}"
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
      </main>
      
      <footer className="bg-slate-950 border-t border-white/5 px-8 py-3 shrink-0 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">B1 Polish Dashboard</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeGroupObj.color }} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{activeGroupObj.title}</span>
            </div>
      </footer>
    </div>
  );
}