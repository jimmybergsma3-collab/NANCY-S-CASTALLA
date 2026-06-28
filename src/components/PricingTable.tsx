import { products } from "@/data/products";
import { calculatePricing, formatEuro } from "@/lib/pricing";

export function PricingTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white shadow-soft">
      <table className="min-w-[1100px] w-full text-left text-sm">
        <thead className="bg-forest text-cream">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Pack</th>
            <th className="px-4 py-3">Case cost ex. IVA</th>
            <th className="px-4 py-3">Unit cost ex. IVA</th>
            <th className="px-4 py-3">IVA</th>
            <th className="px-4 py-3">Sale ex. IVA</th>
            <th className="px-4 py-3">Sale incl. IVA</th>
            <th className="px-4 py-3">Profit</th>
            <th className="px-4 py-3">Gross margin</th>
            <th className="px-4 py-3">Markup</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const calculated = calculatePricing(product);
            return (
              <tr key={product.id} className="border-t border-forest/10">
                <td className="px-4 py-3 font-bold text-forest">{product.name}</td>
                <td className="px-4 py-3 text-forest/75">{product.supplier}</td>
                <td className="px-4 py-3 text-forest/75">{product.supplierCode}</td>
                <td className="px-4 py-3 text-forest/75">{product.packSize}</td>
                <td className="px-4 py-3">{formatEuro(product.costPriceExVat)}</td>
                <td className="px-4 py-3">{formatEuro(calculated.purchaseCostPerUnit)}</td>
                <td className="px-4 py-3">{product.vatRate}%</td>
                <td className="px-4 py-3">{formatEuro(calculated.salePriceExVat)}</td>
                <td className="px-4 py-3 font-bold">{formatEuro(product.salePriceInclVat)}</td>
                <td className="px-4 py-3 font-bold text-leaf">{formatEuro(calculated.profitPerUnit)}</td>
                <td className="px-4 py-3 font-bold text-coffee">{calculated.marginPercent}%</td>
                <td className="px-4 py-3 font-bold text-coffee">{calculated.markupPercent}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
