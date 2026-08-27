import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-muted",
  PROCESSING: "text-rust",
  SHIPPED: "text-forest",
  DELIVERED: "text-ok",
  CANCELLED: "text-muted line-through",
  REFUNDED: "text-muted",
};

export default async function OrdersPage() {
  const session = await auth();
  const orders = await getOrdersForUser(session!.user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-dashed border-line py-20 text-center">
        <p className="font-display text-xl text-ink-soft">No orders yet.</p>
        <Link href="/products" className={buttonVariants({ size: "md" })}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 border-b border-line pb-3 font-display text-xl">Order history</h2>
      <ul className="divide-y divide-line">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-2 py-4 hover:bg-paper-dim"
            >
              <div>
                <p className="font-mono text-sm">{order.id.toUpperCase()}</p>
                <p className="font-mono text-xs text-muted">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item
                  {order.items.length !== 1 && "s"}
                </p>
              </div>
              <span className={`font-mono text-xs uppercase ${STATUS_COLOR[order.status]}`}>
                {order.status}
              </span>
              <span className="font-mono text-sm">{formatPrice(order.total)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
