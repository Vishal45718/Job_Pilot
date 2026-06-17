type Props = {
  company: string;
  externalApplyUrl: string;
};

export function JobActions({ company, externalApplyUrl }: Props) {
  return (
    <div className="w-full pt-4 pb-12">
      <a
        href={externalApplyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-accent text-white hover:bg-accent-dark rounded-xl h-[56px] text-[16px] font-semibold flex items-center justify-center transition-colors shadow-sm"
      >
        Apply Now at {company}
      </a>
    </div>
  );
}
