# Project Structure

Основной рабочий проект теперь находится в этой папке:
- `/Users/joe/Documents/Vibe/vibe_kt-archive`

## Основные папки
- `app/` — страницы Next.js App Router и API routes
- `components/` — интерфейсные компоненты
- `hooks/` — клиентские React hooks
- `lib/` — общая логика, утилиты, Prisma helpers
- `prisma/` — схема базы данных, миграции, seed
- `public/` — статические файлы
- `uploads/` — локальные медиафайлы для разработки
- `tests/` — unit и integration тесты
- `docs/` — документация и заметки

## Дополнительные важные файлы
- `README.md` — как запускать и разворачивать проект
- `kt_archive_spec.md` — спецификация проекта
- `docker-compose.yml` и `docker-compose.prod.yml` — локальный и production запуск
- `Dockerfile` — сборка production-образа
- `PROJECT_STRUCTURE.md` — этот файл с краткой картой проекта

## Почему раньше проект был в скрытой папке
Рабочая версия велась через git worktree в:
- `kt-archive/.worktrees/codex-ui-polish`

Это техническая структура для параллельной работы с отдельной веткой. Для обычной разработки она запутывает, поэтому проект перенесен в обычную понятную папку.

## Что намеренно не перенесено
- `.git` и старая git-структура
- `.next/` — кэш сборки
- `node_modules/` — зависимости, ставятся заново через `npm install`
- временные архивы деплоя

## Локальный запуск
```bash
cd /Users/joe/Documents/Vibe/vibe_kt-archive
npm install
npm run dev
```
