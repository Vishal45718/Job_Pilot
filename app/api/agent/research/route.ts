import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { runCompanyResearch } from "@/agent/research";
import { after } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (
      typeof body !== "object" ||
      body === null ||
      !("jobId" in body) ||
      typeof (body as Record<string, unknown>).jobId !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "jobId is required" },
        { status: 400 },
      );
    }

    const { jobId } = body as { jobId: string };

    console.log("RUN_COMPANY_RESEARCH_STARTED", jobId);

    const insforge = await createInsforgeServer();
    const { data, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !data?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = data.user.id;

    // Verify job belongs to user
    const { data: job, error: jobError } = await insforge.database
      .from("jobs")
      .select("id, company_research")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      );
    }

    // if already researched (and is not an error state), just return
    if (job.company_research && !(job.company_research as any).error) {
      return NextResponse.json(
        { success: true, message: "Research already complete" },
        { status: 200 }
      );
    }

    // Log DB record before run
    console.log("DB_RECORD_BEFORE_RUN", JSON.stringify(job));

    // Clear old error immediately to allow clean polling state
    console.log("CLEARING_DB_RECORD_BEFORE_RUN", jobId);
    await insforge.database
      .from("jobs")
      .update({ company_research: null })
      .eq("id", jobId)
      .eq("user_id", userId);

    // Run the research synchronously (blocking request) for local verification
    try {
      console.log("EXECUTING_RUN_COMPANY_RESEARCH", jobId);
      await runCompanyResearch(jobId, userId);
      console.log("RUN_COMPANY_RESEARCH_COMPLETED", jobId);
    } catch (err) {
      console.error("RUN_COMPANY_RESEARCH_FAILED", err);
    }

    // Log DB record after run
    const { data: afterJob } = await insforge.database
      .from("jobs")
      .select("id, company_research")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();
    console.log("DB_RECORD_AFTER_RUN", JSON.stringify(afterJob));

    return NextResponse.json(
      { success: true, message: "Research completed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/agent/research]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
