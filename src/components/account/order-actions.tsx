"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelOrderAction } from "@/actions/order-actions";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";

export function OrderActions({ order }: { order: Order }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  async function handleCancel() {
    setPending(true);
    const res = await cancelOrderAction(order.id);
    setPending(false);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  function handleReorder() {
    for (const item of order.items) {
      addItem(
        {
          productId: item.productId,
          slug: item.productId,
          name: item.productName,
          price: item.price,
          variant: item.variant,
          stock: 999,
        },
        item.quantity
      );
    }
    toast.success("Items added to your pack");
  }

  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={handleReorder}>
        Reorder
      </Button>
      {order.status === "PENDING" && (
        <Button variant="ghost" onClick={handleCancel} disabled={pending}>
          {pending ? "Cancelling…" : "Cancel order"}
        </Button>
      )}
    </div>
  );
}
