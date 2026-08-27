import Link from "next/link";
import { getBlogPosts } from "@/lib/data";

export const metadata = { title: "Field Notes — Fieldnote Blog" };

export default async function BlogIndexPage() {
  const posts = await getBlogPosts({ publishedOnly: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">FIELD NOTES</span>
      <h1 className="mt-2 font-display text-4xl">From the journal</h1>

      <div className="mt-10 divide-y divide-line border-t border-line">
        {posts.length === 0 && (
          <p className="py-10 font-mono text-sm text-muted">No posts published yet.</p>
        )}
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block py-8 group">
            <p className="font-mono text-xs text-muted">
              {new Date(post.createdAt).toLocaleDateString()} · {post.authorName}
            </p>
            <h2 className="mt-2 font-display text-2xl group-hover:text-forest">{post.title}</h2>
            <p className="mt-2 font-body text-sm text-ink-soft">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
