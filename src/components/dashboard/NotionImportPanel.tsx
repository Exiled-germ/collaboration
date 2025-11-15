import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Database, ExternalLink } from 'lucide-react';
import { getNotionService, NotionPageContent, NotionService } from '@/lib/notionService';
import { toast } from 'sonner';

interface NotionImportPanelProps {
  onImport: (content: NotionPageContent | NotionPageContent[]) => void;
}

export function NotionImportPanel({ onImport }: NotionImportPanelProps) {
  const [notionApiKey, setNotionApiKey] = useState('');
  const [notionUrl, setNotionUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState<'page' | 'database'>('page');

  const handleImport = async () => {
    if (!notionApiKey) {
      toast.error('Notion API 키를 입력해주세요');
      return;
    }

    if (!notionUrl) {
      toast.error('Notion URL을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      const notionService = getNotionService(notionApiKey);
      
      // Extract page/database ID from URL
      const pageId = NotionService.extractPageIdFromUrl(notionUrl);
      
      if (!pageId) {
        throw new Error('유효하지 않은 Notion URL입니다');
      }

      let content: NotionPageContent | NotionPageContent[];

      if (importType === 'page') {
        content = await notionService.getPage(pageId);
        toast.success(`페이지 "${content.title}" 가져오기 완료!`);
      } else {
        content = await notionService.getDatabase(pageId);
        toast.success(`데이터베이스에서 ${content.length}개 페이지 가져오기 완료!`);
      }

      onImport(content);
      
      // Clear form
      setNotionUrl('');
    } catch (error) {
      console.error('Notion import error:', error);
      toast.error(error instanceof Error ? error.message : 'Notion 가져오기 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notion 통합
        </CardTitle>
        <CardDescription>
          Notion 페이지나 데이터베이스에서 프로젝트 정보를 가져오세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notion-api-key">Notion API Key</Label>
          <Input
            id="notion-api-key"
            type="password"
            placeholder="secret_..."
            value={notionApiKey}
            onChange={(e) => setNotionApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            <a 
              href="https://www.notion.so/my-integrations" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Notion Integration 생성하기
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label>가져올 타입</Label>
          <div className="flex gap-2">
            <Button
              variant={importType === 'page' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImportType('page')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              페이지
            </Button>
            <Button
              variant={importType === 'database' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImportType('database')}
              className="flex-1"
            >
              <Database className="w-4 h-4 mr-2" />
              데이터베이스
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notion-url">Notion URL</Label>
          <Input
            id="notion-url"
            type="url"
            placeholder="https://www.notion.so/..."
            value={notionUrl}
            onChange={(e) => setNotionUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {importType === 'page' 
              ? '가져올 Notion 페이지의 URL을 입력하세요'
              : '가져올 Notion 데이터베이스의 URL을 입력하세요'
            }
          </p>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={isLoading || !notionApiKey || !notionUrl}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              가져오는 중...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Notion에서 가져오기
            </>
          )}
        </Button>

        <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
          <p className="font-semibold">💡 사용 방법:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Notion에서 Integration을 생성하고 API 키를 받으세요</li>
            <li>가져올 페이지/데이터베이스에 Integration을 연결하세요</li>
            <li>페이지 URL을 복사하여 위에 붙여넣으세요</li>
            <li>"가져오기" 버튼을 클릭하세요</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
