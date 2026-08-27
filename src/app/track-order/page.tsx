"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trackOrderAction } from "@/actions/track-order-actions";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const TIMELINE: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setOrder(null);
    const res = await trackOrderAction(orderId, email);
    setSubmitting(false);

    if (!res.success || !res.order) {
      toast.error(res.message);
      return;
    }
    setOrder(res.order);
  }

  const currentIdx = order ? TIMELINE.indexOf(order.status) : -1;
  const isTerminalOther = order?.status === "CANCELLED" || order?.status === "REFUNDED";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">TRACK YOUR ORDER</span>
      <h1 className="mt-1 font-display text-3xl">Where&apos;s my gear?</h1>
      <p className="mt-2 font-mono text-xs text-muted">
        No account needed — just your order number and the email used at checkout.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Order number
          </label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ord_1001"
            required
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Looking it up…" : "Track order"}
        </Button>
      </form>

      {order && (
        <div className="mt-10 space-y-6 border-t border-line pt-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs tracking-widest text-rust">ORDER</span>
              <h2 className="font-display text-2xl">{order.id.toUpperCase()}</h2>
            </div>
            <span className="font-mono text-xs text-muted">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          {!isTerminalOther ? (
            <div className="flex items-center">
              {TIMELINE.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${i <= currentIdx ? "bg-forest" : "bg-line"}`} />
                    <span
                      className={`font-mono text-[0.65rem] uppercase ${
                        i <= currentIdx ? "text-forest" : "text-muted"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className={`mx-2 h-px flex-1 ${i < currentIdx ? "bg-forest" : "bg-line"}`} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm uppercase text-rust">{order.status}</p>
          )}

          {order.trackingNumber && (
            <p className="font-mono text-xs text-muted">
              Tracking number: <span className="text-ink">{order.trackingNumber}</span>
            </p>
          )}

          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between py-3 font-mono text-sm">
                <span>
                  {item.productName} {item.variant && `(${item.variant})`} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-line pt-3 font-mono text-base">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
