# AquaMates web: Figma design

Figma file: https://www.figma.com/design/DCrItU9GH6Y9SLvRfMgmmt

The file has three pages: Tokens, Landing & Auth, App screens. Every screen is drawn at phone (375 px), tablet (768 px) and desktop (1280 px). Colours are Figma variables that mirror `src/shared/ui/theme.ts`. Every UI ticket builds from this file and these tokens.

## Screens

Each frame is named `<Screen> / <width>` in the file. The dark reference frame is `Home / 1280 / Dark` (desktop only).

| Screen | Figma page | 375 | 768 | 1280 |
|---|---|---|---|---|
| Landing (public) | Landing & Auth | Landing / 375 | Landing / 768 | Landing / 1280 |
| Sign-in (Facebook, email magic link) | Landing & Auth | Sign in / 375 | Sign in / 768 | Sign in / 1280 |
| Club code (enter or create) | Landing & Auth | Club code / 375 | Club code / 768 | Club code / 1280 |
| Home (event list) | App screens | Home / 375 | Home / 768 | Home / 1280 |
| Event detail | App screens | Event detail / 375 | Event detail / 768 | Event detail / 1280 |
| Event form (create and edit) | App screens | Event form / 375 | Event form / 768 | Event form / 1280 |
| Expenses | App screens | Expenses (organizer) / 375 | Expenses (organizer) / 768 | Expenses (organizer) / 1280 |
| History | App screens | History / 375 | History / 768 | History / 1280 |
| Dashboard | App screens | Dashboard / 375 | Dashboard / 768 | Dashboard / 1280 |
| Settings | App screens | Settings / 375 | Settings / 768 | Settings / 1280 |
| Admin members | App screens | Admin members / 375 | Admin members / 768 | Admin members / 1280 |
| Home, dark theme (reference) | App screens | n/a | n/a | Home / 1280 / Dark |

## Tokens

T-MEN palette from `docs/specs/t-men-brand.md`: warm cream light theme, deep teal-navy dark theme, gold actions. Font: Plus Jakarta Sans 400, 600, 700. Tagline: "Swim together, beer forever". Primary buttons and selected chips are gold with dark text in both themes; lime is removed. Values below are the tuned ones in `src/shared/ui/theme.ts` (checked at WCAG AA by the contrast test).

### Colours

| Token | Light | Dark |
|---|---|---|
| bg | `#FBF8E5` | `#071820` |
| card | `#FFFFFF` | `#0D2430` |
| raised | `#F3EEDB` | `#143240` |
| border | `#E3DBC0` | `#234656` |
| text | `#0B1B24` | `#F4FAFB` |
| muted | `#54626B` | `#9DB8C4` |
| brand (links, active tab) | `#1665B2` | `#5AA9F0` |
| accent (gold fill) | `#FAC618` | `#FAC618` |
| accentBorder | `#A57C00` | `#FAC618` |
| onAccent (text on gold) | `#0B1B24` | `#0B1B24` |
| swimming | `#1665B2` | `#5AA9F0` |
| beerSocial | `#9A6400` | `#FAC618` |
| success | `#047857` | `#34D399` |
| danger | `#C62828` | `#FF6B6B` |
| dangerText | `#B71C1C` | `#FF6B6B` |

Gold is never text on cream. The wordmark teal is `#097C99` (light). Swimming is blue and beer social is gold wherever event categories show.

### Type scale (Plus Jakarta Sans)

| Style | Size (px) | Weight |
|---|---|---|
| Display | 36 | 700 |
| Heading | 28 | 700 |
| Title | 20 | 700 |
| Body | 16 | 400 |
| Label | 14 | 600 |
| Caption | 12 | 400 |

### Spacing

| Token | px |
|---|---|
| xs | 4 |
| sm | 8 |
| md | 12 |
| lg | 16 |
| xl | 24 |

### Radius

| Token | px |
|---|---|
| sm | 8 |
| input | 12 |
| card | 16 |
| pill | 20 |

## Layout rules

- 375 (phone): a bottom tab bar holds the main destinations. Content is one column.
- 768 (tablet) and up: the bottom tab bar is replaced by a top bar with tabs.
- 1280 (desktop): the same top bar and tabs; content is centred in a max-width column. Event detail is two columns (event info on one side, RSVP, expenses and bank QR on the other). At 375 and 768 event detail is one column.
- Landing, sign-in and club code have no tab bar or top tabs.
- Dark theme uses the same layouts with the dark colour column.
