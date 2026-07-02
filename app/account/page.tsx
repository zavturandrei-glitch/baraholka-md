'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchListings, getCategoryName } from "@/lib/listings";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Listing } from "@/types/listing";

type Profile = { id: string; email?: string; name?: string | null };

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState("Загрузка...");

  useEffect(() => {
    async function load() {
      const allListings = await fetchListings();
      setListings(allListings.filter((item) => item.isUserListing));
      if (!isSupabaseConfigured || !supabase) {
        setMessage("Supabase пока не настроен. Личный кабинет работает как MVP-заготовка.");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setMessage("Войдите, чтобы видеть свои объявления, профиль и избранное.");
        return;
      }
      setProfile({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name });
      const { data: ownListings } = await supabase.from("listings").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false });
      setListings((ownListings ?? []).map((row: any) => ({ id: row.id, title: row.title, category: row.category_id, price: Number(row.price), city: row.city, seller: row.seller_name, phone: row.phone, email: row.email ?? "", messenger: row.messenger ?? "", description: row.description, date: new Date(row.created_at).toLocaleDateString("ru-RU"), badge: row.status, status: row.status, condition: row.condition, image: row.image_url ?? "" })));
      setMessage("");
    }
    load();
  }, []);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="page-narrow">
      <section className="account-head"><div><span className="eyebrow">Личный кабинет</span><h1>Мои объявления</h1><p>{message || `Аккаунт: ${profile?.email}`}</p></div><div className="account-actions"><Link className="primary-btn" href="/#post-form">Подать объявление</Link><button onClick={signOut}>Выйти</button></div></section>
      <section className="account-grid"><div className="account-panel"><h2>Профиль</h2><p>{profile?.name || profile?.email || "Профиль появится после входа."}</p></div><div className="account-panel"><h2>Избранные</h2><p>Раздел подготовлен. Следующий этап — синхронизация с таблицей favorites.</p></div><div className="account-panel"><h2>Сообщения</h2><p>Архитектура таблиц conversations/messages уже подготовлена.</p></div></section>
      <section className="admin-list">{listings.map((listing) => <article className="admin-row" key={listing.id}><img src={listing.image} alt={listing.title} /><div><h2>{listing.title}</h2><p>{getCategoryName(listing.category)} · {listing.city}</p><span className="status status-moderation">{listing.status}</span></div></article>)}</section>
    </main>
  );
}