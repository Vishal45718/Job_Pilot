"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveProfile, ProfileFormInput } from "@/actions/profile";

// ─── Types ───────────────────────────────────────────────────────────────────

type WorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
};

type FormState = ProfileFormInput;

// ─── Tag input helper ─────────────────────────────────────────────────────────

function TagInput({
  id,
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  id: string;
  label: string;
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const commit = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[12px] font-medium uppercase tracking-wide text-text-secondary"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 flex flex-wrap gap-2 p-2.5 border border-border rounded-md bg-surface min-h-[42px] focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
          <input
            id={id}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] text-[14px] text-text-primary placeholder:text-text-muted outline-none bg-transparent"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={commit}
          className="h-[42px] px-5"
        >
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-text-primary text-[13px] font-medium"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onRemove(tag)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[16px] font-semibold text-text-primary leading-6 border-b border-border pb-3 mb-5">
      {children}
    </h2>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-medium uppercase tracking-wide text-text-secondary"
    >
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors";

const selectClass =
  "w-full px-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors appearance-none";

// ─── Main component ───────────────────────────────────────────────────────────

type ProfileFormProps = {
  initialData: ProfileFormInput;
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [form, setForm] = useState<FormState>(initialData);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const handleExtraction = (e: CustomEvent<Partial<FormState>>) => {
      const data = e.detail;
      setForm((prev) => {
        const merged = { ...prev };
        
        // Smart merge: only overwrite if the current field is effectively empty
        const smartMerge = (key: keyof FormState) => {
          if (data[key] !== undefined && data[key] !== null) {
            const incoming = data[key];
            const current = merged[key];
            
            if (Array.isArray(current)) {
               if (current.length === 0 && Array.isArray(incoming) && incoming.length > 0) {
                 (merged as any)[key] = incoming;
               }
            } else if (typeof current === "string") {
               if (current.trim() === "" && typeof incoming === "string" && incoming.trim() !== "") {
                 (merged as any)[key] = incoming;
               }
            }
          }
        };

        const keys: Array<keyof FormState> = [
          "fullName", "phone", "location", "linkedinUrl", "portfolioUrl", 
          "workAuthorization", "currentTitle", "experienceLevel", "yearsExperience", 
          "skills", "industries", "degree", "fieldOfStudy", "institution", 
          "graduationYear", "jobTitlesSeeking", "remotePreference", 
          "salaryExpectation", "preferredLocations", "coverLetterTone"
        ];
        
        keys.forEach(smartMerge);

        // For workExperience array, merge if current is empty or just has one empty row
        const currentExp = merged.workExperience;
        const isExpEmpty = currentExp.length === 0 || 
          (currentExp.length === 1 && !currentExp[0].company && !currentExp[0].title);
          
        if (isExpEmpty && data.workExperience && data.workExperience.length > 0) {
          merged.workExperience = data.workExperience;
        }

        return merged;
      });
      // Optionally surface a notification here if we wanted, but ResumeUpload already sets a success status.
    };

    window.addEventListener("profile-extracted", handleExtraction as EventListener);
    return () => {
      window.removeEventListener("profile-extracted", handleExtraction as EventListener);
    };
  }, []);

  // ── Work experience helpers ──
  const addWorkExperience = () => {
    if (form.workExperience.length >= 3) return;
    setField("workExperience", [
      ...form.workExperience,
      {
        company: "",
        title: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: "",
      },
    ]);
  };

  const updateWorkExp = (
    index: number,
    key: keyof WorkExperience,
    value: string | boolean,
  ) => {
    const updated = form.workExperience.map((exp, i) =>
      i === index ? { ...exp, [key]: value } : exp,
    );
    setField("workExperience", updated);
  };

  const removeWorkExp = (index: number) => {
    setField(
      "workExperience",
      form.workExperience.filter((_, i) => i !== index),
    );
  };

  // ── Tag helpers ──
  const addTag = (field: "skills" | "industries") =>
    (value: string) =>
      setField(field, [...form[field], value]);

  const removeTag = (field: "skills" | "industries") =>
    (value: string) =>
      setField(
        field,
        (form[field] as string[]).filter((t) => t !== value),
      );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await saveProfile(form);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Profile saved successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save profile." });
      }
    });
  };

  return (
    <form
      id="profile-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Unified Profile Information Card */}
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col gap-8">
        <div>
          <h2 className="text-[18px] font-bold text-text-primary leading-6">
            Profile Information
          </h2>
          <p className="text-[13px] text-text-secondary mt-1">
            This context is used to accurately represent you in agent interactions.
          </p>
        </div>

        <hr className="border-border -mx-8" />

        {/* ── Personal Info ─────────────────────────────────────────── */}
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">
            Personal Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="full-name">Full Name</FieldLabel>
              <input
                id="full-name"
                type="text"
                className={inputClass}
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <input
                id="email"
                type="email"
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                value={form.email}
                disabled
                aria-label="Email — pre-filled from your account"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <input
                id="phone"
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <input
                id="location"
                type="text"
                className={inputClass}
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="linkedin-url">LinkedIn URL</FieldLabel>
              <input
                id="linkedin-url"
                type="url"
                className={inputClass}
                value={form.linkedinUrl}
                onChange={(e) => setField("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="portfolio-url">Portfolio / GitHub</FieldLabel>
              <input
                id="portfolio-url"
                type="url"
                className={inputClass}
                value={form.portfolioUrl}
                onChange={(e) => setField("portfolioUrl", e.target.value)}
                placeholder="https://github.com/yourname"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <FieldLabel htmlFor="work-authorization">
                Work Authorization
              </FieldLabel>
              <select
                id="work-authorization"
                className={selectClass}
                value={form.workAuthorization}
                onChange={(e) => setField("workAuthorization", e.target.value)}
              >
                <option value="">Select authorization</option>
                <option value="citizen">US Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa_required">Visa Required</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-border -mx-8" />

        {/* ── Professional Info ─────────────────────────────────────── */}
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">
            Professional Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <FieldLabel htmlFor="current-title">Current/Recent Job Title</FieldLabel>
              <input
                id="current-title"
                type="text"
                className={inputClass}
                value={form.currentTitle}
                onChange={(e) => setField("currentTitle", e.target.value)}
                placeholder="Senior Frontend Engineer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="experience-level">
                Experience Level
              </FieldLabel>
              <select
                id="experience-level"
                className={selectClass}
                value={form.experienceLevel}
                onChange={(e) => setField("experienceLevel", e.target.value)}
              >
                <option value="">Select level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="years-experience">
                Years of Experience
              </FieldLabel>
              <input
                id="years-experience"
                type="number"
                min={0}
                max={50}
                className={inputClass}
                value={form.yearsExperience}
                onChange={(e) => setField("yearsExperience", e.target.value)}
                placeholder="7"
              />
            </div>

            <div className="md:col-span-2">
              <TagInput
                id="skills-input"
                label="Skills"
                tags={form.skills}
                onAdd={addTag("skills")}
                onRemove={removeTag("skills")}
                placeholder="Add a skill"
              />
            </div>

            <div className="md:col-span-2">
              <TagInput
                id="industries-input"
                label="Industries Worked In (Optional)"
                tags={form.industries}
                onAdd={addTag("industries")}
                onRemove={removeTag("industries")}
                placeholder="E.g. FinTech, Healthcare"
              />
            </div>
          </div>
        </div>

        <hr className="border-border -mx-8" />

        {/* ── Work Experience ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-text-primary">
              Work Experience
            </h3>
            {form.workExperience.length < 3 && (
              <button
                type="button"
                id="add-role-btn"
                onClick={addWorkExperience}
                className="flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                <Plus size={15} /> Add role
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-5">
            {form.workExperience.map((exp, index) => (
              <div
                key={index}
                className="border border-border rounded-xl p-5 flex flex-col gap-4 relative"
              >
                {form.workExperience.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove role ${index + 1}`}
                    onClick={() => removeWorkExp(index)}
                    className="absolute top-3 right-3 text-text-muted hover:text-error transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor={`company-${index}`}>
                      Company Name
                    </FieldLabel>
                    <input
                      id={`company-${index}`}
                      type="text"
                      className={inputClass}
                      value={exp.company}
                      onChange={(e) =>
                        updateWorkExp(index, "company", e.target.value)
                      }
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor={`job-title-${index}`}>
                      Job Title
                    </FieldLabel>
                    <input
                      id={`job-title-${index}`}
                      type="text"
                      className={inputClass}
                      value={exp.title}
                      onChange={(e) =>
                        updateWorkExp(index, "title", e.target.value)
                      }
                      placeholder="Senior Engineer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor={`start-date-${index}`}>
                      Start Date
                    </FieldLabel>
                    <input
                      id={`start-date-${index}`}
                      type="month"
                      className={inputClass}
                      value={exp.startDate}
                      onChange={(e) =>
                        updateWorkExp(index, "startDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={`end-date-${index}`}>End Date</FieldLabel>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.current}
                          onChange={(e) =>
                            updateWorkExp(index, "current", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-border accent-accent"
                        />
                        <span className="text-[12px] text-text-secondary">
                          Currently working here
                        </span>
                      </label>
                    </div>
                    <input
                      id={`end-date-${index}`}
                      type="month"
                      className={inputClass}
                      value={exp.endDate}
                      disabled={exp.current}
                      onChange={(e) =>
                        updateWorkExp(index, "endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={`responsibilities-${index}`}>
                    Key Responsibilities
                  </FieldLabel>
                  <textarea
                    id={`responsibilities-${index}`}
                    rows={3}
                    className={`${inputClass} resize-y`}
                    value={exp.responsibilities}
                    onChange={(e) =>
                      updateWorkExp(index, "responsibilities", e.target.value)
                    }
                    placeholder="Describe your key responsibilities and achievements..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border -mx-8" />

        {/* ── Education ─────────────────────────────────────────────── */}
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">
            Education
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="degree">Highest Degree</FieldLabel>
              <select
                id="degree"
                className={selectClass}
                value={form.degree}
                onChange={(e) => setField("degree", e.target.value)}
              >
                <option value="">Select degree</option>
                <option value="high_school">High School</option>
                <option value="associate">Associate</option>
                <option value="bachelor">Bachelor&apos;s</option>
                <option value="master">Master&apos;s</option>
                <option value="phd">PhD / Doctorate</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="field-of-study">Field of Study</FieldLabel>
              <input
                id="field-of-study"
                type="text"
                className={inputClass}
                value={form.fieldOfStudy}
                onChange={(e) => setField("fieldOfStudy", e.target.value)}
                placeholder="Computer Science"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="institution">Institution Name</FieldLabel>
              <input
                id="institution"
                type="text"
                className={inputClass}
                value={form.institution}
                onChange={(e) => setField("institution", e.target.value)}
                placeholder="E.g. State University"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="graduation-year">Graduation Year</FieldLabel>
              <input
                id="graduation-year"
                type="text"
                className={inputClass}
                value={form.graduationYear}
                onChange={(e) => setField("graduationYear", e.target.value)}
                placeholder="YYYY"
              />
            </div>
          </div>
        </div>

        <hr className="border-border -mx-8" />

        {/* ── Job Preferences ───────────────────────────────────────── */}
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">
            Job Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <FieldLabel htmlFor="job-titles-input">Job Titles Seeking</FieldLabel>
              <input
                id="job-titles-input"
                type="text"
                className={inputClass}
                value={form.jobTitlesSeeking}
                onChange={(e) => setField("jobTitlesSeeking", e.target.value)}
                placeholder="Frontend Engineer, React Developer..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="remote-preference">
                Remote Preference
              </FieldLabel>
              <select
                id="remote-preference"
                className={selectClass}
                value={form.remotePreference}
                onChange={(e) => setField("remotePreference", e.target.value)}
              >
                <option value="">Select preference</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="salary-expectation">
                Salary Expectation (Optional)
              </FieldLabel>
              <input
                id="salary-expectation"
                type="text"
                className={inputClass}
                value={form.salaryExpectation}
                onChange={(e) => setField("salaryExpectation", e.target.value)}
                placeholder="E.g. $120k+"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <FieldLabel htmlFor="preferred-locations-input">
                Preferred Locations (Optional)
              </FieldLabel>
              <input
                id="preferred-locations-input"
                type="text"
                className={inputClass}
                value={form.preferredLocations}
                onChange={(e) => setField("preferredLocations", e.target.value)}
                placeholder="E.g. New York, London"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <FieldLabel htmlFor="cover-letter-tone">
                Cover Letter Tone
              </FieldLabel>
              <select
                id="cover-letter-tone"
                className={selectClass}
                value={form.coverLetterTone}
                onChange={(e) => setField("coverLetterTone", e.target.value)}
              >
                <option value="">Select tone</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save button ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 mt-2">
        <Button
          type="submit"
          variant="primary"
          id="save-profile-btn"
          className="w-full py-3 h-[48px] text-[15px] font-semibold flex items-center justify-center gap-2"
          disabled={isPending}
        >
          {isPending && <Loader2 size={18} className="animate-spin" />}
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
        {statusMessage && (
          <p
            id="profile-save-status"
            className={`text-[14px] font-medium ${
              statusMessage.type === "success" ? "text-success" : "text-error"
            }`}
          >
            {statusMessage.text}
          </p>
        )}
      </div>
    </form>
  );
}

