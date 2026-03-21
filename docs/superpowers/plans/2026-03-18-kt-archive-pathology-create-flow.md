# Pathology Create Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated pathology creation page with editable category path, add CTAs to dashboard/section pages, and make the sidebar collapsible with a mobile menu toggle.

**Architecture:** Introduce pure category-tree helpers (flatten/path) with unit tests, then update layout components for collapsible navigation and mobile overlay, and finally wire the creation page + CTAs with role-aware visibility and redirect behavior.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4, NextAuth, TanStack Query, Vitest.

---

## File Structure

Create or modify these files in `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish`:

- Create: `lib/categories.ts`
- Modify: `tests/unit/categories.test.ts`
- Modify: `components/category/CategoryTree.tsx`
- Modify: `components/layout/Sidebar.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `components/ui/page-shell.tsx`
- Modify: `app/providers.tsx`
- Create: `components/pathology/AddPathologyButton.tsx`
- Modify: `components/pathology/PathologyForm.tsx`
- Modify: `hooks/usePathologies.ts`
- Create: `app/(app)/pathologies/new/page.tsx`
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `app/(app)/section/[categoryId]/page.tsx`

---

## Chunk 1: Category Helpers + Unit Tests

### Task 1: Add category tree helpers (flatten + path)

**Files:**
- Create: `lib/categories.ts`
- Modify: `tests/unit/categories.test.ts`

- [ ] **Step 1: Write failing unit tests**

Update `tests/unit/categories.test.ts` to add tests for flattening and path finding:

```ts
import { describe, expect, it } from "vitest"
import { buildCategoryTree, canDeleteCategory } from "@/lib/api"
import { flattenCategoryTree, findCategoryPathIds } from "@/lib/categories"

// ...existing tests...

describe("flattenCategoryTree", () => {
  it("creates full-path labels and root ids", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        children: [
          {
            id: "head",
            name: "Голова",
            parentId: "ct",
            children: [{ id: "brain", name: "Головной мозг", parentId: "head" }],
          },
        ],
      },
      { id: "xray", name: "Рентген", parentId: null, children: [] },
    ]

    const flat = flattenCategoryTree(tree)
    const brain = flat.find((item) => item.id === "brain")
    expect(brain?.pathLabel).toBe("КТ → Голова → Головной мозг")
    expect(brain?.rootId).toBe("ct")
    expect(flat[0].id).toBe("ct")
  })

  it("preserves preorder based on order field", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        order: 2,
        children: [
          { id: "b", name: "B", parentId: "ct", order: 2, children: [] },
          { id: "a", name: "A", parentId: "ct", order: 1, children: [] },
        ],
      },
      { id: "xray", name: "Рентген", parentId: null, order: 1, children: [] },
    ]

    const flat = flattenCategoryTree(tree)
    expect(flat.map((item) => item.id)).toEqual(["xray", "ct", "a", "b"])
  })
})

describe("findCategoryPathIds", () => {
  it("returns ancestor chain to the target", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        children: [
          {
            id: "head",
            name: "Голова",
            parentId: "ct",
            children: [{ id: "brain", name: "Головной мозг", parentId: "head" }],
          },
        ],
      },
    ]

    expect(findCategoryPathIds(tree, "brain")).toEqual(["ct", "head", "brain"])
  })

  it("returns empty array when not found", () => {
    const tree = [{ id: "ct", name: "КТ", parentId: null, children: [] }]
    expect(findCategoryPathIds(tree, "missing")).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests (expect FAIL)**

Run:
```bash
npm run test -- tests/unit/categories.test.ts
```
Expected: FAIL because `@/lib/categories` does not exist.

- [ ] **Step 3: Implement helpers**

Create `lib/categories.ts`:

```ts
export type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  order?: number
  children?: CategoryNode[]
}

export type FlatCategory = {
  id: string
  name: string
  pathLabel: string
  rootId: string
}

export function flattenCategoryTree(nodes: CategoryNode[]): FlatCategory[] {
  const result: FlatCategory[] = []

  const sortByOrder = (items: CategoryNode[]) =>
    [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const walk = (node: CategoryNode, path: string[], rootId: string) => {
    const nextPath = [...path, node.name]
    result.push({
      id: node.id,
      name: node.name,
      pathLabel: nextPath.join(" → ") ,
      rootId,
    })

    sortByOrder(node.children ?? []).forEach((child) => walk(child, nextPath, rootId))
  }

  sortByOrder(nodes).forEach((node) => walk(node, [], node.id))
  return result
}

export function findCategoryPathIds(nodes: CategoryNode[], targetId: string): string[] {
  const path: string[] = []

  const visit = (node: CategoryNode): boolean => {
    path.push(node.id)
    if (node.id === targetId) return true
    if (node.children?.some((child) => visit(child))) return true
    path.pop()
    return false
  }

  for (const node of nodes) {
    if (visit(node)) return [...path]
  }

  return []
}
```

- [ ] **Step 4: Re-run tests (expect PASS)**

Run:
```bash
npm run test -- tests/unit/categories.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/categories.ts tests/unit/categories.test.ts
git commit -m "feat: add category tree helpers"
```

---

## Chunk 2: Collapsible Sidebar + Mobile Menu

### Task 2: Make category tree collapsible and auto-expand active path

**Files:**
- Modify: `components/category/CategoryTree.tsx`
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Update CategoryTree props and logic**

Replace `components/category/CategoryTree.tsx` with:

```tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { findCategoryPathIds, type CategoryNode } from "@/lib/categories"

export default function CategoryTree({
  categories,
  activeCategoryId,
}: {
  categories: CategoryNode[]
  activeCategoryId?: string | null
}) {
  const defaultOpenIds = useMemo(() => {
    const ids = new Set<string>()
    categories.forEach((root) => {
      ids.add(root.id)
      root.children?.forEach((child) => ids.add(child.id))
    })
    return ids
  }, [categories])

  const activePath = useMemo(() => {
    if (!activeCategoryId) return []
    return findCategoryPathIds(categories, activeCategoryId)
  }, [categories, activeCategoryId])

  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setOpenIds((prev) => {
      const next = new Set(prev.size ? prev : defaultOpenIds)
      activePath.forEach((id) => next.add(id))
      return next
    })
  }, [defaultOpenIds, activePath])

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderNode = (node: CategoryNode, depth: number) => {
    const hasChildren = Boolean(node.children?.length)
    const isOpen = openIds.has(node.id)
    const isActive = activeCategoryId === node.id

    return (
      <div key={node.id} className="py-1" style={{ paddingLeft: depth * 12 }}>
        <div className="flex items-center gap-2 text-sm">
          {hasChildren ? (
            <button
              type="button"
              aria-label={isOpen ? "Свернуть" : "Развернуть"}
              onClick={() => toggle(node.id)}
              className="h-6 w-6 rounded-[var(--radius)] border border-transparent text-xs text-[var(--muted-foreground)] hover:border-[var(--border)]"
            >
              {isOpen ? "−" : "+"}
            </button>
          ) : (
            <span className="h-6 w-6" />
          )}
          <Link
            className={`flex-1 rounded-[var(--radius)] px-2 py-1 transition hover:bg-[var(--accent)] ${
              isActive ? "bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]" : "text-[var(--foreground)]"
            }`}
            href={`/section/${node.id}`}
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
```

- [ ] **Step 2: Pass active category id from Sidebar**

Update `components/layout/Sidebar.tsx`:

```tsx
import { usePathname, useSearchParams } from "next/navigation"

// inside component
const pathname = usePathname()
const searchParams = useSearchParams()

const activeCategoryId = pathname.startsWith("/section/")
  ? pathname.split("/")[2]
  : pathname.startsWith("/pathologies/new")
  ? searchParams.get("categoryId")
  : null

// render
<CategoryTree categories={data ?? []} activeCategoryId={activeCategoryId} />
```

- [ ] **Step 3: Commit**

```bash
git add components/category/CategoryTree.tsx components/layout/Sidebar.tsx
git commit -m "feat: add collapsible category tree"
```

### Task 3: Mobile menu toggle in page shell

**Files:**
- Modify: `components/layout/Header.tsx`
- Modify: `components/ui/page-shell.tsx`

- [ ] **Step 1: Update Header to accept menu toggle props**

```tsx
export default function Header({
  onMenuToggle,
  isMenuOpen,
}: {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}) {
  // add button inside header
  <button
    type="button"
    onClick={onMenuToggle}
    aria-label="Меню"
    className="h-10 rounded-[var(--radius)] border border-[var(--border)] px-3 text-sm lg:hidden"
  >
    {isMenuOpen ? "Закрыть" : "Меню"}
  </button>
}
```

- [ ] **Step 2: Convert PageShell to client + overlay**

Replace `components/ui/page-shell.tsx` with:

```tsx
"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default function PageShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-[var(--sidebar)] transition lg:static lg:h-auto lg:w-auto lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>
      <div className="flex min-h-screen flex-col">
        <Header onMenuToggle={() => setMenuOpen((v) => !v)} isMenuOpen={menuOpen} />
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/Header.tsx components/ui/page-shell.tsx
git commit -m "feat: add mobile sidebar toggle"
```

---

## Chunk 3: Creation Page + CTA Buttons

### Task 4: Add session provider + CTA button component

**Files:**
- Modify: `app/providers.tsx`
- Create: `components/pathology/AddPathologyButton.tsx`

- [ ] **Step 1: Wrap app providers with SessionProvider**

Update `app/providers.tsx`:

```tsx
import { SessionProvider } from "next-auth/react"

// inside component return
return (
  <SessionProvider>
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  </SessionProvider>
)
```

- [ ] **Step 2: Add AddPathologyButton**

Create `components/pathology/AddPathologyButton.tsx`:

```tsx
"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function AddPathologyButton({
  categoryId,
  className,
}: {
  categoryId?: string | null
  className?: string
}) {
  const { data, status } = useSession()

  if (status === "loading") return null
  if (data?.user?.role === "GUEST") return null

  const href = categoryId ? `/pathologies/new?categoryId=${categoryId}` : "/pathologies/new"

  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center rounded-[var(--radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow)] ${
        className ?? ""
      }`}
    >
      Добавить патологию
    </Link>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/providers.tsx components/pathology/AddPathologyButton.tsx
git commit -m "feat: add add-pathology button"
```

### Task 5: Create pathology creation page with path selectors

**Files:**
- Create: `app/(app)/pathologies/new/page.tsx`
- Modify: `components/pathology/PathologyForm.tsx`
- Modify: `hooks/usePathologies.ts`

- [ ] **Step 1: Make mutation throw on non-OK**

Update `hooks/usePathologies.ts`:

```ts
const res = await fetch("/api/pathologies", { ... })
if (!res.ok) {
  const body = await res.json().catch(() => ({}))
  throw new Error(body.error ?? "Не удалось создать патологию")
}
return res.json()
```

- [ ] **Step 2: Enhance PathologyForm**

Update `components/pathology/PathologyForm.tsx` to accept `onCreated` and `disabled`:

```tsx
export default function PathologyForm({
  categoryId,
  onCreated,
  disabled,
}: {
  categoryId: string
  onCreated?: (categoryId: string) => void
  disabled?: boolean
}) {
  const [error, setError] = useState<string | null>(null)
  const create = useCreatePathology()

  // in submit
  setError(null)
  try {
    await create.mutateAsync({ title, contentJson, contentText, categoryId })
    onCreated?.(categoryId)
  } catch (err) {
    setError(err instanceof Error ? err.message : "Ошибка создания")
  }

  // submit button uses disabled
  <button disabled={disabled} ... />
  {error ? <p className="...">{error}</p> : null}
}
```

- [ ] **Step 3: Add creation page**

Create `app/(app)/pathologies/new/page.tsx`:

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCategories } from "@/hooks/useCategories"
import { flattenCategoryTree } from "@/lib/categories"
import Section from "@/components/ui/section"
import PathologyForm from "@/components/pathology/PathologyForm"

export default function NewPathologyPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories()
  const searchParams = useSearchParams()
  const router = useRouter()

  const flat = useMemo(() => (categories ? flattenCategoryTree(categories) : []), [categories])
  const roots = categories ?? []
  const byId = useMemo(() => new Map(flat.map((item) => [item.id, item])), [flat])

  const [sectionId, setSectionId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [showDefaultHint, setShowDefaultHint] = useState(false)

  useEffect(() => {
    if (!categories?.length) return
    const queryCategoryId = searchParams.get("categoryId")
    const isValid = queryCategoryId ? byId.has(queryCategoryId) : false
    const fallbackRoot = roots[0]?.id ?? null
    const nextCategoryId = isValid ? (queryCategoryId as string) : fallbackRoot

    setShowDefaultHint(Boolean(queryCategoryId && !isValid))
    if (!nextCategoryId) {
      setSectionId(null)
      setCategoryId(null)
      return
    }

    const nextRoot = byId.get(nextCategoryId)?.rootId ?? nextCategoryId
    setSectionId(nextRoot)
    setCategoryId(nextCategoryId)
  }, [categories, roots, byId, searchParams])

  const filtered = sectionId ? flat.filter((item) => item.rootId === sectionId) : []

  const handleSectionChange = (value: string) => {
    setSectionId(value)
    setCategoryId(value)
  }

  const handleCreated = (nextCategoryId: string) => {
    router.push(`/section/${nextCategoryId}`)
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Создание</div>
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
                onChange={(event) => setCategoryId(event.target.value)}
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
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/pathologies/new/page.tsx components/pathology/PathologyForm.tsx hooks/usePathologies.ts
git commit -m "feat: add pathology creation page"
```

### Task 6: Add CTAs to dashboard and section pages

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `app/(app)/section/[categoryId]/page.tsx`

- [ ] **Step 1: Add button on dashboard**

Add near the header section:

```tsx
import AddPathologyButton from "@/components/pathology/AddPathologyButton"

// inside page header
<AddPathologyButton />
```

- [ ] **Step 2: Add button on section page**

```tsx
import AddPathologyButton from "@/components/pathology/AddPathologyButton"

<AddPathologyButton categoryId={categoryId} />
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/dashboard/page.tsx app/(app)/section/[categoryId]/page.tsx
git commit -m "feat: add add-pathology CTAs"
```

---

## Chunk 4: Verification

### Task 7: Verify

- [ ] **Step 1: Run unit tests**

Run:
```bash
npm run test -- tests/unit/categories.test.ts
```
Expected: PASS.

- [ ] **Step 2: Run lint**

Run:
```bash
npm run lint
```
Expected: No errors (warnings acceptable).

- [ ] **Step 3: Manual smoke**

Run:
```bash
npm run dev
```
Expected:
- “Добавить патологию” appears for ADMIN/USER, hidden for GUEST.
- `/pathologies/new` loads, path selector works, and redirect to `/section/<categoryId>` after creation.
- Sidebar collapses/expands and auto-expands active path.
- Mobile menu toggles with button and closes on outside click.

- [ ] **Step 4: Commit any fixes**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish
git commit -m "chore: stabilize pathology create flow"
```
