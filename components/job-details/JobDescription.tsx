import { FileText } from "lucide-react";
import Link from "next/link";

type Props = {
  description: string;
  externalUrl?: string | null;
};

export function JobDescription({ description, externalUrl }: Props) {
  // Check if description ends with an ellipsis indicating it was truncated by the API
  const isTruncated = description.trim().endsWith("...") || description.trim().endsWith("…");

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-secondary shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <h2 className="text-[16px] font-semibold text-text-primary">
          Job Description
        </h2>
      </div>
      <p className="text-[14px] font-medium text-text-primary leading-relaxed whitespace-pre-wrap">
        {description}
      </p>

      {isTruncated && externalUrl && (
        <div className="mt-4 p-5 rounded-xl border border-border bg-surface-secondary/50 flex flex-col gap-4">
          <p className="text-[14px] text-text-secondary">
            This job board provided a preview that ends mid-sentence. Open the original listing to read the full description.
          </p>
          <div>
            <Link
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-4 py-2 inline-flex items-center justify-center transition-colors text-[14px] bg-surface hover:bg-surface-secondary border border-border text-text-primary font-medium"
            >
              View Full Job Post
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
