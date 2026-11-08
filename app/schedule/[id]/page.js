import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ScheduleDetail from "@/components/schedule/ScheduleDetail";
import { getCurrentUser } from "@/lib/auth/server";
import { getOffer, getPlan } from "@/lib/billing";
import { getSchedule } from "@/lib/schedules";

export const metadata = { title: "Your schedule — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function ScheduleDetailPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const { id } = await params;
  const schedule = await getSchedule(user.id, id);
  if (!schedule) notFound();

  const plan = await getPlan(user.id);
  const offer = plan.isPremium ? null : await getOffer();

  return (
    <>
      <AppHeader />
      <main className="container app-page">
        <ScheduleDetail initialSchedule={schedule} isPremium={plan.isPremium} offer={offer} />
        <p className="muted small app-page__credit">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>
    </>
  );
}
