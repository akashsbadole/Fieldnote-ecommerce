import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CATALOG</span>
        <h2 className="mt-1 font-display text-3xl">Add category</h2>
      </div>
      <CategoryForm />
    </div>
  );
}
