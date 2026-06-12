"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { initPostHog, posthog } from "@/lib/posthog-client";
import { insforge } from "@/lib/insforge-client";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();

    const identifyUser = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user?.id) {
          posthog.identify(data.user.id, {
            email: data.user.email,
          });

          // Check if there was a pending login flow and track completion
          const pendingProvider = sessionStorage.getItem("jobpilot_login_provider");
          if (pendingProvider) {
            posthog.capture("login_completed", {
              userId: data.user.id,
              provider: pendingProvider,
            });
            sessionStorage.removeItem("jobpilot_login_provider");
          }
        } else {
          posthog.reset();
          sessionStorage.removeItem("jobpilot_login_provider");
        }
      } catch (error) {
        console.error("[PostHogProvider] Failed to identify user:", error);
      }
    };

    identifyUser();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}

