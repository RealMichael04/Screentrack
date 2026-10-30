import Poster from "./Poster";
import { posterWall } from "@/data/titles";

const rows = [posterWall.slice(0, 6), posterWall.slice(6, 12), posterWall.slice(12, 18)];

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
          <span className="dot dot--live" /> Concept preview · Your personal entertainment hub
        </span>
        <h1 className="hero__title">
          Everything You Watch.
          <br />
          <span className="text-gradient">Everything You Want to Watch.</span>
        </h1>
        <p className="hero__sub">
          Your personal entertainment hub. Track your favorites, discover your next obsession,
          and never miss an update.
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
        <ul className="hero__stats">
          <li><strong>1</strong><span>place for everything you watch</span></li>
          <li><strong>4</strong><span>ways to binge any franchise</span></li>
          <li><strong>∞</strong><span>recommendations tuned to you</span></li>
        </ul>
      </div>

      <div className="hero__scroll" aria-hidden="true"><span /></div>
    </section>
  );
}
