import { fail, withUser } from "@/lib/apiHandler";
import { consumeDailyAllowance } from "@/lib/rateLimit";
import { adjustSchedule } from "@/lib/schedules";

export const maxDuration = 60;

const DAILY_ADJUSTMENTS = 30;
const MAX_REQUEST_LENGTH = 300;

export const POST = withUser(async (request, user, context) => {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const text = typeof body?.request === "string" ? body.request.trim() : "";
  if (text.length < 3) return fail("Tell us what you'd like to change.", 400);
  if (text.length > MAX_REQUEST_LENGTH) return fail(`Please keep that under ${MAX_REQUEST_LENGTH} characters.`, 400);

  const allowed = await consumeDailyAllowance(user.id, "adjust", DAILY_ADJUSTMENTS);
  if (!allowed) return fail(`You've made ${DAILY_ADJUSTMENTS} changes today. Come back tomorrow!`, 429);

  return Response.json(await adjustSchedule(user.id, id, { request: text, today: body.today }));
});
