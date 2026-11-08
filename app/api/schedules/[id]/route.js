import { fail, withUser } from "@/lib/apiHandler";
import { deleteSchedule, getSchedule } from "@/lib/schedules";

const NOT_FOUND = "We couldn't find that schedule.";

export const GET = withUser(async (_request, user, context) => {
  const { id } = await context.params;
  const schedule = await getSchedule(user.id, id);
  return schedule ? Response.json(schedule) : fail(NOT_FOUND, 404);
});

export const DELETE = withUser(async (_request, user, context) => {
  const { id } = await context.params;
  return (await deleteSchedule(user.id, id)) ? new Response(null, { status: 204 }) : fail(NOT_FOUND, 404);
});
