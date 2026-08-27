import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById, getOrdersForUser, getAddressesForUser } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { BlockUserButton } from "@/components/admin/block-user-button";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [customer, orders, addresses] = await Promise.all([
    getUserById(id),
    getOrdersForUser(id),
    getAddressesForUser(id),
  ]);
  if (!customer) notFound();
  const isSelf = customer.id === session?.user.id;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/customers" className="font-mono text-xs text-muted hover:text-forest">
          ← All customers
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-3xl">{customer.name}</h2>
            <p className="font-mono text-xs text-muted">{customer.email || customer.phone || "—"}</p>
          </div>
          {!isSelf && (
            <div className="flex items-center gap-3">
              <UserRoleSelect userId={customer.id} role={customer.role} />
              <BlockUserButton userId={customer.id} blocked={customer.blocked} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border border-line p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Orders</p>
          <p className="mt-1 font-display text-2xl">{orders.length}</p>
        </div>
        <div className="border border-line p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Lifetime spend</p>
          <p className="mt-1 font-display text-2xl">
            {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
          </p>
        </div>
        <div className="border border-line p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Status</p>
          <p className={`mt-1 font-display text-2xl ${customer.blocked ? "text-rust" : "text-forest"}`}>
            {customer.blocked ? "Blocked" : "Active"}
          </p>
        </div>
        <div className="border border-line p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Last login</p>
          <p className="mt-1 font-display text-2xl">
            {customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString() : "Never"}
          </p>
          <p className="font-mono text-[0.65rem] text-muted">
            {customer.loginCount ?? 0} total login{(customer.loginCount ?? 0) !== 1 && "s"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 border-b border-line pb-2 font-display text-xl">Order history</h3>
        {orders.length === 0 ? (
          <p className="font-mono text-xs text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-line font-mono text-xs">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between py-3">
                <Link href={`/admin/orders/${o.id}`} className="hover:text-forest hover:underline">
                  {o.id.toUpperCase()}
                </Link>
                <span>{o.status}</span>
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <span>{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-3 border-b border-line pb-2 font-display text-xl">Saved addresses</h3>
        {addresses.length === 0 ? (
          <p className="font-mono text-xs text-muted">No saved addresses.</p>
        ) : (
          <ul className="space-y-2">
            {addresses.map((a) => (
              <li key={a.id} className="border border-line p-3 font-mono text-xs">
                {a.fullName} — {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                {a.isDefault && <span className="ml-2 text-forest">(default)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
