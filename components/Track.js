"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import Poster from "./Poster";
import { titles } from "@/data/titles";

const library = {
  watching: [
    { id: "midnightAtlas", note: "S2 · E6 of 10" },
    { id: "neonParish", note: "S1 · E3 of 8" },
    { id: "goldenHour", note: "S3 · E9 of 12" },
  ],
  watched: [
    { id: "emberline", note: "★ 4.5 · Oct 24" },
    { id: "theLongWinter", note: "★ 4.0 · Oct 19" },
    { id: "paperKings", note: "★ 5.0 · Oct 12" },
  ],
  watchlist: [
    { id: "starboundHeist", note: "Added Oct 28" },
    { id: "hollowSky", note: "Added Oct 22" },
    { id: "quietHarbor", note: "Added Oct 15" },
  ],
};

const tabs = [
  { key: "watching", label: "Currently Watching" },
  { key: "watched", label: "Watched" },
  { key: "watchlist", label: "Watchlist" },
];

const points = [
  { title: "A personal record", text: "Every movie and show you've seen, saved in your own library." },
  { title: "Three simple statuses", text: "Mark anything as Watched, Currently Watching, or add it to your Watchlist." },
  { title: "Episode-level progress", text: "Check off individual episodes and see exactly where you left off in every season." },
  { title: "Rate & review", text: "Score titles and jot down reviews so you remember what you loved." },
  { title: "Your viewing history", text: "A clean, organized timeline of everything you've watched." },
];

const history = [
  { id: "midnightAtlas", text: "Watched S2 · E6 “The Cartographer”", when: "Today" },
  { id: "emberline", text: "Rated 4.5 and wrote a review", when: "Oct 24" },
  { id: "theLongWinter", text: "Marked as watched", when: "Oct 19" },
];

export default function Track() {
  const [tab, setTab] = useState("watching");
  const [episodes, setEpisodes] = useState(6);
  const [rating, setRating] = useState(4);

  return (
    <section className="section" id="track">
      <div className="container split">
        <div className="split__copy">
          <SectionHeader eyebrow="Track your entertainment" title="Your whole watch life, beautifully organized.">
            Stop relying on memory and scattered notes. ReelGuide remembers what you've watched,
            where you paused, and how you felt about it.
          </SectionHeader>
          <ul className="checklist">
            {points.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 60}>
                <span className="checklist__icon" aria-hidden="true">✓</span>
                <div>
                  <strong>{p.title}</strong>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="split__visual">
          <div className="app-window">
            <div className="app-window__bar">
              <span /><span /><span />
              <em>My Library</em>
            </div>
            <div className="tabs" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  className={`tab ${tab === t.key ? "tab--active" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="library-grid" key={tab}>
              {library[tab].map((item) => (
                <div className="library-item" key={item.id}>
                  <Poster id={item.id} size="sm" />
                  <span className="library-item__note">{item.note}</span>
                </div>
              ))}
            </div>

            <div className="progress-card">
              <div className="progress-card__head">
                <div>
                  <span className="muted small">Season progress</span>
                  <h4>{titles.midnightAtlas.title} · Season 2</h4>
                </div>
                <span className="pill pill--orange">{episodes}/10 episodes</span>
              </div>
              <div className="progress-bar"><span style={{ width: `${episodes * 10}%` }} /></div>
              <div className="episodes">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    className={`episode ${i < episodes ? "episode--done" : ""}`}
                    onClick={() => setEpisodes(i + 1 === episodes ? i : i + 1)}
                    aria-label={`Mark through episode ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="rating-row">
                <span className="muted small">Your rating</span>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      className={`star ${s <= rating ? "star--on" : ""}`}
                      onClick={() => setRating(s)}
                      aria-label={`Rate ${s} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="history">
              <span className="muted small">Recent history</span>
              {history.map((h) => (
                <div className="history__row" key={h.text}>
                  <span className="history__dot" style={{ background: titles[h.id].palette[2] }} />
                  <span>{h.text}</span>
                  <em>{h.when}</em>
                </div>
              ))}
            </div>
          </div>
          <p className="caption">Interactive demo — click the tabs, episodes and stars.</p>
        </Reveal>
      </div>
    </section>
  );
}
