export const missions = [
  {
    id: "mission_01",
    title: "The Silent Baker",
    context: "The bakery is out of 'Chleb Razowy'. You need to ask if they have anything else and express that you are allergic to nuts.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "Ask for an alternative",
        correct: "Czy ma pani coś innego?",
        hint: "Use 'Czy' + 'ma pani' + 'coś innego'",
        caseFocus: "Accusative"
      },
      {
        id: "obj_2",
        label: "Explain allergy",
        correct: "Mam alergię na orzechy",
        hint: "I have (Mam) + allergy (alergię - Accusative) + on (na) + nuts (orzechy)",
        caseFocus: "Accusative/Locative"
      }
    ]
  },
  {
    id: "mission_02",
    title: "The Landlord's Debt",
    context: "The radiator is broken. You need to tell the landlord it is freezing and ask when he will arrive.",
    difficulty: "B1",
    objectives: [
      {
        id: "obj_1",
        label: "State the problem",
        correct: "Kaloryfer jest zepsuty",
        hint: "Radiator (Kaloryfer) + is (jest) + broken (zepsuty)",
        caseFocus: "Nominative"
      },
      {
        id: "obj_2",
        label: "Ask for time",
        correct: "Kiedy pan przyjdzie?",
        hint: "When (Kiedy) + you (pan) + will come (przyjdzie)",
        caseFocus: "Future Tense"
      }
    ]
  }
];