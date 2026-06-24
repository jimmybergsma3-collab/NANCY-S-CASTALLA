import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Coffee, PackageCheck, Truck } from "lucide-react";
import { InfoBand } from "@/components/InfoBand";
import { ProductOrder } from "@/components/ProductOrder";
import { businessConfig } from "@/config/business";
import { products } from "@/data/products";

const featuredProducts = products.filter((product) => product.featured);

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <div className="inline-flex rounded-full border border-brass/30 bg-cream px-4 py-2 text-sm font-bold text-forest">
            {businessConfig.phaseLabel}
          </div>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-tight text-forest md:text-6xl">
            Nancy's Castalla
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-forest/78">{businessConfig.openingTexts.headline}</p>
          <p className="mt-4 max-w-2xl leading-7 text-forest/70">{businessConfig.openingTexts.shortIntro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 font-bold text-cream shadow-soft transition hover:bg-leaf"
              href="/products"
            >
              Shop starter products
              <ArrowRight size={18} />
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-forest/20 bg-white px-6 py-3 font-bold text-forest transition hover:border-forest"
              href="/bread"
            >
              Bread pre-orders
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-forest/10 bg-cream p-6 shadow-soft">
          <div className="rounded-lg border border-brass/30 bg-linen p-5 text-center">
            <div className="relative mx-auto aspect-square w-full max-w-[430px] overflow-hidden rounded-full border-[6px] border-forest bg-cream shadow-soft">
              <Image
                alt="Nancy's Castalla international foods logo"
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 430px, 90vw"
                src="/nancys-castalla-logo.jpg"
              />
            </div>
            <h2 className="mt-5 font-serif text-3xl font-bold text-forest">International foods, coffee, bread and drinks</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-forest/70">
              Premium, warm and practical for British, Dutch, Irish and European expats around Castalla.
            </p>
          </div>
        </div>
      </section>

      <InfoBand />

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Starter range</p>
            <h2 className="mt-2 font-serif text-4xl font-bold text-forest">Featured products</h2>
          </div>
          <Link className="inline-flex items-center gap-2 font-bold text-forest hover:text-coffee" href="/products">
            View all products
            <ArrowRight size={17} />
          </Link>
        </div>
        <ProductOrder products={featuredProducts} />
      </section>

      <section className="bg-forest text-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3">
          <div>
            <PackageCheck className="text-brass" />
            <h3 className="mt-4 font-serif text-2xl font-bold">Small stock first</h3>
            <p className="mt-2 text-sm leading-6 text-cream/78">
              The first phase keeps stock lean and focuses on reliable expat favourites.
            </p>
          </div>
          <div>
            <Coffee className="text-brass" />
            <h3 className="mt-4 font-serif text-2xl font-bold">Bread by demand</h3>
            <p className="mt-2 text-sm leading-6 text-cream/78">{businessConfig.openingTexts.preorderNote}</p>
          </div>
          <div>
            <Truck className="text-brass" />
            <h3 className="mt-4 font-serif text-2xl font-bold">Collection and delivery</h3>
            <p className="mt-2 text-sm leading-6 text-cream/78">
              Collection in Castalla, with local delivery when possible and minimum order rules in the config.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
