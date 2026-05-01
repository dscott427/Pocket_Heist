# Plan: useHeists Hook

## Context

The `/heists` page is a stub with three section headings and no data. This plan wires it up by creating a `useHeists(mode)` custom hook that subscribes to Firestore in real-time using `onSnapshot`, returning a typed `Heist[]` array per mode. The hook is then called three times on the heists page to show active, assigned, and expired heist titles.

---

## Files to Create

| File | Purpose |
|---|---|
| `lib/useHeists.ts` | Custom hook — Firestore `onSnapshot` subscription |
| `tests/hooks/useHeists.test.tsx` | 9 tests using `renderHook` |

## Files to Modify

| File | Change |
|---|---|
| `app/(dashboard)/heists/page.tsx` | Add `'use client'`, call `useHeists` × 3, render titles + spinners |
| `firestore.indexes.json` | Add 2 composite indexes for active/assigned queries |

---

## Hook Design: `lib/useHeists.ts`

**Signature:** `useHeists(mode: 'active' | 'assigned' | 'expired'): { heists: Heist[], loading: boolean }`

**Imports to reuse:**
- `Heist`, `heistConverter`, `COLLECTIONS` from `@/types/firestore`
- `db` from `@/lib/firebase`
- `useAuth` from `@/lib/AuthContext`
- `collection`, `onSnapshot`, `query`, `where` from `firebase/firestore`

### State

| Variable | Initial | Purpose |
|---|---|---|
| `heists` | `[]` | Typed `Heist[]` from snapshot |
| `loading` | `true` | `false` after first snapshot (success or error) |

### Effect logic (`useEffect` deps: `[mode, user]`)

1. If `user` is null → set `heists: []`, `loading: false`, return early (no query)
2. Set `loading: true`
3. Build collection ref: `collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)`
4. Build query constraints per mode:
   - **active**: `where('assignedTo', '==', user.uid)` + `where('deadline', '>', new Date())`
   - **assigned**: `where('createdBy', '==', user.uid)` + `where('deadline', '>', new Date())`
   - **expired**: `where('deadline', '<', new Date())` — client-side filter `finalStatus !== null` in callback (avoids composite index)
5. Call `onSnapshot(q, successCb, errorCb)`
   - **successCb**: map `snapshot.docs` → `doc.data()` (converter already applied); for `expired` filter `finalStatus !== null` client-side; `setHeists(...)`, `setLoading(false)`
   - **errorCb**: `console.error(err)`, `setLoading(false)` (heists stays `[]`)
6. Return unsubscribe function as effect cleanup

---

## Page Update: `app/(dashboard)/heists/page.tsx`

- Add `'use client'` (required for hooks)
- Call `useHeists` once per section with destructured `{ heists, loading }` aliases
- Each section: heading → if loading show spinner → else render `<ul>` of `heist.title` per item (key = `heist.id`) → empty state "No heists" if array is empty
- **Spinner**: single `<div>` with Tailwind `animate-spin`, `rounded-full`, `border-2`, `border-t-transparent`, `w-5 h-5` and inline style `borderColor: 'var(--color-primary)'` — no new dependencies

---

## Firestore Indexes: `firestore.indexes.json`

Add two composite indexes to the `"indexes"` array:

| Query | Fields |
|---|---|
| active | `assignedTo ASC`, `deadline ASC` |
| assigned | `createdBy ASC`, `deadline ASC` |

Deploy with `firebase deploy --only firestore:indexes` after implementation. Until deployed, active/assigned queries fail at runtime — the `onSnapshot` error callback handles this gracefully (empty list, no crash).

---

## Tests: `tests/hooks/useHeists.test.tsx`

**Mocks needed:**
- `@/lib/firebase` → `{ db: {} }`
- `@/lib/AuthContext` → `useAuth` returns `{ user: { uid: 'user-1' } }` by default
- `firebase/firestore` → `collection` (returns mock ref with chainable `.withConverter()`), `query` (vi.fn), `where` (vi.fn), `onSnapshot` (vi.fn — returns mock unsubscribe, captures `onNext`/`onError` callbacks)

**`renderHook` usage:** `renderHook((mode) => useHeists(mode), { initialProps: 'active' })`; use `rerender('assigned')` to change mode.

| # | Test |
|---|---|
| 1 | Returns `{ heists: [], loading: false }` and never calls `onSnapshot` when user is null |
| 2 | Calls `onSnapshot` with `assignedTo == uid` + `deadline > Date` for `'active'` |
| 3 | Calls `onSnapshot` with `createdBy == uid` + `deadline > Date` for `'assigned'` |
| 4 | Calls `onSnapshot` with only `deadline < Date` for `'expired'` |
| 5 | Returns mapped `Heist[]` from snapshot data |
| 6 | `loading` is `true` before first snapshot, `false` after |
| 7 | Calls unsubscribe on unmount |
| 8 | Calls old unsubscribe + new `onSnapshot` when mode changes (`rerender`) |
| 9 | Filters out `finalStatus: null` docs client-side for `'expired'` mode |

---

## Verification

1. `npm run build` — no TypeScript errors
2. `npx vitest run tests/hooks/useHeists.test.tsx` — all 9 tests pass
3. `firebase deploy --only firestore:indexes` — deploy composite indexes
4. Manual: log in, visit `/heists` — three sections show titles or "No heists"; creating a heist appears in real time
