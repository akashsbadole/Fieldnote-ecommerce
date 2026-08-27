import { getCoupons } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { CouponRowControls } from "@/components/admin/coupon-row-controls";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONFIGURATION</span>
        <h2 className="mt-1 font-display text-3xl">Coupons ({coupons.length})</h2>
        <p className="mt-1 font-mono text-xs text-muted">
          Customers enter a code at checkout — discount comes off the
          subtotal before shipping and tax are calculated.
        </p>
      </div>

      <div className="mb-8">
        <NewCouponForm />
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Code</th>
            <th className="pb-2 font-normal">Discount</th>
            <th className="pb-2 font-normal">Min order</th>
            <th className="pb-2 font-normal">Uses</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {coupons.map((c) => (
            <tr key={c.id}>
              <td className="py-3 text-ink">{c.code}</td>
              <td className="py-3">{c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}</td>
              <td className="py-3">{c.minSubtotal ? formatPrice(c.minSubtotal) : "—"}</td>
              <td className="py-3">
                {c.usedCount}
                {c.maxUses ? ` / ${c.maxUses}` : ""}
              </td>
              <td className="py-3">
                <CouponRowControls
                  id={c.id}
                  active={c.active}
                  code={c.code}
                  type={c.type}
                  value={c.value}
                  minSubtotal={c.minSubtotal}
                  maxUses={c.maxUses}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
