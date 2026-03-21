# KT-Archive: Pathology Creation Flow

**Date:** 2026-03-18

## Goal
Add an explicit and consistent path to create pathologies from the dashboard and section pages, with a dedicated creation page that allows selecting or changing the category path. Improve category navigation with collapsible sections and a mobile-friendly menu toggle.

## Approved UX Summary
- A **new creation page** (`/pathologies/new`) is the single entry point for creating pathologies.
- **“Добавить патологию”** appears on the dashboard and on each section page.
- If the user comes from a section, the category path is preselected but editable.
- After creation, redirect to the chosen section page (`/section/{categoryId}`).
- Category tree in the sidebar is collapsible (sections and subsections).
- On mobile, the sidebar becomes a toggleable menu panel.

## Routes & Navigation
- **New route:** `/pathologies/new`
- **CTA placement:**
  - Dashboard (`/dashboard`) — primary action button.
  - Section page (`/section/[categoryId]`) — primary action near header.
- **Query prefill:** `?categoryId=<id>` if navigated from a section.
- **Post-create redirect:** `/section/<selectedCategoryId>`

## Creation Page Layout
- Title: **“Создание патологии”**
- **Path selector block**
  - Dropdown: **Раздел** (КТ / Рентген)
  - Dropdown: **Категория** (любой уровень, включая корневые и вложенные)
  - Labels show **full path**: e.g. `Голова → Головной мозг`.
  - Category list is **filtered by selected section**.
  - Category list is a **flat list** ordered by the existing `order` field from the API (preorder traversal of the tree).
  - If `categoryId` is passed, category is selected and section is derived from its root ancestor.
  - Sections map to **root categories** (КТ / Рентген) seeded in the database.
  - Changing section resets category to that section root.
- **Form block**
  - Reuse existing `PathologyForm` content (name + rich description)
  - Submit button creates pathology in the selected category

## Sidebar Behavior
- Root sections (КТ / Рентген) are **collapsible**.
- Each node with children can be toggled (expand/collapse).
- Default: roots expanded, first-level children expanded, deeper levels collapsed. State is local to the session (no persistence).
- Active route auto-expands its ancestor chain so the current category is visible.
 - “Session” means while the app is open; state resets on full page reload.

## Mobile Menu
- On small screens, sidebar hidden by default.
- Header has a **“Меню”** button.
- Clicking shows sidebar as an overlay panel; clicking again closes it.
- Overlay closes on route change or tap outside.
 - Breakpoint: mobile behavior applies below `lg`.
 - Collapse state persists while the menu is open/closed within the session (no storage).
 - Minimal accessibility: `aria-label` on menu button and overlay closes on `Esc`.
 - Menu button lives in the **global app header** (the shared header in `(app)` layout), so it appears on dashboard, sections, and the new creation page.

## Access Rules
- Creation page is available for `ADMIN` and `USER` roles.
- `GUEST` is redirected to `/dashboard` (existing policy for edit/new).
 - “Добавить патологию” CTA is hidden for `GUEST`.

## Data & Logic Notes
- Category tree already available via `/api/categories` and `buildCategoryTree`.
- Category path labels can be built client-side by traversing tree.
- Creation uses existing `useCreatePathology` hook.
- `/section/[categoryId]` accepts **any** category id (root or nested) and lists pathologies for that category.

## Error Handling
- If `categoryId` in query is missing or invalid, default to the **first root category by `order`** and auto-select it. Show a subtle hint: “Раздел выбран по умолчанию, при необходимости выберите другой путь.”
- If categories fail to load, show a non-blocking error state with retry and disable creation until categories are available.
- If create API fails, show inline error message; keep form values intact.
- Submit is disabled until a category is selected and categories are loaded.
 - If a section has no descendants, the root category remains selectable (so creation is still possible). If the entire category list is empty, show empty state “Категории не найдены” and keep submit disabled.
 - Invalid `categoryId` remains in the URL (no cleanup), since selection state is handled in UI.

## Out of Scope
- No change to pathology detail page.
- No permission model changes beyond existing middleware rules.
