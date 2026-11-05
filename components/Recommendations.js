"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import Poster from "./Poster";
import { titles } from "@/data/titles";

const genres = ["Comedy", "Sci-Fi", "Drama", "Thriller", "Horror", "Fantasy", "Romance", "Animation"];
const tones = ["Lighthearted", "Dark & gritty", "Thought-provoking", "Feel-good"];
const pacing = ["Slow-burn", "Balanced", "Fast-paced"];
const favorites = ["Christopher Nolan", "Greta Gerwig", "Pedro Pascal", "Zendaya", "Middle-earth", "Star Wars"];

// Sample results keyed by search intent. Real recommendations would come from a model trained on the user's profile.
const results = {
  comedy: {
    query: "Find me a comedy movie under 90 minutes.",
    items: [
      { id: "laughTrack", runtime: "86 min", match: 97, desc: "A burned-out stand-up gets one last shot at a late-night spot — if she survives the open mic from hell." },
      { id: "roadTripDad", runtime: "84 min", match: 94, desc: "A dad, two teens and a dying minivan race across three states to make a graduation on time." },
      { id: "officeHours", runtime: "88 min", match: 91, desc: "Rival substitute teachers wage a petty war over the last working copier in the building." },
      { id: "wrongWedding", runtime: "89 min", match: 88, desc: "A wedding planner accidentally books two ceremonies in one venue on the same afternoon." },
    ],
  },
  scifi: {
    query: "Mind-bending sci-fi I can finish this weekend.",
    items: [
      { id: "lastSignal", runtime: "112 min", match: 96, desc: "A lone radio operator receives a transmission sent from her own station — forty years from now." },
      { id: "midnightAtlas", runtime: "2 seasons", match: 95, desc: "Cartographers discover a map that redraws itself each night, revealing places that shouldn't exist." },
      { id: "starboundHeist", runtime: "124 min", match: 90, desc: "A crew of retired con artists plans to rob the most secure vault in orbit." },
      { id: "glassCity", runtime: "1 season", match: 86, desc: "In a city where every wall is transparent, a detective hunts a criminal no one can see." },
    ],
  },
  drama: {
    query: "A cozy, feel-good drama series to unwind with.",
    items: [
      { id: "quietHarbor", runtime: "3 seasons", match: 98, desc: "A big-city chef inherits a failing seaside diner and the eccentric town that comes with it." },
      { id: "goldenHour", runtime: "3 seasons", match: 93, desc: "Two photographers keep crossing paths at sunset in cities all around the world." },
      { id: "houseOfEchoes", runtime: "2 seasons", match: 89, desc: "A family of storytellers discovers their tales come true in the old house they share." },
      { id: "theLongWinter", runtime: "131 min", match: 84, desc: "Three siblings attempt the mountain crossing their late father never finished." },
    ],
  },
};

function intentFor(text) {
  const q = text.toLowerCase();
  if (/(comedy|funny|laugh)/.test(q)) return "comedy";
  if (/(sci|space|future|mind)/.test(q)) return "scifi";
  if (/(drama|cozy|feel|unwind|romance)/.test(q)) return "drama";
  return null;
}

function Chip({ active, onClick, children }) {
  return (
    <button className={`chip ${active ? "chip--active" : ""}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export default function Recommendations() {
  const [selGenres, setSelGenres] = useState(["Comedy", "Sci-Fi", "Drama"]);
  const [runtime, setRuntime] = useState(110);
  const [format, setFormat] = useState("Both");
  const [tone, setTone] = useState("Lighthearted");
  const [pace, setPace] = useState("Balanced");
  const [input, setInput] = useState(results.comedy.query);
  const [intent, setIntent] = useState("comedy");
  const [missed, setMissed] = useState(false);

  const toggleGenre = (g) =>
    setSelGenres((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  const runSearch = (e) => {
    e.preventDefault();
    const found = intentFor(input);
    setMissed(!found);
    if (found) setIntent(found);
  };

  const pickPreset = (key) => {
    setInput(results[key].query);
    setIntent(key);
    setMissed(false);
  };

  return (
    <section className="section" id="recommendations">
      <div className="container">
        <SectionHeader eyebrow="Personalized recommendations" title="Tell us your taste once. Get picks that actually fit." align="center">
          A short profile survey teaches ReelGuide what you love — so recommendations and search
          results reflect your genres, runtimes, favorite people and the kind of stories you enjoy.
        </SectionHeader>

        <div className="reco">
          <Reveal className="survey">
            <div className="survey__head">
              <span className="pill pill--red">Profile survey</span>
              <span className="muted small">Step 2 of 4</span>
            </div>

            <div className="survey__group">
              <label>Favorite genres</label>
              <div className="chips">
                {genres.map((g) => (
                  <Chip key={g} active={selGenres.includes(g)} onClick={() => toggleGenre(g)}>{g}</Chip>
                ))}
              </div>
            </div>

            <div className="survey__group">
              <label htmlFor="runtime">Preferred movie runtime <em>up to {runtime} min</em></label>
              <input
                id="runtime"
                type="range"
                min="80"
                max="180"
                step="5"
                value={runtime}
                onChange={(e) => setRuntime(Number(e.target.value))}
                style={{ "--fill": `${((runtime - 80) / 100) * 100}%` }}
              />
            </div>

            <div className="survey__group">
              <label>Movies or TV?</label>
              <div className="segmented">
                {["Movies", "Both", "TV Shows"].map((f) => (
                  <button key={f} className={format === f ? "is-active" : ""} onClick={() => setFormat(f)}>{f}</button>
                ))}
              </div>
            </div>

            <div className="survey__group">
              <label>Favorite actors, directors & franchises</label>
              <div className="chips">
                {favorites.map((f) => (
                  <span key={f} className="chip chip--tag">{f}</span>
                ))}
                <span className="chip chip--add">+ Add</span>
              </div>
            </div>

            <div className="survey__row">
              <div className="survey__group">
                <label>Tone</label>
                <div className="chips">
                  {tones.map((t) => (
                    <Chip key={t} active={tone === t} onClick={() => setTone(t)}>{t}</Chip>
                  ))}
                </div>
              </div>
              <div className="survey__group">
                <label>Pacing</label>
                <div className="chips">
                  {pacing.map((p) => (
                    <Chip key={p} active={pace === p} onClick={() => setPace(p)}>{p}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="search-panel" delay={120}>
            <form className="search" onSubmit={runSearch}>
              <span className="search__icon" aria-hidden="true">✦</span>
              <input
                aria-label="Ask ReelGuide"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you're in the mood for…"
              />
              <button className="btn btn--primary btn--small" type="submit">Search</button>
            </form>
            <div className="presets">
              <span className="muted small">Try:</span>
              {Object.entries(results).map(([key, r]) => (
                <button key={key} className={`preset ${intent === key ? "preset--active" : ""}`} onClick={() => pickPreset(key)}>
                  “{r.query}”
                </button>
              ))}
            </div>
            {missed && (
              <p className="search__miss">This demo understands a few sample moods — try comedy, sci-fi or a cozy drama.</p>
            )}

            <div className="reco-grid" key={intent}>
              {results[intent].items.map((r, i) => (
                <article className="reco-card" key={r.id} style={{ animationDelay: `${i * 80}ms` }}>
                  <Poster id={r.id} size="md" />
                  <div className="reco-card__body">
                    <div className="reco-card__top">
                      <h4>{titles[r.id].title}</h4>
                      <span className="match">{r.match}% match</span>
                    </div>
                    <div className="reco-card__meta">
                      <span>{titles[r.id].genre}</span>
                      <span>·</span>
                      <span>{r.runtime}</span>
                    </div>
                    <p>{r.desc}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="caption">Sample titles and results for demonstration.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
