"use client";

import Link from "next/link";
import { useState } from "react";

const TABS = [
  { key: "watching", label: "Watching" },
  { key: "watched", label: "Watched" },
  { key: "watchlist", label: "Watchlist" },
  { key: "history", label: "History" },
];

const ADD_OPTIONS = [
  { status: "watchlist", label: "+ Watchlist" },
  { status: "watching", label: "Watching" },
  { status: "watched", label: "Watched" },
];

function cardNote(item) {
  if (item.mediaType === "tv" && item.status === "watching" && item.lastSeason) {
    const total = item.episodeTotal ? ` of ${item.episodeTotal}` : "";
    return `Last: S${item.lastSeason} E${item.lastEpisode} · ${item.watchedEpisodes}${total}`;
  }
  if (item.rating) return `★ ${item.rating}`;
  return item.mediaType === "tv" ? "TV show" : "Movie";
}

function historyText(entry) {
  if (entry.seasonNumber) return `${entry.title} · S${entry.seasonNumber} E${entry.episodeNumber}`;
  return entry.title;
}

export default function TrackerClient({ initialLibrary, initialHistory }) {
  const [library, setLibrary] = useState(initialLibrary);
  const [history] = useState(initialHistory);
  const [tab, setTab] = useState("watching");

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  const keyOf = (item) => `${item.mediaType}-${item.tmdbId}`;
  const statusOf = (item) => library.find((x) => keyOf(x) === keyOf(item))?.status;

  const search = async (event) => {
    event.preventDefault();
    if (query.trim().length < 2 || searching) return;
    setSearching(true);
    setError("");
    try {
      const response = await fetch(`/api/track/search?q=${encodeURIComponent(query.trim())}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setResults(json.results);
    } catch (e) {
      setError(e.message || "We couldn't search just now. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const add = async (item, status) => {
    setSaving(keyOf(item));
    setError("");
    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType: item.mediaType, tmdbId: item.tmdbId, status }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setLibrary((current) => [json, ...current.filter((x) => keyOf(x) !== keyOf(json))]);
      setTab(status);
    } catch (e) {
      setError(e.message || "We couldn't save that. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const visible = library.filter((item) => item.status === tab);

  return (
    <div className="track-layout">
      <section className="track-panel" aria-label="Add a title">
        <form className="search" onSubmit={search}>
          <span className="search__icon" aria-hidden="true">✦</span>
          <input
            aria-label="Search movies and TV shows"
            value={query}
            maxLength={100}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any movie or TV show…"
          />
          <button className="btn btn--primary btn--small" type="submit" disabled={searching || query.trim().length < 2}>
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {error && <p className="auth__error live-message" role="alert">{error}</p>}
        {results && results.length === 0 && <p className="muted live-message">No matches. Try another name.</p>}

        {results && results.length > 0 && (
          <ul className="track-results">
            {results.map((item) => {
              const current = statusOf(item);
              return (
                <li key={keyOf(item)} className="track-result">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="track-result__blank" aria-hidden="true" />
                  )}
                  <div className="track-result__info">
                    <strong>{item.title}</strong>
                    <span className="muted small">
                      {item.mediaType === "tv" ? "TV show" : "Movie"}{item.year ? ` · ${item.year}` : ""}
                    </span>
                  </div>
                  <div className="track-result__actions">
                    {ADD_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.status}
                        className={`chip ${current === option.status ? "chip--active" : ""}`}
                        aria-pressed={current === option.status}
                        disabled={saving === keyOf(item)}
                        onClick={() => add(item, option.status)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="track-panel" aria-label="Your library">
        <div className="tabs track-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              type="button"
              role="tab"
              key={t.key}
              aria-selected={tab === t.key}
              className={`tab ${tab === t.key ? "tab--active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "history" ? (
          history.length === 0 ? (
            <p className="muted">Things you finish will show up here.</p>
          ) : (
            <ul className="track-history">
              {history.map((entry, i) => (
                <li key={`${entry.kind}-${entry.tmdbId}-${entry.seasonNumber}-${entry.episodeNumber}-${i}`}>
                  <span>{historyText(entry)}{entry.rating ? ` · ★ ${entry.rating}` : ""}</span>
                  <span className="muted small">
                    {new Date(entry.happenedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          )
        ) : visible.length === 0 ? (
          <p className="muted">Nothing here yet. Search above to add something.</p>
        ) : (
          <div className="track-grid">
            {visible.map((item) => (
              <Link key={keyOf(item)} href={`/track/${item.mediaType}/${item.tmdbId}`} className="track-card">
                {item.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.posterUrl} alt="" loading="lazy" />
                ) : (
                  <span className="track-card__blank" aria-hidden="true" />
                )}
                <strong>{item.title}</strong>
                <span className="muted small">{cardNote(item)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
