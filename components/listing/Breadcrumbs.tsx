import Link from "next/link";

type BreadcrumbsProps = {
  categoryName: string;
  subcategoryName?: string;
  title: string;
};

export function Breadcrumbs({ categoryName, subcategoryName = "Объявление", title }: BreadcrumbsProps) {
  return (
    <nav className="listing-breadcrumbs" aria-label="Хлебные крошки">
      <Link href="/">Главная</Link>
      <span>/</span>
      <Link href="/categories/transport">{categoryName}</Link>
      <span>/</span>
      <span>{subcategoryName}</span>
      <span>/</span>
      <strong>{title}</strong>
    </nav>
  );
}
