"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadResume } from "@/actions/profile";

type ResumeUploadProps = {
  resumeUrl: string | null;
};

export function ResumeUpload({ resumeUrl }: ResumeUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    setSelectedFile(file);

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
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-semibold text-text-primary leading-6">
          Resume
        </h2>
        <p className="text-[12px] text-text-secondary">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
        </p>
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
        className={`border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 py-10 px-6 cursor-pointer hover:border-accent hover:bg-accent-muted transition-colors ${
          isPending ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center">
          {isPending ? (
            <Loader2 size={20} className="text-accent animate-spin" aria-hidden="true" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.74-3.5-3.5-4.08C10.74 6.33 8.79 7.5 8 9.5c-2.43.34-4 2.5-4 4.5a3.5 3.5 0 0 0 3.5 3.5" />
              <polyline points="12 12 12 18" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          )}
        </div>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-text-primary">
            {isPending ? "Uploading resume..." : "Click to upload or drag and drop"}
          </p>
          <p className="text-[12px] text-text-muted mt-1">
            PDF formatting only. Maximum file size 5MB.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectClick();
          }}
          className="bg-white border border-border rounded-md px-4 py-2 hover:bg-surface-secondary text-text-primary font-medium text-[13px]"
        >
          Select Resume
        </button>
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

      {/* Extract options after upload */}
      {selectedFile && (
        <div className="flex flex-col items-start gap-3 bg-accent-muted p-4 rounded-xl border border-accent/20">
          <p className="text-[13px] text-text-primary font-medium">
            Would you like to auto-fill your profile from this resume?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExtracting}
              onClick={async () => {
                setIsExtracting(true);
                setUploadStatus(null);
                try {
                  const formData = new FormData();
                  formData.append("resume", selectedFile);
                  const res = await fetch("/api/resume/extract", {
                    method: "POST",
                    body: formData,
                  });
                  const json = await res.json();
                  if (json.success) {
                    window.dispatchEvent(new CustomEvent("profile-extracted", { detail: json.data }));
                    setUploadStatus({ type: "success", text: "Profile data extracted successfully. Please review and save." });
                    setSelectedFile(null);
                  } else {
                    setUploadStatus({ type: "error", text: json.error || "Extraction failed." });
                  }
                } catch (err) {
                  setUploadStatus({ type: "error", text: "Extraction failed due to an error." });
                } finally {
                  setIsExtracting(false);
                }
              }}
              className="bg-accent text-white px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 hover:bg-accent-dark disabled:opacity-60 transition-colors"
            >
              {isExtracting ? <Loader2 size={14} className="animate-spin" /> : null}
              {isExtracting ? "Extracting..." : "Extract from Resume"}
            </button>
            <button
              type="button"
              disabled={isExtracting}
              onClick={() => setSelectedFile(null)}
              className="text-[13px] font-medium text-text-secondary hover:text-text-primary px-2 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Show active file URL if one exists */}
      {resumeUrl && (
        <div className="flex items-center justify-between p-3 bg-surface-secondary border border-border rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={16} className="text-text-secondary shrink-0" />
            <span className="text-[13px] text-text-primary truncate">resume.pdf</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-accent font-medium hover:underline shrink-0"
              id="view-resume-link"
            >
              View File
            </a>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/resume/download";
              }}
              className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              id="download-resume-btn"
            >
              Download
            </button>
          </div>
        </div>
      )}

      {/* Generate from profile */}
      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        <p className="text-[12px] text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          id="generate-resume-btn"
          disabled={isPending || isExtracting || isGenerating}
          onClick={async () => {
            setIsGenerating(true);
            setUploadStatus(null);
            try {
              const res = await fetch("/api/resume/generate", {
                method: "POST",
              });
              const json = await res.json();
              if (json.success) {
                setUploadStatus({
                  type: "success",
                  text: "Resume generated and saved to profile successfully.",
                });
                router.refresh();
              } else {
                setUploadStatus({
                  type: "error",
                  text: json.error || "Generation failed.",
                });
              }
            } catch (err) {
              setUploadStatus({
                type: "error",
                text: "Generation failed due to an unexpected error.",
              });
            } finally {
              setIsGenerating(false);
            }
          }}
          className="bg-accent text-white hover:bg-accent-dark rounded-md px-4 py-2 text-[13px] font-medium flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-60 transition-colors"
        >
          {isGenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          )}
          {isGenerating ? "Generating..." : "Generate Resume from Profile"}
        </button>
      </div>
    </div>
  );
}


