'use client';

import { useEffect, useState } from "react";
import { getAllListings, getCategoryName, setListingStatus } from "@/lib/listings";
import type { Listing, ListingStatus } from "@/types/listing";

const statuses: ListingStatus[] = ["На модерации", "Активное", "Отклонено"];

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "Все">("Все");

  function refresh() {
    setListings(getAllListings());
  }

  useEffect(() => { refresh(); }, []);

  function changeStatus(id: string, status: ListingStatus) {
    setListingStatus(id, status);
    refresh();
  }

  const visibleListings = listings.filter((listing) => statusFilter === "Все" || listing.status === statusFilter);

  return (
    <main className="page-narrow">
      <div className="admin-head"><div><p>Админка</p><h1>Модерация объявлений</h1></div><label>Статус<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ListingStatus | "Все")}><option>Все</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>
      <div className="admin-list">
        {visibleListings.map((listing) => {
          const statusClass = listing.status === "Активное" ? "status-active" : listing.status === "Отклонено" ? "status-rejected" : "status-moderation";
          return (
            <article className="admin-row" key={listing.id}>
              <div><h2>{listing.title}</h2><p>{getCategoryName(listing.category)} - {listing.city} - {listing.seller}</p><span className={`status ${statusClass}`}>{listing.status}</span></div>
              <div className="admin-actions">{statuses.map((status) => <button key={status} onClick={() => changeStatus(listing.id, status)}>{status}</button>)}</div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
