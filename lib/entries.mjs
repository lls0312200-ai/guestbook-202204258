import { getSql } from "./db.mjs";
import { hashPassword, verifyPassword } from "./password.mjs";
import { LIMITS, normalizeInput, withinLimit } from "./validation.mjs";

// Single generic rejection for every edit/delete failure branch (wrong password,
// no such id, or a row that vanished between the read and the write) - see
// docs/adr/0003-generic-rejection-message.md. Deliberately never distinguishes
// "wrong password" from "entry no longer exists".
export const GENERIC_AUTH_ERROR = "비밀번호가 일치하지 않습니다.";

export class ValidationError extends Error {}

function assertValid(value, limit) {
  if (!withinLimit(value, limit)) {
    throw new ValidationError(`${limit.label}은(는) ${limit.min}~${limit.max}자여야 합니다.`);
  }
}

function toEntryId(rawId) {
  const id = typeof rawId === "string" ? Number(rawId) : rawId;
  return Number.isInteger(id) && id > 0 ? id : null;
}

function toPublicEntry(row) {
  return {
    id: String(row.id),
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function createEntry({ authorName, message, password }) {
  const name = normalizeInput(authorName);
  const msg = normalizeInput(message);
  const pw = typeof password === "string" ? password : "";

  assertValid(name, LIMITS.authorName);
  assertValid(msg, LIMITS.message);
  assertValid(pw, LIMITS.password);

  const passwordHash = await hashPassword(pw);
  const sql = getSql();
  const rows = await sql`
    INSERT INTO entries (author_name, message, password_hash)
    VALUES (${name}, ${msg}, ${passwordHash})
    RETURNING id, author_name, message, created_at
  `;
  return toPublicEntry(rows[0]);
}

export async function listEntries() {
  const sql = getSql();
  const rows = await sql`
    SELECT id, author_name, message, created_at
    FROM entries
    ORDER BY created_at DESC, id DESC
  `;
  return rows.map(toPublicEntry);
}

// Verification cannot happen inside a single conditional UPDATE/DELETE: scrypt is a
// one-way KDF, so the stored hash must be read back and compared in application code
// before acting. See docs/adr/0003-generic-rejection-message.md.
async function verifyOwnership(entryId, password) {
  const sql = getSql();
  const rows = await sql`SELECT password_hash FROM entries WHERE id = ${entryId}`;
  if (rows.length === 0) return false;
  return verifyPassword(typeof password === "string" ? password : "", rows[0].password_hash);
}

export async function editEntry({ id, password, message }) {
  const msg = normalizeInput(message);
  assertValid(msg, LIMITS.message);

  const entryId = toEntryId(id);
  if (entryId === null) return { ok: false, error: GENERIC_AUTH_ERROR };

  const verified = await verifyOwnership(entryId, password);
  if (!verified) return { ok: false, error: GENERIC_AUTH_ERROR };

  const sql = getSql();
  const rows = await sql`
    UPDATE entries
    SET message = ${msg}, updated_at = now()
    WHERE id = ${entryId}
    RETURNING id, author_name, message, created_at
  `;
  // Row could vanish between the read above and this write (e.g. a concurrent
  // delete); treat that the same as a failed check rather than a special case.
  if (rows.length === 0) return { ok: false, error: GENERIC_AUTH_ERROR };

  return { ok: true, entry: toPublicEntry(rows[0]) };
}

export async function deleteEntry({ id, password }) {
  const entryId = toEntryId(id);
  if (entryId === null) return { ok: false, error: GENERIC_AUTH_ERROR };

  const verified = await verifyOwnership(entryId, password);
  if (!verified) return { ok: false, error: GENERIC_AUTH_ERROR };

  const sql = getSql();
  const rows = await sql`DELETE FROM entries WHERE id = ${entryId} RETURNING id`;
  if (rows.length === 0) return { ok: false, error: GENERIC_AUTH_ERROR };

  return { ok: true };
}
