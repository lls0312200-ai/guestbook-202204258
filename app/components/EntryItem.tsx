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
    <li className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <strong className="text-slate-800">{entry.authorName}</strong>
        <time className="text-xs text-slate-500">{entry.createdAtLabel}</time>
      </div>

      {mode === "view" ? (
        <p className="whitespace-pre-wrap text-slate-700">{entry.message}</p>
      ) : (
        <form action={editFormAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={entry.id} />
          <textarea
            name="message"
            aria-label="수정할 메시지"
            defaultValue={entry.message}
            required
            rows={3}
            maxLength={LIMITS.message.max}
            className="rounded border border-slate-300 px-3 py-2"
          />
          <input
            name="password"
            aria-label="수정 비밀번호"
            type="password"
            placeholder="비밀번호"
            required
            maxLength={LIMITS.password.max}
            className="rounded border border-slate-300 px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={editPending}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {editPending ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              취소
            </button>
          </div>
          {editState.status === "error" && (
            <p role="alert" className="text-sm text-red-600">
              {editState.message}
            </p>
          )}
        </form>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
        {mode === "view" && (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          >
            수정
          </button>
        )}
        <form action={deleteFormAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={entry.id} />
          <input
            name="password"
            aria-label="삭제 비밀번호"
            type="password"
            placeholder="비밀번호"
            required
            maxLength={LIMITS.password.max}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={deletePending}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
          >
            {deletePending ? "삭제 중..." : "삭제"}
          </button>
        </form>
      </div>
      {deleteState.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {deleteState.message}
        </p>
      )}
    </li>
  );
}
