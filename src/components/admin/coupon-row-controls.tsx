"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { updateCouponAction, deleteCouponAction } from "@/actions/coupon-actions";

export function CouponRowControls({
  id,
  active,
  code,
  type,
  value,
  minSubtotal,
  maxUses,
}: {
  id: string;
  active: boolean;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  maxUses?: number;
}) {
  const [current, setCurrent] = useState(active);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const formData = new FormData();
    formData.set("code", code);
    formData.set("type", type);
    formData.set("value", type === "fixed" ? (value / 100).toString() : value.toString());
    if (minSubtotal) formData.set("minSubtotal", (minSubtotal / 100).toString());
    if (maxUses) formData.set("maxUses", maxUses.toString());
    if (!current) formData.set("active", "on");
    const res = await updateCouponAction(id, undefined, formData);
    setPending(false);
    if (res.success) {
      setCurrent(!current);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setPending(true);
    const res = await deleteCouponAction(id);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={pending}
        className={`cursor-pointer font-mono text-xs disabled:opacity-40 ${
          current ? "text-forest" : "text-muted"
        }`}
      >
        {current ? "Active" : "Inactive"}
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        aria-label="Delete coupon"
        className="cursor-pointer text-muted hover:text-rust disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
