import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, Circle, Clock } from "lucide-react";
import type { Phase } from "@/pages/Dashboard";

interface ProjectPhasesProps {
  phases: Phase[];
  onPhaseClick: (phase: Phase) => void;
  onPhaseComplete?: (phaseId: string) => void;
}

const ProjectPhases = ({ phases, onPhaseClick, onPhaseComplete }: ProjectPhasesProps) => {
  const getInitials = (name: string) => {
    return name.split(" ")[0].charAt(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success/50 bg-success/5';
      case 'in-progress':
        return 'border-warning/50 bg-warning/5';
      default:
        return 'border-border bg-muted/30';
    }
  };

  return (
    <Card className="p-6 bg-card border-border shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Project Phase Status</h2>
          <p className="text-xs text-muted-foreground">Click any phase to view detailed activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`border rounded-lg p-4 hover:shadow-[var(--shadow-soft)] hover:border-primary/30 transition-all group ${getStatusColor(phase.status)}`}
          >
            <div 
              onClick={() => onPhaseClick(phase)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/20">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                  {phase.name}
                </h3>
                {getStatusIcon(phase.status)}
              </div>
              
              <div className="space-y-3">
                {phase.milestone && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Milestone:</p>
                    <p className="text-xs text-foreground">{phase.milestone}</p>
                  </div>
                )}

                {phase.deadline && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Deadline:</p>
                    <p className="text-xs text-foreground">{phase.deadline}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">AI Recommended:</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.recommended.map((name) => (
                      <div
                        key={name}
                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary"
                        title={name}
                      >
                        {getInitials(name)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Active:</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.active.length > 0 ? (
                      phase.active.map((name) => (
                        <div
                          key={name}
                          className="w-8 h-8 rounded-full bg-success/20 border-2 border-success-accent flex items-center justify-center text-xs font-bold text-success-accent"
                          title={name}
                        >
                          {getInitials(name)}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Waiting</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {phase.status !== 'completed' && onPhaseComplete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onPhaseComplete(phase.id);
                }}
                size="sm"
                className="w-full mt-3"
                variant={phase.status === 'in-progress' ? 'default' : 'outline'}
              >
                {phase.status === 'in-progress' ? '✓ Complete Phase' : 'Start Phase'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProjectPhases;
