"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { formatEuro } from "@/lib/pricing";

const defaultProduct: Product = {
  id: "",
  name: "",
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

export function AdminProductManager() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [message, setMessage] = useState("");

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
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const result = (await response.json()) as { ok: boolean; message?: string; product?: Product };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Product could not be saved.");
      return;
    }
    setMessage("Product saved.");
    setProduct(defaultProduct);
    await loadProducts();
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
        <h2 className="font-serif text-3xl font-bold text-forest">Add product manually</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("id", event.target.value)} placeholder="Product code / id" required value={product.id} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("supplierCode", event.target.value)} placeholder="Supplier code" required value={product.supplierCode} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("name", event.target.value)} placeholder="Product name" required value={product.name} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("unit", event.target.value)} placeholder="Unit / packaging" required value={product.unit} />
          <select className="rounded-lg border px-3 py-2" onChange={(event) => update("category", event.target.value as Product["category"])} value={product.category}>
            {["Dutch products", "British & Irish products", "Frozen snacks", "Bread & bakery", "Breakfast products", "Coffee & drinks", "Sauces & condiments", "South American products"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-lg border px-3 py-2" onChange={(event) => update("stockStatus", event.target.value as Product["stockStatus"])} value={product.stockStatus}>
            <option value="available">available</option>
            <option value="preorder">preorder</option>
            <option value="coming-soon">coming-soon</option>
          </select>
          <select className="rounded-lg border px-3 py-2" onChange={(event) => update("type", event.target.value as Product["type"])} value={product.type}>
            <option value="ambient">ambient</option>
            <option value="fresh">fresh</option>
            <option value="frozen">frozen</option>
          </select>
          <select className="rounded-lg border px-3 py-2" onChange={(event) => update("origin", event.target.value as Product["origin"])} value={product.origin}>
            {["Dutch", "British", "Irish", "South American", "Other"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("supplier", event.target.value)} placeholder="Supplier" value={product.supplier} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("packSize", event.target.value)} placeholder="Pack size" value={product.packSize} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("costPriceExVat", Number(event.target.value))} placeholder="Cost ex IVA" step="0.01" type="number" value={product.costPriceExVat} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("vatRate", Number(event.target.value))} placeholder="IVA %" step="1" type="number" value={product.vatRate} />
          <input className="rounded-lg border px-3 py-2" onChange={(event) => update("salePriceInclVat", Number(event.target.value))} placeholder="Sale incl IVA" step="0.01" type="number" value={product.salePriceInclVat} />
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <input checked={product.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" />
            Featured
          </label>
        </div>
        <textarea className="mt-3 min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => update("description", event.target.value)} placeholder="Description" required value={product.description} />
        <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream" type="submit">Save product</button>
        {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      </form>
      <aside className="rounded-lg border border-forest/10 bg-cream p-6 shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-forest">Current products</h2>
        <div className="mt-4 max-h-[640px] space-y-3 overflow-auto">
          {products.map((item) => (
            <div className="rounded-lg bg-white p-3 text-sm" key={item.id}>
              <div className="font-bold text-forest">{item.name}</div>
              <div className="text-forest/65">{item.id} / {item.supplierCode}</div>
              <div className="font-bold text-coffee">{formatEuro(item.salePriceInclVat)}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
