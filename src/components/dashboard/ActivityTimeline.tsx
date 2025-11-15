import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  PlayCircle, 
  Sparkles,
  Mail,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

interface ActivityTimelineProps {
  projectId: string;
}

export function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity_timeline')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_timeline',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_timeline')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'phase_created':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'phase_started':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'phase_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'member_added':
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case 'artifact_uploaded':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'invite_sent':
        return <Mail className="w-4 h-4 text-pink-500" />;
      case 'phase_refined':
        return <RefreshCw className="w-4 h-4 text-cyan-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'phase_created':
        return 'bg-purple-100 text-purple-700';
      case 'phase_started':
        return 'bg-blue-100 text-blue-700';
      case 'phase_completed':
        return 'bg-green-100 text-green-700';
      case 'member_added':
        return 'bg-indigo-100 text-indigo-700';
      case 'artifact_uploaded':
        return 'bg-orange-100 text-orange-700';
      case 'invite_sent':
        return 'bg-pink-100 text-pink-700';
      case 'phase_refined':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            활동 타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          활동 타임라인
        </CardTitle>
        <CardDescription>
          프로젝트의 모든 활동을 실시간으로 추적합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 활동이 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {activity.description}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs flex-shrink-0 ${getActivityColor(activity.activity_type)}`}
                      >
                        {activity.activity_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs bg-muted/50 rounded p-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key}:</span>
                            <span className="text-muted-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Helper function to log activities
export async function logActivity(
  projectId: string,
  activityType: string,
  description: string,
  metadata?: any
) {
  try {
    const { error } = await supabase
      .from('activity_timeline')
      .insert({
        project_id: projectId,
        activity_type: activityType,
        description,
        metadata: metadata || {},
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
