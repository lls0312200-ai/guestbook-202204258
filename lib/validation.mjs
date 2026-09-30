// Shared input limits (see GLOSSARY.md / spec "Implementation Decisions").
export const LIMITS = {
  authorName: { min: 1, max: 30, label: "이름" },
  message: { min: 1, max: 500, label: "메시지" },
  password: { min: 1, max: 64, label: "비밀번호" },
};

export function normalizeInput(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function withinLimit(value, limit) {
  return value.length >= limit.min && value.length <= limit.max;
}
