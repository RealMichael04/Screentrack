import "server-only";
import { neon } from "@neondatabase/serverless";

let client = null;

/**
 * Returns the database client. Use it as a tagged template, which sends values
 * separately from the query so they can't be run as SQL:
 *
 *   const sql = getDb();
 *   const rows = await sql`select * from schedules where user_id = ${userId}`;
 */
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!client) {
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}
