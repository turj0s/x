## Goal

Reframe the current events platform as a "CV Maker" website by rewriting user-facing text only. No components, layouts, styling, routes, or database changes.

## Scope

Text-only edits in existing files. Every event-related label becomes a CV-related label, keeping the same structure and tone.

## Mapping

| Current concept | New copy |
|---|---|
| Event | CV / Resume |
| Discover events | Browse CV templates |
| Create event | Create CV |
| My events | My CVs |
| Event name | CV title |
| Event creator ("BY ...") | Author ("BY ...") |
| About this event | About this CV |
| Event location / address | Contact address |
| Get directions | Download CV |
| Register for event | Use this template |
| Happening now / LIVE badge | Featured / NEW badge |
| Browse (rotating badge) | Templates (rotating badge) |
| Countdown to event | Kept as-is (copy only, no logic) — labels reframed as "Available in…" |

## Files to update (copy only)

- `index.html` — `<title>` and meta description → "CV Maker | Build a professional resume in minutes".
- `src/components/SEOHead.tsx` — brand suffix `EventHub` → `CV Maker`; default keywords → cv, resume, templates.
- `src/pages/Discover.tsx` — hero headline, subcopy, section titles, empty states.
- `src/components/EventsCarousel.tsx` — card copy stays structural; no visible strings to change beyond alt text.
- `src/components/EventDetailPage.tsx` — loading text, not-found headline/body, "Browse Events" button → "Browse Templates".
- `src/components/EventHeader.tsx` — "BY {creator}" → "BY {author}" (label only).
- `src/components/EventDescription.tsx` — "ABOUT THIS EVENT" → "ABOUT THIS CV".
- `src/components/EventLocation.tsx` — "GET DIRECTIONS" → "DOWNLOAD CV".
- `src/components/EventMeta.tsx` — date/time labels reframed as "Updated" / "Version".
- `src/components/EventCountdown.tsx` — "HAPPENING NOW" stays via badge; countdown labels reframed to "AVAILABLE IN".
- `src/components/EventRegistration.tsx` — "Register" / "Registered" → "Use template" / "Saved".
- `src/components/Navbar.tsx` — DISCOVER → TEMPLATES, CREATE EVENT → CREATE CV, MY EVENTS → MY CVS.
- `src/pages/CreateEvent.tsx` / `src/pages/EditEvent.tsx` — form labels, placeholders, toasts, page titles.
- `src/pages/MyEvents.tsx` — page title "My Events" → "My CVs"; tab labels "Created by me" / "Registered" → "Created by me" / "Saved".
- `src/pages/Auth.tsx`, `src/components/AuthSheet.tsx` — brand text only.
- `src/pages/Admin.tsx`, `src/pages/NotFound.tsx` — brand text only.

## Out of scope (explicit)

- No changes to routes, component structure, Tailwind classes, colors, fonts, or spacing.
- No DB schema changes; table/column names in code stay as-is.
- No new features, no data seeding, no image swaps.
- The calendar-based date filter on Discover stays functional as-is; only surrounding copy changes.

## Notes / caveats

- Some concepts (calendar of event dates, countdown, address + map) don't map cleanly to a CV product. Copy will be reframed but the underlying UI will still look event-shaped. A proper CV maker would need real design/logic changes in a follow-up.
- Database still stores "events" — this is invisible to end users.
