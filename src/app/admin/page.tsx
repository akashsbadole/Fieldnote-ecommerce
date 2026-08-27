import Link from "next/link";
import { getDashboardStats, getAllOrders } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getDashboardStats(), getAllOrders()]);

  // Last 14 days of revenue, grouped by day (in dollars, for chart display).
  const days: { date: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayRevenue = orders
      .filter((o) => o.createdAt.slice(0, 10) === key && o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);
    days.push({ date: label, revenue: dayRevenue / 100 });
  }

  return (
    <div className="space-y-10">
      <div>
        <span className="font-mono text-xs tracking-widest text-rust">OVERVIEW</span>
        <h2 className="mt-1 font-display text-3xl">Store dashboard</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total revenue" value={formatPrice(stats.totalRevenue)} />
        <StatCard label="Total orders" value={String(stats.totalOrders)} sub={`${stats.pendingOrders} pending`} />
        <StatCard label="Customers" value={String(stats.totalCustomers)} />
        <StatCard label="Low stock" value={String(stats.lowStock.length)} sub="≤ 15 units" accent={stats.lowStock.length > 0} />
        <Link href="/admin/reviews">
          <StatCard
            label="Reviews to review"
            value={String(stats.pendingReviews)}
            sub={stats.pendingReviews > 0 ? "needs moderation" : "all clear"}
            accent={stats.pendingReviews > 0}
          />
        </Link>
      </div>

      <div>
        <h3 className="mb-3 border-b border-line pb-2 font-display text-xl">Revenue, last 14 days</h3>
        <RevenueChart data={days} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
          <h3 className="font-display text-xl">Recent orders</h3>
          <Link href="/admin/orders" className="font-mono text-xs text-forest hover:underline">
            View all →
          </Link>
        </div>
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-muted">
              <th className="pb-2 font-normal">Order</th>
              <th className="pb-2 font-normal">Status</th>
              <th className="pb-2 font-normal">Total</th>
              <th className="pb-2 font-normal">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {stats.recentOrders.map((o) => (
              <tr key={o.id}>
                <td className="py-3">
                  <Link href={`/admin/orders`} className="hover:text-forest">
                    {o.id.toUpperCase()}
                  </Link>
                </td>
                <td className="py-3">{o.status}</td>
                <td className="py-3">{formatPrice(o.total)}</td>
                <td className="py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.lowStock.length > 0 && (
        <div>
          <h3 className="mb-3 border-b border-line pb-2 font-display text-xl">Low stock alerts</h3>
          <ul className="divide-y divide-line font-mono text-xs">
            {stats.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{p.name}</span>
                <span className="text-rust">{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-line p-4 transition-colors hover:border-forest">
      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? "text-rust" : "text-ink"}`}>{value}</p>
      {sub && <p className="font-mono text-[0.65rem] text-muted">{sub}</p>}
    </div>
  );
}
