# Fieldnote — E-Commerce Storefront

A working Next.js 16 (App Router) storefront for a fictional outdoor-gear
brand, built as a real, running codebase — not a mockup. Browse the
catalog, add to cart, check out, view order history, and manage the store
from an admin panel.

## Quick start

```bash
npm install
cp .env.example .env   # then set AUTH_SECRET (see below)
npm run dev
```

Visit http://localhost:3000.

Generate a secret for `.env`:
```bash
openssl rand -base64 32
```

### Demo accounts
| Role     | Email                | Password    |
|----------|-----------------------|-------------|
| Customer | demo@fieldnote.co     | password123 |
| Admin    | admin@fieldnote.co    | admin123    |

Without any of the optional keys below set, everything still works end to
end: checkout uses a demo card step, emails print to the server console
instead of sending, and login is credentials-only. Add keys to `.env` to
switch on real Stripe, real email, and Google login — see "Setting up the
optional integrations" further down.

## ⚠️ Important: this build uses an in-memory data layer by default

This project was scaffolded in a sandboxed environment that couldn't reach
`binaries.prisma.sh` to download Prisma's query engine, so the app you get
when you run `npm run dev` out of the box runs on a typed **in-memory data
layer** (`src/lib/data.ts`) instead of a real database. All state (orders
placed, products created in the admin panel, new registrations) resets
whenever the server process restarts.

**The real Postgres implementation is already written for you** — it just
isn't wired in by default, because it couldn't be compiled or tested in the
sandbox this project was built in. See "Going to production with Postgres"
below.

Same story for fonts: `next/font/google` (Fraunces / Inter / IBM Plex
Mono) couldn't fetch from `fonts.googleapis.com` in this sandbox, so
`globals.css` currently uses close system-font fallbacks. Swap back to
`next/font/google` in `src/app/layout.tsx` once deployed somewhere with
normal internet access for the real brand type.

## Going to production with Postgres

Three files are already written against `prisma/schema.prisma`, ready to
drop in once you're somewhere with normal network access:

| File | What it is |
|---|---|
| `src/lib/prisma.ts` | Prisma Client singleton, using the `pg` driver adapter (works well for serverless/edge deploys — no native binary needed at runtime) |
| `src/lib/data.db.ts` | Every function from `data.ts`, reimplemented against real Prisma queries — same names, same signatures, so nothing else in the app needs to change |
| `prisma/seed.ts` | Seeds the same demo data currently hardcoded in `data.ts` (products, categories, the two demo accounts, a sample order, reviews, blog posts, a page, tax rates) |

**Honesty check:** these were written carefully — matched field-for-field
against the schema, with explicit mapping between Prisma's `null` and the
app's `undefined`-based optional fields — but never compiled or run,
because this sandbox can't generate the Prisma client. Treat this as a
strong first draft, not verified-working code. Budget time to actually
test it before trusting it with real orders.

**Known drift as of this writing:** `src/lib/data.db.ts` and
`prisma/seed.ts` were written *before* mobile OTP login, in-app
notifications, coupons, and billing addresses were added to `data.ts` and
`prisma/schema.prisma`. The schema itself has the new models (`OtpCode`,
`Notification`, `Coupon`, `User.phone`, `Order.discount` /`.couponCode`
/`.billingAddress`), but `data.db.ts` doesn't have the corresponding
Prisma-backed functions yet (`issueOtp`, `verifyOtp`, `createNotification`,
`getNotificationsForUser`, `markNotificationRead`,
`markAllNotificationsRead`, `getCoupons`, `validateCoupon`,
`createCoupon`/`updateCoupon`/`deleteCoupon`, `recordLogin`) — those still
only exist in the in-memory `data.ts`. Port them over using the same
pattern as the rest of the file before switching to Postgres, or those
features will silently stop working the moment you swap the files.

### Steps

```bash
# 1. Set DATABASE_URL in .env to your Postgres connection string, and set
#    a real AUTH_SECRET (see "Rotate secrets" below — don't reuse the one
#    that shipped in this project's .env).

# 2. Remove the three exclude entries for these files from tsconfig.json
#    and eslint.config.mjs (search for "data.db.ts" in both) — they're
#    only there so this sandbox's build didn't fail on ungenerated types.

# 3. Generate the client and run the first migration
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed demo data (optional, safe to skip for a real launch)
npx prisma db seed

# 5. Swap the files
mv src/lib/data.ts src/lib/data.memory.ts
mv src/lib/data.db.ts src/lib/data.ts

# 6. Build — fix any type errors the real generated Prisma types surface.
#    This file was written carefully but is unverified; some drift here
#    would not be surprising.
npm run build
```

### Test before you trust it

Manually walk through every one of these — don't skip this:

- [ ] Register a new account, then log out and log back in
- [ ] Browse products, filter by category, search, sort
- [ ] Add to cart, adjust quantity, remove an item
- [ ] Complete checkout as a logged-in customer; confirm the order appears
      in `/account/orders` and the product's stock decremented
- [ ] Admin: create, edit, and delete a product
- [ ] Admin: create a category, confirm you can't delete it while a
      product is assigned to it
- [ ] Admin: create and publish a blog post; confirm it's live at
      `/blog/[slug]`
- [ ] Admin: create and publish a CMS page; confirm it's live at
      `/p/[slug]`
- [ ] Admin: update an order's status and add a tracking number; confirm
      the customer's order page reflects it and (if Resend is configured)
      an email actually sends
- [ ] Admin: approve/hide a review; confirm the product's star rating
      updates
- [ ] Admin: add and toggle a tax rate
- [ ] Admin: block a customer account, confirm they can no longer log in;
      unblock them
- [ ] Wishlist: add and remove an item, confirm it persists across a
      logout/login

## What's real vs. stubbed

| Area | Status |
|---|---|
| Product catalog, search, filter, sort | ✅ Real, server-rendered |
| Cart (Zustand + localStorage) | ✅ Real |
| Auth (Auth.js v5, credentials, JWT sessions) | ✅ Real |
| Google OAuth login | ✅ Real, opt-in via env vars (see `.env.example`) |
| Role-based route protection (middleware) | ✅ Real |
| Checkout → order creation | ✅ Real (writes to in-memory store) |
| Payment (Stripe) | ✅ Real when `STRIPE_SECRET_KEY` set — server verifies the PaymentIntent before creating the order. Falls back to a demo card step otherwise. |
| Stripe webhook | ✅ Real endpoint (`/api/webhooks/stripe`), logs refunds/failures — wire to order status once a real DB exists |
| Order confirmation / status-update / welcome emails | ✅ Real when `RESEND_API_KEY` set — logs to console otherwise |
| Password reset (forgot → email → reset) | ✅ Real, token-based (1hr expiry, single-use) |
| Wishlist | ✅ Real, persisted per-user (in-memory) |
| Product reviews (writing one) | ✅ Real — logged-in users can post one review per product; updates the aggregate rating |
| Order history, cancel, reorder | ✅ Real |
| Admin dashboard, product CRUD, order status, customers | ✅ Real |
| Category management (admin) | ✅ Real — create/edit/delete with parent/child support |
| Blog (public list + post pages, admin CRUD) | ✅ Real, at `/blog` |
| CMS pages (admin-authored static pages) | ✅ Real, at `/p/[slug]` — e.g. `/p/shipping-info` |
| Store settings (admin) | ✅ Real — tax rates, store-level config |
| Customer management (block/unblock, role) | ✅ Real — plus a per-customer detail page with order history and saved addresses |
| Rate limiting (login, register, forgot-password, checkout, payment intent) | ✅ Real — in-memory sliding window, see caveat below |
| Legal pages (Terms / Privacy) | ✅ Drafted as real, launch-shaped policies reflecting what the app actually collects — **still needs an actual lawyer's review before go-live**, not just a formatting pass |
| Price range filter | ✅ Real, on `/products` |
| Admin order detail page, notes, tracking number | ✅ Real, at `/admin/orders/[id]` — updating tracking emails the customer |
| Printable invoice (admin) | ✅ Real, at `/admin/orders/[id]/invoice` |
| Bulk product actions (admin) | ✅ Real — select multiple, bulk feature/unfeature/delete |
| Product variants + image URL (admin) | ✅ Real — dynamic variant editor in the product form; paste a URL to override the illustrated placeholder |
| Revenue chart (admin dashboard) | ✅ Real, 14-day line chart via recharts |
| Address book (add/edit/delete/set default) | ✅ Real, in Account → Profile |
| Checkout with saved addresses | ✅ Real — select a saved address or enter a new one |
| Profile edit (name/email) | ✅ Real |
| Change password (from account, not just reset flow) | ✅ Real — requires current password |
| Account deactivation | ✅ Real — blocks the account and signs out |
| Wishlist → quick add-to-cart | ✅ Real, on `/account/wishlist` |
| Cart → save for later (moves to wishlist) | ✅ Real |
| Search autocomplete + recent/popular searches | ✅ Real — debounced, backed by `/api/search/suggestions` |
| sitemap.xml, robots.txt, JSON-LD product data | ✅ Real |
| Mobile OTP login (phone + 6-digit code) | ✅ Real — creates an account automatically on first login; SMS sends via Twilio's REST API when `TWILIO_*` env vars are set, otherwise the code is returned to the UI directly for testing (never silently lost in server logs) |
| 30-day sessions | ✅ Real — `session.maxAge`/`jwt.maxAge` set globally to 30 days, applies to all login methods |
| In-app notifications (bell icon, unread badge, mark read) | ✅ Real — Zustand-backed, fires on order placed/cancelled/status-changed/tracking-added and on account creation |
| Coupon/discount codes | ✅ Real — admin CRUD at `/admin/coupons`, applied and re-validated server-side at checkout (client-computed discounts are never trusted) |
| Billing address at checkout | ✅ Real — "same as shipping" toggle, separate form when unchecked, persists on the order |
| Rating filter | ✅ Real, on `/products` |
| Customer login tracking (last login, login count) | ✅ Real — visible in admin customer list and detail page |
| Product images | 🟡 Hand-drawn line-art illustrations per category by default — real photos work automatically once a URL is set in the admin product form |
| Database persistence | 🟡 In-memory — see above, this is the one piece that needs your own environment |

### A note on rate limiting

`src/lib/rate-limit.ts` is an in-memory sliding-window limiter — it works
correctly for a single server instance (verified: 6 rapid bad-password
attempts against the same account correctly get rejected on the 6th with
a "too many attempts" error). It resets on restart and doesn't share
state across instances, so once you deploy more than one server process,
swap it for a shared store (Upstash Redis + `@upstash/ratelimit` is the
standard pairing on Vercel). Currently applied to: login (per email+IP),
registration (per IP), forgot-password (per email and per IP), order
placement (per user), and Stripe payment-intent creation (per user).

### A note on product images

This sandbox can't reach photo APIs (Unsplash, etc.) or accept real photo
uploads, so instead of a generic icon-in-a-box placeholder, each category
gets a hand-coded SVG line illustration (`src/components/products/illustrations.tsx`)
— a backpack, a jacket, a multitool, drawn as actual line art rather than
a stock icon. It's not a substitute for real photography, but it's
meaningfully closer to "could ship a demo with this" than a flat
placeholder box. `ProductArt` already accepts an `imageUrl` prop — wire
real photos through Cloudinary/Uploadthing and pass the URL there; the
component will render the photo instead automatically.

## Setting up the optional integrations

All of these are additive — the app runs fully without any of them, just in
demo mode. Add the relevant keys to `.env` to switch each one on:

- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and
  `STRIPE_WEBHOOK_SECRET` (get the last one from `stripe listen --forward-to
  localhost:3000/api/webhooks/stripe` while developing).
- **Email**: `RESEND_API_KEY` from resend.com. Sender address is currently
  hardcoded to `orders@fieldnote.co` in `src/lib/email.ts` — change it to a
  domain you've verified with Resend.
- **Google login**: `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` from Google Cloud
  Console (OAuth client), plus `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` so the
  login page renders the button.

## Design

The brand is **Fieldnote**, a small outdoor-gear catalog with a
field-journal identity instead of a generic storefront look: a serif
display face, monospace "spec sheet" labels on products, a stitched
dashed-border treatment on cards, and a topographic-line motif standing
in for product photography.

Tokens live in `src/app/globals.css` under `@theme` (Tailwind v4 CSS-first
config) — colors, fonts, and the two signature utility classes
(`.stitched`, `.spec-row`).

## Project structure

```
src/
  app/
    (storefront pages: /, /products, /products/[slug], /categories/[slug],
     /cart, /checkout, /login, /register, /forgot-password,
     /reset-password/[token], /about, /contact, /faq, /terms, /privacy,
     /blog, /blog/[slug], /p/[slug])
    account/          — customer dashboard (protected): orders, wishlist, profile
    admin/             — store admin (protected, ADMIN role only):
                          dashboard, products, categories, blog, pages,
                          orders, customers, settings
    api/
      auth/[...nextauth]/route.ts
      checkout/create-payment-intent/route.ts
      webhooks/stripe/route.ts
  actions/             — server actions: auth, orders, wishlist, reviews,
                          password reset, admin product/category/blog/order CRUD
  components/
    layout/            — Header, Footer
    products/          — ProductCard, ProductGrid, ProductArt, illustrations,
                          AddToCartForm, ReviewSection
    cart/              — CartDrawer
    checkout/          — StripePaymentStep (real Stripe or demo fallback)
    account/           — OrderActions (cancel/reorder)
    admin/             — DeleteProductButton, OrderStatusSelect, NewProductForm
    ui/                — Button
  lib/
    data.ts            — in-memory data layer (Prisma-shaped, active by default)
    data.db.ts         — real Postgres/Prisma implementation, same signatures
                          as data.ts — see "Going to production with Postgres"
    prisma.ts          — Prisma Client singleton (pg driver adapter)
    auth.ts            — NextAuth v5 config (credentials + optional Google)
    stripe.ts           — Stripe server client (null when unconfigured)
    email.ts / email-templates.ts — Resend-backed email service + templates
    rate-limit.ts       — in-memory sliding-window limiter
    store/cart-store.ts — Zustand cart
    validations.ts     — Zod schemas
    types.ts           — shared types (mirrors prisma/schema.prisma)
  proxy.ts             — protects /admin and /account (Next.js 16 middleware convention)
prisma/
  schema.prisma        — production data model
  seed.ts              — seeds demo data via Prisma (npx prisma db seed)
```

## Roadmap to production

Rough order, building on what's here:

1. **Database** — the code is written (`src/lib/data.db.ts`,
   `src/lib/prisma.ts`, `prisma/seed.ts`); follow "Going to production
   with Postgres" above. This needs your own environment (network access
   to Prisma's engine binaries) and a real compile/test pass — it was
   written but never run.
2. **Rotate secrets** — the `.env` in this project has a real generated
   `AUTH_SECRET`. Generate your own (`openssl rand -base64 32`) before
   deploying; treat the shipped one as burned.
3. **Real product photography** — via Cloudinary/Uploadthing, passed
   through the `imageUrl` prop already built into `ProductArt`.
4. **Legal review** — the Terms/Privacy pages are real, complete drafts
   reflecting actual app behavior, but still need a lawyer's sign-off,
   especially the placeholder `[STATE/COUNTRY]` and arbitration-clause
   spots in Terms.
5. **Shared rate-limit store** — swap the in-memory limiter for
   Redis-backed once you run more than one server instance.
6. **Automated tests + error monitoring** — nothing here has test
   coverage yet, and there's no Sentry/equivalent wired up.
7. **Database-backed cart for logged-in users** — cart is currently
   client-only (Zustand + localStorage) for everyone, including logged-in
   customers. Once Postgres is wired up, sync it server-side via the
   `CartItem` model already in the schema.
8. **Email verification on signup** — registration works and sends a
   welcome email, but there's no "confirm your email" step yet.
