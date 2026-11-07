"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { authClient } from "@/lib/auth/client";

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
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const initials = (user?.name || user?.email || "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="container nav__inner">
        <Logo onClick={() => setOpen(false)} />
        <nav className="nav__links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav__auth">
          {user ? (
            <Link href="/account" className="nav__user" aria-label="Your account" title={user.name || user.email}>
              {initials || "Me"}
            </Link>
          ) : (
            <>
              <Link href="/auth/sign-in" className="nav__signin">Sign in</Link>
              <Link href="/auth/sign-up" className="btn btn--small btn--primary">Get started</Link>
            </>
          )}
        </div>
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
