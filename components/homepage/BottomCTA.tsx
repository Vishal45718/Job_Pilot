"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { posthog } from "@/lib/posthog-client";

export function BottomCTA() {
  const handleTrackCTA = (ctaName: string) => {
    posthog.capture("homepage_cta_clicked", {
      ctaName,
      location: "bottom_cta",
    });
  };

  return (
    <section className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden border-t border-border">
      <div className="absolute inset-0 pointer-events-none -z-10 bg-gradient-to-br from-info-lightest via-background to-accent-light opacity-50" />
      
      <div className="max-w-2xl flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary leading-tight tracking-tight">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mt-6 text-[16px] text-text-secondary">
          Set up your profile, upload your resume, and start finding matches in minutes.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login" onClick={() => handleTrackCTA("Get Started")}>
            <Button variant="primary" className="h-12 px-6 rounded-lg">
              Get Started <span className="ml-2 opacity-70">▶</span>
            </Button>
          </Link>
          <Link href="/login" onClick={() => handleTrackCTA("Find Your First Match")}>
            <Button variant="secondary" className="h-12 px-6 rounded-lg font-medium">
              Find Your First Match
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
