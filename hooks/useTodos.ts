import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type TodoScope = { pathologyId: string; protocolId?: string }

async function fetchJsonOrThrow(url: string) {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof body?.error === "string" ? body.error : "Ошибка загрузки задач"
    throw new Error(message)
  }
  return body
}

export function useTodos(scope: TodoScope) {
  const params = new URLSearchParams()
  params.set("pathologyId", scope.pathologyId)
  if (scope.protocolId) params.set("protocolId", scope.protocolId)

  return useQuery({
    queryKey: ["todos", scope.pathologyId, scope.protocolId ?? "none"],
    queryFn: async () => fetchJsonOrThrow(`/api/todos?${params.toString()}`),
  })
}

export function useAllTodos() {
  return useQuery({
    queryKey: ["todos", "all"],
    queryFn: async () => fetchJsonOrThrow("/api/todos?all=1"),
  })
}

export function useCreateTodo(scope: TodoScope) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { text: string; dueAt?: string | null }) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...scope }),
      })
      return fetchJsonOrThrowResponse(res, "Не удалось создать задачу")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; text?: string; isDone?: boolean; dueAt?: string | null }) => {
      const res = await fetch(`/api/todos/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return fetchJsonOrThrowResponse(res, "Не удалось обновить задачу")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
      return fetchJsonOrThrowResponse(res, "Не удалось удалить задачу")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}

export function useDeleteAnyTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
      return fetchJsonOrThrowResponse(res, "Не удалось удалить задачу")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}

async function fetchJsonOrThrowResponse(res: Response, fallback: string) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof body?.error === "string" ? body.error : fallback
    throw new Error(message)
  }
  return body
}
