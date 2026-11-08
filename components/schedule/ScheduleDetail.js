"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import UpgradeCard from "@/components/billing/UpgradeCard";
import { WEEKDAYS, describeSuggestions, formatDate, formatMinutes, localToday } from "./format";

const EXAMPLES = ["I'm busy next weekend", "I fell behind, respread what's left", "I can watch 3 hours a day now"];

function itemLabel(item) {
  return item.mediaType === "episode" ? `S${item.seasonNumber} E${item.episodeNumber} · ${item.title}` : item.title;
}

export default function ScheduleDetail({ initialSchedule, isPremium, offer }) {
  const router = useRouter();
  const [schedule, setSchedule] = useState(initialSchedule);
  const [today] = useState(localToday);

  const [request, setRequest] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const days = useMemo(() => {
    const byDate = new Map();
    for (const item of schedule.items) {
      if (!byDate.has(item.scheduledDate)) byDate.set(item.scheduledDate, []);
      byDate.get(item.scheduledDate).push(item);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [schedule.items]);

  const total = schedule.items.length;
  const watched = schedule.items.filter((i) => i.watched).length;
  const percent = total ? Math.round((watched / total) * 100) : 0;
  const minutesLeft = schedule.items.filter((i) => !i.watched).reduce((sum, i) => sum + i.runtimeMinutes, 0);
  const overdue = schedule.items.filter((i) => !i.watched && i.scheduledDate < today).length;
  const hasEstimates = schedule.items.some((i) => i.runtimeEstimated);

  const setWatched = async (item, value) => {
    const apply = (state) =>
      setSchedule((current) => ({
        ...current,
        items: current.items.map((i) => (i.id === item.id ? { ...i, watched: state } : i)),
      }));
    apply(value);
    setError("");
    try {
      const response = await fetch(`/api/schedules/${schedule.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, watched: value }),
      });
      if (!response.ok) throw new Error();
    } catch {
      apply(!value);
      setError("We couldn't save that. Please try again.");
    }
  };

  const adjust = async (text) => {
    const trimmed = text.trim();
    if (trimmed.length < 3 || adjusting) return;
    setAdjusting(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch(`/api/schedules/${schedule.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: trimmed, today }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError([json.error, describeSuggestions(json.suggestions)].filter(Boolean).join(" "));
        return;
      }
      setSchedule(json.schedule);
      setNotice(json.summary);
      setRequest("");
    } catch {
      setError("We couldn't reach ReelGuide. Check your connection and try again.");
    } finally {
      setAdjusting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.push("/schedule");
      router.refresh();
    } catch {
      setDeleting(false);
      setError("We couldn't delete that. Please try again.");
    }
  };

  const dayNames = schedule.viewingDays.map((d) => WEEKDAYS[d].label).join(", ");

  return (
    <>
      <Link href="/schedule" className="preset sched-back">← All schedules</Link>
      <div className="section-header">
        <h1 className="app-page__title">{schedule.title}</h1>
        <p className="muted">
          {dayNames} · Up to {formatMinutes(schedule.maxMinutesPerDay)} a day · Due {formatDate(schedule.deadline)}
          {schedule.viewingOrder === "story" ? " · Story order" : ""}
        </p>
      </div>

      <div className="reco">
        <section className="survey" aria-label="Progress and changes">
          <div className="survey__head">
            <span className="pill pill--red">Progress</span>
            <span className="muted small">{percent}%</span>
          </div>
          <span className="sched-bar sched-bar--large" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
          <p className="sched-stats">
            <strong>{watched} of {total}</strong> watched
            {minutesLeft > 0 && <span className="muted"> · {formatMinutes(minutesLeft)} left</span>}
          </p>
          {overdue > 0 && (
            <p className="auth__notice">
              You&apos;re {overdue} behind.{isPremium ? " Ask below to respread what's left." : ""}
            </p>
          )}

          {!isPremium ? <UpgradeCard offer={offer} compact /> : <div className="survey__group">
            <label htmlFor="adjust-input">Need to change something?</label>
            <form
              className="search"
              onSubmit={(e) => {
                e.preventDefault();
                adjust(request);
              }}
            >
              <input
                id="adjust-input"
                value={request}
                maxLength={300}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="Tell us what changed…"
              />
              <button className="btn btn--primary btn--small" type="submit" disabled={adjusting || request.trim().length < 3}>
                {adjusting ? "Updating…" : "Update"}
              </button>
            </form>
            <div className="presets sched-presets">
              {EXAMPLES.map((example) => (
                <button type="button" key={example} className="preset" disabled={adjusting} onClick={() => adjust(example)}>
                  “{example}”
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {notice && <p className="live-save__ok small">{notice}</p>}
              {error && <p className="auth__error live-message" role="alert">{error}</p>}
            </div>
          </div>}
          {!isPremium && error && <p className="auth__error live-message" role="alert">{error}</p>}

          {schedule.skippedCount > 0 && (
            <p className="muted small">
              {schedule.skippedCount} unreleased {schedule.skippedCount === 1 ? "title isn't" : "titles aren't"} included.
            </p>
          )}
          {hasEstimates && <p className="muted small">~ means TMDB has no runtime for that episode, so we estimated it from the show.</p>}

          {confirmingDelete ? (
            <div className="live-save">
              <span className="small">Delete this schedule?</span>
              <button type="button" className="btn btn--primary btn--small" onClick={remove} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button type="button" className="preset" onClick={() => setConfirmingDelete(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="preset" onClick={() => setConfirmingDelete(true)}>Delete schedule</button>
          )}
        </section>

        <section className="search-panel" aria-label="Day by day">
          <ol className="sched-days">
            {days.map(([date, items]) => {
              const minutes = items.reduce((sum, i) => sum + i.runtimeMinutes, 0);
              return (
                <li key={date} className={date === today ? "sched-day sched-day--today" : "sched-day"}>
                  <div className="sched-day__head">
                    <strong>{date === today ? "Today" : formatDate(date)}</strong>
                    <span className="muted small">{formatMinutes(minutes)}</span>
                  </div>
                  <ul>
                    {items.map((item) => (
                      <li key={item.id}>
                        <label className={item.watched ? "sched-item sched-item--done" : "sched-item"}>
                          <input type="checkbox" checked={item.watched} onChange={(e) => setWatched(item, e.target.checked)} />
                          <span className="sched-item__title">{itemLabel(item)}</span>
                          <span className="muted small">
                            {item.runtimeEstimated ? "~" : ""}{formatMinutes(item.runtimeMinutes)}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}
