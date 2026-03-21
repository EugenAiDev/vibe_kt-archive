"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MediaGallery } from "@/components/media/MediaGallery"
import { TodoList } from "@/components/todos/TodoList"
import { CommentsPanel } from "@/components/comments/CommentsPanel"
import { PathologyProtocols } from "@/components/protocol/PathologyProtocols"
import { RichEditor } from "@/components/editor/RichEditor"
import CategoryBreadcrumbs from "@/components/navigation/CategoryBreadcrumbs"
import { useCategories } from "@/hooks/useCategories"
import { flattenCategoryTree } from "@/lib/categories"
import { useUpdatePathology } from "@/hooks/usePathologies"

type PathologyItem = {
  id: string
  title: string
  subtitle?: string | null
  contentText: string
  contentJson: Record<string, unknown> | null
  categoryId: string
}

// Manual smoke checklist:
// Baseline before this page existed:
// 1. Click on a pathology card → nothing happens.
// 2. /pathologies/[id] route does not exist.
// After adding this page:
// 3. Open a pathology card in /section/[categoryId] and confirm it navigates to /pathologies/[id].
// 4. Open /pathologies/<id> directly and verify loading, content, and the back link.
// 5. Use a missing id and confirm the "Патология не найдена." state appears.
export default function PathologyPage() {
  const params = useParams()
  const id = params.id as string
  const { data: categories } = useCategories()
  const update = useUpdatePathology()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<{
    title?: string
    subtitle?: string
    categoryId?: string
    contentText?: string
    contentJson?: Record<string, unknown> | null
  }>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pathology", id],
    queryFn: async () => {
      const res = await fetch(`/api/pathologies/${id}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? "Ошибка загрузки патологии")
      }
      return res.json()
    },
    enabled: Boolean(id),
  })

  const item = data as PathologyItem | null | undefined
  const categoryOptions = useMemo(
    () => flattenCategoryTree(categories ?? []),
    [categories],
  )

  if (isLoading) {
    return <div className="text-sm text-[var(--muted-foreground)]">Загрузка…</div>
  }

  if (isError) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">
        {error instanceof Error ? error.message : "Ошибка загрузки патологии"}
      </div>
    )
  }

  if (!item) {
    return <div className="text-sm text-[var(--muted-foreground)]">Патология не найдена.</div>
  }

  const title = draft.title ?? item.title
  const subtitle = draft.subtitle ?? item.subtitle ?? ""
  const categoryId = draft.categoryId ?? item.categoryId
  const contentJson = draft.contentJson ?? item.contentJson
  const contentText = draft.contentText ?? item.contentText

  const handleStartEdit = () => {
    setActionError(null)
    setDraft({
      title: item.title,
      subtitle: item.subtitle ?? "",
      categoryId: item.categoryId,
      contentJson: item.contentJson,
      contentText: item.contentText,
    })
    setIsEditing(true)
  }

  return (
    <div className="space-y-5">
      <CategoryBreadcrumbs categoryId={item.categoryId} tailLabel={item.title} />
      <div className="space-y-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">{item.title}</h1>
            {item.subtitle ? (
              <p className="text-sm text-[var(--muted-foreground)]">{item.subtitle}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setDraft({})
                    setActionError(null)
                  }}
                  className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update.mutate(
                      {
                        id,
                        title: title.trim(),
                        subtitle: subtitle.trim() || null,
                        categoryId,
                        contentJson,
                        contentText,
                      },
                      {
                        onSuccess: () => {
                          setActionError(null)
                          setIsEditing(false)
                          setDraft({})
                        },
                        onError: (mutationError) =>
                          setActionError(
                            mutationError instanceof Error
                              ? mutationError.message
                              : "Не удалось сохранить изменения",
                          ),
                      },
                    )
                  }
                  className="rounded-[var(--radius)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)]"
                >
                  {update.isPending ? "Сохранение…" : "Сохранить"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="rounded-[var(--radius)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)]"
              >
                Редактировать
              </button>
            )}
            <Link
              href={`/section/${item.categoryId}`}
              className="inline-flex rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
            >
              Назад в раздел
            </Link>
          </div>
        </div>
        {isEditing ? (
          <div className="grid gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Название
              <input
                value={title}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Подзаголовок
              <input
                value={subtitle}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, subtitle: event.target.value }))
                }
                placeholder="Короткое пояснение к патологии"
                className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Категория
              <select
                value={categoryId}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.pathLabel}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Описание
              </span>
              <RichEditor
                value={contentJson}
                onChange={({ json, text }) =>
                  setDraft((prev) => ({
                    ...prev,
                    contentJson: json as Record<string, unknown> | null,
                    contentText: text,
                  }))
                }
              />
            </div>
            {actionError ? (
              <p className="text-sm text-[var(--destructive)]">{actionError}</p>
            ) : null}
          </div>
        ) : (
          <p className="whitespace-pre-line text-sm text-[var(--muted-foreground)]">
            {item.contentText || "Описание пока не заполнено."}
          </p>
        )}
      </div>

      <div className="grid gap-4">
        <MediaGallery pathologyId={item.id} />
        <PathologyProtocols pathologyId={item.id} />
        <TodoList pathologyId={item.id} />
        <CommentsPanel pathologyId={item.id} />
      </div>
    </div>
  )
}
