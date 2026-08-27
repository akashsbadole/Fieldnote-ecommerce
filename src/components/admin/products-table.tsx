"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Button } from "@/components/ui/button";
import { bulkDeleteProductsAction, bulkSetFeaturedAction } from "@/actions/product-actions";
import type { Category, Product } from "@/lib/types";

export function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} product(s)? This can't be undone.`)) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkDeleteProductsAction(ids);
      if (res.success) {
        toast.success(res.message);
        setSelected(new Set());
      } else toast.error(res.message);
    });
  }

  function handleBulkFeature(featured: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkSetFeaturedAction(ids, featured);
      if (res.success) {
        toast.success(res.message);
        setSelected(new Set());
      } else toast.error(res.message);
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 border border-forest bg-forest/5 px-4 py-2 font-mono text-xs">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => handleBulkFeature(true)}>
            Feature
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => handleBulkFeature(false)}>
            Unfeature
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={handleBulkDelete}>
            Delete selected
          </Button>
        </div>
      )}

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="w-8 pb-2 font-normal">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
            </th>
            <th className="pb-2 font-normal">Name</th>
            <th className="pb-2 font-normal">Category</th>
            <th className="pb-2 font-normal">Price</th>
            <th className="pb-2 font-normal">Stock</th>
            <th className="pb-2 font-normal">Featured</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="py-3">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleOne(p.id)}
                  aria-label={`Select ${p.name}`}
                />
              </td>
              <td className="py-3">
                <Link href={`/products/${p.slug}`} className="hover:text-forest">
                  {p.name}
                </Link>
              </td>
              <td className="py-3">{catName(p.categoryId)}</td>
              <td className="py-3">{formatPrice(p.price)}</td>
              <td className={`py-3 ${p.stock <= 15 ? "text-rust" : ""}`}>{p.stock}</td>
              <td className="py-3">{p.featured ? "Yes" : "—"}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="hover:text-forest">
                    Edit
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
