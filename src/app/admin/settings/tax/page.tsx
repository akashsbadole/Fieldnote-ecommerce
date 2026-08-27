import Link from "next/link";
import { getTaxRates } from "@/lib/data";
import { NewTaxRateForm } from "@/components/admin/new-tax-rate-form";
import { TaxRateRowControls } from "@/components/admin/tax-rate-row-controls";

export default async function AdminTaxRatesPage() {
  const rates = await getTaxRates();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONFIGURATION</span>
        <h2 className="mt-1 font-display text-3xl">Tax rates</h2>
        <p className="mt-1 font-mono text-xs text-muted">
          Region-specific rates take priority over the{" "}
          <Link href="/admin/settings" className="text-forest hover:underline">
            store default
          </Link>{" "}
          at checkout.
        </p>
      </div>

      <div className="mb-8">
        <NewTaxRateForm />
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Label</th>
            <th className="pb-2 font-normal">Country</th>
            <th className="pb-2 font-normal">Region</th>
            <th className="pb-2 font-normal">Rate</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rates.map((r) => (
            <tr key={r.id}>
              <td className="py-3">{r.label}</td>
              <td className="py-3">{r.country}</td>
              <td className="py-3">{r.region || "—"}</td>
              <td className="py-3">{r.ratePercent}%</td>
              <td className="py-3">
                <TaxRateRowControls id={r.id} active={r.active} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
