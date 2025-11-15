-- 기존 테이블 완전 삭제 후 재생성
DROP TABLE IF EXISTS activity_timeline CASCADE;
DROP TABLE IF EXISTS artifacts CASCADE;
DROP TABLE IF EXISTS ai_invites CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

-- Team Members Table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  loves TEXT[] DEFAULT '{}',
  hates TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  career TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_summary TEXT,
  company_description TEXT,
  phases JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phases Table
CREATE TABLE phases (
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
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Invites Table
CREATE TABLE ai_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  target_user TEXT NOT NULL,
  target_email TEXT,
  invite_message TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artifacts Table
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  content TEXT NOT NULL,
  artifact_type TEXT DEFAULT 'text',
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Timeline Table
CREATE TABLE activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own team members"
  ON team_members FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage phases of their projects"
  ON phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = phases.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage invites for their projects"
  ON ai_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage artifacts of their projects"
  ON artifacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = artifacts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage activity of their projects"
  ON activity_timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_timeline.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_phases_project_id ON phases(project_id);
CREATE INDEX idx_ai_invites_project_id ON ai_invites(project_id);
CREATE INDEX idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX idx_activity_timeline_project_id ON activity_timeline(project_id);
