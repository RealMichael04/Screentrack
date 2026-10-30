export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <a href="#top" className="logo">
          <span className="logo__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          </span>
          <span className="logo__text">Screen<span>Track</span></span>
        </a>
        <p className="muted small">
          A product concept by Michael Richardson. All titles, posters, notifications and dates shown are sample
          data for demonstration. Franchise names belong to their respective owners.
        </p>
        <p className="muted small">© {new Date().getFullYear()} ScreenTrack</p>
      </div>
    </footer>
  );
}
