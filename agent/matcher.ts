import OpenAI from "openai";
import type { AdzunaJob, ScoredJob, UserProfile } from "@/agent/types";

// OpenRouter exposes an OpenAI-compatible API — swap baseURL and use the
// existing openai package rather than introducing a new dependency.
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

type ScoreJobResult =
  | { success: true; scored: ScoredJob }
  | { success: false; error: string };

export async function scoreJob(
  job: AdzunaJob,
  profile: UserProfile,
): Promise<ScoreJobResult> {
  const systemPrompt = `You are a job matching assistant for a job seeker application. 
Given a job listing and a candidate profile, evaluate how well the candidate matches the role.

Return ONLY valid JSON with this exact shape:
{
  "matchScore": <integer 0-100>,
  "matchReason": "<one paragraph explanation of the match quality>",
  "matchedSkills": ["<skill1>", "<skill2>"],
  "missingSkills": ["<skill1>", "<skill2>"]
}

Scoring guidelines:
- matchScore 90-100: Exceptional fit — candidate has nearly all required skills and relevant experience
- matchScore 70-89: Strong fit — candidate meets most requirements
- matchScore 50-69: Partial fit — candidate meets some requirements but has notable gaps
- matchScore below 50: Weak fit — significant skill or experience mismatch
- matchedSkills: skills from the candidate's profile that appear in the job requirements
- missingSkills: skills explicitly required in the job that the candidate lacks
- Keep matchReason to 2-3 sentences maximum`;

  const userPrompt = `JOB LISTING:
Title: ${job.title}
Company: ${job.company.display_name}
Location: ${job.location.display_name}
Description: ${job.description}
Contract type: ${job.contract_type ?? "not specified"}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "not specified"}
Experience level: ${profile.experience_level ?? "not specified"}
Years of experience: ${profile.years_experience ?? "not specified"}
Skills: ${(profile.skills ?? []).join(", ") || "not specified"}
Job titles seeking: ${(profile.job_titles_seeking ?? []).join(", ") || "not specified"}
Work history: ${JSON.stringify(profile.work_experience ?? [])}`;

  try {
    const response = await openrouter.chat.completions.create({
      model: "openai/gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { success: false, error: "Empty response from model" };
    }

    const parsed = JSON.parse(content) as {
      matchScore?: unknown;
      matchReason?: unknown;
      matchedSkills?: unknown;
      missingSkills?: unknown;
    };

    const scored: ScoredJob = {
      matchScore:
        typeof parsed.matchScore === "number"
          ? Math.round(Math.min(100, Math.max(0, parsed.matchScore)))
          : 0,
      matchReason:
        typeof parsed.matchReason === "string" ? parsed.matchReason : "",
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? (parsed.matchedSkills as string[])
        : [],
      missingSkills: Array.isArray(parsed.missingSkills)
        ? (parsed.missingSkills as string[])
        : [],
    };

    return { success: true, scored };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
