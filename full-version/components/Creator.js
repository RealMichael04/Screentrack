import Reveal from "./Reveal";

export default function Creator() {
  return (
    <section className="section creator" id="creator">
      <div className="creator__glow" aria-hidden="true" />
      <div className="container">
        <Reveal className="creator__card">
          <span className="eyebrow">About the creator</span>
          <div className="creator__avatar" aria-hidden="true">MR</div>
          <h2 className="creator__name">Michael Richardson</h2>
          <p className="creator__line">Created by Michael Richardson.</p>
          <p className="lead">
            ScreenTrack started with a simple frustration: keeping up with movies and TV meant jumping between
            streaming apps, trailer channels, news sites and notes. ScreenTrack is the vision for one place that
            tracks, recommends, explains and plans everything worth watching.
          </p>
          <div className="hero__actions hero__actions--center">
            <a href="#features" className="btn btn--primary">Explore Features</a>
            <a href="#top" className="btn btn--ghost">Back to top ↑</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
