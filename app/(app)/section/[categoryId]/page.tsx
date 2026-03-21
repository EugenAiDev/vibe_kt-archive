"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { usePathologies } from "@/hooks/usePathologies"
import { useCategories } from "@/hooks/useCategories"
import { findCategoryPath } from "@/lib/categories"
import PathologyCard from "@/components/pathology/PathologyCard"
import AddPathologyButton from "@/components/pathology/AddPathologyButton"
import CategoryBreadcrumbs from "@/components/navigation/CategoryBreadcrumbs"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.categoryId as string
  const { data } = usePathologies(categoryId)
  const { data: categories } = useCategories()

  const categoryName = useMemo(() => {
    if (!categories) return "Патологии"
    const path = findCategoryPath(categories, categoryId)
    return path[path.length - 1]?.name ?? "Патологии"
  }, [categories, categoryId])

  return (
    <div className="space-y-5">
      <CategoryBreadcrumbs categoryId={categoryId} />
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            Раздел
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{categoryName}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Собранные кейсы и наблюдения по выбранной категории.
          </p>
        </div>
        <AddPathologyButton categoryId={categoryId} />
      </div>

      <div className="grid gap-4">
        {data?.length ? (
          data.map((p: { id: string; title: string }) => <PathologyCard key={p.id} item={p} />)
        ) : (
          <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)] p-6 text-sm text-[var(--muted-foreground)]">
            В этом разделе пока нет патологий. Добавьте первую запись, когда будете готовы.
          </div>
        )}
      </div>
    </div>
  )
}
