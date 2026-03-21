"use client"

import { useState } from "react"
import { useCreatePathology } from "@/hooks/usePathologies"
import { RichEditor } from "@/components/editor/RichEditor"
import Section from "@/components/ui/section"

export default function PathologyForm({
  categoryId,
  onCreated,
  disabled,
}: {
  categoryId: string
  onCreated?: (categoryId: string) => void
  disabled?: boolean
}) {
  const [title, setTitle] = useState("")
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null)
  const [contentText, setContentText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const create = useCreatePathology()

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setError(null)
        try {
          await create.mutateAsync({ title, contentJson, contentText, categoryId })
          onCreated?.(categoryId)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Ошибка создания")
        }
      }}
    >
      <Section title="Новая патология" description="Заполните карточку по разделу">
        <div className="grid gap-3">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Название
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Дефект межжелудочковой перегородки"
              className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <div className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Описание
            </span>
            <RichEditor
              value={contentJson}
              onChange={({ json, text }) => {
                setContentJson(json as Record<string, unknown>)
                setContentText(text)
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={disabled}
              className="h-10 rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)]"
            >
              Создать
            </button>
          </div>
          {error ? (
            <p className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs text-[var(--destructive)]">
              {error}
            </p>
          ) : null}
        </div>
      </Section>
    </form>
  )
}
