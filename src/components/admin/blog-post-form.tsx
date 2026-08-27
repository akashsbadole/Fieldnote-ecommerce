"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createBlogPostAction,
  updateBlogPostAction,
  type ActionResult,
} from "@/actions/blog-actions";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const action = post ? updateBlogPostAction.bind(null, post.id) : createBlogPostAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/admin/blog");
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
          defaultValue={post?.title}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Author</label>
        <input
          name="authorName"
          required
          defaultValue={post?.authorName ?? "Fieldnote Team"}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Excerpt</label>
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={post?.excerpt}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Content</label>
        <textarea
          name="content"
          required
          rows={10}
          defaultValue={post?.content}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
        Published
      </label>

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">SEO</legend>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Meta title</label>
          <input
            name="metaTitle"
            defaultValue={post?.metaTitle}
            placeholder={post?.title}
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
            defaultValue={post?.metaDescription}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : post ? "Save changes" : "Publish post"}
      </Button>
    </form>
  );
}
