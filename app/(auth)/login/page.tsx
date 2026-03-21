"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) setError("Неверный логин или пароль")
    else window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] px-8 py-12 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_55%)]" />
          <div className="relative z-10 max-w-xl space-y-5">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
              КТ-Архив
            </div>
            <h1 className="text-3xl font-semibold">Вход в рабочее пространство</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Единая библиотека протоколов и патологий, собранная в формате удобного
              «живого» архива.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-[var(--muted-foreground)]">
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                Категории и подкатегории
              </div>
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                Медиа и заметки
              </div>
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                Интерактивные TODO
              </div>
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                Быстрый поиск
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
            <div className="mb-6 space-y-2">
              <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Доступ
              </div>
              <h2 className="text-2xl font-semibold">Авторизация</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Введите ваш логин и пароль администратора.
              </p>
            </div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Email
                <input
                  placeholder="admin@kt.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Пароль
                <input
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </label>
              <button
                type="submit"
                className="mt-2 h-11 rounded-[var(--radius)] bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)]"
              >
                Войти
              </button>
            </form>
            {error ? (
              <p className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs text-[var(--destructive)]">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
