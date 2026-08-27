"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPageAction, updatePageAction, type ActionResult } from "@/actions/page-actions";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

export function PageForm({ page }: { page?: Page }) {
  const action = page ? updatePageAction.bind(null, page.id) : createPageAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/admin/pages");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Title</label>
        <input
          name="title"
          required
          defaultValue={page?.title}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Content</label>
        <textarea
          name="content"
          required
          rows={10}
          defaultValue={page?.content}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
        <input type="checkbox" name="published" defaultChecked={page?.published ?? false} />
        Published
      </label>
      {page && (
        <p className="font-mono text-xs text-muted">
          Live at <span className="text-ink">/p/{page.slug}</span>
        </p>
      )}

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">SEO</legend>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Meta title</label>
          <input
            name="metaTitle"
            defaultValue={page?.metaTitle}
            placeholder={page?.title}
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
            defaultValue={page?.metaDescription}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : page ? "Save changes" : "Create page"}
      </Button>
    </form>
  );
}
