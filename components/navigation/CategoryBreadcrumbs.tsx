"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useCategories } from "@/hooks/useCategories"
import { findCategoryPath } from "@/lib/categories"

export default function CategoryBreadcrumbs({
  categoryId,
  tailLabel,
}: {
  categoryId?: string | null
  tailLabel?: string
}) {
  const { data } = useCategories()

  const categoryPath = useMemo(() => {
    if (!categoryId || !data) return []
    return findCategoryPath(data, categoryId)
  }, [categoryId, data])

  const hasBreadcrumbs = categoryPath.length > 0 || Boolean(tailLabel)
  if (!hasBreadcrumbs) return null

  return (
    <nav
      aria-label="Хлебные крошки"
      className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]"
    >
      <Link href="/dashboard" className="transition hover:text-[var(--foreground)]">
        Главная
      </Link>
      {categoryPath.map((category, index) => {
        const isLastCategory = index === categoryPath.length - 1
        const isCurrent = isLastCategory && !tailLabel

        return (
          <span key={category.id} className="flex items-center gap-2">
            <span>/</span>
            {isCurrent ? (
              <span className="font-medium text-[var(--foreground)]">{category.name}</span>
            ) : (
              <Link
                href={`/section/${category.id}`}
                className="transition hover:text-[var(--foreground)]"
              >
                {category.name}
              </Link>
            )}
          </span>
        )
      })}
      {tailLabel ? (
        <span className="flex items-center gap-2">
          <span>/</span>
          <span className="font-medium text-[var(--foreground)]">{tailLabel}</span>
        </span>
      ) : null}
    </nav>
  )
}
