import { neon } from "@neondatabase/serverless";

let sql;

// Lazy so importing this module never throws at build/bundle time -
// only a request that actually touches the database needs DATABASE_URL.
export function getSql() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    sql = neon(connectionString);
  }
  return sql;
}
