"use client"

import Section from "@/components/ui/section"
import { useAdminLogs } from "@/hooks/useAdmin"

type LogItem = {
  id: string
  ip: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: "ADMIN" | "USER" | "GUEST"
  }
}

export function ActivityLog() {
  const { data, isLoading, error } = useAdminLogs()
  const logs = (data ?? []) as LogItem[]

  return (
    <Section title="Журнал входов" description="Последние 100 авторизаций">
      {isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Загрузка...</p> : null}
      {error instanceof Error ? (
        <p className="text-sm text-[var(--destructive)]">{error.message}</p>
      ) : null}
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">{log.user.name}</span>
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-[var(--accent-foreground)]">
                {log.user.role}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">{log.user.email}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {new Date(log.createdAt).toLocaleString()}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              IP: {log.ip ?? "не сохранен"} | UA: {log.userAgent ?? "не сохранен"}
            </p>
          </div>
        ))}
        {!isLoading && !logs.length ? (
          <p className="text-sm text-[var(--muted-foreground)]">Записей пока нет.</p>
        ) : null}
      </div>
    </Section>
  )
}
