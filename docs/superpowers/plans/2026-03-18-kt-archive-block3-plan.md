# KT-Archive Block 3 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add media uploads (images + video) with local storage, image previews, video posters, and minimal UI integration.

**Architecture:** Media stored under `UPLOADS_DIR` with derived preview/poster files. App Router API routes handle upload, listing, and deletion. Prisma stores metadata + file paths. UI consumes `/api/media` and renders minimal gallery.

**Tech Stack:** Next.js 16, TypeScript 5, Prisma 5, PostgreSQL 16, sharp, fluent-ffmpeg.

---

## File Structure

Create or modify these files in `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan`:

- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/migrations/<timestamp>_block3_media/migration.sql`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/storage.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/images.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/video.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/types.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media/file/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useMedia.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/media/MediaGallery.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/protocols/[id]/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyCard.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-storage.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-types.test.ts`

---

## Chunk 1: Media Path + Type Utilities (TDD)

### Task 1: Add failing unit tests

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-storage.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-types.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest"
import { buildMediaPaths } from "@/lib/media/storage"

describe("media storage", () => {
  it("builds expected paths", () => {
    const paths = buildMediaPaths({
      baseDir: "/tmp/uploads",
      id: "abc",
      ext: "jpg",
      kind: "image",
    })
    expect(paths.original).toBe("/tmp/uploads/original/abc.jpg")
    expect(paths.previewSmall).toBe("/tmp/uploads/previews/abc_320.webp")
    expect(paths.previewLarge).toBe("/tmp/uploads/previews/abc_960.webp")
  })
})
```

```ts
import { describe, expect, it } from "vitest"
import { detectMediaKind } from "@/lib/media/types"

describe("media types", () => {
  it("detects image", () => {
    expect(detectMediaKind("image/png")).toBe("image")
  })

  it("detects video", () => {
    expect(detectMediaKind("video/mp4")).toBe("video")
  })

  it("rejects other", () => {
    expect(() => detectMediaKind("application/pdf")).toThrow("Unsupported")
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:
```bash
npm run test -- tests/unit/media-storage.test.ts
npm run test -- tests/unit/media-types.test.ts
```

Expected: FAIL (modules missing).

- [ ] **Step 3: Commit tests**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-storage.test.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-types.test.ts
git commit -m "test: add media utility tests"
```

### Task 2: Implement media utilities

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/storage.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/types.ts`

- [ ] **Step 1: Implement minimal utilities**

```ts
export function detectMediaKind(mime: string): "image" | "video" {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  throw new Error("Unsupported")
}

export function buildMediaPaths(args: {
  baseDir: string
  id: string
  ext: string
  kind: "image" | "video"
}) {
  return {
    original: `${args.baseDir}/original/${args.id}.${args.ext}`,
    previewSmall: `${args.baseDir}/previews/${args.id}_320.webp`,
    previewLarge: `${args.baseDir}/previews/${args.id}_960.webp`,
    poster: `${args.baseDir}/posters/${args.id}.jpg`,
  }
}
```

- [ ] **Step 2: Re-run tests**

Run:
```bash
npm run test -- tests/unit/media-storage.test.ts
npm run test -- tests/unit/media-types.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit utilities**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-storage.test.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/media-types.test.ts
git commit -m "feat: add media utility helpers"
```

---

## Chunk 2: Schema + Dependencies

### Task 3: Add dependencies

- [ ] **Step 1: Install deps**

Run:
```bash
npm install sharp fluent-ffmpeg @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe mime-types
```

- [ ] **Step 2: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package-lock.json
git commit -m "chore: add media deps"
```

### Task 4: Update Prisma schema + migration

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma`

- [ ] **Step 1: Update models**

```prisma
model Media {
  id           String    @id @default(cuid())
  pathologyId  String?
  pathology    Pathology? @relation(fields: [pathologyId], references: [id], onDelete: Cascade)
  protocolId   String?
  protocol     Protocol?  @relation(fields: [protocolId], references: [id], onDelete: Cascade)
  type         MediaType
  mimeType     String
  originalName String
  filename     String
  size         Int
  width        Int?
  height       Int?
  durationSec  Float?
  previewSmall String?
  previewLarge String?
  poster       String?
  createdAt    DateTime  @default(now())
}

model Protocol {
  id          String    @id @default(cuid())
  title       String
  contentJson Json?
  contentText String   @default("")
  pathologyId String?
  pathology   Pathology? @relation(fields: [pathologyId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  searchVector Unsupported("tsvector")?
  todos       Todo[]
  media       Media[]

  @@index([searchVector], type: Gin)
}
```

- [ ] **Step 2: Create migration manually (non‑interactive environment)**

Create folder:
```bash
mkdir -p /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/migrations/<timestamp>_block3_media
```

Add `migration.sql`:
```sql
-- AlterTable
ALTER TABLE "Media" ADD COLUMN "protocolId" TEXT;
ALTER TABLE "Media" ALTER COLUMN "pathologyId" DROP NOT NULL;
ALTER TABLE "Media" ADD COLUMN "mimeType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Media" ADD COLUMN "width" INTEGER;
ALTER TABLE "Media" ADD COLUMN "height" INTEGER;
ALTER TABLE "Media" ADD COLUMN "durationSec" DOUBLE PRECISION;
ALTER TABLE "Media" ADD COLUMN "previewSmall" TEXT;
ALTER TABLE "Media" ADD COLUMN "previewLarge" TEXT;
ALTER TABLE "Media" ADD COLUMN "poster" TEXT;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

- [ ] **Step 3: Apply migration + generate client**

Run:
```bash
npx prisma migrate deploy
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/migrations
git commit -m "feat: add media schema"
```

---

## Chunk 3: Media Processing Libraries

### Task 5: Implement image + video helpers

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/images.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media/video.ts`

- [ ] **Step 1: Implement image previews**

```ts
import sharp from "sharp"

export async function createImagePreviews(inputPath: string, smallPath: string, largePath: string) {
  await sharp(inputPath).resize({ width: 320 }).webp({ quality: 80 }).toFile(smallPath)
  await sharp(inputPath).resize({ width: 960 }).webp({ quality: 80 }).toFile(largePath)
}

export async function readImageSize(inputPath: string) {
  const meta = await sharp(inputPath).metadata()
  return { width: meta.width ?? null, height: meta.height ?? null }
}
```

- [ ] **Step 2: Implement video poster + duration**

```ts
import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import ffprobeInstaller from "@ffprobe-installer/ffprobe"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

export async function createVideoPoster(inputPath: string, posterPath: string) {
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .screenshots({ count: 1, filename: posterPath, folder: "/" })
  })
}

export async function readVideoDuration(inputPath: string) {
  return new Promise<number | null>((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, data) => {
      if (err) return resolve(null)
      resolve(data.format.duration ?? null)
    })
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/media
git commit -m "feat: add media processing helpers"
```

---

## Chunk 4: API Routes

### Task 6: Implement media API

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media/file/[id]/route.ts`

- [ ] **Step 1: POST /api/media**

```ts
// Use req.formData() to read file, pathologyId/protocolId
// detect media kind, write original, create previews/poster
// create Media row with paths + metadata
```

- [ ] **Step 2: GET /api/media**

```ts
// Filter by pathologyId/protocolId
```

- [ ] **Step 3: DELETE /api/media/[id]**

```ts
// Delete files then row
```

- [ ] **Step 4: GET /api/media/file/[id]?variant=...**

```ts
// Stream original/preview/poster from disk
```

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/media
git commit -m "feat: add media api"
```

---

## Chunk 5: UI Integration

### Task 7: Add media hooks + UI

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useMedia.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/media/MediaGallery.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyCard.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/protocols/[id]/page.tsx`

- [ ] **Step 1: Implement hooks**

```ts
// useMedia(scope) -> GET /api/media
// uploadMedia(file, scope)
// deleteMedia(id)
```

- [ ] **Step 2: Build MediaGallery**

```tsx
// list previews/posters + upload input + delete button
```

- [ ] **Step 3: Integrate in PathologyCard + Protocol page**

```tsx
// add <MediaGallery pathologyId={item.id} />
// protocol page fetches protocol and shows MediaGallery
```

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useMedia.ts /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/media/MediaGallery.tsx /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyCard.tsx /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/protocols/[id]/page.tsx
git commit -m "feat: add media ui"
```

---

## Chunk 6: Verification

### Task 8: Run tests

- [ ] **Step 1: Unit tests**

Run:
```bash
npm run test -- tests/unit/media-storage.test.ts
npm run test -- tests/unit/media-types.test.ts
```

Expected: PASS.

- [ ] **Step 2: Commit any fixes**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan

git commit -m "chore: stabilize block3 tests"
```
