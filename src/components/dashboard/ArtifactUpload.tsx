import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseFile, getFileSizeDisplay } from "@/utils/fileParser";
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newFiles = Array.from(files);
    
    try {
      // 파일 파싱
      let parsedContent = content;
      for (const file of newFiles) {
        toast({
          title: "파일 처리 중",
          description: `${file.name} 분석 중...`,
        });
        
        const fileContent = await parseFile(file);
        parsedContent += `\n\n--- ${file.name} ---\n${fileContent}\n`;
      }
      
      setContent(parsedContent);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      toast({
        title: "파일 업로드 완료",
        description: `${newFiles.length}개의 파일이 분석되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "파일 처리 실패",
        description: error instanceof Error ? error.message : "파일을 처리할 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(selectedPhase, content);
    setContent("");
    setUploadedFiles([]);
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

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".docx,.pptx,.zip,.txt,.md"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <File className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              DOCX, PPTX, ZIP, TXT 파일 첨부 (여러 개 선택 가능)
            </span>
          </label>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({getFileSizeDisplay(file.size)})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="완료한 작업 내용을 요약하거나, 위에서 파일을 첨부하세요..."
          className="min-h-[120px] resize-none"
        />

        <Button
          type="submit"
          disabled={isAnalyzing || isProcessing}
          className="w-full bg-gradient-to-r from-success-accent to-primary hover:opacity-90 transition-opacity text-white"
        >
          {isProcessing ? "파일 처리 중..." : isAnalyzing ? "AI 분석 중..." : "🚀 작업물 업로드 및 AI 분석 요청"}
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
