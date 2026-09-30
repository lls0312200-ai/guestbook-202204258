# 02: Password-protected edit

**What to build:** The author of an entry can change just its message by re-entering the password they set when creating it. A wrong password (or an entry that no longer exists) is rejected with one explicit, generic "wrong password" message, and the message is left untouched. A successful edit never moves the entry's position in the newest-first list or changes its posting time.

**Blocked by:** 01 (needs the entries table, the entries service module, and the list UI)

**Status:** ready-for-agent

- [x] The entries service module gains `editEntry(id, password, newMessage)`, implementing the corrected ADR-0003 flow: read the stored `password_hash` by id, verify the supplied password against it in server code (timing-safe comparison), then run `UPDATE ... SET message = ..., updated_at = now() WHERE id = $1` only on a match, rechecking the affected-row-count to catch a concurrent delete between the read and the write.
- [x] Every failure branch — no such id, password mismatch, or the row vanishing between read and write — produces the exact same generic rejection, explicitly stating the password was wrong. The app never reveals which case occurred.
- [x] Edit is a Server Action wired to an inline per-entry edit control (message field + password field) that calls `revalidatePath('/')` on success; the rejection message is shown inline on failure.
- [x] A successful edit changes only `message`; `created_at` and the entry's position in the newest-first list are unchanged (`updated_at` may change internally but is never rendered).
- [x] The edited message is validated against the same 1–500 char, trimmed, non-empty rule used at creation.
- [x] The single end-to-end test from ticket 01 is extended (not replaced) to cover: editing with a wrong password (rejected, message unchanged) and editing with the correct password (message changed, `created_at`/list order unchanged).
