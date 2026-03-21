import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type MediaScope = { pathologyId?: string; protocolId?: string }

async function parseJsonOrThrow(res: Response, fallback: string) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = body && typeof body.error === "string" ? body.error : fallback
    throw new Error(message)
  }
  return body
}

export function useMedia(scope: MediaScope) {
  const params = new URLSearchParams()
  if (scope.pathologyId) params.set("pathologyId", scope.pathologyId)
  if (scope.protocolId) params.set("protocolId", scope.protocolId)

  return useQuery({
    queryKey: ["media", scope.pathologyId ?? "none", scope.protocolId ?? "none"],
    queryFn: async () => {
      const res = await fetch(`/api/media?${params.toString()}`)
      return parseJsonOrThrow(res, "Ошибка загрузки медиа")
    },
    enabled: params.toString().length > 0,
  })
}

export function useUploadMedia(scope: MediaScope) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.set("file", file)
      if (scope.pathologyId) form.set("pathologyId", scope.pathologyId)
      if (scope.protocolId) form.set("protocolId", scope.protocolId)

      const res = await fetch("/api/media", { method: "POST", body: form })
      return parseJsonOrThrow(res, "Ошибка загрузки файла")
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["media", scope.pathologyId ?? "none", scope.protocolId ?? "none"],
      }),
  })
}

export function useDeleteMedia(scope: MediaScope) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" })
      return parseJsonOrThrow(res, "Ошибка удаления файла")
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["media", scope.pathologyId ?? "none", scope.protocolId ?? "none"],
      }),
  })
}
