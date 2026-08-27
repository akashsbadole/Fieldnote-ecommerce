"use server";

import { auth } from "@/lib/auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  updateOrderNotes,
  updateOrderTracking,
  getUserById,
  getProductById,
  createNotification,
} from "@/lib/data";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { orderStatusUpdateEmail } from "@/lib/email-templates";
import type { OrderStatus } from "@/lib/types";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }
  return session;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function createProductAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    comparePrice: formData.get("comparePrice") || undefined,
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    variantsJson: formData.get("variantsJson") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const data = parsed.data;
  const variants = parseVariants(data.variantsJson, data.stock);

  await createProduct({
    slug: slugify(data.name),
    name: data.name,
    description: data.description,
    price: Math.round(data.price * 100),
    comparePrice: data.comparePrice ? Math.round(data.comparePrice * 100) : null,
    stock: data.stock,
    featured: !!data.featured,
    categoryId: data.categoryId,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    images: [{ url: data.imageUrl ?? "", altText: data.name, isMain: true }],
    variants,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, message: "Product created." };
}

function parseVariants(
  json: string | undefined,
  fallbackStock: number
): { id: string; label: string; stock: number; priceDiff: number }[] {
  if (!json) return [{ id: "default", label: "Standard", stock: fallbackStock, priceDiff: 0 }];
  try {
    const parsed = JSON.parse(json) as { label: string; stock: number; priceDiff: number }[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [{ id: "default", label: "Standard", stock: fallbackStock, priceDiff: 0 }];
    }
    return parsed.map((v, i) => ({
      id: `v${i}_${Date.now()}`,
      label: v.label || `Option ${i + 1}`,
      stock: Number(v.stock) || 0,
      priceDiff: Math.round((Number(v.priceDiff) || 0) * 100),
    }));
  } catch {
    return [{ id: "default", label: "Standard", stock: fallbackStock, priceDiff: 0 }];
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, message: "Product deleted." };
}

export async function updateStockAction(id: string, stock: number): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  await updateProduct(id, { stock });
  revalidatePath("/admin/products");
  return { success: true, message: "Stock updated." };
}

export async function bulkDeleteProductsAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  for (const id of ids) {
    await deleteProduct(id);
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, message: `${ids.length} product${ids.length === 1 ? "" : "s"} deleted.` };
}

export async function bulkSetFeaturedAction(ids: string[], featured: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  for (const id of ids) {
    await updateProduct(id, { featured });
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return {
    success: true,
    message: `${ids.length} product${ids.length === 1 ? "" : "s"} ${featured ? "featured" : "unfeatured"}.`,
  };
}

export async function updateProductAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const existing = await getProductById(id);
  if (!existing) {
    return { success: false, message: "Product not found." };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    comparePrice: formData.get("comparePrice") || undefined,
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    variantsJson: formData.get("variantsJson") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const data = parsed.data;
  const variants = parseVariants(data.variantsJson, data.stock);

  await updateProduct(id, {
    name: data.name,
    description: data.description,
    price: Math.round(data.price * 100),
    comparePrice: data.comparePrice ? Math.round(data.comparePrice * 100) : null,
    stock: data.stock,
    featured: !!data.featured,
    categoryId: data.categoryId,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    images: [{ url: data.imageUrl ?? "", altText: data.name, isMain: true }],
    variants,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${existing.slug}`);
  return { success: true, message: "Product updated." };
}

export async function updateOrderNotesAction(orderId: string, notes: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  await updateOrderNotes(orderId, notes);
  revalidatePath("/admin/orders");
  return { success: true, message: "Notes saved." };
}

export async function updateOrderTrackingAction(
  orderId: string,
  trackingNumber: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const order = await updateOrderTracking(orderId, trackingNumber);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  if (order) {
    const user = await getUserById(order.userId);
    if (user) {
      if (user.email) {
        sendEmail({
          to: user.email,
          subject: `Tracking added for order ${order.id.toUpperCase()}`,
          html: orderStatusUpdateEmail(order, user.name),
        }).catch((err) => console.error("[order-tracking-email] failed", err));
      }
      await createNotification({
        userId: user.id,
        type: "order_tracking",
        title: `Tracking added for order ${order.id.toUpperCase()}`,
        message: `Tracking number: ${trackingNumber}`,
        link: `/account/orders/${order.id}`,
      });
    }
  }

  return { success: true, message: "Tracking number saved and customer notified." };
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }
  const order = await updateOrderStatus(orderId, status, trackingNumber);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  if (order) {
    const user = await getUserById(order.userId);
    if (user) {
      if (user.email) {
        sendEmail({
          to: user.email,
          subject: `Order ${order.id.toUpperCase()} is now ${status}`,
          html: orderStatusUpdateEmail(order, user.name),
        }).catch((err) => console.error("[order-status-email] failed", err));
      }
      await createNotification({
        userId: user.id,
        type: "order_status",
        title: `Order ${order.id.toUpperCase()} is now ${status.toLowerCase()}`,
        message: statusMessage(status),
        link: `/account/orders/${order.id}`,
      });
    }
  }

  return { success: true, message: "Order updated." };
}

function statusMessage(status: OrderStatus): string {
  switch (status) {
    case "PROCESSING":
      return "We're picking and packing it now.";
    case "SHIPPED":
      return "It's on the way.";
    case "DELIVERED":
      return "Marked as delivered — hope it earns its keep.";
    case "CANCELLED":
      return "This order was cancelled.";
    case "REFUNDED":
      return "A refund has been issued.";
    default:
      return "Status updated.";
  }
}
