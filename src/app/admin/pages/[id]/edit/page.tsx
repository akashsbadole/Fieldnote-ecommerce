import { notFound } from "next/navigation";
import { getPageById } from "@/lib/data";
import { PageForm } from "@/components/admin/page-form";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONTENT</span>
        <h2 className="mt-1 font-display text-3xl">Edit page</h2>
      </div>
      <PageForm page={page} />
    </div>
  );
}
