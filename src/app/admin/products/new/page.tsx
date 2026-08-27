import { getCategories } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
        <h2 className="mt-1 font-display text-3xl">Add product</h2>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
