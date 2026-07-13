"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Camera, Eye, EyeOff, ExternalLink, Pencil, Plus, RotateCcw, X } from "lucide-react";
import type { Product } from "@/types/product";
import { calculatePricing, calculateUnitCost, formatEuro, getSupplierPackQuantity } from "@/lib/pricing";
import { getProductCategories, productCategories as availableProductCategories, productMatchesCategory } from "@/lib/product-categories";
import { evaluateSalesUnitSafety, isSupplierImportProduct } from "@/lib/sales-unit-safety";

const defaultProduct: Product = {
  id: "",
  uuid: "",
  sku: "",
  ean: "",
  name: "",
  imageUrl: "",
  images: [],
  isVisible: false,
  isNew: false,
  lifecycleStatus: "active",
  importBatch: "",
  archivedAt: "",
  category: "British & Irish products",
  categories: ["British & Irish products"],
  description: "",
  price: 0,
  unit: "",
  stockStatus: "available",
  type: "ambient",
  origin: "Other",
  featured: false,
  costPriceExVat: 0,
  vatRate: 10,
  salePriceInclVat: 0,
  marginPercent: 0,
  profitPerUnit: 0,
  supplier: "",
  supplierCode: "",
  packSize: "",
  unitCost: 0,
  salesUnitType: "",
  salesUnitQuantity: 0,
  salesUnitConfirmed: false,
  priceBasisConfirmed: false,
  supplierCasePrice: 0,
  supplierUnitPrice: 0,
  supplierCaseQuantity: 0,
  sourcePackageText: "",
  stockQuantity: 0,
  minimumStock: 0,
  trackInventory: false,
  weight: "",
  packageOptions: [],
  ingredients: "",
  directions: "",
  conservation: "",
  additionalInfo: "",
};

function getNextProductId(products: Product[]) {
  const highest = products.reduce((max, product) => {
    const match = /^NC-(\d{5})$/i.exec(product.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const next = Math.min(highest + 1, 99999);
  return `NC-${String(next).padStart(5, "0")}`;
}

function createBlankProduct(products: Product[]) {
  return { ...defaultProduct, id: getNextProductId(products) };
}

type QuickProductForm = {
  id: string;
  name: string;
  unit: string;
  salePriceInclVat: string;
  vatRate: 4 | 10 | 21;
  category: Product["category"];
  description: string;
  type: Product["type"];
  stockStatus: Extract<Product["stockStatus"], "available" | "preorder">;
};

type QuickMode = "supplier" | "manual";

function createBlankQuickProduct(products: Product[]): QuickProductForm {
  return {
    id: getNextProductId(products),
    name: "",
    unit: "",
    salePriceInclVat: "",
    vatRate: 10,
    category: "British & Irish products",
    description: "",
    type: "ambient",
    stockStatus: "preorder",
  };
}

function inferSalesUnitType(unit: string): Product["salesUnitType"] {
  const normalized = unit.trim().toLowerCase();
  if (/^\d+\s*[x×]\s*\d+/.test(normalized) || /\b\d+\s*(stuks|pcs|units)\b/.test(normalized)) return "case";
  if (/\bkg\b/.test(normalized)) return "per_kg";
  return "per_unit";
}

function inferSalesUnitQuantity(unit: string, salesUnitType: Product["salesUnitType"]) {
  if (salesUnitType !== "case" && salesUnitType !== "custom_pack") return 0;
  const match = unit.trim().toLowerCase().match(/^(\d+)\s*[x×]|\b(\d+)\s*(stuks|pcs|units)\b/);
  return Number(match?.[1] || match?.[2] || 1);
}

function packageOptionsToText(product: Product) {
  return (product.packageOptions ?? [])
    .map((option) => `${option.label} | ${option.quantity} | ${option.salePriceInclVat}`)
    .join("\n");
}

function textToPackageOptions(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", quantity = "1", salePriceInclVat = "0"] = line.split("|").map((part) => part.trim());
      return {
        label,
        quantity: Number(quantity),
        salePriceInclVat: Number(salePriceInclVat),
      };
    })
    .filter((option) => option.label && option.quantity > 0);
}

function Field({
  children,
  help,
  label,
}: {
  children: React.ReactNode;
  help?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-forest">{label}</span>
      <div className="mt-1">{children}</div>
      {help ? <span className="mt-1 block text-xs leading-5 text-forest/60">{help}</span> : null}
    </label>
  );
}

export function AdminProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [product, setProduct] = useState<Product>(() => createBlankProduct(initialProducts));
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<Product["lifecycleStatus"] | "All">("active");
  const [duplicateFilter, setDuplicateFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [packageOptionsText, setPackageOptionsText] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickMode, setQuickMode] = useState<QuickMode>("supplier");
  const [quickProduct, setQuickProduct] = useState<QuickProductForm>(() => createBlankQuickProduct(initialProducts));
  const [quickImage, setQuickImage] = useState<File | null>(null);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [quickSavedProduct, setQuickSavedProduct] = useState<Product | null>(null);
  const [quickSupplier, setQuickSupplier] = useState("");
  const [quickSupplierQuery, setQuickSupplierQuery] = useState("");
  const [quickSupplierResults, setQuickSupplierResults] = useState<Product[]>([]);
  const [quickSupplierLoading, setQuickSupplierLoading] = useState(false);
  const [quickSelectedProduct, setQuickSelectedProduct] = useState<Product | null>(null);
  const pricing = calculatePricing(product);
  const supplierPackQuantity = getSupplierPackQuantity(product.packSize);
  const calculatedUnitCost = calculateUnitCost(product.costPriceExVat, product.packSize);
  const salesUnitSafety = evaluateSalesUnitSafety(product);
  const isEditing = products.some((item) => item.id === product.id);
  const productCategories = useMemo(() => ["All", ...availableProductCategories], []);
  const supplierNames = useMemo(() => {
    const names = products
      .filter((item) => item.lifecycleStatus !== "archived" && item.importBatch?.trim() && item.supplierCode?.trim())
      .map((item) => item.supplier)
      .filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [products]);
  const duplicateKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of products) {
      const code = item.supplierCode.trim().toLowerCase();
      if (!code) continue;
      const key = `${item.supplier.trim().toLowerCase()}|${code}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([key]) => key));
  }, [products]);
  const activeCount = products.filter((item) => (item.lifecycleStatus ?? "active") === "active").length;
  const archivedCount = products.filter((item) => item.lifecycleStatus === "archived").length;
  const onlineCount = products.filter((item) => item.isVisible !== false && (item.lifecycleStatus ?? "active") === "active").length;
  const duplicateCount = products.filter((item) => duplicateKeys.has(`${item.supplier.trim().toLowerCase()}|${item.supplierCode.trim().toLowerCase()}`)).length;
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return products.filter((item) => {
      const matchesQuery = query
        ? [item.id, item.name, getProductCategories(item).join(" "), item.supplier, item.supplierCode, item.unit]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesCategory = categoryFilter === "All" || productMatchesCategory(item, categoryFilter as Product["category"]);
      const matchesStatus = statusFilter === "All" || (item.lifecycleStatus ?? "active") === statusFilter;
      const matchesVisibility = visibilityFilter === "All" ||
        (visibilityFilter === "Online" ? item.isVisible !== false : item.isVisible === false);
      const duplicateKey = `${item.supplier.trim().toLowerCase()}|${item.supplierCode.trim().toLowerCase()}`;
      const matchesDuplicate = duplicateFilter === "All" || duplicateKeys.has(duplicateKey);

      return matchesQuery && matchesCategory && matchesStatus && matchesVisibility && matchesDuplicate;
    });
  }, [categoryFilter, duplicateFilter, duplicateKeys, productSearch, products, statusFilter, visibilityFilter]);

  function setActiveProduct(nextProduct: Product) {
    setProduct(nextProduct);
    setPackageOptionsText(packageOptionsToText(nextProduct));
  }

  async function loadProducts() {
    const response = await fetch("/api/admin/products");
    if (response.ok) {
      const result = (await response.json()) as { products: Product[] };
      setProducts(result.products);
      if (!product.id) {
        setActiveProduct(createBlankProduct(result.products));
      }
    }
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await saveProductPayload(product);
    if (!result.ok) {
      setMessage(result.message || "Product could not be saved.");
      return;
    }
    setMessage(isEditing ? "Product updated." : "Product saved.");
    const refreshedProducts = await loadProductsAndReturn();
    if (isEditing && result.product) {
      setActiveProduct({ ...defaultProduct, ...result.product });
    } else {
      setActiveProduct(createBlankProduct(refreshedProducts));
    }
  }

  async function loadProductsAndReturn() {
    const response = await fetch("/api/admin/products");
    if (!response.ok) {
      return products;
    }

    const result = (await response.json()) as { products: Product[] };
    setProducts(result.products);
    return result.products;
  }

  async function deleteCurrentProduct() {
    if (isEditing) await deleteProduct(product);
  }

  async function deleteProduct(item: Product) {
    const confirmed = window.confirm(`Archive ${item.name || item.id} (${item.id})? No data, image or relation will be deleted.`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(item.id)}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setMessage(result.message || "Product could not be deleted.");
      return;
    }

    setMessage("Product archived. No data was deleted.");
    const refreshedProducts = await loadProductsAndReturn();
    if (product.id === item.id) {
      setActiveProduct({ ...defaultProduct, ...refreshedProducts.find((next) => next.id === item.id) } as Product);
    }
  }

  async function archiveCurrentCatalogue() {
    const confirmation = window.prompt("Type ARCHIVE CURRENT CATALOGUE to archive all current products under IMPORT_2026_PRELAUNCH.");
    if (confirmation !== "ARCHIVE CURRENT CATALOGUE") return;
    setMessage("Archiving current catalogue...");
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive-current-catalogue", importBatch: "IMPORT_2026_PRELAUNCH", confirmation }),
    });
    const result = (await response.json()) as { ok: boolean; archivedCount?: number; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Catalogue could not be archived.");
      return;
    }
    const refreshedProducts = await loadProductsAndReturn();
    setStatusFilter("archived");
    setActiveProduct(createBlankProduct(refreshedProducts));
    setMessage(`${result.archivedCount ?? 0} products archived under IMPORT_2026_PRELAUNCH. Nothing was deleted.`);
  }

  async function restoreProduct(item: Product) {
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore-archived-product", id: item.id }),
    });
    const result = (await response.json()) as { ok: boolean; product?: Product; message?: string };
    if (!response.ok || !result.ok || !result.product) {
      setMessage(result.message || "Product could not be restored.");
      return;
    }
    setMessage("Product restored as active.");
    await loadProductsAndReturn();
    setActiveProduct({ ...defaultProduct, ...result.product });
  }

  async function toggleProductVisibility(item: Product) {
    if ((item.lifecycleStatus ?? "active") !== "active") {
      setMessage("Only active products can be put online. Restore or change the status first.");
      return;
    }
    const nextVisible = item.isVisible === false;
    const result = await saveProductPayload({ ...item, isVisible: nextVisible });

    if (!result.ok || !result.product) {
      setMessage(result.message || "Online status could not be changed.");
      return;
    }

    setMessage(nextVisible ? "Product is now online." : "Product is now offline.");
    await loadProductsAndReturn();
    if (product.id === item.id) {
      setActiveProduct({ ...defaultProduct, ...result.product });
    }
  }

  async function saveProductPayload(nextProduct: Product) {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextProduct),
    });
    const result = (await response.json()) as { ok: boolean; message?: string; product?: Product };
    return response.ok ? result : { ...result, ok: false };
  }

  async function uploadImage() {
    if (!selectedImage) {
      setMessage("Choose a photo first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("productId", product.id || product.name || "product");

      const response = await fetch("/api/admin/upload-product-image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { ok: boolean; imageUrl?: string; message?: string };

      if (!response.ok || !result.ok || !result.imageUrl) {
        throw new Error(result.message || "Photo could not be uploaded.");
      }

      const nextProduct = { ...product, imageUrl: result.imageUrl };
      setProduct(nextProduct);
      setSelectedImage(null);

      if (isEditing) {
        const saveResult = await saveProductPayload(nextProduct);
        if (!saveResult.ok) {
          throw new Error(saveResult.message || "Photo uploaded, but product could not be updated.");
        }
        setMessage("Photo uploaded and product updated.");
        await loadProducts();
      } else {
        setMessage("Photo uploaded. Complete the product fields and click Save product.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Photo could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  function resetQuickProduct(nextProducts = products) {
    setQuickProduct(createBlankQuickProduct(nextProducts));
    setQuickImage(null);
    setQuickSavedProduct(null);
    setQuickSelectedProduct(null);
    setQuickMessage("");
  }

  function updateQuick<K extends keyof QuickProductForm>(key: K, value: QuickProductForm[K]) {
    setQuickProduct((current) => ({ ...current, [key]: value }));
  }

  async function uploadQuickImage(productId: string) {
    if (!quickImage) {
      throw new Error("Choose a product photo first.");
    }

    const formData = new FormData();
    formData.append("file", quickImage);
    formData.append("productId", productId);

    const response = await fetch("/api/admin/upload-product-image", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as { ok: boolean; imageUrl?: string; message?: string };
    if (!response.ok || !result.ok || !result.imageUrl) {
      throw new Error(result.message || "Photo could not be uploaded.");
    }
    return result.imageUrl;
  }

  async function searchQuickSupplierProducts() {
    setQuickSupplierLoading(true);
    setQuickMessage("");
    try {
      const params = new URLSearchParams({ mode: "quick-supplier", q: quickSupplierQuery });
      if (quickSupplier) params.set("supplier", quickSupplier);
      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const result = (await response.json()) as { ok: boolean; products?: Product[]; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Supplier products could not be loaded.");
      }
      setQuickSupplierResults(result.products ?? []);
    } catch (error) {
      setQuickMessage(error instanceof Error ? error.message : "Supplier products could not be loaded.");
    } finally {
      setQuickSupplierLoading(false);
    }
  }

  function selectQuickSupplierProduct(item: Product) {
    setQuickSelectedProduct(item);
    setQuickSavedProduct(null);
    setQuickImage(null);
    setQuickMessage(item.isVisible ? "Dit product is al online. Je kunt het bestaande product bewerken." : "");
    setQuickProduct({
      id: item.id,
      name: item.name,
      unit: item.unit || item.sourcePackageText || item.packSize || "",
      salePriceInclVat: item.salePriceInclVat ? String(item.salePriceInclVat) : "",
      vatRate: ([4, 10, 21].includes(Number(item.vatRate)) ? Number(item.vatRate) : 10) as 4 | 10 | 21,
      category: item.category,
      description: item.description ?? "",
      type: item.type,
      stockStatus: item.stockStatus === "available" ? "available" : "preorder",
    });
  }

  function selectNextQuickSupplierProduct() {
    const currentIndex = quickSelectedProduct ? quickSupplierResults.findIndex((item) => item.id === quickSelectedProduct.id) : -1;
    const next = quickSupplierResults.slice(currentIndex + 1).find((item) => item.lifecycleStatus !== "active" || item.isVisible === false)
      ?? quickSupplierResults.find((item) => item.lifecycleStatus !== "active" || item.isVisible === false);
    if (next) {
      selectQuickSupplierProduct(next);
    } else {
      resetQuickProduct();
      setQuickMode("supplier");
      setQuickMessage("Geen volgend leverancierproduct gevonden in deze zoeklijst.");
    }
  }

  async function saveQuickProduct(mode: "draft" | "online") {
    setQuickSaving(true);
    setQuickMessage("");
    setQuickSavedProduct(null);

    try {
      if (!quickProduct.name.trim()) throw new Error("Product name is required.");
      if (!quickProduct.unit.trim()) throw new Error("Package / sales unit is required.");
      if (Number(quickProduct.salePriceInclVat) <= 0) throw new Error("Sale price incl IVA must be greater than 0.");
      if (!quickProduct.category) throw new Error("Choose a category.");

      const existing = quickMode === "supplier" ? quickSelectedProduct : null;
      if (quickMode === "supplier" && !existing) throw new Error("Choose a supplier product first.");
      const imageUrl = quickImage ? await uploadQuickImage(quickProduct.id) : existing?.imageUrl ?? "";
      if (!imageUrl) throw new Error("Choose or take a product photo first.");
      const salesUnitType = inferSalesUnitType(quickProduct.unit);
      const salesUnitQuantity = inferSalesUnitQuantity(quickProduct.unit, salesUnitType);
      const baseProduct = existing ?? defaultProduct;
      const payload: Product = {
        ...baseProduct,
        id: quickProduct.id,
        sku: baseProduct.sku || quickProduct.id,
        name: quickProduct.name.trim(),
        imageUrl,
        images: Array.from(new Set([imageUrl, ...(baseProduct.images ?? [])].filter(Boolean))),
        isVisible: mode === "online",
        lifecycleStatus: mode === "online" ? "active" : "draft",
        category: quickProduct.category,
        categories: [quickProduct.category],
        description: quickProduct.description.trim(),
        price: Number(quickProduct.salePriceInclVat),
        unit: quickProduct.unit.trim(),
        stockStatus: quickProduct.stockStatus,
        type: quickProduct.type,
        featured: false,
        costPriceExVat: baseProduct.costPriceExVat ?? 0,
        vatRate: quickProduct.vatRate,
        salePriceInclVat: Number(quickProduct.salePriceInclVat),
        marginPercent: baseProduct.marginPercent ?? 0,
        profitPerUnit: baseProduct.profitPerUnit ?? 0,
        supplier: baseProduct.supplier ?? "",
        supplierCode: baseProduct.supplierCode ?? "",
        packSize: baseProduct.packSize ?? "",
        unitCost: baseProduct.unitCost ?? 0,
        salesUnitType,
        salesUnitQuantity,
        salesUnitConfirmed: true,
        priceBasisConfirmed: true,
        supplierCasePrice: baseProduct.supplierCasePrice ?? 0,
        supplierUnitPrice: baseProduct.supplierUnitPrice ?? 0,
        supplierCaseQuantity: baseProduct.supplierCaseQuantity ?? 0,
        sourcePackageText: baseProduct.sourcePackageText ?? "",
        stockQuantity: 0,
        minimumStock: baseProduct.minimumStock ?? 0,
        trackInventory: false,
        packageOptions: baseProduct.packageOptions ?? [],
        importBatch: baseProduct.importBatch ?? "",
        ean: baseProduct.ean ?? "",
      };

      const result = await saveProductPayload(payload);
      if (!result.ok || !result.product) {
        throw new Error(result.message || "Product could not be saved.");
      }

      const refreshedProducts = await loadProductsAndReturn();
      setQuickSavedProduct(result.product);
      setQuickMessage(`${mode === "online" ? "Product online" : "Concept saved"}: ${result.product.id}`);
      setProductSearch(result.product.id);
      setStatusFilter(mode === "online" ? "active" : "draft");
      setVisibilityFilter("All");
      setQuickImage(null);
      if (quickMode === "manual") {
        setQuickProduct(createBlankQuickProduct(refreshedProducts));
      } else {
        setQuickSelectedProduct(result.product);
        setQuickProduct({
          id: result.product.id,
          name: result.product.name,
          unit: result.product.unit,
          salePriceInclVat: String(result.product.salePriceInclVat || ""),
          vatRate: ([4, 10, 21].includes(Number(result.product.vatRate)) ? Number(result.product.vatRate) : 10) as 4 | 10 | 21,
          category: result.product.category,
          description: result.product.description,
          type: result.product.type,
          stockStatus: result.product.stockStatus === "available" ? "available" : "preorder",
        });
        setQuickSupplierResults((current) => current.map((item) => item.id === result.product?.id ? result.product : item));
      }
      return true;
    } catch (error) {
      setQuickMessage(error instanceof Error ? error.message : "Product could not be saved.");
      return false;
    } finally {
      setQuickSaving(false);
    }
  }

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setProduct((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(category: Product["category"]) {
    setProduct((current) => {
      const selected = getProductCategories(current);
      const isSelected = selected.includes(category);

      if (isSelected && selected.length === 1) {
        return current;
      }

      const categories = isSelected ? selected.filter((item) => item !== category) : [...selected, category];
      return {
        ...current,
        category: categories.includes(current.category) ? current.category : categories[0],
        categories,
      };
    });
  }

  return (
    <>
      <div className="mt-6 rounded-lg border border-forest/10 bg-cream p-4 shadow-soft sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-forest">Snel product toevoegen</h2>
          <p className="mt-1 text-sm text-forest/65">Werk onderweg snel een bestaand leveranciersproduct af, of voeg apart een handmatig product toe.</p>
        </div>
        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-base font-bold text-cream shadow-soft sm:mt-0 sm:w-auto"
          onClick={() => {
            setQuickMode("supplier");
            resetQuickProduct();
            setQuickOpen(true);
          }}
          type="button"
        >
          <Plus size={18} />
          Snel product toevoegen
        </button>
      </div>

      {quickOpen ? (
        <div className="fixed inset-0 z-50 bg-forest/50 sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="flex h-full flex-col overflow-hidden bg-linen sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-xl sm:rounded-xl sm:shadow-2xl">
            <div className="flex items-center justify-between border-b border-forest/10 bg-cream px-4 py-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-forest">Snel product toevoegen</h2>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-coffee">{quickMode === "supplier" ? "Leverancierslijst" : quickProduct.id}</p>
              </div>
              <button className="grid h-11 w-11 place-items-center rounded-full border border-forest/15 bg-white text-forest" onClick={() => setQuickOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              <div className="grid grid-cols-2 gap-2">
                <button className={`rounded-lg px-3 py-3 text-sm font-bold ${quickMode === "supplier" ? "bg-forest text-cream" : "bg-white text-forest"}`} onClick={() => { setQuickMode("supplier"); resetQuickProduct(); }} type="button">
                  Uit leverancierslijst
                </button>
                <button className={`rounded-lg px-3 py-3 text-sm font-bold ${quickMode === "manual" ? "bg-forest text-cream" : "bg-white text-forest"}`} onClick={() => { setQuickMode("manual"); resetQuickProduct(); }} type="button">
                  Nieuw handmatig product
                </button>
              </div>

              {quickMode === "supplier" ? (
                <div className="space-y-4 rounded-lg border border-forest/10 bg-cream p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <select className="h-12 rounded-lg border border-forest/15 bg-white px-3 text-base" onChange={(event) => setQuickSupplier(event.target.value)} value={quickSupplier}>
                      <option value="">Alle leveranciers</option>
                      {supplierNames.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
                    </select>
                    <button className="h-12 rounded-full bg-forest px-5 font-bold text-cream disabled:opacity-50" disabled={quickSupplierLoading} onClick={() => void searchQuickSupplierProducts()} type="button">
                      {quickSupplierLoading ? "Zoeken..." : "Zoeken"}
                    </button>
                  </div>
                  <input className="h-12 w-full rounded-lg border border-forest/15 bg-white px-3 text-base" onChange={(event) => setQuickSupplierQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void searchQuickSupplierProducts(); }} placeholder="Zoek naam, supplier code, EAN, verpakking of NC-code" value={quickSupplierQuery} />
                  {quickSupplierResults.length ? (
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {quickSupplierResults.map((item) => (
                        <button className={`w-full rounded-lg border p-3 text-left ${quickSelectedProduct?.id === item.id ? "border-forest bg-white" : "border-forest/10 bg-white/80"}`} key={item.id} onClick={() => selectQuickSupplierProduct(item)} type="button">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-bold text-forest">{item.name}</div>
                              <div className="text-xs text-forest/60">{item.supplier} · {item.supplierCode || "no supplier code"} · {item.id}</div>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.isVisible ? "bg-leaf/10 text-leaf" : "bg-coffee/10 text-coffee"}`}>{item.isVisible ? "Online" : item.lifecycleStatus ?? "draft"}</span>
                          </div>
                          <div className="mt-2 grid gap-1 text-xs text-forest/70">
                            <span>Bronverpakking: {item.sourcePackageText || item.packSize || item.unit || "-"}</span>
                            <span>Doosprijs: {formatEuro(item.supplierCasePrice || item.costPriceExVat || 0)} · Bronstukprijs: {formatEuro(item.supplierUnitPrice || item.unitCost || 0)}</span>
                            <span>Batch: {item.importBatch || "-"}</span>
                            <span>Review: tax/category/image/package/translation controleren</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-forest/65">Kies een leverancier en zoek een bestaand geïmporteerd product.</p>
                  )}
                </div>
              ) : null}

              {quickMode === "manual" || quickSelectedProduct ? (
                <>
                  {quickSelectedProduct ? (
                    <div className="rounded-lg border border-forest/10 bg-white p-3 text-sm text-forest">
                      <div className="font-bold">{quickSelectedProduct.name}</div>
                      <div className="mt-2 grid gap-1 text-xs text-forest/70">
                        <span>Nancy-code: {quickSelectedProduct.id}</span>
                        <span>Leverancier: {quickSelectedProduct.supplier}</span>
                        <span>Supplier code: {quickSelectedProduct.supplierCode}</span>
                        <span>Bronverpakking: {quickSelectedProduct.sourcePackageText || quickSelectedProduct.packSize || "-"}</span>
                        <span>Doosprijs: {formatEuro(quickSelectedProduct.supplierCasePrice || quickSelectedProduct.costPriceExVat || 0)}</span>
                        <span>Bronstukprijs: {formatEuro(quickSelectedProduct.supplierUnitPrice || quickSelectedProduct.unitCost || 0)}</span>
                        <span>Import batch: {quickSelectedProduct.importBatch}</span>
                      </div>
                    </div>
                  ) : null}
                  <Field label="Productnaam">
                    <input className="h-12 w-full rounded-lg border border-forest/15 bg-white px-4 text-base" onChange={(event) => updateQuick("name", event.target.value)} placeholder="Magners Cider" value={quickProduct.name} />
                  </Field>
                  <Field help="De prijs geldt exact voor deze verkoopeenheid. Bijvoorbeeld: 1 blik 500 ml, 6 stuks of 24 x 330 ml." label="Publieke verpakking / verkoopeenheid">
                    <input className="h-12 w-full rounded-lg border border-forest/15 bg-white px-4 text-base" onChange={(event) => updateQuick("unit", event.target.value)} placeholder="1 blik 500 ml" value={quickProduct.unit} />
                  </Field>
                  <Field label="Verkoopprijs incl. IVA">
                    <input className="h-12 w-full rounded-lg border border-forest/15 bg-white px-4 text-base" inputMode="decimal" min="0" onChange={(event) => updateQuick("salePriceInclVat", event.target.value)} placeholder="2.25" step="0.01" type="number" value={quickProduct.salePriceInclVat} />
                  </Field>
                  <Field label="IVA">
                    <div className="grid grid-cols-3 gap-2">
                      {([4, 10, 21] as const).map((rate) => (
                        <button className={`h-12 rounded-lg border text-base font-bold ${quickProduct.vatRate === rate ? "border-forest bg-forest text-cream" : "border-forest/15 bg-white text-forest"}`} key={rate} onClick={() => updateQuick("vatRate", rate)} type="button">{rate}%</button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Foto uploaden">
                    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-forest/20 bg-white px-4 py-5 text-center text-forest">
                      <Camera size={28} />
                      <span className="mt-2 text-sm font-bold">{quickImage ? quickImage.name : quickSelectedProduct?.imageUrl ? "Bestaande foto behouden of nieuwe kiezen" : "Camera of fotobibliotheek openen"}</span>
                      <span className="mt-1 text-xs text-forest/55">JPG, PNG of WebP, maximaal 5MB</span>
                      <input accept="image/*" capture="environment" className="sr-only" onChange={(event) => setQuickImage(event.target.files?.[0] ?? null)} type="file" />
                    </label>
                  </Field>
                  <Field label="Categorie">
                    <select className="h-12 w-full rounded-lg border border-forest/15 bg-white px-4 text-base" onChange={(event) => updateQuick("category", event.target.value as Product["category"])} value={quickProduct.category}>
                      {availableProductCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </Field>
                  <Field help="Optioneel. Kort en klantvriendelijk." label="Korte beschrijving">
                    <textarea className="min-h-24 w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-base" onChange={(event) => updateQuick("description", event.target.value)} placeholder="Korte tekst voor de productkaart." value={quickProduct.description} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Producttype">
                      <select className="h-12 w-full rounded-lg border border-forest/15 bg-white px-4 text-base" onChange={(event) => updateQuick("type", event.target.value as Product["type"])} value={quickProduct.type}>
                        <option value="ambient">ambient</option>
                        <option value="fresh">fresh</option>
                        <option value="frozen">frozen</option>
                      </select>
                    </Field>
                    <Field label="Beschikbaarheid">
                      <select className="h-12 w-full rounded-lg border border-forest/15 bg-white px-4 text-base" onChange={(event) => updateQuick("stockStatus", event.target.value as QuickProductForm["stockStatus"])} value={quickProduct.stockStatus}>
                        <option value="preorder">preorder</option>
                        <option value="available">available</option>
                      </select>
                    </Field>
                  </div>
                </>
              ) : null}
              {quickMessage ? (
                <div className="rounded-lg border border-forest/10 bg-white p-3 text-sm font-bold text-forest">
                  {quickMessage}
                  {quickSavedProduct ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="rounded-full border border-forest/20 px-3 py-2 text-xs font-bold" onClick={() => { if (quickMode === "supplier") selectNextQuickSupplierProduct(); else resetQuickProduct(); }} type="button">{quickMode === "supplier" ? "Volgend leverancierproduct" : "Volgend product toevoegen"}</button>
                      <button className="rounded-full border border-forest/20 px-3 py-2 text-xs font-bold" onClick={() => { setActiveProduct({ ...defaultProduct, ...quickSavedProduct }); setQuickOpen(false); }} type="button">Volledig bewerken</button>
                      {quickSavedProduct.isVisible ? (
                        <Link className="rounded-full bg-forest px-3 py-2 text-xs font-bold text-cream" href={`/en/products/${encodeURIComponent(quickSavedProduct.id)}`} target="_blank">Bekijk online</Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 grid gap-2 border-t border-forest/10 bg-cream p-4">
              <button className="h-12 rounded-full border border-forest/20 bg-white font-bold text-forest disabled:opacity-50" disabled={quickSaving || (quickMode === "supplier" && !quickSelectedProduct)} onClick={() => void saveQuickProduct("draft")} type="button">
                {quickSaving ? "Opslaan..." : "Opslaan als concept"}
              </button>
              <button className="h-12 rounded-full bg-forest font-bold text-cream disabled:opacity-50" disabled={quickSaving || (quickMode === "supplier" && !quickSelectedProduct)} onClick={() => void saveQuickProduct("online")} type="button">
                {quickSaving ? "Opslaan..." : "Opslaan en direct online"}
              </button>
              {quickMode === "supplier" ? (
                <button className="h-12 rounded-full border border-forest/20 bg-white font-bold text-forest disabled:opacity-50" disabled={quickSaving || !quickSelectedProduct} onClick={async () => { if (await saveQuickProduct("draft")) selectNextQuickSupplierProduct(); }} type="button">
                  Opslaan & volgend leverancierproduct
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_760px]">
      <form className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={saveProduct}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-serif text-3xl font-bold text-forest">{isEditing ? "Edit product" : "Add product manually"}</h2>
          {isEditing ? (
            <button className="rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest" onClick={() => setActiveProduct(createBlankProduct(products))} type="button">
              New product
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-forest/70">
          Product numbers are generated automatically as NC-00001, NC-00002 and so on. Supplier codes are for the wholesaler invoice or catalogue.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field help="Generated automatically and used as the public SKU on labels, lists and orders." label="SKU / product number">
            <input className="w-full rounded-lg border bg-linen px-3 py-2 font-bold text-forest" readOnly required value={product.id} />
          </Field>
          <Field help="Database identifier generated by Supabase after the product is saved." label="Internal UUID">
            <input className="w-full rounded-lg border bg-linen px-3 py-2 text-forest/65" readOnly value={product.uuid ?? "Generated after save"} />
          </Field>
          <Field help="Code from the supplier or PDF catalogue. Example: EF-12345." label="Supplier code">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("supplierCode", event.target.value)} placeholder="Supplier item code" required value={product.supplierCode} />
          </Field>
          <Field help="The name customers see on the website." label="Product name">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("name", event.target.value)} placeholder="Frikandel" required value={product.name} />
          </Field>
          <Field help="Optional EAN-8, EAN-13 or other barcode value." label="EAN / barcode">
            <input className="w-full rounded-lg border px-3 py-2" inputMode="numeric" onChange={(event) => update("ean", event.target.value)} placeholder="8712345678901" value={product.ean ?? ""} />
          </Field>
          <Field help="You can paste a public URL, or upload a file from your computer below." label="Product photo URL">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://..." type="url" value={product.imageUrl ?? ""} />
          </Field>
          <Field help="This text is shown directly below the customer price and must match that price. Use 40 x 85g for a full box, 1 x 85g for one item, or use Customer package options for several choices." label="Customer unit / item size">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("unit", event.target.value)} placeholder="6 pieces / 1kg / 1 tin" required value={product.unit} />
          </Field>
          <Field help="Optional shipping or product weight, for example 850g or 1.2kg." label="Weight">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("weight", event.target.value)} placeholder="850g" value={product.weight ?? ""} />
          </Field>
          <Field
            help="Optional. One option per line: 4 stuks | 4 | 3.00. Leave empty when the product has only one package."
            label="Customer package options"
          >
            <textarea
              className="min-h-24 w-full rounded-lg border px-3 py-2"
              onChange={(event) => {
                setPackageOptionsText(event.target.value);
                update("packageOptions", textToPackageOptions(event.target.value));
              }}
              placeholder={"4 stuks | 4 | 3.00\n8 stuks | 8 | 5.75\n12 stuks | 12 | 8.25"}
              value={packageOptionsText}
            />
          </Field>
          <Field help="Select every webshop section where this product should appear. At least one category is required." label="Product categories">
            <div className="grid gap-2 rounded-lg border border-forest/15 bg-linen p-3 sm:grid-cols-2">
              {availableProductCategories.map((item) => (
                <label className="flex items-start gap-2 text-sm text-forest" key={item}>
                  <input
                    checked={getProductCategories(product).includes(item)}
                    className="mt-0.5"
                    onChange={() => toggleCategory(item)}
                    type="checkbox"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field help="Available = stock now. Preorder = order first. Coming soon = visible but not orderable." label="Stock status">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("stockStatus", event.target.value as Product["stockStatus"])} value={product.stockStatus}>
              <option value="available">available</option>
              <option value="preorder">preorder</option>
              <option value="coming-soon">coming-soon</option>
            </select>
          </Field>
          <Field help="Frozen, fresh or shelf-stable product." label="Product type">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("type", event.target.value as Product["type"])} value={product.type}>
              <option value="ambient">ambient</option>
              <option value="fresh">fresh</option>
              <option value="frozen">frozen</option>
            </select>
          </Field>
          <Field help="Main origin or target range." label="Origin">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("origin", event.target.value as Product["origin"])} value={product.origin}>
              {["Dutch", "British", "Irish", "German", "Scandinavian", "Asian", "Indonesian", "South American", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field help="Supplier name. Example: Eurofood." label="Supplier">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("supplier", event.target.value)} placeholder="Eurofood" value={product.supplier} />
          </Field>
          <Field help="How you buy it from the supplier. Example: box 12 x 1kg." label="Supplier pack size">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("packSize", event.target.value)} placeholder="Box 12 x 1kg" value={product.packSize} />
          </Field>
          <Field help="Original package from the supplier import. Keep this internally, even when public sales unit is a single item." label="Supplier case / source package">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("sourcePackageText", event.target.value)} placeholder="24 x 500ml" value={product.sourcePackageText ?? ""} />
          </Field>
          <Field help="Total supplier invoice price excluding IVA/VAT for the complete box. Example: 31.60 for a box of 12." label="Supplier case cost ex IVA">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => { const value = Number(event.target.value); update("costPriceExVat", value); update("supplierCasePrice", value); }} placeholder="4.00" step="0.01" type="number" value={product.costPriceExVat} />
          </Field>
          <Field help="Your purchase cost for one unit sold to the customer. This is used for the profit calculation." label="Purchase cost per customer unit ex IVA">
            <div className="flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border px-3 py-2" onChange={(event) => { const value = Number(event.target.value); update("unitCost", value); update("supplierUnitPrice", value); }} placeholder="2.63" step="0.01" type="number" value={product.unitCost} />
              {supplierPackQuantity > 1 ? (
                <button
                  className="shrink-0 rounded-lg border border-forest/20 bg-linen px-3 py-2 text-xs font-bold text-forest"
                  onClick={() => update("unitCost", calculatedUnitCost)}
                  title={`${formatEuro(product.costPriceExVat)} divided by ${supplierPackQuantity}`}
                  type="button"
                >
                  Use {formatEuro(calculatedUnitCost)}
                </button>
              ) : null}
            </div>
          </Field>
          <Field help="Choose what the customer buys for the displayed price. Imported supplier products cannot go live until this is confirmed." label="Public sales unit">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("salesUnitType", event.target.value as Product["salesUnitType"])} value={product.salesUnitType ?? ""}>
              <option value="">Needs review</option>
              <option value="case">Whole case / tray</option>
              <option value="single">Single item</option>
              <option value="custom_pack">Custom pack</option>
              <option value="per_kg">Per kg</option>
              <option value="per_unit">Per unit</option>
            </select>
          </Field>
          <Field help="For case: supplier units per case. For custom pack: number of units sold to customer." label="Sales unit quantity">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("salesUnitQuantity", Number(event.target.value))} placeholder="24" step="1" type="number" value={product.salesUnitQuantity ?? 0} />
          </Field>
          <Field help="Tick only after checking that the public package, sales unit and selling price all match." label="Sales unit reviewed">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.salesUnitConfirmed ?? false} onChange={(event) => update("salesUnitConfirmed", event.target.checked)} type="checkbox" />
              Sales unit confirmed
            </label>
          </Field>
          <Field help="Tick only after checking that selling price is for the public sales unit, not the supplier unit price by mistake." label="Price basis reviewed">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.priceBasisConfirmed ?? false} onChange={(event) => update("priceBasisConfirmed", event.target.checked)} type="checkbox" />
              Price basis confirmed
            </label>
          </Field>
          <Field help="Usually 10 for food, 4 for bread/basic items, 21 for non-food." label="IVA %">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("vatRate", Number(event.target.value))} placeholder="10" step="1" type="number" value={product.vatRate} />
          </Field>
          <Field help="Customer price including IVA/VAT." label="Sale price incl IVA">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("salePriceInclVat", Number(event.target.value))} placeholder="6.95" step="0.01" type="number" value={product.salePriceInclVat} />
          </Field>
          <Field help="Tick this to show it on the homepage featured selection." label="Homepage featured">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <input checked={product.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" />
            Featured
            </label>
          </Field>
          <Field help="Marks this product as new for future badges and reports." label="New product">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.isNew ?? false} onChange={(event) => update("isNew", event.target.checked)} type="checkbox" />
              New
            </label>
          </Field>
          <Field help="Active products can appear in the shop. Archived, disabled and draft products are hidden from the public webshop." label="Product admin status">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("lifecycleStatus", event.target.value as Product["lifecycleStatus"])} value={product.lifecycleStatus ?? "active"}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="disabled">Disabled</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
          <Field help="Tracks the import this product belongs to, for example IMPORT_2026_PRELAUNCH or IMPORT_2026_LIVE_JULY." label="Import batch">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("importBatch", event.target.value)} placeholder="IMPORT_2026_PRELAUNCH" value={product.importBatch ?? ""} />
          </Field>
          <Field help="Turn this on only when the product may appear on the public website." label="Show on website">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.isVisible ?? false} disabled={(product.lifecycleStatus ?? "active") !== "active" || (isSupplierImportProduct(product) && !salesUnitSafety.ok)} onChange={(event) => update("isVisible", event.target.checked)} type="checkbox" />
              Visible online
            </label>
            {isSupplierImportProduct(product) && !salesUnitSafety.ok ? <span className="mt-1 block text-xs font-bold text-red-700">{salesUnitSafety.reason}</span> : null}
          </Field>
          <Field help="Enable only when orders should automatically reduce this product's stock." label="Automatic inventory">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.trackInventory ?? false} onChange={(event) => update("trackInventory", event.target.checked)} type="checkbox" />
              Track inventory
            </label>
          </Field>
          <Field help="Current number of sellable base units in stock." label="Stock quantity">
            <input className="w-full rounded-lg border px-3 py-2" min="0" onChange={(event) => update("stockQuantity", Number(event.target.value))} step="1" type="number" value={product.stockQuantity ?? 0} />
          </Field>
          <Field help="A low-stock warning appears when stock reaches this level." label="Minimum stock">
            <input className="w-full rounded-lg border px-3 py-2" min="0" onChange={(event) => update("minimumStock", Number(event.target.value))} step="1" type="number" value={product.minimumStock ?? 0} />
          </Field>
        </div>
        <div className="mt-4 rounded-lg bg-cream p-4 text-sm text-forest">
          <strong>Pricing preview:</strong> purchase cost {formatEuro(pricing.purchaseCostPerUnit)} ex IVA per customer unit.
          Sale ex IVA {formatEuro(pricing.salePriceExVat)}, IVA {formatEuro(pricing.ivaAmount)}, estimated profit{" "}
          {formatEuro(pricing.profitPerUnit)} per unit, gross margin {pricing.marginPercent}% and markup {pricing.markupPercent}%.
          {supplierPackQuantity > 1 ? (
            <span className="mt-2 block text-xs text-forest/65">
              Detected supplier case: {supplierPackQuantity} customer units. Case cost per unit: {formatEuro(calculatedUnitCost)} ex IVA.
            </span>
          ) : null}
        </div>
        <div className="mt-4 rounded-lg border border-forest/10 bg-linen p-4">
          <span className="text-sm font-bold text-forest">Upload product photo</span>
          <p className="mt-1 text-xs leading-5 text-forest/60">
            Choose a JPG, PNG or WebP from your computer. Maximum 5MB. Existing products are updated automatically.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              accept="image/*"
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
              onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
              type="file"
            />
            <button
              className="rounded-full bg-coffee px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              disabled={uploading || !selectedImage}
              onClick={uploadImage}
              type="button"
            >
              {uploading ? "Uploading..." : "Upload photo"}
            </button>
          </div>
        </div>
        <Field help="Optional. One public image URL per line; the uploaded primary photo remains first." label="Additional product images">
          <textarea className="min-h-20 w-full rounded-lg border px-3 py-2" onChange={(event) => update("images", event.target.value.split("\n").map((value) => value.trim()).filter(Boolean))} placeholder="https://..." value={(product.images ?? []).join("\n")} />
        </Field>
        <Field help="Short product text customers see on the product card." label="Description">
          <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => update("description", event.target.value)} placeholder="Classic Dutch frozen snack, available by pre-order." required value={product.description} />
        </Field>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field help="Optional. Only shown when filled in." label="Ingredients / allergens">
            <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => update("ingredients", event.target.value)} placeholder="Ingredients from supplier label..." value={product.ingredients ?? ""} />
          </Field>
          <Field help="Optional. Preparation instructions from supplier." label="Directions for use">
            <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => update("directions", event.target.value)} placeholder="Oven, fryer, air fryer..." value={product.directions ?? ""} />
          </Field>
          <Field help="Optional. Freezer, chilled or ambient storage details." label="Conservation">
            <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => update("conservation", event.target.value)} placeholder="Store at -18C / chilled / cool and dry..." value={product.conservation ?? ""} />
          </Field>
          <Field help="Optional. Extra supplier notes, pack details or warnings." label="Additional information">
            <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => update("additionalInfo", event.target.value)} placeholder="May contain allergens, supplier remarks..." value={product.additionalInfo ?? ""} />
          </Field>
        </div>
        {product.imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-forest/10 bg-linen">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={`${product.name || "Product"} preview`} className="h-48 w-full object-cover" src={product.imageUrl} />
          </div>
        ) : null}
        <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream" type="submit">
          {isEditing ? "Update product" : "Save product"}
        </button>
        {isEditing ? (
          <button
            className="ml-3 mt-4 rounded-full border border-red-200 bg-white px-5 py-3 font-bold text-red-700"
            onClick={deleteCurrentProduct}
            type="button"
          >
            Archive product
          </button>
        ) : null}
        {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      </form>
      <aside className="rounded-lg border border-forest/10 bg-cream p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-forest">Product overview</h2>
            <p className="mt-2 text-sm text-forest/65">
              {filteredProducts.length} of {products.length} products shown.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700"
              onClick={() => void archiveCurrentCatalogue()}
              type="button"
            >
              Archive current catalogue
            </button>
            <button
              className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream"
              onClick={() => setActiveProduct(createBlankProduct(products))}
              type="button"
            >
              New product
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <button className="rounded-lg border border-forest/10 bg-white px-2 py-3 text-forest" onClick={() => setStatusFilter("active")} type="button">
            <span className="block text-lg">{activeCount}</span>Active
          </button>
          <button className="rounded-lg border border-leaf/20 bg-white px-2 py-3 text-leaf" onClick={() => setVisibilityFilter("Online")} type="button">
            <span className="block text-lg">{onlineCount}</span>Online
          </button>
          <button className="rounded-lg border border-coffee/20 bg-white px-2 py-3 text-coffee" onClick={() => setVisibilityFilter("Offline")} type="button">
            <span className="block text-lg">{products.length - onlineCount}</span>Offline
          </button>
          <button className="rounded-lg border border-brass/20 bg-white px-2 py-3 text-coffee" onClick={() => setStatusFilter("archived")} type="button">
            <span className="block text-lg">{archivedCount}</span>Archived
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <input
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search name, NC number, supplier code or category"
            type="search"
            value={productSearch}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <select
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              {productCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
              onChange={(event) => setVisibilityFilter(event.target.value)}
              value={visibilityFilter}
            >
              <option>All</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <select
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
              onChange={(event) => setStatusFilter(event.target.value as Product["lifecycleStatus"] | "All")}
              value={statusFilter}
            >
              <option value="active">Active products</option>
              <option value="archived">Archived products</option>
              <option value="disabled">Disabled products</option>
              <option value="draft">Draft products</option>
              <option value="All">All products</option>
            </select>
            <select
              className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
              onChange={(event) => setDuplicateFilter(event.target.value)}
              value={duplicateFilter}
            >
              <option value="All">All products</option>
              <option value="Duplicates">Possible duplicates ({duplicateCount})</option>
            </select>
          </div>
        </div>
        <div className="mt-4 max-h-[720px] overflow-auto rounded-lg border border-forest/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-forest text-cream">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => (
                <tr
                  className={`cursor-pointer border-t border-forest/10 transition hover:bg-linen ${
                    item.id === product.id ? "bg-cream" : ""
                  }`}
                  key={item.id}
                  onClick={() => {
                    setActiveProduct({ ...defaultProduct, ...item });
                    setMessage("");
                  }}
                >
                  <td className="px-3 py-3">
                    <div className="font-bold text-forest">{item.name}</div>
                    <div className="text-xs text-forest/60">{getProductCategories(item).join(" · ")}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-forest/70">
                    <div className="font-bold text-forest">{item.id}</div>
                    <div>{item.supplierCode}</div>
                  </td>
                  <td className="px-3 py-3 font-bold text-coffee">{formatEuro(item.salePriceInclVat)}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                      item.isVisible !== false ? "bg-leaf/10 text-leaf" : "bg-coffee/10 text-coffee"
                    }`}>
                      {item.isVisible !== false ? "Online" : "Offline"}
                    </span>
                    <span className="ml-1 rounded-full bg-linen px-2 py-1 text-xs font-bold text-forest">
                      {item.lifecycleStatus ?? "active"}
                    </span>
                    {item.importBatch ? <div className="mt-1 text-[11px] text-forest/55">{item.importBatch}</div> : null}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="grid h-9 w-9 place-items-center rounded-md border border-forest/15 text-forest hover:bg-linen" onClick={(event) => { event.stopPropagation(); setActiveProduct({ ...defaultProduct, ...item }); }} title="Edit product" type="button"><Pencil size={16} /></button>
                      <Link className="grid h-9 w-9 place-items-center rounded-md border border-forest/15 text-forest hover:bg-linen" href={`/en/products/${encodeURIComponent(item.id)}`} onClick={(event) => event.stopPropagation()} target="_blank" title="Open product page"><ExternalLink size={16} /></Link>
                      <button className="grid h-9 w-9 place-items-center rounded-md border border-forest/15 text-forest hover:bg-linen" onClick={(event) => { event.stopPropagation(); void toggleProductVisibility(item); }} title={item.isVisible !== false ? "Take offline" : "Put online"} type="button">{item.isVisible !== false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      {item.lifecycleStatus === "archived" ? (
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-leaf/20 text-leaf hover:bg-leaf/10" onClick={(event) => { event.stopPropagation(); void restoreProduct(item); }} title="Restore archived product" type="button"><RotateCcw size={16} /></button>
                      ) : (
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-red-200 text-red-700 hover:bg-red-50" onClick={(event) => { event.stopPropagation(); void deleteProduct(item); }} title="Archive product" type="button"><Archive size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-sm text-forest/65" colSpan={5}>
                    No products match this search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </aside>
      </div>
    </>
  );
}
