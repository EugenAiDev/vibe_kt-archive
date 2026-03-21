# KT-Archive Block 2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add content modules: TipTap rich‑text, comments with one‑level replies, TODOs with optional due dates, and Postgres FTS search for pathologies and protocols.

**Architecture:** Keep Next.js App Router API routes as the only data layer. Store TipTap JSON plus extracted plain text in Postgres. Maintain `tsvector` via DB triggers for consistent search. Enforce role checks on the server and keep UI minimal.

**Tech Stack:** Next.js 16, TypeScript 5, Prisma 5, PostgreSQL 16, next-auth v4, TipTap, Vitest.

---

## File Structure

Create or modify these files in `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan`:

- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/migrations/<timestamp>_block2_content_search/migration.sql`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/[id]/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/comments/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/comments/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/todos/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/todos/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/search/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/search.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/comments.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/tiptap.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/editor/RichEditor.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyForm.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolForm.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/comments/CommentsPanel.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/todos/TodoList.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useComments.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useTodos.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useSearch.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/search/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/comments.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/tiptap.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/search.test.ts`

---

## Chunk 1: Data Model + Search Infrastructure

### Task 1: Add failing integration test for search

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/search.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { searchAll } from "@/lib/search"

describe("search integration", () => {
  it("finds pathology and protocol by contentText", async () => {
    const category = await prisma.category.create({
      data: { name: "Search", slug: "search", section: "CT" },
    })

    const pathology = await prisma.pathology.create({
      data: {
        title: "Head",
        contentText: "acute hemorrhage",
        contentJson: null,
        categoryId: category.id,
      },
    })

    const protocol = await prisma.protocol.create({
      data: {
        title: "Protocol A",
        contentText: "acute hemorrhage",
        contentJson: null,
      },
    })

    const result = await searchAll("hemorrhage")
    expect(result.pathologies.some((p) => p.id === pathology.id)).toBe(true)
    expect(result.protocols.some((p) => p.id === protocol.id)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- tests/integration/search.test.ts
```

Expected: FAIL (missing `lib/search` or missing schema fields).

- [ ] **Step 3: Commit test**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/search.test.ts
git commit -m "test: add search integration test"
```

### Task 2: Update Prisma schema for content, comments, todos

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma`

- [ ] **Step 1: Update models**

```prisma
model Pathology {
  id          String   @id @default(cuid())
  title       String
  subtitle    String?
  contentJson Json?
  contentText String
  textColor   String?
  emoji       String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  searchVector Unsupported("tsvector")?
  media       Media[]
  protocols   Protocol[]
  comments    Comment[]
  todos       Todo[]

  @@index([searchVector], type: Gin)
}

model Protocol {
  id          String    @id @default(cuid())
  title       String
  contentJson Json?
  contentText String
  pathologyId String?
  pathology   Pathology? @relation(fields: [pathologyId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  searchVector Unsupported("tsvector")?
  todos       Todo[]

  @@index([searchVector], type: Gin)
}

model Comment {
  id          String    @id @default(cuid())
  text        String
  pathologyId String
  pathology   Pathology @relation(fields: [pathologyId], references: [id], onDelete: Cascade)
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  parentId    String?
  parent      Comment?  @relation("CommentChildren", fields: [parentId], references: [id])
  replies     Comment[] @relation("CommentChildren")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  searchVector Unsupported("tsvector")?

  @@index([searchVector], type: Gin)
}

model Todo {
  id          String    @id @default(cuid())
  text        String
  isDone      Boolean   @default(false)
  dueAt       DateTime?
  pathologyId String
  pathology   Pathology @relation(fields: [pathologyId], references: [id], onDelete: Cascade)
  protocolId  String?
  protocol    Protocol? @relation(fields: [protocolId], references: [id])
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

- [ ] **Step 2: Create migration (edit‑only)**

Run:
```bash
npx prisma migrate dev --name block2_content_search --create-only
```

Expected: new migration folder with `migration.sql`.

- [ ] **Step 3: Edit migration SQL**

Add SQL to migrate `content` → `contentText` and create search triggers.
If the generated migration adds `contentText` as NOT NULL without a default, add a DEFAULT first so existing rows are populated.

```sql
-- Ensure contentText has a safe default for existing rows
ALTER TABLE "Pathology" ALTER COLUMN "contentText" SET DEFAULT '';
ALTER TABLE "Protocol" ALTER COLUMN "contentText" SET DEFAULT '';

-- Backfill contentText from old content
UPDATE "Pathology" SET "contentText" = COALESCE("content", '') WHERE "contentText" IS NULL;
UPDATE "Protocol" SET "contentText" = COALESCE("content", '') WHERE "contentText" IS NULL;

-- Drop old content columns
ALTER TABLE "Pathology" DROP COLUMN IF EXISTS "content";
ALTER TABLE "Protocol" DROP COLUMN IF EXISTS "content";

-- Optional: remove defaults to keep contentText explicit
ALTER TABLE "Pathology" ALTER COLUMN "contentText" DROP DEFAULT;
ALTER TABLE "Protocol" ALTER COLUMN "contentText" DROP DEFAULT;

-- Search vector triggers (Pathology)
CREATE FUNCTION pathology_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('russian',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.subtitle, '') || ' ' ||
    COALESCE(NEW."contentText", '')
  );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER pathology_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Pathology"
FOR EACH ROW EXECUTE FUNCTION pathology_search_vector_update();

-- Search vector triggers (Protocol)
CREATE FUNCTION protocol_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('russian',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW."contentText", '')
  );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER protocol_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Protocol"
FOR EACH ROW EXECUTE FUNCTION protocol_search_vector_update();

-- Backfill vectors
UPDATE "Pathology" SET "searchVector" = to_tsvector('russian',
  COALESCE(title, '') || ' ' || COALESCE(subtitle, '') || ' ' || COALESCE("contentText", '')
);
UPDATE "Protocol" SET "searchVector" = to_tsvector('russian',
  COALESCE(title, '') || ' ' || COALESCE("contentText", '')
);
```

- [ ] **Step 4: Apply migration**

Run:
```bash
npx prisma migrate dev
```

Expected: migration applied, client generated.

- [ ] **Step 5: Update existing integration tests for new fields**

Update these tests to use `contentText`/`contentJson`:

- `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/pathologies.test.ts`
- `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/protocols.test.ts`

- [ ] **Step 6: Commit schema + migration**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/migrations
git commit -m "feat: add block2 content and search schema"
```

---

## Chunk 2: Server Logic + API

### Task 3: Add comment reply validation (TDD)

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/comments.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/comments.ts`

- [ ] **Step 1: Write failing unit test**

```ts
import { describe, expect, it } from "vitest"
import { ensureReplyAllowed } from "@/lib/comments"

describe("comments", () => {
  it("allows replying to top-level comment", () => {
    expect(() => ensureReplyAllowed({ parentId: null })).not.toThrow()
  })

  it("blocks replying to a reply", () => {
    expect(() => ensureReplyAllowed({ parentId: "parent" })).toThrow("Reply depth exceeded")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- tests/unit/comments.test.ts
```

Expected: FAIL (module not found or function missing).

- [ ] **Step 3: Implement minimal function**

```ts
export function ensureReplyAllowed(parent: { parentId: string | null }) {
  if (parent.parentId) throw new Error("Reply depth exceeded")
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- tests/unit/comments.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/comments.test.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/comments.ts
git commit -m "feat: add comment reply validation"
```

### Task 4: Implement comments API

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/comments/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/comments/[id]/route.ts`

- [ ] **Step 1: Implement GET/POST**

```ts
// POST: if parentId provided, load parent and call ensureReplyAllowed
// GET: filter by pathologyId
```

- [ ] **Step 2: Implement PUT/DELETE**

```ts
// PUT updates text, DELETE removes
```

- [ ] **Step 3: Run unit tests**

Run:
```bash
npm run test -- tests/unit/comments.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/comments
git commit -m "feat: add comments api"
```

### Task 5: Implement todos API

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/todos/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/todos/[id]/route.ts`

- [ ] **Step 1: Implement GET/POST**

```ts
// GET supports pathologyId and/or protocolId
// POST writes text, dueAt, authorId from token
```

- [ ] **Step 2: Implement PUT/DELETE**

```ts
// PUT updates text/isDone/dueAt
```

- [ ] **Step 3: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/todos
git commit -m "feat: add todos api"
```

### Task 6: Implement search library + API

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/search.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/search/route.ts`

- [ ] **Step 1: Implement search library**

```ts
import { prisma } from "@/lib/prisma"

export async function searchAll(query: string) {
  const q = query.trim()
  if (!q) return { pathologies: [], protocols: [] }

  const pathologies = await prisma.$queryRaw<
    { id: string; title: string; subtitle: string | null }[]
  >`
    SELECT id, title, subtitle
    FROM "Pathology"
    WHERE "searchVector" @@ plainto_tsquery('russian', ${q})
    ORDER BY "updatedAt" DESC
    LIMIT 50
  `

  const protocols = await prisma.$queryRaw<
    { id: string; title: string }[]
  >`
    SELECT id, title
    FROM "Protocol"
    WHERE "searchVector" @@ plainto_tsquery('russian', ${q})
    ORDER BY "updatedAt" DESC
    LIMIT 50
  `

  return { pathologies, protocols }
}
```

- [ ] **Step 2: Implement API route**

```ts
// GET /api/search?q=...
// Auth required
```

- [ ] **Step 3: Run integration test**

Run:
```bash
npm run test -- tests/integration/search.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/search.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/search/route.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/search.test.ts
git commit -m "feat: add search api"
```

---

## Chunk 3: Client UI + TipTap

### Task 7: Add TipTap text extraction (TDD)

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/tiptap.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/tiptap.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest"
import { extractTextFromDoc } from "@/lib/tiptap"

describe("tiptap", () => {
  it("extracts text from a simple doc", () => {
    const doc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
    }
    expect(extractTextFromDoc(doc)).toBe("Hello")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- tests/unit/tiptap.test.ts
```

Expected: FAIL (module not found or function missing).

- [ ] **Step 3: Implement minimal extractor**

```ts
export function extractTextFromDoc(node: any): string {
  if (!node) return ""
  if (node.type === "text") return node.text ?? ""
  if (!node.content) return ""
  return node.content.map(extractTextFromDoc).join(" ").replace(/\s+/g, " ").trim()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- tests/unit/tiptap.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/tiptap.test.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/tiptap.ts
git commit -m "feat: add tiptap text extractor"
```

### Task 8: Install TipTap + build RichEditor

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/editor/RichEditor.tsx`

- [ ] **Step 1: Install TipTap**

Run:
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

- [ ] **Step 2: Implement RichEditor**

```tsx
// accepts value (JSON), onChange({ json, text })
// use StarterKit, update on every transaction
```

- [ ] **Step 3: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/editor/RichEditor.tsx /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package-lock.json
git commit -m "feat: add rich editor"
```

### Task 9: Update pathology/protocol forms + API payloads

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyForm.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolForm.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/[id]/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/route.ts`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/[id]/route.ts`

- [ ] **Step 1: Replace textarea with RichEditor**

```tsx
// store editor state in form
// on submit send contentJson + contentText
```

- [ ] **Step 2: Update API create/update to persist contentJson/contentText**

```ts
// set contentJson: body.contentJson ?? null
// set contentText: body.contentText ?? ""
```

- [ ] **Step 3: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyForm.tsx /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolForm.tsx /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols
git commit -m "feat: store tiptap content"
```

### Task 10: Add comments + todos UI and hooks

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/comments/CommentsPanel.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/todos/TodoList.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useComments.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useTodos.ts`

- [ ] **Step 1: Implement hooks**

```ts
// useComments(pathologyId) GET + mutations
// useTodos({ pathologyId, protocolId }) GET + mutations
```

- [ ] **Step 2: Implement UI components**

```tsx
// CommentsPanel: list + reply button (1-level)
// TodoList: list with checkbox + add form + due date input
```

- [ ] **Step 3: Wire into pathology/protocol pages**

```tsx
// render CommentsPanel in pathology detail
// render TodoList in pathology and protocol screens
```

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/comments /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/todos /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks
git commit -m "feat: add comments and todos ui"
```

### Task 11: Add search page + hook

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useSearch.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/search/page.tsx`

- [ ] **Step 1: Implement useSearch hook**

```ts
// fetch /api/search?q=...
```

- [ ] **Step 2: Build search page**

```tsx
// input + results lists for pathologies/protocols
```

- [ ] **Step 3: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useSearch.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/search/page.tsx
git commit -m "feat: add search page"
```

---

## Chunk 4: Verification

### Task 12: Run focused tests

- [ ] **Step 1: Unit tests**

Run:
```bash
npm run test -- tests/unit/comments.test.ts
npm run test -- tests/unit/tiptap.test.ts
```

Expected: PASS.

- [ ] **Step 2: Integration tests**

Run:
```bash
npm run test -- tests/integration/search.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit any fixes**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan

git commit -m "chore: stabilize block2 tests"
```
