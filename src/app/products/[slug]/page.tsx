import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getProductBySlug,
  getRelatedProducts,
  getCategories,
  isInWishlist,
  getReviewsForProduct,
  hasUserReviewed,
} from "@/lib/data";
import { ProductArt } from "@/components/products/product-art";
import { AddToCartForm } from "@/components/products/add-to-cart-form";
import { ProductGrid } from "@/components/products/product-grid";
import { ReviewSection } from "@/components/products/review-section";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Fieldnote`,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const [related, categories, reviews, alreadyReviewed, inWishlist] = await Promise.all([
    getRelatedProducts(product),
    getCategories(),
    getReviewsForProduct(product.id),
    session?.user?.id ? hasUserReviewed(session.user.id, product.id) : Promise.resolve(false),
    session?.user?.id ? isInWishlist(session.user.id, product.id) : Promise.resolve(false),
  ]);
  const category = categories.find((c) => c.id === product.categoryId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    category: category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-8 font-mono text-xs text-muted">
        <Link href="/" className="hover:text-forest">Home</Link>
        {" / "}
        <Link href="/products" className="hover:text-forest">Gear</Link>
        {category && (
          <>
            {" / "}
            <Link href={`/categories/${category.slug}`} className="hover:text-forest">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="stitched aspect-square">
          <ProductArt
            productId={product.id}
            categoryId={product.categoryId}
            imageUrl={product.images?.[0]?.url || undefined}
            className="h-full w-full"
          />
        </div>

        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-rust">
            {category?.name}
          </span>
          <h1 className="mt-2 font-display text-4xl leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-xl text-ink">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="font-mono text-sm text-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            <span className="font-mono text-xs text-muted">
              ★ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <p className="mt-6 max-w-md font-body text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <AddToCartForm product={product} initialInWishlist={inWishlist} />

          <dl className="mt-10 divide-y divide-line border-t border-line">
            <div className="flex justify-between py-2 font-mono text-xs">
              <dt className="text-muted">SKU</dt>
              <dd className="text-ink-soft">{product.id.toUpperCase()}</dd>
            </div>
            <div className="flex justify-between py-2 font-mono text-xs">
              <dt className="text-muted">Category</dt>
              <dd className="text-ink-soft">{category?.name}</dd>
            </div>
            <div className="flex justify-between py-2 font-mono text-xs">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-ink-soft">Free over ₹500, else ₹70 flat — GST 18% extra</dd>
            </div>
            <div className="flex justify-between py-2 font-mono text-xs">
              <dt className="text-muted">Returns</dt>
              <dd className="text-ink-soft">30 days, no questions</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 border-b border-line pb-4 font-display text-2xl">
            You might also need
          </h2>
          <ProductGrid products={related} />
        </section>
      )}

      <ReviewSection
        productId={product.id}
        productSlug={product.slug}
        reviews={reviews}
        isLoggedIn={!!session}
        alreadyReviewed={alreadyReviewed}
      />
    </div>
  );
}
