import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import type { Phase, FeedItem } from "@/pages/Dashboard";

interface ArtifactUploadProps {
  phases: Record<string, Phase>;
  onUpload: (phaseId: string, content: string) => void;
  feedItems: FeedItem[];
  isAnalyzing: boolean;
}

const ArtifactUpload = ({ phases, onUpload, feedItems, isAnalyzing }: ArtifactUploadProps) => {
  const [selectedPhase, setSelectedPhase] = useState<string>("phase1");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(selectedPhase, content);
    setContent("");
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] h-[600px]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-success-accent" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">작업물 업로드</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <Select value={selectedPhase} onValueChange={setSelectedPhase}>
          <SelectTrigger>
            <SelectValue placeholder="Phase 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(phases).map((phase) => (
              <SelectItem key={phase.id} value={phase.id}>
                {phase.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="완료한 작업 내용을 요약하거나 기획서/리서치 결과를 붙여넣기하세요..."
          className="min-h-[120px] resize-none"
        />

        <Button
          type="submit"
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-success-accent to-primary hover:opacity-90 transition-opacity text-white"
        >
          {isAnalyzing ? "AI 분석 중..." : "🚀 작업물 업로드 및 AI 분석 요청"}
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Activity Feed</h3>
        {feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              아직 업로드된 작업물이 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedItems.map((item, index) => (
              <div
                key={index}
                className="bg-muted/30 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary">{item.phase}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-3">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ArtifactUpload;
