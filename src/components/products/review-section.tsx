"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { createReviewAction, type ReviewResult } from "@/actions/review-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

const initialState: ReviewResult = { success: false, message: "" };

export function ReviewSection({
  productId,
  productSlug,
  reviews,
  isLoggedIn,
  alreadyReviewed,
}: {
  productId: string;
  productSlug: string;
  reviews: Review[];
  isLoggedIn: boolean;
  alreadyReviewed: boolean;
}) {
  const [state, formAction, pending] = useActionState(createReviewAction, initialState);
  const [rating, setRating] = useState(5);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <section className="mt-24">
      <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <h2 className="font-display text-2xl">Reviews ({reviews.length})</h2>
        {isLoggedIn && !alreadyReviewed && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Write a review
          </Button>
        )}
      </div>

      {!isLoggedIn && (
        <p className="mb-8 font-mono text-xs text-muted">Log in to leave a review.</p>
      )}
      {isLoggedIn && alreadyReviewed && (
        <p className="mb-8 font-mono text-xs text-muted">You&apos;ve already reviewed this product — thanks!</p>
      )}

      {showForm && !state.success && (
        <form action={formAction} className="mb-10 space-y-4 border border-line p-6">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="productSlug" value={productSlug} />
          <input type="hidden" name="rating" value={rating} />
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Rating</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                  className="cursor-pointer"
                >
                  <Star className={cn("h-5 w-5", n <= rating ? "fill-rust text-rust" : "text-line")} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Review</label>
            <textarea
              name="comment"
              required
              minLength={10}
              rows={4}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Posting…" : "Post review"}
            </Button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="font-mono text-sm text-muted">No reviews yet — be the first.</p>
      ) : (
        <ul className="divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="py-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn("h-3.5 w-3.5", n <= r.rating ? "fill-rust text-rust" : "text-line")}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs text-muted">
                  {r.userName} · {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 font-body text-sm text-ink-soft">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
