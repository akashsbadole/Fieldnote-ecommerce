"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction, type ActionResult } from "@/actions/account-actions";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) toast.success(state.message);
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Name</label>
        <input
          name="name"
          defaultValue={name}
          required
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
