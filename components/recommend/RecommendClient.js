"use client";

import { useState } from "react";
import { GENRES, MEDIA, PACING, RUNTIMES, TONES, MAX_FAVORITES } from "@/lib/preferenceOptions";

const EXAMPLES = [
  "Find me a comedy movie under 90 minutes.",
  "A mind-bending sci-fi series",
  "Something like Knives Out",
];

function Chip({ active, onClick, children }) {
  return (
    <button type="button" className={`chip ${active ? "chip--active" : ""}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

function formatMinutes(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function lengthLabel(item) {
  if (item.mediaType === "movie") return formatMinutes(item.runtimeMinutes) ?? "Runtime unknown";
  const seasons = `${item.seasonCount} season${item.seasonCount === 1 ? "" : "s"}`;
  const episode = formatMinutes(item.episodeMinutes);
  return episode ? `${seasons} · ${episode} episodes` : seasons;
}

function describeUnderstood(u) {
  const parts = [];
  if (u.similarToTitle) parts.push(`Similar to ${u.similarToTitle}`);
  parts.push(...u.genres.map((g) => g.replace(/\b\w/g, (c) => c.toUpperCase())));
  parts.push(...u.topics);
  if (u.mediaTypes.length === 1) parts.push(u.mediaTypes[0] === "movie" ? "Movies" : "TV shows");
  if (u.maxRuntimeMinutes) parts.push(`Up to ${u.maxRuntimeMinutes} min`);
  if (u.minRuntimeMinutes) parts.push(`At least ${u.minRuntimeMinutes} min`);
  if (u.releasedFromYear && u.releasedToYear) parts.push(`${u.releasedFromYear}–${u.releasedToYear}`);
  else if (u.releasedFromYear) parts.push(`From ${u.releasedFromYear}`);
  else if (u.releasedToYear) parts.push(`Up to ${u.releasedToYear}`);
  return parts;
}

function ResultCard({ item, index }) {
  return (
    <article className="reco-card live-card" style={{ animationDelay: `${index * 70}ms` }}>
      {item.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="live-card__poster" src={item.posterUrl} alt={`${item.title} poster`} loading="lazy" />
      ) : (
        <div className="live-card__poster live-card__poster--empty" aria-hidden="true">No poster</div>
      )}
      <div className="reco-card__body">
        <h4>{item.title}</h4>
        <div className="reco-card__meta">
          <span>{item.year}</span>
          <span>·</span>
          <span>{lengthLabel(item)}</span>
        </div>
        <div className="live-card__genres">{item.genres.slice(0, 3).join(" · ")}</div>
        {item.reason && <p className="live-card__reason">{item.reason}</p>}
        <p>{item.overview.length > 180 ? `${item.overview.slice(0, 180).trimEnd()}…` : item.overview}</p>
      </div>
    </article>
  );
}

export default function RecommendClient({ initialPreferences }) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [favoriteInput, setFavoriteInput] = useState("");
  const [saveState, setSaveState] = useState("idle");

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const update = (changes) => {
    setPrefs((current) => ({ ...current, ...changes }));
    setSaveState("idle");
  };
  const toggleIn = (key, value) =>
    update({ [key]: prefs[key].includes(value) ? prefs[key].filter((x) => x !== value) : [...prefs[key], value] });

  const addFavorite = () => {
    const value = favoriteInput.trim();
    if (value && !prefs.favorites.includes(value) && prefs.favorites.length < MAX_FAVORITES) {
      update({ favorites: [...prefs.favorites, value] });
    }
    setFavoriteInput("");
  };

  const saveProfile = async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!response.ok) throw new Error();
      setPrefs(await response.json());
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const search = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setData(json);
    } catch {
      setError("We couldn't reach ReelGuide. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const understood = data ? describeUnderstood(data.understood) : [];

  return (
    <div className="reco">
      <section className="survey" aria-label="Your taste profile">
        <div className="survey__head">
          <span className="pill pill--red">Taste profile</span>
        </div>

        <div className="survey__group">
          <label>Favorite genres</label>
          <div className="chips">
            {GENRES.map((g) => (
              <Chip key={g} active={prefs.genres.includes(g)} onClick={() => toggleIn("genres", g)}>{g}</Chip>
            ))}
          </div>
        </div>

        <div className="survey__group">
          <label>Preferred movie length</label>
          <div className="chips">
            {RUNTIMES.map((r) => (
              <Chip key={r.label} active={prefs.maxRuntime === r.value} onClick={() => update({ maxRuntime: r.value })}>
                {r.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="survey__group">
          <label>Movies or TV?</label>
          <div className="segmented">
            {MEDIA.map((m) => (
              <button
                type="button"
                key={m.value}
                className={prefs.mediaPreference === m.value ? "is-active" : ""}
                onClick={() => update({ mediaPreference: m.value })}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="survey__group">
          <label htmlFor="favorite-input">Favorite actors, directors &amp; franchises</label>
          <div className="chips live-favorites">
            {prefs.favorites.map((f) => (
              <button
                type="button"
                key={f}
                className="chip chip--tag"
                aria-label={`Remove ${f}`}
                onClick={() => update({ favorites: prefs.favorites.filter((x) => x !== f) })}
              >
                {f} ×
              </button>
            ))}
          </div>
          <div className="live-favorites__add">
            <input
              id="favorite-input"
              value={favoriteInput}
              maxLength={60}
              placeholder="Add a name and press Enter"
              onChange={(e) => setFavoriteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFavorite();
                }
              }}
            />
            <button type="button" className="btn btn--ghost btn--small" onClick={addFavorite}>Add</button>
          </div>
        </div>

        <div className="survey__group">
          <label>Tone</label>
          <div className="chips">
            {TONES.map((t) => (
              <Chip key={t} active={prefs.tones.includes(t)} onClick={() => toggleIn("tones", t)}>{t}</Chip>
            ))}
          </div>
        </div>

        <div className="survey__group">
          <label>Pacing</label>
          <div className="chips">
            {PACING.map((p) => (
              <Chip key={p} active={prefs.pacing === p} onClick={() => update({ pacing: prefs.pacing === p ? null : p })}>
                {p}
              </Chip>
            ))}
          </div>
        </div>

        <div className="live-save">
          <button type="button" className="btn btn--primary btn--small" onClick={saveProfile} disabled={saveState === "saving"}>
            {saveState === "saving" ? "Saving…" : "Save profile"}
          </button>
          <span role="status" className="small">
            {saveState === "saved" && <span className="live-save__ok">Saved to your account</span>}
            {saveState === "error" && <span className="live-save__bad">Couldn&apos;t save. Try again.</span>}
          </span>
        </div>
      </section>

      <section className="search-panel" aria-label="Search">
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
        >
          <span className="search__icon" aria-hidden="true">✦</span>
          <input
            aria-label="Describe what you want to watch"
            value={query}
            maxLength={300}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're in the mood for…"
          />
          <button className="btn btn--primary btn--small" type="submit" disabled={loading || !query.trim()}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        <div className="presets">
          <span className="muted small">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              className="preset"
              disabled={loading}
              onClick={() => {
                setQuery(example);
                search(example);
              }}
            >
              “{example}”
            </button>
          ))}
        </div>

        <div aria-live="polite">
          {error && <p className="auth__error live-message">{error}</p>}
          {loading && <p className="muted live-message">Finding real matches and picking the best ones…</p>}

          {!loading && data && (
            <>
              {understood.length > 0 && (
                <p className="live-understood">
                  <span className="muted small">Looking for:</span>{" "}
                  {understood.map((part) => (
                    <span key={part} className="chip chip--tag">{part}</span>
                  ))}
                </p>
              )}
              {data.results.length === 0 ? (
                <p className="muted live-message">
                  Nothing matched all of that. Try removing a detail, or widen your preferred movie length in your
                  taste profile.
                </p>
              ) : (
                <div className="reco-grid">
                  {data.results.map((item, i) => (
                    <ResultCard key={`${item.mediaType}-${item.tmdbId}`} item={item} index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !data && !error && (
            <p className="muted live-message">Your picks will show up here.</p>
          )}
        </div>
      </section>
    </div>
  );
}
