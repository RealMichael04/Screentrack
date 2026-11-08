import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import RecommendClient from "@/components/recommend/RecommendClient";
import { getCurrentUser } from "@/lib/auth/server";
import { getPreferences } from "@/lib/preferences";

export const metadata = { title: "Recommendations — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function RecommendPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const preferences = await getPreferences(user.id);

  return (
    <>
      <AppHeader />
      <main className="container app-page">
        <div className="section-header">
          <h1 className="app-page__title">What do you feel like watching?</h1>
          <p className="muted">
            Describe it in your own words. Your taste profile fills in the rest, and every title, runtime and
            date comes from real movie data.
          </p>
        </div>
        <RecommendClient initialPreferences={preferences} />
        <p className="muted small app-page__credit">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>
    </>
  );
}
