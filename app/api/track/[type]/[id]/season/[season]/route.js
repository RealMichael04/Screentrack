import { withUser } from "@/lib/apiHandler";
import { getSeasonProgress } from "@/lib/tracker";

export const GET = withUser(async (_request, user, context) => {
  const { type, id, season } = await context.params;
  return Response.json(await getSeasonProgress(user.id, type, id, season));
});
