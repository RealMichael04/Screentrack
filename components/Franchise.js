"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import { entries, orders } from "@/data/franchise";

const otherFranchises = ["Marvel Cinematic Universe", "Middle-earth", "Wizarding World", "Star Trek", "James Bond", "DC"];

export default function Franchise() {
  const [order, setOrder] = useState("chronological");
  const [done, setDone] = useState(() => new Set(["ep1", "ep2"]));

  const current = orders[order];
  const completed = current.list.filter((id) => done.has(id)).length;
  const pct = Math.round((completed / current.list.length) * 100);
  const nextUp = current.list.find((id) => !done.has(id));
  const seriesCount = current.list.filter((id) => entries[id].type === "Series").length;
  const filmCount = current.list.length - seriesCount;

  const toggle = (id) =>
    setDone((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="section section--feature" id="franchise">
      <div className="franchise__bg" aria-hidden="true" />
      <div className="container">
        <SectionHeader eyebrow="Discover a new franchise" title="Start any universe. Watch it your way." align="center">
          Pick a franchise and ReelGuide builds a guided watchlist in the order you prefer.
          Check off each entry as you go — your progress carries across every viewing order.
        </SectionHeader>

        <Reveal className="franchise">
          <div className="franchise__side">
            <div className="franchise__title">
              <span className="pill pill--orange">Example franchise</span>
              <h3>Star Wars</h3>
              <p className="muted">{filmCount} films{seriesCount ? ` · ${seriesCount} series` : ""}</p>
            </div>

            <div className="order-picker" role="radiogroup" aria-label="Viewing order">
              {Object.entries(orders).map(([key, o]) => (
                <button
                  key={key}
                  role="radio"
                  aria-checked={order === key}
                  className={`order ${order === key ? "order--active" : ""}`}
                  onClick={() => setOrder(key)}
                >
                  <strong>{o.label}</strong>
                  <span>{o.blurb}</span>
                </button>
              ))}
            </div>

            <div className="ring-progress">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="52" className="ring-progress__track" />
                <circle
                  cx="60" cy="60" r="52"
                  className="ring-progress__fill"
                  style={{ strokeDasharray: `${(pct / 100) * 326.7} 326.7` }}
                />
              </svg>
              <div className="ring-progress__label">
                <strong>{pct}%</strong>
                <span>{completed} of {current.list.length} complete</span>
              </div>
              {nextUp && (
                <div className="next-up">
                  <span className="muted small">Up next</span>
                  <strong>{entries[nextUp].title}</strong>
                </div>
              )}
            </div>
          </div>

          <ol className="timeline" key={order}>
            {current.list.map((id, i) => {
              const e = entries[id];
              const isDone = done.has(id);
              const isOptional = current.optional?.includes(id);
              const note = current.notes?.[id];
              return (
                <li key={id} className={`timeline__item ${isDone ? "is-done" : ""}`} style={{ animationDelay: `${i * 35}ms` }}>
                  <button className="timeline__check" onClick={() => toggle(id)} aria-label={`Mark ${e.title} as ${isDone ? "not watched" : "watched"}`}>
                    {isDone ? "✓" : i + 1}
                  </button>
                  <div className="timeline__body">
                    <strong>{e.title}</strong>
                    <span className="timeline__meta">
                      <span className={`type type--${e.type.toLowerCase()}`}>{e.type}</span>
                      {e.year} · {e.length} · {e.era}
                    </span>
                    {(isOptional || note) && (
                      <span className="timeline__tags">
                        {isOptional && <span className="tag tag--optional">Optional</span>}
                        {note && <span className="tag">{note}</span>}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal className="franchise__more">
          <span className="muted small">The same guided experience for other universes, such as:</span>
          <div className="chips chips--center">
            {otherFranchises.map((f) => (
              <span key={f} className="chip chip--tag">{f}</span>
            ))}
          </div>
          <p className="caption">Franchise names are used for illustration only. ReelGuide is a concept and is not affiliated with any studio.</p>
        </Reveal>
      </div>
    </section>
  );
}
