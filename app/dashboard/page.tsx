import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";
import { calculateCompletion } from "@/actions/profile";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  CompanyResearchChart,
  JobsFoundChart,
  MatchScoreChart,
} from "@/components/dashboard/AnalyticsCharts";
import { getAnalyticsData } from "@/lib/posthog-api";

export const metadata = {
  title: "Dashboard — JobPilot",
};

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error: authError,
  } = await insforge.auth.getCurrentUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch profile record from database
  const { data: profile } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Compute percentage and missing fields
  const { percentage, missingFields } = await calculateCompletion(profile || {});

  // Fetch chart data from PostHog
  const { researchData, jobsData, matchData } = await getAnalyticsData(user.id);

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar user={user} />

      {/* Content */}
      <main className="w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6">
        {percentage < 100 && (
          <div className="w-full">
            <CompletionIndicator
              percentage={percentage}
              missingFields={missingFields}
            />
          </div>
        )}

        <StatsBar userId={user.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RecentActivity userId={user.id} />
          </div>
          <div className="lg:col-span-2">
            <CompanyResearchChart data={researchData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <JobsFoundChart data={jobsData} />
          </div>
          <div className="lg:col-span-1">
            <MatchScoreChart data={matchData} />
          </div>
        </div>
      </main>
    </div>
  );
}
