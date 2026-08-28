import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number, currency: string = "INR"): string {
  // cents are actually paise when currency is INR (same smallest-unit logic)
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).format(cents / 100);
  } catch {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(cents / 100);
  }
}

export function formatPriceWithCurrency(cents: number, currency?: string): string {
  return formatPrice(cents, currency || "INR");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
