import Browserbase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import OpenAI from "openai";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function runCompanyResearch(jobId: string, userId: string) {
  const insforge = await createInsforgeServer();
  const timestamp = () => new Date().toISOString();

  console.log(`[${timestamp()}] [research agent] STEP 1: Starting company research for jobId: ${jobId}, userId: ${userId}`);

  // 1. Fetch job
  const { data: job, error: jobError } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (jobError || !job) {
    console.error(`[${timestamp()}] [research agent] STEP 1 FAILED: Job not found or DB error`, jobError);
    return;
  }

  // 2. Fetch profile
  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error(`[${timestamp()}] [research agent] STEP 1 FAILED: Profile not found or DB error`, profileError);
    await insforge.database
      .from("jobs")
      .update({ company_research: { error: "Profile not found. Please complete your profile." } })
      .eq("id", jobId)
      .eq("user_id", userId);
    return;
  }

  let companyResearch: any = null;

  // 3. Resolve URL
  console.log(`[${timestamp()}] [research agent] STEP 2: Resolving target URL for company: ${job.company}`);
  let targetUrl = job.external_apply_url || job.source_url;
  try {
    if (targetUrl.includes("adzuna.com")) {
      const res = await fetch(targetUrl, { redirect: "follow" });
      const finalUrl = new URL(res.url);
      
      if (!finalUrl.hostname.includes("adzuna.com")) {
        const parts = finalUrl.hostname.split('.');
        const rootDomain = parts.slice(-2).join('.');
        targetUrl = `https://${rootDomain}`;
      } else {
        targetUrl = `https://www.${job.company.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;
      }
    } else {
      const finalUrl = new URL(targetUrl);
      const parts = finalUrl.hostname.split('.');
      const rootDomain = parts.slice(-2).join('.');
      targetUrl = `https://${rootDomain}`;
    }
    console.log(`[${timestamp()}] [research agent] STEP 2 COMPLETE: Resolved URL to: ${targetUrl}`);
  } catch (err) {
    console.error(`[${timestamp()}] [research agent] STEP 2 WARNING: URL resolution failed, using fallback`, err);
    targetUrl = `https://www.${job.company.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;
  }

  // 4. Browserbase & Stagehand
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  let session;
  let stagehand: Stagehand | null = null;

  try {
    console.log(`[${timestamp()}] [research agent] STEP 3: Creating Browserbase session...`);
    session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      timeout: 120,
    });
    console.log(`[${timestamp()}] [research agent] STEP 3 COMPLETE: Browserbase session created: ${session.id}`);

    console.log(`[${timestamp()}] [research agent] STEP 4: Initializing Stagehand context...`);
    stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY!,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserbaseSessionID: session.id,
      model: {
        modelName: "openai/openrouter/free",
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: "https://openrouter.ai/api/v1",
      },
      disablePino: true,
      disableAPI: true,
    });

    await stagehand.init();
    const page = stagehand.context.activePage()!;
    console.log(`[${timestamp()}] [research agent] STEP 4 COMPLETE: Stagehand initialized successfully`);

    // Step 1: Homepage
    console.log(`[${timestamp()}] [research agent] STEP 5: Navigating to homepage: ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeoutMs: 30000 });
    console.log(`[${timestamp()}] [research agent] STEP 5 COMPLETE: Loaded homepage`);

    console.log(`[${timestamp()}] [research agent] STEP 6: Starting homepage extraction...`);
    const homepageData = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
      z.object({
        oneLiner: z.string().describe("What the company does in one sentence"),
        productSummary: z
          .string()
          .describe("What they build/sell and who it's for"),
        signals: z
          .array(z.string())
          .describe("Funding, notable customers, scale, mission, recent news"),
        pageLinks: z
          .array(
            z.object({
              url: z.string(),
              kind: z.enum([
                "about",
                "careers",
                "blog",
                "engineering",
                "product",
                "team",
                "other",
              ]),
            })
          )
          .describe("Internal links worth visiting"),
      })
    );
    console.log(`[${timestamp()}] [research agent] STEP 6 COMPLETE: Homepage extraction successful:`, JSON.stringify(homepageData));

    if (homepageData.oneLiner || homepageData.productSummary) {
      companyResearch = { homepage: homepageData, subPages: [] };
      
      // Step 2: Sub-pages
      const linksToVisit = (homepageData.pageLinks || [])
        .filter(l => ["about", "blog", "engineering", "product", "team", "careers"].includes(l.kind))
        .slice(0, 3);

      console.log(`[${timestamp()}] [research agent] STEP 7: Found ${linksToVisit.length} sub-pages to visit:`, linksToVisit.map(l => l.url));

      for (let i = 0; i < linksToVisit.length; i++) {
        const link = linksToVisit[i];
        const absoluteUrl = new URL(link.url, targetUrl).href;
        try {
          console.log(`[${timestamp()}] [research agent] STEP 7.${i + 1}: Navigating to sub-page: ${absoluteUrl}...`);
          await page.goto(absoluteUrl, { waitUntil: "domcontentloaded", timeoutMs: 20000 });
          console.log(`[${timestamp()}] [research agent] STEP 7.${i + 1} COMPLETE: Loaded sub-page`);

          console.log(`[${timestamp()}] [research agent] STEP 7.${i + 1} EXTRACTION: Extracting sub-page content...`);
          const subPageData = await stagehand.extract(
            "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
            z.object({
              keyPoints: z.array(z.string()),
              technologies: z
                .array(z.string())
                .describe("Specific languages, frameworks, tools, platforms"),
              valuesOrCulture: z
                .array(z.string())
                .describe("Stated values, working style, team norms"),
              notable: z
                .array(z.string())
                .describe("Customers, funding, scale, projects, awards"),
            })
          );
          console.log(`[${timestamp()}] [research agent] STEP 7.${i + 1} EXTRACTION COMPLETE: Success`);
          companyResearch.subPages.push({ url: absoluteUrl, kind: link.kind, data: subPageData });
        } catch (subErr: any) {
          console.error(`[${timestamp()}] [research agent] STEP 7.${i + 1} FAILED: Sub-page extraction failed for ${link.url}`, subErr);
          if (subErr instanceof Error) {
            console.error(subErr.stack);
          }
        }
      }
    } else {
      console.log(`[${timestamp()}] [research agent] STEP 6 NOTE: Homepage appears to be empty/parked, skipping sub-pages`);
    }
    
  } catch (err: any) {
    console.error(`[${timestamp()}] [research agent] STEP 3-7 FATAL BROWSER ERROR: Browserbase/Stagehand extraction failed`, err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
    await insforge.database
      .from("jobs")
      .update({ company_research: { error: `Browser extraction failed: ${err.message || err}` } })
      .eq("id", jobId)
      .eq("user_id", userId);
    
    // Attempt cleanup
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (closeErr) {}
    }
    return;
  } finally {
    if (stagehand) {
      try {
        console.log(`[${timestamp()}] [research agent] STEP 8: Closing Stagehand session...`);
        await stagehand.close();
        console.log(`[${timestamp()}] [research agent] STEP 8 COMPLETE: Closed session`);
      } catch (closeErr) {
        console.error(`[${timestamp()}] [research agent] STEP 8 WARNING: Error closing Stagehand session`, closeErr);
      }
    }
  }

  // 5. GPT-4o Synthesis
  console.log(`[${timestamp()}] [research agent] STEP 9: Starting GPT-4o synthesis briefing...`);
  const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": "string",
  "techStack": ["string"],
  "culture": ["string"],
  "whyThisRole": "string",
  "yourEdge": ["string"],
  "gapsToAddress": ["string"],
  "smartQuestions": ["string"],
  "interviewPrep": ["string"],
  "sources": ["string"]
}`;

  const userPrompt = `COMPANY RESEARCH (from their website):
${companyResearch ? JSON.stringify(companyResearch) : "None or could not be extracted"}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.about_role}
Matched skills: ${(job.matched_skills || []).join(", ")}
Missing skills: ${(job.missing_skills || []).join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${(profile.skills || []).join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

  let finalDossier = null;
  try {
    const response = await openrouter.chat.completions.create({
      model: "openrouter/free",
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0].message.content;
    if (content) {
      finalDossier = JSON.parse(content);
    }
    console.log(`[${timestamp()}] [research agent] STEP 9 COMPLETE: GPT-4o synthesis generated successfully`);
  } catch (err: any) {
    console.error(`[${timestamp()}] [research agent] STEP 9 FAILED: GPT-4o synthesis failed`, err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
    await insforge.database
      .from("jobs")
      .update({ company_research: { error: `AI synthesis failed: ${err.message || err}` } })
      .eq("id", jobId)
      .eq("user_id", userId);
    return;
  }

  if (finalDossier) {
    // 6. Save to DB
    console.log(`[${timestamp()}] [research agent] STEP 10: Saving dossier to database...`);
    const { error: dbError } = await insforge.database
      .from("jobs")
      .update({ company_research: finalDossier })
      .eq("id", jobId)
      .eq("user_id", userId);

    if (dbError) {
      console.error(`[${timestamp()}] [research agent] STEP 10 FAILED: Database update failed`, dbError);
    } else {
      console.log(`[${timestamp()}] [research agent] STEP 10 COMPLETE: Dossier saved successfully`);
    }

    // 7. PostHog Event
    try {
      const posthog = createPostHogServer();
      posthog.capture({
        distinctId: userId,
        event: "company_researched",
        properties: { userId, jobId, company: job.company },
      });
      await posthog.shutdown();
    } catch (phErr) {
      console.error(`[${timestamp()}] [research agent] PostHog warning`, phErr);
    }
  } else {
    console.error(`[${timestamp()}] [research agent] STEP 10 FAILED: finalDossier was null`);
    await insforge.database
      .from("jobs")
      .update({ company_research: { error: "Failed to generate research dossier." } })
      .eq("id", jobId)
      .eq("user_id", userId);
  }
}
