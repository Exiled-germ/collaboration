import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileEdit, Sparkles } from "lucide-react";

interface WorkCanvasProps {
  workContent: string;
  setWorkContent: (content: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const WorkCanvas = ({ workContent, setWorkContent, onAnalyze, isLoading }: WorkCanvasProps) => {
  return (
    <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <FileEdit className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Real-time Work Canvas</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Enter your current work. AI will recommend the best collaborators.
      </p>
      
      <Textarea
        value={workContent}
        onChange={(e) => setWorkContent(e.target.value)}
        className="flex-1 min-h-[200px] font-mono text-sm resize-none border-input focus:ring-2 focus:ring-accent/20 mb-4"
        placeholder="Enter your work in progress..."
      />
      
      <Button 
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white font-semibold py-6 text-base shadow-[var(--shadow-soft)]"
      >
        {isLoading ? (
          <>
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            PhaseFlow: Analyze Collaboration!
          </>
        )}
      </Button>
    </Card>
  );
};

export default WorkCanvas;
