# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 5
**Last completed:** 17 Analytics Charts — PostHog Data
**Next:** Phase 5 Complete

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- **middleware.ts** — uses `updateSession` from `@insforge/sdk/ssr` to silently refresh tokens and guard `/dashboard`, `/profile`, `/find-jobs`. Excludes `api/` routes from the matcher so route handlers aren't double-processed.
- **Dashboard placeholder** — created `app/dashboard/page.tsx` as a minimal server component so the post-OAuth redirect (`/dashboard`) has a valid landing page. Will be replaced by full UI in Phase 5.
- **PostHog guard** — `initPostHog()` exits early if `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is undefined, preventing the "initialized without a token" console warning in dev.
- **PostHog env wiring** — `.env.local` contains `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (project token key) and `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`.
- **PostHog manual setup** — The `@posthog/wizard` LLM Gateway requires an internal `llm_gateway:read` scope not available to standard personal API keys. PostHog was wired manually instead: `lib/posthog-client.ts` (browser), `lib/posthog-server.ts` (server), `components/providers/PostHogProvider.tsx` (pageview tracking via Next.js navigation hooks), root layout wrapped with provider.
- **PostHogProvider + Suspense** — `useSearchParams()` in Next.js App Router requires a Suspense boundary. `PostHogPageView` is wrapped in `<Suspense fallback={null}>` inside the provider.
- **PostHog User Identification** — Wired `posthog.identify()` and `posthog.reset()` inside `PostHogProvider.tsx` using `insforge.auth.getCurrentUser()` on client-side mount to associate events with the active user session.
- **PDF Extraction Worker Path** — Standard `pdf-parse` (v2) fails to find `pdf.worker.mjs` in Next.js Turbopack development builds because compilation relocates the files. Fixed by explicitly calling `PDFParse.setWorker()` with the absolute path in the `node_modules` directory (`path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs")`).
- **Storage Blob Uploads & Deletion** — Uploading a standard `Blob` using `insforge.storage.from("resumes").upload` is preferred over standard `Buffer` to prevent Node/FormData serialization issues in client-side Next.js HTTP wrappers. Deleting the existing file first via `.remove([path])` simulates clean upserting and avoids duplicate file constraints.
- **Authenticated Resume Download** — Added an API route at `/api/resume/download/route.ts` that downloads the raw resume PDF blob from storage via the authenticated server client, streaming it back as a file attachment, avoiding public exposure of URLs.
- **OpenRouter for GPT-4o** — No `OPENAI_API_KEY` available; all GPT-4o calls (job matching, scoring) route through OpenRouter using the existing `OPENROUTER_API_KEY`. The `openai` SDK is reused with `baseURL: "https://openrouter.ai/api/v1"` and model string `"openai/gpt-4o"`. No new package installed.
- **Feature 10 files** — `lib/adzuna.ts` (Adzuna client), `agent/types.ts` (shared types), `agent/matcher.ts` (GPT-4o scoring via OpenRouter), `agent/adzuna.ts` (orchestrator), `app/api/agent/find/route.ts` (API route). `FindJobsSearch.tsx` wired with loading/success/error state machine and `router.refresh()` after completion.

---

## Notes

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` must be a project API key (`phc_*`) for `posthog-js` browser capture and `posthog-node` server capture. The personal key (`phx_*`) in `.env.local` was only used by the wizard tool — we have replaced it with the project key from PostHog Settings → Project → Project API Key.
- The `(auth)/callback` folder under `app/` is intentionally empty — the OAuth exchange is handled by the API route at `app/api/auth/callback/route.ts`.
