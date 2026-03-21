# КТ-Архив — дизайн‑спецификация (блок 2)

Дата: 2026-03-18  
Проект: `/Users/joe/Documents/Vibe/kt-archive`

## 1. Цель и границы блока 2

**Цель блока 2:** добавить контентные модули — rich‑text (TipTap), комментарии, TODO и поиск по патологиям/протоколам.  
**Не входит:** медиа (загрузка/сжатие), админка, бэкапы, финальная дизайн‑полировка.

## 2. Ключевые решения

- **Rich‑text:** TipTap, хранение JSON + извлечённый plain‑text для поиска.
- **Комментарии:** 1 уровень ответов (треды глубиной 1).
- **TODO:** статус `open/done` через `isDone`, дедлайн `dueAt` опционально.
- **Поиск:** Postgres FTS (`tsvector`) по патологиям и протоколам, синхронизация через триггеры.
- **Доступ:** все изменения запрещены для роли `GUEST` на сервере.

## 3. Данные и схема

### 3.1 Pathology / Protocol
- Добавить поля:
  - `contentJson` (JSON, TipTap).
  - `contentText` (String) — plain‑text для FTS.
- Миграция данных:
  - существующее `content` переносим в `contentText` при миграции (если не пусто).
  - `contentJson` заполняется при первом сохранении в редакторе.

### 3.2 Comment
- Добавить `parentId` (nullable, self‑relation), **макс. один уровень**.
- Ограничение: если `parentId` уже задан, новый ответ запрещён.

### 3.3 Todo
- Добавить `dueAt` (nullable DateTime).

### 3.4 Search
- `tsvector` для `Pathology` и `Protocol` на основе `title`, `subtitle` (только патологии) и `contentText`.
- Триггеры `BEFORE INSERT/UPDATE` обновляют `searchVector`.
- Запросы через `plainto_tsquery('russian', q)`.

## 4. Архитектура и API

### 4.1 Editor
- Компонент `RichEditor` возвращает:
  - `contentJson`
  - `contentText` (экстракция из TipTap JSON)
- Формы отправляют оба значения.

### 4.2 API эндпоинты

**Патологии**
- `POST/PUT /api/pathologies` — принимает `contentJson`, `contentText`.
- `GET /api/pathologies` — возвращает оба поля.

**Протоколы**
- `POST/PUT /api/protocols` — принимает `contentJson`, `contentText`.
- `GET /api/protocols` — возвращает оба поля.

**Комментарии**
- `GET /api/comments?pathologyId=...`
- `POST /api/comments` (создание, `parentId` опционально)
- `PUT/DELETE /api/comments/[id]`

**TODO**
- `GET /api/todos?pathologyId=...&protocolId=...`
- `POST /api/todos`
- `PUT/DELETE /api/todos/[id]`

**Поиск**
- `GET /api/search?q=...` возвращает:
  - `pathologies: []`
  - `protocols: []`

### 4.3 Доступ
- Все мутирующие запросы запрещены для `GUEST` на сервере.
- UI скрывает кнопки, но окончательная проверка в API.

## 5. UI‑сценарии (минимальный UI)

- **Редактор патологии:**
  - `title`, `subtitle`, `emoji`, `textColor`, `content` (TipTap).
  - Блок **Комментарии** (с ответами 1 уровня).
  - Блок **TODO**.
- **Редактор протокола:**
  - `title`, `content` (TipTap).
  - Блок **TODO**.
- **Поиск:**
  - `/search` с одним полем, результаты по патологиям и протоколам.

## 6. Ошибки и валидации

- `400` — попытка ответить на ответ (`parentId` у родителя уже задан).
- `401/403` — стандартно по ролям.
- `500` — общий “Что-то пошло не так”.

## 7. Тестовая стратегия

- Unit: правила доступа, ограничение на второй уровень комментариев.
- Integration: поиск (FTS) возвращает ожидаемые сущности.
- Playwright (позже): базовый сценарий редактирования и поиска.

## 8. Не‑цели блока 2

- Медиа (загрузка/сжатие).
- Админка/роли/аудит.
- Финальная дизайн‑полировка.
