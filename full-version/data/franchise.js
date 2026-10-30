// Star Wars franchise data used for the franchise guide demo.
// Real titles are listed for illustration only; ScreenTrack is not affiliated with Lucasfilm or Disney.

export const entries = {
  acolyte: { title: "The Acolyte", year: 2024, type: "Series", length: "8 episodes", era: "High Republic" },
  ep1: { title: "Episode I – The Phantom Menace", year: 1999, type: "Film", length: "136 min", era: "Fall of the Jedi" },
  ep2: { title: "Episode II – Attack of the Clones", year: 2002, type: "Film", length: "142 min", era: "Fall of the Jedi" },
  cloneWars: { title: "The Clone Wars", year: 2008, type: "Series", length: "7 seasons", era: "Fall of the Jedi" },
  ep3: { title: "Episode III – Revenge of the Sith", year: 2005, type: "Film", length: "140 min", era: "Fall of the Jedi" },
  badBatch: { title: "The Bad Batch", year: 2021, type: "Series", length: "3 seasons", era: "Reign of the Empire" },
  solo: { title: "Solo: A Star Wars Story", year: 2018, type: "Film", length: "135 min", era: "Reign of the Empire" },
  obiWan: { title: "Obi-Wan Kenobi", year: 2022, type: "Series", length: "6 episodes", era: "Reign of the Empire" },
  andor: { title: "Andor", year: 2022, type: "Series", length: "2 seasons", era: "Age of Rebellion" },
  rebels: { title: "Rebels", year: 2014, type: "Series", length: "4 seasons", era: "Age of Rebellion" },
  rogueOne: { title: "Rogue One: A Star Wars Story", year: 2016, type: "Film", length: "133 min", era: "Age of Rebellion" },
  ep4: { title: "Episode IV – A New Hope", year: 1977, type: "Film", length: "121 min", era: "Age of Rebellion" },
  ep5: { title: "Episode V – The Empire Strikes Back", year: 1980, type: "Film", length: "124 min", era: "Age of Rebellion" },
  ep6: { title: "Episode VI – Return of the Jedi", year: 1983, type: "Film", length: "131 min", era: "Age of Rebellion" },
  mando: { title: "The Mandalorian", year: 2019, type: "Series", length: "3 seasons", era: "New Republic" },
  boba: { title: "The Book of Boba Fett", year: 2021, type: "Series", length: "7 episodes", era: "New Republic" },
  ahsoka: { title: "Ahsoka", year: 2023, type: "Series", length: "8 episodes", era: "New Republic" },
  ep7: { title: "Episode VII – The Force Awakens", year: 2015, type: "Film", length: "138 min", era: "Rise of the First Order" },
  ep8: { title: "Episode VIII – The Last Jedi", year: 2017, type: "Film", length: "152 min", era: "Rise of the First Order" },
  ep9: { title: "Episode IX – The Rise of Skywalker", year: 2019, type: "Film", length: "142 min", era: "Rise of the First Order" },
};

export const orders = {
  chronological: {
    label: "Chronological",
    blurb: "Follow the story as it happens in-universe, from the fall of the Jedi to the rise of the First Order.",
    list: ["ep1", "ep2", "ep3", "solo", "rogueOne", "ep4", "ep5", "ep6", "ep7", "ep8", "ep9"],
  },
  release: {
    label: "Theatrical Release",
    blurb: "Experience the saga the way audiences did — reveals, twists and all — starting in 1977.",
    list: ["ep4", "ep5", "ep6", "ep1", "ep2", "ep3", "ep7", "rogueOne", "ep8", "solo", "ep9"],
  },
  recommended: {
    label: "Recommended",
    blurb: "A first-timer favorite: keep the big Episode V reveal intact, then flash back before the finale.",
    list: ["ep4", "ep5", "ep1", "ep2", "ep3", "ep6", "rogueOne", "ep7", "ep8", "ep9"],
    notes: { ep1: "Flashback begins", ep6: "Return to the original trilogy", rogueOne: "Bonus: leads into A New Hope" },
  },
  completionist: {
    label: "Completionist",
    blurb: "Every film plus the key series and spin-offs, in story order. Optional entries are clearly marked.",
    list: [
      "acolyte", "ep1", "ep2", "cloneWars", "ep3", "badBatch", "solo", "obiWan", "andor", "rebels",
      "rogueOne", "ep4", "ep5", "ep6", "mando", "boba", "ahsoka", "ep7", "ep8", "ep9",
    ],
    optional: ["acolyte", "badBatch", "boba"],
  },
};
