# Spec for useHeists Hook

branch: claude/feature/use-heists-hook
figma_component (if used): N/A

## Summary

Create a `useHeists` custom React hook that provides real-time Firestore data for heist documents. The hook accepts a single mode argument (`'active'`, `'assigned'`, or `'expired'`) and returns a typed array of `Heist` objects by subscribing to the appropriate Firestore query using `onSnapshot`. Once the hook exists, wire it into `app/(dashboard)/heists/page.tsx` to display the titles of all three result sets.

## Functional Requirements

- The hook is named `useHeists` and lives in `lib/useHeists.ts`
- It accepts a single required argument of type `'active' | 'assigned' | 'expired'`
- It returns an array of `Heist` objects (typed using the existing `Heist` interface from `types/firestore/heist.ts`)
- It uses Firestore's `onSnapshot` for real-time updates (not `getDocs`)
- The listener is cleaned up on unmount via the unsubscribe function returned by `onSnapshot`
- The hook reads the current user's uid from `useAuth()` to scope queries
- Query logic per mode:
  - **`active`** — heists where `assignedTo == currentUser.uid` AND `deadline > now`
  - **`assigned`** — heists where `createdBy == currentUser.uid` AND `deadline > now`
  - **`expired`** — heists where `deadline < now` AND `finalStatus != null` (regardless of user)
- The `heistConverter` from `types/firestore/heist.ts` must be applied to the collection reference so that Firestore Timestamps are automatically converted to `Date` objects on read
- The `COLLECTIONS` constant from `types/firestore/index.ts` must be used for the collection name — no hardcoded strings
- The hook re-runs the query (new `onSnapshot`) whenever the `mode` argument or the current user changes
- The hook should also return a `loading` boolean that is `true` until the first snapshot is received
- `app/(dashboard)/heists/page.tsx` must be updated to call `useHeists` three times (once per mode) and render each heist's `title` under its respective section heading (`Your Active Heists`, `Heists You've Assigned`, `All Expired Heists`)

## Possible Edge Cases

- User is not authenticated when the hook runs — return an empty array and do not attempt a Firestore query
- A query returns zero results — render an empty list gracefully (no error, no crash)
- The `mode` argument changes at runtime — the previous listener must be unsubscribed before the new one is set up
- Firestore query errors — handle in the `onSnapshot` error callback and return an empty array; log the error to the console
- The `expired` query does not filter by user — ensure no uid-based filtering is applied for this mode

## Acceptance Criteria

- Calling `useHeists('active')` returns only heists assigned to the current user with a future deadline
- Calling `useHeists('assigned')` returns only heists created by the current user with a future deadline
- Calling `useHeists('expired')` returns all heists (any user) with a past deadline and a non-null `finalStatus`
- All returned heist objects are typed as `Heist` with `createdAt` and `deadline` as `Date` instances (not Firestore Timestamps)
- The `/heists` page renders three sections, each showing heist titles from the appropriate query
- The listener is torn down when the component using the hook unmounts
- `loading` is `true` before the first snapshot fires and `false` after

## Open Questions

- Should `loading` per section be surfaced in the UI (e.g. a skeleton or spinner), or is a plain empty list sufficient while loading? spinner
- Should the expired query be paginated or capped to avoid returning unbounded result sets? No

## Testing Guidelines

Create a test file at `tests/hooks/useHeists.test.tsx` covering:

- Returns an empty array and does not call `onSnapshot` when the user is not authenticated
- Calls `onSnapshot` with the correct Firestore query constraints for `'active'` mode
- Calls `onSnapshot` with the correct Firestore query constraints for `'assigned'` mode
- Calls `onSnapshot` with the correct Firestore query constraints for `'expired'` mode
- Returns the mapped `Heist` array from the snapshot data
- `loading` is `true` before the first snapshot and `false` after
- Unsubscribes the listener on unmount
- Re-subscribes with a new query when `mode` changes
