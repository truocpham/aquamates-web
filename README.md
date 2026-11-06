# AquaMates Web

[![CI](https://github.com/truocpham/aquamates-web/actions/workflows/ci.yml/badge.svg)](https://github.com/truocpham/aquamates-web/actions/workflows/ci.yml)
[![Deploy](https://github.com/truocpham/aquamates-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/truocpham/aquamates-web/actions/workflows/deploy.yml)

Live site: https://aquamates-web.pages.dev (production, Cloudflare Pages)

## Development

```
npm install
npm start      # dev server
npm run lint
npm test
npm run build  # static export to dist/
```

## CI/CD

- `ci.yml` runs on every PR and push to main as separate checks: Install, Lint, Build, Unit tests, E2E, Lighthouse.
- `deploy.yml` deploys `dist/` to Cloudflare Pages on merge to main and records a deployment in the `production` environment.
- `preview.yml` deploys each PR to a preview URL (`preview` environment) and comments the URL on the PR.

### Secrets and settings

Add these in GitHub under Settings > Secrets and variables > Actions:

| Name | Kind | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | API token with Cloudflare Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | secret | Cloudflare account id |
| `CLOUDFLARE_PROJECT_NAME` | variable (optional) | Pages project name, default `aquamates-web` |

Until both secrets exist, the deploy and preview jobs are skipped with a notice; CI still runs. Previews are also skipped for PRs from forks, which cannot read secrets.

## Sign-in and auth redirect URLs

Members sign in with Facebook or an emailed magic link (Supabase Auth, PKCE, session in `localStorage`). Both flows return to `/auth-callback`, where supabase-js completes the session; the app then opens home, or the club code screen when the member has no club. A magic link must be opened in the same browser that requested it.

Redirect targets are defined in one place, `src/shared/authRedirect.ts` (local `http://localhost:<port>`, previews `https://<name>.aquamates-web.pages.dev`, production `https://aquamates-web.pages.dev`); any other origin falls back to production. Add these to the Supabase dashboard under Authentication > URL Configuration > Redirect URLs:

- `http://localhost:8081/auth-callback`
- `https://*.aquamates-web.pages.dev/auth-callback`
- `https://aquamates-web.pages.dev/auth-callback`

Also set the Site URL to the production URL, enable the Facebook provider, and add the repository variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Settings > Secrets and variables > Actions > Variables). They are public client values, never the service-role key. Locally, copy `.env.example` to `.env`.
