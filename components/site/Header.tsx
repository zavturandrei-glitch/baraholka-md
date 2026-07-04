import Link from "next/link";
import { categories } from "@/lib/listings";

const primaryCategories = categories.slice(0, 7);
const moreCategories = categories.slice(7);

export function Header() {
  return (
    <header className="premium-header">
      <div className="premium-header-main">
        <Link className="premium-brand" href="/" aria-label="Baraholka.md">
          <span className="brand-mark" aria-hidden="true"><b>B</b></span>
          <span className="brand-copy">
            <strong>Baraholka<span>.md</span></strong>
            <small>Покупай. Продавай. Легко.</small>
          </span>
        </Link>

        <form className="premium-search" action="/" role="search">
          <label className="sr-only" htmlFor="premium-search-input">Поиск объявлений</label>
          <input id="premium-search-input" name="q" placeholder="Что вы хотите найти?" />
          <button type="submit" aria-label="Найти">⌕</button>
        </form>

        <nav className="premium-actions" aria-label="Быстрые действия">
          <Link href="/account" className="premium-action"><span>♡</span>Избранное</Link>
          <Link href="/account" className="premium-action"><span>◌</span>Сообщения</Link>
          <Link href="/login" className="premium-action"><span>♙</span>Войти</Link>
          <Link href="/#post-form" className="premium-post"><span>＋</span>Подать объявление</Link>
        </nav>
      </div>

      <div className="premium-category-bar">
        <Link className="all-categories" href="/categories/transport"><span>☰</span>Все категории</Link>
        <nav className="premium-category-nav" aria-label="Категории">
          {primaryCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`}>{category.name}</Link>
          ))}
          <details className="more-categories">
            <summary>Ещё</summary>
            <div>
              {moreCategories.map((category) => (
                <Link key={category.id} href={`/categories/${category.id}`}>{category.icon} {category.name}</Link>
              ))}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
