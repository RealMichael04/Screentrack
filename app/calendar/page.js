import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import CalendarClient from "@/components/calendar/CalendarClient";
import { getCurrentUser } from "@/lib/auth/server";

export const metadata = { title: "Calendar — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <>
      <AppHeader />
      <main className="container app-page">
        <div className="section-header">
          <h1 className="app-page__title">Your calendar</h1>
          <p className="muted">Premieres, finales and releases for what you follow, plus your viewing plans.</p>
        </div>
        <CalendarClient />
        <p className="muted small app-page__credit">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>
    </>
  );
}
