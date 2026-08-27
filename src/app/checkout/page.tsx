"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart-store";
import { addressSchema, type AddressInput } from "@/lib/validations";
import { placeOrderAction } from "@/actions/order-actions";
import { getMyAddressesAction } from "@/actions/address-actions";
import { applyCouponAction } from "@/actions/coupon-actions";
import { StripePaymentStep } from "@/components/checkout/stripe-payment-step";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { Address } from "@/lib/types";

const STEPS = ["Shipping", "Payment", "Review"] as const;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { lines, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [submitting, setSubmitting] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | undefined>();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [sameBilling, setSameBilling] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "USA" },
  });

  const billingForm = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "USA" },
  });

  useEffect(() => {
    if (!session) return;
    getMyAddressesAction().then((addresses) => {
      setSavedAddresses(addresses);
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        reset({
          fullName: defaultAddr.fullName,
          street: defaultAddr.street,
          city: defaultAddr.city,
          state: defaultAddr.state,
          zip: defaultAddr.zip,
          country: defaultAddr.country,
        });
      }
    });
  }, [session, reset]);

  function selectSavedAddress(id: string) {
    setSelectedAddressId(id);
    const addr = savedAddresses.find((a) => a.id === id);
    if (addr) {
      reset({
        fullName: addr.fullName,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        country: addr.country,
      });
    }
  }

  function selectNewAddress() {
    setSelectedAddressId("new");
    reset({ fullName: session?.user?.name ?? "", street: "", city: "", state: "", zip: "", country: "USA" });
  }

  const discount = appliedCoupon?.discount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal() - discount);
  const shippingCost = shippingMethod === "express" ? 1800 : discountedSubtotal > 10000 ? 0 : 700;
  const tax = Math.round(discountedSubtotal * 0.08);
  const total = discountedSubtotal + shippingCost + tax;

  async function onApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    const res = await applyCouponAction(couponInput.trim(), subtotal());
    setCouponApplying(false);
    if (res.success && res.code && res.discount != null) {
      setAppliedCoupon({ code: res.code, discount: res.discount });
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
  }

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Log in to check out</h1>
        <p className="font-mono text-sm text-muted">
          Guest checkout with a database-backed cart requires an account so we can
          track your order.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}
          className={buttonVariants({ size: "lg" })}
        >
          Log in
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Nothing to check out</h1>
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
          Browse gear
        </Link>
      </div>
    );
  }

  async function onPlaceOrder() {
    setSubmitting(true);
    const address = getValues();
    const billingValues = sameBilling ? undefined : billingForm.getValues();
    const result = await placeOrderAction({
      items: lines.map((l) => ({
        productId: l.productId,
        variant: l.variant,
        quantity: l.quantity,
      })),
      address,
      billingAddress: billingValues,
      couponCode: appliedCoupon?.code,
      paymentIntentId,
    });
    setSubmitting(false);

    if (result.success && result.orderId) {
      clearCart();
      toast.success("Order placed!");
      router.push(`/account/orders/${result.orderId}?placed=1`);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs",
                i === step
                  ? "bg-forest text-paper"
                  : i < step
                  ? "bg-forest/20 text-forest"
                  : "bg-line text-muted"
              )}
            >
              {i + 1}
            </div>
            <span className={cn("font-mono text-xs uppercase", i === step ? "text-ink" : "text-muted")}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-line" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && (
            <form
              onSubmit={handleSubmit(() => setStep(1))}
              className="space-y-5 border border-line p-6"
            >
              <h2 className="font-display text-xl">Shipping address</h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-2 border-b border-line pb-5">
                  <label className="font-mono text-xs uppercase tracking-wider text-muted">
                    Saved addresses
                  </label>
                  {savedAddresses.map((a) => (
                    <label
                      key={a.id}
                      className="flex cursor-pointer items-start gap-3 border border-line px-4 py-3"
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === a.id}
                        onChange={() => selectSavedAddress(a.id)}
                        className="mt-1"
                      />
                      <span className="text-sm">
                        {a.fullName} — {a.street}, {a.city}, {a.state} {a.zip}
                        {a.isDefault && <span className="ml-2 font-mono text-xs text-forest">(default)</span>}
                      </span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-3 border border-line px-4 py-3">
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === "new"}
                      onChange={selectNewAddress}
                    />
                    <span className="text-sm">Use a new address</span>
                  </label>
                </div>
              )}

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted">
                  Full name
                </label>
                <input
                  {...register("fullName")}
                  defaultValue={session.user?.name ?? ""}
                  className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                />
                {errors.fullName && (
                  <p className="mt-1 font-mono text-xs text-rust">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted">
                  Street address
                </label>
                <input
                  {...register("street")}
                  className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                />
                {errors.street && (
                  <p className="mt-1 font-mono text-xs text-rust">{errors.street.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted">City</label>
                  <input
                    {...register("city")}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                  />
                  {errors.city && <p className="mt-1 font-mono text-xs text-rust">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted">State</label>
                  <input
                    {...register("state")}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                  />
                  {errors.state && <p className="mt-1 font-mono text-xs text-rust">{errors.state.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted">ZIP</label>
                  <input
                    {...register("zip")}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                  />
                  {errors.zip && <p className="mt-1 font-mono text-xs text-rust">{errors.zip.message}</p>}
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted">Country</label>
                  <input
                    {...register("country")}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(e) => setSameBilling(e.target.checked)}
                />
                Billing address same as shipping
              </label>

              {!sameBilling && (
                <div className="space-y-4 border border-line p-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">
                    Billing address
                  </p>
                  <div>
                    <input
                      {...billingForm.register("fullName")}
                      placeholder="Full name"
                      className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                    />
                    {billingForm.formState.errors.fullName && (
                      <p className="mt-1 font-mono text-xs text-rust">
                        {billingForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...billingForm.register("street")}
                      placeholder="Street address"
                      className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                    />
                    {billingForm.formState.errors.street && (
                      <p className="mt-1 font-mono text-xs text-rust">
                        {billingForm.formState.errors.street.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      {...billingForm.register("city")}
                      placeholder="City"
                      className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                    />
                    <input
                      {...billingForm.register("state")}
                      placeholder="State"
                      className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      {...billingForm.register("zip")}
                      placeholder="ZIP"
                      className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                    />
                    <input
                      {...billingForm.register("country")}
                      placeholder="Country"
                      defaultValue="USA"
                      className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted">
                  Shipping method
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex cursor-pointer items-center justify-between border border-line px-4 py-3">
                    <span className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                      />
                      Standard (3–5 days)
                    </span>
                    <span className="font-mono text-xs">
                      {subtotal() > 10000 ? "Free" : formatPrice(700)}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center justify-between border border-line px-4 py-3">
                    <span className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                      />
                      Express (1–2 days)
                    </span>
                    <span className="font-mono text-xs">{formatPrice(1800)}</span>
                  </label>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Continue to payment
              </Button>
            </form>
          )}

          {step === 1 && (
            <StripePaymentStep
              amountCents={total}
              onBack={() => setStep(0)}
              onComplete={(intentId) => {
                setPaymentIntentId(intentId);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <div className="space-y-5 border border-line p-6">
              <h2 className="font-display text-xl">Review your order</h2>
              <ul className="divide-y divide-line">
                {lines.map((l) => (
                  <li key={`${l.productId}-${l.variant}`} className="flex justify-between py-3 font-mono text-sm">
                    <span>
                      {l.name} {l.variant && `(${l.variant})`} × {l.quantity}
                    </span>
                    <span>{formatPrice(l.price * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line pt-3">
                <p className="font-mono text-xs text-muted">Shipping to</p>
                <p className="mt-1 text-sm">
                  {getValues("fullName")}, {getValues("street")}, {getValues("city")},{" "}
                  {getValues("state")} {getValues("zip")}, {getValues("country")}
                </p>
                {!sameBilling && (
                  <>
                    <p className="mt-3 font-mono text-xs text-muted">Billing to</p>
                    <p className="mt-1 text-sm">
                      {billingForm.getValues("fullName")}, {billingForm.getValues("street")},{" "}
                      {billingForm.getValues("city")}, {billingForm.getValues("state")}{" "}
                      {billingForm.getValues("zip")}, {billingForm.getValues("country")}
                    </p>
                  </>
                )}
                {appliedCoupon && (
                  <p className="mt-3 font-mono text-xs text-forest">
                    {appliedCoupon.code} — you saved {formatPrice(discount)}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  variant="rust"
                  className="flex-1"
                  onClick={onPlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? "Placing order…" : `Place order — ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit border border-line p-6">
          <h2 className="font-display text-xl">Order total</h2>

          <div className="mt-4 border-b border-line pb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between border border-forest bg-forest/5 px-3 py-2">
                <span className="font-mono text-xs text-forest">{appliedCoupon.code} applied</span>
                <button
                  onClick={removeCoupon}
                  className="cursor-pointer font-mono text-xs text-muted hover:text-rust"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full border border-line bg-transparent px-3 py-2 font-mono text-xs uppercase outline-none focus-visible:border-forest"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onApplyCoupon}
                  disabled={couponApplying || !couponInput.trim()}
                >
                  {couponApplying ? "…" : "Apply"}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-forest">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Est. tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-mono text-base">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
