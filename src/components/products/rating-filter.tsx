"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLDS = [4, 3, 2] as const;

export function RatingFilter({ defaultMin }: { defaultMin?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = defaultMin ? Number(defaultMin) : undefined;

  function select(rating: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (current === rating) {
      params.delete("minRating");
    } else {
      params.set("minRating", String(rating));
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div>
      <h3 className="mt-8 font-mono text-xs uppercase tracking-wider text-muted">Rating</h3>
      <ul className="mt-3 space-y-2">
        {THRESHOLDS.map((rating) => (
          <li key={rating}>
            <button
              onClick={() => select(rating)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 font-body text-sm",
                current === rating ? "text-forest font-medium" : "text-ink-soft hover:text-forest"
              )}
            >
              <span className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < rating ? "fill-current" : "fill-none"
                    )}
                    strokeWidth={1.5}
                  />
                ))}
              </span>
              <span>&amp; up</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
