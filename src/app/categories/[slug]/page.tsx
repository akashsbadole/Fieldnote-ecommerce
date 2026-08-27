import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/products/product-grid";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `${category.name} — Fieldnote` : "Fieldnote" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts({ categorySlug: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-line pb-6">
        <span className="font-mono text-xs tracking-widest text-rust">CATEGORY</span>
        <h1 className="mt-1 font-display text-4xl">{category.name}</h1>
        <p className="mt-2 max-w-lg font-body text-sm text-ink-soft">
          {category.description}
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
