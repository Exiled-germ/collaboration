import { Card } from "@/components/ui/card";
import { Bell, UserPlus } from "lucide-react";
import type { AIInvite } from "@/pages/Dashboard";

interface AIInvitesProps {
  invites: AIInvite[];
  isAnalyzing: boolean;
}

const AIInvites = ({ invites, isAnalyzing }: AIInvitesProps) => {
  return (
    <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] h-[600px]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-notification/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-notification-accent" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">AI Auto Invites</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
              <p className="text-sm text-muted-foreground">AI is analyzing work and finding the best collaborators...</p>
            </div>
          </div>
        ) : invites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <UserPlus className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Upload work artifacts to see AI invite notifications here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite, index) => (
              <div
                key={index}
                className="bg-notification border-2 border-notification-border rounded-lg p-4 hover:shadow-[var(--shadow-soft)] transition-all animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-notification-accent/10 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-5 h-5 text-notification-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-2">
                      {invite.invite_message}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {invite.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIInvites;
