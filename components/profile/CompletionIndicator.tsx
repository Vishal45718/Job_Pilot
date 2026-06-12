"use client";

type Props = {
  percentage: number;
  missingFields: string[];
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

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-start gap-5">
      {/* SVG progress ring */}
      <div className="relative flex-shrink-0 w-16 h-16">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="5"
          />
          {/* Fill */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Percentage label */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[13px] font-600 text-text-primary"
          aria-label={`${percentage}% complete`}
        >
          {percentage}%
        </span>
      </div>

      {/* Text + tags */}
      <div className="flex flex-col gap-2 min-w-0">
        <div>
          <p className="text-[16px] font-semibold text-text-primary leading-6">
            Profile needs attention
          </p>
          <p className="text-[13px] text-text-muted leading-5 mt-0.5">
            Complete your profile so the AI can match you to the right roles.
          </p>
        </div>

        {missingFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {missingFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-accent-light text-accent uppercase"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
