'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAdminListing,
  fetchAdminListings,
  getCategoryName,
  updateAdminListingStatus
} from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Listing, ListingStatus } from "@/types/listing";

type StatusFilter = ListingStatus | "Все";

const filters: StatusFilter[] = ["Все", "На модерации", "Активное", "Отклонено"];

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Все");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const nextListings = await fetchAdminListings();
      setListings(nextListings);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Не удалось загрузить объявления.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const visibleListings = useMemo(
    () => listings.filter((listing) => statusFilter === "Все" || listing.status === statusFilter),
    [listings, statusFilter]
  );

  async function changeStatus(id: string, status: ListingStatus) {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await updateAdminListingStatus(id, status);
      setNotice(status === "Активное" ? "Объявление одобрено." : "Объявление отклонено.");
      await loadListings();
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "Не удалось изменить статус.";
      setError(message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeListing(id: string) {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await deleteAdminListing(id);
      setNotice("Объявление удалено.");
      await loadListings();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Не удалось удалить объявление.";
      setError(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="page-narrow">
      <div className="admin-head">
        <div>
          <span className="eyebrow">Админка</span>
          <h1>Модерация объявлений</h1>
          <p>
            Объявления загружаются из таблицы Supabase listings. Если env-ключи не настроены,
            админка автоматически работает с локальными тестовыми данными.
          </p>
          {!isSupabaseConfigured && (
            <p className="admin-warning">Supabase env не найден — сейчас включен localStorage fallback.</p>
          )}
        </div>
        <label>
          Фильтр
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            {filters.map((filter) => (
              <option key={filter}>{filter}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}

      {isLoading ? (
        <p className="admin-empty">Загружаем объявления...</p>
      ) : (
        <div className="admin-list">
          {visibleListings.length === 0 && (
            <p className="admin-empty">Объявлений с таким статусом пока нет.</p>
          )}

          {visibleListings.map((listing) => {
            const statusClass =
              listing.status === "Активное"
                ? "status-active"
                : listing.status === "Отклонено"
                  ? "status-rejected"
                  : "status-moderation";
            const isBusy = busyId === listing.id;

            return (
              <article className="admin-row" key={listing.id}>
                <img src={listing.image} alt={listing.title} />
                <div>
                  <h2>{listing.title}</h2>
                  <p>
                    {getCategoryName(listing.category)} · {listing.city} · {listing.seller}
                  </p>
                  <span className={`status ${statusClass}`}>{listing.status}</span>
                </div>
                <div className="admin-actions">
                  <button disabled={isBusy} onClick={() => changeStatus(listing.id, "Активное")}>
                    Одобрить
                  </button>
                  <button disabled={isBusy} onClick={() => changeStatus(listing.id, "Отклонено")}>
                    Отклонить
                  </button>
                  <button className="danger-action" disabled={isBusy} onClick={() => removeListing(listing.id)}>
                    Удалить
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
