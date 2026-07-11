import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { calculatePricing } from "@/lib/pricing";
import { archiveCurrentCatalogue, createProduct, deleteProduct, getProducts, restoreArchivedProduct } from "@/lib/product-store";
import { hasSupabaseAdmin } from "@/lib/env";
import type { Product } from "@/types/product";
import { getEffectivePackageOptions } from "@/lib/product-packaging";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  const products = await getProducts({ includeHidden: true, includeArchived: true });
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
    sku: (body.sku || body.id).trim(),
    ean: body.ean?.trim() ?? "",
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
    lifecycleStatus: body.lifecycleStatus ?? "active",
    importBatch: body.importBatch?.trim() ?? "",
    archivedAt: body.archivedAt ?? "",
    isVisible: (body.lifecycleStatus ?? "active") === "active" ? Boolean(body.isVisible) : false,
    ingredients: body.ingredients?.trim() ?? "",
    directions: body.directions?.trim() ?? "",
    conservation: body.conservation?.trim() ?? "",
    additionalInfo: body.additionalInfo?.trim() ?? "",
    featured: Boolean(body.featured),
    isNew: Boolean(body.isNew),
    stockQuantity: Number(body.stockQuantity ?? 0),
    minimumStock: Number(body.minimumStock ?? 0),
    trackInventory: Boolean(body.trackInventory),
    weight: body.weight?.trim() ?? "",
    images: (body.images ?? []).map((image) => image.trim()).filter(Boolean),
  };

  if (!product.id || !product.name || !product.supplierCode) {
    return NextResponse.json({ ok: false, message: "Product code, name and supplier code are required." }, { status: 400 });
  }

  try {
    const saved = await createProduct(product);
    return NextResponse.json({ ok: true, product: saved });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Product could not be saved." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is required before products can be deleted from admin." },
      { status: 503 },
    );
  }

  const body = await request.json() as { action?: "archive-current-catalogue" | "restore-archived-product"; id?: string; importBatch?: string; confirmation?: string };
  if (body.action === "archive-current-catalogue") {
    if (body.confirmation !== "ARCHIVE CURRENT CATALOGUE") {
      return NextResponse.json({ ok: false, message: "Type ARCHIVE CURRENT CATALOGUE to archive the current catalogue." }, { status: 400 });
    }
    const archivedCount = await archiveCurrentCatalogue(body.importBatch || "IMPORT_2026_PRELAUNCH");
    return NextResponse.json({ ok: true, archivedCount });
  }
  if (body.action === "restore-archived-product") {
    if (!body.id) return NextResponse.json({ ok: false, message: "Product code is required." }, { status: 400 });
    const product = await restoreArchivedProduct(body.id);
    return NextResponse.json({ ok: true, product });
  }
  return NextResponse.json({ ok: false, message: "Invalid product action." }, { status: 400 });
}

export async function DELETE(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is required before products can be archived from admin." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ ok: false, message: "Product code is required." }, { status: 400 });
  }

  const product = await deleteProduct(id);
  return NextResponse.json({ ok: true, product, message: "Product archived. No data was deleted." });
}
