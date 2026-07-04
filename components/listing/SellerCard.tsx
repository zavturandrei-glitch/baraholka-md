'use client';

type SellerCardProps = {
  seller: string;
  city: string;
  email: string;
  messenger: string;
  phone: string;
  phoneShown: boolean;
  onShowPhone: () => void;
};

export function SellerCard({ seller, city, email, messenger, phone, phoneShown, onShowPhone }: SellerCardProps) {
  return (
    <aside className="seller-profile-card">
      <div className="seller-profile-head">
        <div className="seller-avatar">{seller.slice(0, 1).toUpperCase()}</div>
        <div>
          <span>Продавец</span>
          <strong>{seller}</strong>
          <p>Проверенный продавец · ★ 4.8</p>
        </div>
      </div>
      <div className="seller-facts">
        <div><span>Город</span><strong>{city}</strong></div>
        <div><span>На сайте</span><strong>с 2026</strong></div>
        <div><span>Объявлений</span><strong>8</strong></div>
        <div><span>Последний вход</span><strong>сегодня</strong></div>
      </div>
      <a className="seller-primary" href={`mailto:${email}`}>Написать продавцу</a>
      <a className="seller-secondary" href={phoneShown ? `tel:${phone}` : undefined} onClick={onShowPhone}>{phoneShown ? `Позвонить ${phone}` : "Показать телефон"}</a>
      <span className="seller-messenger">{messenger}</span>
    </aside>
  );
}
