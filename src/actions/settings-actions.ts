"use server";

import { auth } from "@/lib/auth";
import {
  updateStoreSettings,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
} from "@/lib/data";
import { storeSettingsSchema, taxRateSchema } from "@/lib/validations";
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

export async function updateStoreSettingsAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = storeSettingsSchema.safeParse({
    storeName: formData.get("storeName"),
    supportEmail: formData.get("supportEmail"),
    currency: formData.get("currency"),
    addressLine: formData.get("addressLine") || "",
    freeShippingThreshold: formData.get("freeShippingThreshold"),
    flatShippingRate: formData.get("flatShippingRate"),
    expressShippingRate: formData.get("expressShippingRate"),
    defaultTaxPercent: formData.get("defaultTaxPercent"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription") || "",
    socialInstagram: formData.get("socialInstagram") || "",
    socialTwitter: formData.get("socialTwitter") || "",
    maintenanceMode: formData.get("maintenanceMode") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Dollar inputs in the form -> cents in storage
  await updateStoreSettings({
    ...parsed.data,
    freeShippingThreshold: Math.round(parsed.data.freeShippingThreshold * 100),
    flatShippingRate: Math.round(parsed.data.flatShippingRate * 100),
    expressShippingRate: Math.round(parsed.data.expressShippingRate * 100),
    maintenanceMode: !!parsed.data.maintenanceMode,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true, message: "Settings saved." };
}

export async function createTaxRateAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = taxRateSchema.safeParse({
    label: formData.get("label"),
    country: formData.get("country"),
    region: formData.get("region") || undefined,
    ratePercent: formData.get("ratePercent"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createTaxRate({ ...parsed.data, active: parsed.data.active ?? true });
  revalidatePath("/admin/settings/tax");
  return { success: true, message: "Tax rate added." };
}

export async function toggleTaxRateAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const result = await updateTaxRate(id, { active });
  revalidatePath("/admin/settings/tax");
  return { success: !!result, message: result ? "Updated." : "Tax rate not found." };
}

export async function deleteTaxRateAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const ok = await deleteTaxRate(id);
  revalidatePath("/admin/settings/tax");
  return { success: ok, message: ok ? "Tax rate deleted." : "Not found." };
}
