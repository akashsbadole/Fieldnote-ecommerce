import Link from "next/link";
import { getAllOrders, getAllUsers } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderSearchInput } from "@/components/admin/order-search-input";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [allOrders, users] = await Promise.all([getAllOrders(), getAllUsers()]);
  const customerName = (userId: string) =>
    users.find((u) => u.id === userId)?.name ?? "Unknown";
  const customerEmail = (userId: string) =>
    users.find((u) => u.id === userId)?.email ?? "";

  const orders = q
    ? allOrders.filter((o) => {
        const needle = q.toLowerCase();
        return (
          o.id.toLowerCase().includes(needle) ||
          customerName(o.userId).toLowerCase().includes(needle) ||
          customerEmail(o.userId).toLowerCase().includes(needle)
        );
      })
    : allOrders;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">FULFILLMENT</span>
          <h2 className="mt-1 font-display text-3xl">Orders ({orders.length})</h2>
        </div>
        <OrderSearchInput defaultValue={q} />
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Order</th>
            <th className="pb-2 font-normal">Customer</th>
            <th className="pb-2 font-normal">Date</th>
            <th className="pb-2 font-normal">Total</th>
            <th className="pb-2 font-normal">Status</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="py-3">
                <Link href={`/admin/orders/${o.id}`} className="hover:text-forest">
                  {o.id.toUpperCase()}
                </Link>
              </td>
              <td className="py-3">{customerName(o.userId)}</td>
              <td className="py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
              <td className="py-3">{formatPrice(o.total)}</td>
              <td className="py-3">
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </td>
              <td className="py-3">
                <Link href={`/admin/orders/${o.id}`} className="text-forest hover:underline">
                  Details →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="py-8 text-center font-mono text-xs text-muted">No orders match &quot;{q}&quot;.</p>
      )}
    </div>
  );
}
