"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { localToday } from "@/components/schedule/format";

const TYPES = {
  movie: { label: "Movie release", color: "var(--red)" },
  premiere: { label: "Series premiere", color: "var(--orange)" },
  season: { label: "New season", color: "var(--amber)" },
  finale: { label: "Finale", color: "var(--rose)" },
  episode: { label: "New episode", color: "var(--orange-soft)" },
  plan: { label: "Your schedule", color: "var(--text)" },
  popular: { label: "Popular release", color: "var(--muted)" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_IN_CELL = 3;

function shiftMonth(month, by) {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, number - 1 + by, 1));
  return date.toISOString().slice(0, 7);
}

function monthLabel(month) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}

function dayLabel(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function buildCells(month) {
  const [year, number] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(`${month}-${String(day).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function CalendarClient() {
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(Object.keys(TYPES));
  const [added, setAdded] = useState([]);

  // The current date depends on the visitor's timezone, so it's read in the browser.
  useEffect(() => {
    const now = localToday();
    setToday(now);
    setSelected(now);
    setMonth(now.slice(0, 7));
  }, []);

  const load = useCallback(async (target) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/calendar?month=${target}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setData(null);
      setError(e.message || "We couldn't load your calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (month) load(month);
  }, [month, load]);

  const cells = useMemo(() => (month ? buildCells(month) : []), [month]);
  const visible = useMemo(() => (data?.events ?? []).filter((e) => active.includes(e.type)), [data, active]);

  const go = (by) => {
    const next = shiftMonth(month, by);
    setMonth(next);
    setSelected(today?.startsWith(next) ? today : `${next}-01`);
  };

  const toggle = (type) =>
    setActive((current) => (current.includes(type) ? current.filter((t) => t !== type) : [...current, type]));

  const addToWatchlist = async (event) => {
    setError("");
    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event.addable, status: "watchlist" }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setAdded((current) => [...current, event.id]);
    } catch (e) {
      setError(e.message || "We couldn't add that. Please try again.");
    }
  };

  const selectedEvents = visible.filter((e) => e.date === selected);
  const upcoming = today ? visible.filter((e) => e.date >= today).slice(0, 6) : [];

  return (
    <div className="calendar">
      <div className="calendar__main">
        <div className="calendar__head">
          <div className="cal-nav">
            <button type="button" aria-label="Previous month" onClick={() => go(-1)} disabled={!month}>‹</button>
            <h3>{month ? monthLabel(month) : " "}</h3>
            <button type="button" aria-label="Next month" onClick={() => go(1)} disabled={!month}>›</button>
          </div>
          <div className="legend">
            {Object.entries(TYPES).map(([key, type]) => (
              <button
                type="button"
                key={key}
                className={`legend__item ${active.includes(key) ? "" : "is-off"}`}
                aria-pressed={active.includes(key)}
                onClick={() => toggle(key)}
              >
                <span style={{ background: type.color }} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="auth__error live-message" role="alert">{error}</p>}
        {data && data.followingCount === 0 && (
          <p className="auth__notice">
            You&apos;re not following anything yet. <Link href="/track">Add titles to your tracker</Link> to fill this
            calendar with their premieres and finales.
          </p>
        )}

        <div className="calendar__grid" aria-busy={loading}>
          {WEEKDAYS.map((day) => <div key={day} className="calendar__weekday">{day}</div>)}
          {cells.map((date, i) => {
            const dayEvents = date ? visible.filter((e) => e.date === date) : [];
            const classes = ["calendar__cell"];
            if (date && date === selected) classes.push("is-selected");
            if (date && date === today) classes.push("is-today");
            if (dayEvents.length) classes.push("has-events");
            return (
              <button type="button" key={date ?? `empty-${i}`} disabled={!date} className={classes.join(" ")} onClick={() => setSelected(date)}>
                {date && <span className="calendar__date">{Number(date.slice(-2))}</span>}
                <span className="calendar__events">
                  {dayEvents.slice(0, MAX_IN_CELL).map((e) => (
                    <span key={e.id} className="calendar__event" style={{ "--c": TYPES[e.type].color }}>
                      <i />
                      <em>{e.title}</em>
                    </span>
                  ))}
                  {dayEvents.length > MAX_IN_CELL && <span className="cal-more">+{dayEvents.length - MAX_IN_CELL} more</span>}
                </span>
              </button>
            );
          })}
        </div>
        {loading && <p className="muted small live-message">Loading real release dates…</p>}
      </div>

      <aside className="calendar__side">
        <span className="muted small">Selected day</span>
        <h4>{selected ? dayLabel(selected) : " "}</h4>

        {selectedEvents.length === 0 ? (
          <p className="muted">Nothing on this day.</p>
        ) : (
          selectedEvents.map((event) => (
            <div className="cal-agenda" key={event.id}>
              {event.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.posterUrl} alt="" loading="lazy" />
              ) : (
                <span className="cal-agenda__blank" aria-hidden="true" />
              )}
              <div>
                <span className="cal-agenda__type" style={{ color: TYPES[event.type].color }}>{TYPES[event.type].label}</span>
                {event.href ? <Link href={event.href}><strong>{event.title}</strong></Link> : <strong>{event.title}</strong>}
                <span className="muted small">{event.subtitle}</span>
                {event.addable && (
                  <button
                    type="button"
                    className="chip cal-agenda__add"
                    disabled={added.includes(event.id)}
                    onClick={() => addToWatchlist(event)}
                  >
                    {added.includes(event.id) ? "Added" : "+ Watchlist"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {upcoming.length > 0 && (
          <div className="calendar__upcoming">
            <span className="muted small">Coming up</span>
            <ul>
              {upcoming.map((event) => (
                <li key={event.id} onClick={() => setSelected(event.date)}>
                  <span className="badge-date">
                    {new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${event.date}T00:00:00Z`))}
                    <b>{Number(event.date.slice(-2))}</b>
                  </span>
                  <span>{event.title}</span>
                  <i style={{ background: TYPES[event.type].color }} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
