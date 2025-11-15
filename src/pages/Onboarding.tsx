import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Building2, Users, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { DatabaseSetupGuide } from "@/components/DatabaseSetupGuide";
import type { TeamMember } from "@/types";

const Onboarding = () => {
  const [showNicknameInput, setShowNicknameInput] = useState(true);
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState(1);
  const [companyDescription, setCompanyDescription] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState<Partial<TeamMember>[]>([
    { name: "", role: "", email: "", loves: [], hates: [], tools: [], career: "" }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast({
        title: "닉네임 필요",
        description: "팀 닉네임을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // Store nickname in sessionStorage
    sessionStorage.setItem('phaseflow_nickname', nickname);
    
    // Check if this nickname has an existing project
    try {
      const { getOrCreateSession, getSessionProject } = await import('@/lib/sessionService');
      const session = await getOrCreateSession(nickname);
      sessionStorage.setItem('phaseflow_session_id', session.id);
      
      if (session.current_project_id) {
        const existingProject = await getSessionProject(session.id);
        if (existingProject) {
          // Existing project found, go to dashboard
          sessionStorage.setItem('phaseflow_project', JSON.stringify(existingProject));
          sessionStorage.setItem('phaseflow_project_id', existingProject.id);
          
          toast({
            title: "프로젝트 로드 완료",
            description: `${nickname} 팀의 프로젝트를 불러왔습니다.`,
          });
          
          navigate('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
    
    // No existing project, continue with onboarding
    setShowNicknameInput(false);
    
    toast({
      title: "환영합니다!",
      description: `${nickname} 팀으로 시작합니다.`,
    });
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { 
      name: "", role: "", email: "", loves: [], hates: [], tools: [], career: "" 
    }]);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: any) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleNext = () => {
    if (step === 1 && !companyDescription.trim()) {
      toast({
        title: "입력 필요",
        description: "회사/조직 소개를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !projectDescription.trim()) {
      toast({
        title: "입력 필요",
        description: "프로젝트 설명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3) {
      const invalidMembers = teamMembers.filter(m => 
        !m.name?.trim() || !m.role?.trim() || !m.email?.trim()
      );
      if (invalidMembers.length > 0) {
        toast({
          title: "입력 필요",
          description: "모든 팀원의 이름, 역할, 이메일을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      handleAnalyze();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      // Skip authentication - use demo mode
      const demoUserId = 'demo-user-' + Date.now();

      // Save team members to database
      const membersToSave = teamMembers.map(m => {
        const processField = (field: string[] | string | undefined): string[] => {
          if (!field) return [];
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') return field.split(',').map((s: string) => s.trim()).filter(Boolean);
          return [];
        };

        return {
          user_id: demoUserId,
          name: m.name!,
          role: m.role!,
          email: m.email!,
          loves: processField(m.loves),
          hates: processField(m.hates),
          tools: processField(m.tools),
          career: m.career || "",
        };
      });

      // Skip database save in demo mode
      console.log('Demo mode: Skipping database save');
      console.log('Team members:', membersToSave);

      // Format profiles for AI
      const formatField = (field: string[] | string | undefined): string => {
        if (!field) return '';
        if (Array.isArray(field)) return field.join(', ');
        return String(field);
      };

      const profilesText = teamMembers.map(m => `
* **${m.name} (${m.role}):**
    * **Loves:** "${formatField(m.loves)}"
    * **Hates:** "${formatField(m.hates)}"
    * **Tools:** "${formatField(m.tools)}"
    * **Email:** "${m.email}"
    * **Career:** "${m.career}"`).join('\n\n');

      // Store in sessionStorage for now (will be replaced with Gemini API call)
      sessionStorage.setItem('phaseflow_company', companyDescription);
      sessionStorage.setItem('phaseflow_project', projectDescription);
      sessionStorage.setItem('phaseflow_profiles', profilesText);
      sessionStorage.setItem('phaseflow_team_members', JSON.stringify(teamMembers));

      toast({
        title: "온보딩 완료!",
        description: "프로젝트 분석 페이지로 이동합니다...",
      });

      // Navigate to Index page to analyze project
      navigate('/');
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "온보딩 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Show database setup guide if needed
  if (showDatabaseSetup) {
    return <DatabaseSetupGuide />;
  }

  // Show nickname input first
  if (showNicknameInput) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              PhaseFlow v2.0
            </h1>
            <p className="text-muted-foreground text-center">
              팀 닉네임으로 작업을 시작하고 이어서 진행하세요
            </p>
          </div>

          <form onSubmit={handleNicknameSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">팀 닉네임</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 스타트업팀, 개발팀A, 프로젝트X"
                className="text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                같은 닉네임으로 로그인하면 이전 작업을 이어서 할 수 있습니다
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              size="lg"
            >
              시작하기
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PhaseFlow v2.0
            </h1>
          </div>
          <p className="text-muted-foreground">프로젝트 시작을 위한 정보를 입력해주세요</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Company Description */}
        {step === 1 && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">회사/조직 소개</h2>
                <p className="text-sm text-muted-foreground">어떤 회사/조직에서 일하고 계신가요?</p>
              </div>
            </div>
            
            <Textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="예시:
우리는 AI 기반 협업 도구를 만드는 스타트업입니다.
팀 규모는 10명이며, 제품/개발/디자인 팀으로 구성되어 있습니다.
현재 시리즈 A 투자를 받았으며, 빠르게 성장하고 있습니다..."
            />
          </Card>
        )}

        {/* Step 2: Project Description */}
        {step === 2 && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">프로젝트 설명</h2>
                <p className="text-sm text-muted-foreground">어떤 프로젝트를 진행하시나요?</p>
              </div>
            </div>
            
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="예시:
[프로젝트명] AI 협업 대시보드

[설명] PM을 위한 AI 기반 프로젝트 관리 도구
- 팀원 프로필 기반 자동 업무 배정
- Phase별 진행 상황 추적
- AI가 다음 협업자 추천

[목표]
- 3개월 내 베타 출시
- 100개 팀 온보딩
- 협업 효율성 30% 향상"
            />
          </Card>
        )}

        {/* Step 3: Team Members */}
        {step === 3 && (
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">팀원 프로필</h2>
                  <p className="text-sm text-muted-foreground">팀원들의 상세 정보를 입력해주세요</p>
                </div>
              </div>
              <Button onClick={addTeamMember} variant="outline" size="sm">
                + 팀원 추가
              </Button>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {teamMembers.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">팀원 {index + 1}</h3>
                    {teamMembers.length > 1 && (
                      <Button
                        onClick={() => removeTeamMember(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        삭제
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">이름 *</label>
                      <Input
                        value={member.name || ""}
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">역할 *</label>
                      <Input
                        value={member.role || ""}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        placeholder="Frontend Developer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">이메일 *</label>
                    <Input
                      type="email"
                      value={member.email || ""}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      placeholder="hong@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">선호 업무 (Loves)</label>
                    <Input
                      value={Array.isArray(member.loves) ? member.loves.join(', ') : member.loves || ""}
                      onChange={(e) => updateTeamMember(index, 'loves', e.target.value)}
                      placeholder="UI 개발, 애니메이션, 성능 최적화"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">비선호 업무 (Hates)</label>
                    <Input
                      value={Array.isArray(member.hates) ? member.hates.join(', ') : member.hates || ""}
                      onChange={(e) => updateTeamMember(index, 'hates', e.target.value)}
                      placeholder="백엔드 작업, 인프라 관리"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">사용 툴 (Tools)</label>
                    <Input
                      value={Array.isArray(member.tools) ? member.tools.join(', ') : member.tools || ""}
                      onChange={(e) => updateTeamMember(index, 'tools', e.target.value)}
                      placeholder="React, TypeScript, Figma"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">경력 (Career)</label>
                    <Textarea
                      value={member.career || ""}
                      onChange={(e) => updateTeamMember(index, 'career', e.target.value)}
                      placeholder="5년차 프론트엔드 개발자. 3개 스타트업 경험..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={step === 1 || isAnalyzing}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            이전
          </Button>

          <Button
            onClick={handleNext}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                분석 중...
              </>
            ) : step === totalSteps ? (
              <>
                <Sparkles className="w-4 h-4" />
                프로젝트 생성
              </>
            ) : (
              <>
                다음
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
