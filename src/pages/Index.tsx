import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Users, LogOut } from "lucide-react";
import { analyzeProject } from "@/lib/gemini";
import { getOrCreateSession, saveProjectToSession, getSessionProject } from "@/lib/sessionService";

const Index = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [profiles, setProfiles] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  useEffect(() => {
    const initializeSession = async () => {
      // Check if user has nickname
      const nickname = sessionStorage.getItem('phaseflow_nickname');
      
      if (!nickname) {
        // No nickname, redirect to onboarding
        navigate('/onboarding');
        return;
      }

      try {
        // Get or create session
        const session = await getOrCreateSession(nickname);
        sessionStorage.setItem('phaseflow_session_id', session.id);

        // Check if session has existing project
        if (session.current_project_id) {
          const existingProject = await getSessionProject(session.id);
          if (existingProject) {
            // Load existing project
            sessionStorage.setItem('phaseflow_project', JSON.stringify(existingProject));
            sessionStorage.setItem('phaseflow_project_id', existingProject.id);
            
            toast({
              title: "이전 작업 불러오기",
              description: `${nickname} 팀의 프로젝트를 불러왔습니다.`,
            });
            
            // Navigate to dashboard
            navigate('/dashboard');
            return;
          }
        }

        // No existing project found
        console.log('📭 No existing project for this session');
        
        // Check if user has completed onboarding
        const hasOnboarded = sessionStorage.getItem('phaseflow_profiles');
        
        if (!hasOnboarded) {
          console.log('🔄 Redirecting to onboarding...');
          // User hasn't completed onboarding, redirect
          navigate('/onboarding');
          return;
        }
        
        console.log('✅ Onboarding data found, staying on Index');
        
        // Load saved data from sessionStorage
        const savedProfiles = sessionStorage.getItem('phaseflow_profiles');
        const savedProject = sessionStorage.getItem('phaseflow_project');
        
        if (savedProfiles) {
          setProfiles(savedProfiles);
        }
        if (savedProject) {
          setProjectDescription(savedProject);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        toast({
          title: "세션 오류",
          description: "세션을 초기화하는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };

    initializeSession();
  }, [navigate, toast]);

  const handleAnalyze = async () => {
    if (!projectDescription.trim() || !profiles.trim()) {
      toast({
        title: "Input required",
        description: "Please enter both project description and team profiles.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const sessionId = sessionStorage.getItem('phaseflow_session_id');
      const nickname = sessionStorage.getItem('phaseflow_nickname');

      if (!sessionId || !nickname) {
        throw new Error('세션 정보가 없습니다. 다시 로그인해주세요.');
      }

      // Call Gemini API
      const projectData = await analyzeProject(projectDescription, profiles);

      // Add default status to phases
      const phasesWithStatus = projectData.phases.map((phase: any, index: number) => ({
        ...phase,
        status: index === 0 ? 'in-progress' : 'pending',
      }));

      projectData.phases = phasesWithStatus;

      // Save to database
      const teamMembersData = JSON.parse(sessionStorage.getItem('phaseflow_team_members') || '[]');
      const savedProject = await saveProjectToSession(sessionId, projectData, teamMembersData);

      // Store project data in sessionStorage for Dashboard to use
      sessionStorage.setItem('phaseflow_project', JSON.stringify(projectData));
      sessionStorage.setItem('phaseflow_project_id', savedProject.id);
      sessionStorage.setItem('phaseflow_profiles', profiles);
      
      toast({
        title: "프로젝트 분석 완료!",
        description: `${projectData.phases?.length || 0}개의 Phase가 생성되었습니다.`,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error analyzing project:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
                <p className="text-muted-foreground">AI-Powered Project Phase Designer</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Description */}
          <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] min-h-[600px]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">프로젝트 설명</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              프로젝트의 목표, 타겟 유저, 핵심 기능을 상세히 설명해주세요.
            </p>
            
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm resize-none border-input focus:ring-2 focus:ring-primary/20"
              placeholder="프로젝트를 설명해주세요..."
            />
          </Card>

          {/* Team Profiles */}
          <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] min-h-[600px]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">팀원 프로필</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              팀원들의 Loves, Hates, Tools, Career 정보를 입력하세요.
            </p>
            
            <Textarea
              value={profiles}
              onChange={(e) => setProfiles(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm resize-none border-input focus:ring-2 focus:ring-accent/20"
              placeholder="팀원 프로필을 입력하세요..."
            />
          </Card>
        </div>

        {/* Analyze Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white font-semibold px-12 py-6 text-lg shadow-[var(--shadow-medium)]"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
                AI가 프로젝트 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                프로젝트 분석 & Dashboard 생성
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            AI가 프로젝트를 분석하여 Phase 구조를 설계하고 최적의 팀원을 자동 배치합니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
