# JobPilot

JobPilot is a full-stack, AI-powered job hunting assistant that fully automates the discovery, filtering, and research of technology jobs. By combining the power of GPT-4o, automated browser sessions (Browserbase + Stagehand), and a modern tech stack, JobPilot transforms the job application process from an exhaustive chore into an informed, one-click experience.

##  Features

- **Automated Profile Setup**: Upload your resume PDF and let GPT-4o parse and extract your work experience, skills, and education to automatically fill out your profile.
- **Smart Job Discovery**: Uses the Adzuna API to actively search for IT jobs across multiple regions based on your custom criteria.
- **AI-Powered Matching Engine**: Every job found is scored (0-100) by GPT-4o against your *actual* profile and skills. See exactly why a job is a good fit, what skills you match, and what gaps you have.
- **Agentic Company Research**: Before applying, JobPilot spins up a headless browser (Browserbase + Stagehand) to independently navigate a company's homepage, About, and Engineering pages, automatically synthesizing a structured dossier covering tech stack, culture, interview prep, and why the role exists.
- **Intelligent Dashboard & Analytics**: A comprehensive dashboard featuring real-time statistics and analytics charts—powered by PostHog HogQL—visualizing your jobs found, match scores, and research activity.
- **Resume PDF Generation**: Instantly generate clean, professional, single-page PDFs based on your current profile data.

---

## Tech Stack

### Frontend & Application Framework
- **Next.js (App Router)**: Server Components, Server Actions, and React 18+ features.
- **Tailwind CSS**: Utility-first styling with custom design tokens for a polished UI.
- **Recharts**: Data visualization for dashboard analytics.
- **@react-pdf/renderer**: Server-side generation of professional PDF resumes.

### Backend as a Service (BaaS)
- **InsForge**: Used exclusively for backend infrastructure.
  - **Auth**: Google and GitHub OAuth.
  - **Database**: PostgreSQL (handling profiles, jobs, agent logs, and JSONB dossiers).
  - **Storage**: Secure authenticated bucket for resume PDFs.
  - **RLS**: Row-Level Security ensuring every user's data remains private.

### AI & Agents
- **GPT-4o (via OpenRouter)**: Core intelligence engine for resume extraction, job matching, and dossier synthesis.
- **Browserbase & Stagehand**: Headless browser automation for deep-dive company research and site navigation.
- **pdf-parse**: Fast parsing of text from uploaded resumes.

### APIs & Analytics
- **Adzuna API**: Real-time job board aggregation and search.
- **PostHog**: Product analytics, event tracking (`job_found`, `company_researched`), and HogQL-powered dashboard charts.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/job_pilot.git
cd job_pilot
```

### 2. Install dependencies

```bash
npm install
# or yarn, pnpm, bun
```

### 3. Environment Variables
Copy `.env.local.example` to `.env.local` (or configure your own) and add your keys:

```env
# InsForge
NEXT_PUBLIC_INSFORGE_URL=your_insforge_url
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_anon_key

# PostHog
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=your_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PERSONAL_API_KEY=your_personal_key
POSTHOG_PROJECT_ID=your_project_id

# AI & APIs
OPENROUTER_API_KEY=your_openrouter_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
BROWSERBASE_API_KEY=your_browserbase_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

##  Project Architecture

JobPilot is organized conceptually by its primary domains:

- `app/` — Next.js App Router containing pages, API routes (`/api/agent`, `/api/resume`), and route guards.
- `components/` — Modular, token-styled UI components split by domain (`dashboard`, `find-jobs`, `job-details`, `profile`, `layout`).
- `lib/` — Singleton clients and server implementations for third-party libraries (PostHog, InsForge, Adzuna).
- `actions/` — Next.js Server Actions for secure database mutations.
- `agent/` — Orchestration files and type definitions for AI workflows (job matching and company research).

> *Refer to the `context/` directory in the repository for detailed architectural documentation, UI registry components, and the full build plan.*

---

## License

This project is licensed under the MIT License.
