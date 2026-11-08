import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />
        <p className="muted small">
          A product concept by Michael Richardson. All titles, posters, notifications and dates shown on this page are
          sample data for demonstration. Franchise names belong to their respective owners. This product uses the TMDB API but is not
          endorsed or certified by TMDB.
        </p>
        <p className="muted small">© {new Date().getFullYear()} ReelGuide</p>
      </div>
    </footer>
  );
}
