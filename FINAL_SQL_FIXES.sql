-- ===================================
-- FINAL SQL FIXES - 한 번에 실행하세요
-- ===================================

-- 1. Fix artifacts RLS policies
DROP POLICY IF EXISTS "Users can view artifacts of their projects" ON artifacts;
DROP POLICY IF EXISTS "Users can insert artifacts to their projects" ON artifacts;

CREATE POLICY "Anyone can view artifacts"
  ON artifacts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update artifacts"
  ON artifacts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete artifacts"
  ON artifacts FOR DELETE
  USING (true);

-- 2. Fix team_members RLS policies
DROP POLICY IF EXISTS "Users can view their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can update their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete their own team members" ON team_members;

CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update team members"
  ON team_members FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete team members"
  ON team_members FOR DELETE
  USING (true);

-- 3. Fix trigger function
DROP TRIGGER IF EXISTS update_session_access_on_artifact ON artifacts;
DROP FUNCTION IF EXISTS update_session_last_accessed();

CREATE OR REPLACE FUNCTION update_session_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions
  SET last_accessed = NOW()
  WHERE current_project_id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_access_on_artifact
  AFTER INSERT ON artifacts
  FOR EACH ROW
  WHEN (NEW.project_id IS NOT NULL)
  EXECUTE FUNCTION update_session_last_accessed();

-- 4. Fix AI invites RLS policies (optional, for completeness)
DROP POLICY IF EXISTS "Users can view invites of their projects" ON ai_invites;
DROP POLICY IF EXISTS "Users can insert invites to their projects" ON ai_invites;

CREATE POLICY "Anyone can view invites"
  ON ai_invites FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert invites"
  ON ai_invites FOR INSERT
  WITH CHECK (true);

-- 5. Fix activity_timeline RLS policies
DROP POLICY IF EXISTS "Users can view activity of their projects" ON activity_timeline;
DROP POLICY IF EXISTS "Users can insert activity to their projects" ON activity_timeline;

CREATE POLICY "Anyone can view activity"
  ON activity_timeline FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert activity"
  ON activity_timeline FOR INSERT
  WITH CHECK (true);
