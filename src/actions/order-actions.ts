"use server";

import { auth } from "@/lib/auth";
import { createOrder, getProductById, getUserById, createNotification, validateCoupon } from "@/lib/data";
import { addressSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/email-templates";
import { checkRateLimit } from "@/lib/rate-limit";
import type { OrderItem, Address } from "@/lib/types";

export interface PlaceOrderInput {
  items: { productId: string; variant?: string; quantity: number }[];
  address: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  couponCode?: string;
  paymentIntentId?: string;
}

export interface PlaceOrderResult {
  success: boolean;
  message: string;
  orderId?: string;
}

export async function placeOrderAction(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "You need to be logged in to check out." };
  }

  // 8 orders per 10 minutes per user — well above any real checkout
  // pattern, blocks scripted order-creation spam.
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `place-order:${session.user.id}`,
    8,
    10 * 60 * 1000
  );
  if (!allowed) {
    return {
      success: false,
      message: `Too many orders placed too quickly. Try again in ${retryAfterSeconds}s.`,
    };
  }

  const addressParsed = addressSchema.safeParse(input.address);
  if (!addressParsed.success) {
    return {
      success: false,
      message: addressParsed.error.issues[0]?.message ?? "Invalid address.",
    };
  }

  if (input.items.length === 0 || input.items.length > 50) {
    return { success: false, message: "Your cart is empty or too large." };
  }
  for (const line of input.items) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 999) {
      return { success: false, message: "Invalid quantity." };
    }
    if (line.variant && line.variant.length > 100) {
      return { success: false, message: "Invalid variant." };
    }
  }

  // If Stripe is configured, require and verify a succeeded PaymentIntent
  // before creating the order — never trust the client on whether payment
  // went through. In demo mode (no Stripe keys set) this check is skipped
  // so the flow still works end-to-end — but block free orders in production.
  if (isStripeConfigured && stripe) {
    if (!input.paymentIntentId) {
      return { success: false, message: "Payment was not completed." };
    }
    const intent = await stripe.paymentIntents.retrieve(input.paymentIntentId);
    if (intent.status !== "succeeded") {
      return { success: false, message: "Payment has not been confirmed yet." };
    }
    if (intent.currency.toLowerCase() !== "inr") {
      return { success: false, message: "Currency mismatch." };
    }
    if (intent.metadata?.userId && intent.metadata.userId !== session.user.id) {
      return { success: false, message: "Payment does not match this account." };
    }
    // Verify amount matches server-calculated total (computed below after orderItems)
  } else if (process.env.NODE_ENV === "production") {
    return { success: false, message: "Payments not configured — cannot place order in production." };
  }

  const orderItems: OrderItem[] = [];
  for (const line of input.items) {
    const product = await getProductById(line.productId);
    if (!product) continue;
    if (product.stock < line.quantity) {
      return {
        success: false,
        message: `${product.name} only has ${product.stock} left in stock.`,
      };
    }
    orderItems.push({
      productId: product.id,
      productName: product.name,
      variant: line.variant,
      quantity: line.quantity,
      price: product.price,
    });
  }
  if (orderItems.length === 0) {
    return { success: false, message: "No valid products in cart." };
  }

  const shippingAddress: Address = {
    id: `addr_${Date.now()}`,
    userId: session.user.id,
    ...addressParsed.data,
    isDefault: false,
  };

  let billingAddress: Address | undefined;
  if (input.billingAddress) {
    const billingParsed = addressSchema.safeParse(input.billingAddress);
    if (!billingParsed.success) {
      return {
        success: false,
        message: billingParsed.error.issues[0]?.message ?? "Invalid billing address.",
      };
    }
    billingAddress = {
      id: `addr_${Date.now()}_billing`,
      userId: session.user.id,
      ...billingParsed.data,
      isDefault: false,
    };
  }

  // Discount is recalculated server-side from the coupon code alone — the
  // client never gets to say how much a coupon is worth.
  let discount = 0;
  if (input.couponCode) {
    const orderSubtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const result = await validateCoupon(input.couponCode, orderSubtotal);
    if (!result.valid) {
      return { success: false, message: result.message ?? "That coupon code is no longer valid." };
    }
    discount = result.discount ?? 0;
  }

  // Re-verify Stripe amount matches server-calculated total (prevents price manipulation)
  if (isStripeConfigured && stripe && input.paymentIntentId) {
    const intentCheck = await stripe.paymentIntents.retrieve(input.paymentIntentId);
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discounted = subtotal - discount;
    // Match createOrder shipping/tax logic (fetch settings for thresholds)
    const { getStoreSettings } = await import("@/lib/data");
    const settings = await getStoreSettings();
    const shipping = discounted >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
    // GST lookup simplified: try to find rate for shipping country, else default
    let taxPercent = settings.defaultTaxPercent;
    try {
      const { prisma } = await import("@/lib/prisma");
      const rate = await prisma.taxRate.findFirst({
        where: { country: addressParsed.data.country, region: addressParsed.data.state, active: true },
      });
      if (rate) taxPercent = rate.ratePercent;
      else {
        const fallback = await prisma.taxRate.findFirst({
          where: { country: addressParsed.data.country, region: null, active: true },
        });
        if (fallback) taxPercent = fallback.ratePercent;
      }
    } catch {}
    const tax = Math.round((discounted * taxPercent) / 100);
    const expectedTotal = discounted + tax + shipping;
    if (intentCheck.amount !== expectedTotal) {
      return { success: false, message: `Payment amount mismatch. Expected ${expectedTotal}, got ${intentCheck.amount}.` };
    }
  }

  const order = await createOrder({
    userId: session.user.id,
    items: orderItems,
    shippingAddress,
    billingAddress,
    couponCode: input.couponCode,
    discount,
  });

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");

  const user = await getUserById(session.user.id);
  if (user) {
    // Fire-and-forget: don't block order confirmation on email delivery.
    if (user.email) {
      sendEmail({
        to: user.email,
        subject: `Order ${order.id.toUpperCase()} confirmed`,
        html: orderConfirmationEmail(order, user.name),
      }).catch((err) => console.error("[order-confirmation-email] failed", err));
    }
    await createNotification({
      userId: user.id,
      type: "order_status",
      title: `Order ${order.id.toUpperCase()} confirmed`,
      message: `We've got it — ${orderItems.length} item${orderItems.length !== 1 ? "s" : ""}, on the way to being packed.`,
      link: `/account/orders/${order.id}`,
    });
  }

  return { success: true, message: "Order placed.", orderId: order.id };
}

export async function cancelOrderAction(orderId: string): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "You need to be logged in." };
  }
  const { getOrderById, updateOrderStatus } = await import("@/lib/data");
  const order = await getOrderById(orderId);
  if (!order || order.userId !== session.user.id) {
    return { success: false, message: "Order not found." };
  }
  if (order.status !== "PENDING") {
    return { success: false, message: "Only pending orders can be cancelled." };
  }
  await updateOrderStatus(orderId, "CANCELLED");
  await createNotification({
    userId: session.user.id,
    type: "order_status",
    title: `Order ${orderId.toUpperCase()} cancelled`,
    message: "Your cancellation went through — no charge will be made.",
    link: `/account/orders/${orderId}`,
  });
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  return { success: true, message: "Order cancelled." };
}
