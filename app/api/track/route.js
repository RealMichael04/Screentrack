import { fail, withUser } from "@/lib/apiHandler";
import { addTitle, getHistory, getLibrary } from "@/lib/tracker";

export const GET = withUser(async (_request, user) => {
  const [library, history] = await Promise.all([getLibrary(user.id), getHistory(user.id)]);
  return Response.json({ library, history });
});

export const POST = withUser(async (request, user) => {
  const body = await request.json().catch(() => null);
  if (!body) return fail("That didn't look right. Please try again.", 400);
  return Response.json(await addTitle(user.id, body), { status: 201 });
});
