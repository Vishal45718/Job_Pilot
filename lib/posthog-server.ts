import { PostHog } from "posthog-node";

export function createPostHogServer(): PostHog {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    flushAt: 1, // send immediately — Next.js functions are short-lived
    flushInterval: 0, // no batching
  });
}
