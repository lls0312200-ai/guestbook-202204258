import test from "node:test";
import assert from "node:assert/strict";
import { createEntry, listEntries, editEntry, deleteEntry, GENERIC_AUTH_ERROR } from "../lib/entries.mjs";

// Single end-to-end seam for the whole feature (spec.md "Testing Decisions"):
// drives the entries module through create -> list -> wrong/right password edit
// -> wrong/right password delete, against the real database, cleaning up after itself.
test("guestbook entry lifecycle: create, list, wrong/right password edit and delete", async () => {
  const authorName = `테스트-${Date.now()}`;
  const password = "correct-horse-battery-staple";
  const wrongPassword = "incorrect-password";

  const created = await createEntry({ authorName, message: "첫 메시지", password });

  try {
    const afterCreate = await listEntries();
    const foundAfterCreate = afterCreate.find((entry) => entry.id === created.id);
    assert.ok(foundAfterCreate, "created entry should be listed");
    assert.equal(foundAfterCreate.authorName, authorName);
    assert.equal(foundAfterCreate.message, "첫 메시지");
    assert.equal(afterCreate[0].id, created.id, "new entry should sort newest-first");

    const wrongEdit = await editEntry({ id: created.id, password: wrongPassword, message: "해킹 시도" });
    assert.equal(wrongEdit.ok, false);
    assert.equal(wrongEdit.error, GENERIC_AUTH_ERROR);

    const afterWrongEdit = await listEntries();
    assert.equal(
      afterWrongEdit.find((entry) => entry.id === created.id)?.message,
      "첫 메시지",
      "message must not change on a wrong-password edit"
    );

    const rightEdit = await editEntry({ id: created.id, password, message: "수정된 메시지" });
    assert.equal(rightEdit.ok, true);
    assert.equal(rightEdit.entry.message, "수정된 메시지");
    assert.equal(rightEdit.entry.createdAt, created.createdAt, "created_at must be immutable across edits");

    const afterRightEdit = await listEntries();
    assert.equal(afterRightEdit[0].id, created.id, "edited entry must keep its original list position");
    assert.equal(afterRightEdit.find((entry) => entry.id === created.id)?.message, "수정된 메시지");

    const wrongDelete = await deleteEntry({ id: created.id, password: wrongPassword });
    assert.equal(wrongDelete.ok, false);
    assert.equal(wrongDelete.error, GENERIC_AUTH_ERROR);

    const afterWrongDelete = await listEntries();
    assert.ok(
      afterWrongDelete.some((entry) => entry.id === created.id),
      "entry must survive a wrong-password delete attempt"
    );

    const rightDelete = await deleteEntry({ id: created.id, password });
    assert.equal(rightDelete.ok, true);

    const afterRightDelete = await listEntries();
    assert.ok(
      !afterRightDelete.some((entry) => entry.id === created.id),
      "entry must be gone after a correct-password delete"
    );
  } finally {
    // Belt-and-braces cleanup: if an assertion above threw before the real
    // delete-test ran, don't leave the test entry behind. A no-op if it's
    // already gone.
    await deleteEntry({ id: created.id, password }).catch(() => {});
  }
});
