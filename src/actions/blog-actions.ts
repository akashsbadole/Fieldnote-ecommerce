"use server";

import { auth } from "@/lib/auth";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/data";
import { blogPostSchema } from "@/lib/validations";
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
  return blogPostSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    authorName: formData.get("authorName"),
    published: formData.get("published") === "on",
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
  });
}

export async function createBlogPostAction(
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

  await createBlogPost({ ...parsed.data, published: !!parsed.data.published });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, message: "Post created." };
}

export async function updateBlogPostAction(
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

  const result = await updateBlogPost(id, { ...parsed.data, published: !!parsed.data.published });
  if (!result) return { success: false, message: "Post not found." };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${result.slug}`);
  return { success: true, message: "Post updated." };
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const ok = await deleteBlogPost(id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: ok, message: ok ? "Post deleted." : "Post not found." };
}
