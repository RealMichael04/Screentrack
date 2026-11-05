import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />
        <p className="muted small">
          A product concept by Michael Richardson. All titles, posters, notifications and dates shown are sample
          data for demonstration. Franchise names belong to their respective owners.
        </p>
        <p className="muted small">© {new Date().getFullYear()} ReelGuide</p>
      </div>
    </footer>
  );
}
