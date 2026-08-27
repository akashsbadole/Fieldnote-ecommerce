import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONTENT</span>
        <h2 className="mt-1 font-display text-3xl">New post</h2>
      </div>
      <BlogPostForm />
    </div>
  );
}
