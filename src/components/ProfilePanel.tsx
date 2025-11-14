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
        <h2 className="text-xl font-semibold text-foreground">Team Member Profiles</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Enter your team member profiles. Include Email for AI invitations, plus Loves, Hates, Tools, and Career info.
      </p>
      
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs font-semibold text-foreground mb-2">Profile Structure Example:</p>
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          <div>* **Name (Role):**</div>
          <div className="ml-3">* **Email:** "their.email@example.com"</div>
          <div className="ml-3">* **Loves:** "What they love to do"</div>
          <div className="ml-3">* **Hates:** "What they hate to do"</div>
          <div className="ml-3">* **Tools:** "Tools they can use"</div>
          <div className="ml-3">* **Career:** "Experience and portfolio"</div>
        </div>
      </div>
      
      <Textarea
        value={profiles}
        onChange={(e) => setProfiles(e.target.value)}
        className="flex-1 font-mono text-sm resize-none border-input focus:ring-2 focus:ring-primary/20"
        placeholder='Example:
* **John Doe (Developer):**
    * **Email:** "ldw9710@yonsei.ac.kr"
    * **Loves:** "Building APIs"
    * **Hates:** "CSS debugging"
    * **Tools:** "React, Node.js"
    * **Career:** "5 years fullstack"'
      />
    </Card>
  );
};

export default ProfilePanel;
