"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { calculatePricing, calculateUnitCost, formatEuro, getSupplierPackQuantity } from "@/lib/pricing";
import { productCategories as availableProductCategories } from "@/lib/product-categories";

const defaultProduct: Product = {
  id: "",
  name: "",
  imageUrl: "",
  isVisible: false,
  category: "British & Irish products",
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

export function AdminProductManager() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [packageOptionsText, setPackageOptionsText] = useState("");
  const pricing = calculatePricing(product);
  const supplierPackQuantity = getSupplierPackQuantity(product.packSize);
  const calculatedUnitCost = calculateUnitCost(product.costPriceExVat, product.packSize);
  const isEditing = products.some((item) => item.id === product.id);
  const productCategories = useMemo(() => ["All", ...Array.from(new Set(products.map((item) => item.category)))], [products]);
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return products.filter((item) => {
      const matchesQuery = query
        ? [item.id, item.name, item.category, item.supplier, item.supplierCode, item.unit]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesVisibility =
        visibilityFilter === "All" ||
        (visibilityFilter === "Visible" ? item.isVisible !== false : item.isVisible === false);

      return matchesQuery && matchesCategory && matchesVisibility;
    });
  }, [categoryFilter, productSearch, products, visibilityFilter]);

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
      setLoggedIn(true);
    }
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Login failed.");
      return;
    }
    setMessage("");
    await loadProducts();
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
    setLoggedIn(true);
    return result.products;
  }

  async function deleteCurrentProduct() {
    if (!isEditing) {
      return;
    }

    const confirmed = window.confirm(`Delete ${product.name || product.id}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setMessage(result.message || "Product could not be deleted.");
      return;
    }

    setMessage("Product deleted.");
    const refreshedProducts = await loadProductsAndReturn();
    setActiveProduct(createBlankProduct(refreshedProducts));
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

  if (!loggedIn) {
    return (
      <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={login}>
        <h2 className="font-serif text-3xl font-bold text-forest">Admin login</h2>
        <input className="mt-5 w-full rounded-lg border px-3 py-2" onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" type="email" value={email} />
        <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" value={password} />
        <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream" type="submit">Login</button>
        {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
      </form>
    );
  }

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_620px]">
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
          <Field help="Generated automatically. You can use this product number on labels, lists and customer orders." label="Product number">
            <input className="w-full rounded-lg border bg-linen px-3 py-2 font-bold text-forest" readOnly required value={product.id} />
          </Field>
          <Field help="Code from the supplier or PDF catalogue. Example: EF-12345." label="Supplier code">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("supplierCode", event.target.value)} placeholder="Supplier item code" required value={product.supplierCode} />
          </Field>
          <Field help="The name customers see on the website." label="Product name">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("name", event.target.value)} placeholder="Frikandel" required value={product.name} />
          </Field>
          <Field help="You can paste a public URL, or upload a file from your computer below." label="Product photo URL">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://..." type="url" value={product.imageUrl ?? ""} />
          </Field>
          <Field help="What one customer receives. Example: 1 bottle 255g, 1kg bag or pack of 6. Supplier case sizes belong in Supplier pack size." label="Customer unit / item size">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("unit", event.target.value)} placeholder="6 pieces / 1kg / 1 tin" required value={product.unit} />
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
          <Field help="Where this product appears in the webshop filters." label="Category">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("category", event.target.value as Product["category"])} value={product.category}>
              {availableProductCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
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
              {["Dutch", "British", "Irish", "German", "Asian", "South American", "Other"].map((item) => <option key={item}>{item}</option>)}
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
          <Field help="Turn this on only when the product may appear on the public website." label="Show on website">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <input checked={product.isVisible ?? false} onChange={(event) => update("isVisible", event.target.checked)} type="checkbox" />
              Visible online
            </label>
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
              {filteredProducts.length} of {products.length} products shown. Click a row to edit.
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
        <div className="mt-5 grid gap-3">
          <input
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm"
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search name, NC number, supplier code or category"
            type="search"
            value={productSearch}
          />
          <div className="grid gap-3 sm:grid-cols-2">
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
              <option>Visible</option>
              <option>Hidden</option>
            </select>
          </div>
        </div>
        <div className="mt-4 max-h-[720px] overflow-auto rounded-lg border border-forest/10 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="sticky top-0 bg-forest text-cream">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Open</th>
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
                    <div className="text-xs text-forest/60">{item.category}</div>
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
                      {item.isVisible !== false ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      className="text-xs font-bold text-forest underline-offset-4 hover:underline"
                      href={`/en/products/${encodeURIComponent(item.id)}`}
                      onClick={(event) => event.stopPropagation()}
                      target="_blank"
                    >
                      Page
                    </Link>
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
