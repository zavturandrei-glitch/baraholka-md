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
  { id: "kids", name: "Для детей", icon: "K" },
  { id: "pets", name: "Животные", icon: "P" },
  { id: "free", name: "Отдам даром", icon: "0" }
];

const USER_LISTINGS_KEY = "baraholkaUserListings";
const STATUS_OVERRIDES_KEY = "baraholkaStatusOverrides";

export const demoListings: Listing[] = [
  {
    id: "demo-phone",
    title: "iPhone 13 128 GB в хорошем состоянии",
    category: "phones",
    price: 420,
    city: "Кишинев",
    date: "Сегодня",
    badge: "Новое",
    status: "Активное",
    seller: "Сергей",
    phone: "+373 68 901 222",
    email: "serg.phone@example.md",
    messenger: "Telegram: @serg_mobile",
    description: "Телефон аккуратный, батарея держит хорошо, Face ID работает. В комплекте коробка и кабель. Возможна проверка на месте."
  },
  {
    id: "demo-sofa",
    title: "Диван раскладной для гостиной",
    category: "home",
    price: 180,
    city: "Бельцы",
    date: "Сегодня",
    badge: "Торг",
    status: "Активное",
    seller: "Наталья",
    phone: "+373 69 411 520",
    email: "natalia.home@example.md",
    messenger: "Viber: +373 69 411 520",
    description: "Удобный раскладной диван, ткань чистая, механизм работает. Подойдет для квартиры или дачи. Самовывоз из Бельц."
  },
  {
    id: "demo-flat",
    title: "Сдается 2-комнатная квартира, Ботаника",
    category: "realty",
    price: 430,
    city: "Кишинев",
    date: "Вчера",
    badge: "Аренда",
    status: "Активное",
    seller: "Мария",
    phone: "+373 78 300 450",
    email: "maria.home@example.md",
    messenger: "Telegram: @maria_home",
    description: "Светлая квартира рядом с остановкой и магазинами. Есть мебель, техника, интернет. Рассматриваем аккуратных жильцов на длительный срок."
  },
  {
    id: "demo-job",
    title: "Продавец-консультант в небольшой магазин",
    category: "jobs",
    price: 650,
    city: "Кишинев",
    date: "Сегодня",
    badge: "Работа",
    status: "На модерации",
    seller: "Magazin Local",
    phone: "+373 22 880 880",
    email: "hr@magazinlocal.example",
    messenger: "Telegram: @local_hr",
    description: "Нужен ответственный человек в магазин у дома. График посменный, обучение на месте, дружелюбный коллектив."
  },
  {
    id: "demo-repair",
    title: "Ремонт квартир и санузлов под ключ",
    category: "repair",
    price: 25,
    city: "Оргеев",
    date: "2 дня назад",
    badge: "Услуга",
    status: "Активное",
    seller: "Алексей",
    phone: "+373 79 555 120",
    email: "remont@example.md",
    messenger: "Telegram: @remont_md",
    description: "Бригада выполняет ремонт квартир, кухонь и санузлов. Выезд на оценку, понятная смета, помощь с материалами."
  },
  {
    id: "demo-stroller",
    title: "Детская коляска 3 в 1",
    category: "kids",
    price: 160,
    city: "Комрат",
    date: "Сегодня",
    badge: "Скидка",
    status: "Активное",
    seller: "Елена",
    phone: "+373 67 440 300",
    email: "elena.kids@example.md",
    messenger: "Viber: +373 67 440 300",
    description: "Коляска после одного ребенка, чистая и удобная. Люлька, прогулочный блок и автокресло в комплекте."
  },
  {
    id: "demo-bike",
    title: "Городской велосипед 28 дюймов",
    category: "transport",
    price: 120,
    city: "Кагул",
    date: "Вчера",
    badge: "Торг",
    status: "Активное",
    seller: "Дмитрий",
    phone: "+373 60 777 214",
    email: "bike@example.md",
    messenger: "Viber: +373 60 777 214",
    description: "Велосипед для города и прогулок, передачи переключаются, тормоза исправны. Есть небольшой торг у велосипеда."
  },
  {
    id: "demo-laptop",
    title: "Ноутбук Lenovo ThinkPad T14",
    category: "computers",
    price: 430,
    city: "Кишинев",
    date: "Сегодня",
    badge: "Гарантия",
    status: "Активное",
    seller: "Dumitru",
    phone: "+373 60 777 214",
    email: "office.tech@example.md",
    messenger: "Viber: +373 60 777 214",
    description: "Рабочий ноутбук для офиса и учебы. SSD, 16 GB RAM, зарядное устройство в комплекте. Можно проверить перед покупкой."
  }
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

export function deleteListing(id: string) {
  const updatedUserListings = getUserListings().filter((listing) => listing.id !== id);
  writeJson(USER_LISTINGS_KEY, updatedUserListings);
  const overrides = readJson<Record<string, ListingStatus>>(STATUS_OVERRIDES_KEY, {});
  writeJson(STATUS_OVERRIDES_KEY, { ...overrides, [id]: "Отклонено" });
}

export function clearUserListings() {
  writeJson(USER_LISTINGS_KEY, []);
}