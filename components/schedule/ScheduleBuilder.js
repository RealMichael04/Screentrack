"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UpgradeCard from "@/components/billing/UpgradeCard";
import { WEEKDAYS, addDaysTo, describeSuggestions, formatDate, localToday } from "./format";

const DAILY_LIMITS = [60, 90, 120, 180, 240];

export default function ScheduleBuilder({ schedules, isPremium, offer }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [chosenSeasons, setChosenSeasons] = useState([]);

  const [today] = useState(localToday);
  // The server runs on UTC, so anything showing the local date waits for the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [startDate, setStartDate] = useState(today);
  const [deadline, setDeadline] = useState(() => addDaysTo(today, 30));
  const [viewingDays, setViewingDays] = useState([5, 6, 0]);
  const [maxMinutes, setMaxMinutes] = useState(120);
  const [order, setOrder] = useState("release");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const search = async (event) => {
    event.preventDefault();
    if (query.trim().length < 2 || searching) return;
    setSearching(true);
    setError(null);
    try {
      const response = await fetch(`/api/schedules/search?q=${encodeURIComponent(query.trim())}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setResults(json.results);
    } catch (e) {
      setError({ message: e.message || "We couldn't search just now. Please try again." });
    } finally {
      setSearching(false);
    }
  };

  const choose = async (item) => {
    setSelected(item);
    setResults(null);
    setSeasons([]);
    setChosenSeasons([]);
    setError(null);
    if (item.mediaType !== "tv") return;
    try {
      const response = await fetch(`/api/schedules/search?tvId=${item.tmdbId}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setSeasons(json.seasons);
      setChosenSeasons(json.seasons.map((s) => s.seasonNumber));
    } catch (e) {
      setError({ message: e.message || "We couldn't load the seasons. Please try again." });
    }
  };

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const create = async () => {
    if (!selected || creating) return;
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: selected.mediaType,
          tmdbId: selected.tmdbId,
          seasons: selected.mediaType === "tv" ? chosenSeasons : undefined,
          startDate,
          deadline,
          viewingDays,
          maxMinutesPerDay: maxMinutes,
          order,
          today,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError({ message: json.error, hint: describeSuggestions(json.suggestions) });
        setCreating(false);
        return;
      }
      router.push(`/schedule/${json.id}`);
    } catch {
      setError({ message: "We couldn't reach ReelGuide. Check your connection and try again." });
      setCreating(false);
    }
  };

  return (
    <div className="reco">
      {!isPremium ? <UpgradeCard offer={offer} /> : (
      <section className="survey" aria-label="New schedule">
        <div className="survey__head">
          <span className="pill pill--red">New schedule</span>
        </div>

        <div className="survey__group">
          <label htmlFor="schedule-search">Franchise or TV show</label>
          {selected ? (
            <div className="sched-picked">
              <strong>{selected.title}</strong>
              <button type="button" className="preset" onClick={() => setSelected(null)}>Change</button>
            </div>
          ) : (
            <>
              <form className="search" onSubmit={search}>
                <input
                  id="schedule-search"
                  value={query}
                  maxLength={100}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Star Wars, Breaking Bad…"
                />
                <button className="btn btn--primary btn--small" type="submit" disabled={searching || query.trim().length < 2}>
                  {searching ? "Searching…" : "Search"}
                </button>
              </form>
              {results && results.length === 0 && <p className="muted small live-message">No matches. Try another name.</p>}
              {results && results.length > 0 && (
                <ul className="sched-results">
                  {results.map((item) => (
                    <li key={`${item.mediaType}-${item.tmdbId}`}>
                      <button type="button" onClick={() => choose(item)}>
                        {item.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.posterUrl} alt="" loading="lazy" />
                        ) : (
                          <span className="sched-results__blank" aria-hidden="true" />
                        )}
                        <span>
                          <strong>{item.title}</strong>
                          <span className="muted small">
                            {item.mediaType === "tv" ? `TV show${item.year ? ` · ${item.year}` : ""}` : "Movie franchise"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {selected?.mediaType === "tv" && seasons.length > 0 && (
          <div className="survey__group">
            <label>Seasons</label>
            <div className="chips">
              {seasons.map((s) => (
                <button
                  type="button"
                  key={s.seasonNumber}
                  className={`chip ${chosenSeasons.includes(s.seasonNumber) ? "chip--active" : ""}`}
                  aria-pressed={chosenSeasons.includes(s.seasonNumber)}
                  onClick={() => toggle(chosenSeasons, setChosenSeasons, s.seasonNumber)}
                >
                  {s.seasonNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {selected?.mediaType === "collection" && (
          <div className="survey__group">
            <label>Viewing order</label>
            <div className="segmented sched-two">
              <button type="button" className={order === "release" ? "is-active" : ""} onClick={() => setOrder("release")}>Release order</button>
              <button type="button" className={order === "story" ? "is-active" : ""} onClick={() => setOrder("story")}>Story order</button>
            </div>
          </div>
        )}

        {mounted && <div className="sched-dates">
          <div className="survey__group">
            <label htmlFor="start-date">Start</label>
            <input id="start-date" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="survey__group">
            <label htmlFor="deadline">Deadline</label>
            <input id="deadline" type="date" min={startDate} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>}

        <div className="survey__group">
          <label>Days you can watch</label>
          <div className="chips">
            {WEEKDAYS.map((d) => (
              <button
                type="button"
                key={d.value}
                className={`chip ${viewingDays.includes(d.value) ? "chip--active" : ""}`}
                aria-pressed={viewingDays.includes(d.value)}
                onClick={() => toggle(viewingDays, setViewingDays, d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="survey__group">
          <label htmlFor="max-minutes">Most you can watch per day <em>{maxMinutes} min</em></label>
          <div className="chips">
            {DAILY_LIMITS.map((minutes) => (
              <button
                type="button"
                key={minutes}
                className={`chip ${maxMinutes === minutes ? "chip--active" : ""}`}
                aria-pressed={maxMinutes === minutes}
                onClick={() => setMaxMinutes(minutes)}
              >
                {minutes / 60 >= 1 && minutes % 60 === 0 ? `${minutes / 60}h` : `${minutes} min`}
              </button>
            ))}
          </div>
          <input
            id="max-minutes"
            className="sched-minutes"
            type="number"
            min={15}
            max={1440}
            step={5}
            value={maxMinutes}
            onChange={(e) => setMaxMinutes(Number(e.target.value))}
            aria-label="Minutes per day"
          />
        </div>

        {error && (
          <p className="auth__error live-message" role="alert">
            {error.message} {error.hint}
          </p>
        )}

        <button type="button" className="btn btn--primary sched-create" onClick={create} disabled={!selected || creating}>
          {creating ? "Building your schedule…" : "Build my schedule"}
        </button>
      </section>
      )}

      <section className="search-panel" aria-label="Your schedules">
        <div className="survey__head">
          <span className="pill pill--red">Your schedules</span>
        </div>
        {schedules.length === 0 ? (
          <p className="muted">Your saved schedules will show up here.</p>
        ) : (
          <ul className="sched-list">
            {schedules.map((s) => {
              const percent = Math.round((s.watched / s.total) * 100);
              return (
                <li key={s.id}>
                  <Link href={`/schedule/${s.id}`}>
                    <strong>{s.title}</strong>
                    <span className="muted small">
                      {s.watched} of {s.total} watched
                      {s.nextDate ? ` · Next: ${formatDate(s.nextDate)}` : " · Finished!"}
                      {` · Due ${formatDate(s.deadline, { month: "short", day: "numeric" })}`}
                    </span>
                    <span className="sched-bar" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
