/**
 * Dashboard - AI 클론 활동 대시보드
 * Design: Warm Afternoon Conversation - 건실한 만남
 * 실제 tRPC 데이터 연동
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import {
  Activity,
  MessageSquare,
  Heart,
  Sparkles,
  Search,
  Play,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import LoginModal from "@/components/LoginModal";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: clone } = trpc.clone.getMyClone.useQuery(undefined, { enabled: isAuthenticated });
  const { data: chats, refetch: refetchChats } = trpc.clone.getMyChats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: reports, refetch: refetchReports } = trpc.clone.getMyReports.useQuery(undefined, { enabled: isAuthenticated });
  const { data: profile } = trpc.profile.getMyProfile.useQuery(undefined, { enabled: isAuthenticated });

  const startChatMutation = trpc.clone.startChat.useMutation({
    onSuccess: () => {
      refetchChats();
      refetchReports();
      setIsSimulating(false);
    },
    onError: () => {
      setIsSimulating(false);
    },
  });

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => setLocation("/")}
          message="대시보드를 이용하려면 로그인이 필요합니다. 간편하게 가입하고 AI 클론의 활동을 확인해보세요."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-warm-coral" size={32} />
      </div>
    );
  }

  const handleStartChat = () => {
    setIsSimulating(true);
    startChatMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">자만추</h1>
              <p className="text-xs text-muted-foreground">AI 클론 대시보드</p>
            </div>
            {profile && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-coral-light rounded-full">
                <Heart size={12} className="text-warm-coral" />
                <span className="text-xs font-bold text-warm-coral">{profile.hearts.balance}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container py-5 space-y-5">
        {/* Clone Status */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="warm-card p-6 space-y-4"
        >
          {clone ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7BA68C] to-[#A8D5BA] flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{clone.nickname}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      clone.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {clone.status === "active" ? "활동 중" : "비활성"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{clone.age}세 · 매칭 대기 중</p>
                </div>
              </div>
              <Button
                onClick={handleStartChat}
                disabled={isSimulating}
                className="w-full bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full"
              >
                {isSimulating ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    AI 대화 시뮬레이션 중... (약 30초 소요)
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    새로운 매칭 시작하기
                  </>
                )}
              </Button>
              {startChatMutation.error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {startChatMutation.error.message}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-coral-light mx-auto">
                <Activity size={24} className="text-warm-coral" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">아직 AI 클론이 없어요</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  나의 성격과 가치관을 학습한 AI 클론을 만들어보세요.
                  <br />
                  클론이 자동으로 대화하고 맞는 사람을 찾아줍니다.
                </p>
              </div>
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full px-6"
              >
                <Sparkles size={16} className="mr-2" />
                클론 만들기
              </Button>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="grid grid-cols-3 gap-3"
        >
          <div className="warm-card p-4 text-center">
            <MessageSquare size={18} className="mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold text-foreground">{chats?.length ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">대화</p>
          </div>
          <div className="warm-card p-4 text-center">
            <FileText size={18} className="mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold text-foreground">{reports?.length ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">리포트</p>
          </div>
          <div className="warm-card p-4 text-center">
            <Heart size={18} className="mx-auto text-warm-coral mb-1" />
            <p className="text-lg font-bold text-foreground">{profile?.hearts.balance ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">하트</p>
          </div>
        </motion.div>

        {/* Recent Chats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="warm-card p-5 space-y-3"
        >
          <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
            <MessageSquare size={14} className="text-blue-500" /> 최근 대화
          </h2>

          {chats && chats.length > 0 ? (
            <div className="space-y-2">
              {chats.slice(0, 5).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setLocation("/chat-log")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sage-light/50 transition text-left"
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    chat.status === "completed" ? "bg-green-50" : "bg-blue-50"
                  }`}>
                    {chat.status === "completed" ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Clock size={16} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{chat.partnerNickname}</p>
                    <p className="text-xs text-muted-foreground">{chat.totalMessages}개 메시지 · {chat.status === "completed" ? "완료" : "진행 중"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Search size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-muted-foreground">아직 대화 기록이 없습니다.</p>
              <p className="text-[10px] text-muted-foreground mt-1">위에서 '새로운 매칭 시작하기'를 눌러보세요!</p>
            </div>
          )}
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="warm-card p-5 space-y-3"
        >
          <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileText size={14} className="text-green-500" /> 최근 리포트
          </h2>

          {reports && reports.length > 0 ? (
            <div className="space-y-2">
              {reports.slice(0, 5).map((report) => (
                <button
                  key={report.id}
                  onClick={() => setLocation("/report")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sage-light/50 transition text-left"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#E8725C] to-[#FF9A76] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{report.overallScore}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{report.partnerNickname}님과의 케미</p>
                    <p className="text-xs text-muted-foreground">호환성 {report.overallScore}점</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-muted-foreground">아직 리포트가 없습니다.</p>
              <p className="text-[10px] text-muted-foreground mt-1">대화가 완료되면 자동으로 리포트가 생성됩니다.</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={() => setLocation("/chat-log")}
            variant="outline"
            className="h-14 rounded-xl border-border bg-white text-foreground font-medium hover:bg-sage-light hover:text-sage hover:border-sage/30 transition-all"
          >
            <MessageSquare size={16} className="mr-2" />
            채팅 로그
          </Button>
          <Button
            onClick={() => setLocation("/pricing")}
            variant="outline"
            className="h-14 rounded-xl border-border bg-white text-foreground font-medium hover:bg-warm-coral-light hover:text-warm-coral hover:border-warm-coral/30 transition-all"
          >
            <Heart size={16} className="mr-2" />
            하트 충전
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
