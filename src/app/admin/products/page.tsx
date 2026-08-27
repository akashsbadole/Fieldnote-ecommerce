import Link from "next/link";
import { getProducts, getCategories } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
          <h2 className="mt-1 font-display text-3xl">Products ({products.length})</h2>
        </div>
        <Link href="/admin/products/new" className={buttonVariants({ size: "md" })}>
          Add product
        </Link>
      </div>

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
