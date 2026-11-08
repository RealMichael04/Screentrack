import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TitleDetail from "@/components/track/TitleDetail";
import { getCurrentUser } from "@/lib/auth/server";
import { ApiError } from "@/lib/apiError";
import { getTitle } from "@/lib/tracker";

export const metadata = { title: "Title — ReelGuide" };
export const dynamic = "force-dynamic";

export default async function TitlePage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const { type, id } = await params;
  const title = await getTitle(user.id, type, id).catch((error) => {
    if (error instanceof ApiError) return null;
    throw error;
  });
  if (!title) notFound();

  return (
    <>
      <AppHeader />
      <main className="container app-page">
        <TitleDetail initialTitle={title} />
        <p className="muted small app-page__credit">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>
    </>
  );
}
