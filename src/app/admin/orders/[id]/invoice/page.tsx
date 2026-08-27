import { notFound } from "next/navigation";
import { getOrderById, getUserById } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { PrintButton } from "@/components/admin/print-button";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const customer = await getUserById(order.userId);

  return (
    <div className="mx-auto max-w-2xl bg-paper p-10 text-ink print:p-0">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="font-display text-3xl">Fieldnote</p>
          <p className="font-mono text-xs text-muted">Fieldnote Supply Co. · Portland, OR</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl">Invoice</p>
          <p className="font-mono text-xs text-muted">{order.id.toUpperCase()}</p>
          <p className="font-mono text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8 border-y border-line py-6 font-mono text-xs">
        <div>
          <p className="uppercase tracking-wider text-muted">Bill to</p>
          <p className="mt-2 text-ink">
            {customer?.name}
            <br />
            {customer?.email}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-muted">Ship to</p>
          <p className="mt-2 text-ink">
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

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="pb-2 font-normal">Item</th>
            <th className="pb-2 text-right font-normal">Qty</th>
            <th className="pb-2 text-right font-normal">Price</th>
            <th className="pb-2 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-line">
              <td className="py-2">
                {item.productName}
                {item.variant && <span className="text-muted"> ({item.variant})</span>}
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatPrice(item.price)}</td>
              <td className="py-2 text-right">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-4 max-w-xs space-y-1 font-mono text-xs">
        <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatPrice(order.tax)}</span></div>
        <div className="flex justify-between border-t border-ink pt-2 text-sm font-medium"><span>Total</span><span>{formatPrice(order.total)}</span></div>
      </div>

      {order.trackingNumber && (
        <p className="mt-8 font-mono text-xs text-muted">Tracking: {order.trackingNumber}</p>
      )}

      <p className="mt-12 border-t border-line pt-4 font-mono text-[0.65rem] text-muted">
        Thank you for your order. Questions? [SUPPORT EMAIL]
      </p>
    </div>
  );
}
