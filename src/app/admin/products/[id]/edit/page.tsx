import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategories(), getProductById(id)]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
        <h2 className="mt-1 font-display text-3xl">Edit {product.name}</h2>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
