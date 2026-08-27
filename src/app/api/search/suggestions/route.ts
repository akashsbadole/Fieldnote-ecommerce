import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const products = await getProducts({ q });
  const results = products.slice(0, 6).map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
  }));

  return NextResponse.json({ results });
}
