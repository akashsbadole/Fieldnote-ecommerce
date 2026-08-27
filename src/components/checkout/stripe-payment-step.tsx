"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | null = null;
if (publishableKey) {
  stripePromise = loadStripe(publishableKey);
}

interface Props {
  amountCents: number;
  onBack: () => void;
  onComplete: (paymentIntentId?: string) => void;
}

export function StripePaymentStep({ amountCents, onBack, onComplete }: Props) {
  if (!publishableKey) {
    return <DemoPaymentStep onBack={onBack} onComplete={onComplete} />;
  }
  return <RealStripeStep amountCents={amountCents} onBack={onBack} onComplete={onComplete} />;
}

function RealStripeStep({ amountCents, onBack, onComplete }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/checkout/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountCents }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else toast.error(data.error ?? "Couldn't start payment.");
      })
      .catch(() => toast.error("Couldn't start payment."))
      .finally(() => setLoading(false));
  }, [amountCents]);

  if (loading) {
    return <p className="border border-line p-6 font-mono text-sm text-muted">Preparing payment…</p>;
  }
  if (!clientSecret) {
    return (
      <div className="space-y-4 border border-line p-6">
        <p className="font-mono text-sm text-rust">Couldn&apos;t start payment. Try again.</p>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeForm onBack={onBack} onComplete={onComplete} />
    </Elements>
  );
}

function StripeForm({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (paymentIntentId?: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Payment failed.");
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onComplete(paymentIntent.id);
    } else {
      toast.error("Payment did not complete.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-line p-6">
      <h2 className="font-display text-xl">Payment</h2>
      <PaymentElement />
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={!stripe || submitting}>
          {submitting ? "Confirming…" : "Confirm payment"}
        </Button>
      </div>
    </form>
  );
}

function DemoPaymentStep({ onBack, onComplete }: Omit<Props, "amountCents">) {
  return (
    <div className="space-y-5 border border-line p-6">
      <h2 className="font-display text-xl">Payment</h2>
      <p className="border border-dashed border-line bg-paper-dim px-4 py-3 font-mono text-xs text-muted">
        Demo checkout — Stripe isn&apos;t configured on this deployment, so
        no real card is charged. Set STRIPE_SECRET_KEY and
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable real payment.
      </p>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          Card number
        </label>
        <input
          placeholder="4242 4242 4242 4242"
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Expiry</label>
          <input
            placeholder="12/28"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">CVC</label>
          <input
            placeholder="123"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" className="flex-1" onClick={() => onComplete(undefined)}>
          Review order
        </Button>
      </div>
    </div>
  );
}
