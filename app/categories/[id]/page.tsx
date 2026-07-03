'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cityOptions, getCatalogCategory } from "@/lib/catalog";
import { fetchListings, getCategoryIcon, getCategoryName } from "@/lib/listings";
import type { Listing } from "@/types/listing";

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [condition, setCondition] = useState("all");
  const category = getCatalogCategory(params.id);

  useEffect(() => {
    fetchListings().then(setListings);
  }, []);

  const categoryListings = useMemo(() => {
    return listings
      .filter((listing) => listing.category === params.id)
      .filter((listing) => !query || `${listing.title} ${listing.description}`.toLowerCase().includes(query.toLowerCase()))
      .filter((listing) => city === "all" || listing.city === city)
      .filter((listing) => condition === "all" || listing.condition === condition);
  }, [city, condition, listings, params.id, query]);

  if (!category) {
    return (
      <main className="page-narrow">
        <div className="empty">
          <h1>Категория не найдена</h1>
          <p>Вернитесь на главную и выберите раздел из каталога.</p>
          <Link className="primary-btn" href="/">На главную</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-narrow">
      <Link className="back-link" href="/">← На главную</Link>

      <section className="category-hero">
        <div>
          <span className="eyebrow">Категория</span>
          <h1>{category.icon} {category.name}</h1>
          <p>{category.description}</p>
        </div>
        <div className="category-hero-meta">
          <strong>{categoryListings.length}</strong>
          <span>объявлений найдено</span>
        </div>
      </section>

      <section className="category-layout">
        <aside className="filter-panel">
          <h2>Фильтры</h2>
          <label>Поиск<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Искать в ${category.name.toLowerCase()}`} /></label>
          <label>Город<select value={city} onChange={(event) => setCity(event.target.value)}><option value="all">Вся Молдова</option>{cityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Состояние<select value={condition} onChange={(event) => setCondition(event.target.value)}><option value="all">Любое</option><option>Новое</option><option>Отличное</option><option>Хорошее</option><option>Б/у</option><option>Услуга</option><option>Работа</option></select></label>

          <div className="filter-list">
            <strong>Что можно уточнить дальше</strong>
            {category.filters.map((item) => <span key={item}>{item}</span>)}
          </div>
        </aside>

        <div className="category-content">
          <div className="subcategory-grid">
            {category.subcategories.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}
          </div>

          {categoryListings.length === 0 ? (
            <div className="empty">
              <h2>Пока ничего не найдено</h2>
              <p>Попробуйте другой город, состояние или запрос.</p>
            </div>
          ) : (
            <div className="admin-list">
              {categoryListings.map((listing) => (
                <Link className="category-row" key={listing.id} href={`/listings/${listing.id}`}>
                  <img src={listing.image} alt={listing.title} />
                  <div>
                    <h2>{listing.title}</h2>
                    <p>{getCategoryIcon(listing.category)} {getCategoryName(listing.category)} · {listing.city} · {listing.date}</p>
                    <span>{listing.description}</span>
                  </div>
                  <strong>{listing.price.toLocaleString("ru-RU")} EUR</strong>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
