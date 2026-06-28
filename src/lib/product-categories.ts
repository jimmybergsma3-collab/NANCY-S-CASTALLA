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

export function getProductCategories(product: Product) {
  return product.categories?.length ? product.categories : [product.category];
}

export function productMatchesCategory(product: Product, category: ProductCategory) {
  return getProductCategories(product).includes(category);
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
