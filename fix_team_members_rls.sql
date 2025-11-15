-- Fix RLS policies for team_members table to allow session-based access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can update their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete their own team members" ON team_members;

-- Create new policies that allow anyone to access (for demo/session mode)
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
