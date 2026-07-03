'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchListings, getCategoryName } from "@/lib/listings";
import { FAVORITES_KEY, readStringList } from "@/lib/marketplace";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Listing } from "@/types/listing";

type Profile = { id: string; email?: string; name?: string | null };
type AccountTab = "all" | "active" | "moderation" | "drafts" | "archive" | "sold" | "favorites" | "settings" | "stats" | "messages";

const tabs: { id: AccountTab; label: string }[] = [
  { id: "all", label: "Мои объявления" },
  { id: "active", label: "Активные" },
  { id: "moderation", label: "На модерации" },
  { id: "drafts", label: "Черновики" },
  { id: "archive", label: "Архив" },
  { id: "sold", label: "Проданные" },
  { id: "favorites", label: "Избранное" },
  { id: "settings", label: "Профиль" },
  { id: "stats", label: "Статистика" },
  { id: "messages", label: "Сообщения" }
];

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AccountTab>("all");
  const [message, setMessage] = useState("Загрузка...");

  useEffect(() => {
    async function load() {
      const allListings = await fetchListings();
      setFavoriteIds(readStringList(FAVORITES_KEY));
      setListings(allListings.filter((item) => item.isUserListing));

      if (!isSupabaseConfigured || !supabase) {
        setMessage("Supabase env не найден. Кабинет работает в режиме MVP на localStorage.");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setMessage("Войдите, чтобы видеть свои объявления, профиль и избранное.");
        setListings(allListings);
        return;
      }

      setProfile({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name });
      const { data: ownListings } = await supabase.from("listings").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false });
      setListings((ownListings ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category_id,
        price: Number(row.price),
        city: row.city,
        seller: row.seller_name,
        phone: row.phone,
        email: row.email ?? "",
        messenger: row.messenger ?? "",
        description: row.description,
        date: new Date(row.created_at).toLocaleDateString("ru-RU"),
        badge: row.status,
        status: row.status,
        condition: row.condition,
        image: row.image_url ?? ""
      })));
      setMessage("");
    }

    load();
  }, []);

  const visibleListings = useMemo(() => {
    if (activeTab === "active") return listings.filter((listing) => listing.status === "Активное");
    if (activeTab === "moderation") return listings.filter((listing) => listing.status === "На модерации");
    if (activeTab === "favorites") return listings.filter((listing) => favoriteIds.includes(listing.id));
    return listings;
  }, [activeTab, favoriteIds, listings]);

  const stats = [
    { label: "Всего объявлений", value: listings.length },
    { label: "Активные", value: listings.filter((listing) => listing.status === "Активное").length },
    { label: "На модерации", value: listings.filter((listing) => listing.status === "На модерации").length },
    { label: "Избранные", value: favoriteIds.length }
  ];

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="page-narrow">
      <section className="account-head account-head-pro">
        <div>
          <span className="eyebrow">Личный кабинет</span>
          <h1>Панель продавца</h1>
          <p>{message || `Аккаунт: ${profile?.email}`}</p>
        </div>
        <div className="account-actions">
          <Link className="primary-btn" href="/#post-form">Подать объявление</Link>
          <button onClick={signOut}>Выйти</button>
        </div>
      </section>

      <section className="account-stat-grid">
        {stats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="dashboard-shell">
        <aside className="dashboard-tabs">
          {tabs.map((tab) => (
            <button className={activeTab === tab.id ? "active" : ""} key={tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="dashboard-content">
          {["settings", "stats", "messages", "drafts", "archive", "sold"].includes(activeTab) ? (
            <AccountPlaceholder tab={activeTab} profile={profile} stats={stats} />
          ) : (
            <section className="admin-list">
              {visibleListings.length === 0 && <p className="admin-empty">В этом разделе пока нет объявлений.</p>}
              {visibleListings.map((listing) => (
                <article className="admin-row account-listing-row" key={listing.id}>
                  <img src={listing.image} alt={listing.title} />
                  <div>
                    <h2>{listing.title}</h2>
                    <p>{getCategoryName(listing.category)} · {listing.city} · {listing.price.toLocaleString("ru-RU")} EUR</p>
                    <span className="status status-moderation">{listing.status}</span>
                  </div>
                  <Link className="row-link" href={`/listings/${listing.id}`}>Открыть</Link>
                </article>
              ))}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function AccountPlaceholder({ tab, profile, stats }: { tab: AccountTab; profile: Profile | null; stats: { label: string; value: number }[] }) {
  if (tab === "settings") {
    return (
      <section className="account-panel account-panel-large">
        <h2>Настройки профиля</h2>
        <p>{profile?.email || "После входа здесь появятся email, имя, телефон и настройки уведомлений."}</p>
        <div className="settings-grid">
          <label>Имя<input placeholder="Ваше имя" defaultValue={profile?.name ?? ""} /></label>
          <label>Телефон<input placeholder="+373..." /></label>
          <label>Город<input placeholder="Кишинев" /></label>
        </div>
      </section>
    );
  }

  if (tab === "stats") {
    return (
      <section className="account-panel account-panel-large">
        <h2>Статистика просмотров</h2>
        <div className="account-stat-grid compact">{stats.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
        <p>На следующем этапе просмотры можно перенести из localStorage в таблицу listing_views.</p>
      </section>
    );
  }

  if (tab === "messages") {
    return (
      <section className="account-panel account-panel-large">
        <h2>Сообщения</h2>
        <p>Раздел подготовлен под будущие таблицы conversations и messages. Сейчас контакты продавца доступны на странице объявления.</p>
      </section>
    );
  }

  const labels: Record<AccountTab, string> = {
    all: "Мои объявления",
    active: "Активные",
    moderation: "На модерации",
    drafts: "Черновики",
    archive: "Архив",
    sold: "Проданные",
    favorites: "Избранное",
    settings: "Профиль",
    stats: "Статистика",
    messages: "Сообщения"
  };

  return (
    <section className="account-panel account-panel-large">
      <h2>{labels[tab]}</h2>
      <p>Раздел уже есть в интерфейсе кабинета. Следующий шаг — добавить отдельные статусы и таблицы для архива, продаж и черновиков.</p>
    </section>
  );
}
