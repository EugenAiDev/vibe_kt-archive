# КТ-Архив — Техническая спецификация

> Документ предназначен для AI coding agent. Все решения явные — никаких допущений.

---

## 1. Обзор проекта

**Название:** КТ-Архив  
**Тип:** Full-stack веб-приложение (Next.js, mobile-first)  
**Язык интерфейса:** Русский  
**Развёртывание:** VPS (Ubuntu 22.04), 30 ГБ диск  
**Доступ:** Браузер с любого устройства (ПК, планшет, телефон)  

### Цели
- Структурированное хранение медицинских знаний по КТ и рентгенологии
- Быстрый доступ к протоколам описаний с копированием в один клик
- Полнотекстовый поиск по патологиям, протоколам, комментариям
- Ролевой доступ (Admin / User / Guest)
- Экономия дискового пространства через сжатие медиафайлов

---

## 2. Стек технологий

| Слой | Технология | Версия |
|---|---|---|
| Framework | Next.js | 15.x |
| Язык | TypeScript | 5.x |
| UI Kit | shadcn/ui + Tailwind CSS | tailwind 3.x |
| Rich-text редактор | TipTap | 2.x |
| ORM | Prisma | 5.x |
| База данных | PostgreSQL | 16.x |
| Аутентификация | Auth.js (NextAuth) | v5.x |
| Клиентский стейт | TanStack Query | v5.x |
| Сжатие изображений | Sharp | latest |
| Сжатие видео | fluent-ffmpeg + ffmpeg-static | latest |
| Unit/Integration тесты | Vitest + @testing-library/react | latest |
| E2E тесты | Playwright | latest |
| Процесс-менеджер на VPS | PM2 | latest |
| Node.js | Node.js | 20.x LTS |

---

## 3. Структура папок и файлов

```
kt-archive/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  # Страница входа
│   ├── (app)/
│   │   ├── layout.tsx                    # Основной layout с сайдбаром
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Главная страница
│   │   ├── section/
│   │   │   └── [categoryId]/
│   │   │       ├── page.tsx              # Страница категории (список патологий)
│   │   │       └── [pathologyId]/
│   │   │           └── page.tsx          # Страница патологии
│   │   ├── protocols/
│   │   │   ├── page.tsx                  # Все протоколы
│   │   │   └── [protocolId]/
│   │   │       └── page.tsx              # Просмотр/редактирование протокола
│   │   ├── todos/
│   │   │   └── page.tsx                  # Все ToDo/Напоминания
│   │   ├── search/
│   │   │   └── page.tsx                  # Глобальный поиск
│   │   └── admin/
│   │       ├── page.tsx                  # Админ-панель
│   │       ├── users/
│   │       │   └── page.tsx              # Управление пользователями
│   │       └── logs/
│   │           └── page.tsx              # Журнал входов
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts              # Auth.js handler
│   │   ├── categories/
│   │   │   └── route.ts                  # GET дерева, POST новой папки
│   │   ├── pathologies/
│   │   │   ├── route.ts                  # GET список, POST создание
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, DELETE патологии
│   │   ├── protocols/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── comments/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── todos/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── search/
│   │   │   └── route.ts                  # Full-text search
│   │   ├── upload/
│   │   │   ├── image/
│   │   │   │   └── route.ts              # Загрузка + сжатие изображений
│   │   │   └── video/
│   │   │       └── route.ts              # Загрузка + сжатие видео (SSE прогресс)
│   │   ├── disk/
│   │   │   └── route.ts                  # Использование диска (только ADMIN)
│   │   └── admin/
│   │       └── users/
│   │           └── route.ts              # CRUD пользователей
│   └── layout.tsx                        # Root layout (ThemeProvider)
├── components/
│   ├── ui/                               # shadcn/ui компоненты (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx                   # Дерево навигации
│   │   ├── Header.tsx                    # Шапка с поиском и переключателем темы
│   │   └── ThemeToggle.tsx               # Кнопка день/ночь
│   ├── pathology/
│   │   ├── PathologyCard.tsx
│   │   ├── PathologyForm.tsx             # Форма создания/редактирования
│   │   ├── PathologyView.tsx             # Страница просмотра патологии
│   │   └── MediaUploader.tsx             # Загрузка фото/видео с прогресс-баром
│   ├── protocol/
│   │   ├── ProtocolCard.tsx
│   │   ├── ProtocolForm.tsx
│   │   └── CopyButton.tsx                # Кнопка копирования текста
│   ├── editor/
│   │   └── RichTextEditor.tsx            # TipTap редактор
│   ├── comments/
│   │   └── CommentSection.tsx            # Комментарии + заметки
│   ├── todos/
│   │   └── TodoItem.tsx
│   ├── search/
│   │   └── SearchResults.tsx             # Три секции результатов
│   ├── admin/
│   │   ├── DiskUsageWidget.tsx
│   │   ├── UserTable.tsx
│   │   └── ActivityLog.tsx
│   └── category/
│       ├── CategoryTree.tsx              # Рекурсивное дерево
│       └── CreateFolderDialog.tsx
├── lib/
│   ├── auth.ts                           # Auth.js конфигурация
│   ├── prisma.ts                         # Prisma клиент (singleton)
│   ├── sharp.ts                          # Утилиты сжатия изображений
│   ├── ffmpeg.ts                         # Утилиты сжатия видео
│   ├── search.ts                         # FTS запросы
│   ├── disk.ts                           # Чтение использования диска
│   └── utils.ts                          # Общие утилиты
├── hooks/
│   ├── useCategories.ts
│   ├── usePathology.ts
│   ├── useSearch.ts
│   └── useUpload.ts                      # Хук с прогресс-баром
├── middleware.ts                          # Защита роутов по ролям
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                           # Сидирование системных категорий
├── public/
│   └── favicon.ico
├── uploads/                              # Медиафайлы (вне репозитория, .gitignore)
│   ├── images/
│   └── videos/
├── scripts/
│   └── backup.sh                         # Скрипт резервного копирования
├── tests/
│   ├── unit/
│   │   ├── auth.test.ts
│   │   ├── sharp.test.ts
│   │   ├── categories.test.ts
│   │   └── search.test.ts
│   ├── integration/
│   │   ├── pathologies.test.ts
│   │   ├── protocols.test.ts
│   │   └── comments.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── pathology.spec.ts
│       ├── upload.spec.ts
│       ├── search.spec.ts
│       └── protocol-copy.spec.ts
├── .env.example
├── .env.local                            # Не коммитить
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 4. Схема базы данных (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Пользователи и роли ───────────────────────────────────────────

enum Role {
  ADMIN
  USER
  GUEST
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hash
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

// ─── Дерево категорий ─────────────────────────────────────────────

enum SectionType {
  CT       // КТ
  XRAY     // Рентген
}

model Category {
  id         String      @id @default(cuid())
  name       String
  slug       String
  parentId   String?
  parent     Category?   @relation("CategoryChildren", fields: [parentId], references: [id])
  children   Category[]  @relation("CategoryChildren")
  section    SectionType
  isLocked   Boolean     @default(false) // true = системная папка, нельзя удалить
  order      Int         @default(0)
  createdAt  DateTime    @default(now())

  pathologies Pathology[]
}

// ─── Патологии ────────────────────────────────────────────────────

model Pathology {
  id          String   @id @default(cuid())
  title       String
  subtitle    String?
  content     String   // TipTap JSON (строка)
  textColor   String?  // HEX цвет, напр. "#FF0000"
  emoji       String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Full-text search вектор (обновляется триггером)
  searchVector Unsupported("tsvector")?

  media       Media[]
  protocols   Protocol[]
  comments    Comment[]
  todos       Todo[]

  @@index([searchVector], type: Gin)
}

// ─── Медиафайлы ───────────────────────────────────────────────────

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
  filename     String    // имя файла в /uploads/
  size         Int       // байты после сжатия
  createdAt    DateTime  @default(now())
}

// ─── Протоколы ────────────────────────────────────────────────────

model Protocol {
  id          String    @id @default(cuid())
  title       String
  content     String    // TipTap JSON
  pathologyId String?
  pathology   Pathology? @relation(fields: [pathologyId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  searchVector Unsupported("tsvector")?

  todos       Todo[]

  @@index([searchVector], type: Gin)
}

// ─── Комментарии ──────────────────────────────────────────────────

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

// ─── ToDo ─────────────────────────────────────────────────────────

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

### PostgreSQL миграция: FTS триггеры

```sql
-- Выполнить после prisma migrate deploy

-- Расширения
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Конфигурация русского поиска с unaccent
CREATE TEXT SEARCH CONFIGURATION russian_unaccent (COPY = russian);
ALTER TEXT SEARCH CONFIGURATION russian_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, russian_stem;

-- Триггер для Pathology
CREATE OR REPLACE FUNCTION update_pathology_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('russian_unaccent', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('russian_unaccent', coalesce(NEW.subtitle, '')), 'B') ||
    setweight(to_tsvector('russian_unaccent', coalesce(
      regexp_replace(NEW.content::text, '<[^>]+>', ' ', 'g'), ''
    )), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pathology_search_vector_update
BEFORE INSERT OR UPDATE ON "Pathology"
FOR EACH ROW EXECUTE FUNCTION update_pathology_search_vector();

-- Аналогичные триггеры для Protocol и Comment
-- (заменить имена таблиц/функций соответственно)
```

---

## 5. API Endpoints

### Аутентификация
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| POST | `/api/auth/signin` | Вход (Auth.js) | Все |
| POST | `/api/auth/signout` | Выход | Авт. |

### Категории
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/categories` | Полное дерево категорий | USER+ |
| POST | `/api/categories` | Создать папку | USER+ |
| DELETE | `/api/categories/:id` | Удалить папку (только `is_locked=false`) | USER+ |

### Патологии
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/pathologies?categoryId=` | Список патологий в категории | USER+ |
| POST | `/api/pathologies` | Создать патологию | USER+ |
| GET | `/api/pathologies/:id` | Одна патология со связями | USER+ |
| PUT | `/api/pathologies/:id` | Редактировать | USER+ |
| DELETE | `/api/pathologies/:id` | Удалить | USER+ |

### Протоколы
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/protocols` | Все протоколы (с фильтром `?pathologyId=`) | USER+ |
| POST | `/api/protocols` | Создать протокол | USER+ |
| GET | `/api/protocols/:id` | Один протокол | USER+ |
| PUT | `/api/protocols/:id` | Редактировать | USER+ |
| DELETE | `/api/protocols/:id` | Удалить | USER+ |

### Медиафайлы
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| POST | `/api/upload/image` | Загрузить изображение (Sharp → WebP) | USER+ |
| POST | `/api/upload/video` | Загрузить видео (FFmpeg, SSE прогресс) | USER+ |
| DELETE | `/api/media/:id` | Удалить медиафайл | USER+ |

### Комментарии
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/comments?pathologyId=` | Комментарии к патологии | USER+ |
| POST | `/api/comments` | Создать | USER+ |
| PUT | `/api/comments/:id` | Редактировать (только свои или ADMIN) | USER+ |
| DELETE | `/api/comments/:id` | Удалить (только свои или ADMIN) | USER+ |

### ToDo
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/todos` | Все открытые задачи | USER+ |
| POST | `/api/todos` | Создать | USER+ |
| PUT | `/api/todos/:id` | Редактировать / закрыть | USER+ |
| DELETE | `/api/todos/:id` | Удалить | USER+ |

### Поиск
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/search?q=текст` | FTS по трём сущностям | USER+ |

### Администрирование
| Метод | URL | Описание | Доступ |
|---|---|---|---|
| GET | `/api/admin/users` | Список пользователей | ADMIN |
| POST | `/api/admin/users` | Создать пользователя | ADMIN |
| PUT | `/api/admin/users/:id` | Изменить роль / статус | ADMIN |
| DELETE | `/api/admin/users/:id` | Удалить пользователя | ADMIN |
| GET | `/api/disk` | Статус диска (df) | ADMIN |

---

## 6. Middleware и защита роутов

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Незащищённые роуты
  if (pathname.startsWith("/login")) return NextResponse.next()

  // Нет сессии → редирект на логин
  if (!session) return NextResponse.redirect(new URL("/login", req.url))

  // Только ADMIN может заходить в /admin
  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // GUEST не может заходить на страницы создания/редактирования
  const mutatingPaths = ["/new", "/edit"]
  if (session.user.role === "GUEST" && mutatingPaths.some(p => pathname.includes(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
```

---

## 7. Логика ключевых модулей

### 7.1 Сжатие изображений (lib/sharp.ts)

```typescript
import sharp from "sharp"
import path from "path"
import { randomUUID } from "crypto"

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "images")

export async function processImage(buffer: Buffer, originalName: string): Promise<{
  filename: string
  size: number
}> {
  const filename = `${randomUUID()}.webp`
  const outputPath = path.join(UPLOADS_DIR, filename)

  await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath)

  const { size } = await fs.promises.stat(outputPath)
  return { filename, size }
}
```

### 7.2 Сжатие видео с SSE прогресс-баром (api/upload/video/route.ts)

```typescript
// Загрузка видео с прогресс-баром через Server-Sent Events
// 1. Клиент POST /api/upload/video с файлом
// 2. Сервер отвечает stream (SSE): { type: "progress", percent: number }
// 3. По завершении: { type: "done", filename, size }
// 4. По ошибке: { type: "error", message }

// FFmpeg команда:
// ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k output.mp4
// Парсить строки stderr для получения прогресса: "frame=..., time=..."
```

### 7.3 Full-text поиск (lib/search.ts)

```typescript
export async function globalSearch(query: string) {
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .map(w => `${w}:*`)
    .join(" & ")

  const [pathologies, protocols, comments] = await Promise.all([
    prisma.$queryRaw`
      SELECT id, title, subtitle,
        ts_rank("searchVector", to_tsquery('russian_unaccent', ${tsQuery})) AS rank
      FROM "Pathology"
      WHERE "searchVector" @@ to_tsquery('russian_unaccent', ${tsQuery})
      ORDER BY rank DESC LIMIT 20
    `,
    prisma.$queryRaw`
      SELECT id, title,
        ts_rank("searchVector", to_tsquery('russian_unaccent', ${tsQuery})) AS rank
      FROM "Protocol"
      WHERE "searchVector" @@ to_tsquery('russian_unaccent', ${tsQuery})
      ORDER BY rank DESC LIMIT 20
    `,
    prisma.$queryRaw`
      SELECT id, text, "pathologyId",
        ts_rank("searchVector", to_tsquery('russian_unaccent', ${tsQuery})) AS rank
      FROM "Comment"
      WHERE "searchVector" @@ to_tsquery('russian_unaccent', ${tsQuery})
      ORDER BY rank DESC LIMIT 20
    `,
  ])

  return { pathologies, protocols, comments }
}
```

### 7.4 Использование диска (lib/disk.ts)

```typescript
import { execSync } from "child_process"

export function getDiskUsage(): { used: number; total: number; percent: number } {
  const output = execSync("df -BG /").toString()
  const lines = output.trim().split("\n")
  const parts = lines[1].split(/\s+/)
  const total = parseInt(parts[1])
  const used = parseInt(parts[2])
  const percent = Math.round((used / total) * 100)
  return { used, total, percent }
}
```

---

## 8. Компоненты UI — пошаговые инструкции

### 8.1 Дерево категорий (CategoryTree.tsx)

1. Получить полное дерево через `GET /api/categories`
2. Рекурсивно рендерить узлы: каждый узел — `<Collapsible>` из shadcn/ui
3. Корневые разделы (КТ / Рентген) — нередактируемые заголовки
4. Системные папки (`isLocked=true`) — без кнопки удаления
5. Пользовательские папки — кнопка `⋯` с меню (Переименовать / Удалить)
6. Кнопка `+ Новая папка` в конце каждого уровня → открывает `<CreateFolderDialog>`
7. Активный маршрут выделяется фоновым цветом

### 8.2 Форма патологии (PathologyForm.tsx)

1. Поля: Название (`Input`), Подзаголовок (`Input`), Эмодзи/иконка (`EmojiPicker`), Цвет текста (`ColorPicker` — HTML input type="color"), Описание (`RichTextEditor`)
2. Выбор расположения: `<Select>` с деревом категорий (только листовые узлы и папки)
3. При создании: `POST /api/pathologies`
4. При редактировании: `PUT /api/pathologies/:id`
5. После сохранения — редирект на страницу патологии

### 8.3 Загрузчик медиа (MediaUploader.tsx)

1. `<input type="file" accept="image/*,video/*" multiple>`
2. Для каждого файла определять тип (image/video) по MIME
3. `POST /api/upload/image` или `/api/upload/video`
4. Для изображений — `onUploadProgress` в axios для прогресс-бара
5. Для видео — подписаться на SSE поток, читать `percent` из событий
6. Показывать `<Progress value={percent} />` из shadcn/ui для каждого файла
7. После загрузки — превью изображения, иконка видео

### 8.4 Страница патологии (PathologyView.tsx)

Блоки на странице (в порядке сверху вниз):
1. Заголовок с эмодзи + цветом + кнопка `Редактировать`
2. Rich-text описание (рендеринг TipTap JSON как HTML)
3. Секция медиафайлов: сетка фото (lightbox при клике) + список видео
4. Секция протоколов: карточки с кнопкой `Копировать текст` и `Открыть`
5. Секция комментариев: список + форма добавления
6. Секция ToDo: список задач + форма добавления

### 8.5 TipTap редактор (RichTextEditor.tsx)

Подключить расширения:
- `StarterKit` (базовое форматирование)
- `TextStyle` + `Color` (цвет текста)
- `TextAlign` (выравнивание)
- `Underline`
- `Link`
- `Emoji` (через `@tiptap-pro/extension-emoji` или open-source альтернативу)

Тулбар: Жирный, Курсив, Подчёркнутый, Заголовки H1-H3, Список, Ссылка, Цвет текста, Эмодзи

### 8.6 Страница поиска (SearchResults.tsx)

1. URL: `/search?q=запрос`
2. Дебаунс 300ms при вводе
3. `GET /api/search?q=` → три массива
4. Три секции с заголовками: **Патологии**, **Протоколы**, **Комментарии**
5. Каждый результат — кликабельная карточка → переход к сущности
6. Подсветка найденного слова в тексте результата

---

## 9. Аутентификация (lib/auth.ts)

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user || !user.isActive) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        // Логировать вход
        await prisma.session.create({
          data: { userId: user.id, ip: null, userAgent: null }
        })

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    }
  },
  pages: { signIn: "/login" }
})
```

---

## 10. Темы (день/ночь)

1. В `app/layout.tsx` обернуть всё в `<ThemeProvider attribute="class">` из `next-themes`
2. `ThemeToggle.tsx` — кнопка с иконками Sun/Moon, вызывает `setTheme("dark" | "light")`
3. В `tailwind.config.ts` установить `darkMode: "class"`
4. Все компоненты использовать CSS переменные shadcn/ui (`bg-background`, `text-foreground` и т.д.)

---

## 11. Сидирование базы данных (prisma/seed.ts)

При первом запуске засеять:
1. Пользователь-администратор: `admin@kt-archive.local`, пароль из `.env` (`ADMIN_PASSWORD`)
2. Структура категорий — создать все системные разделы с `isLocked: true`:

```
КТ (CT)
├── Голова
│   ├── Головной мозг
│   ├── Кости черепа
│   └── ППН (пазухи носа)
├── Шея
├── ОГК
│   ├── Лёгкие
│   ├── Средостение
│   └── Грудная клетка
├── Пояс верхних конечностей
│   ├── Плечо
│   ├── Ключица
│   ├── Локоть
│   ├── Предплечье
│   └── Кисть
├── Органы брюшной полости
├── Органы малого таза
├── Пояс нижних конечностей
│   ├── ТБС (тазобедренные суставы)
│   ├── Бедро
│   ├── Колено
│   ├── Голень
│   └── Стопа
├── Кости таза
└── Позвоночник
    ├── Шейный отдел
    ├── Грудной отдел
    ├── Пояснично-крестцовый отдел
    └── Копчик

Рентген (XRAY) — та же структура
```

---

## 12. Управление состоянием

- **TanStack Query**: все серверные данные (патологии, протоколы, категории, поиск)
- **Ключи запросов**: `["pathologies", categoryId]`, `["pathology", id]`, `["protocols"]`, `["search", query]`
- **Инвалидация**: после мутаций (POST/PUT/DELETE) инвалидировать соответствующие ключи
- **Локальный стейт**: форма, прогресс загрузки — `useState` / `useReducer`
- **Тема**: `next-themes` (хранится в `localStorage`)

---

## 13. Обработка ошибок

| Ситуация | Поведение |
|---|---|
| Неавторизованный запрос | 401 + редирект на `/login` |
| Недостаточно прав | 403 + toast "Недостаточно прав" |
| Файл слишком большой (>500MB для видео, >50MB для фото) | 413 + сообщение в UI |
| Ошибка FFmpeg | SSE событие `{ type: "error" }` + toast |
| Удаление locked-категории | 400 + toast "Системная папка не может быть удалена" |
| Ошибка поиска | Пустые результаты + сообщение "Ничего не найдено" |
| Все ошибки API | Формат `{ error: string, code: string }` |

---

## 14. Тестирование

### Unit тесты (Vitest)

**tests/unit/auth.test.ts**
- Корректная проверка роли ADMIN/USER/GUEST
- Middleware блокирует GUEST на `/edit` роутах
- Middleware блокирует не-ADMIN на `/admin`

**tests/unit/sharp.test.ts**
- `processImage()` возвращает файл `.webp`
- Результирующий файл меньше оригинала
- Размер не увеличивается при изображении < 1920px

**tests/unit/categories.test.ts**
- Нельзя удалить категорию с `isLocked=true`
- Дерево строится корректно при рекурсии

**tests/unit/search.test.ts**
- `globalSearch()` возвращает три секции
- Пустой запрос возвращает пустые массивы

### Integration тесты (Vitest + Prisma test DB)

**tests/integration/pathologies.test.ts**
- CREATE патологии → проверить поле `searchVector` не null
- UPDATE → `searchVector` обновляется
- DELETE → связанные Media и Comments удаляются (cascade)

**tests/integration/protocols.test.ts**
- Создать протокол с `pathologyId` → появляется в списке патологии
- Создать без `pathologyId` → появляется в общем списке протоколов

**tests/integration/comments.test.ts**
- USER может редактировать только свои комментарии
- ADMIN может редактировать любой комментарий

### E2E тесты (Playwright)

**tests/e2e/auth.spec.ts**
- Вход с верными данными → редирект на `/dashboard`
- Вход с неверным паролем → сообщение об ошибке
- Выход → редирект на `/login`

**tests/e2e/pathology.spec.ts**
- Создать патологию → она отображается в дереве
- Открыть патологию → все блоки присутствуют

**tests/e2e/upload.spec.ts**
- Загрузить изображение → прогресс-бар появляется и исчезает → превью отображается
- Загрузить видео → SSE прогресс обновляется

**tests/e2e/search.spec.ts**
- Ввести запрос → три секции в результатах
- Клик на результат → переход к сущности

**tests/e2e/protocol-copy.spec.ts**
- Открыть протокол → нажать "Копировать текст" → текст в буфере обмена

---

## 15. Настройка окружения

### .env.example
```env
# База данных
DATABASE_URL="postgresql://kt_user:password@localhost:5432/kt_archive"

# Auth.js
AUTH_SECRET="сгенерировать: openssl rand -hex 32"

# Первый администратор (для seed)
ADMIN_EMAIL="admin@kt-archive.local"
ADMIN_PASSWORD="StrongPassword123!"

# Пути
UPLOADS_DIR="/var/www/kt-archive/uploads"
MAX_IMAGE_SIZE_MB=50
MAX_VIDEO_SIZE_MB=500

# URL приложения
NEXTAUTH_URL="https://your-vps-domain.com"
```

### Установка PostgreSQL расширений
```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### Запуск на VPS
```bash
# 1. Клонировать репозиторий
git clone ... && cd kt-archive

# 2. Установить зависимости
npm install

# 3. Настроить .env.local

# 4. Создать папки для загрузок
mkdir -p uploads/images uploads/videos

# 5. Мигрировать БД
npx prisma migrate deploy

# 6. Выполнить SQL для FTS триггеров
psql $DATABASE_URL -f prisma/fts-triggers.sql

# 7. Засеять начальные данные
npx prisma db seed

# 8. Собрать приложение
npm run build

# 9. Запустить через PM2
pm2 start npm --name "kt-archive" -- start
pm2 save
pm2 startup
```

---

## 16. Резервное копирование (scripts/backup.sh)

```bash
#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/tmp/kt-backup-$DATE"
REMOTE_HOST="user@your-local-pc"
REMOTE_PATH="/backups/kt-archive"

mkdir -p $BACKUP_DIR

# Дамп PostgreSQL
pg_dump $DATABASE_URL > "$BACKUP_DIR/db-$DATE.sql"

# Копия медиафайлов
cp -r /var/www/kt-archive/uploads "$BACKUP_DIR/uploads"

# Архивирование
tar -czf "/tmp/kt-backup-$DATE.tar.gz" -C /tmp "kt-backup-$DATE"

# Отправка на локальный диск
rsync -avz "/tmp/kt-backup-$DATE.tar.gz" "$REMOTE_HOST:$REMOTE_PATH/"

# Очистка
rm -rf $BACKUP_DIR "/tmp/kt-backup-$DATE.tar.gz"

echo "Backup completed: $DATE"
```

Добавить в cron:
```bash
crontab -e
# Каждое воскресенье в 3:00
0 3 * * 0 /var/www/kt-archive/scripts/backup.sh >> /var/log/kt-backup.log 2>&1
```

---

## 17. Рекомендуемая конфигурация MCP

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/var/www/kt-archive"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "${DATABASE_URL}" }
    }
  }
}
```

MCP `prisma` и `shadcn` использовать через CLI команды в процессе разработки:
- `npx prisma generate` / `npx prisma migrate dev`
- `npx shadcn@latest add [component]`

---

## 18. Критерии приёмки

| Функция | Критерий |
|---|---|
| Аутентификация | Вход работает, неверный пароль отклоняется, роли ограничивают доступ |
| Дерево категорий | Системные папки нельзя удалить, новые папки создаются и удаляются |
| Патологии | CRUD работает, rich-text сохраняется и рендерится корректно |
| Медиафайлы | Изображения конвертируются в WebP, видео перекодируется, прогресс-бар показывается |
| Протоколы | Копирование текста работает, протокол виден в папке "Все протоколы" и в патологии |
| Поиск | Три секции, поиск по части слова работает на русском |
| Тёмная тема | Переключение сохраняется между сессиями |
| Диск | Индикатор в админ-панели показывает актуальные данные |
| Резервное копирование | Скрипт выполняется без ошибок, файл появляется на удалённом диске |

---

## 19. Пользовательские истории

1. **Как USER** я хочу создать патологию с описанием и фото, чтобы быстро найти её потом
2. **Как USER** я хочу добавить протокол описания и скопировать его в один клик
3. **Как USER** я хочу найти патологию по части названия или текста
4. **Как USER** я хочу оставить комментарий к патологии с напоминанием
5. **Как ADMIN** я хочу видеть кто заходил в систему и сколько места занято на диске
6. **Как GUEST** я хочу просматривать патологии и протоколы без возможности изменений
7. **Как USER** я хочу пользоваться приложением на телефоне так же удобно, как на ПК
