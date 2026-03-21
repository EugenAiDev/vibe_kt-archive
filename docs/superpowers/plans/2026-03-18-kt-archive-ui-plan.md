# KT-Archive UI Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Tech Grid UI design (mint palette, IBM Plex Sans, balanced density, soft buttons) across the app without changing business logic.

**Architecture:** Update global styles and layout components first (tokens + base layout), then restyle pages and components with consistent spacing and card patterns. Preserve existing structure and data flow.

**Tech Stack:** Next.js 16, Tailwind 4, shadcn/ui, CSS variables.

---

## File Structure

Create or modify these files in `/Users/joe/Documents/Vibe/kt-archive`:

- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/globals.css`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/layout.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/layout/Sidebar.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/layout/Header.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/pathology/PathologyCard.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/comments/CommentsPanel.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/todos/TodoList.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/media/MediaGallery.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/pathology/PathologyForm.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/protocol/ProtocolForm.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(auth)/login/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/dashboard/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/section/[categoryId]/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/search/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/protocols/[id]/page.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/components/ui/section.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/components/ui/page-shell.tsx`

---

## Chunk 1: Global Tokens + Base Layout

### Task 1: Apply UI tokens and font

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/globals.css`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/layout.tsx`

- [ ] **Step 1: Add font import and CSS variables**

Add IBM Plex Sans + mint palette tokens:
```css
:root {
  --bg: #f6fbf9;
  --card: #ffffff;
  --border: #d5eee7;
  --text: #0f172a;
  --muted: #486b5d;
  --accent: #0f766e;
  --accent-soft: #ccfbf1;
  --danger: #dc2626;
  --shadow: 0 10px 24px rgba(15, 118, 110, 0.08);
  --radius: 12px;
}
```

- [ ] **Step 2: Apply base styles**

```css
body {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  background: linear-gradient(180deg, #f6fbf9 0%, #ffffff 100%);
  color: var(--text);
}
```

- [ ] **Step 3: Layout wrapper**

Update `app/layout.tsx` to set background + include font link tag.

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/app/globals.css /Users/joe/Documents/Vibe/kt-archive/app/layout.tsx
git commit -m "feat: add global ui tokens"
```

---

## Chunk 2: Layout Components

### Task 2: Restyle sidebar + header

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/layout/Sidebar.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/layout/Header.tsx`
- Create: `/Users/joe/Documents/Vibe/kt-archive/components/ui/page-shell.tsx`

- [ ] **Step 1: Create PageShell**

```tsx
// layout wrapper: sidebar + main column
```

- [ ] **Step 2: Style Sidebar**

```tsx
// mint background, hover states, balanced spacing
```

- [ ] **Step 3: Style Header**

```tsx
// search input, top bar with soft accent
```

- [ ] **Step 4: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/components/layout /Users/joe/Documents/Vibe/kt-archive/components/ui/page-shell.tsx
git commit -m "feat: restyle layout"
```

---

## Chunk 3: Content Cards + Forms

### Task 3: Create Section wrapper + update cards

**Files:**
- Create: `/Users/joe/Documents/Vibe/kt-archive/components/ui/section.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/pathology/PathologyCard.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/comments/CommentsPanel.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/todos/TodoList.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/components/media/MediaGallery.tsx`

- [ ] **Step 1: Section component**

```tsx
// card-like section with header + body
```

- [ ] **Step 2: Restyle cards and lists**

```tsx
// use Section + balanced spacing
```

- [ ] **Step 3: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/components
/git commit -m "feat: restyle content cards"
```

---

## Chunk 4: Pages

### Task 4: Restyle pages

**Files:**
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(auth)/login/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/dashboard/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/section/[categoryId]/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/search/page.tsx`
- Modify: `/Users/joe/Documents/Vibe/kt-archive/app/(app)/protocols/[id]/page.tsx`

- [ ] **Step 1: Login**
```tsx
// centered card, mint accents
```

- [ ] **Step 2: Dashboard**
```tsx
// summary cards + quick links
```

- [ ] **Step 3: Section & Search**
```tsx
// list cards with header sections
```

- [ ] **Step 4: Protocol page**
```tsx
// apply same layout, sections
```

- [ ] **Step 5: Commit**

```bash
git add /Users/joe/Documents/Vibe/kt-archive/app
/git commit -m "feat: restyle pages"
```

---

## Chunk 5: Verification

### Task 5: Run lint + visual smoke

- [ ] **Step 1: Lint**

Run:
```bash
npm run lint
```

- [ ] **Step 2: Visual smoke**

Run:
```bash
npm run dev
```

Expected: layout renders with mint palette, IBM Plex Sans, sidebar layout.

- [ ] **Step 3: Commit any fixes**

```bash
git add /Users/joe/Documents/Vibe/kt-archive

git commit -m "chore: stabilize ui polish"
```
