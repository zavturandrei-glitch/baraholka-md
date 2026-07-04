type Feature = [string, string];

type FeaturesProps = {
  features: Feature[];
};

export function Features({ features }: FeaturesProps) {
  return (
    <section className="flagship-panel">
      <h2>Характеристики</h2>
      <div className="flagship-features">
        {features.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
