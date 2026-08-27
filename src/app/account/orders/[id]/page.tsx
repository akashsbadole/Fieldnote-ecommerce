import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { OrderActions } from "@/components/account/order-actions";
import type { OrderStatus } from "@/lib/types";

const TIMELINE: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const session = await auth();
  const order = await getOrderById(id);

  if (!order || order.userId !== session!.user.id) notFound();

  const currentIdx = TIMELINE.indexOf(order.status);
  const isTerminalOther = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="space-y-8">
      {placed === "1" && (
        <div className="border border-forest bg-forest/5 px-4 py-3 font-mono text-xs text-forest">
          Order confirmed — a receipt has been &quot;emailed&quot; to {session!.user.email}.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="font-mono text-xs tracking-widest text-rust">ORDER</span>
          <h1 className="mt-1 font-display text-3xl">{order.id.toUpperCase()}</h1>
          <p className="font-mono text-xs text-muted">
            Placed {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <OrderActions order={order} />
      </div>

      {!isTerminalOther ? (
        <div className="flex items-center">
          {TIMELINE.map((status, i) => (
            <div key={status} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    i <= currentIdx ? "bg-forest" : "bg-line"
                  }`}
                />
                <span
                  className={`font-mono text-[0.65rem] uppercase ${
                    i <= currentIdx ? "text-forest" : "text-muted"
                  }`}
                >
                  {status}
                </span>
              </div>
              {i < TIMELINE.length - 1 && (
                <div className={`mx-2 h-px flex-1 ${i < currentIdx ? "bg-forest" : "bg-line"}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm uppercase text-rust">{order.status}</p>
      )}

      {order.trackingNumber && (
        <p className="font-mono text-xs text-muted">
          Tracking number: <span className="text-ink">{order.trackingNumber}</span>
        </p>
      )}

      <div>
        <h2 className="mb-3 border-b border-line pb-2 font-display text-xl">Items</h2>
        <ul className="divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between py-3 font-mono text-sm">
              <span>
                {item.productName} {item.variant && `(${item.variant})`} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
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
          {order.billingAddress && (
            <>
              <h3 className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">Bill to</h3>
              <p className="mt-2 text-sm">
                {order.billingAddress.fullName}
                <br />
                {order.billingAddress.street}
                <br />
                {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}
                <br />
                {order.billingAddress.country}
              </p>
            </>
          )}
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted">Totals</h3>
          <div className="mt-2 space-y-1 font-mono text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-forest">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between border-t border-line pt-1 text-base"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
