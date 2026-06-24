export const metadata = {
  title: "About | Nancy's Castalla",
  description: "About Nancy's Castalla, a warm international food-market concept for expats near Castalla.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">About Nancy's Castalla</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">A warm market for expat favourites</h1>
      <div className="mt-7 space-y-5 text-lg leading-8 text-forest/74">
        <p>
          Nancy's Castalla is starting as a professional but simple international food concept for expats around Castalla:
          practical groceries, familiar snacks, coffee, bread by pre-order and flexible collection or delivery.
        </p>
        <p>
          The summer focus is British, Dutch, Irish and wider European favourites. South American products are planned as a
          later expansion, once the first ordering rhythm and demand are clear.
        </p>
        <p>
          The site is built for a small-stock launch: no checkout, no database and no complicated account system. Customers
          choose products, send a WhatsApp message and receive confirmation before payment.
        </p>
      </div>
    </section>
  );
}
