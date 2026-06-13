"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { posthog } from "@/lib/posthog-client";
import { insforge } from "@/lib/insforge-client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid, Search, User } from "lucide-react";

export function Navbar({ user = null }: { user?: any }) {
  const [session, setSession] = useState<any>(user);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (!user) {
      // Check active session if not provided by server
      insforge.auth.getCurrentUser()
        .then(({ data }) => {
          if (data?.user) setSession(data.user);
        })
        .catch(console.error);
    } else {
      setSession(user);
    }
  }, [user]);

  const handleTrackCTA = () => {
    posthog.capture("homepage_cta_clicked", {
      ctaName: "Start for free",
      location: "navbar",
    });
  };

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `h-16 flex items-center gap-2 px-3 border-b-2 font-medium text-[14px] transition-all duration-200 ${
      isActive(path)
        ? "text-accent border-accent"
        : "text-[#4A5565] border-transparent hover:text-accent"
    }`;

  // If we have a session, we can show auth nav immediately without waiting for mount
  // to avoid a flash of unauthenticated state, since server components pass the user down.
  const showAuthNav = session;

  return (
    <header className="w-full h-16 bg-surface px-6 border-b border-border flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="JobPilot Logo" width={32} height={32} />
        <span className="text-[19px] font-bold text-text-darkest">JobPilot</span>
      </Link>
      
      {showAuthNav && (
        <nav className="hidden md:flex items-center gap-4 h-full">
          <Link href="/dashboard" className={navLinkClass("/dashboard")}>
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </Link>
          <Link href="/find-jobs" className={navLinkClass("/find-jobs")}>
            <Search size={16} />
            <span>Find Jobs</span>
          </Link>
          <Link href="/profile" className={navLinkClass("/profile")}>
            <User size={16} />
            <span>Profile</span>
          </Link>
        </nav>
      )}

      <div className="flex items-center gap-4">
        {showAuthNav ? (
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="secondary" className="px-5">
              Sign out
            </Button>
          </form>
        ) : mounted ? (
          <Link href="/login" onClick={handleTrackCTA}>
            <Button variant="primary" className="px-5">Start for free</Button>
          </Link>
        ) : (
          // Render nothing during SSR to avoid hydration mismatch when no user is passed
          <div className="w-24 h-9" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
