import { createInsforgeServer } from "@/lib/insforge-server";

export async function StatsBar({ userId }: { userId: string }) {
  const insforge = await createInsforgeServer();

  const { data: jobsData } = await insforge.database
    .from("jobs")
    .select("match_score, company_research, found_at")
    .eq("user_id", userId);

  const jobs = jobsData || [];

  const totalJobs = jobs.length;

  let matchScoreSum = 0;
  let matchScoreCount = 0;

  let matchScoreSumLastWeek = 0;
  let matchScoreCountLastWeek = 0;

  let companiesResearched = 0;
  let jobsThisWeek = 0;
  let jobsLastWeek = 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  jobs.forEach((job) => {
    // found_at might be null in rare edge cases, fallback to now
    const foundAt = job.found_at ? new Date(job.found_at) : new Date();

    if (job.match_score !== null) {
      matchScoreSum += job.match_score;
      matchScoreCount++;
      if (foundAt < sevenDaysAgo && foundAt >= fourteenDaysAgo) {
        matchScoreSumLastWeek += job.match_score;
        matchScoreCountLastWeek++;
      }
    }

    if (job.company_research !== null) {
      companiesResearched++;
    }

    if (foundAt >= sevenDaysAgo) {
      jobsThisWeek++;
    } else if (foundAt >= fourteenDaysAgo) {
      jobsLastWeek++;
    }
  });

  const avgMatchRate = matchScoreCount
    ? Math.round(matchScoreSum / matchScoreCount)
    : 0;
  const avgMatchRateLastWeek = matchScoreCountLastWeek
    ? Math.round(matchScoreSumLastWeek / matchScoreCountLastWeek)
    : 0;

  let jobsTrend = 0;
  if (jobsLastWeek > 0) {
    jobsTrend = Math.round(((jobsThisWeek - jobsLastWeek) / jobsLastWeek) * 100);
  } else if (jobsThisWeek > 0) {
    jobsTrend = 100;
  }

  const matchTrend = avgMatchRate - avgMatchRateLastWeek;

  const MOCK_STATS = [
    {
      title: "Total Jobs Found",
      value: totalJobs.toString(),
      trend: jobsTrend > 0 ? `+${jobsTrend}%` : jobsTrend < 0 ? `${jobsTrend}%` : null,
      trendLabel: "vs last week",
    },
    {
      title: "Avg. Match Rate",
      value: `${avgMatchRate}%`,
      trend: matchTrend > 0 ? `+${matchTrend}%` : matchTrend < 0 ? `${matchTrend}%` : null,
      trendLabel: "vs last week",
    },
    {
      title: "Companies Researched",
      value: companiesResearched.toString(),
      subtitle: "Total researched",
    },
    {
      title: "Jobs This Week",
      value: jobsThisWeek.toString(),
      subtitle: "New this week",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {MOCK_STATS.map((stat, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <h3 className="text-[14px] font-medium text-text-secondary mb-2">
            {stat.title}
          </h3>
          <div className="text-[30px] font-semibold text-text-primary mb-2 leading-none">
            {stat.value}
          </div>
          <div className="flex items-center gap-2">
            {stat.trend ? (
              <>
                <span
                  className={`${
                    stat.trend.startsWith("+")
                      ? "bg-success-lightest text-success-darker"
                      : "bg-error-light text-error-darker" // Assuming negative trends might be bad
                  } rounded-sm px-2 py-0.5 text-[12px] font-medium`}
                >
                  {stat.trend}
                </span>
                <span className="text-[12px] text-text-muted">
                  {stat.trendLabel}
                </span>
              </>
            ) : (
              <span className="text-[12px] text-text-muted">
                {stat.subtitle || stat.trendLabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
