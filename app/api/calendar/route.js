import { withUser } from "@/lib/apiHandler";
import { getMonthEvents } from "@/lib/calendarEvents";

export const maxDuration = 60;

export const GET = withUser(async (request, user) => {
  const month = new URL(request.url).searchParams.get("month");
  return Response.json(await getMonthEvents(user.id, month));
});
