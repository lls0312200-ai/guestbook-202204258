# 01: Create an entry and read the full list

**What to build:** A visitor can open the page, submit their name, a message, and a password with no signup, and see it appear in a newest-first list showing every entry's name, message, and posting time. The developer's name and student id are visible on the same page. This ticket lays the foundation (schema + entries service module) that tickets 02 and 03 build on.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] An `entries` table exists in Neon Postgres with `id BIGSERIAL PRIMARY KEY`, `author_name text`, `message text`, `password_hash text`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`.
- [x] An entries service module exposes `createEntry` and `listEntries`; every query is parameterized (no string-concatenated SQL).
- [x] `createEntry` hashes the supplied password with `node:crypto` `scrypt` and a random per-entry salt (stored as a single `salt:hash` string) before persisting; the raw password is never stored or returned by any function or response.
- [x] The create path validates, trimmed, both client- and server-side: author name 1–30 chars, message 1–500 chars, password 1–64 chars; empty, whitespace-only, or over-length input is rejected with a clear message and nothing is written.
- [x] Creation is a Server Action that calls `revalidatePath('/')` on success — no client-side `fetch`, no separate Route Handler for the mutation.
- [x] The list page renders every entry's author name, message, and posting time (converted to Asia/Seoul for display) ordered newest-first by `created_at`, and sets `export const dynamic = 'force-dynamic'` so a new entry is always visible on next load.
- [x] The developer's name (이이삭) and student id (202204258) are visible as static text on the page.
- [x] A single end-to-end test — the one seam for this whole feature — calls `createEntry` and then asserts `listEntries` returns the new entry with the correct author name, message, and newest-first position. This test file is the one that tickets 02 and 03 extend; it is not rewritten per ticket.
