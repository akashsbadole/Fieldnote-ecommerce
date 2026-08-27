import Link from "next/link";
import { auth } from "@/lib/auth";
import { getWishlistForUser } from "@/lib/data";
import { ProductGrid } from "@/components/products/product-grid";

export default async function WishlistPage() {
  const session = await auth();
  const items = await getWishlistForUser(session!.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <h2 className="font-display text-xl">Wishlist ({items.length})</h2>
        <Link href="/products" className="font-mono text-xs text-forest hover:underline">
          Browse gear →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          Nothing saved yet — tap the heart icon on any product page to add it here.
        </p>
      ) : (
        <ProductGrid products={items} showQuickAdd />
      )}
    </div>
  );
}
