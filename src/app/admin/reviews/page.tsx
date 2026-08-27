import Link from "next/link";
import { getAllReviews, getProductById } from "@/lib/data";
import { ReviewRowControls } from "@/components/admin/review-row-controls";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const products = await Promise.all(reviews.map((r) => getProductById(r.productId)));

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">MODERATION</span>
        <h2 className="mt-1 font-display text-3xl">Reviews ({reviews.length})</h2>
      </div>

      {reviews.length === 0 ? (
        <p className="font-mono text-sm text-muted">No reviews yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {reviews.map((r, i) => {
            const product = products[i];
            return (
              <li key={r.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {product && (
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-mono text-xs text-forest hover:underline"
                      >
                        {product.name}
                      </Link>
                    )}
                    <span className="font-mono text-xs text-muted">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)} · {r.userName} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm text-ink-soft">{r.comment}</p>
                </div>
                <ReviewRowControls id={r.id} approved={r.approved} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
