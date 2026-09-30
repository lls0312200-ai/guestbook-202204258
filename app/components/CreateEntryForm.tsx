"use client";

import { useActionState } from "react";
import { createEntryAction, type ActionState } from "../actions";
import { LIMITS } from "../../lib/validation.mjs";

const initialActionState: ActionState = { status: "idle" };

export function CreateEntryForm() {
  const [state, formAction, pending] = useActionState(createEntryAction, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-800">글 남기기</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="authorName" className="text-sm text-slate-600">
          이름
        </label>
        <input
          id="authorName"
          name="authorName"
          required
          maxLength={LIMITS.authorName.max}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm text-slate-600">
          메시지
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          maxLength={LIMITS.message.max}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-slate-600">
          비밀번호 (수정·삭제 시 필요합니다)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          maxLength={LIMITS.password.max}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "등록 중..." : "등록"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
