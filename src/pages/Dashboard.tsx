import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectPhases from "@/components/dashboard/ProjectPhases";
import ArtifactUpload from "@/components/dashboard/ArtifactUpload";
import AIInvites from "@/components/dashboard/AIInvites";
import PhaseRefinePanel from "@/components/dashboard/PhaseRefinePanel";
import PhaseDetailDialog from "@/components/dashboard/PhaseDetailDialog";
import { ActivityTimeline, logActivity } from "@/components/dashboard/ActivityTimeline";
import { NotionImportPanel } from "@/components/dashboard/NotionImportPanel";
import { Sparkles, Users, LogOut } from "lucide-react";
import { analyzeArtifact } from "@/lib/gemini";
import type { NotionPageContent } from "@/lib/notionService";
import { saveArtifact, getProjectArtifacts } from "@/lib/sessionService";

export interface Phase {
  id: string;
  name: string;
  description?: string;
  recommended: string[];
  active: string[];
  milestone?: string;
  deadline?: string;
  kpis?: string[];
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: Date;
}

export interface ProjectData {
  project_name: string;
  project_summary: string;
  phases: Phase[];
}

export interface AIInvite {
  target_user: string;
  invite_message: string;
  reason: string;
}

export interface FeedItem {
  phase: string;
  content: string;
  timestamp: Date;
}

const Dashboard = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [profiles, setProfiles] = useState("");
  const [invites, setInvites] = useState<AIInvite[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [currentMember, setCurrentMember] = useState<string>("");
  const [showMemberSelect, setShowMemberSelect] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{name: string, role: string}>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout error:", error);
      }
      toast({
        title: "Sign Out Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMemberSelect = (memberName: string) => {
    setCurrentMember(memberName);
    sessionStorage.setItem('phaseflow_current_member', memberName);
    setShowMemberSelect(false);
    
    toast({
      title: "신원 확인 완료",
      description: `${memberName}님으로 작업을 시작합니다.`,
    });
  };

  const handleNicknameSwitch = async () => {
    if (!nicknameInput.trim()) {
      toast({
        title: "닉네임 필요",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { getOrCreateSession, getSessionProject } = await import('@/lib/sessionService');
      
      // Get or create session with new nickname
      const session = await getOrCreateSession(nicknameInput);
      sessionStorage.setItem('phaseflow_nickname', nicknameInput);
      sessionStorage.setItem('phaseflow_session_id', session.id);
      
      // Load project for this session
      if (session.current_project_id) {
        const project = await getSessionProject(session.id);
        if (project) {
          sessionStorage.setItem('phaseflow_project', JSON.stringify(project));
          sessionStorage.setItem('phaseflow_project_id', project.id);
          
          setProjectData(project);
          setCurrentNickname(nicknameInput);
          setShowNicknameInput(false);
          setNicknameInput("");
          
          // Reload artifacts
          const artifacts = await getProjectArtifacts(project.id);
          const feedItemsFromDB = artifacts.map(artifact => ({
            phase: artifact.phase_name,
            phase_id: artifact.phase_id,
            content: artifact.content,
            timestamp: new Date(artifact.created_at),
            uploadedBy: artifact.uploaded_by_nickname,
          }));
          setFeedItems(feedItemsFromDB);
          
          toast({
            title: "프로젝트 로드 완료",
            description: `${nicknameInput} 팀의 프로젝트를 불러왔습니다.`,
          });
          return;
        }
      }
      
      // No project found for this nickname
      setCurrentNickname(nicknameInput);
      setShowNicknameInput(false);
      setNicknameInput("");
      
      toast({
        title: "새 세션 시작",
        description: `${nicknameInput} 팀으로 새 프로젝트를 시작하세요.`,
      });
      
      // Redirect to onboarding
      navigate('/onboarding');
      
    } catch (error) {
      console.error('Nickname switch error:', error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "닉네임 전환 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Load project data from sessionStorage on mount
  useEffect(() => {
    const loadProjectData = async () => {
      const nickname = sessionStorage.getItem('phaseflow_nickname');
      const storedProject = sessionStorage.getItem('phaseflow_project');
      const storedProfiles = sessionStorage.getItem('phaseflow_profiles');
      const projectId = sessionStorage.getItem('phaseflow_project_id');
      const storedMember = sessionStorage.getItem('phaseflow_current_member');
      const storedTeamMembers = sessionStorage.getItem('phaseflow_team_members');
      
      if (nickname) {
        setCurrentNickname(nickname);
      }

      if (storedMember) {
        setCurrentMember(storedMember);
      }

      if (storedTeamMembers) {
        try {
          const members = JSON.parse(storedTeamMembers);
          setTeamMembers(members);
          
          // Show member selection if not already selected
          if (!storedMember && members.length > 0) {
            setShowMemberSelect(true);
          }
        } catch (error) {
          console.error('Error parsing team members:', error);
        }
      }
      
      if (storedProfiles) {
        setProfiles(storedProfiles);
      }
      
      if (storedProject) {
        try {
          const parsed = JSON.parse(storedProject);
          setProjectData(parsed);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Error parsing project data:", error);
          }
        }
      }

      // Load existing artifacts from database
      if (projectId) {
        try {
          const artifacts = await getProjectArtifacts(projectId);
          const feedItemsFromDB = artifacts.map(artifact => ({
            phase: artifact.phase_name,
            phase_id: artifact.phase_id,
            content: artifact.content,
            timestamp: new Date(artifact.created_at),
            uploadedBy: artifact.uploaded_by_nickname,
          }));
          setFeedItems(feedItemsFromDB);
        } catch (error) {
          console.error('Error loading artifacts:', error);
        }
      }
    };

    loadProjectData();
  }, []);

  const handleArtifactUpload = async (phaseId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Input required",
        description: "Please enter work content.",
        variant: "destructive",
      });
      return;
    }

    if (!projectData) {
      toast({
        title: "No project",
        description: "Please create a project first.",
        variant: "destructive",
      });
      return;
    }

    const phase = projectData.phases.find(p => p.id === phaseId);
    const phaseName = phase?.name || phaseId;
    
    // Add current member to phase active list if not already there
    if (currentMember && phase && !phase.active.includes(currentMember)) {
      const updatedPhases = projectData.phases.map(p => 
        p.id === phaseId 
          ? { ...p, active: [...p.active, currentMember] }
          : p
      );
      const updatedProject = { ...projectData, phases: updatedPhases };
      setProjectData(updatedProject);
      sessionStorage.setItem('phaseflow_project', JSON.stringify(updatedProject));
      
      // Update in database
      const projectId = sessionStorage.getItem('phaseflow_project_id');
      if (projectId) {
        await supabase
          .from('projects')
          .update({ phases: updatedPhases })
          .eq('id', projectId);
      }
    }
    
    // Add to feed
    const newFeedItem = {
      phase: phaseName,
      phase_id: phaseId,
      content,
      timestamp: new Date()
    };
    setFeedItems(prev => [newFeedItem, ...prev]);

    setIsAnalyzing(true);
    
    try {
      const projectId = sessionStorage.getItem('phaseflow_project_id');
      const nickname = sessionStorage.getItem('phaseflow_nickname');

      if (!projectId || !nickname) {
        throw new Error('세션 정보가 없습니다.');
      }

      // Save artifact to database with current member name
      await saveArtifact(projectId, phaseId, phaseName, content, currentMember || nickname);

      // Call Gemini API
      const invitesData = await analyzeArtifact(profiles, phaseId, phaseName, content);

      if (invitesData && Array.isArray(invitesData)) {
        // Save invites to database
        const invitesToSave = invitesData.map(invite => ({
          project_id: projectId,
          phase_id: phaseId,
          phase_name: phaseName,
          target_user: invite.target_user,
          target_email: invite.target_email || '',
          invite_message: invite.invite_message,
          reason: invite.reason,
          status: 'pending',
        }));

        // Skip database save in demo mode
        console.log('Demo mode: Skipping invites save');

        // Get team members from sessionStorage
        const teamMembersStr = sessionStorage.getItem('phaseflow_team_members');
        const teamMembers = teamMembersStr ? JSON.parse(teamMembersStr) : [];

        // Add emails to invites
        const invitesWithEmails = invitesData.map(invite => {
          const member = teamMembers?.find(m => m.name === invite.target_user);
          return {
            ...invite,
            target_email: member?.email || '',
          };
        });

        setInvites(prev => [...invitesWithEmails, ...prev]);
        
        toast({
          title: "Analysis complete",
          description: invitesData.length > 0 
            ? `${invitesData.length} AI invite(s) generated!`
            : "No next-step collaboration needed.",
        });

        // Send email notifications
        if (invitesWithEmails.length > 0) {
          console.log('📧 Preparing to send emails:', invitesWithEmails);
          
          const projectName = projectData?.project_name || 'PhaseFlow Project';
          const { sendBatchInvites } = await import('@/lib/email');
          
          try {
            const emailResult = await sendBatchInvites(
              invitesWithEmails.map(inv => ({
                target_user: inv.target_user,
                target_email: inv.target_email || '',
                invite_message: inv.invite_message,
                reason: inv.reason,
                phase_name: phaseName,
              })),
              projectName
            );
            
            console.log('✅ Email invites sent:', emailResult);
            
            if (emailResult.successful > 0) {
              toast({
                title: "이메일 발송 완료",
                description: `${emailResult.successful}개의 초대 이메일이 발송되었습니다.`,
              });
            }
          } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            toast({
              title: "이메일 발송 실패",
              description: "이메일 발송 중 오류가 발생했습니다.",
              variant: "destructive",
            });
          }
        } else {
          console.log('⚠️ No invites with emails to send');
        }
      }
    } catch (error) {
      console.error("Error analyzing artifact:", error);
      toast({
        title: "Error occurred",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyRefinedProject = (refinedProject: ProjectData) => {
    setProjectData(refinedProject);
    sessionStorage.setItem('phaseflow_project', JSON.stringify(refinedProject));
    
    toast({
      title: "Phase structure updated",
      description: "New phase structure has been applied.",
    });
  };

  const handlePhaseClick = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsPhaseDialogOpen(true);
  };

  const handlePhaseComplete = async (phaseId: string) => {
    if (!projectData) return;

    const phase = projectData.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const newStatus = phase.status === 'pending' ? 'in-progress' : 'completed';
    
    const updatedPhases = projectData.phases.map(p => 
      p.id === phaseId 
        ? { ...p, status: newStatus as 'pending' | 'in-progress' | 'completed', completedAt: newStatus === 'completed' ? new Date() : undefined }
        : p
    );

    const updatedProject = { ...projectData, phases: updatedPhases };
    setProjectData(updatedProject);
    sessionStorage.setItem('phaseflow_project', JSON.stringify(updatedProject));

    // Update in database
    const projectId = sessionStorage.getItem('phaseflow_project_id');
    if (projectId) {
      await supabase
        .from('projects')
        .update({ phases: updatedPhases })
        .eq('id', projectId);

      // Log activity
      await logActivity(
        projectId,
        newStatus === 'completed' ? 'phase_completed' : 'phase_started',
        `${phase.name} ${newStatus === 'completed' ? '완료됨' : '시작됨'}`,
        { phase_id: phaseId, phase_name: phase.name, status: newStatus }
      );
    }

    toast({
      title: newStatus === 'completed' ? "Phase completed!" : "Phase started!",
      description: `${phase.name} is now ${newStatus}.`,
    });
  };

  // Convert phases array to Record for ArtifactUpload component
  const phasesRecord: Record<string, Phase> = {};
  projectData?.phases.forEach(phase => {
    phasesRecord[phase.id] = phase;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Member Selection Dialog */}
      {showMemberSelect && teamMembers.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold mb-4">팀원 선택</h2>
            <p className="text-sm text-muted-foreground mb-4">
              당신은 누구인가요? 선택한 이름으로 작업이 기록됩니다.
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teamMembers.map((member, index) => (
                <button
                  key={index}
                  onClick={() => handleMemberSelect(member.name)}
                  className="w-full p-4 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setShowMemberSelect(false)}
              variant="outline"
              className="w-full mt-4"
            >
              취소
            </Button>
          </div>
        </div>
      )}
      
      {/* Nickname Switch Dialog */}
      {showNicknameInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold mb-4">팀 닉네임 입력</h2>
            <p className="text-sm text-muted-foreground mb-4">
              다른 팀의 프로젝트에 참여하거나 새 팀으로 시작하세요
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">팀 닉네임</label>
                <Input
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="예: 스타트업팀, 개발팀A"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNicknameSwitch();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleNicknameSwitch}
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                >
                  확인
                </Button>
                <Button
                  onClick={() => {
                    setShowNicknameInput(false);
                    setNicknameInput("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-medium)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PhaseFlow v2.0
                </h1>
                <p className="text-muted-foreground">Live Dashboard - Real-time Collaboration Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentNickname && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{currentNickname}</span>
                </div>
              )}
              {currentMember && (
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg border border-accent/20">
                  <span className="text-sm">👤 {currentMember}</span>
                </div>
              )}
              <Button
                onClick={() => setShowMemberSelect(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">신원 변경</span>
              </Button>
              <Button
                onClick={() => setShowNicknameInput(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">팀 전환</span>
              </Button>
              <a
                href="/onboarding"
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors border border-border"
                title="Edit project and team info"
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">새 프로젝트</span>
              </a>
            </div>
          </div>
          <p className="text-lg text-foreground font-medium">
            {projectData?.project_name || "Please create a project"}
          </p>
          {projectData?.project_summary && (
            <p className="text-sm text-muted-foreground mt-1">{projectData.project_summary}</p>
          )}
        </div>

        {projectData ? (
          <>
            {/* Project Phases */}
            <ProjectPhases 
              phases={projectData.phases} 
              onPhaseClick={handlePhaseClick}
              onPhaseComplete={handlePhaseComplete}
            />

            {/* Phase Detail Dialog */}
            <PhaseDetailDialog
              phase={selectedPhase}
              isOpen={isPhaseDialogOpen}
              onClose={() => setIsPhaseDialogOpen(false)}
              feedItems={feedItems}
              invites={invites}
            />

            {/* Phase Refine Panel */}
            <div className="mt-6">
              <PhaseRefinePanel
                currentProject={projectData}
                profiles={profiles}
                onApplyChanges={handleApplyRefinedProject}
                isRefining={isRefining}
                setIsRefining={setIsRefining}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Activity Feed */}
              <ArtifactUpload 
                phases={phasesRecord}
                onUpload={handleArtifactUpload}
                feedItems={feedItems}
                isAnalyzing={isAnalyzing}
              />

              {/* AI Invites */}
              <AIInvites invites={invites} isAnalyzing={isAnalyzing} />
            </div>

            {/* Additional Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Activity Timeline */}
              <ActivityTimeline projectId={sessionStorage.getItem('phaseflow_project_id') || ''} />

              {/* Notion Import */}
              <NotionImportPanel 
                onImport={(content) => {
                  if (Array.isArray(content)) {
                    // Multiple pages from database
                    const combinedContent = content.map(page => 
                      `# ${page.title}\n\n${page.content}`
                    ).join('\n\n---\n\n');
                    
                    toast({
                      title: "Notion 가져오기 완료",
                      description: `${content.length}개 페이지를 가져왔습니다.`,
                    });
                    
                    // You can process this content further
                    console.log('Imported Notion content:', combinedContent);
                  } else {
                    // Single page
                    toast({
                      title: "Notion 가져오기 완료",
                      description: `"${content.title}" 페이지를 가져왔습니다.`,
                    });
                    
                    console.log('Imported Notion page:', content);
                  }
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Sparkles className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">프로젝트가 없습니다</h3>
            <p className="text-muted-foreground mb-6">먼저 프로젝트를 생성하여 AI가 Phase를 설계하도록 하세요</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              프로젝트 생성하기
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
