"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/product-actions";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, setPending] = useState(false);

  async function handleChange(next: OrderStatus) {
    setPending(true);
    const res = await updateOrderStatusAction(orderId, next);
    setPending(false);
    if (res.success) {
      setCurrent(next);
      toast.success(`${orderId.toUpperCase()} → ${next}`);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="cursor-pointer border border-line bg-transparent px-2 py-1 font-mono text-xs outline-none focus-visible:border-forest"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
