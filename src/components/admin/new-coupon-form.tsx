"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { createCouponAction, type ActionResult } from "@/actions/coupon-actions";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export function NewCouponForm() {
  const [state, formAction, pending] = useActionState(createCouponAction, initialState);
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 border border-line p-4"
    >
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Code</label>
        <input
          name="code"
          required
          placeholder="SAVE20"
          className="mt-1 w-32 border border-line bg-transparent px-3 py-2 text-sm uppercase outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Type</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "percent" | "fixed")}
          className="mt-1 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        >
          <option value="percent">% off</option>
          <option value="fixed">$ off</option>
        </select>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          Value {type === "percent" ? "(%)" : "($)"}
        </label>
        <input
          name="value"
          type="number"
          step={type === "percent" ? "1" : "0.01"}
          required
          className="mt-1 w-24 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Min order ($)</label>
        <input
          name="minSubtotal"
          type="number"
          step="0.01"
          className="mt-1 w-28 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Max uses</label>
        <input
          name="maxUses"
          type="number"
          placeholder="Unlimited"
          className="mt-1 w-28 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <label className="flex items-center gap-2 pb-2 font-mono text-xs text-ink-soft">
        <input type="checkbox" name="active" defaultChecked />
        Active
      </label>
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Adding…" : "Add coupon"}
      </Button>
    </form>
  );
}
