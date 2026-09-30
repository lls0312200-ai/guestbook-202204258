export type PublicEntry = {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export type EditResult =
  | { ok: true; entry: PublicEntry }
  | { ok: false; error: string };

export type DeleteResult = { ok: true } | { ok: false; error: string };

export const GENERIC_AUTH_ERROR: string;

export class ValidationError extends Error {}

export function createEntry(input: {
  authorName: FormDataEntryValue | null;
  message: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): Promise<PublicEntry>;

export function listEntries(): Promise<PublicEntry[]>;

export function editEntry(input: {
  id: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  message: FormDataEntryValue | null;
}): Promise<EditResult>;

export function deleteEntry(input: {
  id: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): Promise<DeleteResult>;
