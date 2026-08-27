"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCategoryAction,
  updateCategoryAction,
  type ActionResult,
} from "@/actions/category-actions";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

export function CategoryForm({ category }: { category?: Category }) {
  const action = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/admin/categories");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Name</label>
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={category?.description}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">SEO</legend>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Meta title</label>
          <input
            name="metaTitle"
            defaultValue={category?.metaTitle}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Meta description
          </label>
          <textarea
            name="metaDescription"
            rows={2}
            defaultValue={category?.metaDescription}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : category ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}
