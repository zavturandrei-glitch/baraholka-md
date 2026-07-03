'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  categories,
  clearUserListings,
  fetchListings,
  getCategoryIcon,
  getCategoryName,
  saveListing
} from "@/lib/listings";
import { cityOptions, searchSuggestions, trustStats } from "@/lib/catalog";
import type { Listing } from "@/types/listing";

const popular = ["transport", "realty", "phones", "computers", "home", "kids", "pets", "services"];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    fetchListings().then(setListings).finally(() => setReady(true));
  }, []);

  const filteredListings = useMemo(() => {
    const min = Number(minPrice);
    const max = Number(maxPrice);

    return [...listings]
      .filter((listing) => category === "all" || listing.category === category)
      .filter((listing) => !query || `${listing.title} ${listing.description}`.toLowerCase().includes(query.toLowerCase()))
      .filter((listing) => city === "all" || listing.city === city)
      .filter((listing) => !min || listing.price >= min)
      .filter((listing) => !max || listing.price <= max)
      .sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.id.localeCompare(a.id));
  }, [category, city, listings, maxPrice, minPrice, query, sort]);

  const recommendedListings = useMemo(
    () => listings.filter((listing) => listing.status === "Активное").slice(0, 4),
    [listings]
  );

  async function refresh() {
    setListings(await fetchListings());
  }

  function resetFilters() {
    setCategory("all");
    setCity("all");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
    setSort("new");
  }

  function clearTests() {
    clearUserListings();
    resetFilters();
    refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const imageFile = form.get("photo") instanceof File ? (form.get("photo") as File) : null;

    try {
      const newListing = await saveListing({
        title: String(form.get("title")),
        category: String(form.get("category")),
        price: Number(form.get("price")),
        city: String(form.get("city")),
        seller: String(form.get("seller")),
        phone: String(form.get("phone")),
        email: String(form.get("email")),
        messenger: String(form.get("messenger") || "Не указан"),
        description: String(form.get("description"))
      }, imageFile);

      event.currentTarget.reset();
      setCategory(newListing.category);
      await refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось опубликовать объявление");
    }
  }

  return (
    <main>
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="eyebrow">Доска объявлений в Молдове</span>
          <h1>Найти, продать или сдать рядом с вами</h1>
          <p>Baraholka.md помогает быстро находить вещи, недвижимость, работу и услуги без лишних шагов.</p>
        </div>

        <div className="search-card" aria-label="Поиск объявлений">
          <input
            className="search-main"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Что ищем?"
          />
          <div className="search-filters">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Все категории</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={city} onChange={(event) => setCity(event.target.value)}>
              <option value="all">Вся Молдова</option>
              {cityOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} type="number" min="0" placeholder="Цена от" />
            <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} type="number" min="0" placeholder="Цена до" />
          </div>
          <div className="suggestion-row" aria-label="Популярные запросы">
            {searchSuggestions.map((item) => (
              <button key={item} onClick={() => setQuery(item)}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block marketplace-strip" aria-label="Преимущества Baraholka.md">
        {trustStats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        <p>Покупайте, продавайте, сдавайте и находите услуги рядом с вами.</p>
      </section>

      <section className="section-block popular-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Быстрый старт</span>
            <h2>Популярные категории</h2>
          </div>
          <button onClick={resetFilters}>Сбросить</button>
        </div>
        <div className="popular-grid">
          {popular.map((id) => (
            <Link className={`popular-card ${category === id ? "active" : ""}`} key={id} href={`/categories/${id}`} onClick={() => setCategory(id)}>
              <span>{getCategoryIcon(id)}</span>
              <strong>{getCategoryName(id)}</strong>
              <small>{listings.filter((listing) => listing.category === id).length}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block compact-section">
        <div className="category-chips">
          <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>Все</button>
          {categories.map((item) => (
            <button className={category === item.id ? "active" : ""} key={item.id} onClick={() => setCategory(item.id)}>
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </section>

      {recommendedListings.length > 0 && (
        <section className="section-block">
          <div className="section-title">
            <div>
              <span className="eyebrow">Рекомендации</span>
              <h2>Стоит посмотреть</h2>
            </div>
          </div>
          <div className="listing-grid">
            {recommendedListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </section>
      )}

      <section className="section-block listings-section">
        <div className="section-title listings-title">
          <div>
            <span className="eyebrow">Каталог</span>
            <h2>{category === "all" ? "Свежие объявления" : getCategoryName(category)}</h2>
          </div>
          <div className="list-tools">
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="new">Новые</option>
              <option value="low">Дешевле</option>
              <option value="high">Дороже</option>
            </select>
            <button onClick={clearTests}>Очистить тестовые</button>
            <span>{filteredListings.length}</span>
          </div>
        </div>

        {!ready || filteredListings.length === 0 ? (
          <div className="empty">
            <h3>Ничего не найдено</h3>
            <p>Измените город, цену или категорию.</p>
          </div>
        ) : (
          <div className="listing-grid">{filteredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
        )}
      </section>

      <section className="section-block form-block" id="post-form">
        <div className="section-title">
          <div>
            <span className="eyebrow">Продать быстро</span>
            <h2>Подать объявление</h2>
          </div>
          <span className="status status-moderation">На модерации</span>
        </div>
        <p className="form-hint">После публикации объявление попадет на модерацию. Добавьте понятное название, город, цену и хорошее фото.</p>
        <form className="post-form" onSubmit={handleSubmit}>
          <fieldset className="form-group">
            <legend>1. Что продаете</legend>
            <label>Название<input name="title" required maxLength={80} placeholder="Например, iPhone 13 128 GB" /></label>
            <label>Категория<select name="category" required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Фото<input name="photo" type="file" accept="image/*" /></label>
          </fieldset>
          <fieldset className="form-group">
            <legend>2. Цена и город</legend>
            <div className="form-row">
              <label>Цена, EUR<input name="price" required type="number" min="0" /></label>
              <label>Город<select name="city">{cityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <legend>3. Контакты</legend>
            <div className="form-row">
              <label>Имя продавца<input name="seller" required /></label>
              <label>Телефон<input name="phone" required type="tel" /></label>
            </div>
            <div className="form-row">
              <label>Email<input name="email" required type="email" /></label>
              <label>Telegram / Viber<input name="messenger" /></label>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <legend>4. Описание</legend>
            <label>Описание<textarea name="description" required placeholder="Коротко опишите состояние, детали и условия" /></label>
          </fieldset>
          <button className="primary-btn publish-btn" type="submit">Опубликовать</button>
        </form>
      </section>
    </main>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const [phoneShown, setPhoneShown] = useState(false);
  const statusClass = listing.status === "Активное" ? "status-active" : listing.status === "Отклонено" ? "status-rejected" : "status-moderation";

  return (
    <article className="listing-card">
      <div className="media-wrap">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        <button className="favorite-btn" aria-label="Добавить в избранное">♡</button>
        <span className="category-badge">{getCategoryIcon(listing.category)} {getCategoryName(listing.category)}</span>
      </div>
      <div className="card-body">
        <div className="price-row">
          <strong>{listing.price.toLocaleString("ru-RU")} EUR</strong>
          <span>{listing.condition}</span>
        </div>
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
        <div className="meta-row">
          <span>{listing.city}</span>
          <span>{listing.date}</span>
        </div>
        <span className={`status ${statusClass}`}>{listing.status}</span>
        <div className="card-actions">
          <button onClick={() => setPhoneShown(true)}>{phoneShown ? listing.phone : "Показать телефон"}</button>
          <Link href={`/listings/${listing.id}`}>Подробнее</Link>
        </div>
      </div>
    </article>
  );
}
