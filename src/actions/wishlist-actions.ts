"use server";

import { auth } from "@/lib/auth";
import { toggleWishlist } from "@/lib/data";
import { revalidatePath } from "next/cache";

export interface WishlistResult {
  success: boolean;
  inWishlist: boolean;
  message?: string;
}

export async function toggleWishlistAction(productId: string): Promise<WishlistResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, inWishlist: false, message: "Log in to save items." };
  }
  const result = await toggleWishlist(session.user.id, productId);
  revalidatePath("/account/wishlist");
  return { success: true, inWishlist: result.inWishlist };
}
