"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { posthog } from "@/lib/posthog-client";
import { insforge } from "@/lib/insforge-client";
import { useEffect, useState } from "react";

export function Navbar() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check active session
    insforge.auth.getCurrentUser().then(({ data: { user } }) => {
      setSession(user);
    });
  }, []);

  const handleTrackCTA = () => {
    posthog.capture("homepage_cta_clicked", {
      ctaName: "Start for free",
      location: "navbar",
    });
  };

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="w-full h-16 bg-surface px-6 border-b border-border flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="JobPilot Logo" width={32} height={32} />
        <span className="text-[19px] font-bold text-text-darkest">JobPilot</span>
      </Link>
      
      {session && (
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/find-jobs">
            <Button variant="ghost">Find Jobs</Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
        </nav>
      )}

      <div className="flex items-center gap-4">
        {session ? (
          <Button variant="secondary" onClick={handleSignOut} className="px-5">
            Sign out
          </Button>
        ) : (
          <Link href="/login" onClick={handleTrackCTA}>
            <Button variant="primary" className="px-5">Start for free</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
