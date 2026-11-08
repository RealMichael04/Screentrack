import { getCurrentUser } from "@/lib/auth/server";
import { savePreferences } from "@/lib/preferences";

const fail = (message, status) => Response.json({ error: message }, { status });

export async function PUT(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in to save your taste profile.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return fail("That didn't look right. Please try again.", 400);

  try {
    return Response.json(await savePreferences(user.id, body));
  } catch (error) {
    console.error("Saving preferences failed:", error.message);
    return fail("We couldn't save that just now. Please try again.", 502);
  }
}
