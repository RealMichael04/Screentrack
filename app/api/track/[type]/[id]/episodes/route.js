import { fail, withUser } from "@/lib/apiHandler";
import { setEpisodesWatched } from "@/lib/tracker";

export const PATCH = withUser(async (request, user, context) => {
  const { type, id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return fail("That didn't look right. Please try again.", 400);
  return Response.json(await setEpisodesWatched(user.id, type, id, body));
});
