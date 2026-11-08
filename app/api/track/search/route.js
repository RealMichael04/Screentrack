import { fail, withUser } from "@/lib/apiHandler";
import { searchTitles } from "@/lib/tracker";

export const GET = withUser(async (request) => {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (query.length < 2) return fail("Type at least two letters.", 400);
  return Response.json(await searchTitles(query));
});
