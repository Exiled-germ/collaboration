import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, UserPlus, Clock, Users } from "lucide-react";
import type { Phase, FeedItem, AIInvite } from "@/pages/Dashboard";

interface PhaseDetailDialogProps {
  phase: Phase | null;
  isOpen: boolean;
  onClose: () => void;
  feedItems: FeedItem[];
  invites: AIInvite[];
}

const PhaseDetailDialog = ({ phase, isOpen, onClose, feedItems, invites }: PhaseDetailDialogProps) => {
  if (!phase) return null;

  // Filter data for this specific phase
  const phaseFeedItems = feedItems.filter(item => item.phase === phase.name);
  const phaseInvites = invites.filter(invite => {
    // Match invites by checking if target user is in recommended or active
    return phase.recommended.some(name => invite.target_user.includes(name)) ||
           phase.active.some(name => invite.target_user.includes(name));
  });

  // Combine and sort all events by timestamp
  const allEvents = [
    ...phaseFeedItems.map(item => ({
      type: 'artifact' as const,
      timestamp: item.timestamp,
      content: item.content,
      phase: item.phase,
    })),
    ...phaseInvites.map(invite => ({
      type: 'invite' as const,
      timestamp: new Date(), // Invites don't have timestamps, use current
      target: invite.target_user,
      message: invite.invite_message,
      reason: invite.reason,
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(" ")[0].charAt(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            {phase.name}
          </DialogTitle>
          {phase.description && (
            <p className="text-sm text-muted-foreground mt-2">{phase.description}</p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Team Members Summary */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Team Members</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Active ({phase.active.length})</p>
                <div className="flex flex-wrap gap-2">
                  {phase.active.length > 0 ? (
                    phase.active.map((name) => (
                      <Badge key={name} variant="default" className="bg-success/20 text-success-accent border-success-accent">
                        {getInitials(name)} {name.split(' ')[0]}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No active members</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Recommended ({phase.recommended.length})</p>
                <div className="flex flex-wrap gap-2">
                  {phase.recommended.map((name) => (
                    <Badge key={name} variant="outline" className="border-primary/20">
                      {getInitials(name)} {name.split(' ')[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Activity Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Artifacts Uploaded</span>
                <Badge variant="secondary">{phaseFeedItems.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">AI Invites Sent</span>
                <Badge variant="secondary">{phaseInvites.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Events</span>
                <Badge variant="secondary">{allEvents.length}</Badge>
              </div>
            </div>
          </div>

          {/* Phase Status */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Phase Status</h3>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Status:</span>
                <Badge 
                  variant={phase.active.length > 0 ? "default" : "secondary"} 
                  className="ml-2"
                >
                  {phase.active.length > 0 ? "Active" : "Pending"}
                </Badge>
              </div>
              {phaseFeedItems.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Last Activity:</span>
                  <p className="text-xs font-medium mt-1">
                    {formatTimestamp(phaseFeedItems[0].timestamp)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="mt-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity Timeline
          </h3>

          <ScrollArea className="h-[400px] pr-4">
            {allEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No activity yet in this phase
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload work artifacts to see timeline
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allEvents.map((event, index) => (
                  <div
                    key={index}
                    className="relative pl-8 pb-8 border-l-2 border-border last:border-l-0 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      {event.type === 'artifact' ? (
                        <FileText className="w-2 h-2 text-primary" />
                      ) : (
                        <UserPlus className="w-2 h-2 text-primary" />
                      )}
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-[var(--shadow-soft)] transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {event.type === 'artifact' ? (
                            <FileText className="w-4 h-4 text-success-accent" />
                          ) : (
                            <UserPlus className="w-4 h-4 text-notification-accent" />
                          )}
                          <span className="font-semibold text-sm text-foreground">
                            {event.type === 'artifact' ? 'Work Artifact Uploaded' : 'AI Invite Sent'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>

                      {event.type === 'artifact' ? (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {event.content}
                        </p>
                      ) : (
                        <div className="space-y-2 mt-2">
                          <p className="text-sm font-medium text-foreground">
                            To: {event.target}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.message}
                          </p>
                          <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 mt-2">
                            {event.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseDetailDialog;
