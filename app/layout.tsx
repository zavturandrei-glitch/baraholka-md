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
    description: "Простая и современная барахолка для людей и небольшого бизнеса в Молдове.",
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
        <header className="topbar">
          <a className="brand" href="/" aria-label="Baraholka.md">
            <span>B</span>
            <strong>Baraholka.md</strong>
          </a>
          <nav className="top-actions" aria-label="Навигация">
            <a className="nav-link optional-link" href="/categories/transport">Категории</a>
            <a className="nav-link optional-link" href="/admin">Админка</a>
            <a className="nav-link" href="/login">Войти</a>
            <a className="nav-link optional-link" href="/account">Мои объявления</a>
            <a className="nav-link optional-link" href="/account">Избранное</a>
            <a className="post-link" href="/#post-form">Подать объявление</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <strong>Baraholka.md</strong>
            <p>Современная доска объявлений для Молдовы: вещи, услуги, работа, недвижимость и транспорт.</p>
          </div>
          <nav aria-label="Нижняя навигация">
            <a href="/">Главная</a>
            <a href="/account">Кабинет</a>
            <a href="/login">Войти</a>
            <a href="/admin">Админка MVP</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
