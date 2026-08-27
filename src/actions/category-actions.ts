"use server";

import { auth } from "@/lib/auth";
import { createCategory, updateCategory, deleteCategory } from "@/lib/data";
import { categorySchema } from "@/lib/validations";
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

export async function createCategoryAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createCategory(parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: true, message: "Category created." };
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await updateCategory(id, parsed.data);
  if (!result) return { success: false, message: "Category not found." };

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: true, message: "Category updated." };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const result = await deleteCategory(id);
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: result.success, message: result.message ?? "Category deleted." };
}
