import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="page-narrow">
      <section className="login-card">
        <p>Аккаунт</p>
        <h1>Вход скоро будет доступен</h1>
        <p className="login-text">Вход в аккаунт скоро будет доступен. Сейчас это MVP-версия Baraholka.md.</p>
        <Link className="post-btn" href="/">Вернуться на главную</Link>
      </section>
    </main>
  );
}