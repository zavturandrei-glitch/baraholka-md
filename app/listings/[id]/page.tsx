'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchListings, getCategoryIcon, getCategoryName } from "@/lib/listings";
import { getListingBrand, getListingImages, getListingViews, readStringList, toggleFavorite, FAVORITES_KEY } from "@/lib/marketplace";
import { createLocalReport, getQualitySignals, reportReasons } from "@/lib/moderation";
import type { Listing } from "@/types/listing";

export default function ListingPage({ params }: { params: { id: string } }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [phoneShown, setPhoneShown] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [views, setViews] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchListings().then(setListings);
    setFavoriteIds(readStringList(FAVORITES_KEY));
    setViews(getListingViews(params.id));
  }, [params.id]);

  const listing = listings.find((item) => item.id === params.id);
  const related = useMemo(
    () => listing ? listings.filter((item) => item.category === listing.category && item.id !== listing.id).slice(0, 4) : [],
    [listing, listings]
  );

  if (!listing) {
    return (
      <main className="page-narrow">
        <div className="empty">
          <h1>Объявление не найдено</h1>
          <p>Оно могло быть удалено или очищено из тестовых данных.</p>
          <Link className="primary-btn" href="/">Назад</Link>
        </div>
      </main>
    );
  }

  const currentListing = listing;
  const images = getListingImages(currentListing);
  const quality = getQualitySignals(currentListing);
  const statusClass = currentListing.status === "Активное" ? "status-active" : currentListing.status === "Отклонено" ? "status-rejected" : "status-moderation";
  const isFavorite = favoriteIds.includes(currentListing.id);
  const characteristics = [
    ["Категория", getCategoryName(currentListing.category)],
    ["Состояние", currentListing.condition],
    ["Бренд", getListingBrand(currentListing)],
    ["Город", currentListing.city],
    ["Дата публикации", currentListing.date],
    ["Обновлено", currentListing.date],
    ["Статус", currentListing.status],
    ["Просмотры", String(views)]
  ];

  function handleFavorite() {
    setFavoriteIds(toggleFavorite(currentListing.id));
    setNotice(isFavorite ? "Убрано из избранного." : "Добавлено в избранное.");
  }

  async function handleShare() {
    const shareData = { title: currentListing.title, text: `${currentListing.title} - ${currentListing.price} EUR`, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Ссылка скопирована.");
    }
  }

  function submitReport() {
    createLocalReport(currentListing, reportReason, reportDetails);
    setReportOpen(false);
    setReportDetails("");
    setNotice("Жалоба отправлена модераторам. Спасибо, что помогаете делать площадку безопаснее.");
  }

  return (
    <main className="page-narrow">
      <Link className="back-link" href="/">← Назад к объявлениям</Link>
      {notice && <p className="admin-notice">{notice}</p>}

      <article className="product-page product-page-pro">
        <section className="gallery-card product-gallery">
          <button className="gallery-main" onClick={() => setLightboxOpen(true)} aria-label="Открыть фото на весь экран">
            <img src={images[selectedImage]} alt={currentListing.title} />
          </button>
          <div className="gallery-strip">
            {images.map((image, index) => (
              <button className={selectedImage === index ? "active" : ""} key={`${image}-${index}`} onClick={() => setSelectedImage(index)}>
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </section>

        <aside className="product-side contact-panel">
          <div className="trust-badge">Проверено модератором</div>
          <span className="category-badge">{getCategoryIcon(currentListing.category)} {getCategoryName(currentListing.category)}</span>
          <h1>{currentListing.title}</h1>
          <div className="product-price">{currentListing.price.toLocaleString("ru-RU")} EUR</div>
          <div className="product-actions">
            <button onClick={handleFavorite}>{isFavorite ? "В избранном" : "Добавить в избранное"}</button>
            <button onClick={handleShare}>Поделиться</button>
            <button onClick={() => setReportOpen(true)}>Пожаловаться</button>
          </div>
          <div className="seller-card seller-card-pro">
            <span>Продавец</span>
            <strong>{currentListing.seller}</strong>
            <p>{currentListing.city} · опубликовано {currentListing.date} · {views} просмотров</p>
            <button className="primary-btn" onClick={() => setPhoneShown(true)}>{phoneShown ? currentListing.phone : "Показать телефон"}</button>
            <a className="contact-link" href={`mailto:${currentListing.email}`}>Написать на email</a>
            <span className="messenger-line">{currentListing.messenger}</span>
          </div>
        </aside>

        <section className="description-card">
          <h2>Описание</h2>
          <p>{currentListing.description}</p>
        </section>

        <section className="description-card specs-card">
          <h2>Характеристики</h2>
          <div className="spec-grid">
            {characteristics.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong className={label === "Статус" ? `status ${statusClass}` : ""}>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="description-card safety-card">
          <h2>Безопасная сделка</h2>
          <div className="safety-grid">
            <div><strong>Качество объявления: {quality.score}%</strong><p>Проверяем фото, цену, контакты и полноту описания.</p></div>
            <div><strong>Не переводите предоплату</strong><p>Встречайтесь в безопасном месте и проверяйте товар до оплаты.</p></div>
            <div><strong>Сообщайте о подозрениях</strong><p>Жалобы попадают в админку и помогают быстрее убирать рискованные объявления.</p></div>
          </div>
        </section>
      </article>

      <section className="section-block">
        <div className="section-title"><div><span className="eyebrow">Похожие</span><h2>Еще в этой категории</h2></div></div>
        <div className="related-grid">
          {related.map((item) => (
            <Link className="related-card" href={`/listings/${item.id}`} key={item.id}>
              <img src={item.image} alt={item.title} />
              <strong>{item.title}</strong>
              <span>{item.price.toLocaleString("ru-RU")} EUR</span>
            </Link>
          ))}
        </div>
      </section>

      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>Закрыть</button>
          <img src={images[selectedImage]} alt={currentListing.title} />
          <div className="lightbox-thumbs">
            {images.map((image, index) => (
              <button className={selectedImage === index ? "active" : ""} key={`${image}-lightbox-${index}`} onClick={() => setSelectedImage(index)}>
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal-card narrow">
            <button className="modal-close" onClick={() => setReportOpen(false)}>Закрыть</button>
            <h2>Пожаловаться на объявление</h2>
            <p>{currentListing.title}</p>
            <label>Причина<select value={reportReason} onChange={(event) => setReportReason(event.target.value)}>{reportReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></label>
            <label>Комментарий<textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Опишите, что не так" /></label>
            <button className="primary-btn" onClick={submitReport}>Отправить жалобу</button>
          </div>
        </div>
      )}
    </main>
  );
}
