"use server";

import { auth } from "@/lib/auth";
import { createPage, updatePage, deletePage } from "@/lib/data";
import { pageSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Not authorized.");
  return session;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

function parseForm(formData: FormData) {
  return pageSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
  });
}

export async function createPageAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createPage({ ...parsed.data, published: !!parsed.data.published });
  revalidatePath("/admin/pages");
  return { success: true, message: "Page created." };
}

export async function updatePageAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await updatePage(id, { ...parsed.data, published: !!parsed.data.published });
  if (!result) return { success: false, message: "Page not found." };

  revalidatePath("/admin/pages");
  revalidatePath(`/p/${result.slug}`);
  return { success: true, message: "Page updated." };
}

export async function deletePageAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const ok = await deletePage(id);
  revalidatePath("/admin/pages");
  return { success: ok, message: ok ? "Page deleted." : "Page not found." };
}
