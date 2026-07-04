import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Category, Listing, ListingCondition, ListingStatus } from "@/types/listing";

export const categories: Category[] = [
  { id: "transport", name: "Транспорт", icon: "car" },
  { id: "realty", name: "Недвижимость", icon: "home" },
  { id: "phones", name: "Телефоны и гаджеты", icon: "phone" },
  { id: "computers", name: "Компьютеры и офис", icon: "laptop" },
  { id: "repair", name: "Строительство и ремонт", icon: "tool" },
  { id: "fashion", name: "Одежда и обувь", icon: "shirt" },
  { id: "home", name: "Дом и мебель", icon: "sofa" },
  { id: "jobs", name: "Работа", icon: "briefcase" },
  { id: "services", name: "Услуги", icon: "spark" },
  { id: "kids", name: "Для детей", icon: "kids" },
  { id: "pets", name: "Животные", icon: "paw" },
  { id: "free", name: "Отдам даром", icon: "gift" }
];

const USER_LISTINGS_KEY = "baraholkaUserListings";
const STATUS_OVERRIDES_KEY = "baraholkaStatusOverrides";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=78";

type ListingInput = Omit<Listing, "id" | "date" | "badge" | "status" | "isUserListing" | "image" | "condition"> & {
  condition?: ListingCondition;
};

type DbListing = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category_id: string;
  price: number;
  city: string;
  seller_name: string;
  phone: string;
  email: string | null;
  messenger: string | null;
  image_url: string | null;
  condition: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

const statusMap: Record<string, ListingStatus> = {
  active: "Активное",
  moderation: "На модерации",
  pending: "На модерации",
  rejected: "Отклонено",
  draft: "Черновик",
  archived: "Архив",
  sold: "Продано",
  deleted: "Удалено",
  "Активное": "Активное",
  "На модерации": "На модерации",
  "Отклонено": "Отклонено",
  "Черновик": "Черновик",
  "Архив": "Архив",
  "Продано": "Продано",
  "Удалено": "Удалено",
  "ÐÐºÑ‚Ð¸Ð²Ð½Ð¾Ðµ": "Активное",
  "ÐÐ° Ð¼Ð¾Ð´ÐµÑ€Ð°Ñ†Ð¸Ð¸": "На модерации",
  "ÐžÑ‚ÐºÐ»Ð¾Ð½ÐµÐ½Ð¾": "Отклонено",
  "Ð§ÐµÑ€Ð½Ð¾Ð²Ð¸Ðº": "Черновик",
  "ÐÑ€Ñ…Ð¸Ð²": "Архив",
  "ÐŸÑ€Ð¾Ð´Ð°Ð½Ð¾": "Продано",
  "Ð£Ð´Ð°Ð»ÐµÐ½Ð¾": "Удалено"
};

const conditionMap: Record<string, ListingCondition> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  used: "Б/у",
  service: "Услуга",
  job: "Работа",
  "Новое": "Новое",
  "Отличное": "Отличное",
  "Хорошее": "Хорошее",
  "Б/у": "Б/у",
  "Услуга": "Услуга",
  "Работа": "Работа",
  "ÐÐ¾Ð²Ð¾Ðµ": "Новое",
  "ÐžÑ‚Ð»Ð¸Ñ‡Ð½Ð¾Ðµ": "Отличное",
  "Ð¥Ð¾Ñ€Ð¾ÑˆÐµÐµ": "Хорошее",
  "Ð‘/Ñƒ": "Б/у",
  "Ð£ÑÐ»ÑƒÐ³Ð°": "Услуга",
  "Ð Ð°Ð±Ð¾Ñ‚Ð°": "Работа"
};

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
    condition: "Хорошее",
    seller: "Сергей",
    phone: "+373 68 901 222",
    email: "serg.phone@example.md",
    messenger: "Telegram: @serg_mobile",
    image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1200&q=78",
    description: "Телефон аккуратный, батарея держит хорошо, Face ID работает. В комплекте коробка и кабель."
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
    condition: "Хорошее",
    seller: "Наталья",
    phone: "+373 69 411 520",
    email: "natalia.home@example.md",
    messenger: "Viber: +373 69 411 520",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=78",
    description: "Удобный раскладной диван, ткань чистая, механизм работает. Самовывоз из Бельц."
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
    condition: "Отличное",
    seller: "Мария",
    phone: "+373 78 300 450",
    email: "maria.home@example.md",
    messenger: "Telegram: @maria_home",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=78",
    description: "Светлая квартира рядом с остановкой и магазинами. Есть мебель, техника и интернет."
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
    condition: "Работа",
    seller: "Magazin Local",
    phone: "+373 22 880 880",
    email: "hr@magazinlocal.example",
    messenger: "Telegram: @local_hr",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=78",
    description: "Нужен ответственный человек в магазин у дома. График посменный, обучение на месте."
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
    condition: "Услуга",
    seller: "Алексей",
    phone: "+373 79 555 120",
    email: "remont@example.md",
    messenger: "Telegram: @remont_md",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=78",
    description: "Бригада выполняет ремонт квартир, кухонь и санузлов. Выезд на оценку, понятная смета."
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
    condition: "Хорошее",
    seller: "Елена",
    phone: "+373 67 440 300",
    email: "elena.kids@example.md",
    messenger: "Viber: +373 67 440 300",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=78",
    description: "Коляска после одного ребенка, чистая и удобная. Люлька, прогулочный блок и автокресло."
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
    condition: "Б/у",
    seller: "Дмитрий",
    phone: "+373 60 777 214",
    email: "bike@example.md",
    messenger: "Viber: +373 60 777 214",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=78",
    description: "Велосипед для города и прогулок, передачи переключаются, тормоза исправны."
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
    condition: "Отличное",
    seller: "Dumitru",
    phone: "+373 60 777 214",
    email: "office.tech@example.md",
    messenger: "Viber: +373 60 777 214",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=78",
    description: "Рабочий ноутбук для офиса и учебы. SSD, 16 GB RAM, зарядное устройство в комплекте."
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
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

function normalizeStatus(status: string | null | undefined): ListingStatus {
  return statusMap[status ?? ""] ?? "На модерации";
}

function normalizeCondition(condition: string | null | undefined): ListingCondition {
  return conditionMap[condition ?? ""] ?? "Б/у";
}

function normalizeListing(listing: Listing): Listing {
  return {
    ...listing,
    status: normalizeStatus(listing.status),
    condition: normalizeCondition(listing.condition),
    image: listing.image ?? FALLBACK_IMAGE
  };
}

function mapDbListing(row: DbListing): Listing {
  const status = normalizeStatus(row.status);

  return {
    id: row.id,
    title: row.title,
    category: row.category_id,
    price: Number(row.price),
    city: row.city,
    seller: row.seller_name,
    phone: row.phone,
    email: row.email ?? "",
    messenger: row.messenger ?? "Не указан",
    description: row.description,
    date: new Date(row.created_at).toLocaleDateString("ru-RU"),
    badge: status === "На модерации" ? "Модерация" : "Новое",
    status,
    condition: normalizeCondition(row.condition),
    image: row.image_url ?? FALLBACK_IMAGE
  };
}

export function getCategoryName(id: string) {
  return categories.find((category) => category.id === id)?.name ?? "Категория";
}

export function getCategoryIcon(id: string) {
  return categories.find((category) => category.id === id)?.icon ?? "dot";
}

export function getUserListings() {
  return readJson<Listing[]>(USER_LISTINGS_KEY, []).map(normalizeListing);
}

export function getLocalListings() {
  const overrides = readJson<Record<string, ListingStatus>>(STATUS_OVERRIDES_KEY, {});
  return [...getUserListings(), ...demoListings].map((listing) => normalizeListing({ ...listing, status: overrides[listing.id] ?? listing.status }));
}

export const getAllListings = getLocalListings;

export async function fetchListings() {
  if (!isSupabaseConfigured || !supabase) return getLocalListings();
  const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (error) {
    console.warn("Listings fallback", error.message);
    return getLocalListings();
  }
  return data.length ? (data as DbListing[]).map(mapDbListing) : getLocalListings();
}

export async function fetchAdminListings() {
  if (!isSupabaseConfigured || !supabase) return getLocalListings();
  const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Не удалось загрузить объявления. Попробуйте обновить страницу.");
  return (data as DbListing[]).map(mapDbListing);
}

export async function updateAdminListingStatus(id: string, status: ListingStatus, reason?: string, comment?: string) {
  if (!isSupabaseConfigured || !supabase || id.startsWith("demo-")) {
    setListingStatus(id, status);
    return;
  }

  const { data: existing } = await supabase.from("listings").select("status").eq("id", id).single();
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) throw new Error("Не удалось изменить статус объявления.");

  await supabase.from("listing_status_history").insert({
    listing_id: id,
    old_status: existing?.status ?? null,
    new_status: status,
    reason,
    comment
  });
}

export async function deleteAdminListing(id: string) {
  if (!isSupabaseConfigured || !supabase || id.startsWith("demo-")) {
    deleteListing(id);
    return;
  }
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error("Не удалось удалить объявление.");
}

async function uploadListingPhoto(userId: string, file?: File | null) {
  if (!file || !supabase) return FALLBACK_IMAGE;
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("listing-photos").upload(path, file, { upsert: false });
  if (error) throw new Error("Не удалось загрузить фото.");
  return supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
}

export async function saveListing(input: ListingInput, imageFile?: File | null) {
  if (!isSupabaseConfigured || !supabase) return saveUserListing(input);
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Войдите в аккаунт, чтобы подать объявление.");
  const imageUrl = await uploadListingPhoto(user.id, imageFile);
  const { data, error } = await supabase.from("listings").insert({
    user_id: user.id,
    title: input.title,
    description: input.description,
    category_id: input.category,
    price: input.price,
    city: input.city,
    seller_name: input.seller,
    phone: input.phone,
    email: input.email,
    messenger: input.messenger,
    image_url: imageUrl,
    condition: input.condition ?? "Б/у",
    status: "На модерации"
  }).select("*").single();
  if (error) throw new Error("Не удалось подать объявление. Проверьте поля и попробуйте еще раз.");
  return mapDbListing(data as DbListing);
}

export function saveUserListing(listing: ListingInput) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  const newListing: Listing = {
    ...listing,
    id,
    image: FALLBACK_IMAGE,
    condition: listing.condition ?? "Б/у",
    date: "Только что",
    badge: "Новое",
    status: "На модерации",
    isUserListing: true
  };
  writeJson(USER_LISTINGS_KEY, [newListing, ...getUserListings()]);
  return newListing;
}

export function setListingStatus(id: string, status: ListingStatus) {
  writeJson(USER_LISTINGS_KEY, getUserListings().map((listing) => listing.id === id ? { ...listing, status } : listing));
  const overrides = readJson<Record<string, ListingStatus>>(STATUS_OVERRIDES_KEY, {});
  writeJson(STATUS_OVERRIDES_KEY, { ...overrides, [id]: status });
}

export function deleteListing(id: string) {
  writeJson(USER_LISTINGS_KEY, getUserListings().filter((listing) => listing.id !== id));
  const overrides = readJson<Record<string, ListingStatus>>(STATUS_OVERRIDES_KEY, {});
  writeJson(STATUS_OVERRIDES_KEY, { ...overrides, [id]: "Удалено" });
}

export function clearUserListings() {
  writeJson(USER_LISTINGS_KEY, []);
}
