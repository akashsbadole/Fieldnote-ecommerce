"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateStoreSettingsAction, type ActionResult } from "@/actions/settings-actions";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateStoreSettingsAction, initialState);

  useEffect(() => {
    if (state.success) toast.success(state.message);
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">
          Store details
        </legend>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Store name</label>
          <input
            name="storeName"
            required
            defaultValue={settings.storeName}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">
              Support email
            </label>
            <input
              name="supportEmail"
              type="email"
              required
              defaultValue={settings.supportEmail}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Currency</label>
            <input
              name="currency"
              required
              defaultValue={settings.currency}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Business address
          </label>
          <input
            name="addressLine"
            defaultValue={settings.addressLine}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
          <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} />
          Maintenance mode (hides storefront behind a holding page)
        </label>
      </fieldset>

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">
          Shipping & tax defaults
        </legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">
              Free ship over (USD)
            </label>
            <input
              name="freeShippingThreshold"
              type="number"
              step="0.01"
              required
              defaultValue={(settings.freeShippingThreshold / 100).toFixed(2)}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">
              Standard rate (USD)
            </label>
            <input
              name="flatShippingRate"
              type="number"
              step="0.01"
              required
              defaultValue={(settings.flatShippingRate / 100).toFixed(2)}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">
              Express rate (USD)
            </label>
            <input
              name="expressShippingRate"
              type="number"
              step="0.01"
              required
              defaultValue={(settings.expressShippingRate / 100).toFixed(2)}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Default tax rate (%) — used when no region-specific rate matches
          </label>
          <input
            name="defaultTaxPercent"
            type="number"
            step="0.01"
            required
            defaultValue={settings.defaultTaxPercent}
            className="mt-1 w-40 border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <p className="font-mono text-xs text-muted">
          Manage region-specific rates on the{" "}
          <a href="/admin/settings/tax" className="text-forest hover:underline">
            Tax rates
          </a>{" "}
          page.
        </p>
      </fieldset>

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">
          SEO defaults
        </legend>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Default meta title
          </label>
          <input
            name="metaTitle"
            required
            defaultValue={settings.metaTitle}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Default meta description
          </label>
          <textarea
            name="metaDescription"
            rows={2}
            defaultValue={settings.metaDescription}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border border-line p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-rust">Social</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Instagram</label>
            <input
              name="socialInstagram"
              defaultValue={settings.socialInstagram}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Twitter / X</label>
            <input
              name="socialTwitter"
              defaultValue={settings.socialTwitter}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
