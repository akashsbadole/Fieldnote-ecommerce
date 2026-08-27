"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createTaxRateAction, type ActionResult } from "@/actions/settings-actions";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export function NewTaxRateForm() {
  const [state, formAction, pending] = useActionState(createTaxRateAction, initialState);
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
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 border border-line p-4">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Label</label>
        <input
          name="label"
          required
          placeholder="Washington state tax"
          className="mt-1 w-48 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Country</label>
        <input
          name="country"
          required
          defaultValue="USA"
          className="mt-1 w-24 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          Region (optional)
        </label>
        <input
          name="region"
          placeholder="WA"
          className="mt-1 w-20 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Rate (%)</label>
        <input
          name="ratePercent"
          type="number"
          step="0.01"
          required
          className="mt-1 w-24 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <label className="flex items-center gap-2 pb-2 font-mono text-xs text-ink-soft">
        <input type="checkbox" name="active" defaultChecked />
        Active
      </label>
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Adding…" : "Add rate"}
      </Button>
    </form>
  );
}
