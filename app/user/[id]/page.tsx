import Link from "next/link";

export default function UserPage({ params }: { params: { id: string } }) {
  return (
    <main className="page-narrow">
      <section className="login-card">
        <span className="eyebrow">Пользователь</span>
        <h1>Профиль продавца</h1>
        <p className="login-text">Публичная страница пользователя подготовлена для Supabase-профилей. ID: {params.id}</p>
        <Link className="primary-btn" href="/">К объявлениям</Link>
      </section>
    </main>
  );
}