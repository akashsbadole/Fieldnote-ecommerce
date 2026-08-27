export type Role = "ADMIN" | "CUSTOMER";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductImage {
  url: string;
  altText: string;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  label: string;
  stock: number;
  priceDiff: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // cents
  comparePrice?: number | null;
  stock: number;
  featured: boolean;
  categoryId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface User {
  id: string;
  email?: string;
  passwordHash?: string;
  phone?: string;
  name: string;
  role: Role;
  blocked: boolean;
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number; // percent: 0-100, fixed: cents
  minSubtotal?: number; // cents
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "order_status" | "order_tracking" | "welcome" | "review" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variant?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  adminNotes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  published: boolean;
  authorName: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRate {
  id: string;
  label: string;
  country: string;
  region?: string; // state/province, blank = applies to whole country
  ratePercent: number;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  addressLine: string;
  freeShippingThreshold: number; // cents
  flatShippingRate: number; // cents
  expressShippingRate: number; // cents
  defaultTaxPercent: number; // fallback when no TaxRate matches
  metaTitle: string;
  metaDescription: string;
  socialInstagram?: string;
  socialTwitter?: string;
  maintenanceMode: boolean;
}
