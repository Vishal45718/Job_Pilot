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
- **Last updated:** 2026-06-17
- **Page Background:** `bg-background pb-12`
- **Main Container:** `w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6`
**Pattern notes:**
Full dashboard layout. Uses a wide 1440px max-width container to accommodate multiple charts.

### StatsBar
- **Path:** `components/dashboard/StatsBar.tsx`
- **Last updated:** 2026-06-17
- **Grid Container:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between`
- **Trend Badge:** `bg-success-lightest text-success-darker rounded-sm px-2 py-0.5 text-[12px] font-medium`
**Pattern notes:**
Simple 4-column metric cards.

### RecentActivity
- **Path:** `components/dashboard/RecentActivity.tsx`
- **Last updated:** 2026-06-17
- **Card Container:** `bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full`
- **Timeline Ring:** `w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface`
- **Timeline Dot:** `w-2 h-2 rounded-full`
**Pattern notes:**
Vertical timeline using absolute positioning for the connecting line. Color-coded dots based on activity type.

### AnalyticsCharts
- **Path:** `components/dashboard/AnalyticsCharts.tsx`
- **Last updated:** 2026-06-17
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full`
- **Chart Container:** `flex-1 w-full h-[250px]`
**Pattern notes:**
Recharts wrappers utilizing `ResponsiveContainer`. Uses custom SVG gradients for line charts and specific border radius for bar charts.

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

### FindJobsSearch
- **Path:** `components/find-jobs/FindJobsSearch.tsx`
- **Last updated:** 2026-06-13
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6`
- **Input Wrapper:** `relative w-full` with absolute icon on the left `pl-3 flex items-center pointer-events-none`
- **Input:** `w-full pl-9 pr-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none`
- **Success Banner:** `bg-success-lightest border border-success-light rounded-lg px-4 py-3 flex items-center gap-2`
**Pattern notes:**
Groups top-level search form and match result banner into a single card container.

### FindJobsFilter
- **Path:** `components/find-jobs/FindJobsFilter.tsx`
- **Last updated:** 2026-06-13
- **Toolbar Container:** `bg-surface border border-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`
- **Search Input (No Border):** `w-full pl-9 pr-3 py-2 border-none bg-transparent text-[14px] outline-none`
- **Selects:** Native select styled `appearance-none bg-surface border border-border rounded-md px-3 py-2 pr-8 text-[14px]` with absolute ChevronDown icon.
**Pattern notes:**
Inline filter toolbar placed between search card and results table. Synchronized with URL search parameters.

### JobsTable
- **Path:** `components/find-jobs/JobsTable.tsx`
- **Last updated:** 2026-06-13
- **Table Container:** `bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col`
- **Header Th:** `px-6 py-4 text-[12px] font-medium text-text-secondary uppercase tracking-wider`
- **Row Tr:** `hover:bg-surface-secondary transition-colors group border-b border-border`
- **Company Icon:** `w-10 h-10 rounded-lg border border-border bg-surface-secondary flex items-center justify-center text-text-muted group-hover:bg-surface`
- **Match Score Bar:** `w-[100px] h-1.5 bg-border-light rounded-full overflow-hidden` with colored fill and % text.
- **Pagination Footer:** `px-6 py-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4`
**Pattern notes:**
Standard data table with fixed minimum width (`min-w-[800px]`) allowing x-overflow. Contains the inline match score visual progress bar. Table rows are cursor-pointer and link to individual job pages. Footer handles dynamic pagination.

### JobInfo
- **Path:** `components/job-details/JobInfo.tsx`
- **Last updated:** 2026-06-13
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6`
- **Company Logo:** `w-16 h-16 rounded-xl border border-border bg-surface-secondary flex items-center justify-center text-text-muted`
- **Match Badge:** `px-2.5 py-0.5 rounded-full font-semibold text-[12px] bg-success-lightest text-success-darker`
- **Info Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- **Info Card:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4`
**Pattern notes:**
Top header for job details containing the dynamic color match score badge and standard external link button. Below it is a 4-column responsive grid containing key metrics with varied color icon circles.

### MatchScore
- **Path:** `components/job-details/MatchScore.tsx`
- **Last updated:** 2026-06-13
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6`
- **Section Heading:** `text-[12px] font-bold uppercase tracking-widest text-text-secondary`
- **Matched Skill Tag:** `px-3 py-1.5 rounded-full bg-success-lightest text-success-foreground text-[13px] font-medium`
- **Missing Skill Tag:** `px-3 py-1.5 rounded-full bg-accent-muted text-accent text-[13px] font-medium`
**Pattern notes:**
Split into reasoning text and tag lists. Skills are visually separated by success (green) and accent (purple) background pills to differentiate user matches vs gaps.

### JobDescription
- **Path:** `components/job-details/JobDescription.tsx`
- **Last updated:** 2026-06-13
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4`
- **Paragraph:** `text-[14px] font-medium text-text-primary leading-relaxed whitespace-pre-wrap`
**Pattern notes:**
Simple text block wrapper maintaining standard border radius and padding constraints.

### CompanyResearch
- **Path:** `components/job-details/CompanyResearch.tsx`
- **Last updated:** 2026-06-13
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6`
- **Empty State Container:** `flex flex-col items-center justify-center text-center py-16 px-6`
- **Large Icon:** `w-14 h-14 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-muted mb-5 shadow-sm`
**Pattern notes:**
Currently renders an empty state to prompt user action. Similar empty state pattern as dashboard placeholders.

### JobActions
- **Path:** `components/job-details/JobActions.tsx`
- **Last updated:** 2026-06-13
- **Main Button:** `w-full bg-accent text-white hover:bg-accent-dark rounded-xl h-[56px] text-[16px] font-semibold flex items-center justify-center transition-colors shadow-sm`
**Pattern notes:**
Huge bottom CTA sticking out prominently to encourage the final conversion step. Uses larger border radius (`rounded-xl`) and height.
