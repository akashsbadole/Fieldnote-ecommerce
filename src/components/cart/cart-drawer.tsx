"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useEffect } from "react";

export function CartDrawer() {
  const { isOpen, closeCart, lines, updateQuantity, removeItem, subtotal } =
    useCartStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl">Your pack ({lines.length})</h2>
          <button onClick={closeCart} aria-label="Close cart" className="cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-lg text-ink-soft">Empty pack.</p>
              <p className="font-mono text-sm text-muted">
                Nothing in here yet — go find some gear.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Browse gear
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={`${line.productId}-${line.variant}`} className="flex gap-4 py-4">
                  <div className="h-20 w-20 shrink-0 stitched bg-sand-light" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${line.slug}`}
                          onClick={closeCart}
                          className="font-display text-sm leading-tight hover:text-forest"
                        >
                          {line.name}
                        </Link>
                        {line.variant && (
                          <p className="font-mono text-xs text-muted">{line.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(line.productId, line.variant)}
                        aria-label={`Remove ${line.name} from cart`}
                        className="cursor-pointer text-muted hover:text-rust"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          className="cursor-pointer px-2 py-1"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(line.productId, line.quantity - 1, line.variant)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm">
                          {line.quantity}
                        </span>
                        <button
                          className="cursor-pointer px-2 py-1"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(line.productId, line.quantity + 1, line.variant)
                          }
                          disabled={line.quantity >= line.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-mono text-sm">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="spec-row mb-4 border-t-0">
              <span className="font-body text-ink">Subtotal</span>
              <span className="text-sm text-ink">{formatPrice(subtotal())}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Checkout
            </Link>
            <p className="mt-2 text-center font-mono text-xs text-muted">
              Shipping and tax calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
