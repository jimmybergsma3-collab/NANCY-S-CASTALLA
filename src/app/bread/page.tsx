import { ProductOrder } from "@/components/ProductOrder";
import { businessConfig } from "@/config/business";
import { products } from "@/data/products";

const breadProducts = products.filter((product) => product.category === "Bread & bakery");

export const metadata = {
  title: "Bread pre-orders | Nancy's Castalla",
  description: "Bread order Castalla: white bread, tiger bread, wholemeal, 6 grain, half loaves and sourdough boule.",
};

export default function BreadPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Bread on pre-order</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">Bread & bakery</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">
        {businessConfig.openingTexts.preorderNote} Order interest is collected via WhatsApp first, then Nancy's Castalla
        confirms availability, delivery moments and payment instructions.
      </p>
      <div className="mt-8 rounded-lg border border-brass/25 bg-cream p-5 text-forest">
        <strong>How it works:</strong> choose bread, send the WhatsApp order, and wait for confirmation before payment.
        Fixed delivery moments can be added later in the business config.
      </div>
      <div className="mt-8">
        <ProductOrder products={breadProducts} initialCategory="Bread & bakery" />
      </div>
    </section>
  );
}
