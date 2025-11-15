// Session management service for nickname-based access
import { supabase } from "@/integrations/supabase/client";

export interface Session {
  id: string;
  nickname: string;
  current_project_id: string | null;
  last_accessed: string;
  created_at: string;
}

export async function getOrCreateSession(nickname: string): Promise<Session> {
  // Check if session exists
  const { data: existingSession, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('nickname', nickname)
    .single();

  if (existingSession && !fetchError) {
    // Update last accessed
    await supabase
      .from('sessions')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', existingSession.id);
    
    return existingSession;
  }

  // Create new session
  const { data: newSession, error: createError } = await supabase
    .from('sessions')
    .insert({ nickname })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create session: ${createError.message}`);
  }

  return newSession;
}

export async function getSessionProject(sessionId: string) {
  console.log('🔍 Fetching project for session:', sessionId);
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('session_id', sessionId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Error fetching session project:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log('📭 No project found for this session');
    return null;
  }

  console.log('✅ Project found:', data[0].project_name);
  return data[0];
}

export async function saveArtifact(
  projectId: string,
  phaseId: string,
  phaseName: string,
  content: string,
  nickname: string,
  artifactType: 'text' | 'pdf' | 'image' | 'notion' = 'text'
) {
  const { data, error } = await supabase
    .from('artifacts')
    .insert({
      project_id: projectId,
      phase_id: phaseId,
      phase_name: phaseName,
      content,
      uploaded_by_nickname: nickname,
      artifact_type: artifactType,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save artifact: ${error.message}`);
  }

  return data;
}

export async function getProjectArtifacts(projectId: string) {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artifacts:', error);
    return [];
  }

  return data || [];
}

export async function saveProjectToSession(
  sessionId: string,
  projectData: any,
  teamMembers: any[]
) {
  // Save project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      session_id: sessionId,
      project_name: projectData.project_name,
      project_summary: projectData.project_summary,
      phases: projectData.phases,
    })
    .select()
    .single();

  if (projectError) {
    throw new Error(`Failed to save project: ${projectError.message}`);
  }

  // Update session's current project
  await supabase
    .from('sessions')
    .update({ current_project_id: project.id })
    .eq('id', sessionId);

  // Save team members (without user_id for session-based access)
  if (teamMembers && teamMembers.length > 0) {
    const { error: membersError } = await supabase
      .from('team_members')
      .insert(
        teamMembers.map(m => ({
          ...m,
          user_id: null, // No auth user for session-based access
        }))
      );

    if (membersError) {
      console.error('Error saving team members:', membersError);
    }
  }

  return project;
}
