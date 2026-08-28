"use server";

import { getUserByPhone, issueOtp } from "@/lib/data";
import { sendSms } from "@/lib/sms";
import { checkRateLimit } from "@/lib/rate-limit";
import { phoneSchema } from "@/lib/validations";
import { headers } from "next/headers";

export interface RequestOtpResult {
  success: boolean;
  message: string;
  /** Only populated when SMS isn't configured, so the demo/dev UI can show
   *  the code directly instead of requiring server log access. Never set
   *  when a real SMS provider actually sent the message. */
  devCode?: string;
}

export async function requestOtpAction(phone: string): Promise<RequestOtpResult> {
  const parsed = phoneSchema.safeParse({ phone });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid phone number." };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // 4 requests per 15 minutes per phone number, and per IP, so a single
  // number can't be spammed and a single client can't spam many numbers.
  const byPhone = checkRateLimit(`otp-request:phone:${parsed.data.phone}`, 4, 15 * 60 * 1000);
  const byIp = checkRateLimit(`otp-request:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!byPhone.allowed || !byIp.allowed) {
    return { success: false, message: "Too many code requests. Try again in a few minutes." };
  }

  const code = await issueOtp(parsed.data.phone);
  const result = await sendSms(
    parsed.data.phone,
    `Your Fieldnote verification code is ${code}. It expires in 10 minutes.`
  );

  if (!result.success) {
    return { success: false, message: "Couldn't send the code. Try again shortly." };
  }

  const isDev = process.env.NODE_ENV !== "production";
  return {
    success: true,
    message:
      result.mode === "logged"
        ? isDev
          ? "Code generated (SMS isn't configured — shown below for testing)."
          : "Code generated — check server logs or configure SMS."
        : "Code sent by text message.",
    devCode: result.mode === "logged" && isDev ? code : undefined,
  };
}

export async function isNewPhoneNumber(phone: string): Promise<boolean> {
  const user = await getUserByPhone(phone);
  return !user;
}
