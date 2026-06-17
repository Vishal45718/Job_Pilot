import { Sparkles, Check, X } from "lucide-react";

type Props = {
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export function MatchScore({ matchReason, matchedSkills, missingSkills }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success-lightest flex items-center justify-center text-success-foreground shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-widest text-text-secondary">
            AI Match Reasoning
          </span>
        </div>
        <p className="text-[14px] font-medium text-text-primary leading-relaxed">
          {matchReason}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <span className="text-[12px] font-bold uppercase tracking-widest text-text-secondary">
          Required Skills VS Your Profile
        </span>
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium text-text-secondary">You have</span>
            <div className="flex flex-wrap gap-2">
              {matchedSkills && matchedSkills.length > 0 ? (
                matchedSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-lightest text-success-foreground text-[13px] font-medium"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {skill}
                  </div>
                ))
              ) : (
                <span className="text-[13px] text-text-muted">None</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium text-text-secondary">Gap skills</span>
            <div className="flex flex-wrap gap-2">
              {missingSkills && missingSkills.length > 0 ? (
                missingSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-muted text-accent text-[13px] font-medium"
                  >
                    <X className="w-3.5 h-3.5" />
                    {skill}
                  </div>
                ))
              ) : (
                <span className="text-[13px] text-text-muted">None</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
