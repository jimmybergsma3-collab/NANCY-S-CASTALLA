import { ProductOrder } from "@/components/ProductOrder";
import { products } from "@/data/products";

export const metadata = {
  title: "Products | Nancy's Castalla",
  description: "British, Irish, Dutch and international starter products for expats around Castalla.",
};

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Starter product selection</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">Products</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">
        A focused first range for a small expat shop: Dutch snacks, British and Irish favourites, bakery pre-orders,
        breakfast products, coffee, drinks and condiments. South American products are shown as a later phase.
      </p>
      <div className="mt-8">
        <ProductOrder products={products} />
      </div>
    </section>
  );
}
