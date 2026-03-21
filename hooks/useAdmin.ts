import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function parseJsonOrThrow(res: Response, fallback: string) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : fallback)
  }
  return body
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users")
      return parseJsonOrThrow(res, "Ошибка загрузки пользователей")
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      name: string
      email: string
      password: string
      role: "ADMIN" | "USER" | "GUEST"
      isActive: boolean
    }) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return parseJsonOrThrow(res, "Не удалось создать пользователя")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: string
      name: string
      email: string
      password?: string
      role: "ADMIN" | "USER" | "GUEST"
      isActive: boolean
    }) => {
      const res = await fetch(`/api/admin/users/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return parseJsonOrThrow(res, "Не удалось обновить пользователя")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })
      return parseJsonOrThrow(res, "Не удалось удалить пользователя")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/logs")
      return parseJsonOrThrow(res, "Ошибка загрузки журнала входов")
    },
  })
}
