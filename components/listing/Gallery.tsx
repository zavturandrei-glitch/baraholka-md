'use client';

import { KeyboardEvent, useEffect, useState } from "react";

type GalleryProps = {
  images: string[];
  title: string;
};

export function Gallery({ images, title }: GalleryProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const safeImages = images.length ? images : [""];

  function move(direction: 1 | -1) {
    setActive((index) => (index + direction + safeImages.length) % safeImages.length);
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "Escape") setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, safeImages.length]);

  return (
    <section className="flagship-gallery" aria-label="Фотографии объявления">
      <button className="flagship-gallery-main" onClick={() => setOpen(true)} aria-label="Открыть галерею на весь экран">
        <img src={safeImages[active]} alt={title} loading="eager" />
      </button>
      <div className="flagship-thumbs" aria-label="Миниатюры фото">
        {safeImages.map((image, index) => (
          <button className={index === active ? "active" : ""} key={`${image}-${index}`} onClick={() => setActive(index)} aria-label={`Фото ${index + 1}`}>
            <img src={image} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {open && (
        <div className="flagship-lightbox" role="dialog" aria-modal="true" onKeyDown={handleKey} tabIndex={-1}>
          <button className="lightbox-close" onClick={() => setOpen(false)}>Закрыть</button>
          <button className="lightbox-arrow prev" onClick={() => move(-1)} aria-label="Предыдущее фото">‹</button>
          <img src={safeImages[active]} alt={title} />
          <button className="lightbox-arrow next" onClick={() => move(1)} aria-label="Следующее фото">›</button>
          <div className="lightbox-counter">{active + 1} / {safeImages.length}</div>
        </div>
      )}
    </section>
  );
}
