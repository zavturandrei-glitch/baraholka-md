import type { Metadata, Viewport } from "next";
import { Header } from "@/components/site/Header";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://baraholka-md.vercel.app"),
  applicationName: "Baraholka.md",
  title: {
    default: "Baraholka.md - доска объявлений в Молдове",
    template: "%s | Baraholka.md"
  },
  description: "Покупайте, продавайте, сдавайте и находите услуги рядом с вами на современной доске объявлений Baraholka.md.",
  keywords: ["Baraholka.md", "объявления Молдова", "доска объявлений", "Кишинев", "купить", "продать"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Baraholka.md",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  },
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

export const viewport: Viewport = {
  themeColor: "#111318",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        {children}
        <MobileTabBar />
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
