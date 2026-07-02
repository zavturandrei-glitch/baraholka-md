'use client';

import { useEffect, useState } from "react";
import { deleteListing, getAllListings, getCategoryName, setListingStatus } from "@/lib/listings";
import type { Listing, ListingStatus } from "@/types/listing";

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "Все">("Все");
  function refresh() { setListings(getAllListings()); }
  useEffect(() => { refresh(); }, []);
  function changeStatus(id: string, status: ListingStatus) { setListingStatus(id, status); refresh(); }
  function removeListing(id: string) { deleteListing(id); refresh(); }
  const visibleListings = listings.filter((listing) => statusFilter === "Все" || listing.status === statusFilter);

  return (
    <main className="page-narrow">
      <div className="admin-head"><div><span className="eyebrow">Админка</span><h1>Модерация объявлений</h1><p>Временная localStorage-админка для MVP, без настоящей авторизации. Supabase пока не подключен.</p></div><label>Фильтр<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ListingStatus | "Все")}><option>Все</option><option>На модерации</option><option>Активное</option><option>Отклонено</option></select></label></div>
      <div className="admin-list">{visibleListings.map((listing) => { const statusClass = listing.status === "Активное" ? "status-active" : listing.status === "Отклонено" ? "status-rejected" : "status-moderation"; return <article className="admin-row" key={listing.id}><img src={listing.image} alt={listing.title} /><div><h2>{listing.title}</h2><p>{getCategoryName(listing.category)} · {listing.city} · {listing.seller}</p><span className={`status ${statusClass}`}>{listing.status}</span></div><div className="admin-actions"><button onClick={() => changeStatus(listing.id, "Активное")}>Одобрить</button><button onClick={() => changeStatus(listing.id, "Отклонено")}>Отклонить</button><button className="danger-action" onClick={() => removeListing(listing.id)}>Удалить</button></div></article>; })}</div>
    </main>
  );
}