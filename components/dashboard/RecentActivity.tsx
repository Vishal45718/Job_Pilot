import { createInsforgeServer } from "@/lib/insforge-server";

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  if (interval === 1) return "Yesterday";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  if (interval === 1) return "1 hour ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " mins ago";
  return "Just now";
}

export async function RecentActivity({ userId }: { userId: string }) {
  const insforge = await createInsforgeServer();

  // Fetch recent agent runs
  const { data: runsData } = await insforge.database
    .from("agent_runs")
    .select("id, job_title_searched, jobs_found, completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(10);

  // Fetch recent company research
  const { data: researchesData } = await insforge.database
    .from("jobs")
    .select("id, company, found_at")
    .eq("user_id", userId)
    .not("company_research", "is", null)
    .order("found_at", { ascending: false })
    .limit(10);

  type Activity = {
    id: string;
    title: string;
    time: string;
    timestamp: number;
    type: "job_found" | "company_researched";
  };

  const activities: Activity[] = [];

  runsData?.forEach((run) => {
    if (run.completed_at && run.jobs_found) {
      const date = new Date(run.completed_at);
      activities.push({
        id: run.id,
        title: `Found ${run.jobs_found} jobs for ${run.job_title_searched}`,
        time: timeAgo(date),
        timestamp: date.getTime(),
        type: "job_found",
      });
    }
  });

  researchesData?.forEach((res) => {
    if (res.found_at) {
      const date = new Date(res.found_at);
      activities.push({
        id: res.id + "_research",
        title: `Researched ${res.company}`,
        time: timeAgo(date),
        timestamp: date.getTime(),
        type: "company_researched",
      });
    }
  });

  // Sort combined and take top 5
  activities.sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-[16px] font-semibold text-text-primary">
          Recent Activity
        </h2>
      </div>
      <div className="p-6 flex-1">
        {recentActivities.length === 0 ? (
          <div className="text-[14px] text-text-muted flex items-center justify-center h-full">
            No recent activity
          </div>
        ) : (
          <div className="flex flex-col">
            {recentActivities.map((activity, index) => {
              const isLast = index === recentActivities.length - 1;
              const isJob = activity.type === "job_found";

              const outerRing = isJob ? "bg-success-light" : "bg-accent-light";
              const innerDot = isJob ? "bg-success-alt" : "bg-accent";

              return (
                <div key={activity.id} className="flex relative">
                  {!isLast && (
                    <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-border-light" />
                  )}
                  <div className="mr-4 mt-1 relative z-10">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${outerRing} border-2 border-surface`}
                    >
                      <div className={`w-2 h-2 rounded-full ${innerDot}`} />
                    </div>
                  </div>
                  <div className="pb-8">
                    <p className="text-[14px] font-medium text-text-primary mb-1">
                      {activity.title}
                    </p>
                    <p className="text-[12px] text-text-muted">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
