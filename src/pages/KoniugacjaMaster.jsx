import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KoniugacjaMaster() {
  const [activeGroupId, setActiveGroupId] = useState("group-m");
  const [activeTense, setActiveTense] = useState("present"); 
  const [selectedVerb, setSelectedVerb] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const groups = [
    { id: "group-m", title: "-m / -sz", desc: "Most -ać verbs", color: "indigo" },
    { id: "group-e", title: "-ę / -esz", desc: "-ovac & Stem-changes", color: "rose" },
    { id: "group-i", title: "-ę / -isz", desc: "-ić / -yć verbs", color: "emerald" },
    { id: "irregular", title: "B1 Irregulars", desc: "High-stakes shifts", color: "amber" },
  ];

  const conjugationData = {
    "group-m": {
      verbs: [
        {
          infinitive: "Czytać",
          perfective: "Przeczytać",
          translation: "To read",
          present: [
            { person: "Ja", form: "Czytam", ending: "m", rule: "Present: Stem + m" },
            { person: "Ty", form: "Czytasz", ending: "sz", rule: "Present: Stem + sz" },
            { person: "On/a", form: "Czyta", ending: "", rule: "Present: Pure Stem" },
            { person: "My", form: "Czytamy", ending: "my", rule: "Present: Stem + my" },
            { person: "Wy", form: "Czytacie", ending: "cie", rule: "Present: Stem + cie" },
            { person: "Oni/e", form: "Czytają", ending: "ją", rule: "B1 Note: 3rd person plural uses -ją for -ać stems." },
          ],
          past: [
            { person: "Ja (M)", form: "Czytałem", ending: "łem", rule: "Male Past: Stem + ł + em" },
            { person: "Ja (F)", form: "Czytałam", ending: "łam", rule: "Female Past: Stem + ł + am" },
            { person: "On", form: "Czytał", ending: "ł", rule: "3rd Person Male Suffix: -ł" },
            { person: "Ona", form: "Czytała", ending: "ła", rule: "3rd Person Female Suffix: -ła" },
            { person: "Oni (Men)", form: "Czytali", ending: "li", rule: "B1 CRITICAL: Masculine Personal plural softens 'ł' to 'l'." },
            { person: "One (Non-M)", form: "Czytały", ending: "ły", rule: "Non-masculine plural keeps hard 'ł'." },
          ],
          future: [
            { person: "Ja", form: "Będę czytać", ending: "Będę", rule: "Future: Być (Personal) + Infinitive" },
            { person: "Ty", form: "Będziesz czytać", ending: "Będziesz", rule: "The auxiliary 'być' conjugates while 'czytać' stays same." },
            { person: "On/a", form: "Będzie czytać", ending: "Będzie", rule: "3rd person future auxiliary + infinitive" },
            { person: "My", form: "Będziemy czytać", ending: "Będziemy", rule: "1st person plural future" },
            { person: "Wy", form: "Będziecie czytać", ending: "Będziecie", rule: "2nd person plural future" },
            { person: "Oni/e", form: "Będą czytać", ending: "Będą", rule: "3rd person plural future" },
          ],
          tips: "B1 Rule: In the past tense, gender is everything. In the future tense, the auxiliary 'być' is your best friend."
        }
      ]
    },
    // Adding placeholder for other groups to prevent crashes
    "group-e": { verbs: [{ infinitive: "Pracować", translation: "To work", present: [], past: [], future: [], tips: "" }] },
    "group-i": { verbs: [{ infinitive: "Mówić", translation: "To speak", present: [], past: [], future: [], tips: "" }] },
    "irregular": { verbs: [{ infinitive: "Jechać", translation: "To go", present: [], past: [], future: [], tips: "" }] }
  };

  const currentContent = conjugationData[activeGroupId] || conjugationData["group-m"];
  const currentVerb = currentContent.verbs[0];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans antialiased">
      
      {/* ⚡ NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[90] bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsMenuOpen(true)} className="font-black uppercase tracking-tighter italic text-xl">
              LEBW <span className="text-red-600">POLISH</span>
            </button>
            
            <nav className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="hover:text-white cursor-pointer">Writing Space</span>
              <span className="hover:text-white cursor-pointer text-white underline decoration-red-600 underline-offset-8">Practice Grammar</span>
            </nav>
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {["present", "past", "future"].map((tense) => (
              <button
                key={tense}
                onClick={() => { setActiveTense(tense); setSelectedVerb(null); }}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTense === tense ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
              >
                {tense}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 p-6 pt-44 pb-32">
        
        <div className="lg:col-span-7 space-y-12">
          <header>
            <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{currentVerb.infinitive}</h2>
            <p className="text-slate-400 text-xl font-medium italic mt-2 mb-6">"{currentVerb.translation}"</p>
            
            <div className="flex items-center gap-4">
               <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-1 rounded-full text-[10px] font-black uppercase">Aspect Pair</span>
               <span className="text-indigo-400 font-bold uppercase tracking-widest">{currentVerb.perfective || "---"}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* THE GUARD: Only map if the tense data exists */}
            {currentVerb[activeTense]?.length > 0 ? (
              currentVerb[activeTense].map((item, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                  onClick={() => setSelectedVerb(item)}
                  className={`group p-8 rounded-3xl bg-white/5 border flex flex-col items-start transition-all text-left ${selectedVerb?.form === item.form ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-white/5'}`}
                >
                  <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">{item.person}</span>
                  <span className="text-3xl font-bold tracking-tight">
                    {/* Visual trick: only color the specific ending string if it exists */}
                    {item.form.includes(item.ending) && item.ending !== "" ? (
                      <>
                        {item.form.substring(0, item.form.lastIndexOf(item.ending))}
                        <span className="text-indigo-400">{item.ending}</span>
                      </>
                    ) : item.form}
                  </span>
                </motion.button>
              ))
            ) : (
              <div className="col-span-2 p-10 border border-dashed border-white/10 rounded-3xl text-center text-slate-500 italic">
                Data for this tense is coming soon...
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-5 hidden lg:block">
          <div className="sticky top-44">
            <AnimatePresence mode="wait">
              {selectedVerb ? (
                <motion.div
                  key={selectedVerb.form}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-indigo-600 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/5 italic select-none">B1</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-6 block underline decoration-white/20 underline-offset-8">Logic Breakdown</span>
                  <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none">{selectedVerb.form}</h2>
                  
                  <div className="bg-black/20 p-6 rounded-2xl mb-8 border border-white/10">
                    <p className="text-indigo-100 font-bold text-lg leading-relaxed">{selectedVerb.rule}</p>
                  </div>

                  <p className="text-indigo-50/70 font-medium italic border-l-2 border-white/20 pl-4 leading-relaxed">
                    "{currentVerb.tips}"
                  </p>
                </motion.div>
              ) : (
                <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center opacity-40">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Select a {activeTense} form to see the rule</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </main>
    </div>
  );
}