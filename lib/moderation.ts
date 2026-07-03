import type { Listing, ListingStatus } from "@/types/listing";

export const REPORTS_KEY = "baraholkaReports";
export const STATUS_HISTORY_KEY = "baraholkaStatusHistory";

export type ModerationStatus = "draft" | "pending" | "active" | "rejected" | "archived" | "sold" | "deleted";

export type ListingReport = {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: string;
  details?: string;
  status: "new" | "reviewing" | "resolved";
  createdAt: string;
};

export type StatusHistoryItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
  comment?: string;
  moderator: string;
  createdAt: string;
};

export const moderationStatuses: { id: ModerationStatus; label: string; listingStatus?: ListingStatus }[] = [
  { id: "draft", label: "Черновик" },
  { id: "pending", label: "На модерации", listingStatus: "На модерации" },
  { id: "active", label: "Активные", listingStatus: "Активное" },
  { id: "rejected", label: "Отклоненные", listingStatus: "Отклонено" },
  { id: "archived", label: "Архив" },
  { id: "sold", label: "Проданные" },
  { id: "deleted", label: "Удаленные" }
];

export const rejectionReasons = [
  "Плохое качество фото",
  "Запрещенный товар",
  "Неправильная категория",
  "Подозрение на мошенничество",
  "Дублирующее объявление",
  "Слишком мало информации",
  "Некорректная цена",
  "Запрещенные контакты в описании",
  "Другая причина"
];

export const reportReasons = [
  "Мошенничество",
  "Неправильная информация",
  "Запрещенный товар",
  "Дубль",
  "Спам",
  "Неактуальное объявление",
  "Другое"
];

export function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export function createLocalReport(listing: Listing, reason: string, details?: string) {
  const report: ListingReport = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
    listingId: listing.id,
    listingTitle: listing.title,
    reason,
    details,
    status: "new",
    createdAt: new Date().toLocaleString("ru-RU")
  };
  writeLocalJson(REPORTS_KEY, [report, ...readLocalJson<ListingReport[]>(REPORTS_KEY, [])]);
  return report;
}

export function readLocalReports() {
  return readLocalJson<ListingReport[]>(REPORTS_KEY, []);
}

export function updateLocalReportStatus(id: string, status: ListingReport["status"]) {
  writeLocalJson(REPORTS_KEY, readLocalReports().map((report) => report.id === id ? { ...report, status } : report));
}

export function addStatusHistory(item: Omit<StatusHistoryItem, "id" | "createdAt" | "moderator">) {
  const historyItem: StatusHistoryItem = {
    ...item,
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
    moderator: "MVP admin",
    createdAt: new Date().toLocaleString("ru-RU")
  };
  writeLocalJson(STATUS_HISTORY_KEY, [historyItem, ...readLocalJson<StatusHistoryItem[]>(STATUS_HISTORY_KEY, [])]);
  return historyItem;
}

export function readStatusHistory(listingId?: string) {
  const history = readLocalJson<StatusHistoryItem[]>(STATUS_HISTORY_KEY, []);
  return listingId ? history.filter((item) => item.listingId === listingId) : history;
}

export function getQualitySignals(listing: Listing) {
  const signals = [
    { label: "Фото добавлено", ok: Boolean(listing.image) },
    { label: "Описание достаточно подробное", ok: listing.description.length >= 60 },
    { label: "Цена указана", ok: listing.price > 0 },
    { label: "Телефон указан", ok: listing.phone.length >= 8 },
    { label: "Категория выбрана", ok: Boolean(listing.category) }
  ];
  const score = Math.round((signals.filter((item) => item.ok).length / signals.length) * 100);
  return { score, signals };
}

export function isSuspiciousListing(listing: Listing) {
  const text = `${listing.title} ${listing.description}`.toLowerCase();
  return listing.price <= 0 || text.includes("предоплата") || text.includes("срочно переведите") || text.includes("whatsapp only");
}
