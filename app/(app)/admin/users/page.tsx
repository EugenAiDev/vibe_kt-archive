import { UserManagement } from "@/components/admin/UserManagement"

export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Admin</div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Пользователи</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Создание новых учетных записей и управление доступом.
        </p>
      </div>
      <UserManagement />
    </div>
  )
}
