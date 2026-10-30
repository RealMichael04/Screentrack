import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import Poster from "./Poster";

const updateTypes = [
  { icon: "▶", title: "Trailers & teasers", text: "New trailers for titles you follow, surfaced the moment they're added." },
  { icon: "◷", title: "Release dates", text: "Upcoming movie release dates and any changes to them." },
  { icon: "✎", title: "Show announcements", text: "Renewals, cancellations and news for the series you follow." },
  { icon: "✦", title: "New seasons & premieres", text: "Season announcements and premiere dates as soon as they're official." },
  { icon: "★", title: "Casting & big news", text: "Casting announcements and major entertainment headlines that matter to you." },
];

const feed = [
  { id: "emberline", tag: "Trailer", text: "The final trailer for Emberline is here.", time: "2h" },
  { id: "starboundHeist", tag: "Release date", text: "Starbound Heist moves up to Nov 20.", time: "5h" },
  { id: "neonParish", tag: "Casting", text: "Neon Parish adds a new lead for Season 2.", time: "1d" },
  { id: "goldenHour", tag: "Premiere", text: "Golden Hour Season 4 premieres Dec 4.", time: "2d" },
];

export default function Updates() {
  return (
    <section className="section section--tint" id="updates">
      <div className="container split split--reverse">
        <div className="split__copy">
          <SectionHeader eyebrow="Never miss an update" title="The news you care about. Nothing you don't.">
            ScreenTrack is designed to watch the entertainment world for you and deliver only the updates
            connected to the movies, shows and franchises you follow.
          </SectionHeader>
          <div className="mini-grid">
            {updateTypes.map((u, i) => (
              <Reveal key={u.title} delay={i * 60} className="mini-card">
                <span className="mini-card__icon" aria-hidden="true">{u.icon}</span>
                <div>
                  <strong>{u.title}</strong>
                  <p>{u.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="split__visual phone-wrap">
          <div className="phone">
            <div className="phone__notch" />
            <div className="phone__screen">
              <div className="phone__header">
                <span className="small muted">Fri, Oct 30</span>
                <strong>Updates</strong>
              </div>

              <div className="notification notification--hero">
                <div className="notification__app">
                  <span className="logo__mark logo__mark--sm" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
                  </span>
                  ScreenTrack <em>now</em>
                </div>
                <strong>Your favorite show has officially announced a new season!</strong>
                <p>Midnight Atlas has been renewed for Season 3. Tap to add the premiere to your calendar.</p>
                <div className="notification__actions">
                  <span>Add to calendar</span>
                  <span>View details</span>
                </div>
              </div>

              <div className="feed">
                {feed.map((f) => (
                  <div className="feed__item" key={f.text}>
                    <Poster id={f.id} size="xs" />
                    <div>
                      <span className="feed__tag">{f.tag}</span>
                      <p>{f.text}</p>
                    </div>
                    <em>{f.time}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="caption">Example notifications for illustration. Live data feeds are not yet connected.</p>
        </Reveal>
      </div>
    </section>
  );
}
