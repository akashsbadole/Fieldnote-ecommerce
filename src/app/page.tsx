import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/lib/data";
import { ProductCard } from "@/components/products/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero — a field-journal entry, not a banner */}
      <section className="paper-texture border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div className="flex flex-col justify-center">
            <span className="font-mono text-xs tracking-widest text-rust">
              ENTRY 47°36&apos;N 122°19&apos;W — AUG 08
            </span>
            <h1 className="mt-4 font-display text-5xl italic leading-[1.05] text-ink md:text-6xl">
              Gear that earns
              <br />
              its weight.
            </h1>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-ink-soft">
              No seasonal drops, no seven colorways of the same jacket.
              Fieldnote makes a small, honest catalog of packs, outerwear
              and tools — tested outside, repaired instead of replaced.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/products" className={buttonVariants({ variant: "rust", size: "lg" })}>
                Shop the catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Our approach
              </Link>
            </div>
          </div>

          <div className="stitched relative flex flex-col justify-between bg-forest p-8 text-sand-light">
            <span className="font-mono text-xs tracking-widest text-sand">
              FIELD LOG
            </span>
            <dl className="mt-8 space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-sand/20 pb-2">
                <dt>Products in catalog</dt>
                <dd>{categories.length * 3}</dd>
              </div>
              <div className="flex justify-between border-b border-sand/20 pb-2">
                <dt>Categories</dt>
                <dd>{categories.length}</dd>
              </div>
              <div className="flex justify-between border-b border-sand/20 pb-2">
                <dt>Repair program</dt>
                <dd>lifetime</dd>
              </div>
              <div className="flex justify-between pb-2">
                <dt>Ships from</dt>
                <dd>Portland, OR</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-center justify-between border border-line px-6 py-8 transition-colors hover:border-forest"
            >
              <div>
                <h3 className="font-display text-2xl text-ink group-hover:text-forest">
                  {cat.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-muted">{cat.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-forest" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
          <div>
            <span className="font-mono text-xs tracking-widest text-rust">
              CURRENTLY ISSUED
            </span>
            <h2 className="mt-1 font-display text-3xl">Featured gear</h2>
          </div>
          <Link
            href="/products"
            className="hidden font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-forest sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className={cn("border-t border-line bg-paper-dim")}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 text-center sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="font-display text-xl">Free shipping over $100</p>
            <p className="mt-1 font-mono text-xs text-muted">flat $7 under that</p>
          </div>
          <div>
            <p className="font-display text-xl">Lifetime repair program</p>
            <p className="mt-1 font-mono text-xs text-muted">we fix what we sell</p>
          </div>
          <div>
            <p className="font-display text-xl">30-day returns</p>
            <p className="mt-1 font-mono text-xs text-muted">worn it once? still fine</p>
          </div>
        </div>
      </section>
    </div>
  );
}
