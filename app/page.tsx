'use client';

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  categories,
  clearUserListings,
  fetchListings,
  getCategoryIcon,
  getCategoryName,
  saveListing
} from "@/lib/listings";
import { catalogCategories, cityOptions, searchSuggestions, trustStats } from "@/lib/catalog";
import { DRAFT_KEY, getListingBrand, normalizeSearch, readStringList, saveSearchQuery, SEARCH_HISTORY_KEY } from "@/lib/marketplace";
import type { Listing } from "@/types/listing";

const popular = ["transport", "realty", "phones", "computers", "home", "kids", "pets", "services"];
const regions = ["Центр", "Север", "Юг", "Гагаузия", "Приднестровье"];
const conditions = ["Новое", "Отличное", "Хорошее", "Б/у", "Услуга", "Работа"];

type DraftState = {
  title: string;
  category: string;
  price: string;
  city: string;
  seller: string;
  phone: string;
  email: string;
  messenger: string;
  description: string;
};

const emptyDraft: DraftState = {
  title: "",
  category: "phones",
  price: "",
  city: cityOptions[0],
  seller: "",
  phone: "",
  email: "",
  messenger: "",
  description: ""
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [region, setRegion] = useState("all");
  const [condition, setCondition] = useState("all");
  const [brand, setBrand] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [wizardStep, setWizardStep] = useState(1);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchListings().then(setListings).finally(() => setReady(true));
    setHistory(readStringList(SEARCH_HISTORY_KEY));
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) setDraft({ ...emptyDraft, ...JSON.parse(savedDraft) });
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const selectedCategory = catalogCategories.find((item) => item.id === category);
  const brands = useMemo(() => Array.from(new Set(listings.map(getListingBrand))).sort(), [listings]);
  const autocomplete = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return [];
    return Array.from(new Set([
      ...listings.map((listing) => listing.title),
      ...searchSuggestions,
      ...catalogCategories.flatMap((item) => item.popularQueries)
    ])).filter((item) => normalizeSearch(item).includes(normalizedQuery)).slice(0, 6);
  }, [listings, query]);

  const filteredListings = useMemo(() => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const normalizedQuery = normalizeSearch(query);

    return [...listings]
      .filter((listing) => category === "all" || listing.category === category)
      .filter((listing) => subcategory === "all" || normalizeSearch(`${listing.title} ${listing.description}`).includes(normalizeSearch(subcategory)))
      .filter((listing) => !normalizedQuery || normalizeSearch(`${listing.title} ${listing.description}`).includes(normalizedQuery))
      .filter((listing) => city === "all" || listing.city === city)
      .filter((listing) => region === "all" || true)
      .filter((listing) => condition === "all" || listing.condition === condition)
      .filter((listing) => brand === "all" || getListingBrand(listing) === brand)
      .filter((listing) => !min || listing.price >= min)
      .filter((listing) => !max || listing.price <= max)
      .filter((listing) => !onlyWithPhoto || Boolean(listing.image))
      .filter((listing) => !onlyNew || listing.condition === "Новое")
      .filter((listing) => dateFilter === "all" || listing.date === "Сегодня")
      .sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.id.localeCompare(a.id));
  }, [brand, category, city, condition, dateFilter, listings, maxPrice, minPrice, onlyNew, onlyWithPhoto, query, region, sort, subcategory]);

  const recommendedListings = useMemo(
    () => listings.filter((listing) => listing.status === "Активное").slice(0, 4),
    [listings]
  );

  async function refresh() {
    setListings(await fetchListings());
  }

  function resetFilters() {
    setCategory("all");
    setSubcategory("all");
    setCity("all");
    setRegion("all");
    setCondition("all");
    setBrand("all");
    setDateFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
    setSort("new");
    setOnlyNew(false);
    setOnlyWithPhoto(false);
  }

  function clearTests() {
    clearUserListings();
    resetFilters();
    refresh();
  }

  function applySearch(value = query) {
    setQuery(normalizeSearch(value));
    setHistory(saveSearchQuery(value));
  }

  function updateDraft(field: keyof DraftState, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 8);
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const imageFile = form.get("photo") instanceof File ? (form.get("photo") as File) : null;

    try {
      const newListing = await saveListing({
        title: draft.title,
        category: draft.category,
        price: Number(draft.price),
        city: draft.city,
        seller: draft.seller,
        phone: draft.phone,
        email: draft.email,
        messenger: draft.messenger || "Не указан",
        description: draft.description
      }, imageFile);

      event.currentTarget.reset();
      setDraft(emptyDraft);
      setPhotoPreviews([]);
      setWizardStep(1);
      localStorage.removeItem(DRAFT_KEY);
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
          <div className="search-box">
            <input
              className="search-main"
              value={query}
              onBlur={() => applySearch(query)}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Что ищем?"
            />
            {autocomplete.length > 0 && (
              <div className="autocomplete-panel">
                {autocomplete.map((item) => <button key={item} onMouseDown={() => applySearch(item)}>{item}</button>)}
              </div>
            )}
          </div>
          <div className="search-filters">
            <select value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory("all"); }}>
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
            {[...searchSuggestions, ...history].slice(0, 8).map((item) => (
              <button key={item} onClick={() => applySearch(item)}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block marketplace-strip" aria-label="Преимущества Baraholka.md">
        {trustStats.map((item) => (
          <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
        ))}
        <p>Покупайте, продавайте, сдавайте и находите услуги рядом с вами.</p>
      </section>

      <section className="section-block popular-section">
        <div className="section-title">
          <div><span className="eyebrow">Быстрый старт</span><h2>Популярные категории</h2></div>
          <button onClick={resetFilters}>Сбросить</button>
        </div>
        <div className="popular-grid">
          {popular.map((id) => (
            <Link className={`popular-card ${category === id ? "active" : ""}`} key={id} href={`/categories/${id}`} onClick={() => setCategory(id)}>
              <span>{getCategoryIcon(id)}</span><strong>{getCategoryName(id)}</strong><small>{listings.filter((listing) => listing.category === id).length}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block filter-board">
        <div className="filter-board-head">
          <div><span className="eyebrow">Фильтры</span><h2>Уточните поиск</h2></div>
          <button onClick={resetFilters}>Очистить фильтры</button>
        </div>
        <div className="advanced-filters">
          <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>
            <option value="all">Все подкатегории</option>
            {selectedCategory?.subcategories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="all">Любой регион</option>
            {regions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={condition} onChange={(event) => setCondition(event.target.value)}>
            <option value="all">Любое состояние</option>
            {conditions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="all">Любой бренд</option>
            {brands.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="all">Любая дата</option>
            <option value="today">Сегодня</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="new">Сначала новые</option>
            <option value="low">Сначала дешевле</option>
            <option value="high">Сначала дороже</option>
          </select>
          <label className="toggle-filter"><input type="checkbox" checked={onlyWithPhoto} onChange={(event) => setOnlyWithPhoto(event.target.checked)} /> Только с фото</label>
          <label className="toggle-filter"><input type="checkbox" checked={onlyNew} onChange={(event) => setOnlyNew(event.target.checked)} /> Только новые</label>
        </div>
      </section>

      {recommendedListings.length > 0 && (
        <section className="section-block">
          <div className="section-title"><div><span className="eyebrow">Рекомендации</span><h2>Стоит посмотреть</h2></div></div>
          <div className="listing-grid">{recommendedListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
        </section>
      )}

      <section className="section-block listings-section">
        <div className="section-title listings-title">
          <div><span className="eyebrow">Каталог</span><h2>{category === "all" ? "Свежие объявления" : getCategoryName(category)}</h2></div>
          <div className="list-tools"><button onClick={clearTests}>Очистить тестовые</button><span>{filteredListings.length}</span></div>
        </div>
        {!ready || filteredListings.length === 0 ? (
          <div className="empty"><h3>Ничего не найдено</h3><p>Измените город, цену или категорию.</p></div>
        ) : (
          <div className="listing-grid">{filteredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
        )}
      </section>

      <section className="section-block form-block" id="post-form">
        <div className="section-title">
          <div><span className="eyebrow">Мастер публикации</span><h2>Подать объявление</h2></div>
          <span className="status status-moderation">Черновик автосохраняется</span>
        </div>
        <div className="wizard-progress" aria-label="Прогресс публикации">
          {[1, 2, 3, 4].map((step) => <button className={wizardStep === step ? "active" : ""} key={step} onClick={() => setWizardStep(step)}>Шаг {step}</button>)}
        </div>
        <form className="post-form" onSubmit={handleSubmit}>
          {wizardStep === 1 && (
            <fieldset className="form-group">
              <legend>1. Что продаете</legend>
              <label>Название<input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} required maxLength={80} placeholder="Например, iPhone 13 128 GB" /></label>
              <label>Категория<select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </fieldset>
          )}
          {wizardStep === 2 && (
            <fieldset className="form-group dropzone">
              <legend>2. Фотографии</legend>
              <label>Перетащите фото или выберите файлы<input name="photo" type="file" accept="image/*" multiple onChange={handlePhotoChange} /></label>
              <div className="preview-grid">{photoPreviews.map((src) => <img key={src} src={src} alt="Предпросмотр" />)}</div>
            </fieldset>
          )}
          {wizardStep === 3 && (
            <fieldset className="form-group">
              <legend>3. Цена и контакты</legend>
              <div className="form-row"><label>Цена, EUR<input value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} required type="number" min="0" /></label><label>Город<select value={draft.city} onChange={(event) => updateDraft("city", event.target.value)}>{cityOptions.map((item) => <option key={item}>{item}</option>)}</select></label></div>
              <div className="form-row"><label>Имя продавца<input value={draft.seller} onChange={(event) => updateDraft("seller", event.target.value)} required /></label><label>Телефон<input value={draft.phone} onChange={(event) => updateDraft("phone", event.target.value)} required type="tel" /></label></div>
              <div className="form-row"><label>Email<input value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} required type="email" /></label><label>Telegram / Viber<input value={draft.messenger} onChange={(event) => updateDraft("messenger", event.target.value)} /></label></div>
            </fieldset>
          )}
          {wizardStep === 4 && (
            <fieldset className="form-group">
              <legend>4. Описание и проверка</legend>
              <label>Описание<textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} required placeholder="Коротко опишите состояние, детали и условия" /></label>
              <div className="draft-preview"><strong>{draft.title || "Название объявления"}</strong><span>{draft.price || 0} EUR · {draft.city}</span><p>{draft.description || "Описание появится здесь перед публикацией."}</p></div>
            </fieldset>
          )}
          <div className="wizard-actions">
            <button type="button" disabled={wizardStep === 1} onClick={() => setWizardStep((step) => Math.max(1, step - 1))}>Назад</button>
            {wizardStep < 4 ? <button type="button" onClick={() => setWizardStep((step) => Math.min(4, step + 1))}>Далее</button> : <button className="primary-btn publish-btn" type="submit">Опубликовать</button>}
          </div>
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
        <div className="price-row"><strong>{listing.price.toLocaleString("ru-RU")} EUR</strong><span>{listing.condition}</span></div>
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
        <div className="meta-row"><span>{listing.city}</span><span>{listing.date}</span></div>
        <span className={`status ${statusClass}`}>{listing.status}</span>
        <div className="card-actions"><button onClick={() => setPhoneShown(true)}>{phoneShown ? listing.phone : "Показать телефон"}</button><Link href={`/listings/${listing.id}`}>Подробнее</Link></div>
      </div>
    </article>
  );
}
