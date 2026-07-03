export type ListingStatus = "На модерации" | "Активное" | "Отклонено" | "Черновик" | "Архив" | "Продано" | "Удалено";

export type ListingCondition = "Новое" | "Отличное" | "Хорошее" | "Б/у" | "Услуга" | "Работа";

export type Listing = {
  id: string;
  title: string;
  category: string;
  price: number;
  city: string;
  seller: string;
  phone: string;
  email: string;
  messenger: string;
  description: string;
  date: string;
  badge: string;
  status: ListingStatus;
  condition: ListingCondition;
  image: string;
  isUserListing?: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};
