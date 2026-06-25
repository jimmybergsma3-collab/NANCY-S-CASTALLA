"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { calculatePricing, formatEuro } from "@/lib/pricing";

const defaultProduct: Product = {
  id: "",
  name: "",
  imageUrl: "",
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
};

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
  const [uploading, setUploading] = useState(false);
  const pricing = calculatePricing(product);
  const isEditing = products.some((item) => item.id === product.id);

  async function loadProducts() {
    const response = await fetch("/api/admin/products");
    if (response.ok) {
      const result = (await response.json()) as { products: Product[] };
      setProducts(result.products);
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
    setProduct(defaultProduct);
    await loadProducts();
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
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
      <form className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={saveProduct}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-serif text-3xl font-bold text-forest">{isEditing ? "Edit product" : "Add product manually"}</h2>
          {isEditing ? (
            <button className="rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest" onClick={() => setProduct(defaultProduct)} type="button">
              New product
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-forest/70">
          Use product codes for your own shop codes and supplier codes for codes from the wholesaler invoice or catalogue.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field help="Your own unique code. Example: NL-FRIKANDEL-01." label="Product code / shop id">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("id", event.target.value)} placeholder="NL-FRIKANDEL-01" required value={product.id} />
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
          <Field help="How it is sold. Example: 6 pieces, 1kg bag, 415g tin." label="Unit / packaging">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("unit", event.target.value)} placeholder="6 pieces / 1kg / 1 tin" required value={product.unit} />
          </Field>
          <Field help="Where this product appears in the webshop filters." label="Category">
            <select className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("category", event.target.value as Product["category"])} value={product.category}>
              {["Dutch products", "British & Irish products", "Frozen snacks", "Bread & bakery", "Breakfast products", "Coffee & drinks", "Sauces & condiments", "South American products"].map((item) => <option key={item}>{item}</option>)}
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
              {["Dutch", "British", "Irish", "South American", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field help="Supplier name. Example: Eurofood." label="Supplier">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("supplier", event.target.value)} placeholder="Eurofood" value={product.supplier} />
          </Field>
          <Field help="How you buy it from the supplier. Example: box 12 x 1kg." label="Supplier pack size">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("packSize", event.target.value)} placeholder="Box 12 x 1kg" value={product.packSize} />
          </Field>
          <Field help="Wholesale price excluding IVA/VAT for one sellable unit." label="Cost price ex IVA">
            <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => update("costPriceExVat", Number(event.target.value))} placeholder="4.00" step="0.01" type="number" value={product.costPriceExVat} />
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
        </div>
        <div className="mt-4 rounded-lg bg-cream p-4 text-sm text-forest">
          <strong>Margin preview:</strong> estimated profit {formatEuro(pricing.profitPerUnit)} per unit, margin{" "}
          {pricing.marginPercent}%.
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
        {product.imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-forest/10 bg-linen">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={`${product.name || "Product"} preview`} className="h-48 w-full object-cover" src={product.imageUrl} />
          </div>
        ) : null}
        <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream" type="submit">
          {isEditing ? "Update product" : "Save product"}
        </button>
        {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      </form>
      <aside className="rounded-lg border border-forest/10 bg-cream p-6 shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-forest">Current products</h2>
        <p className="mt-2 text-sm text-forest/65">Click a product to edit it.</p>
        <div className="mt-4 max-h-[640px] space-y-3 overflow-auto">
          {products.map((item) => (
            <button
              className={`w-full rounded-lg bg-white p-3 text-left text-sm transition hover:ring-2 hover:ring-brass ${
                item.id === product.id ? "ring-2 ring-forest" : ""
              }`}
              key={item.id}
              onClick={() => {
                setProduct({ ...defaultProduct, ...item });
                setMessage("");
              }}
              type="button"
            >
              <div className="flex gap-3">
                {item.imageUrl ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-full w-full object-cover" src={item.imageUrl} />
                  </div>
                ) : null}
                <div>
                  <div className="font-bold text-forest">{item.name}</div>
                  <div className="text-forest/65">{item.id} / {item.supplierCode}</div>
                  <div className="font-bold text-coffee">{formatEuro(item.salePriceInclVat)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
