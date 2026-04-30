# Spec for Create Heist Form

branch: claude/feature/create-heist-form
figma_component (if used): N/A

## Summary

Add a working form to `app/(dashboard)/heists/create/page.tsx` that allows authenticated users to create a new heist. The form fields map to the user-facing fields of the `CreateHeistInput` interface. On submission, a document is written to the Firestore `heists` collection — with `createdAt` and `deadline` set programmatically — and the user is redirected to `/heists`. The assignee dropdown is populated by fetching user documents from the Firestore `users` collection.

## Functional Requirements

- The form must include the following user-facing fields:
  - **Title** — short text input, required
  - **Description** — textarea, required
  - **Assign To** — dropdown/select populated from the Firestore `users` collection, displaying each user's codename; required
- The following fields are set programmatically (not shown to the user):
  - `createdBy` — uid of the currently authenticated user (from `useAuth`)
  - `createdByCodename` — codename of the currently authenticated user (fetched from `users` collection)
  - `assignedTo` — uid of the user selected in the dropdown
  - `assignedToCodename` — codename of the selected user
  - `createdAt` — set to `serverTimestamp()` at submission time
  - `deadline` — set to `serverTimestamp()` at submission time (or a programmatically derived value)
  - `finalStatus` — always `null` on creation
- The `CreateHeistInput` interface must be used to type the document payload before calling `addDoc`
- The `COLLECTIONS` constant from `types/firestore/index.ts` must be used for all collection name references — no hardcoded strings
- On a successful Firestore write, redirect the user to `/heists` using the Next.js router
- While submitting, disable the submit button and show a loading indicator
- If the Firestore write fails, display an inline error message — do not redirect
- Fetch the users list once on page load; show a loading state on the dropdown while fetching
- Style the form using existing shared CSS classes (`.auth-form`, `.form-field`, `.form-label`, `.form-input`, `.form-submit`, `.form-error`) and the project's CSS Module conventions

## Possible Edge Cases

- The `users` collection is empty — show a "No users available" message in the dropdown and prevent submission
- The current user's document is not found in the `users` collection — handle gracefully (surface an error or fall back to uid)
- Network failure during the Firestore write — show an error, preserve form state, allow retry
- The users fetch fails — show an error state in the dropdown and prevent submission
- Duplicate heist titles — no uniqueness constraint; allow duplicates

## Acceptance Criteria

- Visiting `/heists/create` renders a form with title, description, and assign-to fields
- Submitting the form with valid inputs creates a document in the `heists` Firestore collection
- The document contains the correct `createdBy`, `createdByCodename`, `assignedTo`, and `assignedToCodename` values
- `createdAt` and `deadline` are present on the document and set programmatically (not from user input)
- `finalStatus` is `null` on the new document
- After a successful submit, the user lands on `/heists`
- If the write fails, an inline error is shown and the user stays on the form
- The submit button is disabled during submission
- The assign-to dropdown is populated from the `users` collection

## Open Questions

- What fields exist on a user document in the `users` collection? (Assumed: `uid`, `codename` — confirm before implementing) yes uid and codename
- Should the currently authenticated user appear in the assign-to dropdown, or only other users? Don't show current user
- What value should `deadline` be set to programmatically — `serverTimestamp()`, a fixed offset (e.g. 7 days from now), or something else? fixed at +48 hours
- Should there be a cancel/back button on the form? cancel

## Testing Guidelines

Create a test file at `tests/components/CreateHeistForm.test.tsx` covering:

- Renders title, description, and assign-to fields
- Submit button is disabled while the form is submitting
- Displays an inline error message when the Firestore write fails
- Calls `addDoc` with a payload matching `CreateHeistInput` on successful submission
- Redirects to `/heists` after a successful submission
- Shows a loading/disabled state on the dropdown while users are being fetched
- Shows a fallback message in the dropdown when the users list is empty
