"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleUserBlockedAction } from "@/actions/user-actions";

export function BlockUserButton({ userId, blocked }: { userId: string; blocked: boolean }) {
  const [current, setCurrent] = useState(blocked);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (!current && !confirm("Block this customer? They won't be able to log in.")) return;
    setPending(true);
    const res = await toggleUserBlockedAction(userId, !current);
    setPending(false);
    if (res.success) {
      setCurrent(!current);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`cursor-pointer font-mono text-xs disabled:opacity-40 ${
        current ? "text-forest hover:underline" : "text-rust hover:underline"
      }`}
    >
      {current ? "Unblock" : "Block"}
    </button>
  );
}
