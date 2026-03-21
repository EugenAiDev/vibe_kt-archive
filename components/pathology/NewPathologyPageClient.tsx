"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCategories } from "@/hooks/useCategories"
import { flattenCategoryTree } from "@/lib/categories"
import Section from "@/components/ui/section"
import PathologyForm from "@/components/pathology/PathologyForm"

export function NewPathologyPageClient({
  initialCategoryId,
}: {
  initialCategoryId?: string
}) {
  const { data: categories, isLoading, isError, refetch } = useCategories()
  const router = useRouter()

  const flat = useMemo(() => (categories ? flattenCategoryTree(categories) : []), [categories])
  const roots = categories ?? []
  const byId = useMemo(() => new Map(flat.map((item) => [item.id, item])), [flat])

  const initialSelection = useMemo(() => {
    if (!categories?.length) {
      return { sectionId: null, categoryId: null, showDefaultHint: false }
    }

    const isValid = initialCategoryId ? byId.has(initialCategoryId) : false
    const fallbackRoot = categories[0]?.id ?? null
    const nextCategoryId = isValid ? initialCategoryId ?? null : fallbackRoot
    const showDefaultHint = Boolean(initialCategoryId && !isValid)

    if (!nextCategoryId) {
      return { sectionId: null, categoryId: null, showDefaultHint }
    }

    const nextRoot = byId.get(nextCategoryId)?.rootId ?? nextCategoryId
    return { sectionId: nextRoot, categoryId: nextCategoryId, showDefaultHint }
  }, [categories, byId, initialCategoryId])

  const [selection, setSelection] = useState<{
    sectionId: string | null
    categoryId: string | null
  }>({ sectionId: null, categoryId: null })
  const [touched, setTouched] = useState(false)

  const sectionId = touched ? selection.sectionId : initialSelection.sectionId
  const categoryId = touched ? selection.categoryId : initialSelection.categoryId
  const showDefaultHint = !touched && initialSelection.showDefaultHint

  const filtered = sectionId ? flat.filter((item) => item.rootId === sectionId) : []

  const handleSectionChange = (value: string) => {
    setTouched(true)
    setSelection({ sectionId: value, categoryId: value })
  }

  const handleCreated = (nextCategoryId: string) => {
    router.push(`/section/${nextCategoryId}`)
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          Создание
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Создание патологии</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Выберите путь и заполните карточку.
        </p>
      </div>

      <Section title="Путь" description="Раздел и категория патологии">
        {isError ? (
          <div className="space-y-2 text-sm">
            <p className="text-[var(--destructive)]">Не удалось загрузить категории.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-9 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm"
            >
              Повторить
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Раздел
              <select
                value={sectionId ?? ""}
                onChange={(event) => handleSectionChange(event.target.value)}
                disabled={isLoading || !roots.length}
                className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                {roots.map((root) => (
                  <option key={root.id} value={root.id}>
                    {root.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Категория
              <select
                value={categoryId ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  setTouched(true)
                  setSelection((prev) => ({
                    sectionId: prev.sectionId ?? sectionId ?? value,
                    categoryId: value,
                  }))
                }}
                disabled={isLoading || !filtered.length}
                className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                {filtered.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.pathLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {showDefaultHint ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Раздел выбран по умолчанию, при необходимости выберите другой путь.
          </p>
        ) : null}
        {!isLoading && !isError && roots.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">Категории не найдены.</p>
        ) : null}
      </Section>

      {categoryId ? (
        <PathologyForm
          categoryId={categoryId}
          onCreated={handleCreated}
          disabled={isLoading || !categoryId}
        />
      ) : null}
    </div>
  )
}
