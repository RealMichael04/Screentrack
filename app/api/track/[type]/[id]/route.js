import { fail, withUser } from "@/lib/apiHandler";
import { getTitle, removeTitle, updateTitle } from "@/lib/tracker";

const NOT_FOUND = "That title isn't in your library.";

export const GET = withUser(async (_request, user, context) => {
  const { type, id } = await context.params;
  const title = await getTitle(user.id, type, id);
  return title ? Response.json(title) : fail(NOT_FOUND, 404);
});

export const PATCH = withUser(async (request, user, context) => {
  const { type, id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return fail("That didn't look right. Please try again.", 400);
  return Response.json(await updateTitle(user.id, type, id, body));
});

export const DELETE = withUser(async (_request, user, context) => {
  const { type, id } = await context.params;
  return (await removeTitle(user.id, type, id)) ? new Response(null, { status: 204 }) : fail(NOT_FOUND, 404);
});
