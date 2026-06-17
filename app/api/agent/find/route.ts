import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { discoverJobs } from "@/agent/adzuna";
import { createPostHogServer } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (
      typeof body !== "object" ||
      body === null ||
      !("jobTitle" in body) ||
      !("location" in body) ||
      typeof (body as Record<string, unknown>).jobTitle !== "string" ||
      typeof (body as Record<string, unknown>).location !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "jobTitle and location are required" },
        { status: 400 },
      );
    }

    const { jobTitle, location } = body as { jobTitle: string; location: string };

    if (!jobTitle.trim()) {
      return NextResponse.json(
        { success: false, error: "Job title cannot be empty" },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !data?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = data.user.id;

    // Fire PostHog event before agent starts
    const posthog = createPostHogServer();
    posthog.capture({
      distinctId: userId,
      event: "job_search_started",
      properties: { userId, jobTitle, location },
    });
    await posthog.shutdown();

    const result = await discoverJobs(jobTitle.trim(), location.trim(), userId);

    if (!result.success) {
      console.error("[agent/find]", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalFound: result.totalFound,
        strongMatches: result.strongMatches,
        runId: result.runId,
      },
    });
  } catch (error) {
    console.error("[agent/find]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
