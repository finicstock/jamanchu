/**
 * Notifications - 알림 페이지
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  FileText,
  Users,
  Info,
  CheckCheck,
  Loader2,
} from "lucide-react";
import LoginModal from "@/components/LoginModal";

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  match_found: { icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  report_ready: { icon: FileText, color: "text-green-500", bg: "bg-green-50" },
  heart_received: { icon: Heart, color: "text-[#E8725C]", bg: "bg-[#FDE8E4]" },
  chat_request: { icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50" },
  system: { icon: Info, color: "text-gray-500", bg: "bg-gray-100" },
};

export default function Notifications() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: notifications, refetch } = trpc.notification.getMyNotifications.useQuery(undefined, { enabled: isAuthenticated });
  const markAllRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => setLocation("/")}
          message="알림을 확인하려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E8725C]" size={32} />
      </div>
    );
  }

  const unreadCount = notifications?.filter((n) => n.isRead === 0).length ?? 0;

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-bold text-gray-900">알림</h1>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8725C] text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-[#7BA68C] font-medium flex items-center gap-1 hover:underline"
            >
              <CheckCheck size={14} />
              모두 읽음
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type] ?? typeConfig.system;
              const IconComp = config.icon;
              const isUnread = notification.isRead === 0;

              return (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (isUnread) markRead.mutate({ id: notification.id });
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    isUnread
                      ? "bg-white border-[#E8725C]/20 shadow-sm"
                      : "bg-white/60 border-gray-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`h-9 w-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <IconComp size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${isUnread ? "text-gray-900" : "text-gray-600"}`}>
                          {notification.title}
                        </p>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-[#E8725C] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">아직 알림이 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">매칭이나 리포트가 완성되면 알림을 보내드립니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
