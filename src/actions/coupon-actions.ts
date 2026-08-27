"use server";

import { auth } from "@/lib/auth";
import { createCoupon, updateCoupon, deleteCoupon, validateCoupon } from "@/lib/data";
import { couponSchema } from "@/lib/validations";
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
  return couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minSubtotal: formData.get("minSubtotal") || undefined,
    maxUses: formData.get("maxUses") || undefined,
    active: formData.get("active") === "on",
  });
}

export async function createCouponAction(
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
  const d = parsed.data;

  await createCoupon({
    code: d.code,
    type: d.type,
    value: d.type === "fixed" ? Math.round(d.value * 100) : d.value,
    minSubtotal: d.minSubtotal ? Math.round(d.minSubtotal * 100) : undefined,
    maxUses: d.maxUses,
    active: d.active ?? true,
  });

  revalidatePath("/admin/coupons");
  return { success: true, message: "Coupon created." };
}

export async function updateCouponAction(
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
  const d = parsed.data;

  const result = await updateCoupon(id, {
    code: d.code,
    type: d.type,
    value: d.type === "fixed" ? Math.round(d.value * 100) : d.value,
    minSubtotal: d.minSubtotal ? Math.round(d.minSubtotal * 100) : undefined,
    maxUses: d.maxUses,
    active: d.active ?? true,
  });
  if (!result) return { success: false, message: "Coupon not found." };

  revalidatePath("/admin/coupons");
  return { success: true, message: "Coupon updated." };
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const ok = await deleteCoupon(id);
  revalidatePath("/admin/coupons");
  return { success: ok, message: ok ? "Coupon deleted." : "Coupon not found." };
}

export interface ApplyCouponResult {
  success: boolean;
  message: string;
  code?: string;
  discount?: number;
}

export async function applyCouponAction(code: string, subtotal: number): Promise<ApplyCouponResult> {
  const result = await validateCoupon(code, subtotal);
  if (!result.valid || !result.coupon) {
    return { success: false, message: result.message ?? "That code isn't valid." };
  }
  return {
    success: true,
    message: `Code applied — you saved ${(result.discount! / 100).toFixed(2)}.`,
    code: result.coupon.code,
    discount: result.discount,
  };
}
