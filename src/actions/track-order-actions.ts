"use server";

import { getOrderById, getUserById } from "@/lib/data";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";
import type { Order } from "@/lib/types";

const trackSchema = z.object({
  orderId: z.string().trim().min(3, "Enter your order number"),
  email: z.string().trim().email("Enter the email used at checkout"),
});

export interface TrackOrderResult {
  success: boolean;
  message: string;
  order?: Order;
}

export async function trackOrderAction(orderId: string, email: string): Promise<TrackOrderResult> {
  const parsed = trackSchema.safeParse({ orderId, email });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`track-order:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return { success: false, message: "Too many lookups. Try again in a few minutes." };
  }

  const normalizedId = parsed.data.orderId.trim().toLowerCase();
  const order = await getOrderById(normalizedId);
  const genericError = "We couldn't find an order matching that number and email.";

  if (!order) return { success: false, message: genericError };

  const user = await getUserById(order.userId);
  if (!user?.email || user.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return { success: false, message: genericError };
  }

  return { success: true, message: "Order found.", order };
}
