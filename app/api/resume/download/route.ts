import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await insforge.storage
      .from("resumes")
      .download(`${user.id}/resume.pdf`);

    if (error) {
      console.error("[api/resume/download] storage download error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to download resume" },
        { status: 500 }
      );
    }

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error: any) {
    console.error("[api/resume/download] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred during download" },
      { status: 500 }
    );
  }
}
