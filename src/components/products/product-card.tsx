"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "./product-art";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  showQuickAdd = false,
}: {
  product: Product;
  /** Shows an "Add to cart" button on hover — used on the wishlist page,
   * where a quick add makes sense since the person already chose this item. */
  showQuickAdd?: boolean;
}) {
  const lowStock = product.stock > 0 && product.stock <= 15;
  const outOfStock = product.stock === 0;
  const addItem = useCartStore((s) => s.addItem);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants[0];
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price + (variant?.priceDiff ?? 0),
      variant: variant?.label !== "Standard" ? variant?.label : undefined,
      stock: variant?.stock ?? product.stock,
    });
    toast.success(`Added ${product.name} to your pack`);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block animate-fade-up"
    >
      <div className="stitched relative aspect-square">
        <ProductArt
          productId={product.id}
          categoryId={product.categoryId}
          imageUrl={product.images?.[0]?.url || undefined}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {product.comparePrice && (
          <span className="absolute left-3 top-3 bg-rust px-2 py-1 font-mono text-[0.65rem] tracking-wide text-paper">
            SALE
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 bg-ink/80 px-2 py-1 font-mono text-[0.65rem] tracking-wide text-paper">
            OUT OF STOCK
          </span>
        )}
        {showQuickAdd && !outOfStock && (
          <button
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-forest text-paper opacity-0 transition-opacity hover:bg-forest-dark group-hover:opacity-100"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="pt-3">
        <h3 className="font-display text-lg leading-snug text-ink group-hover:text-forest">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm text-ink-soft">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="font-mono text-xs text-muted line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        <div className="spec-row">
          <span>★ {product.rating.toFixed(1)} ({product.reviewCount})</span>
          <span>{lowStock ? `${product.stock} left` : outOfStock ? "—" : "in stock"}</span>
        </div>
      </div>
    </Link>
  );
}
