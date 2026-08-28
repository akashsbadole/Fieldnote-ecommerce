import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Enter a phone number in international format, e.g. +15555550123"),
});
export type PhoneInput = z.infer<typeof phoneSchema>;

export const otpVerifySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Enter a phone number in international format, e.g. +15555550123"),
  code: z.string().trim().length(6, "Enter the 6-digit code"),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  street: z.string().min(3, "Street address is required").max(200),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  zip: z.string().min(3, "ZIP / postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(56),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  address: addressSchema,
  shippingMethod: z.enum(["standard", "express"]),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  description: z.string().min(10, "Description should be at least 10 characters").max(5000),
  price: z.coerce.number().int().min(1, "Price must be greater than 0").max(100000000, "Price too large"),
  comparePrice: z.coerce.number().int().optional(),
  stock: z.coerce.number().int().min(0, "Stock can't be negative").max(1000000),
  categoryId: z.string().min(1, "Choose a category").max(50),
  featured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  imageUrl: z.string().url("Enter a valid URL").max(2048).optional().or(z.literal("")),
  variantsJson: z.string().max(5000).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const blogPostSchema = z.object({
  title: z.string().min(3, "Title is required"),
  excerpt: z.string().min(10, "Excerpt should be at least 10 characters"),
  content: z.string().min(20, "Content should be at least 20 characters"),
  authorName: z.string().min(2, "Author name is required"),
  published: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const pageSchema = z.object({
  title: z.string().min(2, "Title is required"),
  content: z.string().min(10, "Content should be at least 10 characters"),
  published: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
export type PageInput = z.infer<typeof pageSchema>;

export const taxRateSchema = z.object({
  label: z.string().min(2, "Label is required"),
  country: z.string().min(2, "Country is required"),
  region: z.string().optional(),
  ratePercent: z.coerce.number().min(0, "Rate can't be negative").max(100, "Rate looks too high"),
  active: z.boolean().optional(),
});
export type TaxRateInput = z.infer<typeof taxRateSchema>;

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code should be at least 3 characters")
    .max(20, "Code should be 20 characters or fewer")
    .transform((v) => v.toUpperCase()),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(0.01, "Enter a value greater than 0"),
  minSubtotal: z.coerce.number().optional(),
  maxUses: z.coerce.number().int().optional(),
  active: z.boolean().optional(),
});
export type CouponInput = z.infer<typeof couponSchema>;

export const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  supportEmail: z.string().email("Enter a valid email"),
  currency: z.string().min(3, "Currency code is required"),
  addressLine: z.string().optional(),
  freeShippingThreshold: z.coerce.number().min(0),
  flatShippingRate: z.coerce.number().min(0),
  expressShippingRate: z.coerce.number().min(0),
  defaultTaxPercent: z.coerce.number().min(0).max(100),
  metaTitle: z.string().min(2, "Meta title is required"),
  metaDescription: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialTwitter: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
});
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});
export type ContactInput = z.infer<typeof contactSchema>;
