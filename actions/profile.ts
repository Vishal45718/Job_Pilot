"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";

// Define the required fields for completion checks
const REQUIRED_FIELDS = [
  "full_name",
  "phone",
  "location",
  "work_authorization",
  "current_title",
  "experience_level",
  "years_experience",
  "skills",
  "degree",
  "field_of_study",
  "institution",
  "graduation_year",
] as const;

export type ProfileFormInput = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string;
  }>;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  jobTitlesSeeking: string[];
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string[];
  coverLetterTone: string;
};

// Calculate completion details
export function calculateCompletion(profile: Record<string, any>) {
  const missing: string[] = [];
  let filledCount = 0;

  REQUIRED_FIELDS.forEach((field) => {
    const value = profile[field];
    let isFilled = false;

    if (Array.isArray(value)) {
      isFilled = value.length > 0;
    } else if (value !== null && value !== undefined && value !== "") {
      isFilled = true;
    }

    if (isFilled) {
      filledCount++;
    } else {
      // Return uppercase missing tags consistent with Feature 05 UI
      missing.push(field.toUpperCase());
    }
  });

  const percentage = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);

  return {
    percentage,
    missingFields: missing,
    isComplete: percentage === 100,
  };
}

/**
 * Saves or updates the current user's profile in the database.
 */
export async function saveProfile(data: ProfileFormInput) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Map form state keys to database column names
    const dbProfileData = {
      id: user.id,
      full_name: data.fullName,
      email: user.email, // Always keep email from auth
      phone: data.phone,
      location: data.location,
      linkedin_url: data.linkedinUrl,
      portfolio_url: data.portfolioUrl,
      work_authorization: data.workAuthorization,
      current_title: data.currentTitle,
      experience_level: data.experienceLevel,
      years_experience: data.yearsExperience ? parseInt(data.yearsExperience, 10) : null,
      skills: data.skills,
      industries: data.industries,
      work_experience: data.workExperience,
      education: {
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        institution: data.institution,
        graduationYear: data.graduationYear,
      },
      job_titles_seeking: data.jobTitlesSeeking,
      remote_preference: data.remotePreference,
      salary_expectation: data.salaryExpectation,
      preferred_locations: data.preferredLocations,
      cover_letter_tone: data.coverLetterTone,
    };

    // Calculate completion metrics
    const { isComplete } = calculateCompletion(dbProfileData);

    // Fetch existing profile to check transition state for PostHog event tracking
    const { data: existingProfile } = await insforge
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .single();

    const wasCompleteBefore = existingProfile?.is_complete ?? false;

    // Upsert the profile record
    const { error: dbError } = await insforge
      .from("profiles")
      .upsert({
        ...dbProfileData,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("[actions/profile] save db error:", dbError);
      return { success: false, error: "Failed to update profile database record" };
    }

    // Track PostHog event when transitions to complete for first time
    if (isComplete && !wasCompleteBefore) {
      try {
        const ph = createPostHogServer();
        ph.capture({
          distinctId: user.id,
          event: "profile_completed",
          properties: {
            userId: user.id,
          },
        });
        await ph.shutdown();
      } catch (phError) {
        console.error("[actions/profile] posthog error:", phError);
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[actions/profile] save profile error:", error);
    return { success: false, error: "An unexpected error occurred while saving profile" };
  }
}

/**
 * Uploads a resume PDF to storage and updates the profile's resume_pdf_url.
 */
export async function uploadResume(fileBase64: string, fileName: string) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Convert base64 back to Buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // Upload to InsForge Storage bucket 'resumes' at resumes/{user_id}/resume.pdf
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(`${user.id}/resume.pdf`, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[actions/profile] upload storage error:", uploadError);
      return { success: false, error: "Failed to upload resume file to storage" };
    }

    // Get public URL of the uploaded resume
    const { data: urlData } = insforge.storage
      .from("resumes")
      .getPublicUrl(`${user.id}/resume.pdf`);

    if (!urlData?.publicUrl) {
      return { success: false, error: "Failed to retrieve public URL for uploaded resume" };
    }

    // Update the profiles table with the new resume PDF URL
    const { error: updateError } = await insforge
      .from("profiles")
      .update({
        resume_pdf_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[actions/profile] profile update error:", updateError);
      return { success: false, error: "Failed to update profile resume URL" };
    }

    revalidatePath("/profile");
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("[actions/profile] upload resume error:", error);
    return { success: false, error: "An unexpected error occurred while uploading resume" };
  }
}
