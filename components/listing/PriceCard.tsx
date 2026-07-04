'use client';

type PriceCardProps = {
  price: number;
  title: string;
  city: string;
  date: string;
  views: number;
  id: string;
  condition: string;
  categoryName: string;
  isFavorite: boolean;
  onFavorite: () => void;
  onShare: () => void;
};

export function PriceCard({ price, title, city, date, views, id, condition, categoryName, isFavorite, onFavorite, onShare }: PriceCardProps) {
  return (
    <section className="price-card">
      <div className="price-card-top">
        <strong>{price.toLocaleString("ru-RU")} EUR</strong>
        <button className={isFavorite ? "favorite-action active" : "favorite-action"} onClick={onFavorite} aria-label="Добавить в избранное">♡</button>
      </div>
      <h1>{title}</h1>
      <div className="listing-meta-line">
        <span>{city}</span>
        <span>{date}</span>
        <span>{views} просмотров</span>
        <span>ID {id.slice(0, 8)}</span>
      </div>
      <div className="listing-pills">
        <span>{condition}</span>
        <span>{categoryName}</span>
      </div>
      <button className="share-button" onClick={onShare}>Поделиться</button>
    </section>
  );
}
