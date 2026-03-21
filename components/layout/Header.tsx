"use client"

import { useSession } from "next-auth/react"
import { useTheme } from "@/components/theme/ThemeProvider"

export default function Header({
  onMenuToggle,
  isMenuOpen,
}: {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}) {
  const { data: session } = useSession()
  const { mode, setMode } = useTheme()

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)] px-4 py-4 shadow-[var(--shadow)] backdrop-blur-xl md:px-6"
      style={{ backgroundColor: "color-mix(in srgb, var(--card) 88%, transparent)" }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Меню"
            className="h-10 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm text-[var(--foreground)] lg:hidden"
          >
            {isMenuOpen ? "Закрыть" : "Меню"}
          </button>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
              Рабочее пространство
            </div>
            <div className="text-lg font-semibold text-[var(--foreground)]">База знаний</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {session?.user?.role === "ADMIN"
                ? "Режим администратора"
                : "Быстрый доступ к кейсам, протоколам и задачам"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Тема
          </label>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as "system" | "light" | "dark")}
            className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="system">Система</option>
            <option value="light">Светлая</option>
            <option value="dark">Темная</option>
          </select>
        </div>
      </div>
    </header>
  )
}
