import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createInsforgeServer } from "@/lib/insforge-server";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { JobDescription } from "@/components/job-details/JobDescription";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  
  if (!jobId) {
    notFound();
  }

  const insforge = await createInsforgeServer();
  
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: job, error } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <div className="max-w-[1440px] px-8 py-8 mx-auto flex flex-col gap-8">
      <div>
        <Link
          href="/find-jobs"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full pb-8">
        <JobInfo
          title={job.title}
          company={job.company}
          matchScore={job.match_score}
          salary={job.salary}
          location={job.location}
          jobType={job.job_type}
          foundAt={job.found_at}
          externalApplyUrl={job.external_apply_url || job.source_url}
        />

        <MatchScore
          matchReason={job.match_reason}
          matchedSkills={job.matched_skills || []}
          missingSkills={job.missing_skills || []}
        />

        <JobDescription 
          description={job.about_role || ""} 
          externalUrl={job.external_apply_url || job.source_url} 
        />

        <CompanyResearch 
          jobId={job.id} 
          companyName={job.company} 
          initialResearch={job.company_research} 
        />

        <JobActions
          company={job.company}
          externalApplyUrl={job.external_apply_url || job.source_url}
        />
      </div>
    </div>
  );
}
