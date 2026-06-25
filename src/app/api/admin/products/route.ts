import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { calculatePricing } from "@/lib/pricing";
import { createProduct, getProducts } from "@/lib/product-store";
import { hasSupabaseAdmin } from "@/lib/env";
import type { Product } from "@/types/product";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  const products = await getProducts();
  return NextResponse.json({ ok: true, products, databaseEnabled: hasSupabaseAdmin() });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is required before products can be saved from admin." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Product;
  const pricing = calculatePricing(body);
  const product: Product = {
    ...body,
    id: body.id.trim(),
    price: Number(body.salePriceInclVat),
    costPriceExVat: Number(body.costPriceExVat),
    vatRate: Number(body.vatRate),
    salePriceInclVat: Number(body.salePriceInclVat),
    marginPercent: pricing.marginPercent,
    profitPerUnit: pricing.profitPerUnit,
    unitCost: Number(body.unitCost || body.costPriceExVat),
    packageOptions: (body.packageOptions ?? []).map((option) => ({
      label: String(option.label).trim(),
      quantity: Number(option.quantity),
      salePriceInclVat: Number(option.salePriceInclVat),
    })).filter((option) => option.label && option.quantity > 0),
    featured: Boolean(body.featured),
  };

  if (!product.id || !product.name || !product.supplierCode) {
    return NextResponse.json({ ok: false, message: "Product code, name and supplier code are required." }, { status: 400 });
  }

  const saved = await createProduct(product);
  return NextResponse.json({ ok: true, product: saved });
}
