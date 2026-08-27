import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/data";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle || `${post.title} — Fieldnote`,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/blog" className="font-mono text-xs text-muted hover:text-forest">
        ← Field notes
      </Link>
      <p className="mt-6 font-mono text-xs text-muted">
        {new Date(post.createdAt).toLocaleDateString()} · {post.authorName}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight">{post.title}</h1>
      <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-ink-soft">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
