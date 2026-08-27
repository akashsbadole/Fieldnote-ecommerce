import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { DeleteBlogPostButton } from "@/components/admin/delete-blog-post-button";

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">CONTENT</span>
          <h2 className="mt-1 font-display text-3xl">Blog ({posts.length})</h2>
        </div>
        <Link href="/admin/blog/new" className={buttonVariants({ size: "md" })}>
          New post
        </Link>
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Title</th>
            <th className="pb-2 font-normal">Author</th>
            <th className="pb-2 font-normal">Status</th>
            <th className="pb-2 font-normal">Updated</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {posts.map((p) => (
            <tr key={p.id}>
              <td className="py-3">
                {p.published ? (
                  <Link href={`/blog/${p.slug}`} className="hover:text-forest">
                    {p.title}
                  </Link>
                ) : (
                  p.title
                )}
              </td>
              <td className="py-3">{p.authorName}</td>
              <td className={`py-3 ${p.published ? "text-forest" : "text-muted"}`}>
                {p.published ? "Published" : "Draft"}
              </td>
              <td className="py-3">{new Date(p.updatedAt).toLocaleDateString()}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/blog/${p.id}/edit`} className="hover:text-forest">
                    Edit
                  </Link>
                  <DeleteBlogPostButton id={p.id} title={p.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
