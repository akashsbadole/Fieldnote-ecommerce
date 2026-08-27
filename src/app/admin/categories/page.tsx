import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const countFor = (id: string) => products.filter((p) => p.categoryId === id).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
          <h2 className="mt-1 font-display text-3xl">Categories ({categories.length})</h2>
        </div>
        <Link href="/admin/categories/new" className={buttonVariants({ size: "md" })}>
          Add category
        </Link>
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Name</th>
            <th className="pb-2 font-normal">Slug</th>
            <th className="pb-2 font-normal">Products</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="py-3">
                <Link href={`/categories/${c.slug}`} className="hover:text-forest">
                  {c.name}
                </Link>
              </td>
              <td className="py-3 text-muted">/{c.slug}</td>
              <td className="py-3">{countFor(c.id)}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/categories/${c.id}/edit`} className="hover:text-forest">
                    Edit
                  </Link>
                  <DeleteCategoryButton id={c.id} name={c.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
