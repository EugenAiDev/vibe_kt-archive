"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MediaGallery } from "@/components/media/MediaGallery"
import { useAllPathologies } from "@/hooks/usePathologies"

type ProtocolItem = {
  id: string
  title: string
  contentText: string
  pathologyId: string | null
  pathology?: { id: string; title: string } | null
}

export default function ProtocolPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: session, status } = useSession()
  const canEdit = status !== "loading" && session?.user?.role !== "GUEST"
  const {
    data: pathologies,
    isLoading: pathologiesLoading,
    error: pathologiesError,
  } = useAllPathologies()

  const [draftById, setDraftById] = useState<
    Record<string, { title?: string; contentText?: string; pathologyId?: string }>
  >({})
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["protocol", id],
    queryFn: async () => {
      const res = await fetch(`/api/protocols/${id}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof body?.error === "string" ? body.error : "Ошибка загрузки протокола"
        throw new Error(message)
      }
      return body
    },
    enabled: Boolean(id),
  })

  const protocol = data as ProtocolItem | null | undefined
  const pathologyOptions = useMemo(
    () =>
      ((pathologies ?? []) as Array<{ id: string; title: string }>).sort((a, b) =>
        a.title.localeCompare(b.title, "ru"),
      ),
    [pathologies],
  )
  const draft = draftById[id] ?? {}
  const title = draft.title ?? protocol?.title ?? ""
  const contentText = draft.contentText ?? protocol?.contentText ?? ""
  const pathologyId = draft.pathologyId ?? protocol?.pathologyId ?? pathologyOptions[0]?.id ?? ""

  const save = useMutation({
    mutationFn: async (payload: { title: string; contentText: string; pathologyId: string }) => {
      const res = await fetch(`/api/protocols/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          contentText: payload.contentText,
          contentJson: null,
          pathologyId: payload.pathologyId,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : "Не удалось сохранить протокол")
      }
      return body
    },
    onSuccess: () => {
      setFormError(null)
      setDraftById((prev) => ({ ...prev, [id]: {} }))
      queryClient.invalidateQueries({ queryKey: ["protocol", id] })
      queryClient.invalidateQueries({ queryKey: ["protocols"] })
    },
    onError: (mutationError) => {
      setFormError(
        mutationError instanceof Error ? mutationError.message : "Не удалось сохранить протокол",
      )
    },
  })

  const remove = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/protocols/${id}`, { method: "DELETE" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : "Не удалось удалить протокол")
      }
      return body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] })
      router.push("/protocols")
    },
    onError: (mutationError) => {
      setFormError(
        mutationError instanceof Error ? mutationError.message : "Не удалось удалить протокол",
      )
    },
  })

  if (isLoading) {
    return <div className="text-sm text-[var(--muted-foreground)]">Загрузка…</div>
  }

  if (isError) {
    return (
      <div className="text-sm text-[var(--destructive)]">
        {error instanceof Error ? error.message : "Ошибка загрузки протокола"}
      </div>
    )
  }

  if (!protocol) {
    return <div className="text-sm text-[var(--muted-foreground)]">Протокол не найден.</div>
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          Протокол
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{protocol.title}</h1>
        {protocol.pathology ? (
          <Link
            href={`/pathologies/${protocol.pathology.id}`}
            className="mt-2 inline-flex text-sm font-semibold text-[var(--primary)]"
          >
            Источник: {protocol.pathology.title}
          </Link>
        ) : null}

        {canEdit ? (
          <form
            className="mt-4 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!title.trim() || !pathologyId) {
                setFormError("Укажите заголовок и патологию")
                return
              }
              save.mutate({ title: title.trim(), contentText: contentText.trim(), pathologyId })
            }}
          >
            <input
              value={title}
              onChange={(event) =>
                setDraftById((prev) => ({
                  ...prev,
                  [id]: { ...prev[id], title: event.target.value },
                }))
              }
              placeholder="Заголовок протокола"
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <textarea
              rows={6}
              value={contentText}
              onChange={(event) =>
                setDraftById((prev) => ({
                  ...prev,
                  [id]: { ...prev[id], contentText: event.target.value },
                }))
              }
              placeholder="Тело протокола"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <select
              value={pathologyId}
              onChange={(event) =>
                setDraftById((prev) => ({
                  ...prev,
                  [id]: { ...prev[id], pathologyId: event.target.value },
                }))
              }
              disabled={pathologiesLoading || pathologyOptions.length === 0}
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {pathologyOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            {pathologiesError instanceof Error ? (
              <p className="text-xs text-[var(--destructive)]">{pathologiesError.message}</p>
            ) : null}
            {formError ? <p className="text-xs text-[var(--destructive)]">{formError}</p> : null}
            <div className="flex items-center justify-between gap-2">
              <button
                type="submit"
                disabled={save.isPending || !pathologyId}
                className="h-9 rounded-[var(--radius)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {save.isPending ? "Сохраняем…" : "Сохранить изменения"}
              </button>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm("Удалить протокол? Это действие нельзя отменить.")) {
                    remove.mutate()
                  }
                }}
                className="h-9 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm font-semibold text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {remove.isPending ? "Удаляем…" : "Удалить протокол"}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 whitespace-pre-line text-sm text-[var(--muted-foreground)]">
            {protocol.contentText || "Тело протокола пока не заполнено."}
          </p>
        )}
      </div>
      {id ? <MediaGallery protocolId={id} /> : null}
    </div>
  )
}
