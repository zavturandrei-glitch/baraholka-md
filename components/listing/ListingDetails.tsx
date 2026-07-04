type ListingDetailsProps = {
  description: string;
};

export function ListingDetails({ description }: ListingDetailsProps) {
  return (
    <section className="flagship-panel listing-description">
      <h2>Описание</h2>
      <p>{description}</p>
    </section>
  );
}
