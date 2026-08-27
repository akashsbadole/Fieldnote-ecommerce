"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateOrderNotesAction, updateOrderTrackingAction } from "@/actions/product-actions";
import { Button } from "@/components/ui/button";

export function OrderNotesForm({ orderId, initialNotes }: { orderId: string; initialNotes?: string }) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, setPending] = useState(false);

  async function handleSave() {
    setPending(true);
    const res = await updateOrderNotesAction(orderId, notes);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }

  return (
    <div className="space-y-2">
      <label className="font-mono text-xs uppercase tracking-wider text-muted">
        Internal notes (not visible to customer)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
      />
      <Button size="sm" variant="outline" onClick={handleSave} disabled={pending}>
        {pending ? "Saving…" : "Save notes"}
      </Button>
    </div>
  );
}

export function OrderTrackingForm({
  orderId,
  initialTracking,
}: {
  orderId: string;
  initialTracking?: string;
}) {
  const [tracking, setTracking] = useState(initialTracking ?? "");
  const [pending, setPending] = useState(false);

  async function handleSave() {
    if (!tracking.trim()) {
      toast.error("Enter a tracking number first.");
      return;
    }
    setPending(true);
    const res = await updateOrderTrackingAction(orderId, tracking);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }

  return (
    <div className="space-y-2">
      <label className="font-mono text-xs uppercase tracking-wider text-muted">
        Tracking number
      </label>
      <div className="flex gap-2">
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="1Z999AA10123456784"
          className="flex-1 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
        <Button size="sm" variant="outline" onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save & notify"}
        </Button>
      </div>
    </div>
  );
}
