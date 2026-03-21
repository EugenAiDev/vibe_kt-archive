import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function fetchJsonOrThrow(url: string) {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof body?.error === "string" ? body.error : "Ошибка загрузки патологий"
    throw new Error(message)
  }
  return body
}

export function usePathologies(categoryId: string) {
  return useQuery({
    queryKey: ["pathologies", categoryId],
    queryFn: async () =>
      fetchJsonOrThrow(`/api/pathologies?categoryId=${encodeURIComponent(categoryId)}`),
  })
}

export function useAllPathologies() {
  return useQuery({
    queryKey: ["pathologies", "all"],
    queryFn: async () => fetchJsonOrThrow("/api/pathologies"),
  })
}

export function useCreatePathology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      title: string
      contentJson: Record<string, unknown> | null
      contentText: string
      categoryId: string
    }) => {
      const res = await fetch("/api/pathologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Не удалось создать патологию")
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pathologies"] })
      qc.invalidateQueries({ queryKey: ["search"] })
      qc.invalidateQueries({ queryKey: ["pathology"] })
    },
  })
}

export function useUpdatePathology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: string
      title: string
      subtitle?: string | null
      contentJson: Record<string, unknown> | null
      contentText: string
      categoryId: string
    }) => {
      const res = await fetch(`/api/pathologies/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Не удалось обновить патологию")
      }
      return res.json()
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["pathology", vars.id] })
      qc.invalidateQueries({ queryKey: ["pathologies"] })
      qc.invalidateQueries({ queryKey: ["search"] })
    },
  })
}
