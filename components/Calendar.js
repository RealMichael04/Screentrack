"use client";

import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import Poster from "./Poster";
import { titles } from "@/data/titles";

const YEAR = 2026;
const MONTH = 10; // November (0-indexed)

const types = {
  movie: { label: "Movie release", color: "var(--red)" },
  premiere: { label: "Series premiere", color: "var(--orange)" },
  season: { label: "New season", color: "var(--amber)" },
  finale: { label: "Finale", color: "var(--rose)" },
};

// Sample schedule for the demo — not live release data.
const events = [
  { day: 4, type: "season", id: "neonParish", text: "Neon Parish · Season 2" },
  { day: 6, type: "movie", id: "emberline", text: "Emberline in theaters" },
  { day: 11, type: "finale", id: "goldenHour", text: "Golden Hour · S3 finale" },
  { day: 13, type: "premiere", id: "glassCity", text: "Glass City · series premiere" },
  { day: 18, type: "finale", id: "midnightAtlas", text: "Midnight Atlas · S2 finale" },
  { day: 20, type: "movie", id: "starboundHeist", text: "Starbound Heist in theaters" },
  { day: 20, type: "season", id: "quietHarbor", text: "Quiet Harbor · Season 4" },
  { day: 25, type: "premiere", id: "houseOfEchoes", text: "House of Echoes · premiere" },
  { day: 27, type: "movie", id: "hollowSky", text: "Hollow Sky streaming debut" },
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const [active, setActive] = useState(Object.keys(types));
  const [selected, setSelected] = useState(20);

  const cells = useMemo(() => {
    const first = new Date(YEAR, MONTH, 1).getDay();
    const days = new Date(YEAR, MONTH + 1, 0).getDate();
    const out = Array.from({ length: first }, () => null);
    for (let d = 1; d <= days; d++) out.push(d);
    while (out.length % 7) out.push(null);
    return out;
  }, []);

  const visible = events.filter((e) => active.includes(e.type));
  const selectedEvents = visible.filter((e) => e.day === selected);

  const toggle = (t) =>
    setActive((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <section className="section section--tint" id="calendar">
      <div className="container">
        <SectionHeader eyebrow="Bonus feature · Your entertainment calendar" title="Plan your watching like you plan your week." align="center">
          Every premiere, finale, new season and movie release for the titles and franchises you follow —
          on one personalized calendar, so you always know what's coming next.
        </SectionHeader>

        <Reveal className="calendar">
          <div className="calendar__main">
            <div className="calendar__head">
              <h3>November {YEAR}</h3>
              <div className="legend">
                {Object.entries(types).map(([key, t]) => (
                  <button
                    key={key}
                    className={`legend__item ${active.includes(key) ? "" : "is-off"}`}
                    onClick={() => toggle(key)}
                    aria-pressed={active.includes(key)}
                  >
                    <span style={{ background: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="calendar__grid">
              {weekdays.map((w) => (
                <div key={w} className="calendar__weekday">{w}</div>
              ))}
              {cells.map((d, i) => {
                const dayEvents = d ? visible.filter((e) => e.day === d) : [];
                return (
                  <button
                    key={i}
                    disabled={!d}
                    className={`calendar__cell ${d === selected ? "is-selected" : ""} ${dayEvents.length ? "has-events" : ""}`}
                    onClick={() => d && setSelected(d)}
                  >
                    {d && <span className="calendar__date">{d}</span>}
                    <span className="calendar__events">
                      {dayEvents.map((e) => (
                        <span key={e.text} className="calendar__event" style={{ "--c": types[e.type].color }}>
                          <i />
                          <em>{titles[e.id].title}</em>
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="calendar__side">
            <span className="muted small">Selected day</span>
            <h4>{new Date(YEAR, MONTH, selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h4>
            {selectedEvents.length ? (
              selectedEvents.map((e) => (
                <div className="agenda" key={e.text}>
                  <Poster id={e.id} size="xs" />
                  <div>
                    <span className="agenda__type" style={{ color: types[e.type].color }}>{types[e.type].label}</span>
                    <strong>{e.text}</strong>
                    <span className="muted small">Reminder set · 9:00 AM</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">Nothing scheduled. Pick a highlighted day.</p>
            )}

            <div className="calendar__upcoming">
              <span className="muted small">Coming up this month</span>
              <ul>
                {visible.slice(0, 6).map((e) => (
                  <li key={e.text} onClick={() => setSelected(e.day)}>
                    <span className="badge-date">Nov<b>{e.day}</b></span>
                    <span>{e.text}</span>
                    <i style={{ background: types[e.type].color }} />
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>
        <p className="caption caption--center">Sample schedule with fictional titles. In the full product, dates would sync from official release sources.</p>
      </div>
    </section>
  );
}
