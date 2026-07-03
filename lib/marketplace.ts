import type { Listing } from "@/types/listing";

export const FAVORITES_KEY = "baraholkaFavorites";
export const SEARCH_HISTORY_KEY = "baraholkaSearchHistory";
export const DRAFT_KEY = "baraholkaListingDraft";

const typoPairs: Record<string, string> = {
  aifon: "iphone",
  айфон: "iphone",
  ипхон: "iphone",
  samsng: "samsung",
  самсунг: "samsung",
  kvartira: "квартира",
  квартра: "квартира",
  divan: "диван",
  дивн: "диван",
  remont: "ремонт"
};

export function normalizeSearch(value: string) {
  const normalized = value.toLowerCase().trim();
  return typoPairs[normalized] ?? normalized;
}

export function getListingBrand(listing: Listing) {
  const text = `${listing.title} ${listing.description}`.toLowerCase();
  const brands = ["apple", "iphone", "samsung", "xiaomi", "lenovo", "thinkpad", "toyota", "bmw", "mercedes", "ikea"];
  return brands.find((brand) => text.includes(brand)) ?? "Другое";
}

export function getListingImages(listing: Listing) {
  return [
    listing.image,
    listing.image,
    listing.image
  ].filter(Boolean);
}

export function getListingViews(id: string) {
  if (typeof window === "undefined") return 0;
  const key = `baraholkaViews:${id}`;
  const nextViews = Number(localStorage.getItem(key) ?? "0") + 1;
  localStorage.setItem(key, String(nextViews));
  return nextViews;
}

export function readStringList(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
}

export function writeStringList(key: string, value: string[]) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export function toggleFavorite(id: string) {
  const favorites = readStringList(FAVORITES_KEY);
  const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
  writeStringList(FAVORITES_KEY, next);
  return next;
}

export function saveSearchQuery(query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return readStringList(SEARCH_HISTORY_KEY);
  const next = [normalized, ...readStringList(SEARCH_HISTORY_KEY).filter((item) => item !== normalized)].slice(0, 6);
  writeStringList(SEARCH_HISTORY_KEY, next);
  return next;
}
