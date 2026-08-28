import "server-only";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
import { slugify } from "./utils";

// ---------------------------------------------------------------------------
// In-memory data store. Shaped to match the Prisma schema 1:1 so this file
// is the only thing that needs to change when a real database is wired up.
// State resets whenever the server process restarts — expected for a demo.
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  { id: "cat_packs", name: "Packs & Bags", slug: "packs", description: "Load carry for trail, city and everywhere between." },
  { id: "cat_outerwear", name: "Outerwear", slug: "outerwear", description: "Shells, insulation and layers built for weather." },
  { id: "cat_tools", name: "Tools & Kit", slug: "tools", description: "The small gear that earns its weight." },
];

export const products: Product[] = [
  {
    id: "p_ridge35",
    slug: "ridge-35-pack",
    name: "Ridge 35 Pack",
    description:
      "A 35-litre haul pack built from 420D recycled ripstop, with a hip belt that actually stays put on a long approach. Roll-top closure, external lash points, one main compartment — no gimmicks.",
    price: 18900,
    comparePrice: 21900,
    stock: 24,
    featured: true,
    categoryId: "cat_packs",
    images: [{ url: "", altText: "Ridge 35 Pack", isMain: true }],
    variants: [
      { id: "v1", label: "Moss", stock: 12, priceDiff: 0 },
      { id: "v2", label: "Slate", stock: 12, priceDiff: 0 },
    ],
    rating: 4.7,
    reviewCount: 132,
    createdAt: "2026-05-02",
  },
  {
    id: "p_switchback",
    slug: "switchback-hip-pack",
    name: "Switchback Hip Pack",
    description:
      "A 4-litre hip pack for the stuff you need without breaking stride: phone, map, snacks, first aid. Dual zip access, water-resistant coated zippers.",
    price: 5400,
    stock: 41,
    featured: false,
    categoryId: "cat_packs",
    images: [{ url: "", altText: "Switchback Hip Pack", isMain: true }],
    variants: [
      { id: "v1", label: "Clay", stock: 20, priceDiff: 0 },
      { id: "v2", label: "Forest", stock: 21, priceDiff: 0 },
    ],
    rating: 4.5,
    reviewCount: 58,
    createdAt: "2026-04-18",
  },
  {
    id: "p_daypack18",
    slug: "commuter-18-daypack",
    name: "Commuter 18 Daypack",
    description:
      "18 litres, laptop sleeve up to 15in, one strap that doesn't dig in on a bike commute. Built for people who leave the house before sunrise.",
    price: 9800,
    stock: 33,
    featured: true,
    categoryId: "cat_packs",
    images: [{ url: "", altText: "Commuter 18 Daypack", isMain: true }],
    variants: [{ id: "v1", label: "Charcoal", stock: 33, priceDiff: 0 }],
    rating: 4.6,
    reviewCount: 91,
    createdAt: "2026-03-11",
  },
  {
    id: "p_stormshell",
    slug: "stormline-shell-jacket",
    name: "Stormline Shell Jacket",
    description:
      "A 3-layer waterproof shell rated to 20,000mm hydrostatic head, pit zips for venting, and a helmet-compatible hood. Made for weather you didn't check the forecast for.",
    price: 24900,
    comparePrice: 28900,
    stock: 17,
    featured: true,
    categoryId: "cat_outerwear",
    images: [{ url: "", altText: "Stormline Shell Jacket", isMain: true }],
    variants: [
      { id: "v1", label: "S / Moss", stock: 4, priceDiff: 0 },
      { id: "v2", label: "M / Moss", stock: 5, priceDiff: 0 },
      { id: "v3", label: "L / Moss", stock: 4, priceDiff: 0 },
      { id: "v4", label: "M / Rust", stock: 4, priceDiff: 500 },
    ],
    rating: 4.8,
    reviewCount: 204,
    createdAt: "2026-01-22",
  },
  {
    id: "p_insulator",
    slug: "midweight-insulator",
    name: "Midweight Insulator",
    description:
      "Synthetic fill that keeps its loft when wet, packs down to the size of a water bottle. Your go-to layer three seasons out of four.",
    price: 15900,
    stock: 29,
    featured: false,
    categoryId: "cat_outerwear",
    images: [{ url: "", altText: "Midweight Insulator", isMain: true }],
    variants: [
      { id: "v1", label: "M / Ink", stock: 15, priceDiff: 0 },
      { id: "v2", label: "L / Ink", stock: 14, priceDiff: 0 },
    ],
    rating: 4.4,
    reviewCount: 76,
    createdAt: "2026-02-09",
  },
  {
    id: "p_basecamp_hood",
    slug: "basecamp-fleece-hood",
    name: "Basecamp Fleece Hood",
    description:
      "Grid fleece hoodie for camp evenings and cold mornings. Thumb loops, kangaroo pocket, no logos shouting from the chest.",
    price: 8900,
    stock: 38,
    featured: false,
    categoryId: "cat_outerwear",
    images: [{ url: "", altText: "Basecamp Fleece Hood", isMain: true }],
    variants: [
      { id: "v1", label: "S", stock: 12, priceDiff: 0 },
      { id: "v2", label: "M", stock: 13, priceDiff: 0 },
      { id: "v3", label: "L", stock: 13, priceDiff: 0 },
    ],
    rating: 4.6,
    reviewCount: 63,
    createdAt: "2026-04-01",
  },
  {
    id: "p_multitool",
    slug: "trailhand-multitool",
    name: "Trailhand Multitool",
    description:
      "15 tools in a body that fits a jacket pocket. Locking blade, pliers that don't pinch, a bottle opener you'll use more than the saw.",
    price: 6900,
    stock: 52,
    featured: true,
    categoryId: "cat_tools",
    images: [{ url: "", altText: "Trailhand Multitool", isMain: true }],
    variants: [{ id: "v1", label: "Standard", stock: 52, priceDiff: 0 }],
    rating: 4.9,
    reviewCount: 311,
    createdAt: "2025-11-14",
  },
  {
    id: "p_headlamp",
    slug: "lowbeam-headlamp",
    name: "Lowbeam Headlamp",
    description:
      "350 lumens, red-light mode that won't wreck your night vision, USB-C rechargeable. Runs 40 hours on low.",
    price: 4200,
    stock: 60,
    featured: false,
    categoryId: "cat_tools",
    images: [{ url: "", altText: "Lowbeam Headlamp", isMain: true }],
    variants: [{ id: "v1", label: "Standard", stock: 60, priceDiff: 0 }],
    rating: 4.5,
    reviewCount: 148,
    createdAt: "2026-01-05",
  },
  {
    id: "p_firekit",
    slug: "dry-strike-fire-kit",
    name: "Dry Strike Fire Kit",
    description:
      "Ferro rod, waxed tinder, and a striker in a waterproof case small enough to forget it's in your pack — until you need it.",
    price: 2600,
    stock: 71,
    featured: false,
    categoryId: "cat_tools",
    images: [{ url: "", altText: "Dry Strike Fire Kit", isMain: true }],
    variants: [{ id: "v1", label: "Standard", stock: 71, priceDiff: 0 }],
    rating: 4.7,
    reviewCount: 89,
    createdAt: "2025-12-20",
  },
];

// Seeded so login works out of the box: demo@fieldnote.co / password123
export const users: User[] = [
  {
    id: "u_demo",
    email: "demo@fieldnote.co",
    passwordHash: bcrypt.hashSync("password123", 10),
    phone: "+15555550123",
    name: "Demo Customer",
    role: "CUSTOMER",
    blocked: false,
    createdAt: "2026-01-01",
    loginCount: 0,
  },
  {
    id: "u_admin",
    email: "admin@fieldnote.co",
    passwordHash: bcrypt.hashSync("admin123", 10),
    name: "Store Admin",
    role: "ADMIN",
    blocked: false,
    createdAt: "2026-01-01",
    loginCount: 0,
  },
];

export const addresses: Address[] = [
  {
    id: "addr_demo",
    userId: "u_demo",
    fullName: "Demo Customer",
    street: "142 Birchwood Ave",
    city: "Portland",
    state: "OR",
    zip: "97205",
    country: "USA",
    isDefault: true,
  },
];

export const orders: Order[] = [
  {
    id: "ord_1001",
    userId: "u_demo",
    status: "SHIPPED",
    subtotal: 24300,
    discount: 0,
    tax: 1944,
    shipping: 0,
    total: 26244,
    shippingAddress: addresses[0],
    trackingNumber: "1Z999AA10123456784",
    items: [
      { productId: "p_switchback", productName: "Switchback Hip Pack", variant: "Forest", quantity: 1, price: 5400 },
      { productId: "p_multitool", productName: "Trailhand Multitool", quantity: 1, price: 6900 },
      { productId: "p_headlamp", productName: "Lowbeam Headlamp", quantity: 3, price: 4200 },
    ],
    createdAt: "2026-07-28",
  },
];

let orderSeq = 1002;

export const wishlistItems: import("./types").WishlistItem[] = [];
export const reviews: import("./types").Review[] = [
  {
    id: "rev_1",
    userId: "u_demo",
    userName: "Demo Customer",
    productId: "p_ridge35",
    rating: 5,
    comment: "Carried this through a week in the Wallowas and the hip belt never dug in once. Worth the price.",
    approved: true,
    createdAt: "2026-07-02",
  },
  {
    id: "rev_2",
    userId: "u_demo",
    userName: "Demo Customer",
    productId: "p_multitool",
    rating: 4,
    comment: "Solid build, though the pliers are a little tight out of the box. Loosened up after a week of use.",
    approved: true,
    createdAt: "2026-06-18",
  },
  {
    id: "rev_3",
    userId: "u_demo",
    userName: "Demo Customer",
    productId: "p_stormshell",
    rating: 3,
    comment: "This is spam-flagged test content pending moderation review.",
    approved: false,
    createdAt: "2026-08-01",
  },
];

interface ResetToken {
  token: string;
  userId: string;
  expiresAt: number;
}
export const resetTokens: ResetToken[] = [];

interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
}
export const otpCodes: OtpEntry[] = [];

export const notifications: Notification[] = [];

export const blogPosts: BlogPost[] = [
  {
    id: "blog_repair",
    slug: "why-we-run-a-lifetime-repair-program",
    title: "Why we run a lifetime repair program",
    excerpt: "Warranties expire. Gear shouldn't have to.",
    content:
      "Most warranties are built around a countdown — a year, two years, then you're on your own. We decided early on that a good repair program should look nothing like that...",
    published: true,
    authorName: "Fieldnote Team",
    metaTitle: "Why we run a lifetime repair program — Fieldnote",
    metaDescription: "How Fieldnote's lifetime repair program works and why we built it instead of a standard warranty.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-01",
  },
  {
    id: "blog_ripstop",
    slug: "choosing-a-pack-fabric-that-lasts",
    title: "Choosing a pack fabric that actually lasts",
    excerpt: "Denier ratings, ripstop weaves, and what actually matters on trail.",
    content:
      "420D recycled ripstop shows up on a lot of spec sheets, ours included, but the number alone tells you less than you'd think...",
    published: true,
    authorName: "Fieldnote Team",
    metaTitle: "Choosing a pack fabric that lasts — Fieldnote",
    metaDescription: "What denier ratings and ripstop weaves actually tell you about pack durability.",
    createdAt: "2026-05-10",
    updatedAt: "2026-05-10",
  },
];

export const pages: Page[] = [
  {
    id: "page_shipping",
    slug: "shipping-info",
    title: "Shipping Information",
    content:
      "We ship standard (3-5 days, free over ₹500) and express (1-2 days, ₹180 flat) across India. GST @ 18% (CGST 9% + SGST 9% intra-state, IGST 18% inter-state) is calculated at checkout based on your shipping state.",
    published: true,
    metaTitle: "Shipping Information — Fieldnote",
    metaDescription: "Fieldnote shipping rates, timelines, and coverage across India.",
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
];

export const taxRates: TaxRate[] = [
  { id: "tax_gst0", label: "GST 0% — Essential (India)", country: "India", ratePercent: 0, active: true },
  { id: "tax_gst5", label: "GST 5% — Essential goods", country: "India", ratePercent: 5, active: true },
  { id: "tax_gst12", label: "GST 12% — Standard", country: "India", ratePercent: 12, active: true },
  { id: "tax_gst18", label: "GST 18% — Standard (default)", country: "India", ratePercent: 18, active: true },
  { id: "tax_gst28", label: "GST 28% — Luxury", country: "India", ratePercent: 28, active: true },
  { id: "tax_ka", label: "Karnataka GST 18% (CGST 9%+SGST 9%)", country: "India", region: "KA", ratePercent: 18, active: true },
  { id: "tax_mh", label: "Maharashtra GST 18% (CGST 9%+SGST 9%)", country: "India", region: "MH", ratePercent: 18, active: true },
  { id: "tax_dl", label: "Delhi GST 18% (CGST 9%+SGST 9%)", country: "India", region: "DL", ratePercent: 18, active: true },
  { id: "tax_tn", label: "Tamil Nadu GST 18%", country: "India", region: "TN", ratePercent: 18, active: true },
];

export const coupons: Coupon[] = [
  { id: "cpn_welcome10", code: "WELCOME10", type: "percent", value: 10, usedCount: 3, active: true },
  {
    id: "cpn_save15",
    code: "SAVE15",
    type: "fixed",
    value: 1500,
    minSubtotal: 10000,
    usedCount: 0,
    active: true,
  },
  { id: "cpn_expired", code: "SUMMER24", type: "percent", value: 20, usedCount: 12, active: false },
];

export const storeSettings: StoreSettings = {
  storeName: "Fieldnote",
  supportEmail: "support@fieldnote.co",
  currency: "INR",
  addressLine: "142, MG Road, Bengaluru, KA 560001",
  freeShippingThreshold: 50000,
  flatShippingRate: 7000,
  expressShippingRate: 18000,
  defaultTaxPercent: 18,
  metaTitle: "Fieldnote — Gear for the field",
  metaDescription: "Packs, outerwear and tools built to be used hard and repaired, not replaced.",
  socialInstagram: "",
  socialTwitter: "",
  maintenanceMode: false,
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categories.find((c) => c.id === id) ?? null;
}

export async function getProducts(params?: {
  categorySlug?: string;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}): Promise<Product[]> {
  let list = [...products];

  if (params?.categorySlug) {
    const cat = categories.find((c) => c.slug === params.categorySlug);
    if (cat) list = list.filter((p) => p.categoryId === cat.id);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (params?.minPrice != null) {
    list = list.filter((p) => p.price >= params.minPrice!);
  }
  if (params?.maxPrice != null) {
    list = list.filter((p) => p.price <= params.maxPrice!);
  }
  if (params?.minRating != null) {
    list = list.filter((p) => p.rating >= params.minRating!);
  }

  switch (params?.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return list;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((p) => p.featured);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return products.find((p) => p.id === id) ?? null;
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  return users.find((u) => u.id === id) ?? null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  return users.find((u) => u.phone === phone) ?? null;
}

export async function createUserByPhone(input: { phone: string; name?: string }): Promise<User> {
  const user: User = {
    id: `u_${Date.now()}`,
    phone: input.phone,
    name: input.name ?? "Fieldnote Member",
    role: "CUSTOMER",
    blocked: false,
    createdAt: new Date().toISOString(),
    loginCount: 0,
  };
  users.push(user);
  await createNotification({
    userId: user.id,
    type: "welcome",
    title: "Welcome to Fieldnote",
    message: "Your account is set up. Browse the catalog whenever you're ready.",
  });
  return user;
}

export async function recordLogin(userId: string): Promise<void> {
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  user.lastLoginAt = new Date().toISOString();
  user.loginCount = (user.loginCount ?? 0) + 1;
}

export async function updateUserProfile(
  id: string,
  patch: { name?: string; email?: string; phone?: string }
): Promise<User | null> {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  if (patch.email && patch.email.toLowerCase() !== user.email?.toLowerCase()) {
    const existing = await getUserByEmail(patch.email);
    if (existing && existing.id !== id) {
      throw new Error("That email is already in use.");
    }
    user.email = patch.email;
  }
  if (patch.phone && patch.phone !== user.phone) {
    const existing = await getUserByPhone(patch.phone);
    if (existing && existing.id !== id) {
      throw new Error("That phone number is already in use.");
    }
    user.phone = patch.phone;
  }
  if (patch.name) user.name = patch.name;
  return user;
}

export async function getAddressesForUser(userId: string): Promise<Address[]> {
  return addresses.filter((a) => a.userId === userId);
}

export async function getAddressById(id: string): Promise<Address | null> {
  return addresses.find((a) => a.id === id) ?? null;
}

export async function createAddress(input: Omit<Address, "id">): Promise<Address> {
  if (input.isDefault) {
    for (const a of addresses) {
      if (a.userId === input.userId) a.isDefault = false;
    }
  }
  const address: Address = { id: `addr_${Date.now()}`, ...input };
  addresses.push(address);
  return address;
}

export async function updateAddress(
  id: string,
  userId: string,
  patch: Partial<Omit<Address, "id" | "userId">>
): Promise<Address | null> {
  const address = addresses.find((a) => a.id === id && a.userId === userId);
  if (!address) return null;
  if (patch.isDefault) {
    for (const a of addresses) {
      if (a.userId === userId) a.isDefault = false;
    }
  }
  Object.assign(address, patch);
  return address;
}

export async function deleteAddress(id: string, userId: string): Promise<boolean> {
  const idx = addresses.findIndex((a) => a.id === id && a.userId === userId);
  if (idx === -1) return false;
  addresses.splice(idx, 1);
  return true;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  return orders.find((o) => o.id === id) ?? null;
}

export async function getAllOrders(): Promise<Order[]> {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAllUsers(): Promise<User[]> {
  return users;
}

export async function getDashboardStats() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 15);
  const outOfStock = products.filter((p) => p.stock === 0);
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  return {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    totalCustomers: users.filter((u) => u.role === "CUSTOMER").length,
    lowStock,
    outOfStock,
    pendingReviews,
    recentOrders: [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createUser(input: { email: string; password: string; name: string }): Promise<User> {
  const existing = await getUserByEmail(input.email);
  if (existing) throw new Error("An account with this email already exists.");

  const hash = await bcrypt.hash(input.password, 12);
  const user: User = {
    id: `u_${Date.now()}`,
    email: input.email,
    passwordHash: hash,
    name: input.name,
    role: "CUSTOMER",
    blocked: false,
    createdAt: new Date().toISOString(),
    loginCount: 0,
  };
  users.push(user);
  return user;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

function getEffectiveTaxPercentMemory(country: string, region?: string | null): number {
  const normCountry = country.trim().toLowerCase();
  const normRegion = region?.trim().toLowerCase() || null;
  if (normRegion) {
    const regional = taxRates.find(
      (t) => t.active && t.country.toLowerCase() === normCountry && t.region?.toLowerCase() === normRegion
    );
    if (regional) return regional.ratePercent;
  }
  const national = taxRates.find(
    (t) => t.active && t.country.toLowerCase() === normCountry && !t.region
  );
  if (national) return national.ratePercent;
  const indiaFallback = taxRates.find(
    (t) => t.active && t.country.toLowerCase() === "india" && !t.region
  );
  if (indiaFallback) return indiaFallback.ratePercent;
  return storeSettings.defaultTaxPercent ?? 18;
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
  const shipping = discountedSubtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.flatShippingRate;
  const taxPercent = getEffectiveTaxPercentMemory(input.shippingAddress.country, input.shippingAddress.state);
  const tax = Math.round((discountedSubtotal * taxPercent) / 100);
  const order: Order = {
    id: `ord_${orderSeq++}`,
    userId: input.userId,
    status: "PENDING",
    subtotal,
    discount,
    couponCode: input.couponCode,
    tax,
    shipping,
    total: discountedSubtotal + tax + shipping,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    items: input.items,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);

  if (input.couponCode) await incrementCouponUse(input.couponCode);

  // decrement stock
  for (const item of input.items) {
    const p = products.find((p) => p.id === item.productId);
    if (p) p.stock = Math.max(0, p.stock - item.quantity);
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<Order | null> {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  return order;
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<Order | null> {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.adminNotes = notes;
  return order;
}

export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string
): Promise<Order | null> {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.trackingNumber = trackingNumber;
  return order;
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
  const category: Category = {
    id: `cat_${Date.now()}`,
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
  };
  categories.push(category);
  return category;
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<Category, "id">>
): Promise<Category | null> {
  const category = categories.find((c) => c.id === id);
  if (!category) return null;
  Object.assign(category, patch);
  return category;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const inUse = products.some((p) => p.categoryId === id);
  if (inUse) {
    return { success: false, message: "Move or delete products in this category first." };
  }
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false, message: "Category not found." };
  categories.splice(idx, 1);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Users (admin)
// ---------------------------------------------------------------------------

export async function setUserBlocked(userId: string, blocked: boolean): Promise<User | null> {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.blocked = blocked;
  return user;
}

export async function setUserRole(userId: string, role: Role): Promise<User | null> {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.role = role;
  return user;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function getBlogPosts(params?: { publishedOnly?: boolean }): Promise<BlogPost[]> {
  let list = [...blogPosts];
  if (params?.publishedOnly) list = list.filter((p) => p.published);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  return blogPosts.find((p) => p.id === id) ?? null;
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
  const now = new Date().toISOString();
  const post: BlogPost = {
    id: `blog_${Date.now()}`,
    slug: slugify(input.title),
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    authorName: input.authorName,
    published: input.published,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    createdAt: now,
    updatedAt: now,
  };
  blogPosts.unshift(post);
  return post;
}

export async function updateBlogPost(
  id: string,
  patch: Partial<Omit<BlogPost, "id" | "createdAt">>
): Promise<BlogPost | null> {
  const post = blogPosts.find((p) => p.id === id);
  if (!post) return null;
  Object.assign(post, patch, { updatedAt: new Date().toISOString() });
  return post;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const idx = blogPosts.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  blogPosts.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Pages (CMS)
// ---------------------------------------------------------------------------

export async function getPages(params?: { publishedOnly?: boolean }): Promise<Page[]> {
  let list = [...pages];
  if (params?.publishedOnly) list = list.filter((p) => p.published);
  return list.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return pages.find((p) => p.slug === slug) ?? null;
}

export async function getPageById(id: string): Promise<Page | null> {
  return pages.find((p) => p.id === id) ?? null;
}

export async function createPage(input: {
  title: string;
  content: string;
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
}): Promise<Page> {
  const now = new Date().toISOString();
  const page: Page = {
    id: `page_${Date.now()}`,
    slug: slugify(input.title),
    title: input.title,
    content: input.content,
    published: input.published,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    createdAt: now,
    updatedAt: now,
  };
  pages.push(page);
  return page;
}

export async function updatePage(
  id: string,
  patch: Partial<Omit<Page, "id" | "createdAt">>
): Promise<Page | null> {
  const page = pages.find((p) => p.id === id);
  if (!page) return null;
  Object.assign(page, patch, { updatedAt: new Date().toISOString() });
  return page;
}

export async function deletePage(id: string): Promise<boolean> {
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  pages.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Tax rates
// ---------------------------------------------------------------------------

export async function getTaxRates(): Promise<TaxRate[]> {
  return taxRates;
}

export async function createTaxRate(input: Omit<TaxRate, "id">): Promise<TaxRate> {
  const rate: TaxRate = { ...input, id: `tax_${Date.now()}` };
  taxRates.push(rate);
  return rate;
}

export async function updateTaxRate(id: string, patch: Partial<Omit<TaxRate, "id">>): Promise<TaxRate | null> {
  const rate = taxRates.find((r) => r.id === id);
  if (!rate) return null;
  Object.assign(rate, patch);
  return rate;
}

export async function deleteTaxRate(id: string): Promise<boolean> {
  const idx = taxRates.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  taxRates.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export async function getCoupons(): Promise<Coupon[]> {
  return [...coupons].sort((a, b) => a.code.localeCompare(b.code));
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  return coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) ?? null;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discount?: number; // cents
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
  const coupon = await getCouponByCode(code);
  if (coupon) coupon.usedCount += 1;
}

export async function createCoupon(input: Omit<Coupon, "id" | "usedCount">): Promise<Coupon> {
  const coupon: Coupon = { ...input, id: `cpn_${Date.now()}`, usedCount: 0 };
  coupons.push(coupon);
  return coupon;
}

export async function updateCoupon(
  id: string,
  patch: Partial<Omit<Coupon, "id">>
): Promise<Coupon | null> {
  const coupon = coupons.find((c) => c.id === id);
  if (!coupon) return null;
  Object.assign(coupon, patch);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  coupons.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Store settings
// ---------------------------------------------------------------------------

export async function getStoreSettings(): Promise<StoreSettings> {
  return storeSettings;
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  Object.assign(storeSettings, patch);
  return storeSettings;
}

export async function createProduct(input: Omit<Product, "id" | "rating" | "reviewCount" | "createdAt">): Promise<Product> {
  const product: Product = {
    ...input,
    id: `p_${Date.now()}`,
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(product);
  return product;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  const product = products.find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export async function getWishlistForUser(userId: string): Promise<Product[]> {
  const ids = wishlistItems.filter((w) => w.userId === userId).map((w) => w.productId);
  return products.filter((p) => ids.includes(p.id));
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  return wishlistItems.some((w) => w.userId === userId && w.productId === productId);
}

export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<{ inWishlist: boolean }> {
  const existing = wishlistItems.findIndex(
    (w) => w.userId === userId && w.productId === productId
  );
  if (existing !== -1) {
    wishlistItems.splice(existing, 1);
    return { inWishlist: false };
  }
  wishlistItems.push({
    id: `wl_${Date.now()}`,
    userId,
    productId,
    createdAt: new Date().toISOString(),
  });
  return { inWishlist: true };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function getReviewsForProduct(productId: string) {
  return reviews
    .filter((r) => r.productId === productId && r.approved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createReview(input: {
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  const review = {
    id: `rev_${Date.now()}`,
    approved: true,
    createdAt: new Date().toISOString(),
    ...input,
  };
  reviews.unshift(review);

  const product = products.find((p) => p.id === input.productId);
  if (product) {
    const productReviews = reviews.filter((r) => r.productId === product.id && r.approved);
    product.reviewCount = productReviews.length;
    product.rating =
      productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  }

  return review;
}

export async function hasUserReviewed(userId: string, productId: string): Promise<boolean> {
  return reviews.some((r) => r.userId === userId && r.productId === productId);
}

export async function getAllReviews() {
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function recalcProductRating(productId: string) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  const productReviews = reviews.filter((r) => r.productId === productId && r.approved);
  product.reviewCount = productReviews.length;
  product.rating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;
}

export async function setReviewApproved(reviewId: string, approved: boolean) {
  const review = reviews.find((r) => r.id === reviewId);
  if (!review) return null;
  review.approved = approved;
  recalcProductRating(review.productId);
  return review;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) return false;
  const [removed] = reviews.splice(idx, 1);
  recalcProductRating(removed.productId);
  return true;
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function createResetToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  const token = `${userId}.${raw}`;
  const hashed = hashToken(token);
  resetTokens.push({ token: hashed, userId, expiresAt: Date.now() + 60 * 60 * 1000 });
  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const hashed = hashToken(token);
  const idx = resetTokens.findIndex((t) => t.token === hashed);
  if (idx === -1) return null;
  const entry = resetTokens[idx];
  resetTokens.splice(idx, 1);
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

export async function setUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  return true;
}

// ---------------------------------------------------------------------------
// Mobile OTP login
// ---------------------------------------------------------------------------

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function issueOtp(phone: string): Promise<string> {
  const code = generateOtpCode();
  // Replace any outstanding code for this phone rather than stacking them.
  const idx = otpCodes.findIndex((o) => o.phone === phone);
  const entry = { phone, code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 };
  if (idx >= 0) otpCodes[idx] = entry;
  else otpCodes.push(entry);
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const entry = otpCodes.find((o) => o.phone === phone);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    otpCodes.splice(otpCodes.indexOf(entry), 1);
    return false;
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpCodes.splice(otpCodes.indexOf(entry), 1);
    return false;
  }
  const valid = entry.code === code;
  if (valid) otpCodes.splice(otpCodes.indexOf(entry), 1);
  return valid;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function createNotification(input: {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
  link?: string;
}): Promise<Notification> {
  const notification: Notification = {
    id: `notif_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  return notification;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  return notifications.filter((n) => n.userId === userId).slice(0, 50);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return notifications.filter((n) => n.userId === userId && !n.read).length;
}

export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  const n = notifications.find((n) => n.id === id && n.userId === userId);
  if (!n) return false;
  n.read = true;
  return true;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  let count = 0;
  for (const n of notifications) {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}
