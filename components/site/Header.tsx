import Link from "next/link";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { categories } from "@/lib/listings";

const primaryCategories = categories.slice(0, 7);
const moreCategories = categories.slice(7);

function Icon({ name }: { name: "search" | "heart" | "message" | "user" | "plus" | "menu" }) {
  const paths = {
    search: "m21 21-4.4-4.4M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
    heart: "M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1Z",
    message: "M5 5h14v10H8l-4 4V6a1 1 0 0 1 1-1Z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0",
    plus: "M12 5v14M5 12h14",
    menu: "M4 7h16M4 12h16M4 17h16"
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
          <button type="submit" aria-label="Найти"><Icon name="search" /></button>
        </form>

        <nav className="premium-actions" aria-label="Быстрые действия">
          <Link href="/account" className="premium-action"><Icon name="heart" /><span>Избранное</span></Link>
          <Link href="/account" className="premium-action"><Icon name="message" /><span>Сообщения</span></Link>
          <Link href="/login" className="premium-action"><Icon name="user" /><span>Войти</span></Link>
          <Link href="/#post-form" className="premium-post"><Icon name="plus" /><span>Подать объявление</span></Link>
        </nav>
      </div>

      <div className="premium-category-bar">
        <Link className="all-categories" href="/categories/transport"><Icon name="menu" /><span>Все категории</span></Link>
        <nav className="premium-category-nav" aria-label="Категории">
          {primaryCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`}>{category.name}</Link>
          ))}
          <details className="more-categories">
            <summary>Ещё</summary>
            <div>
              {moreCategories.map((category) => (
                <Link key={category.id} href={`/categories/${category.id}`}><CategoryIcon id={category.id} />{category.name}</Link>
              ))}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
