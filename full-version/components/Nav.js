"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#track", label: "Track" },
  { href: "#updates", label: "Updates" },
  { href: "#recommendations", label: "For You" },
  { href: "#franchise", label: "Franchises" },
  { href: "#calendar", label: "Calendar" },
  { href: "#creator", label: "Creator" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="logo" onClick={() => setOpen(false)}>
          <span className="logo__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          </span>
          <span className="logo__text">Screen<span>Track</span></span>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#features" className="btn btn--small btn--primary nav__cta">Explore</a>
        <button
          className="nav__toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}
