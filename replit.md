# Elite Design Studio — Premium Interior Design SaaS

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- **`artifacts/elite-design-studio`** — React + Vite + Tailwind v4 frontend (path: `/`)
- **`artifacts/api-server`** — Express 5 backend API (path: `/api`)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk v6 (email + Google OAuth)
- **AI**: Gemini `gemini-2.0-flash` via Replit AI Integrations; HuggingFace FLUX.1-schnell for images, `damo-vilab/text-to-video-ms-1.7b` for video

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Endpoints

- `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`
- `GET /api/leads`, `POST /api/leads`, `DELETE /api/leads/:id`
- `GET /api/leads/export?format=xlsx|pdf` — Excel/PDF export
- `GET /api/dashboard/stats`, `GET /api/dashboard/lead-chart`
- `POST /api/ai/enhance-prompt` — Gemini prompt enhancement
- `POST /api/ai/generate-image` — FLUX.1-schnell via HuggingFace (with p-retry + x-wait-for-model)
- `POST /api/ai/generate-video` — text-to-video via HuggingFace
- `POST /api/ai/generate-email` — Gemini email generation
- `POST /api/import/projects` — Excel import for projects (`{ fileBase64: string }`)
- `POST /api/import/leads` — Excel import for leads (`{ fileBase64: string }`)
- `DELETE /api/admin/clear-data` — Delete all data (projects, leads, testimonials)

## Excel Import Format

Projects: `Title | Description | Category | ImageURL | Featured(true/false) | Budget | Location`
Leads: `Name | Email | Phone | Budget | Timeline(days) | PropertyType | Message`

## Clerk Auth Notes

- v6 uses `Show` component (not `SignedIn`/`SignedOut`)
- `routerPush`/`routerReplace` needed for `<ClerkProvider>`
- `@clerk/themes` v2 installed (use `shadn` theme object)
- Publishable key env var: `VITE_CLERK_PUBLISHABLE_KEY`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
