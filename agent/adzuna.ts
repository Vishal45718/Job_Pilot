import { createInsforgeServer } from "@/lib/insforge-server";
import { searchJobs } from "@/lib/adzuna";
import { scoreJob } from "@/agent/matcher";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { UserProfile } from "@/agent/types";

type InsforgeClient = Awaited<ReturnType<typeof createInsforgeServer>>;

type DiscoverJobsResult =
  | { success: true; totalFound: number; strongMatches: number; runId: string }
  | { success: false; error: string };

function detectCountry(location: string): string {
  const lower = location.toLowerCase();
  if (
    lower.includes("uk") ||
    lower.includes("united kingdom") ||
    lower.includes("london") ||
    lower.includes("england")
  )
    return "gb";
  if (
    lower.includes("australia") ||
    lower.includes("sydney") ||
    lower.includes("melbourne")
  )
    return "au";
  if (
    lower.includes("canada") ||
    lower.includes("toronto") ||
    lower.includes("vancouver")
  )
    return "ca";
  return "us";
}

function formatSalary(job: {
  salary_min?: number;
  salary_max?: number;
}): string | null {
  if (!job.salary_min) return null;
  const min = Math.round(job.salary_min / 1000);
  const max = job.salary_max ? Math.round(job.salary_max / 1000) : null;
  return max ? `$${min}k - $${max}k` : `$${min}k+`;
}

export async function discoverJobs(
  jobTitle: string,
  location: string,
  userId: string,
): Promise<DiscoverJobsResult> {
  const insforge = await createInsforgeServer();

  // Create agent_run record immediately so we have a runId for all operations
  const { data: runData, error: runError } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location,
        started_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (runError || !runData) {
    return { success: false, error: "Failed to create agent run" };
  }

  const runId = (runData as { id: string }).id;

  try {
    // Load user profile for scoring — scoped to current user
    const { data: profileData, error: profileError } = await insforge.database
      .from("profiles")
      .select(
        "id, full_name, current_title, experience_level, years_experience, skills, work_experience, job_titles_seeking",
      )
      .eq("id", userId)
      .single();

    if (profileError || !profileData) {
      await markRunFailed(insforge, runId);
      return {
        success: false,
        error:
          "Profile not found — save your profile before searching for jobs",
      };
    }

    const profile = profileData as UserProfile;

    // Detect country from location text for the correct Adzuna regional endpoint
    const country = detectCountry(location);
    const adzunaJobs = await searchJobs(jobTitle, location, country);

    if (adzunaJobs.length === 0) {
      await insforge.database
        .from("agent_runs")
        .update({
          status: "completed",
          jobs_found: 0,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      return { success: true, totalFound: 0, strongMatches: 0, runId };
    }

    let strongMatches = 0;
    let savedCount = 0;

    for (const job of adzunaJobs) {
      const scoreResult = await scoreJob(job, profile);

      const scored = scoreResult.success
        ? scoreResult.scored
        : {
            matchScore: 0,
            matchReason: "",
            matchedSkills: [],
            missingSkills: [],
          };

      const { error: insertError } = await insforge.database
        .from("jobs")
        .insert([
          {
            run_id: runId,
            user_id: userId,
            source: "search",
            source_url: job.redirect_url,
            external_apply_url: job.redirect_url,
            title: job.title,
            company: job.company.display_name,
            location: job.location.display_name,
            salary: formatSalary(job),
            job_type: job.contract_type ?? "fulltime",
            about_role: job.description,
            match_score: scored.matchScore,
            match_reason: scored.matchReason,
            matched_skills: scored.matchedSkills,
            missing_skills: scored.missingSkills,
            found_at: new Date().toISOString(),
          },
        ]);

      if (!insertError) {
        savedCount++;
        if (scored.matchScore >= MATCH_THRESHOLD) {
          strongMatches++;
        }
      }
    }

    await insforge.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: savedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return { success: true, totalFound: savedCount, strongMatches, runId };
  } catch (error) {
    await markRunFailed(insforge, runId);
    return { success: false, error: String(error) };
  }
}

async function markRunFailed(
  insforge: InsforgeClient,
  runId: string,
): Promise<void> {
  await insforge.database
    .from("agent_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);
}
