import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   FULL CONJUGATION DATA
═══════════════════════════════════════════════════════════════ */
const CONJUGATION_DATA = {
  "group-m": {
    title: "-m / -sz",
    color: "#6366f1",
    glyph: "α",
    desc: "A-stem verbs — the most stable group",
    verbs: [
      {
        infinitive: "Czytać", perfective: "Przeczytać", translation: "to read", emoji: "📖",
        present: [
          { person: "Ja",     form: "Czytam",    ending: "m",   stem: "Czyta",  rule: "1st sg: stem + -m",          example: "Czytam książkę codziennie." },
          { person: "Ty",     form: "Czytasz",   ending: "sz",  stem: "Czyta",  rule: "2nd sg: stem + -sz",         example: "Co czytasz teraz?" },
          { person: "On/Ona", form: "Czyta",     ending: "",    stem: "Czyta",  rule: "3rd sg: pure stem",          example: "Ona czyta bardzo szybko." },
          { person: "My",     form: "Czytamy",   ending: "my",  stem: "Czyta",  rule: "1st pl: stem + -my",         example: "Czytamy razem." },
          { person: "Wy",     form: "Czytacie",  ending: "cie", stem: "Czyta",  rule: "2nd pl: stem + -cie",        example: "Czy czytacie gazetę?" },
          { person: "Oni/One",form: "Czytają",   ending: "ją",  stem: "Czyta",  rule: "3rd pl: -ać stems → -ją",   example: "Oni czytają w ciszy." },
        ],
        past: [
          { person: "Ja (M)",   form: "Czytałem",  ending: "łem", stem: "Czyta", rule: "Masc. 1st sg: stem + -łem",  example: "Czytałem do późna." },
          { person: "Ja (F)",   form: "Czytałam",  ending: "łam", stem: "Czyta", rule: "Fem. 1st sg: stem + -łam",   example: "Czytałam całą noc." },
          { person: "Ty (M)",   form: "Czytałeś",  ending: "łeś", stem: "Czyta", rule: "Masc. 2nd sg: stem + -łeś",  example: "Czytałeś tę książkę?" },
          { person: "On",       form: "Czytał",    ending: "ł",   stem: "Czyta", rule: "Masc. 3rd sg: stem + -ł",    example: "On czytał przez godzinę." },
          { person: "Ona",      form: "Czytała",   ending: "ła",  stem: "Czyta", rule: "Fem. 3rd sg: stem + -ła",    example: "Ona czytała powieść." },
          { person: "Oni",      form: "Czytali",   ending: "li",  stem: "Czyta", rule: "Masc.pers. pl: ł→l softening", example: "Czytali razem na głos." },
          { person: "One",      form: "Czytały",   ending: "ły",  stem: "Czyta", rule: "Non-masc. pl: stem + -ły",   example: "One czytały wieczorem." },
        ],
        future: [
          { person: "Ja",      form: "Będę czytać",    ending: "czytać",    stem: "Będę ",    rule: "Imperfective: będę + inf.",    example: "Będę czytać jutro." },
          { person: "Ty",      form: "Będziesz czytać",ending: "czytać",    stem: "Będziesz ",rule: "2nd sg future: będziesz + inf.",example: "Czy będziesz czytać?" },
          { person: "Ja (pf)", form: "Przeczytam",     ending: "m",         stem: "Przeczyta",rule: "Perfective future: new stem",   example: "Przeczytam to do jutra." },
        ],
        tips: "A-stems are the most predictable group. The key trap is the 3rd person plural: 'czytają' not 'czytajają'. The -ać ending always gives -ają.",
      },
      {
        infinitive: "Pisać", perfective: "Napisać", translation: "to write", emoji: "✍️",
        present: [
          { person: "Ja",      form: "Piszę",    ending: "ę",   stem: "Pisz",  rule: "Consonant shift: s→sz, then + -ę",  example: "Piszę list do przyjaciela." },
          { person: "Ty",      form: "Piszesz",  ending: "esz", stem: "Pisz",  rule: "2nd sg: pisz + -esz",              example: "Piszesz bardzo ładnie." },
          { person: "On/Ona",  form: "Pisze",    ending: "e",   stem: "Pisz",  rule: "3rd sg: pisz + -e",                example: "Ona pisze powieść." },
          { person: "My",      form: "Piszemy",  ending: "emy", stem: "Pisz",  rule: "1st pl: pisz + -emy",              example: "Piszemy projekt razem." },
          { person: "Wy",      form: "Piszecie", ending: "ecie",stem: "Pisz",  rule: "2nd pl: pisz + -ecie",             example: "Piszecie raport?" },
          { person: "Oni/One", form: "Piszą",    ending: "ą",   stem: "Pisz",  rule: "3rd pl: pisz + -ą",               example: "Oni piszą egzamin." },
        ],
        past: [
          { person: "Ja (M)",  form: "Pisałem",  ending: "łem", stem: "Pisa", rule: "Past returns to a-stem: pisa-",    example: "Pisałem całą dobę." },
          { person: "Ja (F)",  form: "Pisałam",  ending: "łam", stem: "Pisa", rule: "Fem. 1st sg: pisałam",             example: "Pisałam przez rok." },
          { person: "On",      form: "Pisał",    ending: "ł",   stem: "Pisa", rule: "3rd sg masc: pisa + -ł",           example: "On pisał wolno." },
          { person: "Ona",     form: "Pisała",   ending: "ła",  stem: "Pisa", rule: "3rd sg fem: pisa + -ła",           example: "Ona pisała pięknie." },
          { person: "Oni",     form: "Pisali",   ending: "li",  stem: "Pisa", rule: "Masc.pers. pl: ł→l",               example: "Pisali razem." },
        ],
        future: [
          { person: "Ja",      form: "Będę pisać",   ending: "pisać",  stem: "Będę ",    rule: "Imperfective future",            example: "Będę pisać więcej." },
          { person: "Ja (pf)", form: "Napiszę",      ending: "ę",      stem: "Napi sz",  rule: "Perfective: napiszę",            example: "Napiszę ci jutro." },
        ],
        tips: "The 's→sz' shift happens ONLY in the present tense. In the past tense, the stem returns to 'pisa-'. Don't carry the shift into the past!",
      },
      {
        infinitive: "Słuchać", perfective: "Posłuchać", translation: "to listen", emoji: "🎧",
        present: [
          { person: "Ja",      form: "Słucham",   ending: "m",   stem: "Słucha", rule: "Regular a-stem: słucha + -m",   example: "Słucham muzyki klasycznej." },
          { person: "Ty",      form: "Słuchasz",  ending: "sz",  stem: "Słucha", rule: "2nd sg: słucha + -sz",          example: "Czy słuchasz radia?" },
          { person: "On/Ona",  form: "Słucha",    ending: "",    stem: "Słucha", rule: "3rd sg: pure stem",             example: "On słucha uważnie." },
          { person: "My",      form: "Słuchamy",  ending: "my",  stem: "Słucha", rule: "1st pl: słucha + -my",          example: "Słuchamy razem podcastu." },
          { person: "Wy",      form: "Słuchacie", ending: "cie", stem: "Słucha", rule: "2nd pl: słucha + -cie",         example: "Słuchacie wykładu?" },
          { person: "Oni/One", form: "Słuchają",  ending: "ją",  stem: "Słucha", rule: "3rd pl: -ją (a-stem pattern)", example: "Słuchają z uwagą." },
        ],
        past: [
          { person: "Ja (M)",  form: "Słuchałem", ending: "łem", stem: "Słucha", rule: "Masc. 1st sg",                 example: "Słuchałem całą noc." },
          { person: "Ona",     form: "Słuchała",  ending: "ła",  stem: "Słucha", rule: "Fem. 3rd sg",                  example: "Ona słuchała muzyki." },
          { person: "Oni",     form: "Słuchali",  ending: "li",  stem: "Słucha", rule: "Masc.pers. pl",                example: "Słuchali w ciszy." },
        ],
        future: [
          { person: "Ja",      form: "Będę słuchać",  ending: "słuchać", stem: "Będę ",  rule: "Imperfective future",  example: "Będę słuchać podcastów." },
          { person: "Ja (pf)", form: "Posłucham",     ending: "m",       stem: "Posłucha",rule: "Perfective: posłucham",example: "Posłucham twojej rady." },
        ],
        tips: "'Słuchać' is governed by the Genitive: 'słucham MUZYKI' not 'muzykę'. Very common B1 error to avoid!",
      },
    ],
  },
  "group-e": {
    title: "-ę / -esz",
    color: "#f43f5e",
    glyph: "β",
    desc: "E-stem verbs — watch the consonant shifts",
    verbs: [
      {
        infinitive: "Mówić", perfective: "Powiedzieć", translation: "to speak", emoji: "🗣️",
        present: [
          { person: "Ja",      form: "Mówię",    ending: "ię",  stem: "Mów",  rule: "1st sg: mów + -ię (softening)", example: "Mówię po polsku." },
          { person: "Ty",      form: "Mówisz",   ending: "isz", stem: "Mów",  rule: "2nd sg: mów + -isz",            example: "Mówisz pięknie." },
          { person: "On/Ona",  form: "Mówi",     ending: "i",   stem: "Mów",  rule: "3rd sg: mów + -i",              example: "Ona mówi wolno." },
          { person: "My",      form: "Mówimy",   ending: "imy", stem: "Mów",  rule: "1st pl: mów + -imy",            example: "Mówimy po angielsku." },
          { person: "Wy",      form: "Mówicie",  ending: "icie",stem: "Mów",  rule: "2nd pl: mów + -icie",           example: "Mówicie za szybko." },
          { person: "Oni/One", form: "Mówią",    ending: "ią",  stem: "Mów",  rule: "3rd pl: mów + -ią",             example: "Mówią o nas." },
        ],
        past: [
          { person: "Ja (M)",  form: "Mówiłem",  ending: "łem", stem: "Mówi", rule: "Masc. 1st sg: mówiłem",          example: "Mówiłem prawdę." },
          { person: "Ja (F)",  form: "Mówiłam",  ending: "łam", stem: "Mówi", rule: "Fem. 1st sg: mówiłam",           example: "Mówiłam ci wcześniej." },
          { person: "On",      form: "Mówił",    ending: "ł",   stem: "Mówi", rule: "3rd sg masc: mówił",             example: "On mówił za głośno." },
          { person: "Ona",     form: "Mówiła",   ending: "ła",  stem: "Mówi", rule: "3rd sg fem: mówiła",             example: "Ona mówiła po cichu." },
          { person: "Oni",     form: "Mówili",   ending: "li",  stem: "Mówi", rule: "Masc.pers. pl: ł→l",             example: "Mówili przez godzinę." },
          { person: "One",     form: "Mówiły",   ending: "ły",  stem: "Mówi", rule: "Non-masc. pl: mówiły",           example: "One mówiły po cichu." },
        ],
        future: [
          { person: "Ja",      form: "Będę mówić",  ending: "mówić", stem: "Będę ", rule: "Imperfective future",       example: "Będę mówić po polsku." },
          { person: "Ja (pf)", form: "Powiem",       ending: "iem",   stem: "Pow",   rule: "Perfective: suppletive form!",example: "Powiem ci tajemnicę." },
        ],
        tips: "CRITICAL: The perfective of 'mówić' is 'powiedzieć' — a completely different stem! 'Powiem, powiesz, powie...' This is a B1 trap many learners fall into.",
      },
      {
        infinitive: "Rozumieć", perfective: "Zrozumieć", translation: "to understand", emoji: "💡",
        present: [
          { person: "Ja",      form: "Rozumiem",   ending: "iem",  stem: "Rozum",  rule: "1st sg: rozum + -iem",         example: "Rozumiem po polsku." },
          { person: "Ty",      form: "Rozumiesz",  ending: "iesz", stem: "Rozum",  rule: "2nd sg: rozum + -iesz",        example: "Rozumiesz to pytanie?" },
          { person: "On/Ona",  form: "Rozumie",    ending: "ie",   stem: "Rozum",  rule: "3rd sg: rozum + -ie",          example: "Ona rozumie wszystko." },
          { person: "My",      form: "Rozumiemy",  ending: "iemy", stem: "Rozum",  rule: "1st pl: rozum + -iemy",        example: "Rozumiemy się dobrze." },
          { person: "Wy",      form: "Rozumiecie", ending: "iecie",stem: "Rozum",  rule: "2nd pl: rozum + -iecie",       example: "Rozumiecie lekcję?" },
          { person: "Oni/One", form: "Rozumieją",  ending: "ieją", stem: "Rozum",  rule: "3rd pl: rozum + -ieją",        example: "Rozumieją go wszyscy." },
        ],
        past: [
          { person: "Ja (M)",  form: "Rozumiałem", ending: "łem", stem: "Rozumia", rule: "Vowel shift: rozumia- in past", example: "Rozumiałem każde słowo." },
          { person: "Ona",     form: "Rozumiała",  ending: "ła",  stem: "Rozumia", rule: "Fem. 3rd sg: rozumiała",        example: "Rozumiała wszystko." },
          { person: "Oni",     form: "Rozumieli",  ending: "li",  stem: "Rozumie", rule: "Masc.pers. pl: rozumieli",      example: "Rozumieli go perfekcyjnie." },
        ],
        future: [
          { person: "Ja",      form: "Będę rozumieć", ending: "rozumieć", stem: "Będę ",    rule: "Imperfective future",      example: "Będę rozumieć lepiej." },
          { person: "Ja (pf)", form: "Zrozumiem",     ending: "iem",      stem: "Zrozum",   rule: "Perfective: zrozumiem",    example: "Zrozumiem to jutro." },
        ],
        tips: "The past tense introduces a vowel change: rozumie- → rozumia- (rozumiałem/rozumiałam). This 'ia' vowel group is common in high-frequency B1 verbs.",
      },
    ],
  },
  "group-i": {
    title: "-ę / -isz",
    color: "#10b981",
    glyph: "γ",
    desc: "I-stem verbs — identity-consistent endings",
    verbs: [
      {
        infinitive: "Robić", perfective: "Zrobić", translation: "to do / make", emoji: "🔨",
        present: [
          { person: "Ja",      form: "Robię",    ending: "ię",  stem: "Rob",  rule: "1st sg: rob + -ię",              example: "Robię zakupy." },
          { person: "Ty",      form: "Robisz",   ending: "isz", stem: "Rob",  rule: "2nd sg: rob + -isz",             example: "Co robisz dzisiaj?" },
          { person: "On/Ona",  form: "Robi",     ending: "i",   stem: "Rob",  rule: "3rd sg: rob + -i",               example: "Ona robi kawę." },
          { person: "My",      form: "Robimy",   ending: "imy", stem: "Rob",  rule: "1st pl: rob + -imy",             example: "Robimy obiad." },
          { person: "Wy",      form: "Robicie",  ending: "icie",stem: "Rob",  rule: "2nd pl: rob + -icie",            example: "Co robicie wieczorem?" },
          { person: "Oni/One", form: "Robią",    ending: "ią",  stem: "Rob",  rule: "3rd pl: rob + -ią",              example: "Oni robią przerwy." },
        ],
        past: [
          { person: "Ja (M)",  form: "Robiłem",  ending: "łem", stem: "Robi", rule: "Masc. 1st sg: robiłem",          example: "Robiłem to przez rok." },
          { person: "Ja (F)",  form: "Robiłam",  ending: "łam", stem: "Robi", rule: "Fem. 1st sg: robiłam",           example: "Robiłam to samo." },
          { person: "On",      form: "Robił",    ending: "ł",   stem: "Robi", rule: "3rd sg masc: robił",             example: "On robił dużo błędów." },
          { person: "Ona",     form: "Robiła",   ending: "ła",  stem: "Robi", rule: "3rd sg fem: robiła",             example: "Robiła wszystko sama." },
          { person: "Oni",     form: "Robili",   ending: "li",  stem: "Robi", rule: "Masc.pers.: robili (ł→l)",       example: "Robili to razem." },
          { person: "One",     form: "Robiły",   ending: "ły",  stem: "Robi", rule: "Non-masc. pl: robiły",           example: "One robiły zakupy." },
        ],
        future: [
          { person: "Ja",      form: "Będę robić",  ending: "robić", stem: "Będę ",  rule: "Imperfective future",      example: "Będę robić to co tydzień." },
          { person: "Ja (pf)", form: "Zrobię",      ending: "ię",    stem: "Zrob",   rule: "Perfective: zrobię",       example: "Zrobię to na pewno." },
        ],
        tips: "'Co robisz?' is probably the most-asked question in Polish. Master this verb and you'll unlock dozens of natural conversations.",
      },
      {
        infinitive: "Chodzić", perfective: "Pójść", translation: "to walk / go (regularly)", emoji: "🚶",
        present: [
          { person: "Ja",      form: "Chodzę",    ending: "ę",   stem: "Chodz", rule: "1st sg: dz softening + -ę",     example: "Chodzę do szkoły pieszo." },
          { person: "Ty",      form: "Chodzisz",  ending: "isz", stem: "Chodz", rule: "2nd sg: chodz + -isz",          example: "Chodzisz na siłownię?" },
          { person: "On/Ona",  form: "Chodzi",    ending: "i",   stem: "Chodz", rule: "3rd sg: chodz + -i",            example: "Ona chodzi szybko." },
          { person: "My",      form: "Chodzimy",  ending: "imy", stem: "Chodz", rule: "1st pl: chodz + -imy",          example: "Chodzimy razem na spacery." },
          { person: "Wy",      form: "Chodzicie", ending: "icie",stem: "Chodz", rule: "2nd pl: chodz + -icie",         example: "Chodzicie do tej samej szkoły?" },
          { person: "Oni/One", form: "Chodzą",    ending: "ą",   stem: "Chodz", rule: "3rd pl: chodz + -ą",            example: "Chodzą do parku codziennie." },
        ],
        past: [
          { person: "Ja (M)",  form: "Chodziłem", ending: "łem", stem: "Chodzi", rule: "Masc. 1st sg: chodziłem",      example: "Chodziłem tam często." },
          { person: "Ja (F)",  form: "Chodziłam", ending: "łam", stem: "Chodzi", rule: "Fem. 1st sg: chodziłam",       example: "Chodziłam do tej szkoły." },
          { person: "Oni",     form: "Chodzili",  ending: "li",  stem: "Chodzi", rule: "Masc.pers. pl: chodzili",      example: "Chodzili na spacery razem." },
        ],
        future: [
          { person: "Ja",      form: "Będę chodzić", ending: "chodzić", stem: "Będę ", rule: "Imperfective: habitual future",  example: "Będę chodzić na jogę." },
          { person: "Ja (pf)", form: "Pójdę",        ending: "ę",       stem: "Pójd",  rule: "Perfective: suppletive! pójdę",  example: "Pójdę tam jutro." },
        ],
        tips: "CRUCIAL ASPECT PAIR: 'chodzić' (habitual walking) vs 'iść' (going right now) vs 'pójść' (to go once, perfective). Three verbs, three uses. Master them and you'll sound native.",
      },
    ],
  },
  "irregular": {
    title: "Must-Know",
    color: "#f59e0b",
    glyph: "Ω",
    desc: "High-frequency irregulars you cannot avoid",
    verbs: [
      {
        infinitive: "Być", perfective: "—", translation: "to be", emoji: "🌟",
        present: [
          { person: "Ja",      form: "Jestem",   ending: "stem",  stem: "Je",  rule: "Suppletive form — irregular!",  example: "Jestem studentem." },
          { person: "Ty",      form: "Jesteś",   ending: "steś",  stem: "Je",  rule: "Suppletive 2nd sg",             example: "Jesteś tutaj!" },
          { person: "On/Ona",  form: "Jest",     ending: "st",    stem: "Je",  rule: "3rd sg: jest (=English 'is')",  example: "Ona jest lekarką." },
          { person: "My",      form: "Jesteśmy", ending: "śmy",   stem: "Jeste",rule: "1st pl: jesteśmy",             example: "Jesteśmy razem." },
          { person: "Wy",      form: "Jesteście",ending: "ście",  stem: "Jeste",rule: "2nd pl: jesteście",            example: "Jesteście gotowi?" },
          { person: "Oni/One", form: "Są",       ending: "",      stem: "Są",  rule: "3rd pl: completely irregular!",  example: "Są w domu." },
        ],
        past: [
          { person: "Ja (M)",  form: "Byłem",  ending: "łem", stem: "By", rule: "Past from 'by-' stem: byłem",   example: "Byłem w Polsce." },
          { person: "Ja (F)",  form: "Byłam",  ending: "łam", stem: "By", rule: "Fem. 1st sg: byłam",            example: "Byłam w Krakowie." },
          { person: "On",      form: "Był",    ending: "ł",   stem: "By", rule: "3rd sg masc: był",              example: "Był szczęśliwy." },
          { person: "Ona",     form: "Była",   ending: "ła",  stem: "By", rule: "3rd sg fem: była",              example: "Była tutaj wcześniej." },
          { person: "Oni",     form: "Byli",   ending: "li",  stem: "By", rule: "Masc.pers. pl: byli (ł→l)",     example: "Byli razem od lat." },
          { person: "One",     form: "Były",   ending: "ły",  stem: "By", rule: "Non-masc. pl: były",            example: "Były na tej samej imprezie." },
        ],
        future: [
          { person: "Ja",      form: "Będę",     ending: "dę",  stem: "Bę",   rule: "Future być: będę (+ inf./l-form)", example: "Będę w Warszawie." },
          { person: "Oni",     form: "Będą",     ending: "dą",  stem: "Bę",   rule: "3rd pl future: będą",              example: "Będą tutaj o 8." },
        ],
        tips: "'Być' is the king of Polish verbs. The present forms (jestem/jest/są) are completely irregular. The past 'był/była/byli' and future 'będę' build the grammar scaffolding for everything else.",
      },
      {
        infinitive: "Mieć", perfective: "—", translation: "to have", emoji: "✋",
        present: [
          { person: "Ja",      form: "Mam",    ending: "m",    stem: "Ma",  rule: "1st sg: ma + -m",                example: "Mam psa." },
          { person: "Ty",      form: "Masz",   ending: "sz",   stem: "Ma",  rule: "2nd sg: ma + -sz",               example: "Masz chwilę?" },
          { person: "On/Ona",  form: "Ma",     ending: "",     stem: "Ma",  rule: "3rd sg: pure stem (short!)",     example: "Ona ma rację." },
          { person: "My",      form: "Mamy",   ending: "my",   stem: "Ma",  rule: "1st pl: ma + -my",               example: "Mamy spotkanie." },
          { person: "Wy",      form: "Macie",  ending: "cie",  stem: "Ma",  rule: "2nd pl: ma + -cie",              example: "Macie bilet?" },
          { person: "Oni/One", form: "Mają",   ending: "ją",   stem: "Ma",  rule: "3rd pl: ma + -ją",               example: "Mają dużo pracy." },
        ],
        past: [
          { person: "Ja (M)",  form: "Miałem",  ending: "łem", stem: "Mia", rule: "Vowel shift: ma → mia in past!", example: "Miałem dobry dzień." },
          { person: "Ja (F)",  form: "Miałam",  ending: "łam", stem: "Mia", rule: "Fem. 1st sg: miałam",           example: "Miałam rację." },
          { person: "On",      form: "Miał",    ending: "ł",   stem: "Mia", rule: "3rd sg masc: miał",             example: "Miał dużo szczęścia." },
          { person: "Ona",     form: "Miała",   ending: "ła",  stem: "Mia", rule: "3rd sg fem: miała",             example: "Miała piękny głos." },
          { person: "Oni",     form: "Mieli",   ending: "li",  stem: "Mie", rule: "Masc.pers.: mieli (ł→l + shift)",example: "Mieli wszystko." },
        ],
        future: [
          { person: "Ja",      form: "Będę mieć", ending: "mieć", stem: "Będę ",  rule: "Imperfective future: będę mieć", example: "Będę mieć więcej czasu." },
          { person: "My",      form: "Będziemy mieć",ending:"mieć",stem:"Będziemy ",rule:"1st pl future",              example: "Będziemy mieć dom." },
        ],
        tips: "WATCH OUT: 'ma' (he has, 3rd sg) vs 'nie ma' (there is no). The negation 'nie ma' triggers the Genitive case: 'mam samochód' → 'nie mam samochodu'.",
      },
      {
        infinitive: "Wiedzieć", perfective: "Dowiedzieć się", translation: "to know (a fact)", emoji: "🧠",
        present: [
          { person: "Ja",      form: "Wiem",    ending: "iem",  stem: "W",    rule: "Totally irregular: wiem",        example: "Wiem, gdzie mieszkasz." },
          { person: "Ty",      form: "Wiesz",   ending: "iesz", stem: "W",    rule: "2nd sg: wiesz",                  example: "Wiesz o tym?" },
          { person: "On/Ona",  form: "Wie",     ending: "ie",   stem: "W",    rule: "3rd sg: wie",                    example: "Ona wie wszystko." },
          { person: "My",      form: "Wiemy",   ending: "iemy", stem: "W",    rule: "1st pl: wiemy",                  example: "Wiemy, co robimy." },
          { person: "Wy",      form: "Wiecie",  ending: "iecie",stem: "W",    rule: "2nd pl: wiecie",                 example: "Wiecie, co się stało?" },
          { person: "Oni/One", form: "Wiedzą",  ending: "dzą",  stem: "Wie",  rule: "3rd pl: wiedzą (unique!)",       example: "Wiedzą o wszystkim." },
        ],
        past: [
          { person: "Ja (M)",  form: "Wiedziałem", ending: "łem", stem: "Wiedzia", rule: "Past: wiedzia- stem",       example: "Wiedziałem to od początku." },
          { person: "Ona",     form: "Wiedziała",  ending: "ła",  stem: "Wiedzia", rule: "Fem. 3rd sg: wiedziała",   example: "Wiedziała prawdę." },
          { person: "Oni",     form: "Wiedzieli",  ending: "li",  stem: "Wiedzie", rule: "Masc.pers.: wiedzieli",    example: "Wiedzieli od dawna." },
        ],
        future: [
          { person: "Ja",      form: "Będę wiedzieć",  ending: "wiedzieć", stem: "Będę ", rule: "Imperfective future", example: "Jutro będę wiedzieć więcej." },
          { person: "Ja",      form: "Dowiem się",     ending: "się",      stem: "Dowie", rule: "Perfective reflexive",  example: "Dowiem się jutro." },
        ],
        tips: "VITAL DISTINCTION: 'Wiedzieć' (to know a fact) vs 'Znać' (to know a person/place). 'Wiem, że on jest miły' but 'Znam go dobrze'. This is a classic B1 error for English speakers.",
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   QUIZ ENGINE
═══════════════════════════════════════════════════════════════ */
function buildQuizQuestions(verb, tense) {
  const forms = verb[tense];
  if (!forms?.length) return [];
  return forms.map(item => {
    const others = forms.filter(f => f.form !== item.form).map(f => f.form);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...shuffled, item.form].sort(() => Math.random() - 0.5);
    return { ...item, options: opts, correct: item.form };
  });
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING XP CHIP
═══════════════════════════════════════════════════════════════ */
function XpBurst({ x, y, amount, id }) {
  return (
    <motion.div
      key={id}
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ y: y - 80, opacity: 0, scale: 1.3 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      style={{
        position: "fixed", pointerEvents: "none", zIndex: 9999,
        fontFamily: "'Playfair Display', serif", fontStyle: "italic",
        fontSize: 22, fontWeight: 700, color: "#34d399",
        textShadow: "0 0 16px rgba(52,211,153,0.7)",
        transformOrigin: "center",
      }}
    >
      +{amount}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function KoniugacjaMaster() {
  const [activeGroupId, setActiveGroupId]       = useState("group-m");
  const [activeVerbIdx, setActiveVerbIdx]       = useState(0);
  const [activeTense, setActiveTense]           = useState("present");
  const [selectedForm, setSelectedForm]         = useState(null);
  const [mode, setMode]                         = useState("study"); // "study" | "quiz"

  // Quiz state
  const [questions, setQuestions]               = useState([]);
  const [qIdx, setQIdx]                         = useState(0);
  const [chosen, setChosen]                     = useState(null);
  const [quizScore, setQuizScore]               = useState(0);
  const [quizStreak, setQuizStreak]             = useState(0);
  const [quizDone, setQuizDone]                 = useState(false);
  const [xpBursts, setXpBursts]                 = useState([]);
  const [totalXp, setTotalXp]                   = useState(0);
  const [mastered, setMastered]                 = useState(new Set()); // verb+tense keys
  const [bestStreaks, setBestStreaks]            = useState({});

  const btnRefs = useRef({});

  const group   = CONJUGATION_DATA[activeGroupId];
  const verb    = group.verbs[activeVerbIdx] || group.verbs[0];
  const tenses  = ["present", "past", "future"];
  const groups  = Object.entries(CONJUGATION_DATA).map(([id, g]) => ({ id, ...g }));

  const masteryKey = `${activeGroupId}-${activeVerbIdx}-${activeTense}`;

  // Reset verb index when switching groups
  const switchGroup = (id) => {
    setActiveGroupId(id);
    setActiveVerbIdx(0);
    setSelectedForm(null);
    if (mode === "quiz") resetQuiz(CONJUGATION_DATA[id].verbs[0], activeTense);
  };

  const switchVerb = (idx) => {
    setActiveVerbIdx(idx);
    setSelectedForm(null);
    if (mode === "quiz") resetQuiz(group.verbs[idx], activeTense);
  };

  const switchTense = (t) => {
    setActiveTense(t);
    setSelectedForm(null);
    if (mode === "quiz") resetQuiz(verb, t);
  };

  const resetQuiz = useCallback((v, t) => {
    const qs = buildQuizQuestions(v, t);
    setQuestions(qs);
    setQIdx(0);
    setChosen(null);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizDone(false);
  }, []);

  const startQuiz = () => {
    resetQuiz(verb, activeTense);
    setMode("quiz");
  };

  const fireXpBurst = (el, amount) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const id   = Date.now() + Math.random();
    setXpBursts(b => [...b, { id, x: rect.left + rect.width / 2, y: rect.top, amount }]);
    setTimeout(() => setXpBursts(b => b.filter(x => x.id !== id)), 1000);
  };

  const handleAnswer = (opt, btnEl) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === questions[qIdx].correct;
    if (correct) {
      const pts = 10 + quizStreak * 5;
      setQuizScore(s => s + pts);
      setTotalXp(x => x + pts);
      setQuizStreak(s => s + 1);
      fireXpBurst(btnEl, pts);
      if (quizStreak + 1 > (bestStreaks[masteryKey] || 0)) {
        setBestStreaks(b => ({ ...b, [masteryKey]: quizStreak + 1 }));
      }
    } else {
      setQuizStreak(0);
    }

    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        setQuizDone(true);
        // Mark mastered if all correct
        if (quizScore + (correct ? 10 : 0) >= questions.length * 8) {
          setMastered(m => new Set([...m, masteryKey]));
        }
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 900);
  };

  const q = questions[qIdx];
  const isMastered = mastered.has(masteryKey);

  return (
    <div className="km-root" style={{
      background: "#020617", color: "#f0f0ff",
      fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        /* Scoped to .km-root — does NOT affect the main navbar */
        .km-root *, .km-root *::before, .km-root *::after { box-sizing: border-box; }
        .km-root ::-webkit-scrollbar { width: 3px; height: 3px; }
        .km-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
        .km-card { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
        .km-card:hover { transform: translateY(-3px); }
        .km-card:active { transform: scale(0.97); }
        .km-opt { transition: all 0.18s; }
        .km-opt:hover:not([disabled]) { transform: translateX(4px); }
      `}</style>

      {/* XP Bursts portal */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
        {xpBursts.map(b => <XpBurst key={b.id} {...b} />)}
      </div>

      {/* ── TOP BAR ── */}
      <header style={{
        background: "rgba(2,6,23,0.92)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 20px", height: 60, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 10,
      }}>
        {/* Group switcher */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 14 }}>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => switchGroup(g.id)}
              style={{
                padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeGroupId === g.id ? "#fff" : "transparent",
                color: activeGroupId === g.id ? "#000" : "rgba(255,255,255,0.4)",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 14, color: activeGroupId === g.id ? g.color : "inherit" }}>{g.glyph}</span>
              <span className="hidden-mobile" style={{ display: window.innerWidth > 640 ? "inline" : "none" }}>{g.title}</span>
            </button>
          ))}
        </div>

        {/* Tense switcher */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 14 }}>
          {tenses.map(t => (
            <button
              key={t}
              onClick={() => switchTense(t)}
              style={{
                padding: "6px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeTense === t ? "#fff" : "transparent",
                color: activeTense === t ? "#000" : "rgba(255,255,255,0.4)",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* XP + mode toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {totalXp > 0 && (
            <div style={{
              padding: "5px 12px", borderRadius: 99,
              background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "#34d399" }}>{totalXp}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(52,211,153,0.55)" }}>XP</span>
            </div>
          )}
          <button
            onClick={() => mode === "study" ? startQuiz() : setMode("study")}
            style={{
              padding: "7px 16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: mode === "quiz"
                ? `${group.color}22`
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: mode === "quiz" ? group.color : "white",
              border: mode === "quiz" ? `1px solid ${group.color}44` : "none",
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: mode === "study" ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
            }}
          >
            {mode === "quiz" ? "← Study" : "Quiz Mode ⚡"}
          </button>
        </div>
      </header>

      {/* ── VERB TITLE STRIP ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 24px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{verb.emoji}</span>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                fontSize: "clamp(28px,5vw,52px)", fontWeight: 700, color: "#f0f0ff",
                lineHeight: 1, margin: 0,
              }}>{verb.infinitive}</h1>
              {isMastered && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                    padding: "3px 10px", borderRadius: 99,
                    background: "rgba(52,211,153,0.15)", color: "#34d399",
                    border: "1px solid rgba(52,211,153,0.3)",
                  }}
                >✓ Mastered</motion.span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <span style={{
                fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                fontSize: 16, color: "rgba(255,255,255,0.4)",
              }}>"{verb.translation}"</span>
              {verb.perfective !== "—" && (
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                  padding: "3px 10px", borderRadius: 99,
                  background: `${group.color}15`, border: `1px solid ${group.color}33`,
                  color: group.color,
                }}>Pf: {verb.perfective}</span>
              )}
            </div>
          </div>
        </div>

        {/* Verb picker */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {group.verbs.map((v, i) => (
            <button
              key={v.infinitive}
              onClick={() => switchVerb(i)}
              style={{
                padding: "8px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                background: activeVerbIdx === i
                  ? `${group.color}22`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeVerbIdx === i ? group.color + "55" : "rgba(255,255,255,0.07)"}`,
                color: activeVerbIdx === i ? group.color : "rgba(255,255,255,0.45)",
                fontSize: 13, fontWeight: 700, fontStyle: "italic",
                fontFamily: "'Playfair Display', serif",
                transition: "all 0.2s",
                boxShadow: activeVerbIdx === i ? `0 0 16px ${group.color}22` : "none",
              }}
            >
              {v.infinitive}
              {mastered.has(`${activeGroupId}-${i}-${activeTense}`) && (
                <span style={{ marginLeft: 6, color: "#34d399", fontSize: 10 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* ════ STUDY MODE ════ */}
        {mode === "study" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
            <div style={{
              maxWidth: 1400, margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}>
              <AnimatePresence mode="popLayout">
                {verb[activeTense]?.map((item, idx) => (
                  <motion.button
                    key={`${activeTense}-${item.form}-${idx}`}
                    className="km-card"
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    onClick={() => setSelectedForm(selectedForm?.form === item.form ? null : item)}
                    style={{
                      background: selectedForm?.form === item.form
                        ? `${group.color}10`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedForm?.form === item.form ? group.color + "44" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 24, padding: "24px 22px",
                      textAlign: "left", cursor: "pointer",
                      boxShadow: selectedForm?.form === item.form ? `0 0 24px ${group.color}18` : "none",
                    }}
                  >
                    <div style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)",
                      marginBottom: 10,
                    }}>{item.person}</div>

                    {/* Form with highlighted ending */}
                    <div style={{
                      fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                      fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 700,
                      color: "#f0f0ff", lineHeight: 1, marginBottom: 14,
                    }}>
                      {item.ending && item.form.endsWith(item.ending) ? (
                        <>
                          <span>{item.form.slice(0, item.form.length - item.ending.length)}</span>
                          <span style={{ color: group.color }}>{item.ending}</span>
                        </>
                      ) : <span>{item.form}</span>}
                    </div>

                    {/* Rule preview */}
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.28)",
                      fontStyle: "italic", lineHeight: 1.5,
                      borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10,
                    }}>
                      {item.rule}
                    </div>

                    {/* Tap hint */}
                    <div style={{
                      marginTop: 8, fontSize: 9, fontWeight: 700,
                      color: selectedForm?.form === item.form ? group.color : "rgba(255,255,255,0.15)",
                      textTransform: "uppercase", letterSpacing: "0.14em",
                      transition: "color 0.2s",
                    }}>
                      {selectedForm?.form === item.form ? "tap to close ↑" : "tap for example →"}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* ── TIPS BANNER ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                maxWidth: 1400, margin: "16px auto 0",
                padding: "16px 20px",
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.16)",
                borderRadius: 18,
                display: "flex", gap: 14, alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(245,158,11,0.55)", marginBottom: 5 }}>
                  Mastery Tip
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(245,158,11,0.75)", fontStyle: "italic", lineHeight: 1.65, margin: 0 }}>
                  {verb.tips}
                </p>
              </div>
              <button
                onClick={startQuiz}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.16em",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                }}
              >
                Test it ⚡
              </button>
            </motion.div>
          </div>
        )}

        {/* ════ QUIZ MODE ════ */}
        {mode === "quiz" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "24px 20px", overflowY: "auto",
          }}>
            {quizDone ? (
              /* ── RESULTS ── */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  maxWidth: 480, width: "100%",
                  background: "#0d1526",
                  border: `1px solid ${group.color}33`,
                  borderRadius: 28, padding: 40, textAlign: "center",
                  boxShadow: `0 0 60px ${group.color}12`,
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 16 }}>
                  {quizScore >= questions.length * 8 ? "🏆" : quizScore >= questions.length * 5 ? "⭐" : "📖"}
                </div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                  fontSize: 34, fontWeight: 700, color: "#f0f0ff", marginBottom: 8,
                }}>
                  {quizScore >= questions.length * 8 ? "Perfect!" : quizScore >= questions.length * 5 ? "Well done!" : "Keep going!"}
                </h2>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                  fontSize: 48, color: group.color, fontWeight: 700, marginBottom: 6,
                }}>
                  {quizScore} pts
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
                  Best streak: {bestStreaks[masteryKey] || 0} · {questions.length} questions
                </div>
                {isMastered && (
                  <div style={{
                    padding: "8px 16px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.28)",
                    color: "#34d399", fontSize: 11, fontWeight: 700, marginBottom: 24,
                  }}>
                    ✓ {verb.infinitive} — {activeTense} MASTERED
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button
                    onClick={() => resetQuiz(verb, activeTense)}
                    style={{
                      padding: "13px 24px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg, ${group.color}, ${group.color}bb)`,
                      color: "white", fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.18em",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: `0 6px 20px ${group.color}33`,
                    }}
                  >Retry ↺</button>
                  <button
                    onClick={() => setMode("study")}
                    style={{
                      padding: "13px 24px", borderRadius: 14, cursor: "pointer",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.18em",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >Study Mode</button>
                </div>
              </motion.div>
            ) : q ? (
              /* ── ACTIVE QUESTION ── */
              <div style={{ maxWidth: 560, width: "100%" }}>
                {/* Progress + streak */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden", marginRight: 16 }}>
                    <motion.div
                      animate={{ width: `${((qIdx) / questions.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${group.color}, ${group.color}88)`, borderRadius: 9999 }}
                    />
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.16em", flexShrink: 0 }}>
                    {qIdx + 1} / {questions.length}
                  </div>
                  {quizStreak >= 2 && (
                    <motion.div
                      key={quizStreak}
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        marginLeft: 12, padding: "3px 10px", borderRadius: 99, flexShrink: 0,
                        background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                        color: "#f59e0b", fontSize: 10, fontWeight: 700,
                      }}
                    >
                      {quizStreak}× 🔥
                    </motion.div>
                  )}
                </div>

                {/* Question card */}
                <motion.div
                  key={qIdx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${group.color}22`,
                    borderRadius: 24, padding: "28px 28px 24px",
                    marginBottom: 14, textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", marginBottom: 14 }}>
                    {q.person} · {verb.infinitive} · {activeTense}
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                    fontSize: "clamp(14px,2.5vw,18px)", color: "rgba(255,255,255,0.55)",
                    marginBottom: 10, lineHeight: 1.6,
                  }}>
                    What is the correct form?
                  </div>
                  <div style={{
                    padding: "10px 18px", borderRadius: 12, display: "inline-block",
                    background: `${group.color}10`, border: `1px solid ${group.color}25`,
                    fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                    fontSize: "clamp(14px,2vw,16px)", color: "rgba(255,255,255,0.6)",
                  }}>
                    "{q.example}"
                  </div>
                </motion.div>

                {/* Answer options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, i) => {
                    const isChosen  = chosen === opt;
                    const isCorrect = opt === q.correct;
                    const showRight = chosen && isCorrect;
                    const showWrong = isChosen && !isCorrect;
                    return (
                      <motion.button
                        key={opt}
                        className="km-opt"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        ref={el => { btnRefs.current[opt] = el; }}
                        onClick={() => !chosen && handleAnswer(opt, btnRefs.current[opt])}
                        disabled={!!chosen}
                        style={{
                          padding: "16px 20px", borderRadius: 16, textAlign: "left",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: chosen ? "default" : "pointer",
                          background: showRight ? "rgba(52,211,153,0.1)" : showWrong ? "rgba(244,63,94,0.09)" : "rgba(255,255,255,0.04)",
                          border: `1.5px solid ${showRight ? "rgba(52,211,153,0.45)" : showWrong ? "rgba(244,63,94,0.38)" : chosen && isCorrect ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.08)"}`,
                          transition: "all 0.2s",
                          boxShadow: showRight ? "0 0 20px rgba(52,211,153,0.12)" : "none",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <span style={{
                            width: 28, height: 28, borderRadius: 9,
                            background: showRight ? "rgba(52,211,153,0.2)" : showWrong ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${showRight ? "rgba(52,211,153,0.4)" : showWrong ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                            color: showRight ? "#34d399" : showWrong ? "#f43f5e" : "rgba(255,255,255,0.3)",
                          }}>
                            {showRight ? "✓" : showWrong ? "✗" : String.fromCharCode(65 + i)}
                          </span>
                          <span style={{
                            fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                            fontSize: "clamp(18px,3vw,24px)", fontWeight: 700,
                            color: showRight ? "#6ee7b7" : showWrong ? "#fca5a5" : "#f0f0ff",
                          }}>
                            {opt}
                          </span>
                        </span>
                        {showRight && (
                          <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={{
                              fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                              background: "rgba(52,211,153,0.15)", color: "#34d399",
                              textTransform: "uppercase", letterSpacing: "0.12em",
                            }}
                          >+{10 + Math.max(0, quizStreak - 1) * 5}</motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Rule reveal after answering */}
                <AnimatePresence>
                  {chosen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{ marginTop: 12, overflow: "hidden" }}
                    >
                      <div style={{
                        padding: "12px 16px", borderRadius: 14,
                        background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)",
                        fontSize: 12, fontWeight: 600, color: "rgba(196,181,253,0.85)",
                        fontStyle: "italic", lineHeight: 1.6,
                      }}>
                        📐 {q.rule}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedForm && mode === "study" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedForm(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(2,6,23,0.72)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.93, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 480, width: "100%",
                background: "#0d1526",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderLeft: `4px solid ${group.color}`,
                borderRadius: 28, padding: "36px 36px 32px",
                position: "relative",
                boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${group.color}22`,
              }}
            >
              <button
                onClick={() => setSelectedForm(null)}
                style={{
                  position: "absolute", top: 20, right: 20,
                  width: 36, height: 36, borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "none",
                  color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; }}
              >✕</button>

              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>
                {selectedForm.person}
              </div>

              {/* Big form display */}
              <div style={{
                fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                fontSize: "clamp(42px,8vw,64px)", fontWeight: 700, lineHeight: 1,
                marginBottom: 24,
              }}>
                {selectedForm.ending && selectedForm.form.endsWith(selectedForm.ending) ? (
                  <>
                    <span style={{ color: "#f0f0ff" }}>{selectedForm.form.slice(0, selectedForm.form.length - selectedForm.ending.length)}</span>
                    <span style={{ color: group.color }}>{selectedForm.ending}</span>
                  </>
                ) : (
                  <span style={{ color: group.color }}>{selectedForm.form}</span>
                )}
              </div>

              {/* Rule box */}
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "16px 18px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
                  Grammar Rule
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#f0f0ff", margin: 0, lineHeight: 1.5 }}>
                  {selectedForm.rule}
                </p>
              </div>

              {/* Example sentence */}
              {selectedForm.example && (
                <div style={{
                  background: `${group.color}0d`, border: `1px solid ${group.color}25`,
                  borderRadius: 16, padding: "14px 18px", marginBottom: 16,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: `${group.color}77`, marginBottom: 8 }}>
                    Example
                  </div>
                  <p style={{
                    fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                    fontSize: 16, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.6,
                  }}>
                    "{selectedForm.example}"
                  </p>
                </div>
              )}

              {/* CTA to quiz */}
              <button
                onClick={() => { setSelectedForm(null); startQuiz(); }}
                style={{
                  width: "100%", padding: "13px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${group.color}, ${group.color}bb)`,
                  color: "white", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.2em",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 6px 20px ${group.color}33`,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.target.style.transform = "translateY(0)"}
              >
                Test this verb ⚡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "rgba(2,6,23,0.95)", borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.24em", color: "rgba(255,255,255,0.2)" }}>
          B1 Polish · Koniugacja
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: group.color }} />
          <span style={{
            fontFamily: "'Playfair Display', serif", fontStyle: "italic",
            fontSize: 13, color: group.color,
          }}>
            {group.title}
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>· {group.desc}</span>
        </div>
      </footer>
    </div>
  );
}
