import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TrackerClient from "@/components/track/TrackerClient";
import { getCurrentUser } from "@/lib/auth/server";
import { getHistory, getLibrary } from "@/lib/tracker";

export const metadata = { title: "Tracker — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function TrackPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const [library, history] = await Promise.all([getLibrary(user.id), getHistory(user.id)]);

  return (
    <>
      <AppHeader />
      <main className="container app-page">
        <div className="section-header">
          <h1 className="app-page__title">Your tracker</h1>
          <p className="muted">Everything you've watched, are watching, and want to watch next.</p>
        </div>
        <TrackerClient initialLibrary={library} initialHistory={history} />
        <p className="muted small app-page__credit">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>
    </>
  );
}
