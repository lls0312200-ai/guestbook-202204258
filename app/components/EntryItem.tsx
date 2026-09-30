"use client";

import { useActionState, useState } from "react";
import { deleteEntryAction, editEntryAction, type ActionState } from "../actions";
import { LIMITS } from "../../lib/validation.mjs";

const initialActionState: ActionState = { status: "idle" };

export type EntryView = {
  id: string;
  authorName: string;
  message: string;
  createdAtLabel: string;
};

export function EntryItem({ entry }: { entry: EntryView }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editState, editFormAction, editPending] = useActionState(editEntryAction, initialActionState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteEntryAction, initialActionState);

  // Adjust state during render rather than in an effect (React docs: "Adjusting
  // state based on a prop or state change") - close the edit form the moment a
  // save succeeds, without an extra post-commit render.
  const [lastEditStatus, setLastEditStatus] = useState(editState.status);
  if (editState.status !== lastEditStatus) {
    setLastEditStatus(editState.status);
    if (editState.status === "success" && mode !== "view") {
      setMode("view");
    }
  }

  return (
    <li className="entry-card">
      <div className="entry-meta">
        <strong>{entry.authorName}</strong>
        <time>{entry.createdAtLabel}</time>
      </div>

      {mode === "view" ? (
        <p className="entry-message">{entry.message}</p>
      ) : (
        <form action={editFormAction} className="entry-edit-form">
          <input type="hidden" name="id" value={entry.id} />
          <textarea
            name="message"
            aria-label="수정할 메시지"
            defaultValue={entry.message}
            required
            rows={3}
            maxLength={LIMITS.message.max}
          />
          <input
            name="password"
            aria-label="수정 비밀번호"
            type="password"
            placeholder="비밀번호"
            required
            maxLength={LIMITS.password.max}
          />
          <div className="entry-actions">
            <button
              type="submit"
              disabled={editPending}
              className="small-button solid"
            >
              {editPending ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="small-button"
            >
              취소
            </button>
          </div>
          {editState.status === "error" && (
            <p role="alert" className="form-error">
              {editState.message}
            </p>
          )}
        </form>
      )}

      <div className="entry-actions entry-footer">
        {mode === "view" && (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="small-button"
          >
            수정
          </button>
        )}
        <form action={deleteFormAction} className="delete-form">
          <input type="hidden" name="id" value={entry.id} />
          <input
            name="password"
            aria-label="삭제 비밀번호"
            type="password"
            placeholder="비밀번호"
            required
            maxLength={LIMITS.password.max}
          />
          <button
            type="submit"
            disabled={deletePending}
            className="small-button delete-button"
          >
            {deletePending ? "삭제 중..." : "삭제"}
          </button>
        </form>
      </div>
      {deleteState.status === "error" && (
        <p role="alert" className="form-error">
          {deleteState.message}
        </p>
      )}
    </li>
  );
}
