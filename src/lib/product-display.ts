import type { Product } from "@/types/product";

export function getPublicProductDescription(product: Product) {
  const text = product.description?.trim() ?? "";
  const importedPlaceholder =
    /^(imported|dutch bakery product).+hidden until selected for sale\.$/i.test(text);

  if (text && !importedPlaceholder) {
    return text;
  }

  if (product.category === "Bread & bakery") {
    return "Fresh bakery product available by pre-order.";
  }

  if (product.category === "South American products") {
    return "South American product available by pre-order.";
  }

  if (product.category === "Coffee & drinks") {
    return "Imported drink or pantry product available by pre-order.";
  }

  if (product.category === "Non-food & packaging") {
    return "Accessory or packaging item available by pre-order.";
  }

  if (product.type === "frozen") {
    return "Frozen product available by pre-order.";
  }

  return "International product available by pre-order.";
}
