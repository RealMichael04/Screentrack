import { fail, withUser } from "@/lib/apiHandler";
import { setItemWatched } from "@/lib/schedules";

export const PATCH = withUser(async (request, user, context) => {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (typeof body?.itemId !== "string" || typeof body?.watched !== "boolean") {
    return fail("That didn't look right. Please try again.", 400);
  }
  const updated = await setItemWatched(user.id, id, body.itemId, body.watched);
  return updated ? Response.json({ ok: true }) : fail("We couldn't find that item.", 404);
});
