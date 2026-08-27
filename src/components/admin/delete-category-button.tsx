"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/actions/category-actions";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete category "${name}"?`)) return;
    setPending(true);
    const res = await deleteCategoryAction(id);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
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
