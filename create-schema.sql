-- Create agent_runs table
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  job_title_searched TEXT,
  location_searched TEXT,
  jobs_found INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('search', 'url')),
  source_url TEXT,
  external_apply_url TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  job_type TEXT,
  about_role TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  nice_to_have TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  about_company TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  match_reason TEXT,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  company_research JSONB,
  found_at TIMESTAMPTZ DEFAULT now()
);

-- Create agent_logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('info', 'success', 'warning', 'error')),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- agent_runs policies
CREATE POLICY "Users can insert own agent runs" ON agent_runs
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent runs" ON agent_runs
  FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can select own agent runs" ON agent_runs
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agent runs" ON agent_runs
  FOR DELETE TO public USING (auth.uid() = user_id);

-- jobs policies
CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can select own jobs" ON jobs
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE TO public USING (auth.uid() = user_id);

-- agent_logs policies
CREATE POLICY "Users can insert own agent logs" ON agent_logs
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent logs" ON agent_logs
  FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can select own agent logs" ON agent_logs
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agent logs" ON agent_logs
  FOR DELETE TO public USING (auth.uid() = user_id);
