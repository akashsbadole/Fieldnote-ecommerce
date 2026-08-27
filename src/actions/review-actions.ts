"use server";

import { auth } from "@/lib/auth";
import { createReview, hasUserReviewed, setReviewApproved, deleteReview } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Not authorized.");
  return session;
}

const reviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, "Say a bit more — at least 10 characters."),
});

export interface ReviewResult {
  success: boolean;
  message: string;
}

export async function createReviewAction(
  _prev: ReviewResult | undefined,
  formData: FormData
): Promise<ReviewResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Log in to leave a review." };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const already = await hasUserReviewed(session.user.id, parsed.data.productId);
  if (already) {
    return { success: false, message: "You've already reviewed this product." };
  }

  await createReview({
    userId: session.user.id,
    userName: session.user.name ?? "Fieldnote customer",
    productId: parsed.data.productId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  revalidatePath(`/products/${parsed.data.productSlug}`);
  return { success: true, message: "Review posted — thanks!" };
}

export async function setReviewApprovedAction(
  reviewId: string,
  approved: boolean
): Promise<ReviewResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const review = await setReviewApproved(reviewId, approved);
  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  return {
    success: !!review,
    message: review ? (approved ? "Review approved." : "Review hidden.") : "Review not found.",
  };
}

export async function deleteReviewAction(reviewId: string): Promise<ReviewResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const ok = await deleteReview(reviewId);
  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  return { success: ok, message: ok ? "Review deleted." : "Review not found." };
}
