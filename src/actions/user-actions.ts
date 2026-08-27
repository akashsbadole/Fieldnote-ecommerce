"use server";

import { auth } from "@/lib/auth";
import { setUserBlocked, setUserRole, getUserById } from "@/lib/data";
import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/types";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Not authorized.");
  return session;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function toggleUserBlockedAction(userId: string, blocked: boolean): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    if (session.user.id === userId && blocked) {
      return { success: false, message: "You can't block your own account." };
    }
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const user = await setUserBlocked(userId, blocked);
  revalidatePath("/admin/customers");
  return {
    success: !!user,
    message: user ? (blocked ? "Customer blocked." : "Customer unblocked.") : "User not found.",
  };
}

export async function updateUserRoleAction(userId: string, role: Role): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    if (session.user.id === userId) {
      return { success: false, message: "You can't change your own role." };
    }
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const existing = await getUserById(userId);
  if (!existing) return { success: false, message: "User not found." };

  await setUserRole(userId, role);
  revalidatePath("/admin/customers");
  return { success: true, message: `Role updated to ${role}.` };
}
