# Swarm Made ($MADE)

A static, one-page website for launch #741. The production export is included in **`dist/`** alongside the source and `package-lock.json`. It can be published as-is; no backend or build service is needed by the host.

The page uses Vite, TypeScript, native HTML, and CSS. Native HTML keeps every token fact and destination usable without JavaScript; the small script adds copying and theme preferences. There are no runtime dependencies, wallet connections, analytics, remote scripts, or downloaded fonts. The only local storage entry is the theme preference (`made-theme`).

## Install and develop

Use Node.js 22.12 or newer (validated with Node 22.23.3 and npm 10.9.9).

```sh
npm ci
npm run dev
```

Vite prints the local development URL. Dependencies are local development tools, not part of the static export.

## Rebuild and preview

```sh
npm run typecheck
npm run build
npm run preview
```

The build writes `dist/index.html`, hashed CSS/JavaScript under `dist/assets/`, `dist/theme-init.js`, and `dist/favicon.svg`. `base: './'` in `vite.config.ts` makes all runtime asset URLs relative. The early, classic `theme-init.js` script is intentionally copied from `public/` and runs before paint; Vite’s “can't be bundled without type=module” notice for that script is expected. It exists in the final export and was checked in the browser.

To preview the existing export without installing anything, run `python3 -m http.server 8080 --directory dist` and open `http://localhost:8080/`. Stop the foreground server with Ctrl+C.

## Publish

Upload the **contents of `dist/`**, preserving the `assets/` directory and both top-level assets, to any static HTTPS host or IPFS directory. Serve `index.html` as the directory index. A subpath deployment works; navigation uses hashes and requires no server rewrites. The publisher should serve the included export rather than rebuilding. After source edits, rebuild and include the whole updated `dist/` in the next submission.

HTTPS (or localhost) enables the Clipboard API. If copying is unavailable or denied, the page selects the full address and explains manual copying. All external links open in the same tab and preserve normal browser link behavior.

Do not publish the repository root, development dependencies, caches, or browser installations. No deployment or Git mutation was performed by the worker; the generated export is delivered for the submission system to capture.

## Checks and actual results

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Playwright also needs its Linux system libraries. On a normal development machine, `npx playwright install --with-deps chromium` can install those with the appropriate system permissions. Tests start and stop their own local server and serve the **production export** under `/preview/`; they do not test the Vite development server. Run a fresh build before tests after source changes.

On 2026-10-06, the final TypeScript check and production build passed. All **18 delivered Playwright tests passed** in Chromium. Checks covered both themes at 320, 390, 768, and 1440px; real clipboard copying; denied/unavailable clipboard recovery; system theme changes, stored preferences, and blocked storage; keyboard traversal and activation; section anchors and external destination navigation; JavaScript-disabled reading; relative local assets; console/resource failures; 200% text enlargement; reduced motion; rendered contrast; and axe accessibility scans at desktop and narrow widths. Applicable findings were fixed and rechecked.

Because repository dependency directories were excluded from this assignment, the worker copied the source into `/tmp/made-site-build`, installed from the manifest there, ran the scripts there, and copied the final export and evidence back. The provided browser tool could not start because `/opt/google/chrome/chrome` was missing. A temporary Playwright Chromium installation, temporary extracted Debian browser libraries, and locally installed Liberation Mono supplied the alternative browser checks. None of those tools or archives is part of this submission.

Limitations: no physical-device, Safari, Firefox, screen-reader, browser-native zoom, or RTL session was run. Text enlargement is not a substitute for native zoom. The external destinations were checked as URLs and navigation targets; no swap or wallet transaction was attempted. Etherscan returned HTTP 403 to the automated HTTP client, so its remote page content was not verified. The other four destinations returned HTTP 200. No smart-contract audit or live supply/pool reconciliation was performed.

See [artifacts/validation.md](artifacts/validation.md) for the six-domain review, findings, exact execution context, contrast results, and evidence. [DESIGN.md](DESIGN.md) documents the final implementation. Screenshots are in `artifacts/`.

## Files and submission budget

- `index.html`: readable static content and destinations.
- `src/`: interaction code and the full design system.
- `public/`: locally bundled theme initializer and favicon.
- `tests/`, `playwright.config.mjs`: reproducible production-export interaction checks.
- `dist/`: complete ready-to-publish export.
- `artifacts/`: validation report, measured contrast, screenshots, link checks, and packaging results.
- `docs/design-guidance-LICENSE.txt`: preserved design-reference license notices.

The explicit `.gitignore` path budget is **512 bytes**. It excludes nested dependency/cache directories and scratch/test output; it deliberately does not exclude `dist/`. The complete delivery is checked against the assignment’s 8,388,608-byte limit, with no dependency archives, generated caches, or submodules included. Exact final byte counts are in `artifacts/package-check.json`.
