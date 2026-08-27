import "server-only";

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);

export interface SendSmsResult {
  success: boolean;
  mode: "sent" | "logged" | "failed";
  error?: string;
}

/**
 * Sends an SMS via Twilio's REST API (plain fetch, no SDK dependency) when
 * TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER are set.
 * Otherwise logs the message to the server console — this keeps OTP login
 * fully testable without a real SMS provider account. In dev/demo mode,
 * the code is also returned in the API response so the UI can surface it
 * directly (see requestOtpAction) instead of making testers dig through
 * server logs.
 */
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  if (!isTwilioConfigured) {
    console.log(`\n[sms:not-configured] Would send to ${to}\n${body}\n`);
    return { success: true, mode: "logged" };
  }

  try {
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: TWILIO_FROM!, Body: body }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[sms:twilio] send failed", errText);
      return { success: false, mode: "failed", error: errText };
    }
    return { success: true, mode: "sent" };
  } catch (err) {
    console.error("[sms:twilio] send threw", err);
    return {
      success: false,
      mode: "failed",
      error: err instanceof Error ? err.message : "Unknown SMS error",
    };
  }
}

export { isTwilioConfigured };
