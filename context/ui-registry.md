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
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm`
- **Ring Track:** SVG `stroke="var(--color-border)"` strokeWidth 5
- **Ring Fill:** Dynamic — `var(--color-success)` ≥80%, `var(--color-warning)` ≥50%, `var(--color-error)` below
- **Percentage Label:** `text-[13px] font-600 text-text-primary`
- **Section Title:** `text-[16px] font-semibold text-text-primary`
- **Description Text:** `text-[13px] text-text-muted`
- **Missing Field Tags:** `px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-semibold uppercase tracking-wide`
**Pattern notes:**
SVG-based ring (radius 28, circumference-based dash). Uses same card pattern as all other content sections. Tag pills for missing fields use accent-light / accent colors — same as skills badges elsewhere.

### ResumeUpload
- **Path:** `components/profile/ResumeUpload.tsx`
- **Last updated:** 2026-06-12
- **Card Container:** `bg-surface border border-border rounded-2xl p-6 shadow-sm`
- **Section Title:** `text-[16px] font-semibold text-text-primary` with lucide icon in `text-accent`
- **Drop Zone:** `border-2 border-dashed border-border rounded-xl py-10 px-6` hover: `hover:border-accent hover:bg-accent-muted`
- **Upload Icon Container:** `w-11 h-11 rounded-full bg-accent-light` with icon `text-accent`
- **Primary Text:** `text-[14px] font-medium text-text-primary`
- **Subtext:** `text-[12px] text-text-muted`
- **Divider:** `border-t border-border pt-4`
**Pattern notes:**
Drop zone uses dashed border that transitions to accent on hover. Icon in a rounded pill container using accent-light background. Card pattern is identical to all other profile section cards.

### ProfileForm
- **Path:** `components/profile/ProfileForm.tsx`
- **Last updated:** 2026-06-12
- **Section Card:** `bg-surface border border-border rounded-2xl p-6 shadow-sm`
- **Section Heading:** `text-[16px] font-semibold text-text-primary border-b border-border pb-3 mb-5`
- **Field Label:** `text-[12px] font-medium uppercase tracking-wide text-text-secondary`
- **Input:** `w-full px-3 py-2 border border-border rounded-md bg-surface text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent`
- **Select:** Same as input + `appearance-none`
- **Textarea:** Same as input + `resize-y`
- **Tag Pill:** `px-2 py-0.5 rounded-full bg-accent-light text-accent text-[12px] font-medium`
- **Remove Tag Button:** hover `hover:text-accent-dark`
- **Add Tag Link:** `text-[12px] text-accent font-medium hover:underline` with Plus icon
- **Work Exp Container:** `border border-border rounded-xl p-4`
- **Disabled Input:** `opacity-60 cursor-not-allowed` (email field only)
**Pattern notes:**
Each form section is its own card with a ruled heading. Field labels are uppercase 12px tracking-wide — consistent with table column headers. Tag inputs use accent-light pill pattern shared with skills badges and CompletionIndicator tags. Work experience roles live in a secondary border container inside the section card (two border levels max per ui-rules.md).

