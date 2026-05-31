"use client";

import { useState } from "react";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Sparkles,
  Sun,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const {
    signInWithGoogle,
    signInAnonymously,
    signInWithEmail,
    registerWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError("Введите имя");
          return;
        }
        await registerWithEmail(email, password, name.trim());
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка авторизации";
      setError(translateError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка Google входа";
      setError(translateError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError("");
    setLoading(true);
    try {
      await signInAnonymously();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка входа";
      setError(translateError(message));
    } finally {
      setLoading(false);
    }
  };

  const authInput =
    "sf-input w-full py-3 pl-10 pr-4 text-sm";

  return (
    <div className="sf-page flex min-h-dvh items-center justify-center px-4 py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-10 lg:max-w-5xl lg:flex-row lg:overflow-hidden lg:rounded-2xl lg:border lg:border-sand/80 lg:bg-surface lg:p-0 lg:shadow-[0_8px_40px_rgb(92_86_80/6%)]">
        <div className="mb-8 text-center lg:mb-0 lg:flex lg:w-[42%] lg:flex-col lg:justify-center lg:bg-gradient-to-br lg:from-orange-400 lg:to-orange-500 lg:px-10 lg:py-14 lg:text-left">
          <div className="sf-avatar mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl lg:mx-0 lg:h-20 lg:w-20 lg:bg-white/20 lg:shadow-none lg:[background-image:none]">
            <Sun size={32} strokeWidth={1.75} className="lg:h-10 lg:w-10" />
          </div>
          <h1 className="text-2xl font-semibold text-ink lg:text-3xl lg:text-white">
            SummerFlow
          </h1>
          <p className="mt-1 text-sm text-ink-light lg:mt-3 lg:text-base lg:text-orange-50">
            Лето без скуки — ивенты, челленджи и сборы
          </p>
          <p className="mt-6 hidden text-sm leading-relaxed text-orange-100 lg:block">
            Ивенты в Кыргызстане, летние челленджи и сборы компании — в одном
            приложении для телефона и ноутбука.
          </p>
        </div>

        <div className="sf-card rounded-2xl p-6 lg:flex-1 lg:rounded-none lg:border-0 lg:shadow-none lg:p-10">
        <div className="mb-5 flex rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              mode === "login"
                ? "bg-surface text-peach-deep shadow-sm"
                : "text-ink-light"
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              mode === "register"
                ? "bg-surface text-peach-deep shadow-sm"
                : "text-ink-light"
            }`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className={authInput}
              />
            </div>
          )}
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={authInput}
            />
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль (мин. 6 символов)"
              required
              minLength={6}
              className={authInput}
            />
          </div>

          {error && (
            <p className="sf-error px-3 py-2 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sf-btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                {mode === "login" ? "Войти" : "Зарегистрироваться"}
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-sand" />
          <span className="text-xs text-ink-faint">или</span>
          <div className="h-px flex-1 bg-sand" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="sf-btn-ghost flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Войти через Google
          </button>

          <button
            type="button"
            onClick={handleAnonymous}
            disabled={loading}
            className="sf-btn-soft flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-70"
          >
            <Sparkles size={16} />
            Быстрый вход (гость)
          </button>
        </div>

          <p className="mt-6 text-center text-[10px] text-ink-faint">
            Для демо на хакатоне — используйте «Быстрый вход» или Google
          </p>
        </div>
      </div>
    </div>
  );
}

function translateError(message: string): string {
  if (message.includes("auth/invalid-credential"))
    return "Неверный email или пароль";
  if (message.includes("auth/email-already-in-use"))
    return "Этот email уже зарегистрирован";
  if (message.includes("auth/weak-password"))
    return "Пароль слишком короткий (мин. 6 символов)";
  if (message.includes("auth/invalid-email")) return "Некорректный email";
  if (message.includes("auth/popup-closed-by-user"))
    return "Окно входа было закрыто";
  return "Не удалось войти. Попробуйте снова.";
}
