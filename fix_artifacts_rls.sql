-- Fix RLS policies for artifacts table to allow session-based access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view artifacts of their projects" ON artifacts;
DROP POLICY IF EXISTS "Users can insert artifacts to their projects" ON artifacts;

-- Create new policies that allow session-based access
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
