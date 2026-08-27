"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deactivateAccountAction } from "@/actions/account-actions";
import { Button } from "@/components/ui/button";

export function DeactivateAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setPending(true);
    const res = await deactivateAccountAction();
    setPending(false);
    if (res.success) {
      toast.success("Account deactivated. You've been signed out.");
      router.push("/");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  if (!confirming) {
    return (
      <Button variant="ghost" onClick={() => setConfirming(true)}>
        Deactivate account
      </Button>
    );
  }

  return (
    <div className="space-y-3 border border-rust p-4">
      <p className="font-mono text-xs text-ink">
        This blocks your account and signs you out immediately. Contact support to reactivate.
        Are you sure?
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button variant="rust" size="sm" onClick={handleConfirm} disabled={pending}>
          {pending ? "Deactivating…" : "Yes, deactivate"}
        </Button>
      </div>
    </div>
  );
}
