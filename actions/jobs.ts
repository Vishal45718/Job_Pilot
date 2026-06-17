"use server";

import { createInsforgeServer } from "@/lib/insforge-server";

export async function checkCompanyResearchStatus(jobId: string) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await insforge.database
      .from("jobs")
      .select("company_research")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return { success: false, error: "Failed to fetch job status" };
    }

    if (data && data.company_research) {
      return { success: true, companyResearch: data.company_research };
    }

    return { success: true, companyResearch: null };
  } catch (err) {
    console.error("[actions/jobs] Error checking research status", err);
    return { success: false, error: "Internal error" };
  }
}
