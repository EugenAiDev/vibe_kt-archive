import { ActivityLog } from "@/components/admin/ActivityLog"

export default function AdminLogsPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Admin</div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Журнал входов</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Последние авторизации пользователей в системе.
        </p>
      </div>
      <ActivityLog />
    </div>
  )
}
