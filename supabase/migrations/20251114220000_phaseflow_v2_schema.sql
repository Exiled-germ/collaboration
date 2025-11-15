-- PhaseFlow v2.0 Database Schema

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  loves TEXT[] DEFAULT '{}',
  hates TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  career TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_summary TEXT,
  company_description TEXT,
  phases JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phases Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  recommended TEXT[] DEFAULT '{}',
  active TEXT[] DEFAULT '{}',
  milestone TEXT,
  deadline TEXT,
  kpis TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Invites Table
CREATE TABLE IF NOT EXISTS ai_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  target_user TEXT NOT NULL,
  target_email TEXT,
  invite_message TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artifacts/Feed Items Table
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  content TEXT NOT NULL,
  uploaded_by TEXT,
  artifact_type TEXT DEFAULT 'text' CHECK (artifact_type IN ('text', 'pdf', 'image', 'notion')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Timeline Table
CREATE TABLE IF NOT EXISTS activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_invites_project_id ON ai_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_invites_target_email ON ai_invites(target_email);
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_project_id ON activity_timeline(project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;

-- Team Members Policies
CREATE POLICY "Users can view their own team members"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
  ON team_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members"
  ON team_members FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Phases Policies
CREATE POLICY "Users can view phases of their projects"
  ON phases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert phases to their projects"
  ON phases FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update phases of their projects"
  ON phases FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete phases of their projects"
  ON phases FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = phases.project_id
    AND projects.user_id = auth.uid()
  ));

-- AI Invites Policies
CREATE POLICY "Users can view invites of their projects"
  ON ai_invites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert invites to their projects"
  ON ai_invites FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ai_invites.project_id
    AND projects.user_id = auth.uid()
  ));

-- Artifacts Policies
CREATE POLICY "Users can view artifacts of their projects"
  ON artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert artifacts to their projects"
  ON artifacts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND projects.user_id = auth.uid()
  ));

-- Activity Timeline Policies
CREATE POLICY "Users can view activity of their projects"
  ON activity_timeline FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_timeline.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert activity to their projects"
  ON activity_timeline FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_timeline.project_id
    AND projects.user_id = auth.uid()
  ));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phases_updated_at
  BEFORE UPDATE ON phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
