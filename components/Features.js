import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";

const features = [
  { href: "#track", icon: "✓", title: "Track Everything", text: "Movies, shows, seasons and episodes — rated, reviewed and organized in one library." },
  { href: "#updates", icon: "◉", title: "Never Miss an Update", text: "Trailers, release dates, renewals and casting news for the titles you follow." },
  { href: "#recommendations", icon: "✦", title: "Made For You", text: "A short taste profile powers recommendations and natural-language search." },
  { href: "#franchise", icon: "▶", title: "Franchise Guides", text: "Binge any universe in chronological, release, recommended or completionist order." },
  { href: "#calendar", icon: "▦", title: "Entertainment Calendar", text: "Premieres, finales and release days for everything you care about, on one calendar." },
  { href: "#how-it-works", icon: "⟶", title: "Effortless Setup", text: "Build your profile in minutes and ReelGuide starts working for you." },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <SectionHeader eyebrow="Features" title="More than a watchlist." align="center">
          Today, fans juggle streaming apps, trailer channels, news sites and spreadsheets.
          ReelGuide brings tracking, discovery, news and planning into a single companion.
        </SectionHeader>
        <div className="feature-grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <a href={f.href} className="feature-card">
                <span className="feature-card__icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <span className="feature-card__link">Learn more →</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
