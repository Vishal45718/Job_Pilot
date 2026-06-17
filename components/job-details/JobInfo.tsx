import { Building2, MapPin, Briefcase, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

type Props = {
  title: string;
  company: string;
  matchScore: number;
  salary: string | null;
  location: string;
  jobType: string;
  foundAt: string;
  externalApplyUrl: string;
};

export function JobInfo({
  title,
  company,
  matchScore,
  salary,
  location,
  jobType,
  foundAt,
  externalApplyUrl,
}: Props) {
  function getScoreBadgeClasses(score: number) {
    if (score >= 70) return "bg-success-lightest text-success-darker";
    return "bg-surface-secondary text-text-secondary";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl border border-border bg-surface-secondary flex items-center justify-center text-text-muted shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[24px] font-bold text-text-primary leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-[14px] text-text-secondary">
              <span className="font-medium">{company}</span>
              <span>•</span>
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[12px] ${getScoreBadgeClasses(matchScore)}`}>
                {matchScore}% Match Score
              </div>
            </div>
          </div>
        </div>
        {externalApplyUrl && (
          <a
            href={externalApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface border border-border rounded-md px-4 py-2 hover:bg-surface-secondary text-text-primary font-medium text-[14px] flex items-center justify-center gap-2 shrink-0 transition-colors"
          >
            View Job Post
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center text-success shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-text-primary">
              {salary || "—"}
            </span>
            <span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary mt-0.5">
              Salary Est.
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-info-lightest flex items-center justify-center text-info-medium shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-semibold text-text-primary truncate">
              {location || "—"}
            </span>
            <span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary mt-0.5">
              Location
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center text-accent shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-text-primary capitalize">
              {jobType || "—"}
            </span>
            <span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary mt-0.5">
              Job Type
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-secondary shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-text-primary">
              {foundAt ? formatTimeAgo(foundAt) : "—"}
            </span>
            <span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary mt-0.5">
              Date Found
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
