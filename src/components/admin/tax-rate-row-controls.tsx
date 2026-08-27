"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { toggleTaxRateAction, deleteTaxRateAction } from "@/actions/settings-actions";

export function TaxRateRowControls({ id, active }: { id: string; active: boolean }) {
  const [current, setCurrent] = useState(active);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const res = await toggleTaxRateAction(id, !current);
    setPending(false);
    if (res.success) {
      setCurrent(!current);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this tax rate?")) return;
    setPending(true);
    const res = await deleteTaxRateAction(id);
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
        aria-label="Delete tax rate"
        className="cursor-pointer text-muted hover:text-rust disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
