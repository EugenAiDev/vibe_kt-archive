import Link from "next/link"
import Section from "@/components/ui/section"
import AddPathologyButton from "@/components/pathology/AddPathologyButton"
import { getDashboardMetrics } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            Панель
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Обзор архива</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Следите за структурой базы, переходите к категориям и протоколам за два клика.
          </p>
        </div>
        <AddPathologyButton />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Section title="Быстрый старт" description="Основные маршруты внутри архива">
          <div className="grid gap-2 text-sm">
            <Link
              href="/search"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] transition hover:border-[var(--ring)]"
            >
              Открыть поиск по патологиям и протоколам
            </Link>
            <Link
              href="/protocols"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] transition hover:border-[var(--ring)]"
            >
              Перейти в общий раздел протоколов
            </Link>
            <Link
              href="/todos"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] transition hover:border-[var(--ring)]"
            >
              Открыть папку TODO со всеми задачами
            </Link>
            <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]">
              Выберите категорию слева, чтобы перейти к разделу
            </div>
          </div>
        </Section>
        <Section title="Фокус дня" description="Как поддерживать базу актуальной">
          <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <p>1. Обновите список ключевых патологий по разделу.</p>
            <p>2. Добавьте медиа и комментарии для новых случаев.</p>
            <p>3. Проверьте актуальность протоколов и TODO.</p>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Категорий", hint: "Структура разделов", value: metrics.categories },
          { label: "Патологий", hint: "Заполненные карточки", value: metrics.pathologies },
          { label: "Протоколов", hint: "Шаблоны описаний", value: metrics.protocols },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]"
          >
            <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              {item.label}
            </div>
            <div className="text-2xl font-semibold text-[var(--foreground)]">{item.value}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{item.hint}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
