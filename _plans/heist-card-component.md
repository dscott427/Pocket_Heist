# Plan: Heist Card Component

## Context

The `/heists` page currently renders a plain list of heist titles with no visual treatment. This adds a `HeistCard` component to display active and assigned heists in a styled 3-column card grid, plus a `HeistCardSkeleton` for the loading state. Expired heists are removed from the page entirely.

---

## Files to Create

| File | Purpose |
|---|---|
| `components/HeistCard/HeistCard.tsx` | Main card component |
| `components/HeistCard/HeistCardSkeleton.tsx` | Skeleton placeholder component |
| `components/HeistCard/HeistCard.module.css` | Styles for both HeistCard and HeistCardSkeleton |
| `components/HeistCard/index.ts` | Barrel: default `HeistCard`, named `HeistCardSkeleton` |
| `tests/components/HeistCard/HeistCard.test.tsx` | Card unit tests |
| `tests/components/HeistCard/HeistCardSkeleton.test.tsx` | Skeleton unit tests |

## Files to Modify

| File | Change |
|---|---|
| `app/(dashboard)/heists/page.tsx` | Replace inline `Spinner`/`HeistList` with `HeistCard` + `HeistCardSkeleton` in a grid; remove expired section |
| `app/globals.css` | Add `.heist-grid` layout utility |

---

## Step-by-Step Implementation

### 1. `HeistCard.module.css`
- `@reference "../../app/globals.css"` at top
- `.cardLink` — `display: block`, no underline, colour inherit
- `.card` — `bg-light/30 border border-lighter/30 rounded-[10px] p-4 flex flex-col gap-2 cursor-pointer hover:bg-light/50 transition-colors`
- `.header` — flex row, `items-start justify-between gap-2 flex-wrap`
- `.title` — `text-heading font-semibold text-base`
- `.badge` — pill: `rounded-full px-2 py-0.5 text-xs font-semibold text-dark shrink-0`
- `.badgeActive` — `bg-success`
- `.badgeAssigned` — `bg-primary`
- `.meta` — `flex flex-col gap-1 mt-1`
- `.metaRow` — `text-sm text-body`
- `.skeletonBar` — `bg-lighter rounded-md` + `animation: pulse 1.5s ease-in-out infinite`
- `@keyframes pulse` — `0%, 100% { opacity: 1 } 50% { opacity: 0.4 }`

### 2. `HeistCard.tsx`
- Props: `{ heist: Heist; status: 'Active' | 'Assigned' }`
- Import `Heist` from `@/types/firestore/heist`
- Outer element: `<Link href={/heists/${heist.id}} className={styles.cardLink}>`
- Inside: `<article className={styles.card}>`
  - Header row: `<h3 className={styles.title}>{heist.title}</h3>` + badge `<span className={status === 'Active' ? styles.badgeActive : styles.badgeAssigned}>{status}</span>`
  - Meta section: three `.metaRow` divs for deadline (`heist.deadline.toLocaleDateString()`), assigned to (`heist.assignedToCodename`), created by (`heist.createdByCodename`)

### 3. `HeistCardSkeleton.tsx`
- Non-interactive `<div className={styles.card}>` (no Link wrapper)
- Header row: wide shimmer bar (title placeholder, `w-3/5 h-5`) + narrow pill shimmer (badge placeholder, `w-1/5 h-5 rounded-full`)
- Three shimmer bars at `h-4` with widths `w-1/2`, `w-2/5`, `w-1/3`
- All shimmer elements use `styles.skeletonBar` plus a single width class

### 4. `index.ts`
- Default export: `HeistCard`
- Named export: `HeistCardSkeleton`

### 5. `globals.css` — add after `.preview-grid`
- `.heist-grid` — `@apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3;`

### 6. `app/(dashboard)/heists/page.tsx`
- Remove inline `Spinner` and `HeistList` components
- Remove `useHeists('expired')` call and expired section
- Import `HeistCard, { HeistCardSkeleton } from '@/components/HeistCard'`
- Each section (active, assigned) renders:
  - While loading → `<div className="heist-grid">` with 3× `<HeistCardSkeleton />`
  - Empty → `<p>No heists</p>`
  - Loaded → `<div className="heist-grid">` mapping heists to `<HeistCard heist={h} status="Active|Assigned" key={h.id} />`

---

## Test Plan

**`HeistCard.test.tsx`** — mock `next/navigation` + `@/lib/firebase` + `firebase/firestore`; define a `makeHeist()` factory:
- Renders heist title in the document
- Renders a link (`getByRole('link')`) with `href="/heists/${heist.id}"`
- Shows "Active" badge when `status="Active"`
- Shows "Assigned" badge when `status="Assigned"`
- Renders formatted deadline string
- Renders `assignedToCodename` and `createdByCodename`

**`HeistCardSkeleton.test.tsx`**:
- Renders without throwing
- Contains no link element (`queryByRole('link')` is null)
- Contains no heist title or metadata text

---

## Verification

1. `npm test` — all existing tests pass, new HeistCard tests pass
2. `npm run dev` — visit `/heists` while logged in:
   - Grid shows 3 columns on desktop, 1 on mobile
   - Cards load with skeletons first, then real cards
   - Expired section is gone
   - Clicking any card navigates to `/heists/:id` (empty page)
3. `npm run lint` — no lint errors
