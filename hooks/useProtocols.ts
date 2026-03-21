import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function fetchJsonOrThrow(url: string) {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof body?.error === "string" ? body.error : "Ошибка загрузки протоколов"
    throw new Error(message)
  }
  return body
}

export function useProtocols(pathologyId?: string) {
  const query = pathologyId ? `?pathologyId=${pathologyId}` : ""
  return useQuery({
    queryKey: ["protocols", pathologyId ?? "all"],
    queryFn: async () => fetchJsonOrThrow(`/api/protocols${query}`),
  })
}

export function useCreateProtocol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      title: string
      contentJson: Record<string, unknown> | null
      contentText: string
      pathologyId: string
    }) => {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          typeof body?.error === "string" ? body.error : "Не удалось создать протокол"
        throw new Error(message)
      }
      return body
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] })
    },
  })
}
