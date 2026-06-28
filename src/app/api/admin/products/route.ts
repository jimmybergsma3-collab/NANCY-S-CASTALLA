import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { calculatePricing } from "@/lib/pricing";
import { createProduct, deleteProduct, getProducts } from "@/lib/product-store";
import { hasSupabaseAdmin } from "@/lib/env";
import type { Product } from "@/types/product";
import { getEffectivePackageOptions } from "@/lib/product-packaging";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  const products = await getProducts({ includeHidden: true });
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
  const categories = Array.from(new Set(body.categories?.length ? body.categories : [body.category]));
  const product: Product = {
    ...body,
    id: body.id.trim(),
    category: categories.includes(body.category) ? body.category : categories[0],
    categories,
    price: Number(body.salePriceInclVat),
    costPriceExVat: Number(body.costPriceExVat),
    vatRate: Number(body.vatRate),
    salePriceInclVat: Number(body.salePriceInclVat),
    marginPercent: pricing.marginPercent,
    profitPerUnit: pricing.profitPerUnit,
    unitCost: Number(body.unitCost || body.costPriceExVat),
    packageOptions: getEffectivePackageOptions(body).map((option) => ({
      label: String(option.label).trim(),
      quantity: Number(option.quantity),
      salePriceInclVat: Number(option.salePriceInclVat),
    })).filter((option) => option.label && option.quantity > 0),
    isVisible: Boolean(body.isVisible),
    ingredients: body.ingredients?.trim() ?? "",
    directions: body.directions?.trim() ?? "",
    conservation: body.conservation?.trim() ?? "",
    additionalInfo: body.additionalInfo?.trim() ?? "",
    featured: Boolean(body.featured),
  };

  if (!product.id || !product.name || !product.supplierCode) {
    return NextResponse.json({ ok: false, message: "Product code, name and supplier code are required." }, { status: 400 });
  }

  const saved = await createProduct(product);
  return NextResponse.json({ ok: true, product: saved });
}

export async function DELETE(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is required before products can be deleted from admin." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ ok: false, message: "Product code is required." }, { status: 400 });
  }

  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
