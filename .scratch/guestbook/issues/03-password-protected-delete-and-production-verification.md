# 03: Password-protected delete, live deployment, and production verification

**What to build:** The author of an entry can remove it entirely by re-entering their password, with the same wrong-password handling as edit. The app is then deployed to the already-linked `guestbook-202204258` Vercel project via the authenticated Vercel CLI (this repo has no Vercel Git integration configured, so a CLI deploy is what produces the live URL — that alone satisfies the exam's deployment requirement), and the full create/read/edit/delete + wrong-password behavior is manually verified against that live URL before submission.

**Blocked by:** 02 (needs the entries service module, hashing/verification flow, and edit UI pattern already in place)

**Status:** ready-for-agent

- [x] The entries service module gains `deleteEntry(id, password)`, using the same read-verify-then-act flow as `editEntry` (read `password_hash` by id, verify in server code, `DELETE ... WHERE id = $1` only on a match, rechecking affected-row-count), hard-deleting the row — no soft-delete flag.
- [x] Delete is a Server Action wired to an inline per-entry delete control (password field) that calls `revalidatePath('/')` on success.
- [x] A wrong password (or an already-deleted row) produces the same generic "wrong password" rejection used by edit; the entry remains listed.
- [x] A correct password removes the entry; it no longer appears in the list.
- [x] The single end-to-end test is extended one final time to cover: deleting with a wrong password (rejected, entry still listed) and deleting with the correct password (entry gone).
- [x] `DATABASE_URL` is set as a Production Secret on the linked Vercel project (never committed to git, never echoed in any server response).
- [x] The app is deployed with `vercel deploy --prod --yes --scope leeeeee1` to https://guestbook-202204258.vercel.app.
- [x] Manual verification against that live URL: create an entry, see it listed after refresh, edit it (wrong password rejected, then correct password accepted), delete it (wrong password rejected, then correct password accepted). The test entry was removed.
- [x] The GitHub repository is confirmed public and named `guestbook-202204258` (matching `origin`).

## Comments

- Local lint, typecheck, build, `db:check`, and `test:lifecycle` passed. A browser test caught and fixed an invalid non-function export from a `"use server"` file; local and live UI CRUD then passed. The final code review's one naming finding was fixed. GitHub push and production deployment completed on 2026-09-30 KST.
