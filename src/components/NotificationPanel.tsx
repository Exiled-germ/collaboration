import { Card } from "@/components/ui/card";
import { Bell, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  type: "recommendation" | "self" | "warning";
  target_user: string;
  message: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationPanel = ({ notifications, isLoading }: NotificationPanelProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "recommendation":
        return <Bell className="w-5 h-5 text-notification-accent" />;
      case "self":
        return <Lightbulb className="w-5 h-5 text-success-accent" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning-accent" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "recommendation":
        return "bg-notification border-notification-border";
      case "self":
        return "bg-success border-success-border";
      case "warning":
        return "bg-warning border-warning-border";
      default:
        return "bg-card border-border";
    }
  };

  return (
    <Card className="flex flex-col p-6 bg-card border-border shadow-[var(--shadow-medium)] mt-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">AI 자동 알림</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
            <p className="text-sm text-muted-foreground">AI가 분석 중입니다...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            작업 내용을 분석하면 알림이 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border-2 transition-all hover:shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-2 duration-300",
                getNotificationStyles(notification.type)
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-2">
                    @{notification.target_user}
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default NotificationPanel;
