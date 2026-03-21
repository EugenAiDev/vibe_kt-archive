import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function parseJsonOrThrow(res: Response, fallback: string) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = typeof body?.error === "string" ? body.error : fallback
    throw new Error(message)
  }
  return body
}

export function useComments(pathologyId: string) {
  return useQuery({
    queryKey: ["comments", pathologyId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?pathologyId=${pathologyId}`)
      return parseJsonOrThrow(res, "Ошибка загрузки комментариев")
    },
    enabled: Boolean(pathologyId),
  })
}

export function useCreateComment(pathologyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { text: string; parentId?: string }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, pathologyId }),
      })
      return parseJsonOrThrow(res, "Не удалось создать комментарий")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", pathologyId] }),
  })
}

export function useUpdateComment(pathologyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; text: string }) => {
      const res = await fetch(`/api/comments/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload.text }),
      })
      return parseJsonOrThrow(res, "Не удалось изменить комментарий")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", pathologyId] }),
  })
}

export function useDeleteComment(pathologyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" })
      return parseJsonOrThrow(res, "Не удалось удалить комментарий")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", pathologyId] }),
  })
}
