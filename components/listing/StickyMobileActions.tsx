'use client';

type StickyMobileActionsProps = {
  phone: string;
  phoneShown: boolean;
  onShowPhone: () => void;
  email: string;
};

export function StickyMobileActions({ phone, phoneShown, onShowPhone, email }: StickyMobileActionsProps) {
  return (
    <div className="sticky-mobile-actions">
      <a href={`mailto:${email}`}>Написать</a>
      <a href={phoneShown ? `tel:${phone}` : undefined} onClick={onShowPhone}>{phoneShown ? "Позвонить" : "Телефон"}</a>
    </div>
  );
}
