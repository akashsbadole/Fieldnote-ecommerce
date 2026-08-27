"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/actions/user-actions";
import type { Role } from "@/lib/types";

export function UserRoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [current, setCurrent] = useState(role);
  const [pending, setPending] = useState(false);

  async function handleChange(next: Role) {
    if (!confirm(`Change this user's role to ${next}?`)) return;
    setPending(true);
    const res = await updateUserRoleAction(userId, next);
    setPending(false);
    if (res.success) {
      setCurrent(next);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as Role)}
      className="cursor-pointer border border-line bg-transparent px-2 py-1 font-mono text-xs outline-none focus-visible:border-forest"
    >
      <option value="CUSTOMER">CUSTOMER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
