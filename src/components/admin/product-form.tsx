"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createProductAction, updateProductAction, type ActionResult } from "@/actions/product-actions";
import { Button } from "@/components/ui/button";
import type { Category, Product } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

interface VariantRow {
  label: string;
  stock: number;
  priceDiff: number; // dollars, for display; converted to cents on submit
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  const [variants, setVariants] = useState<VariantRow[]>(
    product && product.variants.length > 0
      ? product.variants.map((v) => ({
          label: v.label,
          stock: v.stock,
          priceDiff: v.priceDiff / 100,
        }))
      : [{ label: "Standard", stock: product?.stock ?? 0, priceDiff: 0 }]
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/admin/products");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  function updateVariant(i: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addVariant() {
    setVariants((rows) => [...rows, { label: "", stock: 0, priceDiff: 0 }]);
  }
  function removeVariant(i: number) {
    setVariants((rows) => rows.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Name</label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Description</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          Image URL <span className="normal-case text-muted/70">(optional — falls back to illustrated art)</span>
        </label>
        <input
          name="imageUrl"
          type="url"
          placeholder="https://…"
          defaultValue={product?.images?.[0]?.url}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Price (USD)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={product ? (product.price / 100).toFixed(2) : undefined}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Compare-at price
          </label>
          <input
            name="comparePrice"
            type="number"
            step="0.01"
            defaultValue={product?.comparePrice ? (product.comparePrice / 100).toFixed(2) : undefined}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Base stock <span className="normal-case text-muted/70">(used if no variants)</span>
          </label>
          <input
            name="stock"
            type="number"
            required
            defaultValue={product?.stock}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Category</label>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} />
        Feature on homepage
      </label>

      <fieldset className="space-y-3 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">
          Variants
        </legend>
        {variants.map((v, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                Label
              </label>
              <input
                value={v.label}
                onChange={(e) => updateVariant(i, { label: e.target.value })}
                placeholder="e.g. Medium / Moss"
                className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
              />
            </div>
            <div className="w-20">
              <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                Stock
              </label>
              <input
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
              />
            </div>
            <div className="w-24">
              <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                +Price
              </label>
              <input
                type="number"
                step="0.01"
                value={v.priceDiff}
                onChange={(e) => updateVariant(i, { priceDiff: Number(e.target.value) })}
                className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
              />
            </div>
            <button
              type="button"
              onClick={() => removeVariant(i)}
              disabled={variants.length <= 1}
              aria-label="Remove variant"
              className="mb-2 cursor-pointer text-muted hover:text-rust disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="flex cursor-pointer items-center gap-1 font-mono text-xs text-forest hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add variant
        </button>
      </fieldset>

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">SEO</legend>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Meta title</label>
          <input
            name="metaTitle"
            defaultValue={product?.metaTitle}
            placeholder={product?.name}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Meta description
          </label>
          <textarea
            name="metaDescription"
            rows={2}
            defaultValue={product?.metaDescription}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
