'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllListings, getCategoryName } from "@/lib/listings";
import type { Listing } from "@/types/listing";

export default function ListingPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [phoneShown, setPhoneShown] = useState(false);

  useEffect(() => {
    setListing(getAllListings().find((item) => item.id === params.id) ?? null);
  }, [params.id]);

  if (!listing) {
    return <main className="page-narrow"><div className="empty"><h1>Объявление не найдено</h1><p>Возможно, оно было удалено или очищено из тестовых данных.</p><Link className="post-btn" href="/">На главную</Link></div></main>;
  }

  const statusClass = listing.status === "Активное" ? "status-active" : listing.status === "Отклонено" ? "status-rejected" : "status-moderation";

  return (
    <main className="page-narrow">
      <Link className="back-link" href="/">Назад к объявлениям</Link>
      <article className="detail-card">
        <div className="detail-top"><div><p>{getCategoryName(listing.category)}</p><h1>{listing.title}</h1></div><span className={`status ${statusClass}`}>{listing.status}</span></div>
        <div className="detail-price">{listing.price.toLocaleString("ru-RU")} EUR</div>
        <div className="detail-grid"><div><span>Город</span><strong>{listing.city}</strong></div><div><span>Продавец</span><strong>{listing.seller}</strong></div><div><span>Email</span><strong>{listing.email}</strong></div><div><span>Telegram / Viber</span><strong>{listing.messenger}</strong></div></div>
        <section className="detail-description"><h2>Описание</h2><p>{listing.description}</p></section>
        <section className="detail-contacts"><h2>Контакты</h2><p><span>Телефон:</span> <strong>{phoneShown ? listing.phone : "скрыт"}</strong></p><button className="ghost-btn" onClick={() => setPhoneShown(true)}>{phoneShown ? listing.phone : "Показать телефон"}</button></section>
      </article>
    </main>
  );
}
