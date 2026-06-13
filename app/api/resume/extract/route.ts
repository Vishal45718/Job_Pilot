import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import path from "path";

// Fix for Next.js Turbopack failing to find the worker file
PDFParse.setWorker(path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs"));

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

    const formData = await req.formData();
    const file = formData.get("resume") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No resume file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`[api/resume/extract] Processing file: ${file.name}, size: ${file.size} bytes`);

    let extractedText = "";
    try {
      const parser = new PDFParse(uint8Array);
      const textResult = await parser.getText();
      extractedText = textResult.text || "";
      parser.destroy();
      console.log(`[api/resume/extract] Parsed PDF successfully. Extracted ${extractedText.length} characters.`);
    } catch (parseError: any) {
      console.error("[api/resume/extract] PDF parse failed:", parseError);
      return NextResponse.json(
        { success: false, error: `Could not read PDF format: ${parseError.message || parseError}` },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from this PDF. Please try a different file." },
        { status: 400 }
      );
    }

    // Configure LLM client dynamically based on available API keys
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

    const systemPrompt = `You are an expert resume parser. Extract the following profile information from the raw resume text provided.
Return ONLY a JSON object exactly matching this schema. For any field you cannot confidently extract, return an empty string or empty array.
{
  "fullName": "string",
  "phone": "string",
  "location": "string (City, State/Country)",
  "linkedinUrl": "string",
  "portfolioUrl": "string",
  "workAuthorization": "string (either 'citizen', 'permanent_resident', 'visa_required', or '')",
  "currentTitle": "string",
  "experienceLevel": "string (either 'junior', 'mid', 'senior', 'lead', or '')",
  "yearsExperience": "string (number only, e.g. '5')",
  "skills": ["string"],
  "industries": ["string"],
  "workExperience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM (or empty if current)",
      "current": boolean,
      "responsibilities": "string (bullet points or paragraph)"
    }
  ],
  "degree": "string (either 'high_school', 'associate', 'bachelor', 'master', 'phd', 'other', or '')",
  "fieldOfStudy": "string",
  "institution": "string",
  "graduationYear": "string (YYYY)"
}`;

    const response = await openai.chat.completions.create({
      model: modelName,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `RESUME TEXT:\n${extractedText}` },
      ],
    });

    const resultString = response.choices[0].message.content;
    if (!resultString) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(resultString);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during extraction" },
      { status: 500 }
    );
  }
}
