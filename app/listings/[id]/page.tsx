'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchListings, getCategoryIcon, getCategoryName } from "@/lib/listings";
import type { Listing } from "@/types/listing";

export default function ListingPage({ params }: { params: { id: string } }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [phoneShown, setPhoneShown] = useState(false);

  useEffect(() => { fetchListings().then(setListings); }, []);

  const listing = listings.find((item) => item.id === params.id);
  const related = useMemo(() => listing ? listings.filter((item) => item.category === listing.category && item.id !== listing.id).slice(0, 3) : [], [listing, listings]);

  if (!listing) return <main className="page-narrow"><div className="empty"><h1>Объявление не найдено</h1><p>Оно могло быть удалено или очищено из тестовых данных.</p><Link className="primary-btn" href="/">Назад</Link></div></main>;

  const statusClass = listing.status === "Активное" ? "status-active" : listing.status === "Отклонено" ? "status-rejected" : "status-moderation";

  return (
    <main className="page-narrow">
      <Link className="back-link" href="/">← Назад</Link>
      <article className="product-page">
        <section className="gallery-card"><img src={listing.image} alt={listing.title} /><div className="gallery-strip"><img src={listing.image} alt="" /><img src={listing.image} alt="" /><img src={listing.image} alt="" /></div></section>
        <aside className="product-side"><span className="category-badge">{getCategoryIcon(listing.category)} {getCategoryName(listing.category)}</span><h1>{listing.title}</h1><div className="product-price">{listing.price.toLocaleString("ru-RU")} EUR</div><div className="meta-grid"><div><span>Город</span><strong>{listing.city}</strong></div><div><span>Состояние</span><strong>{listing.condition}</strong></div><div><span>Дата</span><strong>{listing.date}</strong></div><div><span>Статус</span><strong className={`status ${statusClass}`}>{listing.status}</strong></div></div><div className="seller-card"><span>Продавец</span><strong>{listing.seller}</strong><p>{listing.email}</p><p>{listing.messenger}</p><button className="primary-btn" onClick={() => setPhoneShown(true)}>{phoneShown ? listing.phone : "Показать телефон"}</button></div></aside>
        <section className="description-card"><h2>Описание</h2><p>{listing.description}</p></section>
      </article>
      <section className="section-block"><div className="section-title"><div><span className="eyebrow">Похожие</span><h2>Ещё в этой категории</h2></div></div><div className="related-grid">{related.map((item) => <Link className="related-card" href={`/listings/${item.id}`} key={item.id}><img src={item.image} alt={item.title} /><strong>{item.title}</strong><span>{item.price.toLocaleString("ru-RU")} EUR</span></Link>)}</div></section>
    </main>
  );
}