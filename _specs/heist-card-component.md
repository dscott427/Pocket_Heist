# Spec for Heist Card Component

branch: claude/feature/heist-card-component
figma_component: HeistCard / ExpiredHeistCard

## Summary

Implement a `HeistCard` component that displays a single heist's key details. Cards are shown on the `/heists` page for active and assigned heists only (expired heists are excluded). Heist titles link to the `/heists/:id` detail page (no content on that page yet). Cards are laid out in a responsive 3-column grid. A `HeistCardSkeleton` component mirrors the same grid layout and is shown while heist data is loading.

## Functional Requirements

- Create a `HeistCard` component that accepts a heist object as a prop and renders its details
- Display only heists with a status of `active` or `assigned` on the `/heists` page — exclude `expired` heists
- The heist title must be a link that navigates to `/heists/:id`
- Display a status badge on the card indicating the heist status (e.g. Active, Assigned)
- Show relevant heist metadata: payout, crew size, and a countdown timer or deadline
- Cards are displayed in a 3-column grid layout on the `/heists` page
- Create a `HeistCardSkeleton` component that renders a placeholder card in the same dimensions and grid layout while heists are loading
- The `/heists/:id` detail page should exist as a route but contain no content yet

## Figma Design Reference

- File: [PocketHeist — Page Designs](https://www.figma.com/design/nSeivtsGU27DTIBwt9X4QG/PocketHeist?node-id=14-3&t=Bjovvat70WBNsOHK-0)
- Component: HeistCard (active/assigned state) and ExpiredHeistCard (collapsed state)
- Key visual constraints:
  - Card background: `var(--color-light)` at ~30% opacity; border: `var(--color-lighter)` at ~30% opacity; border radius: `10px`
  - Padding: `1rem` on all sides; inner section gap: `~0.5rem`
  - Title text: `var(--color-heading)` (white), `font-semibold`, ~`text-base` or `text-lg`
  - Metadata labels and values: `var(--color-body)` (`#99A1AF`), `text-sm`
  - Status badge: pill shape — Active uses `var(--color-success)`, Expired uses `var(--color-error)`
  - All accent highlights use `var(--color-primary)` (#C27AFF); no new theme tokens needed
  - Icons are custom SVG assets (clock, crew/people, payout/currency) — export from Figma or use inline SVGs

## Possible Edge Cases

- Heist list is empty after filtering — show an appropriate empty state message
- Loading state before heists are fetched — show `HeistCardSkeleton` components in the grid
- Heist has missing or null metadata fields (e.g. no crew size, no deadline)
- A heist transitions from active to expired while the user is on the page — it should disappear from the list
- Very long heist titles should truncate or wrap gracefully without breaking the card layout

## Acceptance Criteria

- `HeistCard` renders correctly for both `active` and `assigned` statuses
- `expired` heists do not appear in the `/heists` page grid
- Clicking the heist title navigates to `/heists/:id` (page can be empty)
- The grid displays 3 columns and adapts responsively on smaller screens
- `HeistCardSkeleton` matches the card dimensions and fills the same 3-column grid
- Skeleton is shown while heists are loading and replaced by real cards once loaded
- Status badge reflects the correct state with correct colour token
- All existing heist-related tests continue to pass

## Open Questions

- Should the crew size and payout fields always be visible, or only for assigned heists? always
- Is the countdown timer live (real-time decrement) or a static deadline date display? static
- What is the responsive breakpoint behaviour — does the grid collapse to 2 or 1 column on mobile? 1
- Should clicking anywhere on the card navigate to the detail page, or only the title link? anywhere
- What exact opacity values are used for the card background and border — confirm with designer? you choose something good

## Testing Guidelines

Create a test file at `tests/components/HeistCard/HeistCard.test.tsx` and `tests/components/HeistCardSkeleton/HeistCardSkeleton.test.tsx`. Cover the following without going too heavy:

- Renders the heist title as a link to `/heists/:id`
- Renders the correct status badge for `active` and `assigned` statuses
- Does not render when status is `expired` (or verify filtering logic in the heists page)
- `HeistCardSkeleton` renders without errors and contains the expected placeholder structure
- Grid layout container renders the correct number of skeletons during loading
