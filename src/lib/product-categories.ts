import type { Product, ProductCategory } from "@/types/product";

export const productCategories: ProductCategory[] = [
  "Breakfast",
  "Pies & Pasties",
  "Sunday Roast",
  "Bread",
  "Finger Foods",
  "Fish",
  "Meat",
  "Barbecue & Grill",
  "Tex Mex & Convenience Food",
  "Ready Meals",
  "Dutch / Belgian",
  "Potato, Vegetable & Fruits",
  "Vegan & Vegetarian",
  "Sauces",
  "Tinned Food",
  "Baking & Cooking",
  "Cakes & Desserts",
  "Snacks & Sweets",
  "Soft Drinks",
  "Coffee & Tea",
  "Non-food & Packaging",
];

export function getProductCategories(product: Product) {
  const defaultCategory: ProductCategory = "Breakfast";
  const source = Array.isArray(product.categories) && product.categories.length ? product.categories : [product.category];
  const normalized = source
    .map((category) => category as string)
    .map((category) => category === "Asian products" ? "Asian & Indonesian products" : category)
    .filter((category): category is ProductCategory => productCategories.includes(category as ProductCategory));

  const fallback = (product.category as string) === "Asian products" ? "Asian & Indonesian products" : product.category;
  return Array.from(new Set(normalized.length ? normalized : productCategories.includes(fallback as ProductCategory) ? [fallback as ProductCategory] : [defaultCategory]));
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
