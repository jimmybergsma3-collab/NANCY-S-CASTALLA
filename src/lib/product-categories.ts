import type { Product, ProductCategory } from "@/types/product";

export const productCategories: ProductCategory[] = [
  "Dutch products",
  "British & Irish products",
  "German products",
  "Scandinavian products",
  "Asian & Indonesian products",
  "South American products",
  "Vegan & vegetarian",
  "Frozen snacks",
  "Bread & bakery",
  "Breakfast products",
  "Coffee & drinks",
  "Sauces & condiments",
  "Non-food & packaging",
];

export function getProductCategories(product: Product) {
  const source = product.categories?.length ? product.categories : [product.category];
  const normalized = source
    .map((category) => category as string)
    .map((category) => category === "Asian products" ? "Asian & Indonesian products" : category)
    .filter((category): category is ProductCategory => productCategories.includes(category as ProductCategory));

  const fallback = (product.category as string) === "Asian products" ? "Asian & Indonesian products" : product.category;
  return Array.from(new Set(normalized.length ? normalized : [fallback as ProductCategory]));
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
