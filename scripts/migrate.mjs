// Creates ReelGuide's database tables. Run with: npm run db:migrate
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

const statements = schema
  .replace(/^--.*$/gm, "")
  .split(/;\s*$/m)
  .map((statement) => statement.trim())
  .filter(Boolean);

try {
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Done. Ran ${statements.length} statements.`);
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exit(1);
}
