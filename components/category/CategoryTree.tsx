"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  findCategoryPathIds,
  getDefaultOpenCategoryIds,
  type CategoryNode,
} from "@/lib/categories"

const CATEGORY_TREE_STORAGE_KEY = "kt-archive-category-open"

function getStoredOpenIds() {
  if (typeof window === "undefined") return null

  const stored = window.localStorage.getItem(CATEGORY_TREE_STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : null
  } catch {
    return null
  }
}

export default function CategoryTree({
  categories,
  activeCategoryId,
  onNavigate,
}: {
  categories: CategoryNode[]
  activeCategoryId?: string | null
  onNavigate?: () => void
}) {
  const defaultOpenIds = useMemo(() => getDefaultOpenCategoryIds(categories), [categories])

  const activePath = useMemo(() => {
    if (!activeCategoryId) return []
    return findCategoryPathIds(categories, activeCategoryId)
  }, [categories, activeCategoryId])

  const activePathSet = useMemo(() => new Set(activePath), [activePath])
  const [openIds, setOpenIds] = useState<string[] | null>(getStoredOpenIds)

  useEffect(() => {
    if (openIds === null) return
    window.localStorage.setItem(CATEGORY_TREE_STORAGE_KEY, JSON.stringify(openIds))
  }, [openIds])

  const effectiveOpenIds = openIds ?? defaultOpenIds
  const openIdSet = useMemo(() => new Set(effectiveOpenIds), [effectiveOpenIds])

  const toggle = (id: string, next: boolean) => {
    setOpenIds((prev) => {
      const set = new Set(prev ?? defaultOpenIds)
      if (next) set.add(id)
      else set.delete(id)
      return [...set]
    })
  }

  const renderNode = (node: CategoryNode, depth: number) => {
    const hasChildren = Boolean(node.children?.length)
    const isOpen = activePathSet.has(node.id) || openIdSet.has(node.id)
    const isActive = activeCategoryId === node.id

    return (
      <div key={node.id} className="py-1" style={{ paddingLeft: depth * 12 }}>
        <div className="flex items-center gap-2 text-sm">
          {hasChildren ? (
            <button
              type="button"
              aria-label={isOpen ? "Свернуть" : "Развернуть"}
              onClick={() => toggle(node.id, !isOpen)}
              className="h-6 w-6 rounded-[var(--radius)] border border-transparent text-xs text-[var(--muted-foreground)] hover:border-[var(--border)]"
            >
              {isOpen ? "−" : "+"}
            </button>
          ) : (
            <span className="h-6 w-6" />
          )}
          <Link
            className={`flex-1 rounded-[var(--radius)] px-2 py-1 transition hover:bg-[var(--accent)] ${
              isActive
                ? "bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]"
                : "text-[var(--foreground)]"
            }`}
            href={`/section/${node.id}`}
            onClick={onNavigate}
          >
            {node.name}
          </Link>
        </div>
        {hasChildren && isOpen ? node.children?.map((child) => renderNode(child, depth + 1)) : null}
      </div>
    )
  }

  return <div className="space-y-1">{categories.map((root) => renderNode(root, 0))}</div>
}
