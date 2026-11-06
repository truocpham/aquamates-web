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
