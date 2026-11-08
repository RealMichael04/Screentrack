import { fail, withUser } from "@/lib/apiHandler";
import { getShowSeasons, searchCatalog } from "@/lib/schedules";

// ?q=star+wars searches franchises and shows. ?tvId=1396 lists a show's seasons.
export const GET = withUser(async (request) => {
  const { searchParams } = new URL(request.url);

  const tvId = Number(searchParams.get("tvId"));
  if (Number.isInteger(tvId) && tvId > 0) return Response.json(await getShowSeasons(tvId));

  const query = (searchParams.get("q") ?? "").trim().slice(0, 100);
  if (query.length < 2) return fail("Type at least two letters.", 400);
  return Response.json(await searchCatalog(query));
});
