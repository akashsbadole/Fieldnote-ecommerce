"use server";

import { createUser } from "@/lib/data";
import { registerSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createNotification } from "@/lib/data";

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function registerAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  // 5 new accounts per hour per IP — generous for real signups, blunt
  // enough to stop scripted account-creation spam.
  const { allowed, retryAfterSeconds } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return {
      success: false,
      message: `Too many accounts created from this connection. Try again in ${Math.ceil(
        (retryAfterSeconds ?? 60) / 60
      )} minutes.`,
    };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const user = await createUser(parsed.data);
    if (user.email) {
      sendEmail({
        to: user.email,
        subject: "Welcome to Fieldnote",
        html: welcomeEmail(user.name),
      }).catch((err) => console.error("[welcome-email] failed", err));
    }
    await createNotification({
      userId: user.id,
      type: "welcome",
      title: "Welcome to Fieldnote",
      message: "Your account is set up. Browse the catalog whenever you're ready.",
      link: "/products",
    });
    return { success: true, message: "Account created. You can log in now." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}
