import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth/server";
import { signOut } from "@/app/auth/actions";

export const metadata = { title: "Your account — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const firstName = (user.name || "").split(" ")[0] || "there";
  const initials = (user.name || user.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="auth">
      <div className="auth__glow" aria-hidden="true" />
      <div className="auth__card">
        <Link href="/" className="auth__brand" aria-label="ReelGuide home">
          <LogoMark />
          <span className="logo__text">Reel<span>Guide</span></span>
        </Link>
        <div className="account__avatar" aria-hidden="true">{initials}</div>
        <h1>Hi, {firstName}!</h1>
        <p className="muted">You&apos;re signed in to ReelGuide.</p>

        <dl className="account__details">
          <div><dt>Name</dt><dd>{user.name || "—"}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
        </dl>

        <p className="auth__notice">
          Your watchlist, recommendations and release alerts will live here as ReelGuide is built out.
        </p>

        <div className="account__actions">
          <Link href="/" className="btn btn--ghost">Back to home</Link>
          <form action={signOut}>
            <button type="submit" className="btn btn--primary">Sign out</button>
          </form>
        </div>
      </div>
    </main>
  );
}
