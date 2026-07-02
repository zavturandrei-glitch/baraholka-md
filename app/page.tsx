'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { categories, clearUserListings, getAllListings, getCategoryName, saveUserListing } from "@/lib/listings";
import type { Listing } from "@/types/listing";

const cities = ["Кишинев", "Бельцы", "Комрат", "Оргеев"];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    setListings(getAllListings());
    setReady(true);
  }, []);

  const filteredListings = useMemo(() => {
    const price = Number(maxPrice);
    return [...listings]
      .filter((listing) => category === "all" || listing.category === category)
      .filter((listing) => !query || `${listing.title} ${listing.description}`.toLowerCase().includes(query.toLowerCase()))
      .filter((listing) => city === "all" || listing.city === city)
      .filter((listing) => !price || listing.price <= price)
      .sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.id.localeCompare(a.id));
  }, [category, city, listings, maxPrice, query, sort]);

  function refresh() {
    setListings(getAllListings());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newListing = saveUserListing({
      title: String(form.get("title")),
      category: String(form.get("category")),
      price: Number(form.get("price")),
      city: String(form.get("city")),
      seller: String(form.get("seller")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      messenger: String(form.get("messenger") || "Не указан"),
      description: String(form.get("description"))
    });
    event.currentTarget.reset();
    setCategory(newListing.category);
    refresh();
  }

  function resetFilters() {
    setCategory("all");
    setCity("all");
    setMaxPrice("");
    setQuery("");
    setSort("new");
  }

  function clearTests() {
    clearUserListings();
    resetFilters();
    refresh();
  }

  return (
    <main>
      <section className="search-panel">
        <div className="search-box">
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Все категории</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Что ищем? Например: квартира, iPhone, работа" />
          <button type="button">Найти</button>
        </div>
        <a className="post-btn" href="#post-form">Подать объявление</a>
      </section>

      <section className="layout">
        <aside className="categories-panel">
          <div className="section-head"><h2>Категории</h2><span>{categories.length} разделов</span></div>
          <div className="category-list">
            <button className={`category-btn ${category === "all" ? "active" : ""}`} onClick={() => setCategory("all")}><span className="category-icon">*</span><span>Все категории</span><span>{listings.length}</span></button>
            {categories.map((item) => (
              <button className={`category-btn ${category === item.id ? "active" : ""}`} key={item.id} onClick={() => setCategory(item.id)}>
                <span className="category-icon">{item.icon}</span><span>{item.name}</span><span>{listings.filter((listing) => listing.category === item.id).length}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="content">
          <div className="hero">
            <div><p>Baraholka.md</p><h1>Простая барахолка для людей и небольшого бизнеса в Молдове</h1></div>
            <button onClick={resetFilters}>Смотреть все</button>
          </div>

          <div className="filters">
            <label>Город<select value={city} onChange={(event) => setCity(event.target.value)}><option value="all">Все города</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Цена до<input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} type="number" min="0" placeholder="Любая" /></label>
            <label>Сортировка<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="new">Сначала новые</option><option value="low">Сначала дешевле</option><option value="high">Сначала дороже</option></select></label>
          </div>

          <div className="section-head listings-head"><h2>{category === "all" ? "Объявления" : getCategoryName(category)}</h2><div className="list-tools"><button className="ghost-btn clear-btn" onClick={clearTests}>Очистить мои тестовые объявления</button><span>{filteredListings.length} найдено</span></div></div>
          {!ready || filteredListings.length === 0 ? <div className="empty"><h3>Ничего не найдено</h3><p>Попробуйте другой запрос, город или категорию.</p></div> : <ListingGrid listings={filteredListings} />}

          <form id="post-form" className="post-form" onSubmit={handleSubmit}>
            <div className="section-head"><h2>Подать объявление</h2><span>Статус: На модерации</span></div>
            <label>Название<input name="title" required maxLength={80} placeholder="Например, iPhone 14 Pro 128 GB" /></label>
            <label>Категория<select name="category" required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <div className="form-row"><label>Цена, EUR<input name="price" required type="number" min="0" /></label><label>Город<select name="city">{cities.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            <div className="form-row"><label>Имя продавца<input name="seller" required /></label><label>Телефон<input name="phone" required type="tel" /></label></div>
            <div className="form-row"><label>Email<input name="email" required type="email" /></label><label>Telegram / Viber<input name="messenger" /></label></div>
            <label>Описание<textarea name="description" required /></label>
            <button className="post-btn" type="submit">Опубликовать</button>
          </form>
        </section>
      </section>
    </main>
  );
}

function ListingGrid({ listings }: { listings: Listing[] }) {
  return <div className="listing-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>;
}

function ListingCard({ listing }: { listing: Listing }) {
  const [phoneShown, setPhoneShown] = useState(false);
  return (
    <article className="listing-card">
      <div className="card-image">{getCategoryName(listing.category).slice(0, 1)}</div>
      <div className="card-body">
        <h3 className="card-title">{listing.title}</h3>
        <p className="card-price">{listing.price.toLocaleString("ru-RU")} EUR</p>
        <div className="card-meta"><span>Город: <strong>{listing.city}</strong></span><span>Продавец: <strong>{listing.seller}</strong></span><span>{listing.date}</span></div>
        <div className="card-badges"><span className="badge">{listing.badge}</span><span className={`status ${listing.status === "Активное" ? "status-active" : listing.status === "Отклонено" ? "status-rejected" : "status-moderation"}`}>{listing.status}</span></div>
        <div className="card-actions"><button className="card-action" onClick={() => setPhoneShown(true)}>{phoneShown ? listing.phone : "Показать телефон"}</button><Link className="card-action primary" href={`/listings/${listing.id}`}>Подробнее</Link></div>
      </div>
    </article>
  );
}
