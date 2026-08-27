import { PageForm } from "@/components/admin/page-form";

export default function NewPagePage() {
  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONTENT</span>
        <h2 className="mt-1 font-display text-3xl">New page</h2>
      </div>
      <PageForm />
    </div>
  );
}
