import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import OpenAI from "openai";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

// PDF Stylesheet conforming strictly to supported styles
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Helvetica",
    color: "#101828",
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 15,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#101828",
  },
  title: {
    fontSize: 12,
    color: "#7c5cfc", // Theme primary accent purple
    marginBottom: 6,
    fontWeight: "bold",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 9,
    color: "#6a7282",
    marginHorizontal: 6,
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#e7eaf3",
    marginVertical: 12,
    width: "100%",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#101828",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 9,
    color: "#364153",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    fontSize: 8.5,
    backgroundColor: "#f3e8ff", // bg-accent-light
    color: "#7c5cfc", // text-accent
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  job: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobTitleCompany: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#101828",
  },
  jobDates: {
    fontSize: 9,
    color: "#6a7282",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 10,
  },
  bulletPoint: {
    width: 8,
    fontSize: 9,
    color: "#7c5cfc",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#364153",
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  eduTitle: {
    fontSize: 10,
    fontWeight: "bold",
  },
  eduInstitution: {
    fontSize: 9,
    color: "#364153",
  },
});

interface ResumeProps {
  profile: any;
  enhanced: {
    summary: string;
    workExperience: Array<{
      company: string;
      title: string;
      responsibilities: string[];
    }>;
  };
}

// React PDF Resume Document component
const ResumeDocument = ({ profile, enhanced }: ResumeProps) => {
  const workHistory = profile.work_experience || [];
  const education = profile.education || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name || "Your Name"}</Text>
          {profile.current_title && (
            <Text style={styles.title}>{profile.current_title}</Text>
          )}
          <View style={styles.contactRow}>
            {profile.email && <Text style={styles.contactItem}>{profile.email}</Text>}
            {profile.phone && <Text style={styles.contactItem}>{profile.phone}</Text>}
            {profile.location && <Text style={styles.contactItem}>{profile.location}</Text>}
            {profile.linkedin_url && <Text style={styles.contactItem}>{profile.linkedin_url}</Text>}
            {profile.portfolio_url && <Text style={styles.contactItem}>{profile.portfolio_url}</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Summary Section */}
        {enhanced.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{enhanced.summary}</Text>
          </View>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Skills</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill: string, index: number) => (
                <Text key={index} style={styles.skillTag}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Work Experience Section */}
        {workHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {workHistory.map((job: any, index: number) => {
              // Find the corresponding polished bullets from GPT enhancement
              const enhancedJob = enhanced.workExperience?.find(
                (j) => j.company?.toLowerCase() === job.company?.toLowerCase()
              );
              
              // Fallback to simple split or single bullet if enhancement didn't align perfectly
              let bullets: string[] = [];
              if (enhancedJob && Array.isArray(enhancedJob.responsibilities)) {
                bullets = enhancedJob.responsibilities;
              } else if (job.responsibilities) {
                bullets = job.responsibilities
                  .split("\n")
                  .map((line: string) => line.replace(/^[-*•\s]+/, "").trim())
                  .filter(Boolean);
              }

              const dateStr = `${job.startDate || ""} - ${
                job.current ? "Present" : job.endDate || ""
              }`;

              return (
                <View key={index} style={styles.job}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitleCompany}>
                      {job.title} | {job.company}
                    </Text>
                    <Text style={styles.jobDates}>{dateStr}</Text>
                  </View>
                  {bullets.map((bullet: string, bIdx: number) => (
                    <View key={bIdx} style={styles.bullet}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Education Section */}
        {education.institution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.eduHeader}>
              <Text style={styles.eduTitle}>
                {education.degree ? `${education.degree} in ` : ""}
                {education.fieldOfStudy || ""}
              </Text>
              {education.graduationYear && (
                <Text style={styles.jobDates}>{education.graduationYear}</Text>
              )}
            </View>
            <Text style={styles.eduInstitution}>{education.institution}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Retrieve user's profile from DB
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found. Please fill in your profile before generating a resume." },
        { status: 404 }
      );
    }

    // Configure LLM client dynamically based on available API keys (same pattern as Feature 07)
    let openai: OpenAI;
    let modelName: string;

    if (process.env.GEMINI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
      modelName = "gemini-2.5-flash";
    } else {
      openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined,
      });
      modelName = process.env.OPENROUTER_API_KEY ? "openai/gpt-4o" : "gpt-4o";
    }

    const systemPrompt = `You are a professional, elite resume writer.
Enhance and rewrite the candidate's raw profile details into a polished, executive-level resume draft.
Your task is to:
1. Write a compelling professional summary (exactly 3-4 sentences) that frames their core competencies, tech stack, and impact.
2. For each work experience entry, rewrite the responsibilities into exactly 3-4 professional, action-oriented, accomplishment-focused bullet points using standard action verbs (e.g., Designed, Optimized, Engineered, Spearheaded).
Return ONLY a JSON object matching this schema:
{
  "summary": "Polished professional summary paragraph",
  "workExperience": [
    {
      "company": "Match the exact company name from the user input",
      "title": "Match the exact title from the user input",
      "responsibilities": [
        "Action-oriented bullet point 1",
        "Action-oriented bullet point 2",
        "Action-oriented bullet point 3"
      ]
    }
  ]
}`;

    const userPrompt = `CANDIDATE DETAILS:
Full Name: ${profile.full_name || ""}
Current Title: ${profile.current_title || ""}
Years of Experience: ${profile.years_experience || ""}
Skills: ${(profile.skills || []).join(", ")}
Work Experience: ${JSON.stringify(profile.work_experience || [])}
Education: ${JSON.stringify(profile.education || {})}`;

    console.log(`[api/resume/generate] Calling LLM (${modelName}) to enhance resume content for user: ${user.id}`);

    const llmResponse = await openai.chat.completions.create({
      model: modelName,
      response_format: { type: "json_object" },
      temperature: 0.7, // As specified in library-docs.md for natural resume generation variation
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const resultString = llmResponse.choices[0].message.content;
    if (!resultString) {
      throw new Error("Empty response from AI enhancement step");
    }

    const enhanced = JSON.parse(resultString);
    console.log("[api/resume/generate] LLM resume enhancement completed successfully.");

    // Render to PDF buffer using @react-pdf/renderer
    console.log("[api/resume/generate] Rendering PDF using @react-pdf/renderer...");
    const pdfBuffer = await renderToBuffer(
      <ResumeDocument profile={profile} enhanced={enhanced} /> as any
    );

    // Pass pdfBuffer directly instead of wrapping in a Blob.
    // In Next.js Route Handlers, fetch with Blob body can strip Authorization headers, causing AUTH_INVALID_CREDENTIALS.
    const bucketName = "resumes";
    const filePath = `${user.id}/resume.pdf`;
    
    // Attempt to remove existing file to avoid duplicate errors (simulating upsert)
    console.log(`[api/resume/generate] Removing existing PDF if any...`);
    await insforge.storage.from(bucketName).remove(filePath);

    // Use a standard Blob as expected by the SDK upload API
    const filePayload = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });

    console.log(`[api/resume/generate] Bucket name: ${bucketName}`);
    console.log(`[api/resume/generate] Final file path: ${filePath}`);
    console.log(`[api/resume/generate] Upload options: file size=${filePayload.size}, type=${filePayload.type}`);

    console.log(`[api/resume/generate] Uploading generated PDF to InsForge Storage: ${bucketName}/${filePath}`);
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from(bucketName)
      .upload(filePath, filePayload);
    
    console.log(`[api/resume/generate] storage response:`, { uploadData, uploadError });

    if (uploadError) {
      console.log(`[api/resume/generate] Full storage error response body:`, JSON.stringify(uploadError, null, 2));
      console.error("[api/resume/generate] upload storage error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload generated resume to storage" },
        { status: 500 }
      );
    }

    // Get public URL of the uploaded resume
    const publicUrl = insforge.storage
      .from("resumes")
      .getPublicUrl(`${user.id}/resume.pdf`);

    if (!publicUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve public URL for generated resume" },
        { status: 500 }
      );
    }

    // Update the profiles table with the new resume PDF URL
    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({
        resume_pdf_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[api/resume/generate] profiles db update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile record with resume URL" },
        { status: 500 }
      );
    }

    console.log(`[api/resume/generate] Generation complete! Public URL: ${publicUrl}`);
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("[api/resume/generate] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred during resume generation" },
      { status: 500 }
    );
  }
}
