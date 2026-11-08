---
status: active
milestone: M1
tickets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 46, 49, 50]
---

# AquaMates web

## Problem

AquaMates is a club app for swimming and social events, but the only client is an iOS app. Members without an iPhone cannot RSVP, split costs or see their history. A web version on the same backend reaches them with a link.

## Users

- Member: signs in, joins the club with the club code, RSVPs to events, sees expenses, history and stats.
- Organizer: creates, edits and cancels events, sets the cost split and uploads a bank QR image.
- Admin: same, plus club member management.

## Behaviours

**Same product, same data.** The web app has full parity with the mobile app (`aquamates` repo): events, RSVP, expenses and bank QR, history, dashboard, settings, admin member management. It uses the same Supabase project, tables and RLS. One club, one data set.

**Sign-in.** Facebook sign-in and an email magic link. Sign in with Apple on web is a later ticket (it needs the live URL). Signed-out visitors see only a public landing page; every other route sends them to sign-in. After sign-in, a member without a club enters or creates the club code, as on mobile.

**Look.** The same design tokens, themes and languages as mobile. Responsive from phone browsers up to desktop. A Figma design of the web screens comes first and the build follows it.

**Bank QR.** Organizers upload the bank QR image through the browser file picker, with the same limits and storage as mobile.

**Account deletion.** Members with Facebook or magic-link accounts can delete their account on web through the existing `delete-account` function. Apple-linked accounts delete in the iOS app until Apple web sign-in ships.

**Privacy.** No analytics or error tracking; browser console errors only.

**Build and delivery.** Expo web (expo-router, TypeScript) exported as a static site. Code lives in this repo; shared code from mobile is copied. Every library and build tool is open source. Hosting is Cloudflare Pages on the free `*.pages.dev` address. Merges to `main` deploy automatically and every PR gets a preview URL. A scheduled GitHub Action pings Supabase weekly so the free project does not pause.

## Acceptance criteria

- AC-1: A Figma file holds the web design for every screen (landing, sign-in, club code, home, event create and edit, event detail, expenses, history, dashboard, settings, admin members) at phone (375), tablet (768) and desktop (1280) widths, using the mobile design tokens. The file link is on the design ticket.
- AC-2: `npm run build` exports a static web site and `npm test` passes.
- AC-3: A GitHub Actions pipeline shows development and deployment end to end: every PR runs install, lint, build, tests, end-to-end tests and Lighthouse as separate visible jobs; a merge to `main` deploys to Cloudflare Pages and records a GitHub deployment (visible under Environments); each PR gets a preview URL posted on the PR; the README shows status badges and the live URL.
- AC-4: A scheduled GitHub Action pings Supabase weekly and can be run by hand.
- AC-5: Signed out, the landing page loads and every other route redirects to sign-in.
- AC-6: A member signs in with Facebook and lands on home (or the club code screen when they have no club).
- AC-7: A member signs in with an emailed magic link.
- AC-8: A member without a club can join with a club code or create a club.
- AC-9: Home lists events; a member opens an event and RSVPs; an organizer creates, edits and cancels an event.
- AC-10: Organizers set the total cost, see the equal split, and upload a bank QR image that other members see on the event.
- AC-11: A member sees their activity history.
- AC-12: A member sees the dashboard with totals and participation over time.
- AC-13: Settings let a member edit their profile name and choose the language and theme, with the same options as mobile.
- AC-14: A Facebook or magic-link member deletes their account from settings and is signed out; the data is anonymised as on mobile.
- AC-15: An admin lists, and removes, club members.
- AC-16: All strings come from the shared translation files and the web shows the same languages as mobile.
- AC-17: At 375, 768 and 1280 px wide, nothing overlaps or is cut off on the main screens, in Chromium, Firefox and WebKit.
- AC-18: Lighthouse performance on the landing page is at least 90, and CI fails below that.
- AC-19: Playwright end-to-end tests of the main flows (sign-in, RSVP, create event, expenses) run in CI against the real build.
- AC-20: The built site sends no requests to analytics or error-tracking services.
- AC-21: Headings and big numbers use a rounded, playful font (Fredoka) in light and dark, body text keeps Plus Jakarta Sans, and the Lighthouse threshold of AC-18 still passes.
- AC-22: The dashboard is friendlier: a greeting with the member's name, rounded stat cards with an icon each, colourful bars and a cheerful empty state, using the same data as before.

## Out of scope

Push notifications, offline mode and installable PWA, SEO beyond the landing page, a custom domain, new languages, app-store work, Sign in with Apple on web (later ticket), a shared package between the mobile and web repos.

## Decisions

- 2026-11-06: Web has full parity with mobile. Why: members without iOS can only be reached by web.
- 2026-11-06: Same Supabase project, tables and RLS. Why: no duplicated data or logic; the free tier already hosts it.
- 2026-11-06: Facebook plus email magic link; Apple on web later. Why: Apple web needs a Services ID and the live URL, and must not block the first deploy.
- 2026-11-06: Expo web static export. Why: reuses the mobile code and tokens, open source, any static host serves it.
- 2026-11-06: Same languages and themes as mobile. Why: strings and tokens already exist.
- 2026-11-06: Only a landing page is public. Why: gives people somewhere to land without exposing member data.
- 2026-11-06: Code stays in this repo, shared code copied. Why: a shared package is a big refactor of a live app and can follow later.
- 2026-11-06: Cloudflare Pages on `*.pages.dev`, deploy on merge, preview per PR. Why: free, unlimited bandwidth, native SPA routing, previews for QA.
- 2026-11-06: Open source covers libraries and tools, not the free host. Why: open-source hosting means running a paid server.
- 2026-11-06: Weekly keep-alive ping for Supabase. Why: free projects pause after about a week idle.
- 2026-11-06: Jest plus Playwright; Lighthouse at least 90 on the landing page in CI. Why: QA can verify in a real browser, and speed stays measured.
- 2026-11-08: Web may look friendlier than mobile for now (Fredoka headings, friendlier dashboard); mobile can copy it later. Why: owner asked for a more fun, friendly UI on web first.
- 2026-11-06: Responsive on the latest two versions of Chrome, Safari, Firefox and Edge. Why: most members open shared links on their phone.
- 2026-11-06: Account deletion on web for non-Apple accounts. Why: privacy right; the Apple token revoke cannot be tested on web yet.
- 2026-11-06: Bank QR upload on web via file picker. Why: parity.
- 2026-11-06: No analytics or error tracking. Why: privacy, and a tracker needs a paid server.
- 2026-11-06: A Figma design is made first and the UI tickets wait for it. Why: owner asked to design before building.
