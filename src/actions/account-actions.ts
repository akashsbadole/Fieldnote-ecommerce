"use server";

import { auth, signOut } from "@/lib/auth";
import { getUserById, updateUserProfile, verifyPassword, setUserPassword, setUserBlocked } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface ActionResult {
  success: boolean;
  message: string;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
});

export async function updateProfileAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateUserProfile(session.user.id, parsed.data);
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Update failed." };
  }

  revalidatePath("/account/profile");
  return { success: true, message: "Profile updated." };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await getUserById(session.user.id);
  if (!user) return { success: false, message: "User not found." };

  const valid = await verifyPassword(user, parsed.data.currentPassword);
  if (!valid) return { success: false, message: "Current password is incorrect." };

  await setUserPassword(user.id, parsed.data.newPassword);
  return { success: true, message: "Password updated." };
}

export async function deactivateAccountAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Not authenticated." };

  await setUserBlocked(session.user.id, true);
  await signOut({ redirect: false });
  return { success: true, message: "Account deactivated." };
}
