"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { setReviewApprovedAction, deleteReviewAction } from "@/actions/review-actions";

export function ReviewRowControls({ id, approved }: { id: string; approved: boolean }) {
  const [current, setCurrent] = useState(approved);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const res = await setReviewApprovedAction(id, !current);
    setPending(false);
    if (res.success) {
      setCurrent(!current);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this review permanently?")) return;
    setPending(true);
    const res = await deleteReviewAction(id);
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
        {current ? "Visible" : "Hidden"}
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        aria-label="Delete review"
        className="cursor-pointer text-muted hover:text-rust disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
