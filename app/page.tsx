'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { categories, fetchListings, getCategoryName, saveListing } from "@/lib/listings";
import { cityOptions, searchSuggestions } from "@/lib/catalog";
import { getListingViews, readStringList, saveSearchQuery, SEARCH_HISTORY_KEY } from "@/lib/marketplace";
import type { Listing } from "@/types/listing";

const popularCategoryIds = ["transport", "realty", "phones", "computers", "home", "fashion", "kids", "pets", "services", "jobs"];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") ?? "";
    if (initialQuery) setQuery(initialQuery);
    setHistory(readStringList(SEARCH_HISTORY_KEY));
    fetchListings().then(setListings).finally(() => setReady(true));
  }, []);

  const filteredListings = useMemo(() => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    return listings
      .filter((listing) => category === "all" || listing.category === category)
      .filter((listing) => city === "all" || listing.city === city)
      .filter((listing) => !query || `${listing.title} ${listing.description}`.toLowerCase().includes(query.toLowerCase()))
      .filter((listing) => !min || listing.price >= min)
      .filter((listing) => !max || listing.price <= max)
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [category, city, listings, maxPrice, minPrice, query]);

  const vipListings = useMemo(
    () => listings.filter((listing) => listing.status === "Активное").slice(0, 4),
    [listings]
  );

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHistory(saveSearchQuery(query));
  }

  async function handleQuickPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await saveListing({
        title: String(form.get("title")),
        category: String(form.get("category")),
        price: Number(form.get("price")),
        city: String(form.get("city")),
        seller: String(form.get("seller")),
        phone: String(form.get("phone")),
        email: String(form.get("email")),
        messenger: String(form.get("messenger") || "Не указан"),
        description: String(form.get("description"))
      }, form.get("photo") instanceof File ? form.get("photo") as File : null);
      event.currentTarget.reset();
      setListings(await fetchListings());
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось подать объявление");
    }
  }

  return (
    <main className="market-home">
      <h1 className="sr-only">Baraholka.md - доска объявлений в Молдове</h1>

      <section className="market-search" aria-label="Поиск объявлений">
        <form className="market-search-grid" onSubmit={submitSearch}>
          <label>
            <span>Что ищем</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Что вы хотите найти?" />
          </label>
          <label>
            <span>Категория</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Все категории</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span>Регион</span>
            <select value={city} onChange={(event) => setCity(event.target.value)}>
              <option value="all">Вся Молдова</option>
              {cityOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Цена от</span>
            <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="0" />
          </label>
          <label>
            <span>Цена до</span>
            <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="9999" />
          </label>
          <button type="submit">Найти</button>
        </form>
        <div className="market-tags" aria-label="Популярные запросы">
          {[...searchSuggestions, ...history].slice(0, 8).map((item) => (
            <button key={item} onClick={() => { setQuery(item); saveSearchQuery(item); }}>{item}</button>
          ))}
        </div>
      </section>

      <section className="market-section">
        <div className="market-section-head">
          <h2>Популярные категории</h2>
          <Link href="/categories/transport">Все категории</Link>
        </div>
        <div className="market-category-grid">
          {popularCategoryIds.map((id) => (
            <Link className="market-category" key={id} href={`/categories/${id}`}>
              <span><CategoryIcon id={id} /></span>
              <strong>{getCategoryName(id)}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="market-section">
        <div className="market-section-head">
          <h2>VIP объявления</h2>
          <span>Лучшие предложения сейчас</span>
        </div>
        <div className="market-card-grid">
          {vipListings.map((listing) => <MarketplaceCard key={listing.id} listing={listing} vip />)}
        </div>
      </section>

      <section className="market-section">
        <div className="market-section-head">
          <h2>Последние объявления</h2>
          <span>{ready ? `${filteredListings.length} найдено` : "Загрузка..."}</span>
        </div>
        {filteredListings.length === 0 ? (
          <div className="empty"><h3>Ничего не найдено</h3><p>Попробуйте изменить запрос, категорию или цену.</p></div>
        ) : (
          <div className="market-card-grid latest">
            {filteredListings.slice(0, 12).map((listing) => <MarketplaceCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </section>

      <section className="market-benefits" aria-label="Почему Baraholka.md">
        <div>Удобный поиск</div>
        <div>Безопасность</div>
        <div>Проверенные объявления</div>
        <div>Бесплатное размещение</div>
      </section>

      <section className="quick-post" id="post-form">
        <div className="market-section-head">
          <h2>Подать объявление</h2>
          <span>Короткая форма MVP, объявление попадет на модерацию</span>
        </div>
        <form className="quick-post-grid" onSubmit={handleQuickPost}>
          <input name="title" required placeholder="Название объявления" />
          <select name="category" required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <input name="price" required type="number" min="0" placeholder="Цена, EUR" />
          <select name="city">{cityOptions.map((item) => <option key={item}>{item}</option>)}</select>
          <input name="seller" required placeholder="Ваше имя" />
          <input name="phone" required type="tel" placeholder="Телефон" />
          <input name="email" required type="email" placeholder="Email" />
          <input name="messenger" placeholder="Telegram / Viber" />
          <input name="photo" type="file" accept="image/*" />
          <textarea name="description" required placeholder="Описание" />
          <button className="primary-btn" type="submit">Опубликовать</button>
        </form>
      </section>
    </main>
  );
}

function MarketplaceCard({ listing, vip = false }: { listing: Listing; vip?: boolean }) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    setViews(Number(localStorage.getItem(`baraholkaViews:${listing.id}`) ?? "0") || getListingViews(listing.id));
  }, [listing.id]);

  return (
    <article className="market-card">
      <Link href={`/listings/${listing.id}`} className="market-card-media">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        {vip && <span className="vip-badge">VIP</span>}
        <button aria-label="Добавить в избранное">♡</button>
      </Link>
      <div className="market-card-body">
        <strong>{listing.price.toLocaleString("ru-RU")} EUR</strong>
        <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
        <p>{listing.city} · {listing.date} · {views} просмотров</p>
      </div>
    </article>
  );
}
