# Memory — Phase 1 Foundation & PostHog Setup Complete

Last updated: 2026-06-12T16:15:00+05:30

## What was built
- **PostHog User Identification**: Wired `posthog.identify()` and `posthog.reset()` inside [PostHogProvider.tsx](file:///home/jonsnow/Desktop/job_pilot/components/providers/PostHogProvider.tsx) to associate client tracking events with the active InsForge user session.
- **PostHog Configuration Refactor**: Standardized the environment variables to use `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` in [lib/posthog-client.ts](file:///home/jonsnow/Desktop/job_pilot/lib/posthog-client.ts) and [lib/posthog-server.ts](file:///home/jonsnow/Desktop/job_pilot/lib/posthog-server.ts).
- **IDE PostHog MCP Integration**: Configured the IDE's Model Context Protocol config file ([mcp_config.json](file:///home/jonsnow/.gemini/antigravity-ide/mcp_config.json)) to run the PostHog remote MCP server via `mcp-remote` with a redacted authorization header.
- **Homepage CTA Click Tracking**: Added client-side PostHog click event capturing (`homepage_cta_clicked`) to all primary CTAs in the [Hero](file:///home/jonsnow/Desktop/job_pilot/components/homepage/Hero.tsx), [BottomCTA](file:///home/jonsnow/Desktop/job_pilot/components/homepage/BottomCTA.tsx), and [Navbar](file:///home/jonsnow/Desktop/job_pilot/components/layout/Navbar.tsx) components.
- **Login Flow Tracking**: Added capture tracking for `login_started` when starting the OAuth provider sign-in process in the [Login Page](file:///home/jonsnow/Desktop/job_pilot/app/(auth)/login/page.tsx).
- **Auth Completion Tracking**: Configured client-side state mapping (`sessionStorage`) to successfully fire `login_completed` with the correct provider and distinct user ID inside [PostHogProvider.tsx](file:///home/jonsnow/Desktop/job_pilot/components/providers/PostHogProvider.tsx) once authenticated.
- **PostHog Event Registry Update**: Added the three new events to the approved list in [code-standards.md](file:///home/jonsnow/Desktop/job_pilot/context/code-standards.md).

## Decisions made
- Renamed the environment variables to align with standard PostHog Next.js documentation patterns.
- Hand-coded the PostHog client and server configurations to completely bypass the automated wizard due to external service disruptions (LLM Gateway outages).
- Chose client-side sessionStorage persistence to coordinate the `login_completed` tracking event since OAuth redirect loops span page requests.

## Problems solved
- **Dev Server Env Caching**: Clarified that updated `.env.local` keys (`phc_*`) require restarting the dev server to rebuild the client bundle.
- **Host Variable Bug**: Corrected a client configuration typo in `lib/posthog-client.ts` where `api_host` was pointing to the token instead of the host variable.

## Current state
- Phase 1 (Foundation) manual setup and PostHog event tracking is fully complete and verified.
- The project builds successfully with zero compilation or type warnings.
- The PostHog MCP server configuration has been registered for the IDE.

## Next session starts with
- **Phase 2 — Feature 05: Profile Page Full UI**: Build the complete profile page interface (`app/profile/page.tsx`) using Tailwind v4 design tokens and mock data.

## Open questions
- None.
