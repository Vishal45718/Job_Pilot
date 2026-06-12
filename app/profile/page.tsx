import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createInsforgeServer } from "@/lib/insforge-server";
import { calculateCompletion, ProfileFormInput } from "@/actions/profile";

export const metadata: Metadata = {
  title: "Profile — JobPilot",
  description:
    "Set up your profile so JobPilot can match you to the best jobs.",
};

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data: { user }, error: authError } = await insforge.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch profile record from database
  const { data: profile } = await insforge
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Compute percentage and missing fields
  const { percentage, missingFields } = calculateCompletion(profile || {});

  // Pre-map database fields to UI FormState shape
  const initialFormState: ProfileFormInput = {
    fullName: profile?.full_name || "",
    email: user.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    linkedinUrl: profile?.linkedin_url || "",
    portfolioUrl: profile?.portfolio_url || "",
    workAuthorization: profile?.work_authorization || "",
    currentTitle: profile?.current_title || "",
    experienceLevel: profile?.experience_level || "",
    yearsExperience: profile?.years_experience ? String(profile.years_experience) : "",
    skills: profile?.skills || [],
    industries: profile?.industries || [],
    workExperience: profile?.work_experience || [],
    degree: profile?.education?.degree || "",
    fieldOfStudy: profile?.education?.fieldOfStudy || "",
    institution: profile?.education?.institution || "",
    graduationYear: profile?.education?.graduationYear || "",
    jobTitlesSeeking: profile?.job_titles_seeking || [],
    remotePreference: profile?.remote_preference || "",
    salaryExpectation: profile?.salary_expectation || "",
    preferredLocations: profile?.preferred_locations || [],
    coverLetterTone: profile?.cover_letter_tone || "",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="w-full max-w-[1440px] mx-auto px-8 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-[24px] font-bold text-text-primary leading-8">
            Your Profile
          </h1>
          <p className="text-[14px] text-text-secondary mt-1">
            Keep your profile up to date so the AI can match you accurately.
          </p>
        </div>

        <CompletionIndicator
          percentage={percentage}
          missingFields={missingFields}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Main form — left column */}
          <ProfileForm initialData={initialFormState} />

          {/* Resume sidebar — right column */}
          <div className="lg:sticky lg:top-8">
            <ResumeUpload resumeUrl={profile?.resume_pdf_url || null} />
          </div>
        </div>
      </main>
    </div>
  );
}

