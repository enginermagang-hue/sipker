# AGENTS.md

## Project State
- This is a Nuxt 4 application starter. `app/app.vue:1-6` still renders `NuxtWelcome`; there is no application feature, API, authentication, database, migration, test, or server directory yet.
- Use `npm` because `package-lock.json` is the checked-in lockfile. The README lists other package managers, but they are not the reproducible choice here.
- `README.md` is generic Nuxt starter documentation. Product requirements are in `PLAN.md`; database decisions are in `DATABASE.md`. Read both before domain work.

## Commands
- Install: `npm install`.
- Development server: `npm run dev` (Nuxt serves at `http://localhost:3000` by default).
- Production build: `npm run build`.
- Production preview: `npm run preview`.
- Static generation: `npm run generate`; use only for a genuinely static app, not for planned server/API features.
- `postinstall` runs `nuxt prepare`; `.nuxt/` and `.output/` are generated and ignored. Do not edit generated files.
- No lint, typecheck, test, formatter, CI, or pre-commit scripts/configuration are currently present. Do not run `npm run build` unless the user explicitly requests it; do not claim lint/tests passed unless tooling is added.

## Architecture and Configuration
- Runtime source belongs under `app/`; current global styles are in `app/assets/css/main.css`.
- The stack is Nuxt `^4.5.2`, Vue `^3.5.43`, Nuxt UI `^4.11.2`, and Tailwind `^4.3.3`.
- `nuxt.config.ts` registers `@nuxt/ui`, enables devtools, and loads the global stylesheet. Add server runtime configuration or environment handling there when the backend is introduced.
- `tsconfig.json` references Nuxt-generated project files; do not hand-edit generated `.nuxt/tsconfig.*` files.
- `opencode.json` configures the Nuxt UI documentation MCP and Chrome DevTools MCP. Use the Nuxt UI MCP for component API questions and Chrome DevTools for focused browser checks.
- No Vercel config, backend, database client, or environment example exists yet. The planned deployment is Vercel + Turso + Google Drive API; keep credentials in Vercel environment variables, not source files.

## Product and Data Invariants
- The application is an activity/service log for Dapodik, not a scoring, KPI, ranking, or formal performance-assessment system.
- Roles are Admin, Kepala, Koordinator Wilayah, and Anggota Wilayah. Admin and Kepala have global scope; Koordinator is scoped to one region; Anggota is scoped to their own records in one region.
- Enforce role and region authorization on the server. Never trust a region ID, role, or activity ID supplied by the browser.
- The consultant/teacher name is required. A submitted activity requires at least one available Google Drive evidence file.
- Turso stores activity and evidence metadata, not file bytes. Use the dedicated Google account/folder through server-side Drive operations; do not expose public file links.
- Preserve the activity status flow and audit history described in `PLAN.md`; do not hard-delete checked activity records.

## Working Rules
- Check `package.json` before adding dependencies and follow existing Nuxt/Nuxt UI patterns.
- Keep changes focused; the repository is still a starter and has no established feature module conventions.
- When adding persistence, follow `DATABASE.md`: foreign keys, parameterized queries, migrations, indexes, soft deletion, and region-scoped access.
- Keep secrets and personal data out of logs and committed files; `.env` files are ignored.
- When build verification is explicitly requested, run `npm run build` and report any dependency warnings separately from actual failures.
- After completing any feature, fix, refactor, or implementation change, update `PROGRESS.md` in the same change with the date, summary, affected area, verification result, and remaining next step.