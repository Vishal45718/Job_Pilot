"use client";

type Props = {
  percentage: number;
  missingFields: string[];
};

// Map database uppercase required fields to clean user-friendly labels
const FIELD_LABEL_MAP: Record<string, string> = {
  FULL_NAME: "FULL NAME",
  PHONE: "PHONE",
  LOCATION: "LOCATION",
  WORK_AUTHORIZATION: "WORK AUTHORIZATION",
  CURRENT_TITLE: "JOB TITLE",
  EXPERIENCE_LEVEL: "EXPERIENCE LEVEL",
  YEARS_EXPERIENCE: "YEARS OF EXPERIENCE",
  SKILLS: "SKILLS",
  DEGREE: "EDUCATION",
  FIELD_OF_STUDY: "EDUCATION",
  INSTITUTION: "EDUCATION",
  GRADUATION_YEAR: "EDUCATION",
};

export function CompletionIndicator({ percentage, missingFields }: Props) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ringColor =
    percentage >= 80
      ? "var(--color-success)"
      : percentage >= 50
        ? "var(--color-warning)"
        : "var(--color-error)";

  // Deduplicate mapped labels (e.g. DEGREE, FIELD_OF_STUDY, etc. all map to EDUCATION)
  const uniqueMissingLabels = Array.from(
    new Set(missingFields.map((field) => FIELD_LABEL_MAP[field] || field))
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-5">
      {/* Text + tags */}
      <div className="flex flex-col gap-2 min-w-0">
        <div>
          <p className="text-[16px] font-semibold text-text-primary leading-6">
            Profile needs attention
          </p>
          <p className="text-[13px] text-text-secondary leading-5 mt-0.5">
            Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes.
          </p>
        </div>

        {uniqueMissingLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {uniqueMissingLabels.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-[#FEE2E2] text-[#EF4444] uppercase"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SVG progress ring */}
      <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="6"
          />
          {/* Fill */}
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 36}
            strokeDashoffset={2 * Math.PI * 36 - (percentage / 100) * 2 * Math.PI * 36}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Percentage label */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[18px] font-bold text-text-primary"
          aria-label={`${percentage}% complete`}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}

