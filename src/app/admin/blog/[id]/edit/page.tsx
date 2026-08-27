import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/data";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONTENT</span>
        <h2 className="mt-1 font-display text-3xl">Edit post</h2>
      </div>
      <BlogPostForm post={post} />
    </div>
  );
}
