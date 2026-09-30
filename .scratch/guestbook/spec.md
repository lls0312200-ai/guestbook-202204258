# Guestbook (미니 방명록)

Status: ready-for-agent

## Problem Statement

A visitor wants to leave a short public note — name, message — without creating an account, and wants to be able to fix or remove their own note later using only the password they set when writing it. Anyone else reading the guestbook should see every note in the order it was originally written. Separately, the exam grader needs a live, publicly reachable instance to verify the full create/read/update/delete lifecycle, plus a public source repository, before the submission counts.

## Solution

A single-page Next.js App Router app, backed by Neon Postgres, where:

- Anyone can create an **Entry** (author name, message, password) with no signup or login.
- Anyone can view the full list of entries — name, message, posting time — newest-first by original posting time.
- The author of an entry can edit its message, gated on re-entering the original password.
- The author of an entry can delete it, gated on re-entering the original password.
- A wrong password on edit or delete is rejected with an explicit, generic on-screen message ("비밀번호가 일치하지 않습니다" / wrong password), whether the real cause was a bad guess or the entry no longer existing.
- The developer's name (이이삭) and student id (202204258) are always visible on the page.
- The app is deployed to a public Vercel project reachable at a live URL, with the GitHub repo, Vercel project, and Neon project all named `guestbook-202204258`, and the full CRUD + wrong-password flow is manually verified against that live URL before submission.

## User Stories

1. As a visitor, I want to create a guestbook entry with my name, a message, and a password, so that I can leave a note without registering an account.
2. As a visitor, I want to see every entry's name, message, and posting time in one list ordered newest-first, so that I can read the guestbook's history at a glance.
3. As a visitor who wrote an entry, I want to edit just my message by re-entering my original password, so that I can fix a mistake without needing a login.
4. As a visitor who wrote an entry, I want to delete it by re-entering my original password, so that I can remove something I no longer want public.
5. As a visitor, I want to be told clearly that my password was wrong when an edit or delete fails, so that I understand why nothing happened and can retry.
6. As a visitor, when I successfully edit an entry, I want its position in the list to stay exactly where it was, so that the list still reflects when things were originally written, not when they were last touched.
7. As a visitor, I want the form to reject an empty name, empty message, or empty password before it round-trips to the server, so that I get fast feedback on obvious mistakes.
8. As a visitor, I want to be blocked from submitting an extremely long name, message, or password, so that the guestbook stays predictable rather than silently truncating or erroring.
9. As a visitor, I want the posting time shown in a readable local time, so that I know roughly when something was written.
10. As a grader, I want to see the developer's name (이이삭) and student id (202204258) displayed on the page, so that I can attribute the submission.
11. As a grader, I want the GitHub repository to be public and named `guestbook-202204258`, so that I can review the source without requesting access.
12. As a grader, I want a live Vercel deployment URL, so that I can exercise create, read, edit, delete, and the wrong-password rejection against the running app, not just the source.
13. As a grader, I want the Vercel project and Neon project to both be named `guestbook-202204258`, so that the submission is unambiguous.
14. As a developer, I want passwords never stored or returned in plaintext anywhere (database rows, server responses, logs), so that a leak of any of those doesn't expose visitors' passwords.
15. As a developer, I want every SQL statement parameterized, so that entry content can never be used for SQL injection.
16. As a developer, I want no login, session, or admin surface anywhere in the app, so that the implementation matches the brief's deliberately minimal scope.
17. As a developer, I want a single "entries" module that every create/list/edit/delete path funnels through, so that there is one seam to verify the whole feature end-to-end.
18. As a developer, I want the database connection string kept out of the git history and out of any response body, so that credentials never leak through the submission.

## Implementation Decisions

- **Schema**: an `entries` table — `id BIGSERIAL PRIMARY KEY`, `author_name text`, `message text`, `password_hash text` (a single `salt:hash` hex string), `created_at timestamptz default now()`, `updated_at timestamptz default now()`. Matches the glossary term **Entry**; `password_hash`/`updated_at` are internal, never rendered.
- **Persistence**: raw parameterized SQL via `@neondatabase/serverless`, no ORM (per ADR-0004 and the brief).
- **Password hashing**: `node:crypto` `scrypt` with a random salt per entry (ADR-0001). Requires the Node.js server runtime, not Edge.
- **Verification flow** (per corrected ADR-0003): read the row by id (`SELECT password_hash ... WHERE id = $1`), verify the supplied password against the stored hash in server code (timing-safe comparison), then act (`UPDATE`/`DELETE ... WHERE id = $1`) only on a match, rechecking the affected-row-count to catch a concurrent delete between the read and the write. Every failure branch — no such id, hash mismatch, or vanished during the write — surfaces the same generic, explicit "wrong password" rejection to the visitor; the app never reveals which case occurred.
- **Ordering**: newest-first by `created_at`; edits never change `created_at` or list position (ADR-0002).
- **Input limits**: author name 1–30 chars, message 1–500 chars, password 1–64 chars; all trimmed server-side (and client-side for fast feedback); empty/whitespace-only values rejected on both sides.
- **Rendering/mutation architecture** (ADR-0004): the list page sets `export const dynamic = 'force-dynamic'` (Cache Components is off in `next.config.ts`, so this must be explicit). Create/edit/delete are Server Actions, not Route Handlers and not client-side `fetch`, each calling `revalidatePath('/')` on success.
- **Seam / module boundary**: one server-side entries module exposing `createEntry`, `listEntries`, `editEntry`, `deleteEntry`. Server Actions are thin wrappers around these; nothing else touches the database directly.
- **UI**: one page. A create form (name, message, password). Each listed entry has its own inline edit/delete controls, each requiring the password field at the point of action. A single generic error string is shown inline on a failed edit/delete. Developer name and student id are shown as static text (header or footer) on the same page.
- **Timestamps**: stored as `timestamptz` (UTC), rendered to the visitor in Asia/Seoul time.
- **Deployment naming**: GitHub repository public and named `guestbook-202204258`; Vercel project named `guestbook-202204258` (already linked locally via the Vercel CLI) with `DATABASE_URL` set as a Vercel environment variable (never committed, never echoed in any response); Neon project named `guestbook-202204258`. No Vercel Git integration is configured, so deploys are triggered manually via the authenticated Vercel CLI (`vercel deploy --prod` against the linked project), not by pushing to GitHub.
- **Production check**: after deploying, manually exercise, against the live Vercel URL: create an entry; confirm it appears in the list; edit with a wrong password and confirm rejection; edit with the correct password and confirm the message changes but list position/posting time don't; delete with a wrong password and confirm rejection; delete with the correct password and confirm removal. This manual pass is a submission gate, not optional polish.

## Testing Decisions

- **Single seam**: the entries module (`createEntry` / `listEntries` / `editEntry` / `deleteEntry`) is the one place tests attach to. Server Actions and any future caller go through it, so one seam covers the whole feature.
- **One end-to-end test** exercises the full lifecycle against a real Postgres connection (the dev/test Neon database): create an entry → list it and check its fields (name, message, posting time) → edit with a wrong password and confirm rejection and that the message is unchanged → edit with the correct password and confirm the message changed while posting time/list position did not → delete with a wrong password and confirm rejection and that the entry still lists → delete with the correct password and confirm it's gone from the list.
- **What makes it a good test**: assertions are on externally observable behavior only — what `listEntries` returns, and what `editEntry`/`deleteEntry` report back — never on internal SQL calls, the hash format, or other implementation details.
- **Prior art**: none yet in this freshly scaffolded repo; this is the first test seam established for the project.
- **Explicitly not covered by automated tests**: UI rendering/browser interaction, the live Vercel deployment (verified manually per the production check above), and the cryptographic strength of the hashing algorithm itself.

## Out of Scope

- Login, sessions, accounts, or any admin/moderation surface.
- An ORM or query builder.
- Pagination, search, or filtering of the entry list.
- Rate limiting or abuse/spam prevention.
- Editing the author name (only the message is editable).
- Soft delete, undo, or any recovery of a deleted entry.
- Email, notifications, or any integration beyond the guestbook itself.
- Automated CI/CD pipeline. This repo has no Vercel Git integration configured, so pushes do not auto-deploy; deployment is a manual `vercel deploy --prod` (or equivalent) from the authenticated Vercel CLI against the already-linked `guestbook-202204258` project. That CLI deploy is what produces the live URL the exam requires — it satisfies the deployment requirement on its own, without adding Git integration. The production check itself remains a manual pass against that URL.
- Localization beyond Korean UI copy and Asia/Seoul timestamp display.

## Further Notes

- This spec follows `docs/exam-brief.md`, `GLOSSARY.md`, and `docs/adr/0001`–`0004`. Tickets derived from this spec should keep the glossary's vocabulary (**Entry**, **author name**, **message**, **entry password**, **verification**, **posting time**) rather than drifting to synonyms like "post" or "comment."
- ADR-0003 was corrected as part of producing this spec: salted-scrypt verification cannot happen inside a single conditional `UPDATE`/`DELETE` statement, since the hash comparison must run in server code after reading the stored hash back. The user-visible behavior is unchanged — one generic rejection, explicitly naming "wrong password" as the reason, covering every failure branch.
- This is a timed exam (14:40–16:30 KST); the next steps are `/to-tickets` and `/implement`, in that order, with `/code-review` after. Choices in this spec were made narrowly from the brief without further user check-ins, per the exam constraint.
