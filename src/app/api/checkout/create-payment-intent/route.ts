import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // 10 payment intents per 10 minutes per user — plenty for legitimate
  // retries, blunt enough to stop scripted spam against the Stripe account.
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `payment-intent:${session.user.id}`,
    10,
    10 * 60 * 1000
  );
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many payment attempts. Try again in ${retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  if (!amount || !Number.isFinite(amount) || amount < 50 || amount > 100000000) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency: "inr",
    automatic_payment_methods: { enabled: true },
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ clientSecret: intent.client_secret, id: intent.id });
}
