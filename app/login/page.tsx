'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase пока не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const result = mode === "register"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setMessage(result.error.message);
    else setMessage(mode === "register" ? "Проверьте email для подтверждения регистрации." : "Вы вошли. Можно открыть личный кабинет.");
  }

  async function signInWithProvider(provider: "google" | "github") {
    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase пока не настроен. OAuth станет доступен после добавления ключей проекта.");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/account` } });
  }

  return (
    <main className="page-narrow">
      <section className="login-card auth-card">
        <span className="eyebrow">Аккаунт</span>
        <h1>{mode === "login" ? "Войти" : "Регистрация"}</h1>
        <p className="login-text">Email-вход уже подготовлен через Supabase. Google и GitHub заработают после включения провайдеров в Supabase.</p>
        <form className="auth-form" onSubmit={handleEmail}>
          <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
          <label>Пароль<input name="password" type="password" required minLength={6} placeholder="Минимум 6 символов" /></label>
          <button className="primary-btn" type="submit">{mode === "login" ? "Войти" : "Создать аккаунт"}</button>
        </form>
        <div className="auth-actions"><button onClick={() => signInWithProvider("google")}>Google</button><button onClick={() => signInWithProvider("github")}>GitHub</button></div>
        <button className="text-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Создать аккаунт" : "Уже есть аккаунт"}</button>
        {message && <p className="auth-message">{message}</p>}
        <Link className="back-link" href="/">Вернуться на главную</Link>
      </section>
    </main>
  );
}