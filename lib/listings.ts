import type { Category, Listing, ListingStatus } from "@/types/listing";

export const categories: Category[] = [
  { id: "transport", name: "Транспорт", icon: "A" },
  { id: "realty", name: "Недвижимость", icon: "H" },
  { id: "phones", name: "Телефоны и гаджеты", icon: "P" },
  { id: "computers", name: "Компьютеры и офис", icon: "C" },
  { id: "repair", name: "Строительство и ремонт", icon: "R" },
  { id: "fashion", name: "Одежда и обувь", icon: "F" },
  { id: "home", name: "Дом и мебель", icon: "M" },
  { id: "jobs", name: "Работа", icon: "J" },
  { id: "services", name: "Услуги", icon: "S" },
  { id: "kids", name: "Детский мир", icon: "K" },
  { id: "sport", name: "Спорт и отдых", icon: "Z" },
  { id: "other", name: "Все остальное", icon: "O" }
];

const USER_LISTINGS_KEY = "baraholkaUserListings";
const STATUS_OVERRIDES_KEY = "baraholkaStatusOverrides";

export const demoListings: Listing[] = [
  { id: "demo-9", title: "Toyota Prius 2016 Hybrid", category: "transport", price: 9200, city: "Кишинев", date: "Сегодня", badge: "Топ", status: "Активное", seller: "Ион", phone: "+373 69 245 111", email: "ion.auto@example.md", messenger: "Viber: +373 69 245 111", description: "Экономичный гибрид, ухоженный салон, свежий техосмотр. Возможен разумный торг у автомобиля." },
  { id: "demo-8", title: "Двухкомнатная квартира, Центр", category: "realty", price: 550, city: "Кишинев", date: "Сегодня", badge: "Аренда", status: "Активное", seller: "Мария", phone: "+373 78 300 450", email: "maria.home@example.md", messenger: "Telegram: @maria_home", description: "Светлая квартира рядом с парком. Есть мебель, техника, интернет и парковка во дворе." },
  { id: "demo-7", title: "iPhone 14 Pro 128 GB", category: "phones", price: 610, city: "Бельцы", date: "Вчера", badge: "Новое", status: "Активное", seller: "Сергей", phone: "+373 68 901 222", email: "serg.phone@example.md", messenger: "Telegram: @serg_mobile", description: "Телефон в отличном состоянии, полный комплект, батарея держит хорошо. Без ремонтов." },
  { id: "demo-6", title: "Ноутбук Lenovo ThinkPad T14", category: "computers", price: 430, city: "Кишинев", date: "Сегодня", badge: "Гарантия", status: "Активное", seller: "Dumitru", phone: "+373 60 777 214", email: "office.tech@example.md", messenger: "Viber: +373 60 777 214", description: "Рабочий ноутбук для офиса и учебы. SSD, 16 GB RAM, зарядное устройство в комплекте." },
  { id: "demo-5", title: "Ремонт квартир под ключ", category: "repair", price: 25, city: "Оргеев", date: "2 дня назад", badge: "Услуга", status: "Активное", seller: "Алексей", phone: "+373 79 555 120", email: "remont@example.md", messenger: "Telegram: @remont_md", description: "Бригада выполняет ремонт квартир, санузлов и кухонь. Выезд на оценку, договор, сроки." },
  { id: "demo-4", title: "Детская коляска 3 в 1", category: "kids", price: 160, city: "Комрат", date: "Сегодня", badge: "Скидка", status: "Активное", seller: "Елена", phone: "+373 67 440 300", email: "elena.kids@example.md", messenger: "Viber: +373 67 440 300", description: "Коляска после одного ребенка, чистая, удобная, все механизмы работают." }
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getCategoryName(id: string) {
  return categories.find((category) => category.id === id)?.name ?? "Категория";
}

export function getUserListings() {
  return readJson<Listing[]>(USER_LISTINGS_KEY, []);
}

export function getAllListings() {
  const statusOverrides = readJson<Record<string, ListingStatus>>(STATUS_OVERRIDES_KEY, {});
  return [...getUserListings(), ...demoListings].map((listing) => ({
    ...listing,
    status: statusOverrides[listing.id] ?? listing.status
  }));
}

export function saveUserListing(listing: Omit<Listing, "id" | "date" | "badge" | "status" | "isUserListing">) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  const newListing: Listing = {
    ...listing,
    id,
    date: "Только что",
    badge: "Новое",
    status: "На модерации",
    isUserListing: true
  };
  writeJson(USER_LISTINGS_KEY, [newListing, ...getUserListings()]);
  return newListing;
}

export function setListingStatus(id: string, status: ListingStatus) {
  const userListings = getUserListings();
  const updatedUserListings = userListings.map((listing) => listing.id === id ? { ...listing, status } : listing);
  writeJson(USER_LISTINGS_KEY, updatedUserListings);
  const overrides = readJson<Record<string, ListingStatus>>(STATUS_OVERRIDES_KEY, {});
  writeJson(STATUS_OVERRIDES_KEY, { ...overrides, [id]: status });
}

export function clearUserListings() {
  writeJson(USER_LISTINGS_KEY, []);
}
