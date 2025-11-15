-- Nickname-based Sessions for PhaseFlow
-- Allows teams to continue work using a shared nickname

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL UNIQUE,
  current_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update projects table to link with sessions
ALTER TABLE projects ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE;

-- Update artifacts table to track uploader
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS uploaded_by_nickname TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_nickname ON sessions(nickname);
CREATE INDEX IF NOT EXISTS idx_projects_session_id ON projects(session_id);

-- RLS Policies for sessions (public read/write for demo mode)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sessions"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON sessions FOR UPDATE
  USING (true);

-- Update existing policies to allow session-based access
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

CREATE POLICY "Users can view projects by session or user"
  ON projects FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can insert projects by session or user"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can update projects by session or user"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can delete projects by session or user"
  ON projects FOR DELETE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION update_session_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions
  SET last_accessed = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session access time when project is accessed
CREATE TRIGGER update_session_access_on_artifact
  AFTER INSERT ON artifacts
  FOR EACH ROW
  WHEN (NEW.project_id IS NOT NULL)
  EXECUTE FUNCTION update_session_last_accessed();
