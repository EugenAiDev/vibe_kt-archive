# КТ-Архив

Full-stack приложение для хранения патологий, протоколов, комментариев, задач и медиа по КТ и рентгенологии.

## Что внутри

- `Next.js 16` + `TypeScript`
- `Prisma` + `PostgreSQL`
- `NextAuth` credentials auth
- `TanStack Query`
- `Sharp` для изображений
- `fluent-ffmpeg` + installers для видео
- mobile-first интерфейс на русском языке

## Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Поднять базу:

```bash
cp .env.example .env
docker compose up -d
```

3. Применить миграции и сиды:

```bash
npx prisma migrate deploy
npx prisma db seed
```

4. Запустить приложение:

```bash
npm run dev
```

## Основные команды

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run db:migrate
npm run db:seed
npm run db:reset
```

## Production deployment

### Вариант через Docker Compose

1. Подготовить `.env` на сервере.
2. Убедиться, что заданы:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL`
   - `ADMIN_NAME`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
3. Запустить:

```bash
docker compose up -d db
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build app
```

Приложение:
- само применит `prisma migrate deploy`
- выполнит `prisma db seed`
- стартует в `standalone` режиме

### Что монтируется

- БД хранится в `kt_archive_db`
- Медиа хранятся в `kt_archive_uploads`

## Пользователь по умолчанию

После `seed` создается один активный администратор из переменных окружения:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Тестовый пользователь больше не создается.

## Очистка базы

Полный сброс базы с пересозданием схемы и сидов:

```bash
npm run db:reset
```

Если используется Docker Compose, сначала проверьте, что `DATABASE_URL` указывает на нужную базу.

## Проверка готовности

- health endpoint: `/api/health`
- пользовательская админка: `/admin`
- управление пользователями: `/admin/users`
- журнал входов: `/admin/logs`
