import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/data";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
        <h2 className="mt-1 font-display text-3xl">Edit {category.name}</h2>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
