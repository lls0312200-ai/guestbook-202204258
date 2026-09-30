# 03: Password-protected delete, live deployment, and production verification

**What to build:** The author of an entry can remove it entirely by re-entering their password, with the same wrong-password handling as edit. The app is then deployed to the already-linked `guestbook-202204258` Vercel project via the authenticated Vercel CLI (this repo has no Vercel Git integration configured, so a CLI deploy is what produces the live URL — that alone satisfies the exam's deployment requirement), and the full create/read/edit/delete + wrong-password behavior is manually verified against that live URL before submission.

**Blocked by:** 02 (needs the entries service module, hashing/verification flow, and edit UI pattern already in place)

**Status:** ready-for-agent

- [x] The entries service module gains `deleteEntry(id, password)`, using the same read-verify-then-act flow as `editEntry` (read `password_hash` by id, verify in server code, `DELETE ... WHERE id = $1` only on a match, rechecking affected-row-count), hard-deleting the row — no soft-delete flag.
- [x] Delete is a Server Action wired to an inline per-entry delete control (password field) that calls `revalidatePath('/')` on success.
- [x] A wrong password (or an already-deleted row) produces the same generic "wrong password" rejection used by edit; the entry remains listed.
- [x] A correct password removes the entry; it no longer appears in the list.
- [x] The single end-to-end test is extended one final time to cover: deleting with a wrong password (rejected, entry still listed) and deleting with the correct password (entry gone).
- [ ] `DATABASE_URL` is set as an environment variable on the linked Vercel project (never committed to git, never echoed in any server response).
- [ ] The app is deployed with `vercel deploy --prod` (or equivalent) using the authenticated Vercel CLI against the project already linked in `.vercel/project.json`, producing a live URL.
- [ ] Manual verification against that live URL: create an entry, see it listed, edit it (wrong password rejected, then correct password accepted), delete it (wrong password rejected, then correct password accepted) — all behave as specified.
- [ ] The GitHub repository is confirmed public and named `guestbook-202204258` (matching the already-configured `origin` remote).

## Comments

- All code-level criteria above are implemented and pass locally (lint, typecheck, build, `db:check`, `test:lifecycle`). The last four checkboxes (Vercel env var, CLI deploy, live-URL manual verification, public-repo confirmation) are intentionally left unchecked: implementation stopped here per instruction, pending `/code-review` and the user's own external production verification and GitHub push/Vercel deploy.
