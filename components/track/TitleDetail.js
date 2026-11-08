"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { localToday } from "@/components/schedule/format";

const STATUSES = [
  { value: "watchlist", label: "Watchlist" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

function Rating({ value, onChange }) {
  return (
    <div className="rate" role="group" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = value >= star ? 100 : value === star - 0.5 ? 50 : 0;
        return (
          <span key={star} className="rate__star" style={{ "--fill": `${fill}%` }}>
            ★
            <button type="button" aria-label={`${star - 0.5} stars`} onClick={() => onChange(star - 0.5)} />
            <button type="button" aria-label={`${star} stars`} onClick={() => onChange(star)} />
          </span>
        );
      })}
    </div>
  );
}

function Season({ season, base, today, onProgress, onError }) {
  const [open, setOpen] = useState(false);
  const [episodes, setEpisodes] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setOpen((current) => !current);
    if (episodes) return;
    try {
      const response = await fetch(`${base}/season/${season.seasonNumber}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setEpisodes(json.episodes);
    } catch (e) {
      onError(e.message || "We couldn't load that season.");
      setOpen(false);
    }
  };

  const aired = (episode) => episode.releaseDate && episode.releaseDate <= today;

  const save = async (list, watched) => {
    const previous = episodes;
    const changed = new Set(list.map((e) => e.episodeNumber));
    setEpisodes((current) => current.map((e) => (changed.has(e.episodeNumber) ? { ...e, watched } : e)));
    setBusy(true);
    onError("");
    try {
      const response = await fetch(`${base}/episodes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodes: list.map((e) => ({ seasonNumber: e.seasonNumber, episodeNumber: e.episodeNumber })),
          watched,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      onProgress(json);
    } catch (e) {
      setEpisodes(previous);
      onError(e.message || "We couldn't save that. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const available = episodes?.filter(aired) ?? [];
  const allWatched = available.length > 0 && available.every((e) => e.watched);
  const watchedCount = episodes?.filter((e) => e.watched).length;

  return (
    <li className="season">
      <button type="button" className="season__toggle" aria-expanded={open} onClick={load}>
        <span>{season.name}</span>
        <span className="muted small">
          {episodes ? `${watchedCount} of ${episodes.length}` : `${season.episodeCount} episodes`}
        </span>
      </button>
      {open && (
        <div className="season__body">
          {!episodes ? (
            <p className="muted small">Loading…</p>
          ) : (
            <>
              {available.length > 0 && (
                <button type="button" className="preset" disabled={busy} onClick={() => save(available, !allWatched)}>
                  {allWatched ? "Uncheck season" : "Mark season watched"}
                </button>
              )}
              <ul>
                {episodes.map((episode) => {
                  const isAired = aired(episode);
                  const classes = ["sched-item"];
                  if (episode.watched) classes.push("sched-item--done");
                  if (!isAired) classes.push("sched-item--upcoming");
                  return (
                    <li key={episode.episodeNumber}>
                      <label className={classes.join(" ")}>
                        <input
                          type="checkbox"
                          checked={episode.watched}
                          disabled={!isAired}
                          onChange={(e) => save([episode], e.target.checked)}
                        />
                        <span className="sched-item__title">{episode.episodeNumber}. {episode.title}</span>
                        <span className="muted small">
                          {isAired ? (episode.runtimeMinutes ? `${episode.runtimeMinutes} min` : "") : episode.releaseDate ?? "TBA"}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default function TitleDetail({ initialTitle }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [review, setReview] = useState(initialTitle.review);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [today] = useState(localToday);

  const base = `/api/track/${title.mediaType}/${title.tmdbId}`;

  const patch = async (changes, message) => {
    setError("");
    setNotice("");
    try {
      const response = await fetch(base, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setTitle((current) => ({ ...current, status: json.status, rating: json.rating, review: json.review }));
      if (message) setNotice(message);
    } catch (e) {
      setError(e.message || "We couldn't save that. Please try again.");
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      const response = await fetch(base, { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.push("/track");
      router.refresh();
    } catch {
      setRemoving(false);
      setError("We couldn't remove that. Please try again.");
    }
  };

  return (
    <>
      <Link href="/track" className="preset sched-back">← Tracker</Link>
      <div className="title-layout">
        {title.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="title-layout__poster" src={title.posterUrl} alt={`${title.title} poster`} />
        ) : (
          <div className="title-layout__poster" aria-hidden="true" />
        )}

        <div>
          <h1 className="app-page__title">{title.title}</h1>
          <p className="muted">
            {title.mediaType === "tv" ? "TV show" : "Movie"}{title.year ? ` · ${title.year}` : ""}
            {title.mediaType === "tv" && title.episodeTotal
              ? ` · ${title.watchedEpisodes} of ${title.episodeTotal} episodes watched`
              : ""}
          </p>

          <div className="survey__group">
            <label>Status</label>
            <div className="segmented">
              {STATUSES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  className={title.status === s.value ? "is-active" : ""}
                  onClick={() => patch({ status: s.value })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="survey__group">
            <label>Your rating {title.rating ? <em>{title.rating} stars</em> : null}</label>
            <Rating value={title.rating ?? 0} onChange={(value) => patch({ rating: value === title.rating ? null : value })} />
          </div>

          <div className="survey__group">
            <label htmlFor="review">Your review</label>
            <textarea
              id="review"
              className="title-review"
              value={review}
              maxLength={2000}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think?"
            />
            <button type="button" className="btn btn--primary btn--small live-save-button" onClick={() => patch({ review }, "Review saved")}>
              Save review
            </button>
          </div>

          <div aria-live="polite">
            {notice && <p className="live-save__ok small">{notice}</p>}
            {error && <p className="auth__error live-message" role="alert">{error}</p>}
          </div>

          {title.mediaType === "tv" && title.seasons?.length > 0 && (
            <div className="survey__group">
              <label>Episodes</label>
              <ul className="seasons">
                {title.seasons.map((season) => (
                  <Season
                    key={season.seasonNumber}
                    season={season}
                    base={base}
                    today={today}
                    onError={setError}
                    onProgress={(progress) =>
                      setTitle((current) => ({ ...current, status: progress.status, watchedEpisodes: progress.watchedEpisodes }))
                    }
                  />
                ))}
              </ul>
            </div>
          )}

          {confirmRemove ? (
            <div className="live-save">
              <span className="small">Remove this from your tracker?</span>
              <button type="button" className="btn btn--primary btn--small" onClick={remove} disabled={removing}>
                {removing ? "Removing…" : "Yes, remove"}
              </button>
              <button type="button" className="preset" onClick={() => setConfirmRemove(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="preset" onClick={() => setConfirmRemove(true)}>Remove from tracker</button>
          )}
        </div>
      </div>
    </>
  );
}
