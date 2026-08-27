"use server";

import { auth } from "@/lib/auth";
import { getNotificationsForUser, markNotificationRead, markAllNotificationsRead } from "@/lib/data";
import { revalidatePath } from "next/cache";

export async function getMyNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getNotificationsForUser(session.user.id);
}

export async function markNotificationReadAction(id: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const ok = await markNotificationRead(id, session.user.id);
  revalidatePath("/", "layout");
  return { success: ok };
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean; count: number }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, count: 0 };
  const count = await markAllNotificationsRead(session.user.id);
  revalidatePath("/", "layout");
  return { success: true, count };
}
