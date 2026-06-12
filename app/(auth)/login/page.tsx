"use client";

import { useState } from "react";
import { createClient } from "@insforge/sdk";
import { posthog } from "@/lib/posthog-client";

const OAUTH_PKCE_COOKIE_NAME = "jobpilot_oauth_pkce_verifier";

function setOAuthVerifierCookie(codeVerifier: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${OAUTH_PKCE_COOKIE_NAME}=${encodeURIComponent(
    codeVerifier,
  )}; Path=/; Max-Age=600; SameSite=Lax${secure}`;
}

const authClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (provider: "google" | "github"): Promise<void> => {
    setIsLoading(provider);

    // Track login start
    posthog.capture("login_started", { provider });
    if (typeof window !== "undefined") {
      sessionStorage.setItem("jobpilot_login_provider", provider);
    }

    const { data, error } = await authClient.auth.signInWithOAuth(provider, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
      skipBrowserRedirect: true,
    });

    if (error || !data.url || !data.codeVerifier) {
      console.error(
        `[login] Error logging in with ${provider}:`,
        error?.message ?? "OAuth URL or PKCE verifier was not returned",
      );
      setIsLoading(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("jobpilot_login_provider");
      }
      return;
    }

    setOAuthVerifierCookie(data.codeVerifier);
    window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8">
          <div className="mx-auto w-9 h-9 bg-gradient-to-br from-accent to-accent-dark rounded-[10px] mb-6 flex items-center justify-center shadow-sm">
             <span className="text-accent-foreground font-bold text-lg">JP</span>
          </div>
          <h1 className="text-[19px] font-bold text-text-darkest leading-[28px] mb-2">Welcome to JobPilot</h1>
          <p className="text-[14px] text-text-secondary">Sign in to continue your job search journey.</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleLogin("google")}
            disabled={!!isLoading}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-text-primary rounded-md px-4 py-2 hover:bg-surface-secondary transition-colors disabled:opacity-50 font-medium text-[14px]"
          >
            {isLoading === "google" ? (
              <span className="animate-spin w-5 h-5 border-2 border-text-muted border-t-transparent rounded-full" />
            ) : (
              <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[12px] font-semibold text-text-primary">G</span>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleLogin("github")}
            disabled={!!isLoading}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-text-primary rounded-md px-4 py-2 hover:bg-surface-secondary transition-colors disabled:opacity-50 font-medium text-[14px]"
          >
            {isLoading === "github" ? (
              <span className="animate-spin w-5 h-5 border-2 border-text-muted border-t-transparent rounded-full" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>
        
        <p className="text-center text-[12px] text-text-muted mt-8">
          By continuing, you agree to JobPilot&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
