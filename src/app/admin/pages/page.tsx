import Link from "next/link";
import { getPages } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { DeletePageButton } from "@/components/admin/delete-page-button";

export default async function AdminPagesPage() {
  const pages = await getPages();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">CONTENT</span>
          <h2 className="mt-1 font-display text-3xl">Pages ({pages.length})</h2>
        </div>
        <Link href="/admin/pages/new" className={buttonVariants({ size: "md" })}>
          New page
        </Link>
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Title</th>
            <th className="pb-2 font-normal">URL</th>
            <th className="pb-2 font-normal">Status</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {pages.map((p) => (
            <tr key={p.id}>
              <td className="py-3">{p.title}</td>
              <td className="py-3 text-muted">/p/{p.slug}</td>
              <td className={`py-3 ${p.published ? "text-forest" : "text-muted"}`}>
                {p.published ? "Published" : "Draft"}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/pages/${p.id}/edit`} className="hover:text-forest">
                    Edit
                  </Link>
                  <DeletePageButton id={p.id} title={p.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
