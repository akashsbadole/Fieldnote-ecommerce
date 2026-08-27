import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// Order creation itself happens synchronously in placeOrderAction after
// verifying the PaymentIntent server-side (see src/actions/order-actions.ts).
// This webhook exists for the events that action can't see inline —
// disputes, async payment method failures, and refunds — and logs them so
// an admin can act. Wire this up to update order status automatically once
// a real database + a mapping from paymentIntentId -> orderId exists.
export async function POST(req: NextRequest) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or STRIPE_WEBHOOK_SECRET." },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("[stripe-webhook] payment_intent.succeeded", event.data.object.id);
      break;
    case "payment_intent.payment_failed":
      console.warn("[stripe-webhook] payment_intent.payment_failed", event.data.object.id);
      break;
    case "charge.refunded":
      console.log("[stripe-webhook] charge.refunded", event.data.object.id);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
