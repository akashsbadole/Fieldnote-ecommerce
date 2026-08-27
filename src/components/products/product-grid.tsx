import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  showQuickAdd = false,
}: {
  products: Product[];
  showQuickAdd?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center gap-2 border border-dashed border-line py-24 text-center">
        <p className="font-display text-xl text-ink-soft">No gear found here.</p>
        <p className="font-mono text-sm text-muted">
          Try clearing a filter or searching another term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} showQuickAdd={showQuickAdd} />
      ))}
    </div>
  );
}
