import type { Product, ProductCategory } from "@/types/product";

export const productCategories: ProductCategory[] = [
  "Dutch products",
  "British & Irish products",
  "Frozen snacks",
  "Bread & bakery",
  "Breakfast products",
  "Coffee & drinks",
  "Sauces & condiments",
  "South American products",
  "German products",
  "Asian products",
  "Non-food & packaging",
];

const originCategories: Partial<Record<ProductCategory, Product["origin"][]>> = {
  "Dutch products": ["Dutch"],
  "British & Irish products": ["British", "Irish"],
  "South American products": ["South American"],
  "German products": ["German"],
  "Asian products": ["Asian"],
};

export function productMatchesCategory(product: Product, category: ProductCategory) {
  return product.category === category || (originCategories[category]?.includes(product.origin) ?? false);
}

export function categoryToSlug(category: ProductCategory) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToCategory(slug: string) {
  return productCategories.find((category) => categoryToSlug(category) === slug);
}
