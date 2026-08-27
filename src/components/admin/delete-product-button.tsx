"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/actions/product-actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setPending(true);
    const res = await deleteProductAction(id);
    setPending(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      aria-label={`Delete ${name}`}
      className="cursor-pointer text-muted hover:text-rust disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
