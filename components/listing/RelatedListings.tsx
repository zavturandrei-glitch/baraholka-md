import Link from "next/link";
import type { Listing } from "@/types/listing";

type RelatedListingsProps = {
  listings: Listing[];
};

export function RelatedListings({ listings }: RelatedListingsProps) {
  return (
    <section className="market-section related-flagship">
      <div className="market-section-head">
        <h2>Похожие объявления</h2>
        <span>{listings.length} вариантов</span>
      </div>
      <div className="market-card-grid latest">
        {listings.map((listing) => (
          <article className="market-card" key={listing.id}>
            <Link href={`/listings/${listing.id}`} className="market-card-media">
              <img src={listing.image} alt={listing.title} loading="lazy" />
            </Link>
            <div className="market-card-body">
              <strong>{listing.price.toLocaleString("ru-RU")} EUR</strong>
              <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
              <p>{listing.city} · {listing.date}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
