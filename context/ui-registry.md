# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Button
- **Path:** `components/ui/button.tsx`
- **Variants:**
  - `primary`: `bg-button-bg text-button-text hover:bg-button-hover font-medium`
  - `secondary`: `bg-surface border border-border text-text-primary`
  - `ghost`: `bg-transparent text-text-secondary hover:bg-surface-secondary`
- **Base Classes:** `rounded-md px-4 py-2 flex items-center justify-center transition-colors text-[14px]`

### Navbar
- **Path:** `components/layout/Navbar.tsx`
- **Container:** `w-full h-16 bg-surface px-6 border-b border-border flex items-center justify-between`

### Footer
- **Path:** `components/layout/Footer.tsx`
- **Container:** `w-full bg-surface border-t border-border py-8 px-6`

### Hero
- **Path:** `components/homepage/Hero.tsx`
- **Container:** `relative w-full overflow-hidden flex flex-col items-center pt-24 pb-16 px-6 text-center`

### Features
- **Path:** `components/homepage/Features.tsx`
- **Container:** `w-full max-w-[1440px] mx-auto py-24 px-6 flex flex-col gap-32`

### Testimonial
- **Path:** `components/homepage/Testimonial.tsx`
- **Container:** `w-full py-24 px-6 flex flex-col items-center text-center border-t border-border bg-surface relative`

### BottomCTA
- **Path:** `components/homepage/BottomCTA.tsx`
- **Container:** `relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden border-t border-border`

### LoginPage
- **Path:** `app/(auth)/login/page.tsx`
- **Last updated:** 2026-06-11
- **Page Background:** `bg-background`
- **Card Container:** `bg-surface border border-border rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]`
- **Text Headings:** `text-[19px] font-bold text-text-darkest`
- **Text Secondary:** `text-[14px] text-text-secondary`
- **Button (OAuth):** `bg-surface border border-border rounded-md px-4 py-2 hover:bg-surface-secondary text-text-primary font-medium text-[14px]`
**Pattern notes:**
Modal-style centered card on a full background. Uses exact custom design token shadow. Button matches secondary standard but with 14px font and standard gap.

### DashboardPage
- **Path:** `app/dashboard/page.tsx`
- **Last updated:** 2026-06-12
- **Page Background:** `bg-background`
- **Card Container:** `bg-surface border border-border rounded-2xl p-8 shadow-sm max-w-md w-full text-center`
- **Text Headings:** `text-[19px] font-bold text-text-darkest mb-1`
- **Text Secondary:** `text-[14px] text-text-secondary mb-1`
- **Muted Text:** `text-[13px] text-text-muted`
- **Icon Container:** `bg-success-lightest rounded-full`
**Pattern notes:**
Minimal placeholder layout showing user's signed in state. Center-aligned card on a full background. Uses custom green icon container for success state checkmark.

### CompletionIndicator
- **Path:** `components/profile/CompletionIndicator.tsx`
- **Last updated:** 2026-06-12
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-5`
- **Ring Track:** SVG `stroke="var(--color-border)"` strokeWidth 6, radius 36
- **Ring Fill:** Dynamic — `stroke="var(--color-success)"` / `stroke="var(--color-warning)"` / `stroke="var(--color-error)"`
- **Percentage Label:** `text-[18px] font-bold text-text-primary`
- **Section Title:** `text-[16px] font-semibold text-text-primary`
- **Description Text:** `text-[13px] text-text-secondary mt-0.5`
- **Missing Field Tags:** `px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEE2E2] text-[#EF4444] uppercase tracking-wide`
**Pattern notes:**
Horizontal flex layout. SVG progress ring matches the designs with radius 36 (circumference 226px). Missing tags are red-tinted labels below the description.

### ResumeUpload
- **Path:** `components/profile/ResumeUpload.tsx`
- **Last updated:** 2026-06-13
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5`
- **Section Title:** `text-[16px] font-semibold text-text-primary`
- **Drop Zone:** `border border-dashed border-border rounded-xl py-10 px-6 cursor-pointer hover:border-accent hover:bg-accent-muted transition-colors`
- **Upload Icon Container:** `w-12 h-12 rounded-full bg-accent-light` with cloud-upload SVG inside.
- **Primary Text:** `text-[14px] font-semibold text-text-primary`
- **Subtext:** `text-[12px] text-text-muted mt-1`
- **Divider:** `border-t border-border pt-4`
- **Generate Button:** `bg-accent text-white hover:bg-accent-dark rounded-md px-4 py-2 text-[13px] font-medium flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-60 transition-colors`
- **Extract/Download Buttons:** Contains an 'Extract from Resume' button (`id="extract-resume-btn"` / text) when a file is selected, and a 'Download' button (`id="download-resume-btn"`) next to 'View File' for active profiles.
**Pattern notes:**
Standard container. Drag-and-drop zone transition on hover. Bottom footer contains resume generation trigger with a file icon. Contains custom buttons for extracting from a local file and downloading an existing resume from storage.

### ProfileForm
- **Path:** `components/profile/ProfileForm.tsx`
- **Last updated:** 2026-06-12
- **Section Card:** Single outer container card wrapping all sections: `bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col gap-8`
- **Section Heading:** `text-[15px] font-semibold text-text-primary mb-4`
- **Section Divider:** `<hr className="border-border -mx-8" />`
- **Field Label:** `text-[12px] font-medium uppercase tracking-wide text-text-secondary`
- **Input:** `w-full px-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent`
- **Select:** Same as input + `appearance-none`
- **Textarea:** Same as input + `resize-y`
- **Tag Pill:** `px-3 py-1 rounded-full bg-surface border border-border text-text-primary text-[13px] font-medium`
- **Add Tag Button:** `h-[42px] px-5 bg-surface border border-border rounded-md text-text-primary font-medium hover:bg-surface-secondary`
- **Work Exp Card:** `border border-border rounded-xl p-5 flex flex-col gap-4 relative`
- **Add Role Trigger:** inline with header `flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline`
- **Save Button:** Full-width block below card: `w-full py-3 h-[48px] text-[15px] font-semibold`
**Pattern notes:**
Unified single-card structure with internal section dividers. Custom tag inputs align the Add button inline. Job preferences (job titles, preferred locations) use comma-separated text fields as shown in designs.


