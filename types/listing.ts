export type ListingStatus = "На модерации" | "Активное" | "Отклонено";

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
  isUserListing?: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};