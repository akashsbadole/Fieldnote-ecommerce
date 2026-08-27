"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PriceRangeFilter({
  defaultMin,
  defaultMax,
}: {
  defaultMin?: string;
  defaultMax?: string;
}) {
  const [min, setMin] = useState(defaultMin ?? "");
  const [max, setMax] = useState(defaultMax ?? "");
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    router.push(`/products?${params.toString()}`);
  }

  function clear() {
    setMin("");
    setMax("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div>
      <h3 className="mt-8 font-mono text-xs uppercase tracking-wider text-muted">Price</h3>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min={0}
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full border border-line bg-transparent px-2 py-1.5 font-mono text-xs outline-none focus-visible:border-forest"
        />
        <span className="text-muted">–</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full border border-line bg-transparent px-2 py-1.5 font-mono text-xs outline-none focus-visible:border-forest"
        />
      </div>
      <div className="mt-2 flex gap-3">
        <button
          onClick={apply}
          className="cursor-pointer font-mono text-xs text-forest hover:underline"
        >
          Apply
        </button>
        {(defaultMin || defaultMax) && (
          <button
            onClick={clear}
            className="cursor-pointer font-mono text-xs text-muted hover:text-rust"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
