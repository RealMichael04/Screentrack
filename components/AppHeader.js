import Link from "next/link";
import { LogoMark } from "./Logo";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <Link href="/" className="auth__brand app-header__brand" aria-label="ReelGuide home">
          <LogoMark />
          <span className="logo__text">Reel<span>Guide</span></span>
        </Link>
        <nav aria-label="App">
          <Link href="/recommend">Recommendations</Link>
          <Link href="/schedule">Schedules</Link>
          <Link href="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}
