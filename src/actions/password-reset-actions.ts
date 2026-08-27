"use server";

import {
  getUserByEmail,
  createResetToken,
  consumeResetToken,
  setUserPassword,
} from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

export interface ActionResult {
  success: boolean;
  message: string;
}

const forgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, message: "Enter a valid email." };
  }

  // 3 requests per 15 minutes, keyed by the email itself — stops someone
  // from hammering a victim's inbox with reset emails, independent of IP.
  const { allowed } = checkRateLimit(
    `forgot-password:${parsed.data.email.toLowerCase()}`,
    3,
    15 * 60 * 1000
  );
  // Also cap by IP so one connection can't sweep many emails.
  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`forgot-password-ip:${ip}`, 10, 15 * 60 * 1000);

  const genericMessage = "If that email has an account, a reset link is on its way.";
  if (!allowed || !ipLimit.allowed) {
    // Return the same generic message even when rate-limited, so this
    // endpoint still can't be used to enumerate accounts or detect limits.
    return { success: true, message: genericMessage };
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user || !user.email) {
    return { success: true, message: genericMessage };
  }

  const token = await createResetToken(user.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Fieldnote password",
    html: passwordResetEmail(resetUrl),
  });

  return { success: true, message: genericMessage };
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const userId = await consumeResetToken(parsed.data.token);
  if (!userId) {
    return { success: false, message: "This reset link is invalid or has expired." };
  }

  await setUserPassword(userId, parsed.data.password);
  return { success: true, message: "Password updated. You can log in now." };
}
