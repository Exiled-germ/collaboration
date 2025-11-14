import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { Phase } from "@/pages/Dashboard";

interface ProjectPhasesProps {
  phases: Phase[];
  onPhaseClick: (phase: Phase) => void;
}

const ProjectPhases = ({ phases, onPhaseClick }: ProjectPhasesProps) => {
  const getInitials = (name: string) => {
    return name.split(" ")[0].charAt(0);
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
            onClick={() => onPhaseClick(phase)}
            className="bg-muted/30 border border-border rounded-lg p-4 hover:shadow-[var(--shadow-soft)] hover:border-primary/30 transition-all cursor-pointer group"
          >
            <h3 className="font-semibold text-foreground mb-3 pb-2 border-b border-primary/20 group-hover:text-primary transition-colors">
              {phase.name}
            </h3>
            
            <div className="space-y-3">
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
        ))}
      </div>
    </Card>
  );
};

export default ProjectPhases;
