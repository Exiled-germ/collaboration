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
        팀원들의 Loves(좋아하는 일)와 Hates(싫어하는 일)를 입력하세요.
      </p>
      
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
