import Link from "next/link"
import Section from "@/components/ui/section"

export default function AdminPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Admin</div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Панель администратора</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Управление пользователями, входами и подготовкой системы к рабочему запуску.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Пользователи" description="Создание и контроль ролей">
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Добавляйте новых сотрудников, меняйте роли и отключайте доступ без ручной работы в базе.
          </p>
          <Link
            href="/admin/users"
            className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Открыть управление пользователями
          </Link>
        </Section>

        <Section title="Журнал" description="Последние входы в систему">
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Проверяйте последние логины и отслеживайте активность пользователей в одном месте.
          </p>
          <Link
            href="/admin/logs"
            className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)]"
          >
            Открыть журнал входов
          </Link>
        </Section>
      </div>
    </div>
  )
}
