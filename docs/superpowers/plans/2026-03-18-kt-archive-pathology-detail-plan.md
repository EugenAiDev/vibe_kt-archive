# Pathology Detail Page + Media Robustness Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** добавить отдельную страницу патологии и сделать медиа‑блок устойчивым к отсутствующим превью/ошибкам загрузки и удаления.

**Architecture:** отдельный маршрут `/pathologies/[id]` загружает данные патологии через API и рендерит описание + связанные блоки. Медиа‑отдача получает fallback для изображений, а UI явно обрабатывает ошибки и отображает оригинал при падении превью.

**Tech Stack:** Next.js App Router, TypeScript, TanStack Query, Prisma, Vitest.

---

## Chunk 1: Pathology Detail Navigation

### File Structure

- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/app/(app)/pathologies/[id]/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/components/pathology/PathologyCard.tsx`

### Task 1: Добавить страницу `/pathologies/[id]`

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/app/(app)/pathologies/[id]/page.tsx`

- [ ] **Step 1: Write the failing test (manual smoke checklist)**

Создать чек‑лист проверки (в комментариях файла или как заметку в плане) и зафиксировать текущую ошибку:
1. В разделе клик по карточке → ничего не происходит.
2. Нет страницы `/pathologies/[id]`.

_Это ручной шаг; автоматического теста на роуты пока нет._

- [ ] **Step 2: Implement the page**

Создать страницу с загрузкой патологии и выводом контента:

```tsx
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { MediaGallery } from "@/components/media/MediaGallery"
import { TodoList } from "@/components/todos/TodoList"
import { CommentsPanel } from "@/components/comments/CommentsPanel"

type PathologyItem = {
  id: string
  title: string
  contentText: string
  contentJson: Record<string, unknown> | null
  categoryId: string
}

export default function PathologyPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["pathology", id],
    queryFn: async () => (await fetch(`/api/pathologies/${id}`)).json(),
    enabled: Boolean(id),
  })

  const item = data as PathologyItem | null | undefined

  if (isLoading) {
    return <div className="text-sm text-[var(--muted-foreground)]">Загрузка…</div>
  }

  if (!item) {
    return <div className="text-sm text-[var(--muted-foreground)]">Патология не найдена.</div>
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{item.title}</h1>
        <p className="whitespace-pre-line text-sm text-[var(--muted-foreground)]">
          {item.contentText || "Описание пока не заполнено."}
        </p>
        <Link
          href={`/section/${item.categoryId}`}
          className="inline-flex text-sm font-semibold text-[var(--primary)]"
        >
          Назад в раздел
        </Link>
      </div>

      <div className="grid gap-4">
        <MediaGallery pathologyId={item.id} />
        <TodoList pathologyId={item.id} />
        <CommentsPanel pathologyId={item.id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Manual verification**

Открыть `/pathologies/<id>` напрямую и убедиться, что:
- Отображается состояние загрузки.
- После загрузки видны заголовок и текст.
- Есть ссылка «Назад в раздел».
- При несуществующем `id` показывается «Патология не найдена».

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/app/(app)/pathologies/[id]/page.tsx
git commit -m "feat: add pathology detail page"
```

### Task 2: Сделать карточку кликабельной и компактной

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/components/pathology/PathologyCard.tsx`

- [ ] **Step 1: Write the failing test (manual)**

Текущая проверка: клик по карточке не ведет на страницу патологии.

- [ ] **Step 2: Implement minimal card**

Обновить карточку, чтобы она была ссылкой и показывала только краткую информацию:

```tsx
import Link from "next/link"

export default function PathologyCard({ item }: { item: { id: string; title: string } }) {
  return (
    <Link
      href={`/pathologies/${item.id}`}
      className="block rounded-[calc(var(--radius)+4px)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] transition hover:border-[var(--ring)]"
    >
      <h2 className="text-xl font-semibold text-[var(--foreground)]">{item.title}</h2>
    </Link>
  )
}
```

- [ ] **Step 3: Manual verification**

В разделе `/section/[categoryId]` клик по карточке ведет на `/pathologies/[id]`.

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/components/pathology/PathologyCard.tsx
git commit -m "feat: link pathology cards to detail page"
```

---

## Chunk 2: Media Fallbacks + UI Error Handling

### File Structure

- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/lib/media/file.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/app/api/media/file/[id]/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/hooks/useMedia.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/components/media/MediaGallery.tsx`
- Test: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/tests/unit/media-file.test.ts`
- Test: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/tests/integration/media.test.ts`

### Task 3: Вынести и протестировать логику выбора файла

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/lib/media/file.ts`
- Test: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/tests/unit/media-file.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { resolveMediaVariant } from "@/lib/media/file"

describe("resolveMediaVariant", () => {
  it("falls back to original for missing image previews", () => {
    const item = {
      type: "IMAGE",
      filename: "/uploads/original/a.jpg",
      mimeType: "image/jpeg",
      previewSmall: null,
      previewLarge: null,
      poster: null,
    }
    const result = resolveMediaVariant(item, "previewSmall")
    expect(result.filePath).toBe("/uploads/original/a.jpg")
    expect(result.contentType).toBe("image/jpeg")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/media-file.test.ts`  
Expected: FAIL with "Cannot find module '@/lib/media/file'" or missing export.

- [ ] **Step 3: Write minimal implementation**

```ts
type MediaRecord = {
  type: "IMAGE" | "VIDEO"
  filename: string | null
  mimeType: string
  previewSmall: string | null
  previewLarge: string | null
  poster: string | null
}

export function resolveMediaVariant(item: MediaRecord, variant: string) {
  if (variant === "previewSmall") {
    if (item.previewSmall) return { filePath: item.previewSmall, contentType: "image/webp" }
    if (item.type === "IMAGE") return { filePath: item.filename, contentType: item.mimeType }
  }
  if (variant === "previewLarge") {
    if (item.previewLarge) return { filePath: item.previewLarge, contentType: "image/webp" }
    if (item.type === "IMAGE") return { filePath: item.filename, contentType: item.mimeType }
  }
  if (variant === "poster") {
    if (item.poster) return { filePath: item.poster, contentType: "image/jpeg" }
    return { filePath: null, contentType: "image/jpeg" }
  }
  return { filePath: item.filename, contentType: item.mimeType }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/media-file.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/lib/media/file.ts \
  /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/tests/unit/media-file.test.ts
git commit -m "test: cover media variant resolution"
```

### Task 4: Использовать fallback при отдаче файлов

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/app/api/media/file/[id]/route.ts`

- [ ] **Step 1: Write the failing test (manual)**

Ожидание: если `previewSmall` отсутствует, API отдаёт оригинал изображения вместо 404.

- [ ] **Step 2: Implement fallback usage**

В `GET` заменить логику выбора `filePath` на `resolveMediaVariant`:

```ts
import { resolveMediaVariant } from "@/lib/media/file"
// ...
const { filePath, contentType } = resolveMediaVariant(item, variant)
if (!filePath) {
  return NextResponse.json({ error: "File not available", code: "NOT_FOUND" }, { status: 404 })
}
const data = await fs.readFile(filePath)
return new NextResponse(data, { headers: { "Content-Type": contentType } })
```

- [ ] **Step 3: Manual verification**

Загрузить изображение → убедиться, что превью не ломается даже при отсутствии `previewSmall`.

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/app/api/media/file/[id]/route.ts
git commit -m "fix: fallback media file variants"
```

### Task 5: Улучшить UI‑ошибки медиа и удаление

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/hooks/useMedia.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/components/media/MediaGallery.tsx`

- [ ] **Step 1: Write the failing test (manual)**

Сейчас: если `/api/media` возвращает 500, UI молчит, а удаление «ничего не делает».

- [ ] **Step 2: Add error handling in hooks**

```ts
const res = await fetch(...)
if (!res.ok) {
  const body = await res.json().catch(() => ({}))
  throw new Error(body.error ?? "Ошибка загрузки медиа")
}
```

Применить для `useMedia`, `useUploadMedia`, `useDeleteMedia`.

- [ ] **Step 3: Update MediaGallery UI**

Добавить:
- локальный `error` и вывод текста ошибки;
- `onError` для `<img>` с fallback на оригинал;
- `disabled` для кнопки «Удалить», когда `remove.isPending`.

Пример fallback:

```tsx
const [fallback, setFallback] = useState<Record<string, boolean>>({})

<img
  src={
    fallback[item.id]
      ? `/api/media/file/${item.id}`
      : `/api/media/file/${item.id}?variant=previewSmall`
  }
  onError={() => setFallback((prev) => ({ ...prev, [item.id]: true }))}
/>
```

- [ ] **Step 4: Manual verification**

Проверить:
- превью не ломается (при ошибке показывается оригинал);
- если удалить файл, он исчезает из списка;
- если сервер вернул ошибку, показывается сообщение.

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/hooks/useMedia.ts \
  /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/components/media/MediaGallery.tsx
git commit -m "fix: handle media errors and preview fallback"
```

### Task 6: Интеграционный тест upload + delete через API

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/tests/integration/media.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest"
import { promises as fs } from "node:fs"
import path from "node:path"
import { prisma } from "@/lib/prisma"
import { POST as uploadMedia } from "@/app/api/media/route"
import { DELETE as deleteMedia } from "@/app/api/media/[id]/route"
import { NextRequest } from "next/server"
// If FormData is missing in test env:
// import { FormData, File } from "undici"

vi.mock("@/lib/auth-token", () => ({
  getAuthToken: async () => ({ role: "ADMIN", sub: "test-user" }),
}))

describe("media integration", () => {
  it("uploads image and deletes it via API", async () => {
    const baseDir = path.join(process.cwd(), "uploads-test")
    process.env.UPLOADS_DIR = baseDir

    const category = await prisma.category.create({
      data: { name: "Img", slug: "img", section: "CT" },
    })
    const pathology = await prisma.pathology.create({
      data: {
        title: "Media case",
        contentText: "Sample",
        contentJson: null,
        categoryId: category.id,
      },
    })

    const form = new FormData()
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAJgJr9QAAAAASUVORK5CYII=",
      "base64"
    )
    const file = new File([png], "tiny.png", { type: "image/png" })
    form.set("file", file)
    form.set("pathologyId", pathology.id)

    const uploadReq = new NextRequest("http://localhost/api/media", {
      method: "POST",
      body: form,
    })
    const uploadRes = await uploadMedia(uploadReq)
    expect(uploadRes.status).toBe(200)
    const created = (await uploadRes.json()) as { id: string; filename: string }

    const uploaded = await prisma.media.findUnique({ where: { id: created.id } })
    expect(uploaded?.id).toBe(created.id)
    await expect(fs.stat(created.filename)).resolves.toBeTruthy()

    const deleteReq = new NextRequest(`http://localhost/api/media/${created.id}`, {
      method: "DELETE",
    })
    const deleteRes = await deleteMedia(deleteReq, { params: { id: created.id } })
    expect(deleteRes.status).toBe(200)

    const gone = await prisma.media.findUnique({ where: { id: created.id } })
    expect(gone).toBeNull()

    await prisma.pathology.delete({ where: { id: pathology.id } })
    await prisma.category.delete({ where: { id: category.id } })
    process.env.UPLOADS_DIR = ""
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/media.test.ts`  
Expected: FAIL with missing globals (`File`), auth, or handler import until wired correctly.

- [ ] **Step 3: Minimal adjustments**

Если в среде нет глобальных `File`/`FormData`, добавить `import { File, FormData } from "undici"` и использовать их в тесте.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/integration/media.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/tests/integration/media.test.ts
git commit -m "test: cover media upload and delete via api"
```

---

## Final Verification

- [ ] Run: `npm run test -- tests/unit/media-file.test.ts`  
  Expected: PASS
- [ ] Run: `npm run test -- tests/integration/media.test.ts`  
  Expected: PASS
- [ ] Manual: открыть раздел, перейти на страницу патологии, загрузить/удалить изображение.
- [ ] Manual: попытаться открыть `/api/media` и `/api/media/file/[id]` без авторизации → получить 401.

---

**Plan complete and saved to** `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-ui-polish/docs/superpowers/plans/2026-03-18-kt-archive-pathology-detail-plan.md`. **Ready to execute?**
