---
status: active
milestone: M2
tickets: [26, 27, 28, 29]
---

# T-MEN brand and theme

## Problem

The web app uses the generic AquaMates look: a cool blue-grey page and lime action buttons. The club has a logo, T-MEN, a blue wave with a gold beer glass and a teal wordmark on warm cream. The app does not use it, and lime is not in the logo at all.

## Users

- Member, organizer and admin: want the site to look like their club.

## Behaviours

**Name.** The visible product name on web is T-MEN: page title, top bar, landing page, sign-in text, translated strings. The repo name stays `aquamates-web`. The mobile app is out of scope; it can take the same tokens later in its own repo.

**Logo.** A clean SVG rebuild of the logo (wave, beer glass, "T-MEN" wordmark), in a full lockup and a mark-only version, for light and dark backgrounds. The owner approves the SVG in the prototype before it ships. The files are committed in this public repo. The favicon comes from the mark, the page title is "T-MEN" and the browser theme colour matches the theme. No social-share image.

**Placement.** Top bar: mark plus wordmark at 768 px and up, the mark alone on phone. The full logo is large on the landing hero and on the sign-in and club-code screens.

**Tagline.** "Swim together, beer forever" on the landing hero, replacing "Swim together. Split the cost.". "Split costs" stays as a feature card. A Vietnamese version is drafted for the owner to review.

**Wave.** A soft wave divider on the landing hero and footer only. No other decoration.

**Light theme.** Warm cream page, white cards. Target values, tuned darker or lighter within the same hue only where a contrast check needs it:

- bg `#FBF8E5`, card `#FFFFFF`, raised `#F3EEDB`, border `#E3DBC0`
- text `#0B1B24`, muted `#54626B`
- brand blue `#1665B2` (links, active tab), teal `#097C99` (wordmark)
- accent gold `#FAC618` with dark text `#0B1B24`, gold border `#C99A00`
- swimming `#1665B2`, beer social gold (text version darkened, about `#9A6400`)
- success, danger as today, retuned for the cream background

**Dark theme.** A deep teal-navy built from the logo teal, not the old near-black:

- bg `#071820`, card `#0D2430`, raised `#143240`, border `#234656`
- text `#F4FAFB`, muted `#9DB8C4`
- brand a lighter blue (about `#5AA9F0`), same gold `#FAC618` with dark text, swimming that blue, beer social gold

**Buttons and chips.** Primary buttons and selected chips are gold with dark text, pill shaped. Lime is removed everywhere. Event categories: swimming is blue, beer social is gold.

**Type.** Plus Jakarta Sans stays.

**Contrast.** The contrast test is kept and tuned to the new colours at WCAG AA (4.5:1 for text, 3:1 for large text and UI borders). Gold is never used as text on cream.

**Verification.** The re-theme ticket attaches screenshots of every built screen at 375, 768 and 1280 px in light and dark.

**Ordering.** The prototype is updated and approved first. The re-theme runs before events (#8) and settings (#12), so every later screen is built on the new look. Screens already merged are restyled by the same work.

## Acceptance criteria

- AC-1: The repo holds SVG files for the full logo and the mark, for light and dark backgrounds, and the owner has approved them in the prototype.
- AC-2: The page title is "T-MEN", the favicon is the mark and the browser theme colour follows the theme.
- AC-3: In light mode the page background is the warm cream and cards are white; the light tokens match the values above (within the contrast tuning).
- AC-4: In dark mode the background is the deep teal-navy and the dark tokens match the values above.
- AC-5: Primary buttons and selected chips are gold with dark text in both themes, and no lime colour remains anywhere in the code.
- AC-6: Swimming events use the blue and beer social events use the gold, on home, event detail and history.
- AC-7: The top bar shows the mark plus wordmark at 768 px and up and the mark alone at 375 px.
- AC-8: The landing hero shows the tagline "Swim together, beer forever" with a wave divider on the hero and footer, and the Vietnamese tagline is in the translation files.
- AC-9: The sign-in and club-code screens show the full logo.
- AC-10: Every user-visible "AquaMates" string, English and Vietnamese, reads "T-MEN".
- AC-11: The contrast test passes at WCAG AA for every text and background pair, in both themes.
- AC-12: Screenshots of every built screen at 375, 768 and 1280 px, in light and dark, are attached to the ticket.
- AC-13: Lighthouse performance on the landing page is still at least 90.

## Out of scope

The mobile app, a social-share image, a custom domain or renaming the Cloudflare project (the address stays `aquamates-web.pages.dev`), new fonts, animations beyond the existing ones, any change in behaviour.

## Decisions

- 2026-11-06: The visible name on web is T-MEN. Why: the logo is the brand the owner chose; the repo name stays for continuity.
- 2026-11-06: Web only. Why: the mobile app lives in another repo outside this loop.
- 2026-11-06: Rebuild the logo as SVG and have the owner approve it. Why: the supplied PNG is flat on cream and cannot serve dark mode or a favicon.
- 2026-11-06: Warm cream light background and a teal-navy dark theme. Why: both come from the logo.
- 2026-11-06: Gold replaces lime; blue is brand; swimming blue, beer social gold. Why: the logo has no lime, and its wave and glass map onto the two event types.
- 2026-11-06: Keep Plus Jakarta Sans. Why: same bold geometric feel as the wordmark, and readable in the UI.
- 2026-11-06: Tagline "Swim together, beer forever". Why: the owner's wording.
- 2026-11-06: Mark plus wordmark in the top bar (mark alone on phone), full logo on landing and auth screens, wave divider on landing hero and footer. Why: brand where it matters, compact elsewhere.
- 2026-11-06: Favicon and theme colour, no social-share image; logo files committed to the public repo. Why: the site already shows the logo publicly; the share image can come later.
- 2026-11-06: Keep the contrast test at AA; gold never as text on cream. Why: stops the new palette becoming unreadable.
- 2026-11-06: Screenshots at three widths in both themes as evidence. Why: the owner approves the look from them.
- 2026-11-06: Keep the `aquamates-web.pages.dev` address. Why: a rename touches sign-in setup that is not finished yet.
- 2026-11-06: Prototype approval first, then the re-theme runs before #8 and #12. Why: avoids building those screens twice.
