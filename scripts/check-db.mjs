import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("NOT READY: set DATABASE_URL in .env.local, then run npm run db:check.");
  process.exitCode = 1;
} else {
  try {
    const sql = neon(connectionString);
    const rows = await sql`SELECT 1 AS ok`;
    if (rows[0]?.ok !== 1) throw new Error("Unexpected database response");
    console.log("PASS: Neon Postgres connection verified (read-only SELECT 1).");
  } catch {
    console.error("FAIL: check the Neon connection string and network. Credentials are not printed.");
    process.exitCode = 1;
  }
}
