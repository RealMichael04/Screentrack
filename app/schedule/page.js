import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ScheduleBuilder from "@/components/schedule/ScheduleBuilder";
import { getCurrentUser } from "@/lib/auth/server";
import { listSchedules } from "@/lib/schedules";

export const metadata = { title: "Schedules — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const schedules = await listSchedules(user.id);

  return (
    <>
      <AppHeader />
      <main className="container app-page">
        <div className="section-header">
          <h1 className="app-page__title">Plan your next binge</h1>
          <p className="muted">
            Pick a franchise or show, tell us when you can watch, and get a day-by-day plan built on real runtimes.
          </p>
        </div>
        <ScheduleBuilder schedules={schedules} />
        <p className="muted small app-page__credit">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>
    </>
  );
}
