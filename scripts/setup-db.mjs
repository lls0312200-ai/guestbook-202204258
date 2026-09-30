import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("NOT READY: set DATABASE_URL in .env.local, then run npm run db:setup.");
  process.exitCode = 1;
} else {
  try {
    const sql = neon(connectionString);
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id BIGSERIAL PRIMARY KEY,
        author_name text NOT NULL,
        message text NOT NULL,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries (created_at DESC)
    `;
    console.log("PASS: entries table is ready (created if missing, left as-is if present).");
  } catch {
    console.error("FAIL: could not set up the entries table. Check the Neon connection string. Credentials are not printed.");
    process.exitCode = 1;
  }
}
