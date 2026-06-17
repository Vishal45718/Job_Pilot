import { unstable_cache } from "next/cache";

export type ChartData = {
  researchData: { day: string; value: number }[];
  jobsData: { day: string; value: number }[];
  matchData: { range: string; value: number }[];
};

export async function getAnalyticsData(userId: string): Promise<ChartData> {
  const token = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = "https://us.posthog.com";

  if (!token || !projectId) {
    return {
      researchData: [],
      jobsData: [],
      matchData: [],
    };
  }

  // 1. Company Researched (last 7 days)
  const researchQuery = `
    SELECT
      toStartOfDay(timestamp) AS day,
      count() AS value
    FROM events
    WHERE event = 'company_researched'
      AND distinct_id = '${userId}'
      AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY day
    ORDER BY day ASC
  `;

  // 2. Jobs Found (last 30 days)
  const jobsQuery = `
    SELECT
      toStartOfDay(timestamp) AS day,
      count() AS value
    FROM events
    WHERE event = 'job_found'
      AND distinct_id = '${userId}'
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY day
    ORDER BY day ASC
  `;

  // 3. Match Score Distribution
  const matchQuery = `
    SELECT
      JSONExtractInt(properties, 'matchScore') AS score
    FROM events
    WHERE event = 'job_found'
      AND distinct_id = '${userId}'
  `;

  const executeQuery = async (query: string) => {
    try {
      const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query,
          },
        }),
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        console.error(`[posthog-api] Failed to fetch query: ${res.status}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(`[posthog-api] Exception:`, err);
      return null;
    }
  };

  const [researchRes, jobsRes, matchRes] = await Promise.all([
    executeQuery(researchQuery),
    executeQuery(jobsQuery),
    executeQuery(matchQuery),
  ]);

  // Helper to get local date strings to match HogQL (which returns UTC but we align to days)
  function formatLocalDate(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatWeekday(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  function formatMonthDay(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Process Research Data (last 7 days)
  const researchDataMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    researchDataMap.set(formatLocalDate(d), 0);
  }

  if (researchRes?.results) {
    for (const [day, value] of researchRes.results) {
      const dateStr = String(day).split(" ")[0];
      if (researchDataMap.has(dateStr)) {
        researchDataMap.set(dateStr, Number(value));
      }
    }
  }

  const researchData = Array.from(researchDataMap.entries()).map(([dateStr, value]) => ({
    day: formatWeekday(dateStr),
    value,
  }));

  // Process Jobs Data (last 30 days)
  const jobsDataMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    jobsDataMap.set(formatLocalDate(d), 0);
  }

  if (jobsRes?.results) {
    for (const [day, value] of jobsRes.results) {
      const dateStr = String(day).split(" ")[0];
      if (jobsDataMap.has(dateStr)) {
        jobsDataMap.set(dateStr, Number(value));
      }
    }
  }

  const jobsData = Array.from(jobsDataMap.entries()).map(([dateStr, value]) => ({
    day: formatMonthDay(dateStr),
    value,
  }));

  // Process Match Score Distribution
  let m50 = 0,
    m60 = 0,
    m70 = 0,
    m80 = 0,
    m90 = 0;
  if (matchRes?.results) {
    for (const [score] of matchRes.results) {
      const s = Number(score);
      if (s >= 90) m90++;
      else if (s >= 80) m80++;
      else if (s >= 70) m70++;
      else if (s >= 60) m60++;
      else if (s >= 50) m50++;
    }
  }

  const matchData = [
    { range: "50-60%", value: m50 },
    { range: "60-70%", value: m60 },
    { range: "70-80%", value: m70 },
    { range: "80-90%", value: m80 },
    { range: "90-100%", value: m90 },
  ];

  return {
    researchData,
    jobsData,
    matchData,
  };
}
