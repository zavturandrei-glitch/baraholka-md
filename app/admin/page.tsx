'use client';

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAdminListing,
  fetchAdminListings,
  getCategoryName,
  updateAdminListingStatus
} from "@/lib/listings";
import {
  addStatusHistory,
  getQualitySignals,
  isSuspiciousListing,
  moderationStatuses,
  readLocalReports,
  readStatusHistory,
  rejectionReasons,
  updateLocalReportStatus
} from "@/lib/moderation";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Listing, ListingStatus } from "@/types/listing";

type AdminSection = "all" | "pending" | "active" | "rejected" | "archive" | "reports" | "users" | "stats" | "settings";

const sections: { id: AdminSection; label: string }[] = [
  { id: "all", label: "Все объявления" },
  { id: "pending", label: "На модерации" },
  { id: "active", label: "Активные" },
  { id: "rejected", label: "Отклоненные" },
  { id: "archive", label: "Архив" },
  { id: "reports", label: "Жалобы" },
  { id: "users", label: "Пользователи" },
  { id: "stats", label: "Статистика" },
  { id: "settings", label: "Настройки" }
];

const statusBySection: Partial<Record<AdminSection, ListingStatus>> = {
  pending: "На модерации",
  active: "Активное",
  rejected: "Отклонено",
  archive: "Архив"
};

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [section, setSection] = useState<AdminSection>("pending");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState("new");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [rejectListing, setRejectListing] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState(rejectionReasons[0]);
  const [adminComment, setAdminComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reports, setReports] = useState(readLocalReports());

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setListings(await fetchAdminListings());
      setReports(readLocalReports());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить админку.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const stats = useMemo(() => {
    const pending = listings.filter((item) => item.status === "На модерации").length;
    const active = listings.filter((item) => item.status === "Активное").length;
    const rejected = listings.filter((item) => item.status === "Отклонено").length;
    const suspicious = listings.filter(isSuspiciousListing).length;
    return [
      { label: "Всего", value: listings.length },
      { label: "На модерации", value: pending },
      { label: "Активные", value: active },
      { label: "Отклоненные", value: rejected },
      { label: "Жалобы", value: reports.length },
      { label: "Риск", value: suspicious }
    ];
  }, [listings, reports.length]);

  const visibleListings = useMemo(() => {
    const sectionStatus = statusBySection[section];
    return listings
      .filter((listing) => !sectionStatus || listing.status === sectionStatus)
      .filter((listing) => !query || `${listing.title} ${listing.description} ${listing.seller}`.toLowerCase().includes(query.toLowerCase()))
      .filter((listing) => category === "all" || listing.category === category)
      .filter((listing) => region === "all" || listing.city === region)
      .sort((a, b) => sort === "price" ? b.price - a.price : b.id.localeCompare(a.id));
  }, [category, listings, query, region, section, sort]);

  const users = useMemo(() => {
    const grouped = new Map<string, Listing[]>();
    listings.forEach((listing) => grouped.set(listing.email || listing.seller, [...(grouped.get(listing.email || listing.seller) ?? []), listing]));
    return Array.from(grouped.entries()).map(([key, userListings]) => ({
      key,
      name: userListings[0]?.seller ?? "Пользователь",
      email: userListings[0]?.email ?? "",
      phone: userListings[0]?.phone ?? "",
      total: userListings.length,
      active: userListings.filter((item) => item.status === "Активное").length,
      rejected: userListings.filter((item) => item.status === "Отклонено").length,
      status: userListings.some(isSuspiciousListing) ? "suspicious" : userListings.length > 2 ? "trusted" : "normal"
    }));
  }, [listings]);

  async function changeStatus(listing: Listing, status: ListingStatus, reason?: string, comment?: string) {
    setBusyId(listing.id);
    setError("");
    setNotice("");
    try {
      await updateAdminListingStatus(listing.id, status, reason, comment);
      addStatusHistory({
        listingId: listing.id,
        listingTitle: listing.title,
        oldStatus: listing.status,
        newStatus: status,
        reason,
        comment
      });
      setNotice(`Статус обновлен: ${status}.`);
      setRejectListing(null);
      setAdminComment("");
      await loadListings();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Не удалось изменить статус.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeListing(listing: Listing) {
    setBusyId(listing.id);
    setError("");
    try {
      addStatusHistory({ listingId: listing.id, listingTitle: listing.title, oldStatus: listing.status, newStatus: "Удалено", reason: "Удаление модератором" });
      await deleteAdminListing(listing.id);
      setNotice("Объявление удалено.");
      await loadListings();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить объявление.");
    } finally {
      setBusyId(null);
    }
  }

  function markReport(id: string) {
    updateLocalReportStatus(id, "resolved");
    setReports(readLocalReports());
    setNotice("Жалоба отмечена как обработанная.");
  }

  return (
    <main className="page-narrow">
      <section className="admin-console-head">
        <div>
          <span className="eyebrow">Admin Control Center</span>
          <h1>Модерация и качество Baraholka.md</h1>
          <p>Панель управления объявлениями, жалобами, пользователями и доверием платформы.</p>
          {!isSupabaseConfigured && <p className="admin-warning">Часть функций модерации скоро будет доступна полностью. Сейчас можно проверять тестовые объявления.</p>}
        </div>
        <Link className="primary-btn" href="/">Открыть сайт</Link>
      </section>

      <section className="admin-metric-grid">
        {stats.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
      </section>

      {error && <p className="admin-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}

      <section className="admin-console">
        <aside className="admin-sidebar">
          {sections.map((item) => (
            <button className={section === item.id ? "active" : ""} key={item.id} onClick={() => setSection(item.id)}>
              {item.label}
            </button>
          ))}
        </aside>

        <div className="admin-workspace">
          {["all", "pending", "active", "rejected", "archive"].includes(section) && (
            <>
              <div className="admin-toolbar">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию, описанию или продавцу" />
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">Все категории</option>
                  {Array.from(new Set(listings.map((item) => item.category))).map((item) => <option key={item} value={item}>{getCategoryName(item)}</option>)}
                </select>
                <select value={region} onChange={(event) => setRegion(event.target.value)}>
                  <option value="all">Все города</option>
                  {Array.from(new Set(listings.map((item) => item.city))).map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="new">Сначала новые</option>
                  <option value="price">Сначала дорогие</option>
                </select>
              </div>

              {isLoading ? <p className="admin-empty">Загружаем объявления...</p> : (
                <div className="moderation-list">
                  {visibleListings.length === 0 && <p className="admin-empty">В этом разделе пока нет объявлений.</p>}
                  {visibleListings.map((listing) => {
                    const quality = getQualitySignals(listing);
                    const suspicious = isSuspiciousListing(listing);
                    const isBusy = busyId === listing.id;
                    return (
                      <article className="moderation-card" key={listing.id}>
                        <img src={listing.image} alt={listing.title} />
                        <div className="moderation-body">
                          <div className="moderation-title">
                            <div>
                              <h2>{listing.title}</h2>
                              <p>{getCategoryName(listing.category)} · {listing.city} · {listing.seller}</p>
                            </div>
                            <strong>{listing.price.toLocaleString("ru-RU")} EUR</strong>
                          </div>
                          <p>{listing.description}</p>
                          <div className="quality-row">
                            <span className="status status-moderation">{listing.status}</span>
                            <span className={quality.score >= 80 ? "quality-good" : "quality-warn"}>Качество {quality.score}%</span>
                            {suspicious && <span className="quality-danger">Проверить риск</span>}
                          </div>
                          <div className="admin-actions">
                            <button disabled={isBusy} onClick={() => setSelectedListing(listing)}>Проверить</button>
                            <button disabled={isBusy} onClick={() => changeStatus(listing, "Активное", "Одобрено модератором")}>Одобрить</button>
                            <button disabled={isBusy} onClick={() => setRejectListing(listing)}>Отклонить</button>
                            <button disabled={isBusy} onClick={() => changeStatus(listing, "Архив", "Архивировано")}>В архив</button>
                            <button className="danger-action" disabled={isBusy} onClick={() => removeListing(listing)}>Удалить</button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {section === "reports" && (
            <section className="admin-table-card">
              <h2>Жалобы пользователей</h2>
              {reports.length === 0 && <p className="admin-empty">Жалоб пока нет.</p>}
              {reports.map((report) => (
                <div className="report-row" key={report.id}>
                  <div><strong>{report.listingTitle}</strong><p>{report.reason} · {report.createdAt}</p>{report.details && <p>{report.details}</p>}</div>
                  <span className="status status-moderation">{report.status}</span>
                  <button onClick={() => markReport(report.id)}>Обработано</button>
                </div>
              ))}
            </section>
          )}

          {section === "users" && (
            <section className="admin-table-card">
              <h2>Пользователи</h2>
              {users.map((user) => (
                <div className="user-row" key={user.key}>
                  <div><strong>{user.name}</strong><p>{user.email} · {user.phone}</p></div>
                  <span>{user.total} объявл.</span><span>{user.active} активн.</span><span>{user.rejected} откл.</span>
                  <strong className={`user-status ${user.status}`}>{user.status}</strong>
                </div>
              ))}
            </section>
          )}

          {section === "stats" && (
            <section className="admin-table-card">
              <h2>История статусов</h2>
              {readStatusHistory().length === 0 && <p className="admin-empty">История появится после первых действий модератора.</p>}
              {readStatusHistory().map((item) => (
                <div className="history-row" key={item.id}>
                  <strong>{item.listingTitle}</strong>
                  <span>{item.oldStatus} → {item.newStatus}</span>
                  <p>{item.reason || "Без причины"} · {item.createdAt}</p>
                </div>
              ))}
            </section>
          )}

          {section === "settings" && (
            <section className="admin-table-card">
              <h2>Настройки платформы</h2>
              <p>Настройки качества, доверия и модерации платформы. Значения будут расширяться по мере роста продукта.</p>
              <div className="settings-grid">
                <label>Порог риска<input defaultValue="70%" /></label>
                <label>Модерация новых объявлений<select defaultValue="on"><option value="on">Включена</option><option value="off">Отключена</option></select></label>
                <label>Регион по умолчанию<input defaultValue="Вся Молдова" /></label>
              </div>
            </section>
          )}
        </div>
      </section>

      {selectedListing && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <button className="modal-close" onClick={() => setSelectedListing(null)}>Закрыть</button>
            <img src={selectedListing.image} alt={selectedListing.title} />
            <h2>{selectedListing.title}</h2>
            <p>{selectedListing.description}</p>
            <div className="spec-grid">
              {getQualitySignals(selectedListing).signals.map((signal) => <div key={signal.label}><span>{signal.label}</span><strong>{signal.ok ? "Да" : "Нет"}</strong></div>)}
              <div><span>Телефон</span><strong>{selectedListing.phone}</strong></div>
              <div><span>Email</span><strong>{selectedListing.email || "Не указан"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {rejectListing && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal-card narrow">
            <button className="modal-close" onClick={() => setRejectListing(null)}>Закрыть</button>
            <h2>Отклонить объявление</h2>
            <p>{rejectListing.title}</p>
            <label>Причина<select value={rejectReason} onChange={(event) => setRejectReason(event.target.value)}>{rejectionReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></label>
            <label>Комментарий модератора<textarea value={adminComment} onChange={(event) => setAdminComment(event.target.value)} placeholder="Что нужно исправить продавцу" /></label>
            <button className="primary-btn" onClick={() => changeStatus(rejectListing, "Отклонено", rejectReason, adminComment)}>Отклонить и сохранить причину</button>
          </div>
        </div>
      )}
    </main>
  );
}
