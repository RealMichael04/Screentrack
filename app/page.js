const features = [
  { title: "Track", text: "Log the movies and shows you've watched, follow your progress episode by episode, and rate what you see." },
  { title: "Stay Updated", text: "Trailers, release dates, new seasons and casting news for the titles you follow." },
  { title: "Get Recommendations", text: "A short taste survey powers picks like “Find me a comedy movie under 90 minutes.”" },
  { title: "Explore Franchises", text: "Watch any franchise in chronological, release, recommended or completionist order." },
  { title: "Plan with a Calendar", text: "See upcoming premieres, finales and movie releases on one personal calendar." },
];

export default function Home() {
  return (
    <main className="page">
      <span className="eyebrow">Product concept</span>
      <h1>
        Screen<span>Track</span>
      </h1>
      <p className="tagline">Everything You Watch. Everything You Want to Watch.</p>
      <p className="summary">
        ScreenTrack is an all-in-one entertainment companion. Instead of jumping between apps and websites,
        it brings tracking, recommendations, news and release dates for movies and TV shows into one place.
      </p>

      <ul className="features">
        {features.map((f) => (
          <li key={f.title}>
            <strong>{f.title}</strong>
            <p>{f.text}</p>
          </li>
        ))}
      </ul>

      <footer className="creator">
        <p className="name">Michael Richardson</p>
        <p>Created by Michael Richardson.</p>
      </footer>
    </main>
  );
}
