# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 2
**Last completed:** 05 Profile Page — Full UI
**Next:** 06 Profile Save Logic

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- **middleware.ts** — uses `updateSession` from `@insforge/sdk/ssr` to silently refresh tokens and guard `/dashboard`, `/profile`, `/find-jobs`. Excludes `api/` routes from the matcher so route handlers aren't double-processed.
- **Dashboard placeholder** — created `app/dashboard/page.tsx` as a minimal server component so the post-OAuth redirect (`/dashboard`) has a valid landing page. Will be replaced by full UI in Phase 5.
- **PostHog guard** — `initPostHog()` exits early if `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is undefined, preventing the "initialized without a token" console warning in dev.
- **PostHog env wiring** — `.env.local` contains `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (project token key) and `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`.
- **PostHog manual setup** — The `@posthog/wizard` LLM Gateway requires an internal `llm_gateway:read` scope not available to standard personal API keys. PostHog was wired manually instead: `lib/posthog-client.ts` (browser), `lib/posthog-server.ts` (server), `components/providers/PostHogProvider.tsx` (pageview tracking via Next.js navigation hooks), root layout wrapped with provider.
- **PostHogProvider + Suspense** — `useSearchParams()` in Next.js App Router requires a Suspense boundary. `PostHogPageView` is wrapped in `<Suspense fallback={null}>` inside the provider.
- **PostHog User Identification** — Wired `posthog.identify()` and `posthog.reset()` inside `PostHogProvider.tsx` using `insforge.auth.getCurrentUser()` on client-side mount to associate events with the active user session.

---

## Notes

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` must be a project API key (`phc_*`) for `posthog-js` browser capture and `posthog-node` server capture. The personal key (`phx_*`) in `.env.local` was only used by the wizard tool — we have replaced it with the project key from PostHog Settings → Project → Project API Key.
- The `(auth)/callback` folder under `app/` is intentionally empty — the OAuth exchange is handled by the API route at `app/api/auth/callback/route.ts`.
