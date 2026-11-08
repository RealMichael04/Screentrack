import "server-only";
import { getDb } from "./db.js";

/**
 * Uses one of a person's daily AI requests.
 * Returns false once they've reached `limit`. Done in a single database step,
 * so several requests sent at once can't slip past the limit.
 */
export async function consumeDailyAllowance(userId, kind, limit) {
  const sql = getDb();
  const rows = await sql`
    insert into ai_usage (user_id, kind, count)
    values (${userId}, ${kind}, 1)
    on conflict (user_id, day, kind) do update set count = ai_usage.count + 1
    where ai_usage.count < ${limit}
    returning count
  `;
  return rows.length > 0;
}
