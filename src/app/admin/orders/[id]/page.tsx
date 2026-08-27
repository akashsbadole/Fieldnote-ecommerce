import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, getUserById } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderNotesForm, OrderTrackingForm } from "@/components/admin/order-fulfillment-forms";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const customer = await getUserById(order.userId);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link href="/admin/orders" className="font-mono text-xs text-muted hover:text-forest">
            ← All orders
          </Link>
          <h2 className="mt-1 font-display text-3xl">{order.id.toUpperCase()}</h2>
          <p className="font-mono text-xs text-muted">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={order.id} status={order.status} />
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="font-mono text-xs text-forest hover:underline"
            target="_blank"
          >
            Print invoice →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted">Customer</h3>
          {customer ? (
            <p className="mt-2 text-sm">
              <Link href={`/admin/customers/${customer.id}`} className="hover:text-forest hover:underline">
                {customer.name}
              </Link>
              <br />
              <span className="text-ink-soft">{customer.email}</span>
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-muted">Unknown customer</p>
          )}
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted">Ship to</h3>
          <p className="mt-2 text-sm">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Items</h3>
        <ul className="divide-y divide-line border-y border-line font-mono text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between py-3">
              <span>
                {item.productName} {item.variant && `(${item.variant})`} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 ml-auto max-w-xs space-y-1 font-mono text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between border-t border-line pt-1 text-base"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-line pt-6 sm:grid-cols-2">
        <OrderTrackingForm orderId={order.id} initialTracking={order.trackingNumber} />
        <OrderNotesForm orderId={order.id} initialNotes={order.adminNotes} />
      </div>
    </div>
  );
}
