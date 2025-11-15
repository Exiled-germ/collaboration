-- PhaseFlow v2.1 RLS Policies
-- Run this AFTER creating tables with SIMPLE_SETUP.sql

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
DROP POLICY IF EXISTS "Users can manage phases of their projects" ON phases;
DROP POLICY IF EXISTS "Users can manage invites for their projects" ON ai_invites;
DROP POLICY IF EXISTS "Users can manage artifacts of their projects" ON artifacts;
DROP POLICY IF EXISTS "Users can manage activity of their projects" ON activity_timeline;

-- RLS Policies for team_members
CREATE POLICY "Users can manage their own team members"
  ON team_members FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for phases
CREATE POLICY "Users can manage phases of their projects"
  ON phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = phases.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = phases.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_invites
CREATE POLICY "Users can manage invites for their projects"
  ON ai_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_invites.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for artifacts
CREATE POLICY "Users can manage artifacts of their projects"
  ON artifacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = artifacts.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = artifacts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for activity_timeline
CREATE POLICY "Users can manage activity of their projects"
  ON activity_timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_timeline.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_timeline.project_id
      AND projects.user_id = auth.uid()
    )
  );
