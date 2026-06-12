import { useState, useTransition } from "react";
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
      <div className="flex flex-wrap gap-2 p-2.5 border border-border rounded-md bg-surface min-h-[42px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-light text-accent text-[12px] font-medium"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onRemove(tag)}
              className="hover:text-accent-dark"
            >
              <X size={11} />
            </button>
          </span>
        ))}
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
      <button
        type="button"
        onClick={commit}
        className="self-start flex items-center gap-1 text-[12px] text-accent font-medium hover:underline"
      >
        <Plus size={13} /> Add
      </button>
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
  const addTag = (field: "skills" | "industries" | "jobTitlesSeeking" | "preferredLocations") =>
    (value: string) =>
      setField(field, [...form[field], value]);

  const removeTag = (field: "skills" | "industries" | "jobTitlesSeeking" | "preferredLocations") =>
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
      {/* ── Personal Info ─────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <SectionHeading>Personal Information</SectionHeading>
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

      {/* ── Professional Info ─────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <SectionHeading>Professional Information</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="current-title">Current Job Title</FieldLabel>
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
              placeholder="Type a skill and press Enter"
            />
          </div>

          <div className="md:col-span-2">
            <TagInput
              id="industries-input"
              label="Industries"
              tags={form.industries}
              onAdd={addTag("industries")}
              onRemove={removeTag("industries")}
              placeholder="Type an industry and press Enter"
            />
          </div>
        </div>
      </div>

      {/* ── Work Experience ───────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <SectionHeading>Work Experience</SectionHeading>
        <div className="flex flex-col gap-5">
          {form.workExperience.map((exp, index) => (
            <div
              key={index}
              className="border border-border rounded-xl p-4 flex flex-col gap-4 relative"
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
                  <FieldLabel htmlFor={`end-date-${index}`}>
                    End Date
                  </FieldLabel>
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

              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  id={`current-${index}`}
                  checked={exp.current}
                  onChange={(e) =>
                    updateWorkExp(index, "current", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-border accent-accent"
                />
                <span className="text-[13px] text-text-primary">
                  Currently working here
                </span>
              </label>

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

          {form.workExperience.length < 3 && (
            <button
              type="button"
              id="add-role-btn"
              onClick={addWorkExperience}
              className="flex items-center gap-2 text-[13px] font-medium text-accent hover:underline w-fit"
            >
              <Plus size={15} /> Add another role
            </button>
          )}
        </div>
      </div>

      {/* ── Education ─────────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <SectionHeading>Education</SectionHeading>
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
              placeholder="MIT"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="graduation-year">Graduation Year</FieldLabel>
            <input
              id="graduation-year"
              type="number"
              min={1950}
              max={2035}
              className={inputClass}
              value={form.graduationYear}
              onChange={(e) => setField("graduationYear", e.target.value)}
              placeholder="2017"
            />
          </div>
        </div>
      </div>

      {/* ── Job Preferences ───────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <SectionHeading>Job Preferences</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TagInput
              id="job-titles-input"
              label="Job Titles Seeking"
              tags={form.jobTitlesSeeking}
              onAdd={addTag("jobTitlesSeeking")}
              onRemove={removeTag("jobTitlesSeeking")}
              placeholder="Staff Engineer, Principal Engineer..."
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
              Salary Expectation
            </FieldLabel>
            <input
              id="salary-expectation"
              type="text"
              className={inputClass}
              value={form.salaryExpectation}
              onChange={(e) => setField("salaryExpectation", e.target.value)}
              placeholder="$150,000 - $200,000"
            />
          </div>

          <div className="md:col-span-2">
            <TagInput
              id="preferred-locations-input"
              label="Preferred Locations"
              tags={form.preferredLocations}
              onAdd={addTag("preferredLocations")}
              onRemove={removeTag("preferredLocations")}
              placeholder="San Francisco, New York..."
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

      {/* ── Save button ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2">
        <div>
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
        <Button
          type="submit"
          variant="primary"
          id="save-profile-btn"
          className="px-8 flex items-center gap-2"
          disabled={isPending}
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}

