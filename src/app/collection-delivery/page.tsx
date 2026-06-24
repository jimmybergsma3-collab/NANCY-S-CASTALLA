import { Truck } from "lucide-react";
import { businessConfig } from "@/config/business";
import { formatEuro } from "@/lib/pricing";

export const metadata = {
  title: "Collection & delivery | Nancy's Castalla",
  description: "Collection in Castalla and local delivery when possible for expat food orders.",
};

export default function CollectionDeliveryPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center gap-3 text-coffee">
        <Truck />
        <p className="text-sm font-bold uppercase tracking-[0.18em]">Collection & delivery</p>
      </div>
      <h1 className="mt-3 font-serif text-5xl font-bold text-forest">Simple, flexible fulfilment</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-3xl font-bold text-forest">Collection in Castalla</h2>
          <p className="mt-3 leading-7 text-forest/72">
            Orders are confirmed by WhatsApp and can be collected at {businessConfig.address}. Stock is small in the
            starting phase, so confirmation always comes before payment.
          </p>
        </div>
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-3xl font-bold text-forest">Local delivery</h2>
          <p className="mt-3 leading-7 text-forest/72">
            Delivery is possible when routes and timing allow. Current minimum order is{" "}
            {formatEuro(businessConfig.deliveryMinimum)}, within around {businessConfig.deliveryRadiusKm} km, with a
            delivery fee from {formatEuro(businessConfig.deliveryFee)}.
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-forest p-6 text-cream">
        <h2 className="font-serif text-3xl font-bold">Payment after confirmation</h2>
        <p className="mt-3 leading-7 text-cream/82">
          No Stripe checkout is active in version 1. After receiving the WhatsApp order, Nancy's Castalla sends Bizum
          details, bank transfer details or confirms cash payment on collection or delivery.
        </p>
      </div>
    </section>
  );
}
