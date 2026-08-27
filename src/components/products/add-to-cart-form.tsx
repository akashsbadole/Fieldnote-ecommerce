"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Minus, Plus, Heart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { toggleWishlistAction } from "@/actions/wishlist-actions";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function AddToCartForm({
  product,
  initialInWishlist = false,
}: {
  product: Product;
  initialInWishlist?: boolean;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);

  const variant = product.variants.find((v) => v.id === variantId);
  const stock = variant?.stock ?? product.stock;
  const price = product.price + (variant?.priceDiff ?? 0);
  const outOfStock = stock === 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price,
        variant: variant?.label,
        stock,
      },
      quantity
    );
    toast.success(`Added ${product.name} to your pack`);
  }

  function handleWishlist() {
    startTransition(async () => {
      const res = await toggleWishlistAction(product.id);
      if (res.success) {
        setInWishlist(res.inWishlist);
        toast.success(res.inWishlist ? "Saved to wishlist" : "Removed from wishlist");
      } else {
        toast.error(res.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="mt-8 space-y-6">
      {product.variants.length > 1 && (
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Option
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock === 0}
                className={`cursor-pointer border px-3 py-2 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
                  variantId === v.id
                    ? "border-forest bg-forest text-paper"
                    : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-line">
          <button
            className="cursor-pointer px-3 py-2"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-sm">{quantity}</span>
          <button
            className="cursor-pointer px-3 py-2"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="font-mono text-xs text-muted">
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </span>
      </div>

      <div className="flex gap-3">
        <Button size="lg" className="flex-1" disabled={outOfStock} onClick={handleAdd}>
          {outOfStock ? "Out of stock" : "Add to pack"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          onClick={handleWishlist}
          disabled={pending}
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-rust text-rust")} />
        </Button>
      </div>
    </div>
  );
}
