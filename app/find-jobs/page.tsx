import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { Navbar } from "@/components/layout/Navbar";
import { FindJobsSearch } from "@/components/find-jobs/FindJobsSearch";
import { FindJobsFilter } from "@/components/find-jobs/FindJobsFilter";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { MATCH_THRESHOLD } from "@/lib/utils";

type JobRow = {
  id: string;
  company: string;
  title: string;
  match_score: number;
  salary: string | null;
  found_at: string;
};

type SearchParams = {
  q?: string;
  match?: string;
  sort?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function FindJobsPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const insforge = createServerClient({ cookies: cookieStore });
  const { data: userData } = await insforge.auth.getCurrentUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const match = resolvedParams.match || "all";
  const sort = resolvedParams.sort || "score";
  const page = parseInt(resolvedParams.page || "1", 10);
  const pageSize = 20;

  // Build base query
  let query = insforge.database
    .from("jobs")
    .select("id, company, title, match_score, salary, found_at", { count: "exact" })
    .eq("user_id", userData.user.id);

  // Apply Search
  if (q) {
    query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
  }

  // Apply Match filter
  if (match === "high") {
    query = query.gte("match_score", MATCH_THRESHOLD);
  } else if (match === "low") {
    query = query.lt("match_score", MATCH_THRESHOLD);
  }

  // Apply Sort
  if (sort === "score") {
    query = query.order("match_score", { ascending: false }).order("found_at", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("found_at", { ascending: false });
  } else if (sort === "oldest") {
    query = query.order("found_at", { ascending: true });
  }

  // Apply Pagination range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: jobs, count, error } = await query;

  if (error) {
    console.error("[FindJobsPage] DB error:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData.user} />
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-8 py-8 flex flex-col gap-6 min-h-[calc(100vh-64px)]">
        <FindJobsSearch />
        <FindJobsFilter initialQ={q} initialMatch={match} initialSort={sort} />
        <JobsTable
          jobs={(jobs ?? []) as JobRow[]}
          currentPage={page}
          totalCount={count ?? 0}
          pageSize={pageSize}
        />
      </main>
    </div>
  );
}

