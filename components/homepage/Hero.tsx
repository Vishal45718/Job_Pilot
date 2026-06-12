"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { posthog } from "@/lib/posthog-client";

export function Hero() {
  const handleTrackCTA = (ctaName: string) => {
    posthog.capture("homepage_cta_clicked", {
      ctaName,
      location: "hero",
    });
  };

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center pt-24 pb-16 px-6 text-center">
      <div className="absolute inset-0 pointer-events-none -z-10 bg-gradient-to-br from-info-lightest via-background to-accent-light opacity-50" />
      
      <h1 className="text-4xl md:text-6xl font-bold text-text-primary max-w-3xl leading-tight tracking-tight">
        Job hunting is hard.<br />Your tools shouldn't be.
      </h1>
      <p className="mt-6 text-lg text-text-secondary max-w-2xl">
        Stop applying blind. JobPilot finds the jobs, researches the companies, and gives you everything you need to stand out.
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

      <div className="mt-16 w-full max-w-5xl rounded-xl border border-border bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden p-2">
        <div className="bg-background rounded-lg overflow-hidden border border-border">
          <Image 
            src="/images/dashboard-demo.png" 
            alt="Dashboard preview" 
            width={1200} 
            height={800} 
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
