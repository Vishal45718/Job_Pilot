"use client";

import { useState } from "react";
import { Search, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; totalFound: number; strongMatches: number }
  | { status: "error"; message: string };

export function FindJobsSearch() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const router = useRouter();

  async function handleSearch() {
    if (!jobTitle.trim()) {
      setSearchState({ status: "error", message: "Please enter a job title to search." });
      return;
    }

    setSearchState({ status: "loading" });

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), location: location.trim() }),
      });

      const json = (await response.json()) as {
        success: boolean;
        data?: { totalFound: number; strongMatches: number; runId: string };
        error?: string;
      };

      if (!json.success || !json.data) {
        setSearchState({
          status: "error",
          message: json.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setSearchState({
        status: "success",
        totalFound: json.data.totalFound,
        strongMatches: json.data.strongMatches,
      });

      // Refresh the page data so the jobs table reflects newly discovered jobs
      router.refresh();
    } catch {
      setSearchState({
        status: "error",
        message: "Network error — please check your connection and try again.",
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      void handleSearch();
    }
  }

  const isLoading = searchState.status === "loading";

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-end gap-4 w-full">
        {/* Job Title */}
        <div className="flex-1 w-full">
          <label
            htmlFor="job-title-input"
            className="block text-[12px] font-semibold text-text-secondary uppercase tracking-wide mb-2"
          >
            Job Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              id="job-title-input"
              type="text"
              placeholder="Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex-1 w-full">
          <label
            htmlFor="location-input"
            className="block text-[12px] font-semibold text-text-secondary uppercase tracking-wide mb-2"
          >
            Location
          </label>
          <input
            id="location-input"
            type="text"
            placeholder="Remote, New York..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Search Button */}
        <Button
          id="find-jobs-btn"
          variant="primary"
          className="h-[42px] px-6 flex-shrink-0"
          onClick={() => void handleSearch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Searching..." : "Find Jobs"}
        </Button>
      </div>

      {/* Status Banner */}
      {searchState.status === "loading" && (
        <div className="bg-accent-muted border border-accent-light rounded-lg px-4 py-3 flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-accent animate-spin flex-shrink-0" />
          <span className="text-[14px] font-medium text-accent">
            Searching jobs and scoring matches against your profile…
          </span>
        </div>
      )}

      {searchState.status === "success" && (
        <div className="bg-success-lightest border border-success-light rounded-lg px-4 py-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-success-darker flex-shrink-0" />
          <span className="text-[14px] font-medium text-success-darker">
            Found {searchState.totalFound} job{searchState.totalFound !== 1 ? "s" : ""} and saved{" "}
            {searchState.strongMatches} strong match{searchState.strongMatches !== 1 ? "es" : ""}.
          </span>
        </div>
      )}

      {searchState.status === "error" && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
          <span className="text-[14px] font-medium text-error">{searchState.message}</span>
        </div>
      )}
    </div>
  );
}
