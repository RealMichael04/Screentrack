import Poster from "./Poster";
import { posterWall } from "@/data/titles";

const rows = [posterWall.slice(0, 6), posterWall.slice(6, 12), posterWall.slice(12, 18)];

// The three questions a first-time visitor needs answered right away.
const pillars = [
  {
    label: "What it is",
    title: "Your all-in-one movie & TV guide",
    text: "Track what you watch, get picks made for your taste, follow franchises in order, and see every release date in one app.",
  },
  {
    label: "Who it's for",
    title: "Anyone who loves movies and shows",
    text: "Binge-watchers, casual viewers, franchise newcomers, and anyone juggling several streaming services.",
  },
  {
    label: "Why it matters",
    title: "No more searching ten different places",
    text: "Trailers, release dates, news and recommendations are scattered across apps and sites. ReelGuide brings them together.",
  },
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__wall" aria-hidden="true">
        {rows.map((row, i) => (
          <div key={i} className={`hero__row hero__row--${i % 2 ? "rev" : "fwd"}`}>
            {[...row, ...row].map((id, j) => (
              <Poster key={`${id}-${j}`} id={id} size="lg" />
            ))}
          </div>
        ))}
      </div>
      <div className="hero__vignette" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__content">
        <span className="pill pill--glass hero__badge">
          <span className="dot dot--live" /> Movie &amp; TV tracker · Recommendations · Release alerts
        </span>
        <h1 className="hero__title">
          Everything You Watch.
          <br />
          <span className="text-gradient">Everything You Want to Watch.</span>
        </h1>
        <p className="hero__sub">
          <strong>ReelGuide</strong> is one app that tracks the movies and TV shows you watch, recommends what
          to watch next, guides you through entire franchises, and tells you when trailers, new seasons and
          premieres arrive.
        </p>
        <div className="hero__actions">
          <a href="#features" className="btn btn--primary btn--large">
            Explore Features
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a href="#how-it-works" className="btn btn--ghost btn--large">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" fill="none" /><path d="M8.5 7v6l4.5-3z" fill="currentColor" /></svg>
            How It Works
          </a>
        </div>

        <ul className="hero__pillars">
          {pillars.map((p) => (
            <li key={p.label}>
              <span className="hero__pillar-label">{p.label}</span>
              <strong>{p.title}</strong>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
