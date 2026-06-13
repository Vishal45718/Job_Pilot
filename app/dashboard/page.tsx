import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const insforge = createServerClient({ cookies: cookieStore });
  const { data } = await insforge.auth.getCurrentUser();

  if (!data?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={data.user} />

      {/* Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-4 px-4">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-success-lightest rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-[19px] font-bold text-text-darkest mb-1">You&apos;re signed in!</h1>
          <p className="text-[14px] text-text-secondary mb-1">
            Welcome, <span className="text-text-primary font-medium">{data.user.email}</span>
          </p>
          <p className="text-[13px] text-text-muted">
            Dashboard is coming soon. Check back after Phase 5 of the build plan.
          </p>
        </div>
      </main>
    </div>
  );
}
