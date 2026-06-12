"use client";

import { useRef, useState, useTransition } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadResume } from "@/actions/profile";

type ResumeUploadProps = {
  resumeUrl: string | null;
};

export function ResumeUpload({ resumeUrl }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSelectClick = () => {
    if (isPending) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadStatus({ type: "error", text: "Please upload a PDF file only." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({ type: "error", text: "File size exceeds the 10 MB limit." });
      return;
    }

    setUploadStatus(null);

    // Read file as base64 to pass to Server Action safely
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];

      startTransition(async () => {
        const res = await uploadResume(base64Data, file.name);
        if (res.success) {
          setUploadStatus({ type: "success", text: "Resume uploaded successfully." });
        } else {
          setUploadStatus({ type: "error", text: res.error || "Failed to upload resume." });
        }
      });
    };
    reader.onerror = () => {
      setUploadStatus({ type: "error", text: "Failed to read the file." });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isPending) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-[16px] font-semibold text-text-primary leading-6">
          Resume
        </h2>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume PDF"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleSelectClick}
        onKeyDown={(e) => e.key === "Enter" && handleSelectClick()}
        className={`border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 py-10 px-6 cursor-pointer hover:border-accent hover:bg-accent-muted transition-colors ${
          isPending ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <div className="w-11 h-11 rounded-full bg-accent-light flex items-center justify-center">
          {isPending ? (
            <Loader2 size={22} className="text-accent animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud size={22} className="text-accent" aria-hidden="true" />
          )}
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-text-primary">
            {isPending ? "Uploading resume..." : "Click to upload or drag and drop"}
          </p>
          <p className="text-[12px] text-text-muted mt-0.5">
            PDF only · max 10 MB
          </p>
        </div>
        <Button
          variant="secondary"
          id="resume-select-btn"
          className="mt-1"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectClick();
          }}
        >
          Select Resume
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        id="resume-file-input"
        aria-label="Resume file input"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            processFile(file);
          }
        }}
      />

      {/* Upload status message feedback */}
      {uploadStatus && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border text-[13px] ${
            uploadStatus.type === "success"
              ? "bg-success-lightest border-success text-success-dark"
              : "bg-error/5 border-error/20 text-error"
          }`}
        >
          {uploadStatus.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span>{uploadStatus.text}</span>
        </div>
      )}

      {/* Show active file URL if one exists */}
      {resumeUrl && (
        <div className="flex items-center justify-between p-3 bg-surface-secondary border border-border rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={16} className="text-text-secondary shrink-0" />
            <span className="text-[13px] text-text-primary truncate">resume.pdf</span>
          </div>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-accent font-medium hover:underline shrink-0"
            id="view-resume-link"
          >
            View File
          </a>
        </div>
      )}

      {/* Generate from profile */}
      <div className="border-t border-border pt-4 flex flex-col gap-1">
        <p className="text-[13px] font-medium text-text-primary">
          Don't have a resume handy?
        </p>
        <p className="text-[12px] text-text-muted">
          Generate a clean professional PDF from your profile data using AI.
        </p>
        <Button
          variant="secondary"
          id="generate-resume-btn"
          className="mt-3 self-start"
          disabled={isPending}
        >
          Generate Resume from Profile
        </Button>
      </div>
    </div>
  );
}

