type LocationMapProps = {
  city: string;
};

export function LocationMap({ city }: LocationMapProps) {
  return (
    <section className="flagship-panel location-panel">
      <h2>Локация</h2>
      <div className="fake-map" aria-label={`Локация: ${city}`}>
        <span>{city}</span>
      </div>
      <p>Точный адрес не показывается. Уточняйте место встречи у продавца.</p>
    </section>
  );
}
