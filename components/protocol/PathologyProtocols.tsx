"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useCreateProtocol, useProtocols } from "@/hooks/useProtocols"
import Section from "@/components/ui/section"

type ProtocolItem = {
  id: string
  title: string
  contentText: string
  updatedAt: string
}

export function PathologyProtocols({ pathologyId }: { pathologyId: string }) {
  const { data, isLoading } = useProtocols(pathologyId)
  const create = useCreateProtocol()
  const { data: session, status } = useSession()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const canEdit = status !== "loading" && session?.user?.role !== "GUEST"

  const protocols = (data ?? []) as ProtocolItem[]

  return (
    <Section
      title="Протоколы"
      description="Добавляйте шаблоны и разворачивайте детали по клику."
    >
      {canEdit ? (
        <form
          className="mb-4 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!title.trim() || !body.trim()) return
            create.mutate(
              {
                title: title.trim(),
                contentText: body.trim(),
                contentJson: null,
                pathologyId,
              },
              {
                onSuccess: () => {
                  setTitle("")
                  setBody("")
                },
              },
            )
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Заголовок протокола"
            className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Тело протокола"
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-[var(--muted-foreground)]">
              Заполняйте кратко: заголовок + тело протокола.
            </div>
            <button
              type="submit"
              disabled={create.isPending}
              className="h-9 rounded-[var(--radius)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {create.isPending ? "Сохраняем…" : "Добавить протокол"}
            </button>
          </div>
          {create.isError ? (
            <p className="text-xs text-[var(--destructive)]">
              {create.error instanceof Error ? create.error.message : "Не удалось сохранить протокол"}
            </p>
          ) : null}
        </form>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Загрузка протоколов…</p>
      ) : protocols.length ? (
        <div className="space-y-2">
          {protocols.map((protocol) => (
            <details
              key={protocol.id}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            >
              <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
                {protocol.title}
              </summary>
              <p className="mt-2 whitespace-pre-line text-sm text-[var(--muted-foreground)]">
                {protocol.contentText || "Тело протокола пока не заполнено."}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--muted-foreground)]">
                  Обновлен {new Date(protocol.updatedAt).toLocaleString()}
                </span>
                <Link
                  href={`/protocols/${protocol.id}`}
                  className="text-xs font-semibold text-[var(--primary)]"
                >
                  Открыть отдельно
                </Link>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          Пока нет протоколов для этой патологии.
        </p>
      )}
    </Section>
  )
}
