"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart-store";
import { toggleWishlistAction } from "@/actions/wishlist-actions";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { lines, updateQuantity, removeItem, subtotal, clearCart } = useCartStore();
  const { data: session } = useSession();

  async function moveToWishlist(productId: string, variant: string | undefined, name: string) {
    if (!session) {
      toast.error("Log in to save items for later.");
      return;
    }
    const res = await toggleWishlistAction(productId);
    if (res.success) {
      removeItem(productId, variant);
      toast.success(`Saved ${name} for later`);
    } else {
      toast.error(res.message ?? "Something went wrong.");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <span className="font-mono text-xs tracking-widest text-rust">YOUR PACK</span>
        <h1 className="font-display text-3xl">It&apos;s empty in here.</h1>
        <p className="font-mono text-sm text-muted">Time to go find some gear.</p>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between border-b border-line pb-6">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">YOUR PACK</span>
          <h1 className="mt-1 font-display text-4xl">Cart</h1>
        </div>
        <button
          onClick={clearCart}
          className="cursor-pointer font-mono text-xs text-muted hover:text-rust"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <ul className="divide-y divide-line lg:col-span-2">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.variant}`} className="flex gap-5 py-6">
              <Link href={`/products/${line.slug}`} className="stitched h-24 w-24 shrink-0 bg-sand-light" />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link href={`/products/${line.slug}`} className="font-display text-lg hover:text-forest">
                      {line.name}
                    </Link>
                    {line.variant && (
                      <p className="font-mono text-xs text-muted">{line.variant}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(line.productId, line.variant)}
                    aria-label={`Remove ${line.name}`}
                    className="cursor-pointer text-muted hover:text-rust"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => updateQuantity(line.productId, line.quantity - 1, line.variant)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm">{line.quantity}</span>
                    <button
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => updateQuantity(line.productId, line.quantity + 1, line.variant)}
                      disabled={line.quantity >= line.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => moveToWishlist(line.productId, line.variant, line.name)}
                      className="flex cursor-pointer items-center gap-1 font-mono text-xs text-muted hover:text-forest"
                    >
                      <Heart className="h-3.5 w-3.5" /> Save for later
                    </button>
                    <span className="font-mono text-sm">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit border border-line p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-muted">Shipping</span>
              <span>{subtotal() > 10000 ? "Free" : formatPrice(700)}</span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-muted">Est. tax</span>
              <span>{formatPrice(Math.round(subtotal() * 0.08))}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-mono text-base">
            <span>Total</span>
            <span>
              {formatPrice(
                subtotal() +
                  (subtotal() > 10000 ? 0 : 700) +
                  Math.round(subtotal() * 0.08)
              )}
            </span>
          </div>
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
