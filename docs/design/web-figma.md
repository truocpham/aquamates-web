# AquaMates web: Figma design

Figma file: https://www.figma.com/design/DCrItU9GH6Y9SLvRfMgmmt

The file has three pages: Tokens, Landing & Auth, App screens. Every screen is drawn at phone (375 px), tablet (768 px) and desktop (1280 px). Colours are Figma variables taken from the mobile theme (`aquamates` repo, `src/shared/ui/theme.ts`). Every UI ticket builds from this file and these tokens.

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

Same values as the mobile theme. Font: Plus Jakarta Sans 400, 600, 700.

### Colours

| Token | Light | Dark |
|---|---|---|
| bg | `#F4F7FB` | `#0B0F17` |
| card | `#FFFFFF` | `#121823` |
| raised | `#EAF0F7` | `#1A212E` |
| border | `#D5DEE9` | `#2A2F3A` |
| text | `#0B0F17` | `#FFFFFF` |
| muted | `#5B6778` | `#9AA3B2` |
| brand | `#0070B8` | `#00A0FF` |
| accent | `#C8FF48` | `#C8FF48` |
| accentBorder | `#8FBF00` | `#C8FF48` |
| onAccent | `#0B0F17` | `#0B0F17` |
| beerSocial | `#D98200` | `#FFB547` |
| success | `#059669` | `#34D399` |
| danger | `#D32F2F` | `#FF6B6B` |

The mobile theme also has `swimming` (same as `brand`) and `dangerText` (light `#C62828`, dark `#FF6B6B`, used for danger text on any surface). They follow the mobile values.

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
