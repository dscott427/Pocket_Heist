# Spec for auth-forms

branch: claude/feature/auth-forms
figma_component (if used): N/A

## Summary

Add functional authentication forms to the `/login` and `/signup` pages. Each page should render a form with email and password fields, a toggle to show/hide the password, and a submit button. On submission, form data is logged to the console. Users should be able to navigate easily between the two forms.

## Functional Requirements

- The `/login` page displays a login form with:
  - An email input field
  - A password input field with a show/hide password toggle icon
  - A "Login" submit button
  - A link to navigate to the `/signup` page
- The `/signup` page displays a signup form with:
  - An email input field
  - A password input field with a show/hide password toggle icon
  - A "Sign Up" submit button
  - A link to navigate to the `/login` page
- Clicking the show/hide password icon toggles the password field between `type="password"` and `type="text"`
- On form submission, the email and password values are logged to the browser console
- Default browser form submission (page reload) is prevented
- Navigation between login and signup is clearly presented (e.g. "Don't have an account? Sign up")

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User submits the form with empty fields — should still log (no validation required for now)
- Password visibility toggle should reset if the user navigates between forms
- Both pages should work independently without shared state

## Acceptance Criteria

- `/login` renders a form with email field, password field, show/hide toggle, and a "Login" button
- `/signup` renders a form with email field, password field, show/hide toggle, and a "Sign Up" button
- Submitting either form logs `{ email, password }` to the console and does not reload the page
- The password field respects the show/hide toggle state
- Each page includes a working link to switch to the other form

## Open Questions

- Should the two forms share a common `AuthForm` component, or remain as separate page-level implementations? Separate pages.
- Should there be any basic client-side validation (e.g. required fields) in a future iteration? yes

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Login form renders email field, password field, and submit button
- Signup form renders email field, password field, and submit button
- Password field is hidden by default (`type="password"`)
- Clicking the show/hide toggle changes the password field to `type="text"` and back
- Submitting the login form calls `console.log` with the entered email and password
- Submitting the signup form calls `console.log` with the entered email and password
- Each form contains a link to the other form page
