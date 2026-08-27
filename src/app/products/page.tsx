import { getProducts, getCategories } from "@/lib/data";
import { ProductGrid } from "@/components/products/product-grid";
import { PriceRangeFilter } from "@/components/products/price-range-filter";
import { RatingFilter } from "@/components/products/rating-filter";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "All Gear — Fieldnote" };

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
  }>;
}) {
  const params = await searchParams;
  const sort = (params.sort as (typeof SORTS)[number]["value"]) ?? "newest";
  const minPrice = params.minPrice ? Math.round(Number(params.minPrice) * 100) : undefined;
  const maxPrice = params.maxPrice ? Math.round(Number(params.maxPrice) * 100) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;

  const [products, categories] = await Promise.all([
    getProducts({ q: params.q, sort, categorySlug: params.category, minPrice, maxPrice, minRating }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-line pb-6">
        <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
        <h1 className="mt-1 font-display text-4xl">
          {params.q ? `Results for "${params.q}"` : "All gear"}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted">
          {products.length} item{products.length !== 1 && "s"}
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-48">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted">
            Category
          </h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href="/products"
                className={cn(
                  "font-body text-sm",
                  !params.category ? "text-forest font-medium" : "text-ink-soft hover:text-forest"
                )}
              >
                All
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={cn(
                    "font-body text-sm",
                    params.category === cat.slug
                      ? "text-forest font-medium"
                      : "text-ink-soft hover:text-forest"
                  )}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 font-mono text-xs uppercase tracking-wider text-muted">
            Sort by
          </h3>
          <ul className="mt-3 space-y-2">
            {SORTS.map((s) => (
              <li key={s.value}>
                <Link
                  href={`/products?${new URLSearchParams({
                    ...(params.category ? { category: params.category } : {}),
                    ...(params.q ? { q: params.q } : {}),
                    sort: s.value,
                  }).toString()}`}
                  className={cn(
                    "font-body text-sm",
                    sort === s.value ? "text-forest font-medium" : "text-ink-soft hover:text-forest"
                  )}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>

          <PriceRangeFilter defaultMin={params.minPrice} defaultMax={params.maxPrice} />
          <RatingFilter defaultMin={params.minRating} />
        </aside>

        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}