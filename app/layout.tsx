import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baraholka.md - объявления в Молдове",
  description: "Простая локальная доска объявлений Baraholka.md"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="topbar">
          <a className="brand" href="/">
            <span>B</span>
            Baraholka.md
          </a>
          <nav className="top-actions" aria-label="Навигация">
            <a href="/">Объявления</a>
            <a href="/admin">Админка</a>
            <button type="button">Войти</button>
          </nav>
        </header>
        {children}
        <footer>
          <div>
            <strong>Baraholka.md</strong>
            <p>Простая доска объявлений для покупки, продажи и услуг по Молдове.</p>
          </div>
          <div><a href="/">О проекте</a><a href="/admin">Модерация</a><a href="/">Правила</a></div>
          <div><a href="/">Помощь</a><a href="/">Контакты</a><a href="/">Для бизнеса</a></div>
        </footer>
      </body>
    </html>
  );
}
