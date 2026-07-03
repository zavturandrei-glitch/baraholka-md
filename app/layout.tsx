import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://baraholka-md.vercel.app"),
  title: {
    default: "Baraholka.md - доска объявлений в Молдове",
    template: "%s | Baraholka.md"
  },
  description: "Покупайте, продавайте, сдавайте и находите услуги рядом с вами на современной доске объявлений Baraholka.md.",
  keywords: ["Baraholka.md", "объявления Молдова", "доска объявлений", "Кишинев", "купить", "продать"],
  openGraph: {
    title: "Baraholka.md - доска объявлений в Молдове",
    description: "Современный marketplace объявлений для людей и бизнеса в Молдове.",
    url: "https://baraholka-md.vercel.app",
    siteName: "Baraholka.md",
    locale: "ru_MD",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="topbar marketplace-header">
          <a className="brand" href="/" aria-label="Baraholka.md">
            <span>B</span>
            <strong>Baraholka.md</strong>
          </a>
          <form className="header-search" action="/">
            <label className="sr-only" htmlFor="header-search-input">Поиск объявлений</label>
            <input id="header-search-input" name="q" placeholder="Что вы хотите найти?" />
            <button type="submit" aria-label="Найти">⌕</button>
          </form>
          <nav className="top-actions" aria-label="Навигация">
            <a className="nav-link optional-link" href="/account">Избранное</a>
            <a className="nav-link optional-link" href="/account">Сообщения</a>
            <a className="nav-link" href="/login">Войти</a>
            <a className="post-link" href="/#post-form">Подать объявление</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer marketplace-footer">
          <div>
            <strong>Baraholka.md</strong>
            <p>Маркетплейс объявлений для Молдовы: транспорт, недвижимость, работа, услуги и вещи рядом с вами.</p>
          </div>
          <nav aria-label="Нижняя навигация">
            <a href="/">Главная</a>
            <a href="/categories/transport">Категории</a>
            <a href="/account">Кабинет</a>
            <a href="/admin">Админка</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
