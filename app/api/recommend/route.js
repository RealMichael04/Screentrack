import { getCurrentUser } from "@/lib/auth/server";
import { getPreferences } from "@/lib/preferences";
import { consumeDailyAllowance } from "@/lib/rateLimit";
import { getRecommendations } from "@/lib/recommend";
import { getViewingHistory } from "@/lib/schedules";

export const maxDuration = 60;

const MAX_QUERY_LENGTH = 300;
const DAILY_SEARCHES = 25;

const fail = (message, status) => Response.json({ error: message }, { status });

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in to get recommendations.", 401);

  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (query.length < 3) return fail("Tell us a little more about what you'd like to watch.", 400);
  if (query.length > MAX_QUERY_LENGTH) return fail(`Please keep your search under ${MAX_QUERY_LENGTH} characters.`, 400);

  try {
    const allowed = await consumeDailyAllowance(user.id, "recommend", DAILY_SEARCHES);
    if (!allowed) return fail(`You've used all ${DAILY_SEARCHES} searches for today. Come back tomorrow!`, 429);

    const [preferences, history] = await Promise.all([getPreferences(user.id), getViewingHistory(user.id)]);
    return Response.json(await getRecommendations(query, preferences, history));
  } catch (error) {
    console.error("Recommendation failed:", error.message);
    return fail("We couldn't get recommendations just now. Please try again.", 502);
  }
}
