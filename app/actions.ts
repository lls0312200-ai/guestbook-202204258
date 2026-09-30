"use server";

import { revalidatePath } from "next/cache";
import { createEntry, editEntry, deleteEntry, ValidationError } from "../lib/entries.mjs";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialActionState: ActionState = { status: "idle" };

export async function createEntryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await createEntry({
      authorName: formData.get("authorName"),
      message: formData.get("message"),
      password: formData.get("password"),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  revalidatePath("/");
  return { status: "success" };
}

export async function editEntryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const result = await editEntry({
      id: formData.get("id"),
      password: formData.get("password"),
      message: formData.get("message"),
    });
    if (!result.ok) {
      return { status: "error", message: result.error };
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  revalidatePath("/");
  return { status: "success" };
}

export async function deleteEntryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = await deleteEntry({
    id: formData.get("id"),
    password: formData.get("password"),
  });
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath("/");
  return { status: "success" };
}
