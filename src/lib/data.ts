import "server-only";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";
import { slugify } from "./utils";
import type {
  Category,
  Product,
  User,
  Address,
  Order,
  OrderItem,
  OrderStatus,
  BlogPost,
  Page,
  TaxRate,
  StoreSettings,
  Role,
  Notification,
  Coupon,
} from "./types";

// =============================================================================
// HOW TO USE THIS FILE
// =============================================================================
// This is the real Postgres-backed implementation of every function in
// data.ts, written against prisma/schema.prisma. It was written and
// schema-checked by hand but NOT compiled or run against a live database —
// the sandbox this project was built in can't reach binaries.prisma.sh to
// download Prisma's engine, so `prisma generate` fails there. It will work
// normally in your environment. To switch over:
//
//   1. In .env, set DATABASE_URL to your Postgres connection string.
//   2. npx prisma generate
//   3. npx prisma migrate dev --name init
//   4. npx prisma db seed          (runs prisma/seed.ts — same demo data
//                                    currently hardcoded in data.ts)
//   5. mv src/lib/data.ts src/lib/data.memory.ts
//   6. mv src/lib/data.db.ts src/lib/data.ts
//   7. npm run build   — fix any type errors the real generated Prisma
//      types surface (there may be small drift; this file was written
//      carefully but unverified — see README "Going to production")
//   8. Manually re-test the flows in the checklist in the README before
//      trusting this in production: register, login, browse, add to cart,
//      checkout, admin product/category/blog/page CRUD, order status
//      update + tracking email, review moderation, tax rate CRUD.
//
// Every function below has the exact same name and signature as its
// data.ts counterpart, so nothing else in the app needs to change.
// =============================================================================

function toUndef<T>(v: T | null | undefined): T | undefined {
  return v === null ? undefined : v;
}

// ---------------------------------------------------------------------------
// Mappers: Prisma row shapes -> app types
// ---------------------------------------------------------------------------

function mapCategory(c: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: toUndef(c.description),
    parentId: c.parentId,
    metaTitle: toUndef(c.metaTitle),
    metaDescription: toUndef(c.metaDescription),
  };
}

type ProductWithRelations = Awaited<ReturnType<typeof prisma.product.findFirstOrThrow<{
  include: { images: true; variants: true };
}>>>;

function mapProduct(p: ProductWithRelations): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    comparePrice: toUndef(p.comparePrice),
    stock: p.stock,
    featured: p.featured,
    categoryId: p.categoryId,
    images: p.images.map((i) => ({ url: i.url, altText: i.altText, isMain: i.isMain })),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      stock: v.stock,
      priceDiff: v.priceDiff,
    })),
    rating: p.rating,
    reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
    metaTitle: toUndef(p.metaTitle),
    metaDescription: toUndef(p.metaDescription),
  };
}

function mapUser(u: {
  id: string;
  email: string | null;
  passwordHash: string | null;
  phone: string | null;
  name: string;
  role: Role;
  blocked: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  loginCount: number;
}): User {
  return {
    id: u.id,
    email: toUndef(u.email),
    passwordHash: toUndef(u.passwordHash),
    phone: toUndef(u.phone),
    name: u.name,
    role: u.role,
    blocked: u.blocked,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : undefined,
    loginCount: u.loginCount,
  };
}

function mapAddress(a: {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}): Address {
  return { ...a };
}

type OrderWithRelations = Awaited<ReturnType<typeof prisma.order.findFirstOrThrow<{
  include: { items: true; shippingAddress: true; billingAddress: true };
}>>>;

function mapOrder(o: OrderWithRelations): Order {
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    subtotal: o.subtotal,
    discount: o.discount,
    couponCode: toUndef(o.couponCode),
    tax: o.tax,
    shipping: o.shipping,
    total: o.total,
    shippingAddress: mapAddress(o.shippingAddress),
    billingAddress: o.billingAddress ? mapAddress(o.billingAddress) : undefined,
    trackingNumber: toUndef(o.trackingNumber),
    adminNotes: toUndef(o.adminNotes),
    items: o.items.map(
      (i): OrderItem => ({
        productId: i.productId,
        productName: i.productName,
        variant: toUndef(i.variant),
        quantity: i.quantity,
        price: i.price,
      })
    ),
    createdAt: o.createdAt.toISOString(),
  };
}

function mapBlogPost(b: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}): BlogPost {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    content: b.content,
    coverImage: toUndef(b.coverImage),
    published: b.published,
    authorName: b.authorName,
    metaTitle: toUndef(b.metaTitle),
    metaDescription: toUndef(b.metaDescription),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

function mapPage(p: {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Page {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    published: p.published,
    metaTitle: toUndef(p.metaTitle),
    metaDescription: toUndef(p.metaDescription),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function mapTaxRate(t: {
  id: string;
  label: string;
  country: string;
  region: string | null;
  ratePercent: number;
  active: boolean;
}): TaxRate {
  return { ...t, region: toUndef(t.region) };
}

function mapStoreSettings(s: {
  storeName: string;
  supportEmail: string;
  currency: string;
  addressLine: string;
  freeShippingThreshold: number;
  flatShippingRate: number;
  expressShippingRate: number;
  defaultTaxPercent: number;
  metaTitle: string;
  metaDescription: string;
  socialInstagram: string | null;
  socialTwitter: string | null;
  maintenanceMode: boolean;
}): StoreSettings {
  return {
    ...s,
    socialInstagram: toUndef(s.socialInstagram),
    socialTwitter: toUndef(s.socialTwitter),
  };
}

const productInclude = { images: true, variants: true } as const;
const orderInclude = { items: true, shippingAddress: true, billingAddress: true } as const;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapCategory);
}

export async function getCategoryBySlug(slug: string) {
  const row = await prisma.category.findUnique({ where: { slug } });
  return row ? mapCategory(row) : null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const row = await prisma.category.findUnique({ where: { id } });
  return row ? mapCategory(row) : null;
}

export async function getProducts(params?: {
  categorySlug?: string;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}): Promise<Product[]> {
  const where: Record<string, unknown> = {};

  if (params?.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  if (params?.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params?.minPrice != null || params?.maxPrice != null) {
    where.price = {
      ...(params.minPrice != null ? { gte: params.minPrice } : {}),
      ...(params.maxPrice != null ? { lte: params.maxPrice } : {}),
    };
  }
  if (params?.minRating != null) {
    where.rating = { gte: params.minRating };
  }

  const orderBy =
    params?.sort === "price-asc"
      ? { price: "asc" as const }
      : params?.sort === "price-desc"
        ? { price: "desc" as const }
        : params?.sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const rows = await prisma.product.findMany({ where, orderBy, include: productInclude });
  return rows.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    include: productInclude,
  });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  return row ? mapProduct(row) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { id }, include: productInclude });
  return row ? mapProduct(row) : null;
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: productInclude,
  });
  return rows.map(mapProduct);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  return row ? mapUser(row) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? mapUser(row) : null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { phone } });
  return row ? mapUser(row) : null;
}

export async function createUserByPhone(input: { phone: string; name?: string }): Promise<User> {
  const row = await prisma.user.create({
    data: {
      phone: input.phone,
      name: input.name ?? "Fieldnote Member",
      role: "CUSTOMER",
    },
  });
  const user = mapUser(row);
  await createNotification({
    userId: user.id,
    type: "welcome",
    title: "Welcome to Fieldnote",
    message: "Your account is set up. Browse the catalog whenever you're ready.",
  });
  return user;
}

export async function recordLogin(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });
  } catch {
    // Swallow — login recording should never block the auth flow itself.
  }
}

export async function updateUserProfile(
  id: string,
  patch: { name?: string; email?: string; phone?: string }
): Promise<User | null> {
  if (patch.email) {
    const existing = await getUserByEmail(patch.email);
    if (existing && existing.id !== id) {
      throw new Error("That email is already in use.");
    }
  }
  if (patch.phone) {
    const existing = await getUserByPhone(patch.phone);
    if (existing && existing.id !== id) {
      throw new Error("That phone number is already in use.");
    }
  }
  try {
    const row = await prisma.user.update({
      where: { id },
      data: {
        ...(patch.name ? { name: patch.name } : {}),
        ...(patch.email ? { email: patch.email } : {}),
        ...(patch.phone ? { phone: patch.phone } : {}),
      },
    });
    return mapUser(row);
  } catch {
    return null;
  }
}

export async function getAddressesForUser(userId: string): Promise<Address[]> {
  const rows = await prisma.address.findMany({ where: { userId } });
  return rows.map(mapAddress);
}

export async function getAddressById(id: string): Promise<Address | null> {
  const row = await prisma.address.findUnique({ where: { id } });
  return row ? mapAddress(row) : null;
}

export async function createAddress(input: Omit<Address, "id">): Promise<Address> {
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId: input.userId }, data: { isDefault: false } });
  }
  const row = await prisma.address.create({ data: input });
  return mapAddress(row);
}

export async function updateAddress(
  id: string,
  userId: string,
  patch: Partial<Omit<Address, "id" | "userId">>
): Promise<Address | null> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return null;
  if (patch.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const row = await prisma.address.update({ where: { id }, data: patch });
  return mapAddress(row);
}

export async function deleteAddress(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.address.delete({ where: { id } });
  return true;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
  return rows.map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  return row ? mapOrder(row) : null;
}

export async function getAllOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
  return rows.map(mapOrder);
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany();
  return rows.map(mapUser);
}

export async function getDashboardStats() {
  const [totalRevenueAgg, pendingOrders, totalOrders, totalCustomers, lowStockRows, outOfStockRows, pendingReviews, recentOrderRows] =
    await Promise.all([
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.findMany({ where: { stock: { gt: 0, lte: 15 } }, include: productInclude }),
      prisma.product.findMany({ where: { stock: 0 }, include: productInclude }),
      prisma.review.count({ where: { approved: false } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: orderInclude }),
    ]);

  return {
    totalRevenue: totalRevenueAgg._sum.total ?? 0,
    totalOrders,
    pendingOrders,
    totalCustomers,
    lowStock: lowStockRows.map(mapProduct),
    outOfStock: outOfStockRows.map(mapProduct),
    pendingReviews,
    recentOrders: recentOrderRows.map(mapOrder),
  };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createUser(input: { email: string; password: string; name: string }): Promise<User> {
  const existing = await getUserByEmail(input.email);
  if (existing) throw new Error("An account with this email already exists.");

  const hash = await bcrypt.hash(input.password, 12);
  const row = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: hash,
      name: input.name,
      role: "CUSTOMER",
    },
  });
  return mapUser(row);
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

async function getEffectiveTaxPercent(
  country: string,
  region?: string | null,
  prismaClient: typeof prisma = prisma
): Promise<number> {
  // Try region-specific GST first (e.g. KA → 18%)
  if (region) {
    const regional = await prismaClient.taxRate.findFirst({
      where: { country, region: region.trim(), active: true },
    });
    if (regional) return regional.ratePercent;
    // Upper/lower case guard
    const regionalCI = await prismaClient.taxRate.findFirst({
      where: { country: { equals: country, mode: "insensitive" }, region: { equals: region.trim(), mode: "insensitive" }, active: true },
    });
    if (regionalCI) return regionalCI.ratePercent;
  }
  const national = await prismaClient.taxRate.findFirst({
    where: { country: { equals: country, mode: "insensitive" }, region: null, active: true },
  });
  if (national) return national.ratePercent;
  // Fallback to India default, else store default
  const indiaDefault = await prismaClient.taxRate.findFirst({
    where: { country: "India", region: null, active: true },
  });
  if (indiaDefault) return indiaDefault.ratePercent;
  const settings = await prismaClient.storeSettings.findUnique({ where: { id: "default" } });
  return settings?.defaultTaxPercent ?? 18;
}

export async function createOrder(input: {
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  couponCode?: string;
  discount?: number;
}): Promise<Order> {
  const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.min(input.discount ?? 0, subtotal);
  const discountedSubtotal = subtotal - discount;
  // Shipping thresholds from StoreSettings (₹500 free, else ₹70) — fallback to hardcoded INR defaults
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const freeThreshold = settings?.freeShippingThreshold ?? 50000;
  const flatRate = settings?.flatShippingRate ?? 7000;
  const shipping = discountedSubtotal >= freeThreshold ? 0 : flatRate;
  const taxPercent = await getEffectiveTaxPercent(input.shippingAddress.country, input.shippingAddress.state);
  const tax = Math.round((discountedSubtotal * taxPercent) / 100);

  const order = await prisma.$transaction(async (tx) => {
    // shippingAddress passed in has a client-generated id that doesn't
    // exist in the DB yet — create it for real first.
    const address = await tx.address.create({
      data: {
        userId: input.shippingAddress.userId,
        fullName: input.shippingAddress.fullName,
        street: input.shippingAddress.street,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        zip: input.shippingAddress.zip,
        country: input.shippingAddress.country,
        isDefault: false,
      },
    });

    let billingAddressId: string | undefined;
    if (input.billingAddress) {
      const billing = await tx.address.create({
        data: {
          userId: input.billingAddress.userId,
          fullName: input.billingAddress.fullName,
          street: input.billingAddress.street,
          city: input.billingAddress.city,
          state: input.billingAddress.state,
          zip: input.billingAddress.zip,
          country: input.billingAddress.country,
          isDefault: false,
        },
      });
      billingAddressId = billing.id;
    }

    const created = await tx.order.create({
      data: {
        userId: input.userId,
        status: "PENDING",
        subtotal,
        discount,
        couponCode: input.couponCode,
        tax,
        shipping,
        total: discountedSubtotal + tax + shipping,
        shippingAddressId: address.id,
        billingAddressId,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            variant: i.variant,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: orderInclude,
    });

    for (const item of input.items) {
      await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (input.couponCode) {
      await tx.coupon.updateMany({
        where: { code: input.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  return mapOrder(order);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<Order | null> {
  try {
    const row = await prisma.order.update({
      where: { id: orderId },
      data: { status, ...(trackingNumber ? { trackingNumber } : {}) },
      include: orderInclude,
    });
    return mapOrder(row);
  } catch {
    return null;
  }
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<Order | null> {
  try {
    const row = await prisma.order.update({
      where: { id: orderId },
      data: { adminNotes: notes },
      include: orderInclude,
    });
    return mapOrder(row);
  } catch {
    return null;
  }
}

export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string
): Promise<Order | null> {
  try {
    const row = await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber },
      include: orderInclude,
    });
    return mapOrder(row);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Categories (admin CRUD)
// ---------------------------------------------------------------------------

export async function createCategory(input: {
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}): Promise<Category> {
  const row = await prisma.category.create({
    data: { ...input, slug: slugify(input.name) },
  });
  return mapCategory(row);
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<Category, "id">>
): Promise<Category | null> {
  try {
    const row = await prisma.category.update({ where: { id }, data: patch });
    return mapCategory(row);
  } catch {
    return null;
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const inUse = await prisma.product.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return { success: false, message: "Move or delete products in this category first." };
  }
  try {
    await prisma.category.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, message: "Category not found." };
  }
}

// ---------------------------------------------------------------------------
// Users (admin)
// ---------------------------------------------------------------------------

export async function setUserBlocked(userId: string, blocked: boolean): Promise<User | null> {
  try {
    const row = await prisma.user.update({ where: { id: userId }, data: { blocked } });
    return mapUser(row);
  } catch {
    return null;
  }
}

export async function setUserRole(userId: string, role: Role): Promise<User | null> {
  try {
    const row = await prisma.user.update({ where: { id: userId }, data: { role } });
    return mapUser(row);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function getBlogPosts(params?: { publishedOnly?: boolean }): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: params?.publishedOnly ? { published: true } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? mapBlogPost(row) : null;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { id } });
  return row ? mapBlogPost(row) : null;
}

export async function createBlogPost(input: {
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
}): Promise<BlogPost> {
  const row = await prisma.blogPost.create({
    data: { ...input, slug: slugify(input.title) },
  });
  return mapBlogPost(row);
}

export async function updateBlogPost(
  id: string,
  patch: Partial<Omit<BlogPost, "id" | "createdAt">>
): Promise<BlogPost | null> {
  try {
    const row = await prisma.blogPost.update({ where: { id }, data: patch });
    return mapBlogPost(row);
  } catch {
    return null;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    await prisma.blogPost.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Pages (CMS)
// ---------------------------------------------------------------------------

export async function getPages(params?: { publishedOnly?: boolean }): Promise<Page[]> {
  const rows = await prisma.page.findMany({
    where: params?.publishedOnly ? { published: true } : undefined,
    orderBy: { title: "asc" },
  });
  return rows.map(mapPage);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const row = await prisma.page.findUnique({ where: { slug } });
  return row ? mapPage(row) : null;
}

export async function getPageById(id: string): Promise<Page | null> {
  const row = await prisma.page.findUnique({ where: { id } });
  return row ? mapPage(row) : null;
}

export async function createPage(input: {
  title: string;
  content: string;
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
}): Promise<Page> {
  const row = await prisma.page.create({ data: { ...input, slug: slugify(input.title) } });
  return mapPage(row);
}

export async function updatePage(
  id: string,
  patch: Partial<Omit<Page, "id" | "createdAt">>
): Promise<Page | null> {
  try {
    const row = await prisma.page.update({ where: { id }, data: patch });
    return mapPage(row);
  } catch {
    return null;
  }
}

export async function deletePage(id: string): Promise<boolean> {
  try {
    await prisma.page.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tax rates
// ---------------------------------------------------------------------------

export async function getTaxRates(): Promise<TaxRate[]> {
  const rows = await prisma.taxRate.findMany({ orderBy: { label: "asc" } });
  return rows.map(mapTaxRate);
}

export async function createTaxRate(input: Omit<TaxRate, "id">): Promise<TaxRate> {
  const row = await prisma.taxRate.create({ data: input });
  return mapTaxRate(row);
}

export async function updateTaxRate(
  id: string,
  patch: Partial<Omit<TaxRate, "id">>
): Promise<TaxRate | null> {
  try {
    const row = await prisma.taxRate.update({ where: { id }, data: patch });
    return mapTaxRate(row);
  } catch {
    return null;
  }
}

export async function deleteTaxRate(id: string): Promise<boolean> {
  try {
    await prisma.taxRate.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

function mapCoupon(c: {
  id: string;
  code: string;
  type: string;
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
}): Coupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type as Coupon["type"],
    value: c.value,
    minSubtotal: toUndef(c.minSubtotal),
    maxUses: toUndef(c.maxUses),
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
  };
}

export async function getCoupons(): Promise<Coupon[]> {
  const rows = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return rows.map(mapCoupon);
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const row = await prisma.coupon.findFirst({
    where: { code: { equals: code.trim(), mode: "insensitive" } },
  });
  return row ? mapCoupon(row) : null;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discount?: number;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { valid: false, message: "That code isn't valid." };
  if (!coupon.active) return { valid: false, message: "That code has expired." };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "That code has expired." };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: "That code has reached its usage limit." };
  }
  if (coupon.minSubtotal != null && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      message: `Add ${((coupon.minSubtotal - subtotal) / 100).toFixed(2)} more to use this code.`,
    };
  }

  const discount =
    coupon.type === "percent"
      ? Math.round(subtotal * (coupon.value / 100))
      : Math.min(coupon.value, subtotal);

  return { valid: true, coupon, discount };
}

export async function incrementCouponUse(code: string): Promise<void> {
  await prisma.coupon.updateMany({
    where: { code: { equals: code.trim(), mode: "insensitive" } },
    data: { usedCount: { increment: 1 } },
  });
}

export async function createCoupon(input: Omit<Coupon, "id" | "usedCount">): Promise<Coupon> {
  const row = await prisma.coupon.create({
    data: {
      code: input.code,
      type: input.type,
      value: input.value,
      minSubtotal: input.minSubtotal,
      maxUses: input.maxUses,
      active: input.active,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  });
  return mapCoupon(row);
}

export async function updateCoupon(
  id: string,
  patch: Partial<Omit<Coupon, "id">>
): Promise<Coupon | null> {
  try {
    const row = await prisma.coupon.update({
      where: { id },
      data: {
        ...patch,
        expiresAt: patch.expiresAt ? new Date(patch.expiresAt) : undefined,
      },
    });
    return mapCoupon(row);
  } catch {
    return null;
  }
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    await prisma.coupon.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

function mapNotification(n: {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}): Notification {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as Notification["type"],
    title: n.title,
    message: n.message,
    link: toUndef(n.link),
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function createNotification(input: {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
  link?: string;
}): Promise<Notification> {
  const row = await prisma.notification.create({ data: input });
  return mapNotification(row);
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map(mapNotification);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}

// ---------------------------------------------------------------------------
// Mobile OTP login
// ---------------------------------------------------------------------------

function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function issueOtp(phone: string): Promise<string> {
  const code = generateOtpCode();
  await prisma.otpCode.upsert({
    where: { phone },
    update: { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 },
    create: { phone, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 },
  });
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const entry = await prisma.otpCode.findUnique({ where: { phone } });
  if (!entry) return false;
  if (entry.expiresAt.getTime() < Date.now()) {
    await prisma.otpCode.delete({ where: { phone } }).catch(() => {});
    return false;
  }
  if (entry.attempts >= 5) {
    await prisma.otpCode.delete({ where: { phone } }).catch(() => {});
    return false;
  }
  await prisma.otpCode.update({ where: { phone }, data: { attempts: { increment: 1 } } });

  const valid = entry.code === code;
  if (valid) await prisma.otpCode.delete({ where: { phone } }).catch(() => {});
  return valid;
}

// ---------------------------------------------------------------------------
// Store settings (single row, id = "default")
// ---------------------------------------------------------------------------

export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return mapStoreSettings(row);
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const row = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: patch,
    create: { id: "default", ...patch },
  });
  return mapStoreSettings(row);
}

// ---------------------------------------------------------------------------
// Products (admin CRUD)
// ---------------------------------------------------------------------------

export async function createProduct(
  input: Omit<Product, "id" | "rating" | "reviewCount" | "createdAt">
): Promise<Product> {
  const row = await prisma.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      price: input.price,
      comparePrice: input.comparePrice ?? null,
      stock: input.stock,
      featured: input.featured,
      categoryId: input.categoryId,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      images: { create: input.images },
      variants: {
      create: input.variants.map((v) => ({
        label: v.label,
        stock: v.stock,
        priceDiff: v.priceDiff,
      })),
    },
    },
    include: productInclude,
  });
  return mapProduct(row);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  const scalarPatch: Record<string, unknown> = { ...patch };
  delete scalarPatch.images;
  delete scalarPatch.variants;
  delete scalarPatch.id;
  delete scalarPatch.createdAt;
  try {
    const row = await prisma.product.update({
      where: { id },
      data: scalarPatch,
      include: productInclude,
    });
    return mapProduct(row);
  } catch {
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export async function getWishlistForUser(userId: string): Promise<Product[]> {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    include: { product: { include: productInclude } },
  });
  return rows.map((w) => mapProduct(w.product));
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const row = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return !!row;
}

export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<{ inWishlist: boolean }> {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return { inWishlist: false };
  }
  await prisma.wishlist.create({ data: { userId, productId } });
  return { inWishlist: true };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

function mapReview(r: {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date;
}): import("./types").Review {
  return {
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    productId: r.productId,
    rating: r.rating,
    comment: r.comment,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
  };
}

async function recalcProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

export async function getReviewsForProduct(productId: string) {
  const rows = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapReview);
}

export async function createReview(input: {
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  const review = await prisma.review.create({ data: { ...input, approved: true } });
  await recalcProductRating(input.productId);
  return mapReview(review);
}

export async function hasUserReviewed(userId: string, productId: string): Promise<boolean> {
  const row = await prisma.review.findFirst({ where: { userId, productId } });
  return !!row;
}

export async function getAllReviews() {
  const rows = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapReview);
}

export async function setReviewApproved(reviewId: string, approved: boolean) {
  try {
    const review = await prisma.review.update({ where: { id: reviewId }, data: { approved } });
    await recalcProductRating(review.productId);
    return mapReview(review);
  } catch {
    return null;
  }
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const review = await prisma.review.delete({ where: { id: reviewId } });
    await recalcProductRating(review.productId);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createResetToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  const token = `${userId}.${raw}`;
  const hashed = hashToken(token);
  await prisma.passwordResetToken.create({
    data: { token: hashed, userId, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });
  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const hashed = hashToken(token);
  const entry = await prisma.passwordResetToken.findUnique({ where: { token: hashed } });
  if (!entry) return null;
  await prisma.passwordResetToken.delete({ where: { token: hashed } });
  if (entry.expiresAt.getTime() < Date.now()) return null;
  return entry.userId;
}

export async function setUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    return true;
  } catch {
    return false;
  }
}
