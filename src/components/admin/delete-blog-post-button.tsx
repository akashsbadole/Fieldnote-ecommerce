"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteBlogPostAction } from "@/actions/blog-actions";

export function DeleteBlogPostButton({ id, title }: { id: string; title: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"?`)) return;
    setPending(true);
    const res = await deleteBlogPostAction(id);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      aria-label={`Delete ${title}`}
      className="cursor-pointer text-muted hover:text-rust disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
