import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForUser, getAddressesForUser } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [orders, addresses] = await Promise.all([
    getOrdersForUser(userId),
    getAddressesForUser(userId),
  ]);

  return (
    <div className="space-y-8">
      <div className="border border-line p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">Signed in as</p>
        <p className="mt-1 font-display text-xl">{session!.user.name}</p>
        <p className="font-mono text-xs text-muted">{session!.user.email || session!.user.phone}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border border-line p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">Orders placed</p>
          <p className="mt-1 font-display text-3xl">{orders.length}</p>
        </div>
        <div className="border border-line p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">Saved addresses</p>
          <p className="mt-1 font-display text-3xl">{addresses.length}</p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-display text-xl">Recent orders</h2>
          <Link href="/account/orders" className="font-mono text-xs text-forest hover:underline">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="font-mono text-sm text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {orders.slice(0, 3).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between py-3 hover:text-forest"
                >
                  <span className="font-mono text-sm">{o.id.toUpperCase()}</span>
                  <span className="font-mono text-xs text-muted">{o.status}</span>
                  <span className="font-mono text-sm">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
