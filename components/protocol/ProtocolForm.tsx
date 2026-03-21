"use client"

import { useState } from "react"
import { useCreateProtocol } from "@/hooks/useProtocols"
import { RichEditor } from "@/components/editor/RichEditor"
import Section from "@/components/ui/section"
import { useAllPathologies } from "@/hooks/usePathologies"

export default function ProtocolForm() {
  const [title, setTitle] = useState("")
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null)
  const [contentText, setContentText] = useState("")
  const [pathologyId, setPathologyId] = useState("")
  const { data: pathologies } = useAllPathologies()
  const create = useCreateProtocol()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!pathologyId) return
        create.mutate({ title, contentJson, contentText, pathologyId })
      }}
    >
      <Section title="Новый протокол" description="Структурируйте шаблон описания">
        <div className="grid gap-3">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Название
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Протокол КТ грудной клетки"
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <div className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Содержание
            </span>
            <RichEditor
              value={contentJson}
              onChange={({ json, text }) => {
                setContentJson(json as Record<string, unknown>)
                setContentText(text)
              }}
            />
          </div>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Патология
            <select
              value={pathologyId}
              onChange={(e) => setPathologyId(e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">Выберите патологию</option>
              {(pathologies as Array<{ id: string; title: string }> | undefined)?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!pathologyId}
              className="h-10 rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)]"
            >
              Создать
            </button>
          </div>
        </div>
      </Section>
    </form>
  )
}
