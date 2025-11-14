import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectData } from "@/pages/Dashboard";

interface PhaseRefinePanelProps {
  currentProject: ProjectData;
  profiles: string;
  onApplyChanges: (refinedProject: ProjectData) => void;
  isRefining: boolean;
  setIsRefining: (value: boolean) => void;
}

const PhaseRefinePanel = ({
  currentProject,
  profiles,
  onApplyChanges,
  isRefining,
  setIsRefining,
}: PhaseRefinePanelProps) => {
  const [userRequest, setUserRequest] = useState("");
  const [previewProject, setPreviewProject] = useState<ProjectData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleRefine = async () => {
    if (!userRequest.trim()) {
      return;
    }

    setIsRefining(true);
    setShowPreview(false);

    try {
      const { data, error } = await supabase.functions.invoke('refine-phases', {
        body: {
          current_project: currentProject,
          profiles: profiles,
          user_request: userRequest,
        }
      });

      if (error) throw error;

      if (data?.refined_project) {
        setPreviewProject(data.refined_project);
        setShowPreview(true);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Phase 구조 개선 실패:", error);
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleApply = () => {
    if (previewProject) {
      onApplyChanges(previewProject);
      setUserRequest("");
      setShowPreview(false);
      setPreviewProject(null);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewProject(null);
  };

  return (
    <Card className="p-6 bg-card border-border shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Phase 구조 개선</h2>
      </div>

      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          현재 Phase 구조가 마음에 들지 않으신가요? AI에게 어떻게 수정하고 싶은지 설명해보세요.
        </AlertDescription>
      </Alert>

      {!showPreview ? (
        <div className="space-y-4">
          <Textarea
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            placeholder="예: Phase 3와 4를 합쳐주세요. 마케팅 단계를 더 세분화하고, 초기 테스트 Phase를 추가해주세요."
            className="min-h-[120px] resize-none"
          />

          <Button
            onClick={handleRefine}
            disabled={isRefining || !userRequest.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white"
          >
            {isRefining ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                AI가 Phase 구조 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                AI로 Phase 구조 개선하기
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              ✨ AI가 제안하는 새로운 구조
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                <p className="text-base text-foreground">{previewProject?.project_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Summary</p>
                <p className="text-base text-foreground">{previewProject?.project_summary}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Phase List</p>
                <div className="space-y-2">
                  {previewProject?.phases.map((phase, idx) => (
                    <div key={phase.id} className="bg-background/50 p-3 rounded-lg">
                      <p className="font-semibold text-foreground">
                        {idx + 1}. {phase.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                      <p className="text-xs text-primary mt-2">
                        Recommended: {phase.recommended.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleApply}
              className="flex-1 bg-success hover:bg-success/90 text-white"
            >
              ✅ Apply This Structure
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PhaseRefinePanel;
