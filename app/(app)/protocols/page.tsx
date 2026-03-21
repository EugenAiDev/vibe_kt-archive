"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Section from "@/components/ui/section"
import { useCreateProtocol, useProtocols } from "@/hooks/useProtocols"
import { useAllPathologies } from "@/hooks/usePathologies"

type ProtocolItem = {
  id: string
  title: string
  contentText: string
  pathologyId: string | null
  pathology?: { id: string; title: string } | null
  updatedAt: string
}

export default function ProtocolsPage() {
  const { data, isLoading, isError, error } = useProtocols()
  const { data: pathologies, isLoading: isPathologiesLoading } = useAllPathologies()
  const create = useCreateProtocol()
  const { data: session, status } = useSession()
  const canEdit = status !== "loading" && session?.user?.role !== "GUEST"

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pathologyId, setPathologyId] = useState("")
  const protocols = (data ?? []) as ProtocolItem[]
  const pathologyOptions = useMemo(
    () =>
      ((pathologies ?? []) as Array<{ id: string; title: string }>).sort((a, b) =>
        a.title.localeCompare(b.title, "ru"),
      ),
    [pathologies],
  )
  const selectedPathologyId = pathologyId || pathologyOptions[0]?.id || ""

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          Протоколы
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Все протоколы</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Общий раздел с заголовком и телом каждого протокола.
        </p>
      </div>

      {canEdit ? (
        <Section title="Новый протокол" description="Создать общий шаблон протокола">
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!title.trim() || !body.trim()) return
              create.mutate(
                {
                  title: title.trim(),
                  contentText: body.trim(),
                  contentJson: null,
                  pathologyId: selectedPathologyId,
                },
                {
                  onSuccess: () => {
                    setTitle("")
                    setBody("")
                    setPathologyId("")
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
              rows={5}
              placeholder="Тело протокола"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Патология
              <select
                value={selectedPathologyId}
                onChange={(event) => setPathologyId(event.target.value)}
                disabled={isPathologiesLoading || pathologyOptions.length === 0}
                className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                {pathologyOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--muted-foreground)]">
                Каждый протокол привязан к патологии.
              </p>
              <button
                type="submit"
                disabled={create.isPending || !selectedPathologyId}
                className="h-9 rounded-[var(--radius)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {create.isPending ? "Сохраняем…" : "Добавить"}
              </button>
            </div>
            {!selectedPathologyId && !isPathologiesLoading ? (
              <p className="text-xs text-[var(--destructive)]">
                Сначала создайте патологию, затем можно добавить протокол.
              </p>
            ) : null}
            {create.isError ? (
              <p className="text-xs text-[var(--destructive)]">
                {create.error instanceof Error ? create.error.message : "Не удалось создать протокол"}
              </p>
            ) : null}
          </form>
        </Section>
      ) : null}

      <Section title="Список" description="Кликните, чтобы открыть протокол отдельно">
        {isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Загрузка протоколов…</p>
        ) : isError ? (
          <p className="text-sm text-[var(--destructive)]">
            {error instanceof Error ? error.message : "Ошибка загрузки протоколов"}
          </p>
        ) : protocols.length ? (
          <div className="space-y-2">
            {protocols.map((protocol) => (
              <Link
                key={protocol.id}
                href={`/protocols/${protocol.id}`}
                className="block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-3 transition hover:border-[var(--ring)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{protocol.title}</h3>
                  <span className="text-xs font-semibold text-[var(--primary)]">Открыть</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                  {protocol.contentText || "Тело протокола пока не заполнено."}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
                  <span>Обновлен {new Date(protocol.updatedAt).toLocaleDateString()}</span>
                  {protocol.pathology ? (
                    <span>Связан с патологией: {protocol.pathology.title}</span>
                  ) : (
                    <span>Без привязки к патологии</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">Пока протоколов нет.</p>
        )}
      </Section>
    </div>
  )
}
