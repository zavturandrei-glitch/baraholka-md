"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

function getFriendlyAuthError(mode: AuthMode) {
  return mode === "login"
    ? "Не удалось войти. Проверьте email и пароль."
    : "Не удалось создать аккаунт. Попробуйте еще раз.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!isLogin && !name) {
      setMessageType("error");
      setMessage("Введите имя");
      return;
    }

    if (!email) {
      setMessageType("error");
      setMessage("Введите email");
      return;
    }

    if (!password) {
      setMessageType("error");
      setMessage("Введите пароль");
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Пароль должен быть не короче 6 символов");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessageType("info");
      setMessage("Регистрация скоро будет доступна. Пока вы можете просматривать объявления без аккаунта.");
      return;
    }

    setIsLoading(true);

    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          });

      if (result.error) {
        setMessageType("error");
        setMessage(getFriendlyAuthError(mode));
        return;
      }

      setMessageType("success");
      setMessage(isLogin ? "Вы вошли. Открываем личный кабинет..." : "Аккаунт создан. Проверьте email, если потребуется подтверждение.");

      if (isLogin) {
        router.push("/account");
      }
    } catch {
      setMessageType("error");
      setMessage(getFriendlyAuthError(mode));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="auth-title">
        <div className="auth-brand-panel" aria-hidden="true">
          <span className="auth-logo-mark">B</span>
          <p>Покупайте, продавайте и сохраняйте нужное рядом с вами.</p>
        </div>

        <div className="auth-card-pro">
          <div className="auth-card-head">
            <span className="auth-kicker">Baraholka.md</span>
            <h1 id="auth-title">{isLogin ? "Войти" : "Создать аккаунт"}</h1>
            <p>
              {isLogin
                ? "Добро пожаловать обратно"
                : "Размещайте объявления, сохраняйте избранное и общайтесь с продавцами."}
            </p>
          </div>

          <form className="auth-form-pro" onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <label>
                <span>Имя</span>
                <input name="name" autoComplete="name" placeholder="Ваше имя" disabled={isLoading} />
              </label>
            )}

            <label>
              <span>Email</span>
              <input name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" disabled={isLoading} />
            </label>

            <label>
              <span>Пароль</span>
              <input name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} placeholder="Минимум 6 символов" disabled={isLoading} />
            </label>

            {isLogin && (
              <button
                className="auth-forgot"
                type="button"
                onClick={() => {
                  setMessageType("info");
                  setMessage("Восстановление пароля скоро будет доступно.");
                }}
              >
                Забыли пароль?
              </button>
            )}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Подождите..." : isLogin ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          {message && <p className={`auth-feedback auth-feedback-${messageType}`}>{message}</p>}

          <div className="auth-switch">
            {isLogin ? (
              <p>Нет аккаунта? <Link href="/register">Создать аккаунт</Link></p>
            ) : (
              <p>Уже есть аккаунт? <Link href="/login">Войти</Link></p>
            )}
          </div>

          <Link className="auth-home-link" href="/">Вернуться на главную</Link>
        </div>
      </section>
    </main>
  );
}
