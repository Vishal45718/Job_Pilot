"use client";

import { Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

type JobRow = {
  id: string;
  company: string;
  title: string;
  match_score: number;
  salary: string | null;
  found_at: string;
};

type Props = {
  jobs: JobRow[];
  currentPage: number;
  totalCount: number;
  pageSize: number;
};

function MatchScoreBar({ score }: { score: number }) {
  let trackFillClass = "bg-warning";
  if (score >= 90) {
    trackFillClass = "bg-success";
  } else if (score >= 70) {
    trackFillClass = "bg-success";
  } else if (score >= 50) {
    trackFillClass = "bg-warning";
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-[100px] h-1.5 bg-border-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${trackFillClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[14px] text-text-primary font-semibold">{score}%</span>
    </div>
  );
}

function formatFoundAt(isoDate: string): string {
  const now = new Date();
  const found = new Date(isoDate);
  const diffMs = now.getTime() - found.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return found.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function JobsTable({ jobs, currentPage, totalCount, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (jobs.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-secondary flex items-center justify-center">
          <Briefcase className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[15px] font-semibold text-text-primary">No jobs found yet</p>
          <p className="text-[13px] text-text-muted">
            Enter a job title above and click Find Jobs to discover matches.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const startResult = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalCount);

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (jobId: string) => {
    router.push(`/find-jobs/${jobId}`);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Salary Est.
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Date Found
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => handleRowClick(job.id)}
                className="hover:bg-surface-secondary transition-colors group cursor-pointer"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-border bg-surface-secondary flex items-center justify-center text-text-muted group-hover:bg-surface transition-colors">
                      <Building2 className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span className="text-[14px] font-bold text-text-primary">
                      {job.company}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[14px] font-medium text-text-primary">
                    {job.title}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <MatchScoreBar score={job.match_score} />
                </td>
                <td className="px-6 py-5">
                  <span className="text-[14px] text-text-secondary">
                    {job.salary ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[14px] text-text-secondary">
                    {formatFoundAt(job.found_at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[14px] text-text-secondary">
          Showing{" "}
          <span className="font-semibold text-text-primary">{startResult}</span> to{" "}
          <span className="font-semibold text-text-primary">{endResult}</span> of{" "}
          <span className="font-semibold text-text-primary">{totalCount}</span> results
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            className="px-3 py-1.5 h-auto text-[13px] bg-surface"
            disabled={currentPage <= 1}
            onClick={() => updatePage(currentPage - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant="secondary"
              className={`w-8 h-8 p-0 flex items-center justify-center text-[13px] transition-colors ${
                pageNumber === currentPage
                  ? "bg-accent text-accent-foreground border-accent font-medium"
                  : "bg-surface text-text-primary border-border hover:bg-surface-secondary"
              }`}
              onClick={() => updatePage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="secondary"
            className="px-3 py-1.5 h-auto text-[13px] bg-surface"
            disabled={currentPage >= totalPages}
            onClick={() => updatePage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

