"use client"

import { useMemo, useState } from "react"
import Section from "@/components/ui/section"
import {
  useAdminUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from "@/hooks/useAdmin"

type UserItem = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "USER" | "GUEST"
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    comments: number
    todos: number
    sessions: number
  }
}

type NewUserForm = {
  name: string
  email: string
  password: string
  role: "ADMIN" | "USER" | "GUEST"
  isActive: boolean
}

const defaultNewUser = {
  name: "",
  email: "",
  password: "",
  role: "USER" as const,
  isActive: true,
} satisfies NewUserForm

export function UserManagement() {
  const { data, isLoading, error } = useAdminUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [newUser, setNewUser] = useState<NewUserForm>(defaultNewUser)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Partial<UserItem> & { password?: string }>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const users = useMemo(() => (data ?? []) as UserItem[], [data])

  return (
    <div className="space-y-5">
      <Section title="Новый пользователь" description="Добавление учетной записи администратором">
        <form
          className="grid gap-3 lg:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            setFormError(null)
            createUser.mutate(newUser, {
              onSuccess: () => {
                setNewUser(defaultNewUser)
              },
              onError: (mutationError) => {
                setFormError(
                  mutationError instanceof Error
                    ? mutationError.message
                    : "Не удалось создать пользователя",
                )
              },
            })
          }}
        >
          <input
            value={newUser.name}
            onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Имя"
            className="h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
          />
          <input
            value={newUser.email}
            onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="email@example.com"
            className="h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
          />
          <input
            value={newUser.password}
            type="password"
            onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Временный пароль"
            className="h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
          />
          <div className="flex gap-3">
            <select
              value={newUser.role}
              onChange={(event) =>
                setNewUser((prev) => ({
                  ...prev,
                  role: event.target.value as "ADMIN" | "USER" | "GUEST",
                }))
              }
              className="h-11 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
              <option value="GUEST">GUEST</option>
            </select>
            <label className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm">
              <input
                type="checkbox"
                checked={newUser.isActive}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              Активен
            </label>
          </div>
          <div className="lg:col-span-2 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              После создания пользователя можно сразу поменять роль, активность и пароль.
            </p>
            <button
              type="submit"
              disabled={createUser.isPending}
              className="h-11 rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
            >
              {createUser.isPending ? "Создаем..." : "Добавить пользователя"}
            </button>
          </div>
          {formError ? (
            <p className="lg:col-span-2 text-sm text-[var(--destructive)]">{formError}</p>
          ) : null}
        </form>
      </Section>

      <Section title="Пользователи" description="Редактирование ролей, активности и паролей">
        {isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Загрузка...</p> : null}
        {error instanceof Error ? (
          <p className="text-sm text-[var(--destructive)]">{error.message}</p>
        ) : null}

        <div className="space-y-3">
          {users.map((user) => {
            const isEditing = editingId === user.id
            const draft = drafts[user.id] ?? {}
            const name = draft.name ?? user.name
            const email = draft.email ?? user.email
            const role = draft.role ?? user.role
            const isActive = draft.isActive ?? user.isActive
            const password = draft.password ?? ""

            return (
              <div
                key={user.id}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-4"
              >
                {isEditing ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <input
                      value={name}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [user.id]: { ...prev[user.id], name: event.target.value },
                        }))
                      }
                      className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
                    />
                    <input
                      value={email}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [user.id]: { ...prev[user.id], email: event.target.value },
                        }))
                      }
                      className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
                    />
                    <input
                      value={password}
                      type="password"
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [user.id]: { ...prev[user.id], password: event.target.value },
                        }))
                      }
                      placeholder="Новый пароль"
                      className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
                    />
                    <div className="flex gap-3">
                      <select
                        value={role}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [user.id]: {
                              ...prev[user.id],
                              role: event.target.value as "ADMIN" | "USER" | "GUEST",
                            },
                          }))
                        }
                        className="h-10 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="GUEST">GUEST</option>
                      </select>
                      <label className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [user.id]: { ...prev[user.id], isActive: event.target.checked },
                            }))
                          }
                        />
                        Активен
                      </label>
                    </div>
                    <div className="lg:col-span-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Сессий: {user._count?.sessions ?? 0}, комментариев:{" "}
                        {user._count?.comments ?? 0}, TODO: {user._count?.todos ?? 0}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={updateUser.isPending}
                          onClick={() =>
                            updateUser.mutate(
                              {
                                id: user.id,
                                name,
                                email,
                                password,
                                role,
                                isActive,
                              },
                              {
                                onSuccess: () => {
                                  setEditingId(null)
                                  setDrafts((prev) => ({ ...prev, [user.id]: {} }))
                                },
                                onError: (mutationError) => {
                                  setFormError(
                                    mutationError instanceof Error
                                      ? mutationError.message
                                      : "Не удалось обновить пользователя",
                                  )
                                },
                              },
                            )
                          }
                          className="h-10 rounded-[var(--radius)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="h-10 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">{user.name}</h3>
                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-[var(--accent-foreground)]">
                          {user.role}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {user.isActive ? "Активен" : "Выключен"}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">{user.email}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Сессий: {user._count?.sessions ?? 0}, комментариев: {user._count?.comments ?? 0}, TODO: {user._count?.todos ?? 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(user.id)}
                        className="h-10 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        disabled={deleteUser.isPending}
                        onClick={() => {
                          if (!confirm(`Удалить пользователя ${user.email}?`)) return
                          deleteUser.mutate(user.id, {
                            onError: (mutationError) => {
                              setFormError(
                                mutationError instanceof Error
                                  ? mutationError.message
                                  : "Не удалось удалить пользователя",
                              )
                            },
                          })
                        }}
                        className="h-10 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm text-[var(--destructive)] disabled:opacity-60"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
