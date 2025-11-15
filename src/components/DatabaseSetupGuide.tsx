import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DatabaseSetupGuide() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- PhaseFlow v2.0 Database Schema
-- Copy and paste this into Supabase SQL Editor

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  loves TEXT[] DEFAULT '{}',
  hates TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  career TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_summary TEXT,
  company_description TEXT,
  phases JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own team members"
  ON team_members FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    toast.success("SQL 스크립트가 클립보드에 복사되었습니다!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">데이터베이스 설정 필요</CardTitle>
              <CardDescription>
                Supabase 데이터베이스에 테이블을 생성해야 합니다
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle>⚠️ 오류 발생</AlertTitle>
            <AlertDescription>
              "Could not find the table 'public.team_members'" 오류가 발생했습니다.
              <br />
              아래 단계를 따라 데이터베이스를 설정해주세요.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Supabase Dashboard 열기</h3>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  <span>Supabase Dashboard 열기</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">SQL Editor로 이동</h3>
                <p className="text-sm text-muted-foreground">
                  왼쪽 메뉴에서 "SQL Editor"를 클릭하세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">SQL 스크립트 복사 및 실행</h3>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    {sqlScript}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        복사됨!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        복사
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  위 SQL을 복사하여 Supabase SQL Editor에 붙여넣고 "Run" 버튼을 클릭하세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">페이지 새로고침</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  SQL 실행 후 이 페이지를 새로고침하세요
                </p>
                <Button
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  페이지 새로고침
                </Button>
              </div>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertTitle>💡 도움말</AlertTitle>
            <AlertDescription>
              더 자세한 설정 가이드는{" "}
              <a
                href="/QUICK_SETUP_DB.md"
                target="_blank"
                className="text-primary hover:underline font-medium"
              >
                QUICK_SETUP_DB.md
              </a>
              를 참고하세요.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
