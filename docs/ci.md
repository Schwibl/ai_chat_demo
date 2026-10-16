# CI

This repo’s pipeline is one GitHub Actions workflow, [`.github/workflows/pr-checks.yml`](../.github/workflows/pr-checks.yml). It answers a common interview question: what runs before code can land, and what would you point branch protection at?

## When it runs

- On every pull request.
- On every push to `main`.

A new run for the same ref cancels the one still going (`concurrency.cancel-in-progress`). That keeps a stack of pushes from piling up.

Nobody needs a secret, an API key, or a logged-in service. The chat demo talks to a mock that ships inside Vite’s dev and preview servers.

## Node and install

Both jobs read [`.nvmrc`](../.nvmrc), which is `24`. `actions/setup-node` caches npm downloads from `package-lock.json`. The install is `npm ci`, which refuses to continue if `package.json` and the lockfile disagree (a frozen lockfile).

There is no ESLint config, so the workflow does not run lint. There are no unit tests, so it does not run `npm test`. Playwright smoke tests are the check for the UI.

## Jobs

Branch protection matches these **job names** exactly. On GitHub the status check is the workflow name, a slash, then the job name.

| Job name | Status check to require | What it does |
| --- | --- | --- |
| `Install, typecheck, build` | `PR checks / Install, typecheck, build` | `npm ci`, `npm run typecheck`, `npm run build` |
| `Playwright smoke` | `PR checks / Playwright smoke` | `npm ci`, install Chromium, `npm run build`, serve `dist/`, run the smoke tests |

The two jobs run in parallel. Each installs its own dependencies. The smoke job builds again so it can serve the bundle it just produced.

### Install, typecheck, build

1. Check out the repo.
2. Install Node 24 from `.nvmrc`, with the npm cache.
3. `npm ci`.
4. `npm run typecheck` (`tsc --noEmit`).
5. `npm run build` (`tsc --noEmit && vite build`).

Output of the build is the `dist/` directory at the repo root. Vite’s project root is `frontend/`; `vite.config.ts` points `outDir` at that `dist/`.

### Playwright smoke

1. Same checkout, Node 24, and `npm ci`.
2. `npx playwright install --with-deps chromium`.
3. `npm run build`.
4. `npm run e2e`.

`playwright.config.ts` starts `vite preview` on `http://127.0.0.1:4173` and waits until that URL responds. Preview serves `dist/` and still mounts the mock chat API (`vite/chat-mock-plugin.ts`), so the tests do not call a real model.

Four tests in `e2e/smoke.spec.ts`. The first three are the smoke bar (load, UI, one interaction). The fourth locks the no-key fallback:

1. The app loads and the browser reports no console errors or page errors.
2. The host page heading and the **Chat** trigger render.
3. Clicking **Chat** opens the panel and the mock greeting is visible.
4. If `/api/chat` returns 404, the panel says the API is not available and that no API key is required.

A failed run uploads the Playwright HTML report as the `playwright-report` artifact.

## Build command and output

| | |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |

Vercel does not reliably infer that layout, because the Vite root is `frontend/` and the output is the repo-root `dist/`. [`vercel.json`](../vercel.json) sets `framework`, `buildCommand`, and `outputDirectory`. The app is one page with no client-side router, so there is no SPA rewrite.

## Local equivalents

```bash
npm ci
npm run typecheck
npm run build
npx playwright install chromium
npm run e2e
```

`npm run e2e` expects `dist/` to exist. `npm run build` creates it.
