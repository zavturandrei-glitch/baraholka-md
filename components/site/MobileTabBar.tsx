import Link from "next/link";

function TabIcon({ name }: { name: "home" | "heart" | "plus" | "message" | "user" }) {
  const paths = {
    home: "M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.4Z",
    heart: "M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1Z",
    plus: "M12 5v14M5 12h14",
    message: "M5 5h14v10H8l-4 4V6a1 1 0 0 1 1-1Z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0"
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MobileTabBar() {
  return (
    <nav className="mobile-tabbar" aria-label="Быстрая мобильная навигация">
      <Link href="/"><TabIcon name="home" /><span>Главная</span></Link>
      <Link href="/account"><TabIcon name="heart" /><span>Избранное</span></Link>
      <Link className="mobile-tabbar-post" href="/#post-form"><TabIcon name="plus" /><span>Подать</span></Link>
      <Link href="/account"><TabIcon name="message" /><span>Чаты</span></Link>
      <Link href="/login"><TabIcon name="user" /><span>Войти</span></Link>
    </nav>
  );
}
