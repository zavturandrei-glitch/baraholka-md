import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baraholka.md - современная доска объявлений в Молдове",
  description: "Покупайте, продавайте, сдавайте и находите услуги рядом с вами."
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
            <a className="nav-link optional-link" href="/admin">Админка</a>
            <a className="nav-link" href="/login">Войти</a>
            <a className="nav-link optional-link" href="/account">Мои объявления</a>
            <a className="nav-link optional-link" href="/account">Избранное</a>
            <a className="post-link" href="/#post-form">Подать объявление</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}