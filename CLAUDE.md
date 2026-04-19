# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm test         # Run Vitest test suite
```

To run a single test file:

```bash
npx vitest run tests/components/Navbar.test.tsx
```

## Architecture

**Pocket Heist** is a Next.js 16 (App Router) heist/mission management app. It is a starter project with UI scaffolding but no backend or auth implementation yet.

### Route Groups

Two route groups organize pages:

- `app/(public)/` — Unauthenticated pages: landing (`/`), `/login`, `/signup`, `/preview`
- `app/(dashboard)/` — Authenticated layout with Navbar; contains `/heists`, `/heists/create`, `/heists/[id]`

The dashboard layout wraps pages in `<Navbar>` + `<main>`. The public layout does not.

### Styling

- **Tailwind CSS v4** via PostCSS — configured entirely in `app/globals.css` using the `@theme` directive (no `tailwind.config.js`)
- Custom theme tokens: `primary` (#C27AFF), `secondary` (#FB64B6), `dark/light/lighter` for backgrounds, `success`/`error`, `heading`/body text colors, Inter font
- Shared layout utility classes (`.page-content`, `.center-content`, `.form-title`) are defined in `globals.css`
- Component-scoped styles use CSS Modules (e.g., `Navbar.module.css`) with `@apply` and `@reference`

### Components

Components live in `components/<Name>/` with an `index.ts` barrel export. The only current shared component is `Navbar`.

### Testing

Tests live in `tests/` mirroring the `components`source structure. Vitest runs in jsdom with globals enabled — no imports needed for `describe`/`it`/`expect`. `@testing-library/jest-dom` matchers are available via `vitest.setup.ts`.

### Additional Coding Preferences

-Do NOT apply TailWind classes directly in component templates unless essential or just need 1 at most. If an element needs more than a single tailwind class, combine them into a custom class using the `@apply` directive.
-Use minimal project dependencies where possible.
-Use the `git switch -c` command to swith to a new branch, NOT `git checkout`.
