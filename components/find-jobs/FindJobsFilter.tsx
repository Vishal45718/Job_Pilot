"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  initialQ: string;
  initialMatch: string;
  initialSort: string;
};

export function FindJobsFilter({ initialQ, initialMatch, initialSort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);

  // Sync state if initialQ changes from outside
  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 when changing filters/search
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateParam("q", q.trim());
    }
  };

  const handleSearchBlur = () => {
    updateParam("q", q.trim());
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      {/* Search Input */}
      <div className="relative w-full md:w-[320px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-text-muted" />
        </div>
        <input
          type="text"
          placeholder="Filter by company or role..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
          className="w-full pl-9 pr-3 py-2 border-none bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>

      {/* Selects */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <select
            value={initialMatch}
            onChange={(e) => updateParam("match", e.target.value)}
            className="w-full md:w-[150px] appearance-none bg-surface border border-border rounded-md px-3 py-2 pr-8 text-[14px] text-text-primary outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
          >
            <option value="all">All Matches</option>
            <option value="high">High Match</option>
            <option value="low">Low Match</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          </div>
        </div>

        <div className="relative w-full md:w-auto">
          <select
            value={initialSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-full md:w-[150px] appearance-none bg-surface border border-border rounded-md px-3 py-2 pr-8 text-[14px] text-text-primary outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
          >
            <option value="score">Match Score</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}

