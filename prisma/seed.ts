import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Fieldnote demo data...");

  // ---- Categories ---------------------------------------------------------
  const packs = await prisma.category.upsert({
    where: { slug: "packs" },
    update: {},
    create: {
      name: "Packs & Bags",
      slug: "packs",
      description: "Load carry for trail, city and everywhere between.",
    },
  });
  const outerwear = await prisma.category.upsert({
    where: { slug: "outerwear" },
    update: {},
    create: {
      name: "Outerwear",
      slug: "outerwear",
      description: "Shells, insulation and layers built for weather.",
    },
  });
  const tools = await prisma.category.upsert({
    where: { slug: "tools" },
    update: {},
    create: {
      name: "Tools & Kit",
      slug: "tools",
      description: "The small gear that earns its weight.",
    },
  });

  // ---- Products -------------------------------------------------------------
  const products = [
    {
      slug: "ridge-35-pack",
      name: "Ridge 35 Pack",
      description:
        "A 35-litre haul pack built from 420D recycled ripstop, with a hip belt that actually stays put on a long approach. Roll-top closure, external lash points, one main compartment — no gimmicks.",
      price: 18900,
      comparePrice: 21900,
      stock: 24,
      featured: true,
      categoryId: packs.id,
      variants: [
        { label: "Moss", stock: 12, priceDiff: 0 },
        { label: "Slate", stock: 12, priceDiff: 0 },
      ],
    },
    {
      slug: "switchback-hip-pack",
      name: "Switchback Hip Pack",
      description:
        "A 4-litre hip pack for the stuff you need without breaking stride: phone, map, snacks, first aid. Dual zip access, water-resistant coated zippers.",
      price: 5400,
      stock: 41,
      featured: false,
      categoryId: packs.id,
      variants: [
        { label: "Clay", stock: 20, priceDiff: 0 },
        { label: "Forest", stock: 21, priceDiff: 0 },
      ],
    },
    {
      slug: "commuter-18-daypack",
      name: "Commuter 18 Daypack",
      description:
        "18 litres, laptop sleeve up to 15in, one strap that doesn't dig in on a bike commute. Built for people who leave the house before sunrise.",
      price: 9800,
      stock: 33,
      featured: true,
      categoryId: packs.id,
      variants: [{ label: "Charcoal", stock: 33, priceDiff: 0 }],
    },
    {
      slug: "stormline-shell-jacket",
      name: "Stormline Shell Jacket",
      description:
        "A 3-layer waterproof shell rated to 20,000mm hydrostatic head, pit zips for venting, and a helmet-compatible hood. Made for weather you didn't check the forecast for.",
      price: 24900,
      comparePrice: 28900,
      stock: 17,
      featured: true,
      categoryId: outerwear.id,
      variants: [
        { label: "S / Moss", stock: 4, priceDiff: 0 },
        { label: "M / Moss", stock: 5, priceDiff: 0 },
        { label: "L / Moss", stock: 4, priceDiff: 0 },
        { label: "M / Rust", stock: 4, priceDiff: 500 },
      ],
    },
    {
      slug: "midweight-insulator",
      name: "Midweight Insulator",
      description:
        "Synthetic fill that keeps its loft when wet, packs down to the size of a water bottle. Your go-to layer three seasons out of four.",
      price: 15900,
      stock: 29,
      featured: false,
      categoryId: outerwear.id,
      variants: [
        { label: "M / Ink", stock: 15, priceDiff: 0 },
        { label: "L / Ink", stock: 14, priceDiff: 0 },
      ],
    },
    {
      slug: "basecamp-fleece-hood",
      name: "Basecamp Fleece Hood",
      description:
        "Grid fleece hoodie for camp evenings and cold mornings. Thumb loops, kangaroo pocket, no logos shouting from the chest.",
      price: 8900,
      stock: 38,
      featured: false,
      categoryId: outerwear.id,
      variants: [
        { label: "S", stock: 12, priceDiff: 0 },
        { label: "M", stock: 13, priceDiff: 0 },
        { label: "L", stock: 13, priceDiff: 0 },
      ],
    },
    {
      slug: "trailhand-multitool",
      name: "Trailhand Multitool",
      description:
        "15 tools in a body that fits a jacket pocket. Locking blade, pliers that don't pinch, a bottle opener you'll use more than the saw.",
      price: 6900,
      stock: 52,
      featured: true,
      categoryId: tools.id,
      variants: [{ label: "Standard", stock: 52, priceDiff: 0 }],
    },
    {
      slug: "lowbeam-headlamp",
      name: "Lowbeam Headlamp",
      description:
        "350 lumens, red-light mode that won't wreck your night vision, USB-C rechargeable. Runs 40 hours on low.",
      price: 4200,
      stock: 60,
      featured: false,
      categoryId: tools.id,
      variants: [{ label: "Standard", stock: 60, priceDiff: 0 }],
    },
    {
      slug: "dry-strike-fire-kit",
      name: "Dry Strike Fire Kit",
      description:
        "Ferro rod, waxed tinder, and a striker in a waterproof case small enough to forget it's in your pack — until you need it.",
      price: 2600,
      stock: 71,
      featured: false,
      categoryId: tools.id,
      variants: [{ label: "Standard", stock: 71, priceDiff: 0 }],
    },
  ];

  const createdProducts: Record<string, string> = {};
  for (const p of products) {
    const { variants, ...productData } = p;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        images: { create: [{ url: "", altText: p.name, isMain: true }] },
        variants: { create: variants },
      },
    });
    createdProducts[p.slug] = created.id;
  }

  // ---- Users ----------------------------------------------------------------
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@fieldnote.co" },
    update: {},
    create: {
      email: "demo@fieldnote.co",
      passwordHash: bcrypt.hashSync("password123", 10),
      name: "Demo Customer",
      role: "CUSTOMER",
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@fieldnote.co" },
    update: {},
    create: {
      email: "admin@fieldnote.co",
      passwordHash: bcrypt.hashSync("admin123", 10),
      name: "Store Admin",
      role: "ADMIN",
    },
  });

  // ---- Address + sample order -------------------------------------------
  const demoAddress = await prisma.address.create({
    data: {
      userId: demoUser.id,
      fullName: "Demo Customer",
      street: "142, MG Road, Indiranagar",
      city: "Bengaluru",
      state: "KA",
      zip: "560038",
      country: "India",
      isDefault: true,
    },
  });

  await prisma.order.create({
    data: {
      userId: demoUser.id,
      status: "SHIPPED",
      subtotal: 24300,
      tax: 4374, // 18% GST
      shipping: 0,
      total: 28674,
      shippingAddressId: demoAddress.id,
      trackingNumber: "1Z999AA10123456784",
      items: {
        create: [
          {
            productId: createdProducts["switchback-hip-pack"],
            productName: "Switchback Hip Pack",
            variant: "Forest",
            quantity: 1,
            price: 5400,
          },
          {
            productId: createdProducts["trailhand-multitool"],
            productName: "Trailhand Multitool",
            quantity: 1,
            price: 6900,
          },
          {
            productId: createdProducts["lowbeam-headlamp"],
            productName: "Lowbeam Headlamp",
            quantity: 3,
            price: 4200,
          },
        ],
      },
    },
  });

  // ---- Reviews ----------------------------------------------------------
  const reviewSeeds = [
    {
      productSlug: "ridge-35-pack",
      rating: 5,
      approved: true,
      comment:
        "Carried this through a week in the Wallowas and the hip belt never dug in once. Worth the price.",
    },
    {
      productSlug: "trailhand-multitool",
      rating: 4,
      approved: true,
      comment:
        "Solid build, though the pliers are a little tight out of the box. Loosened up after a week of use.",
    },
    {
      productSlug: "stormline-shell-jacket",
      rating: 3,
      approved: false,
      comment: "This is spam-flagged test content pending moderation review.",
    },
  ];
  for (const r of reviewSeeds) {
    await prisma.review.create({
      data: {
        userId: demoUser.id,
        userName: demoUser.name,
        productId: createdProducts[r.productSlug],
        rating: r.rating,
        comment: r.comment,
        approved: r.approved,
      },
    });
    const agg = await prisma.review.aggregate({
      where: { productId: createdProducts[r.productSlug], approved: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: createdProducts[r.productSlug] },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
  }

  // ---- Blog ---------------------------------------------------------------
  await prisma.blogPost.upsert({
    where: { slug: "why-we-run-a-lifetime-repair-program" },
    update: {},
    create: {
      slug: "why-we-run-a-lifetime-repair-program",
      title: "Why we run a lifetime repair program",
      excerpt: "Warranties expire. Gear shouldn't have to.",
      content:
        "Most warranties are built around a countdown — a year, two years, then you're on your own. We decided early on that a good repair program should look nothing like that.",
      published: true,
      authorName: "Fieldnote Team",
      metaTitle: "Why we run a lifetime repair program — Fieldnote",
      metaDescription:
        "How Fieldnote's lifetime repair program works and why we built it instead of a standard warranty.",
    },
  });
  await prisma.blogPost.upsert({
    where: { slug: "choosing-a-pack-fabric-that-lasts" },
    update: {},
    create: {
      slug: "choosing-a-pack-fabric-that-lasts",
      title: "Choosing a pack fabric that actually lasts",
      excerpt: "Denier ratings, ripstop weaves, and what actually matters on trail.",
      content:
        "420D recycled ripstop shows up on a lot of spec sheets, ours included, but the number alone tells you less than you'd think.",
      published: true,
      authorName: "Fieldnote Team",
      metaTitle: "Choosing a pack fabric that lasts — Fieldnote",
      metaDescription: "What denier ratings and ripstop weaves actually tell you about pack durability.",
    },
  });

  // ---- Pages --------------------------------------------------------------
  await prisma.page.upsert({
    where: { slug: "shipping-info" },
    update: {
      content:
        "We ship standard (3-5 days, free over ₹500) and express (1-2 days, ₹180 flat) across India. GST @ 18% (CGST 9% + SGST 9% intra-state, IGST 18% inter-state) is calculated at checkout based on your shipping state.",
      metaDescription: "Fieldnote shipping rates, timelines, and coverage across India.",
    },
    create: {
      slug: "shipping-info",
      title: "Shipping Information",
      content:
        "We ship standard (3-5 days, free over ₹500) and express (1-2 days, ₹180 flat) across India. GST @ 18% (CGST 9% + SGST 9% intra-state, IGST 18% inter-state) is calculated at checkout based on your shipping state.",
      published: true,
      metaTitle: "Shipping Information — Fieldnote",
      metaDescription: "Fieldnote shipping rates, timelines, and coverage across India.",
    },
  });

  // ---- Tax rates ------------------------------------------------------------
  // Clear old US rates if re-seeding
  await prisma.taxRate.deleteMany({});
  await prisma.taxRate.createMany({
    data: [
      { label: "GST 0% — Essential (India)", country: "India", region: null, ratePercent: 0, active: true },
      { label: "GST 5% — Essential goods", country: "India", region: null, ratePercent: 5, active: true },
      { label: "GST 12% — Standard", country: "India", region: null, ratePercent: 12, active: true },
      { label: "GST 18% — Standard (default)", country: "India", region: null, ratePercent: 18, active: true },
      { label: "GST 28% — Luxury", country: "India", region: null, ratePercent: 28, active: true },
      // Intra-state examples (CGST+SGST split displayed in invoice)
      { label: "Karnataka GST 18% (CGST 9%+SGST 9%)", country: "India", region: "KA", ratePercent: 18, active: true },
      { label: "Maharashtra GST 18% (CGST 9%+SGST 9%)", country: "India", region: "MH", ratePercent: 18, active: true },
      { label: "Delhi GST 18% (CGST 9%+SGST 9%)", country: "India", region: "DL", ratePercent: 18, active: true },
      { label: "Tamil Nadu GST 18%", country: "India", region: "TN", ratePercent: 18, active: true },
    ],
    skipDuplicates: true,
  });

  // ---- Store settings ---------------------------------------------------
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      currency: "INR",
      addressLine: "142, MG Road, Bengaluru, KA 560001",
      flatShippingRate: 7000,
      expressShippingRate: 18000,
      freeShippingThreshold: 50000,
      defaultTaxPercent: 18,
    },
    create: {
      id: "default",
      storeName: "Fieldnote",
      supportEmail: "support@fieldnote.co",
      currency: "INR",
      addressLine: "142, MG Road, Bengaluru, KA 560001",
      flatShippingRate: 7000,
      expressShippingRate: 18000,
      freeShippingThreshold: 50000,
      defaultTaxPercent: 18,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
