"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { calculatePricing, calculateUnitCost, formatEuro, getSupplierPackQuantity } from "@/lib/pricing";
import { getProductCategories, productCategories as availableProductCategories, productMatchesCategory } from "@/lib/product-categories";

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
  const [duplicateFilter, setDuplicateFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [packageOptionsText, setPackageOptionsText] = useState("");
  const pricing = calculatePricing(product);
  const supplierPackQuantity = getSupplierPackQuantity(product.packSize);
  const calculatedUnitCost = calculateUnitCost(product.costPriceExVat, product.packSize);
  const isEditing = products.some((item) => item.id === product.id);
  const productCategories = useMemo(() => ["All", ...availableProductCategories], []);
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
  const onlineCount = products.filter((item) => item.isVisible !== false).length;
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
      const matchesVisibility = visibilityFilter === "All" ||
        (visibilityFilter === "Online" ? item.isVisible !== false : item.isVisible === false);
      const duplicateKey = `${item.supplier.trim().toLowerCase()}|${item.supplierCode.trim().toLowerCase()}`;
      const matchesDuplicate = duplicateFilter === "All" || duplicateKeys.has(duplicateKey);

      return matchesQuery && matchesCategory && matchesVisibility && matchesDuplicate;
    });
  }, [categoryFilter, duplicateFilter, duplicateKeys, productSearch, products, visibilityFilter]);

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
    const confirmed = window.confirm(`Delete ${item.name || item.id} (${item.id})? This cannot be undone.`);
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

    setMessage("Product deleted.");
    const refreshedProducts = await loadProductsAndReturn();
    if (product.id === item.id) {
      setActiveProduct(createBlankProduct(refreshedProducts));
    }
  }

  async function toggleProductVisibility(item: Product) {
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
          <Field help="Total supplier invoice price excluding IVA/VAT for the complete box. Example: 31.60 for a box of 12." label="Supplier case cost ex IVA">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("costPriceExVat", Number(event.target.value))} placeholder="4.00" step="0.01" type="number" value={product.costPriceExVat} />
          </Field>
          <Field help="Your purchase cost for one unit sold to the customer. This is used for the profit calculation." label="Purchase cost per customer unit ex IVA">
            <div className="flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border px-3 py-2" onChange={(event) => update("unitCost", Number(event.target.value))} placeholder="2.63" step="0.01" type="number" value={product.unitCost} />
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
          <Field help="Turn this on only when the product may appear on the public website." label="Show on website">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.isVisible ?? false} onChange={(event) => update("isVisible", event.target.checked)} type="checkbox" />
              Visible online
            </label>
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
            Delete product
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
          <button
            className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream"
            onClick={() => setActiveProduct(createBlankProduct(products))}
            type="button"
          >
            New product
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <button className="rounded-lg border border-forest/10 bg-white px-2 py-3 text-forest" onClick={() => setVisibilityFilter("All")} type="button">
            <span className="block text-lg">{products.length}</span>All
          </button>
          <button className="rounded-lg border border-leaf/20 bg-white px-2 py-3 text-leaf" onClick={() => setVisibilityFilter("Online")} type="button">
            <span className="block text-lg">{onlineCount}</span>Online
          </button>
          <button className="rounded-lg border border-coffee/20 bg-white px-2 py-3 text-coffee" onClick={() => setVisibilityFilter("Offline")} type="button">
            <span className="block text-lg">{products.length - onlineCount}</span>Offline
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
          <div className="grid gap-3 sm:grid-cols-3">
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
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="grid h-9 w-9 place-items-center rounded-md border border-forest/15 text-forest hover:bg-linen" onClick={(event) => { event.stopPropagation(); setActiveProduct({ ...defaultProduct, ...item }); }} title="Edit product" type="button"><Pencil size={16} /></button>
                      <Link className="grid h-9 w-9 place-items-center rounded-md border border-forest/15 text-forest hover:bg-linen" href={`/en/products/${encodeURIComponent(item.id)}`} onClick={(event) => event.stopPropagation()} target="_blank" title="Open product page"><ExternalLink size={16} /></Link>
                      <button className="grid h-9 w-9 place-items-center rounded-md border border-forest/15 text-forest hover:bg-linen" onClick={(event) => { event.stopPropagation(); void toggleProductVisibility(item); }} title={item.isVisible !== false ? "Take offline" : "Put online"} type="button">{item.isVisible !== false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      <button className="grid h-9 w-9 place-items-center rounded-md border border-red-200 text-red-700 hover:bg-red-50" onClick={(event) => { event.stopPropagation(); void deleteProduct(item); }} title="Delete product" type="button"><Trash2 size={16} /></button>
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
  );
}
