import "server-only";
import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL
  ? `Fieldnote <${process.env.RESEND_FROM_EMAIL}>`
  : "Fieldnote <orders@fieldnote.co>";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  mode: "sent" | "logged" | "failed";
  error?: string;
}

/**
 * Sends an email via Resend when RESEND_API_KEY is set. Otherwise logs the
 * email to the server console — this keeps every flow that depends on
 * email (order confirmation, password reset, welcome) fully working in
 * development/demo without requiring a real provider account.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!resend) {
    console.log(
      `\n[email:not-configured] Would send to ${input.to}\nSubject: ${input.subject}\n` +
        `Set RESEND_API_KEY in .env to send real email.\n` +
        `---\n${stripHtml(input.html)}\n---\n`
    );
    return { success: true, mode: "logged" };
  }

  try {
    const res = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (res.error) {
      console.error("[email:resend] send failed", res.error);
      return { success: false, mode: "failed", error: res.error.message };
    }
    return { success: true, mode: "sent" };
  } catch (err) {
    console.error("[email:resend] send threw", err);
    return {
      success: false,
      mode: "failed",
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
