-- Fix the trigger function that's causing the error

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS update_session_access_on_artifact ON artifacts;

-- Drop the function
DROP FUNCTION IF EXISTS update_session_last_accessed();

-- Create a simpler function that doesn't rely on session_id in artifacts
CREATE OR REPLACE FUNCTION update_session_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session based on project_id
  UPDATE sessions
  SET last_accessed = NOW()
  WHERE current_project_id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_session_access_on_artifact
  AFTER INSERT ON artifacts
  FOR EACH ROW
  WHEN (NEW.project_id IS NOT NULL)
  EXECUTE FUNCTION update_session_last_accessed();
