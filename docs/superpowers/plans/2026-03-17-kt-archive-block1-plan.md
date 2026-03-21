# KT-Archive Block 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the project foundation: repo scaffold, environment, Auth.js credentials, role-based access, categories tree, and minimal CRUD screens for categories, pathologies, and protocols.

**Architecture:** Next.js App Router with API routes for all server access, Prisma + Postgres for persistence, Auth.js credentials for sessions, TanStack Query for client data. Authorization enforced in middleware and duplicated in API routes; UI remains functional but minimally styled.

**Tech Stack:** Next.js 16, TypeScript 5, Tailwind 4, shadcn/ui (new-york), Prisma 5, PostgreSQL 16 (docker-compose), next-auth v4, TanStack Query v5, Vitest, Playwright.

**Note:** Versions updated to latest (Next 16/Tailwind 4/next-auth v4) per user approval on 2026-03-17.

---

## File Structure

Create or modify these files in `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan`:

- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/layout.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/providers.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(auth)/login/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/layout.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/dashboard/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/section/[categoryId]/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/auth/[...nextauth]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/categories/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/categories/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/layout/Sidebar.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/layout/Header.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/category/CategoryTree.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyForm.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyCard.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolForm.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolCard.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useCategories.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/usePathologies.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useProtocols.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/auth.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/prisma.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/access.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/api.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/middleware.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/types/next-auth.d.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/seed.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/docker-compose.yml`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/.env.example`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/.gitignore`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/auth.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/categories.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/pathologies.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/protocols.test.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/vitest.config.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/playwright.config.ts`

## Chunk 1: Scaffold and Core Tooling

### Task 1: Initialize Next.js 15 + TypeScript + Tailwind

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tsconfig.json`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tailwind.config.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/postcss.config.js`

- [ ] **Step 1: Scaffold app**

Run:
```bash
cd /Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*"
```

Expected: Next.js project files created, `package.json` present.

- [ ] **Step 2: Verify dev server boots**

Run:
```bash
npm run dev
```

Expected: log contains "Ready" and local URL.

- [ ] **Step 3: Commit scaffold**

```bash
git add .
git commit -m "chore: scaffold nextjs app"
```

### Task 1.5: Install dependencies and test scripts

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/package.json`

- [ ] **Step 1: Install runtime deps**

Run:
```bash
npm install next-auth @prisma/client @tanstack/react-query bcryptjs
```

- [ ] **Step 2: Install dev deps**

Run:
```bash
npm install -D prisma vitest @testing-library/react @testing-library/jest-dom @playwright/test tsx @types/bcryptjs
```

- [ ] **Step 3: Add scripts and prisma seed**

Run:
```bash
npm pkg set scripts.test="vitest" scripts.test:watch="vitest --watch" scripts.test:e2e="playwright test"
npm pkg set prisma.seed="tsx prisma/seed.ts"
```

- [ ] **Step 4: Commit dependencies**

```bash
git add package.json package-lock.json
git commit -m "chore: add core dependencies"
```

### Task 2: Configure shadcn/ui (new-york)

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tailwind.config.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/ui/`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components.json`

- [ ] **Step 1: Initialize shadcn**

Run:
```bash
npx shadcn@latest init -d
```

Expected: prompt selects `new-york`, TypeScript, tailwind config auto-detected, `components.json` created.

- [ ] **Step 2: Add base components**

Run:
```bash
npx shadcn@latest add button input card badge dropdown-menu
```

Expected: files created under `components/ui/`.

- [ ] **Step 3: Commit shadcn setup**

```bash
git add components.json components/ui tailwind.config.ts
git commit -m "chore: init shadcn ui"
```

### Task 3: Environment and Docker Compose

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/docker-compose.yml`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/.env.example`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/.gitignore`

- [ ] **Step 1: Add docker-compose**

Create `docker-compose.yml`:
```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: kt_user
      POSTGRES_PASSWORD: kt_password
      POSTGRES_DB: kt_archive
    ports:
      - "5432:5432"
    volumes:
      - kt_archive_db:/var/lib/postgresql/data
volumes:
  kt_archive_db:
```

- [ ] **Step 2: Add .env.example**

Create `.env.example`:
```env
DATABASE_URL="postgresql://kt_user:kt_password@localhost:5432/kt_archive"
AUTH_SECRET="generate_with: openssl rand -hex 32"
ADMIN_EMAIL="admin@kt-archive.local"
ADMIN_PASSWORD="StrongPassword123!"
UPLOADS_DIR="/Users/joe/Documents/Vibe/kt-archive/uploads"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 3: Update .gitignore**

Append:
```gitignore
.env
.env.local
uploads/
.superpowers/
```

- [ ] **Step 4: Create local env files (not committed)**

Run:
```bash
cp .env.example .env.local
cp .env.example .env
```

- [ ] **Step 5: Commit env and docker**

```bash
git add docker-compose.yml .env.example .gitignore
git commit -m "chore: add env template and docker postgres"
```

### Task 4: Prisma schema and client

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/schema.prisma`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/prisma.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/prisma/seed.ts`

- [ ] **Step 1: Add Prisma schema**

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  USER
  GUEST
}

enum SectionType {
  CT
  XRAY
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]
  comments  Comment[]
  todos     Todo[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
}

model Category {
  id         String      @id @default(cuid())
  name       String
  slug       String
  parentId   String?
  parent     Category?   @relation("CategoryChildren", fields: [parentId], references: [id])
  children   Category[]  @relation("CategoryChildren")
  section    SectionType
  isLocked   Boolean     @default(false)
  order      Int         @default(0)
  createdAt  DateTime    @default(now())

  pathologies Pathology[]
}

model Pathology {
  id          String   @id @default(cuid())
  title       String
  subtitle    String?
  content     String
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

enum MediaType {
  IMAGE
  VIDEO
}

model Media {
  id           String    @id @default(cuid())
  pathologyId  String
  pathology    Pathology @relation(fields: [pathologyId], references: [id], onDelete: Cascade)
  type         MediaType
  originalName String
  filename     String
  size         Int
  createdAt    DateTime  @default(now())
}

model Protocol {
  id          String    @id @default(cuid())
  title       String
  content     String
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
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  searchVector Unsupported("tsvector")?

  @@index([searchVector], type: Gin)
}

model Todo {
  id          String    @id @default(cuid())
  text        String
  isDone      Boolean   @default(false)
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

- [ ] **Step 2: Add Prisma client**

Create `lib/prisma.ts`:
```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Add seed (admin + системные категории)**

Create `prisma/seed.ts`:
```ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

type CategoryNode = {
  name: string
  children?: CategoryNode[]
}

const baseTree: CategoryNode[] = [
  {
    name: "Голова",
    children: [
      { name: "Головной мозг" },
      { name: "Кости черепа" },
      { name: "ППН (пазухи носа)" },
    ],
  },
  { name: "Шея" },
  {
    name: "ОГК",
    children: [
      { name: "Лёгкие" },
      { name: "Средостение" },
      { name: "Грудная клетка" },
    ],
  },
  {
    name: "Пояс верхних конечностей",
    children: [
      { name: "Плечо" },
      { name: "Ключица" },
      { name: "Локоть" },
      { name: "Предплечье" },
      { name: "Кисть" },
    ],
  },
  { name: "Органы брюшной полости" },
  { name: "Органы малого таза" },
  {
    name: "Пояс нижних конечностей",
    children: [
      { name: "ТБС (тазобедренные суставы)" },
      { name: "Бедро" },
      { name: "Колено" },
      { name: "Голень" },
      { name: "Стопа" },
    ],
  },
  { name: "Кости таза" },
  {
    name: "Позвоночник",
    children: [
      { name: "Шейный отдел" },
      { name: "Грудной отдел" },
      { name: "Пояснично-крестцовый отдел" },
      { name: "Копчик" },
    ],
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

async function createTree(params: {
  section: "CT" | "XRAY"
  parentId?: string | null
  nodes: CategoryNode[]
}) {
  const { section, parentId = null, nodes } = params

  for (const node of nodes) {
    const created = await prisma.category.create({
      data: {
        name: node.name,
        slug: slugify(node.name),
        parentId,
        section,
        isLocked: true,
      },
    })

    if (node.children?.length) {
      await createTree({ section, parentId: created.id, nodes: node.children })
    }
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@kt-archive.local"
  const password = process.env.ADMIN_PASSWORD ?? "StrongPassword123!"
  const hash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      password: hash,
      role: "ADMIN",
      isActive: true,
    },
  })

  await prisma.category.deleteMany()

  await prisma.category.create({
    data: {
      name: "КТ",
      slug: "ct",
      section: "CT",
      isLocked: true,
    },
  })
  await prisma.category.create({
    data: {
      name: "Рентген",
      slug: "xray",
      section: "XRAY",
      isLocked: true,
    },
  })

  const ctRoot = await prisma.category.findFirst({
    where: { name: "КТ", section: "CT" },
  })
  const xrayRoot = await prisma.category.findFirst({
    where: { name: "Рентген", section: "XRAY" },
  })

  if (ctRoot) await createTree({ section: "CT", parentId: ctRoot.id, nodes: baseTree })
  if (xrayRoot) await createTree({ section: "XRAY", parentId: xrayRoot.id, nodes: baseTree })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 4: Commit Prisma baseline**

```bash
git add prisma/schema.prisma prisma/seed.ts lib/prisma.ts
git commit -m "feat: add prisma schema and seed"
```

## Chunk 2: Auth, Access Control, and Middleware

### Task 5: Access helper + unit tests (TDD)

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/access.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/auth.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/auth.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { evaluateAccess } from "@/lib/access"

describe("evaluateAccess", () => {
  it("redirects to /login when no session", () => {
    const result = evaluateAccess({ pathname: "/dashboard", role: null })
    expect(result.action).toBe("redirect")
    expect(result.to).toBe("/login")
  })

  it("blocks non-admin from /admin", () => {
    const result = evaluateAccess({ pathname: "/admin", role: "USER" })
    expect(result.action).toBe("redirect")
    expect(result.to).toBe("/dashboard")
  })

  it("blocks guest from edit routes", () => {
    const result = evaluateAccess({ pathname: "/protocols/123/edit", role: "GUEST" })
    expect(result.action).toBe("redirect")
    expect(result.to).toBe("/dashboard")
  })

  it("allows user to dashboard", () => {
    const result = evaluateAccess({ pathname: "/dashboard", role: "USER" })
    expect(result.action).toBe("allow")
  })
})
```

- [ ] **Step 2: Run test to see failure**

Run:
```bash
npm run test -- tests/unit/auth.test.ts
```

Expected: FAIL with "Cannot find module '@/lib/access'" or missing export.

- [ ] **Step 3: Implement access helper**

Create `lib/access.ts`:
```ts
export type Role = "ADMIN" | "USER" | "GUEST"

export type AccessDecision =
  | { action: "allow" }
  | { action: "redirect"; to: "/login" | "/dashboard" }

export function evaluateAccess(params: {
  pathname: string
  role: Role | null
}): AccessDecision {
  const { pathname, role } = params

  if (pathname.startsWith("/login")) return { action: "allow" }
  if (!role) return { action: "redirect", to: "/login" }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return { action: "redirect", to: "/dashboard" }
  }

  const isEditRoute = pathname.includes("/edit") || pathname.includes("/new")

  if (role === "GUEST" && isEditRoute) {
    return { action: "redirect", to: "/dashboard" }
  }

  return { action: "allow" }
}
```

- [ ] **Step 4: Run test to pass**

Run:
```bash
npm run test -- tests/unit/auth.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/access.ts tests/unit/auth.test.ts
git commit -m "feat: add access helper and tests"
```

### Task 6: Auth.js config and middleware

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/auth.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/auth/[...nextauth]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/middleware.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/types/next-auth.d.ts`

- [ ] **Step 1: Add NextAuth type augmentation**

Create `types/next-auth.d.ts`:
```ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: "ADMIN" | "USER" | "GUEST"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "USER" | "GUEST"
  }
}
```

- [ ] **Step 2: Add Auth.js config**

Create `lib/auth.ts`:
```ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.isActive) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        await prisma.session.create({
          data: { userId: user.id, ip: null, userAgent: null },
        })

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
  },
  pages: { signIn: "/login" },
})
```

- [ ] **Step 3: Add Auth.js route handler**

Create `app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 4: Add middleware**

Create `middleware.ts`:
```ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { evaluateAccess } from "@/lib/access"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role ?? null

  const decision = evaluateAccess({ pathname, role })
  if (decision.action === "allow") return NextResponse.next()

  return NextResponse.redirect(new URL(decision.to, req.url))
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 5: Commit auth**

```bash
git add lib/auth.ts app/api/auth/[...nextauth]/route.ts middleware.ts types/next-auth.d.ts
git commit -m "feat: add auth and middleware"
```

## Chunk 3: Categories, Pathologies, Protocols, Minimal UI

### Task 7: Categories API + unit tests (TDD)

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/categories/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/categories/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/lib/api.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/unit/categories.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/categories.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { buildCategoryTree, canDeleteCategory } from "@/lib/api"

describe("canDeleteCategory", () => {
  it("prevents deletion of locked categories", () => {
    expect(canDeleteCategory({ isLocked: true })).toBe(false)
  })

  it("allows deletion of unlocked categories", () => {
    expect(canDeleteCategory({ isLocked: false })).toBe(true)
  })
})

describe("buildCategoryTree", () => {
  it("nests children by parentId", () => {
    const flat = [
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Child", parentId: "1" },
    ]
    const tree = buildCategoryTree(flat)
    expect(tree).toHaveLength(1)
    expect(tree[0].children?.[0].id).toBe("2")
  })
})
```

- [ ] **Step 2: Run test to see failure**

Run:
```bash
npm run test -- tests/unit/categories.test.ts
```

Expected: FAIL with missing `canDeleteCategory`.

- [ ] **Step 3: Implement helper**

Create `lib/api.ts`:
```ts
export function canDeleteCategory(params: { isLocked: boolean }) {
  return params.isLocked === false
}

type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  children?: CategoryNode[]
}

export function buildCategoryTree(flat: CategoryNode[]) {
  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const item of flat) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of flat) {
    const node = map.get(item.id)!
    if (item.parentId) {
      const parent = map.get(item.parentId)
      if (parent) parent.children?.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
```

- [ ] **Step 4: Run test to pass**

Run:
```bash
npm run test -- tests/unit/categories.test.ts
```

Expected: PASS.

- [ ] **Step 5: Implement categories API**

Create `app/api/categories/route.ts`:
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { buildCategoryTree } from "@/lib/api"

export const GET = auth(async (req) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json(buildCategoryTree(categories))
})

export const POST = auth(async (req) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const created = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      parentId: body.parentId ?? null,
      section: body.section,
      isLocked: false,
    },
  })
  return NextResponse.json(created)
})
```

- [ ] **Step 6: Implement categories delete API**

Create `app/api/categories/[id]/route.ts`:
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { canDeleteCategory } from "@/lib/api"

export const DELETE = auth(async (req, ctx) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const category = await prisma.category.findUnique({ where: { id: ctx.params.id } })
  if (!category) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  if (!canDeleteCategory({ isLocked: category.isLocked })) {
    return NextResponse.json(
      { error: "Locked category", code: "LOCKED_CATEGORY" },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id: ctx.params.id } })
  return NextResponse.json({ ok: true })
})
```

- [ ] **Step 7: Commit categories API**

```bash
git add app/api/categories app/api/categories/[id]/route.ts lib/api.ts tests/unit/categories.test.ts
git commit -m "feat: categories api and guard"
```

### Task 8: Pathologies API + integration tests (TDD)

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/pathologies/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/pathologies.test.ts`

- [ ] **Step 1: Write failing integration test**

Create `tests/integration/pathologies.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"

describe("pathologies integration", () => {
  it("creates and reads pathology", async () => {
    const category = await prisma.category.create({
      data: { name: "Cat", slug: "cat", section: "CT" },
    })

    const created = await prisma.pathology.create({
      data: { title: "Test", content: "{}", categoryId: category.id },
    })

    const fetched = await prisma.pathology.findUnique({ where: { id: created.id } })
    expect(fetched?.title).toBe("Test")
  })
})
```

- [ ] **Step 2: Run test to see failure**

Run:
```bash
npm run test -- tests/integration/pathologies.test.ts
```

Expected: FAIL due to missing DB setup.

- [ ] **Step 3: Add API routes**

Create `app/api/pathologies/route.ts`:
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const GET = auth(async (req) => {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get("categoryId")
  const items = await prisma.pathology.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(items)
})

export const POST = auth(async (req) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const created = await prisma.pathology.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      content: body.content,
      textColor: body.textColor ?? null,
      emoji: body.emoji ?? null,
      categoryId: body.categoryId,
    },
  })
  return NextResponse.json(created)
})
```

Create `app/api/pathologies/[id]/route.ts`:
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const GET = auth(async (_req, ctx) => {
  const item = await prisma.pathology.findUnique({
    where: { id: ctx.params.id },
    include: { protocols: true },
  })
  return NextResponse.json(item)
})

export const PUT = auth(async (req, ctx) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.pathology.update({
    where: { id: ctx.params.id },
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      content: body.content,
      textColor: body.textColor ?? null,
      emoji: body.emoji ?? null,
      categoryId: body.categoryId,
    },
  })
  return NextResponse.json(updated)
})

export const DELETE = auth(async (req, ctx) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  await prisma.pathology.delete({ where: { id: ctx.params.id } })
  return NextResponse.json({ ok: true })
})
```

- [ ] **Step 4: Configure integration DB and re-run test**

Run:
```bash
docker-compose up -d
npx prisma generate
npx prisma migrate dev --name init
npm run test -- tests/integration/pathologies.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/pathologies/ app/api/pathologies/[id]/route.ts tests/integration/pathologies.test.ts
git commit -m "feat: pathologies api"
```

### Task 9: Protocols API + integration tests (TDD)

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/api/protocols/[id]/route.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/tests/integration/protocols.test.ts`

- [ ] **Step 1: Write failing integration test**

Create `tests/integration/protocols.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"

describe("protocols integration", () => {
  it("creates protocol with optional pathologyId", async () => {
    const protocol = await prisma.protocol.create({
      data: { title: "P1", content: "{}" },
    })
    expect(protocol.title).toBe("P1")
  })
})
```

- [ ] **Step 2: Run test to see failure**

Run:
```bash
npm run test -- tests/integration/protocols.test.ts
```

Expected: FAIL if DB not ready, otherwise pass after migration.

- [ ] **Step 3: Implement protocols API**

Create `app/api/protocols/route.ts`:
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const GET = auth(async (req) => {
  const { searchParams } = new URL(req.url)
  const pathologyId = searchParams.get("pathologyId")
  const items = await prisma.protocol.findMany({
    where: pathologyId ? { pathologyId } : undefined,
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(items)
})

export const POST = auth(async (req) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const created = await prisma.protocol.create({
    data: {
      title: body.title,
      content: body.content,
      pathologyId: body.pathologyId ?? null,
    },
  })
  return NextResponse.json(created)
})
```

Create `app/api/protocols/[id]/route.ts`:
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const GET = auth(async (_req, ctx) => {
  const item = await prisma.protocol.findUnique({ where: { id: ctx.params.id } })
  return NextResponse.json(item)
})

export const PUT = auth(async (req, ctx) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.protocol.update({
    where: { id: ctx.params.id },
    data: {
      title: body.title,
      content: body.content,
      pathologyId: body.pathologyId ?? null,
    },
  })
  return NextResponse.json(updated)
})

export const DELETE = auth(async (req, ctx) => {
  const session = req.auth
  if (!session) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  await prisma.protocol.delete({ where: { id: ctx.params.id } })
  return NextResponse.json({ ok: true })
})
```

- [ ] **Step 4: Run test to pass**

Run:
```bash
npm run test -- tests/integration/protocols.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/protocols app/api/protocols/[id]/route.ts tests/integration/protocols.test.ts
git commit -m "feat: protocols api"
```

### Task 10: Minimal UI and hooks

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/layout.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/providers.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(auth)/login/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/layout.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/dashboard/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/app/(app)/section/[categoryId]/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/layout/Sidebar.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/layout/Header.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/category/CategoryTree.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyForm.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/pathology/PathologyCard.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolForm.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/components/protocol/ProtocolCard.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useCategories.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/usePathologies.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/hooks/useProtocols.ts`

- [ ] **Step 1: Add providers and root layout**

Create `app/providers.tsx`:
```tsx
"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

Create `app/layout.tsx`:
```tsx
import "./globals.css"
import { ReactNode } from "react"
import Providers from "./providers"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Add login page**

Create `app/(auth)/login/page.tsx`:
```tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) setError("Неверный логин или пароль")
    else window.location.href = "/dashboard"
  }

  return (
    <div style={{ maxWidth: 360, margin: "60px auto" }}>
      <h1>Вход</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
      {error ? <p>{error}</p> : null}
    </div>
  )
}
```

- [ ] **Step 3: Add app layout with sidebar**

Create `app/(app)/layout.tsx`:
```tsx
import { ReactNode } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <Sidebar />
      <div>
        <Header />
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add dashboard and category page**

Create `app/(app)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return <div>КТ-Архив: панель</div>
}
```

Create `app/(app)/section/[categoryId]/page.tsx`:
```tsx
"use client"

import { useParams } from "next/navigation"
import { usePathologies } from "@/hooks/usePathologies"
import PathologyCard from "@/components/pathology/PathologyCard"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.categoryId as string
  const { data } = usePathologies(categoryId)

  return (
    <div>
      <h1>Патологии</h1>
      <div>
        {data?.map((p) => (
          <PathologyCard key={p.id} item={p} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add sidebar and basic tree**

Create `components/layout/Sidebar.tsx`:
```tsx
"use client"

import Link from "next/link"
import { useCategories } from "@/hooks/useCategories"
import CategoryTree from "@/components/category/CategoryTree"

export default function Sidebar() {
  const { data } = useCategories()

  return (
    <aside style={{ padding: 16, borderRight: "1px solid #ddd" }}>
      <h2>КТ-Архив</h2>
      <nav>
        <Link href="/dashboard">Главная</Link>
      </nav>
      <CategoryTree categories={data ?? []} />
    </aside>
  )
}
```

Create `components/layout/Header.tsx`:
```tsx
export default function Header() {
  return (
    <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <div>Поиск будет позже</div>
    </header>
  )
}
```

Create `components/category/CategoryTree.tsx`:
```tsx
"use client"

import Link from "next/link"

type Category = {
  id: string
  name: string
  parentId: string | null
  children?: Category[]
}

export default function CategoryTree({ categories }: { categories: Category[] }) {
  const roots = categories.filter((c) => !c.parentId)

  function renderNode(node: Category, depth: number) {
    return (
      <div key={node.id} style={{ paddingLeft: depth * 12 }}>
        <div>
          {node.children?.length ? (
            <strong>{node.name}</strong>
          ) : (
            <Link href={`/section/${node.id}`}>{node.name}</Link>
          )}
        </div>
        {node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div>
      {roots.map((root) => renderNode(root, 0))}
    </div>
  )
}
```

- [ ] **Step 6: Add minimal cards/forms**

Create `components/pathology/PathologyCard.tsx`:
```tsx
export default function PathologyCard({ item }: { item: { id: string; title: string } }) {
  return <div>{item.title}</div>
}
```

Create `components/pathology/PathologyForm.tsx`:
```tsx
"use client"

import { useState } from "react"
import { useCreatePathology } from "@/hooks/usePathologies"

export default function PathologyForm({ categoryId }: { categoryId: string }) {
  const [title, setTitle] = useState("")
  const create = useCreatePathology()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        create.mutate({ title, content: "{}", categoryId })
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
      <button type="submit">Создать</button>
    </form>
  )
}
```

Create `components/protocol/ProtocolCard.tsx`:
```tsx
export default function ProtocolCard({ item }: { item: { id: string; title: string } }) {
  return <div>{item.title}</div>
}
```

Create `components/protocol/ProtocolForm.tsx`:
```tsx
"use client"

import { useState } from "react"
import { useCreateProtocol } from "@/hooks/useProtocols"

export default function ProtocolForm() {
  const [title, setTitle] = useState("")
  const create = useCreateProtocol()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        create.mutate({ title, content: "{}" })
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Протокол" />
      <button type="submit">Создать</button>
    </form>
  )
}
```

- [ ] **Step 7: Add TanStack Query hooks**

Create `hooks/useCategories.ts`:
```ts
import { useQuery } from "@tanstack/react-query"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  })
}
```

Create `hooks/usePathologies.ts`:
```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function usePathologies(categoryId: string) {
  return useQuery({
    queryKey: ["pathologies", categoryId],
    queryFn: async () => (await fetch(`/api/pathologies?categoryId=${categoryId}`)).json(),
  })
}

export function useCreatePathology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/pathologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return res.json()
    },
    onSuccess: (_data, vars: any) => {
      qc.invalidateQueries({ queryKey: ["pathologies", vars.categoryId] })
    },
  })
}
```

Create `hooks/useProtocols.ts`:
```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useProtocols(pathologyId?: string) {
  const query = pathologyId ? `?pathologyId=${pathologyId}` : ""
  return useQuery({
    queryKey: ["protocols", pathologyId ?? "all"],
    queryFn: async () => (await fetch(`/api/protocols${query}`)).json(),
  })
}

export function useCreateProtocol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] })
    },
  })
}
```

- [ ] **Step 8: Commit minimal UI**

```bash
git add app components hooks
git commit -m "feat: minimal ui and hooks"
```

### Task 11: Add Vitest and Playwright configs

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/vitest.config.ts`
- Create: `/Users/joe/Documents/Vibe/kt-archive/.worktrees/codex-block1-plan/playwright.config.ts`

- [ ] **Step 1: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
})
```

- [ ] **Step 2: Add Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  use: {
    baseURL: "http://localhost:3000",
  },
})
```

- [ ] **Step 3: Commit test configs**

```bash
git add vitest.config.ts playwright.config.ts
git commit -m "chore: add test configs"
```

---

## Final Verification

- [ ] Run unit tests: `npm run test`
Expected: PASS.

- [ ] Run integration tests: `npm run test -- tests/integration/pathologies.test.ts tests/integration/protocols.test.ts`
Expected: PASS (requires running Postgres via docker-compose).

- [ ] Smoke run: `npm run dev`
Expected: app boots; login page accessible.
