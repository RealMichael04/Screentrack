import { fail, withUser } from "@/lib/apiHandler";
import { requirePremium } from "@/lib/billing";
import { consumeDailyAllowance } from "@/lib/rateLimit";
import { createSchedule, listSchedules } from "@/lib/schedules";

export const maxDuration = 60;

const DAILY_NEW_SCHEDULES = 15;

export const GET = withUser(async (_request, user) => Response.json({ schedules: await listSchedules(user.id) }));

export const POST = withUser(async (request, user) => {
  const body = await request.json().catch(() => null);
  if (!body) return fail("That didn't look right. Please try again.", 400);

  await requirePremium(user.id);

  const allowed = await consumeDailyAllowance(user.id, "schedule", DAILY_NEW_SCHEDULES);
  if (!allowed) return fail(`You've built ${DAILY_NEW_SCHEDULES} schedules today. Come back tomorrow!`, 429);

  return Response.json(await createSchedule(user.id, body), { status: 201 });
});
