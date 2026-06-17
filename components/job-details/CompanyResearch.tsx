"use client";

import { useState, useEffect } from "react";
import { Building, Search, ExternalLink, Loader2, Target, CheckCircle2, AlertCircle, MessageCircle, HelpCircle } from "lucide-react";
import { checkCompanyResearchStatus } from "@/actions/jobs";

type Dossier = {
  companyOverview?: string;
  techStack?: string[];
  culture?: string[];
  whyThisRole?: string;
  yourEdge?: string[];
  gapsToAddress?: string[];
  smartQuestions?: string[];
  interviewPrep?: string[];
  sources?: string[];
  error?: string;
};

type Props = {
  jobId: string;
  companyName: string;
  initialResearch?: Dossier | null;
};

export function CompanyResearch({ jobId, companyName, initialResearch }: Props) {
  const [research, setResearch] = useState<Dossier | null>(initialResearch || null);
  const [status, setStatus] = useState<"idle" | "loading" | "complete">(
    initialResearch && !initialResearch.error ? "complete" : "idle"
  );
  const [error, setError] = useState<string | null>(initialResearch?.error || null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (status === "loading") {
      intervalId = setInterval(async () => {
        try {
          const res = await checkCompanyResearchStatus(jobId);
          if (res.success && res.companyResearch) {
            setResearch(res.companyResearch as Dossier);
            if ((res.companyResearch as Dossier).error) {
              setStatus("idle");
              setError((res.companyResearch as Dossier).error!);
            } else {
              setStatus("complete");
            }
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 5000); // poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, jobId]);

  const handleResearch = async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to start research");
        setStatus("idle");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setStatus("idle");
    }
  };

  if (status === "idle") {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <h2 className="text-[16px] font-semibold text-text-primary">
              Company Research
            </h2>
          </div>
          <button 
            onClick={handleResearch}
            className="bg-accent text-white hover:bg-accent-dark rounded-md px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Research Company
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-[14px]">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="w-14 h-14 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-muted mb-5 shadow-sm">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
            No research yet
          </h3>
          <p className="text-[14px] text-text-muted max-w-sm leading-relaxed">
            Click &quot;Research Company&quot; to let the AI browse {companyName}&apos;s public pages and build a personalized candidate dossier.
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent shrink-0 animate-pulse">
            <Building className="w-4 h-4" />
          </div>
          <h2 className="text-[16px] font-semibold text-text-primary">
            Researching {companyName}...
          </h2>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-[14px] text-text-secondary animate-pulse">
            Navigating company website and synthesizing candidate strategy...
          </p>
          <p className="text-[12px] text-text-muted mt-2">
            This may take 1-2 minutes depending on the website.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between gap-4 bg-surface-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent shrink-0">
            <Building className="w-4 h-4" />
          </div>
          <h2 className="text-[16px] font-semibold text-text-primary">
            Company Research: {companyName}
          </h2>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* Company Overview */}
        {research?.companyOverview && (
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary mb-2 uppercase tracking-wide">Company Overview</h3>
            <p className="text-[14px] text-text-secondary leading-relaxed">{research.companyOverview}</p>
          </div>
        )}

        {/* Tech Stack */}
        {research?.techStack && research.techStack.length > 0 && (
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary mb-3 uppercase tracking-wide">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {research.techStack.map((tech, i) => (
                <span key={i} className="px-3 py-1 bg-surface-secondary border border-border rounded-md text-[13px] text-text-secondary">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Culture */}
          {research?.culture && research.culture.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-text-muted" />
                <h3 className="text-[14px] font-semibold text-text-primary uppercase tracking-wide">Culture & Values</h3>
              </div>
              <ul className="space-y-2">
                {research.culture.map((c, i) => (
                  <li key={i} className="text-[14px] text-text-secondary flex items-start gap-2">
                    <span className="text-border mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why This Role */}
          {research?.whyThisRole && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-text-muted" />
                <h3 className="text-[14px] font-semibold text-text-primary uppercase tracking-wide">Why This Role</h3>
              </div>
              <p className="text-[14px] text-text-secondary leading-relaxed">{research.whyThisRole}</p>
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Your Edge */}
        {research?.yourEdge && research.yourEdge.length > 0 && (
          <div className="bg-[#f0fdf4] dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
              <h3 className="text-[14px] font-semibold text-green-800 dark:text-green-400 uppercase tracking-wide">Your Edge</h3>
            </div>
            <ul className="space-y-3">
              {research.yourEdge.map((edge, i) => (
                <li key={i} className="text-[14px] text-green-800 dark:text-green-300/80 leading-relaxed">
                  {edge}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps to Address */}
        {research?.gapsToAddress && research.gapsToAddress.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <h3 className="text-[14px] font-semibold text-text-primary uppercase tracking-wide">Strategy for Gaps</h3>
            </div>
            <ul className="space-y-3">
              {research.gapsToAddress.map((gap, i) => (
                <li key={i} className="text-[14px] text-text-secondary leading-relaxed flex items-start gap-2">
                  <span className="text-orange-500/50 mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interview Prep & Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {research?.interviewPrep && research.interviewPrep.length > 0 && (
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary mb-3 uppercase tracking-wide">Interview Prep</h3>
              <ul className="space-y-2">
                {research.interviewPrep.map((prep, i) => (
                  <li key={i} className="text-[14px] text-text-secondary flex items-start gap-2">
                    <span className="text-border mt-0.5">•</span>
                    <span>{prep}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {research?.smartQuestions && research.smartQuestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-text-muted" />
                <h3 className="text-[14px] font-semibold text-text-primary uppercase tracking-wide">Smart Questions to Ask</h3>
              </div>
              <ul className="space-y-2">
                {research.smartQuestions.map((q, i) => (
                  <li key={i} className="text-[14px] text-text-secondary flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">Q:</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sources */}
        {research?.sources && research.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-2 items-center text-[12px] text-text-muted">
            <span className="font-medium">Sources:</span>
            {research.sources.map((src, i) => {
              // If it's a URL, make it a link, otherwise text
              if (src.startsWith('http')) {
                const domain = new URL(src).hostname.replace('www.', '');
                return (
                  <a key={i} href={src} target="_blank" rel="noreferrer" className="hover:text-accent flex items-center gap-1 transition-colors">
                    {domain} <ExternalLink className="w-3 h-3" />
                  </a>
                );
              }
              return <span key={i}>{src}</span>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
