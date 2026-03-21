"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useCategories } from "@/hooks/useCategories"
import CategoryTree from "../category/CategoryTree"

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useCategories()
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === "ADMIN"

  const navClass = (isActive: boolean) =>
    `rounded-[var(--radius)] border px-3 py-2 transition ${
      isActive
        ? "border-[var(--sidebar-border)] bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold"
        : "border-transparent text-[var(--foreground)] hover:border-[var(--sidebar-border)] hover:bg-[var(--accent)]"
    }`

  const activeCategoryId = pathname.startsWith("/section/")
    ? pathname.split("/")[2]
    : null

  return (
    <aside className="flex min-h-full w-full flex-col border-b border-[var(--sidebar-border)] bg-[var(--sidebar)] px-4 py-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-5">
      <div
        className="mb-5 rounded-[var(--radius)] border border-[var(--sidebar-border)] px-4 py-4 backdrop-blur-sm"
        style={{ backgroundColor: "color-mix(in srgb, var(--card) 72%, transparent)" }}
      >
        <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
          KT Archive
        </div>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          КТ-Архив
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Мобильная база знаний по КТ и рентгенологии
        </p>
      </div>
      <nav className="mb-4 flex flex-col gap-2 text-sm">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={navClass(pathname === "/dashboard")}
        >
          Главная
        </Link>
        <Link
          href="/search"
          onClick={onNavigate}
          className={navClass(pathname.startsWith("/search"))}
        >
          Поиск
        </Link>
        <Link
          href="/protocols"
          onClick={onNavigate}
          className={navClass(pathname.startsWith("/protocols"))}
        >
          Протоколы
        </Link>
        <Link
          href="/todos"
          onClick={onNavigate}
          className={navClass(pathname.startsWith("/todos"))}
        >
          TODO
        </Link>
      </nav>
      {isAdmin ? (
        <>
          <div className="mb-2 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            Администрирование
          </div>
          <nav className="mb-4 flex flex-col gap-2 text-sm">
            <Link
              href="/admin"
              onClick={onNavigate}
              className={navClass(pathname === "/admin")}
            >
              Панель администратора
            </Link>
            <Link
              href="/admin/users"
              onClick={onNavigate}
              className={navClass(pathname.startsWith("/admin/users"))}
            >
              Пользователи
            </Link>
            <Link
              href="/admin/logs"
              onClick={onNavigate}
              className={navClass(pathname.startsWith("/admin/logs"))}
            >
              Журнал входов
            </Link>
          </nav>
        </>
      ) : null}
      <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Категории</div>
      <div className="mt-3 pr-1">
        <CategoryTree
          categories={data ?? []}
          activeCategoryId={activeCategoryId}
          onNavigate={onNavigate}
        />
      </div>
      <div
        className="mt-4 rounded-[var(--radius)] border border-[var(--sidebar-border)] px-3 py-3 text-sm backdrop-blur-sm"
        style={{ backgroundColor: "color-mix(in srgb, var(--card) 72%, transparent)" }}
      >
        <div className="font-semibold text-[var(--foreground)]">
          {session?.user?.name ?? "Пользователь"}
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {session?.user?.email ?? "Без email"}
        </div>
        <div className="mt-1 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          {session?.user?.role ?? "USER"}
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 h-9 w-full rounded-[var(--radius)] border border-[var(--border)] text-sm font-medium text-[var(--foreground)]"
        >
          Выйти
        </button>
      </div>
    </aside>
  )
}
