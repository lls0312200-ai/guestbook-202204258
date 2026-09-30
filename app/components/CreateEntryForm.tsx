"use client";

import { useActionState } from "react";
import { createEntryAction, type ActionState } from "../actions";
import { LIMITS } from "../../lib/validation.mjs";

const initialActionState: ActionState = { status: "idle" };

export function CreateEntryForm() {
  const [state, formAction, pending] = useActionState(createEntryAction, initialActionState);

  return (
    <form action={formAction} className="guestbook-form">
      <p className="eyebrow">LEAVE A LITTLE NOTE</p>
      <h2>오늘의 한마디</h2>
      <p className="form-intro">편안한 마음으로, 당신의 이야기를 들려주세요.</p>
      <div className="field">
        <label htmlFor="authorName">이름 <span>NAME</span></label>
        <input
          id="authorName"
          name="authorName"
          required
          maxLength={LIMITS.authorName.max}
          placeholder="어떻게 불러드릴까요?"
        />
      </div>
      <div className="field">
        <label htmlFor="message">메시지 <span>MESSAGE</span></label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          maxLength={LIMITS.message.max}
          placeholder="오늘은 어떤 하루였나요?"
        />
      </div>
      <div className="field">
        <label htmlFor="password">비밀번호 <span>수정·삭제할 때 필요해요</span></label>
        <input
          id="password"
          name="password"
          type="password"
          required
          maxLength={LIMITS.password.max}
          placeholder="나만 아는 비밀번호"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="primary-button"
      >
        {pending ? "등록 중..." : "이야기 남기기 ↗"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="form-error">
          {state.message}
        </p>
      )}
    </form>
  );
}
