'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/listing/Breadcrumbs";
import { Features } from "@/components/listing/Features";
import { Gallery } from "@/components/listing/Gallery";
import { ListingDetails } from "@/components/listing/ListingDetails";
import { LocationMap } from "@/components/listing/LocationMap";
import { PriceCard } from "@/components/listing/PriceCard";
import { RelatedListings } from "@/components/listing/RelatedListings";
import { SafetyTips } from "@/components/listing/SafetyTips";
import { SellerCard } from "@/components/listing/SellerCard";
import { StickyMobileActions } from "@/components/listing/StickyMobileActions";
import { fetchListings, getCategoryName } from "@/lib/listings";
import { getListingBrand, getListingImages, getListingViews, readStringList, toggleFavorite, FAVORITES_KEY } from "@/lib/marketplace";
import { createLocalReport, reportReasons } from "@/lib/moderation";
import type { Listing } from "@/types/listing";

export default function ListingPage({ params }: { params: { id: string } }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [phoneShown, setPhoneShown] = useState(false);
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
    () => listing ? listings.filter((item) => item.category === listing.category && item.id !== listing.id).slice(0, 8) : [],
    [listing, listings]
  );

  if (!listing) {
    return (
      <main className="listing-shell">
        <div className="empty">
          <h1>Объявление не найдено</h1>
          <p>Оно могло быть удалено или очищено из тестовых данных.</p>
          <Link className="primary-btn" href="/">Назад</Link>
        </div>
      </main>
    );
  }

  const currentListing = listing;
  const categoryName = getCategoryName(currentListing.category);
  const isFavorite = favoriteIds.includes(currentListing.id);
  const images = getListingImages(currentListing);
  const features: [string, string][] = [
    ["Категория", categoryName],
    ["Состояние", currentListing.condition],
    ["Бренд", getListingBrand(currentListing)],
    ["Город", currentListing.city],
    ["Дата публикации", currentListing.date],
    ["Обновлено", currentListing.date],
    ["ID объявления", currentListing.id.slice(0, 8)],
    ["Просмотры", String(views)]
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: currentListing.title,
    description: currentListing.description,
    image: images,
    category: categoryName,
    offers: {
      "@type": "Offer",
      price: currentListing.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      areaServed: currentListing.city
    }
  };

  function handleFavorite() {
    setFavoriteIds(toggleFavorite(currentListing.id));
    setNotice(isFavorite ? "Убрано из избранного." : "Добавлено в избранное.");
  }

  async function handleShare() {
    const shareData = { title: currentListing.title, text: `${currentListing.title} - ${currentListing.price} EUR`, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Ссылка скопирована.");
    }
  }

  function submitReport() {
    createLocalReport(currentListing, reportReason, reportDetails);
    setReportOpen(false);
    setReportDetails("");
    setNotice("Жалоба отправлена модераторам.");
  }

  return (
    <main className="listing-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs categoryName={categoryName} title={currentListing.title} />
      {notice && <p className="admin-notice">{notice}</p>}

      <article className="flagship-listing">
        <Gallery images={images} title={currentListing.title} />
        <div className="flagship-side">
          <PriceCard
            price={currentListing.price}
            title={currentListing.title}
            city={currentListing.city}
            date={currentListing.date}
            views={views}
            id={currentListing.id}
            condition={currentListing.condition}
            categoryName={categoryName}
            isFavorite={isFavorite}
            onFavorite={handleFavorite}
            onShare={handleShare}
          />
          <SellerCard
            seller={currentListing.seller}
            city={currentListing.city}
            email={currentListing.email}
            messenger={currentListing.messenger}
            phone={currentListing.phone}
            phoneShown={phoneShown}
            onShowPhone={() => setPhoneShown(true)}
          />
          <button className="report-link" onClick={() => setReportOpen(true)}>Пожаловаться на объявление</button>
        </div>
      </article>

      <section className="listing-content-grid">
        <ListingDetails description={currentListing.description} />
        <Features features={features} />
        <LocationMap city={currentListing.city} />
        <SafetyTips />
      </section>

      <RelatedListings listings={related} />
      <StickyMobileActions phone={currentListing.phone} phoneShown={phoneShown} onShowPhone={() => setPhoneShown(true)} email={currentListing.email} />

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
