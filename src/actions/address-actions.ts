"use server";

import { auth } from "@/lib/auth";
import { createAddress, updateAddress, deleteAddress, getAddressesForUser } from "@/lib/data";
import { addressSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { Address } from "@/lib/types";

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function getMyAddressesAction(): Promise<Address[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getAddressesForUser(session.user.id);
}

export async function createAddressAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    country: formData.get("country"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid address." };
  }

  await createAddress({
    userId: session.user.id,
    ...parsed.data,
    isDefault: formData.get("isDefault") === "on",
  });

  revalidatePath("/account/profile");
  return { success: true, message: "Address added." };
}

export async function updateAddressAction(
  addressId: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    country: formData.get("country"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid address." };
  }

  const updated = await updateAddress(addressId, session.user.id, {
    ...parsed.data,
    isDefault: formData.get("isDefault") === "on",
  });
  if (!updated) return { success: false, message: "Address not found." };

  revalidatePath("/account/profile");
  return { success: true, message: "Address updated." };
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  const deleted = await deleteAddress(addressId, session.user.id);
  revalidatePath("/account/profile");
  return deleted
    ? { success: true, message: "Address removed." }
    : { success: false, message: "Address not found." };
}

export async function setDefaultAddressAction(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  const updated = await updateAddress(addressId, session.user.id, { isDefault: true });
  revalidatePath("/account/profile");
  return updated
    ? { success: true, message: "Default address updated." }
    : { success: false, message: "Address not found." };
}
