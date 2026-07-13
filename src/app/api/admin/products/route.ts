import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { calculatePricing } from "@/lib/pricing";
import { archiveCurrentCatalogue, createProduct, deleteProduct, getProducts, restoreArchivedProduct } from "@/lib/product-store";
import { hasSupabaseAdmin } from "@/lib/env";
import type { Product } from "@/types/product";
import { getEffectivePackageOptions } from "@/lib/product-packaging";
import { evaluateSalesUnitSafety, isCaseLikePackage, isSupplierImportProduct } from "@/lib/sales-unit-safety";

function diagnosticId() {
  return `admin_product_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function getNextProductId() {
  const products = await getProducts({ includeHidden: true, includeArchived: true });
  const highest = products.reduce((max, product) => {
    const match = /^NC-(\d{5})$/i.exec(product.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `NC-${String(Math.min(highest + 1, 99999)).padStart(5, "0")}`;
}

function validateOnlineProduct(product: Product) {
  if (!product.isVisible || (product.lifecycleStatus ?? "active") !== "active") return "";
  if (!product.name.trim()) return "Product name is required before publishing.";
  if (!product.unit.trim()) return "Package / sales unit is required before publishing.";
  if (Number(product.salePriceInclVat) <= 0) return "Sale price incl IVA must be greater than 0 before publishing.";
  if (![4, 10, 21].includes(Number(product.vatRate))) return "IVA must be 4%, 10% or 21% before publishing.";
  if (!product.category) return "Category is required before publishing.";
  if (!product.imageUrl?.trim()) return "A product photo is required before publishing.";
  if (!product.salesUnitType) return "Public sales unit type must be confirmed before publishing.";
  if (!product.salesUnitConfirmed || !product.priceBasisConfirmed) return "Sales unit and price basis must be confirmed before publishing.";
  if (isCaseLikePackage(product.unit) && product.salesUnitType === "per_unit") {
    return "Package looks like a case. Choose case or custom pack as public sales unit.";
  }
  return "";
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  const products = await getProducts({ includeHidden: true, includeArchived: true });
  return NextResponse.json({ ok: true, products, databaseEnabled: hasSupabaseAdmin() });
}

export async function POST(request: Request) {
  const id = diagnosticId();
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required.", diagnosticId: id }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json(
      { ok: false, message: "Supabase is required before products can be saved from admin.", diagnosticId: id },
      { status: 503 },
    );
  }

  let body: Product;
  try {
    body = (await request.json()) as Product;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid product JSON.", diagnosticId: id }, { status: 400 });
  }
  const pricing = calculatePricing(body);
  const categories = Array.from(new Set(body.categories?.length ? body.categories : [body.category]));
  const productId = body.id?.trim() || await getNextProductId();
  const product: Product = {
    ...body,
    id: productId,
    sku: (body.sku || productId).trim(),
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
    salesUnitType: body.salesUnitType ?? "",
    salesUnitQuantity: Number(body.salesUnitQuantity ?? 0),
    salesUnitConfirmed: Boolean(body.salesUnitConfirmed),
    priceBasisConfirmed: Boolean(body.priceBasisConfirmed),
    supplierCasePrice: Number(body.supplierCasePrice || body.costPriceExVat || 0),
    supplierUnitPrice: Number(body.supplierUnitPrice || body.unitCost || 0),
    supplierCaseQuantity: Number(body.supplierCaseQuantity ?? 0),
    sourcePackageText: body.sourcePackageText?.trim() ?? "",
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

  if (!product.id || !product.name) {
    return NextResponse.json({ ok: false, message: "Product code and name are required.", diagnosticId: id }, { status: 400 });
  }
  const onlineValidation = validateOnlineProduct(product);
  if (onlineValidation) {
    return NextResponse.json({ ok: false, message: onlineValidation, diagnosticId: id }, { status: 400 });
  }
  const safety = evaluateSalesUnitSafety(product);
  if (isSupplierImportProduct(product) && product.isVisible && !safety.ok) {
    return NextResponse.json({ ok: false, message: `Imported product cannot be published yet: ${safety.reason}`, diagnosticId: id }, { status: 409 });
  }

  try {
    const saved = await createProduct(product);
    return NextResponse.json({ ok: true, product: saved, diagnosticId: id });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Product could not be saved.", diagnosticId: id }, { status: 409 });
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
