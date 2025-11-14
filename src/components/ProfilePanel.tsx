import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ProfilePanelProps {
  profiles: string;
  setProfiles: (profiles: string) => void;
}

const ProfilePanel = ({ profiles, setProfiles }: ProfilePanelProps) => {
  return (
    <Card className="flex flex-col h-full p-6 bg-card border-border shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">팀원 프로필 DB</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        팀원들의 프로필을 입력하세요. Loves, Hates, Tools, Career 정보를 포함하면 더 정확한 추천을 받을 수 있습니다.
      </p>
      
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs font-semibold text-foreground mb-2">프로필 구조 예시:</p>
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          <div>* **이름 (역할):**</div>
          <div className="ml-3">* **Loves:** "좋아하는 일"</div>
          <div className="ml-3">* **Hates:** "싫어하는 일"</div>
          <div className="ml-3">* **Tools:** "사용 가능한 도구"</div>
          <div className="ml-3">* **Career:** "경력과 작업물"</div>
        </div>
      </div>
      
      <Textarea
        value={profiles}
        onChange={(e) => setProfiles(e.target.value)}
        className="flex-1 font-mono text-sm resize-none border-input focus:ring-2 focus:ring-primary/20"
        placeholder="팀원 프로필을 입력하세요..."
      />
    </Card>
  );
};

export default ProfilePanel;
