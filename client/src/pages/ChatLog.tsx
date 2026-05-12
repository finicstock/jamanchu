/**
 * ChatLog - AI 클론 간 채팅 로그
 * 목록 뷰 + 상세 뷰 (동적 라우팅)
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { motion, AnimatePresence } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import {
  MessageSquare,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import LoginModal from "@/components/LoginModal";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";

// ─── 채팅 목록 뷰 ───
function ChatListView() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { data: chats, isLoading } = trpc.clone.getMyChats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => setLocation("/")}
          message="대화 로그를 확인하려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-warm-coral" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-foreground">대화 로그</h1>
              <p className="text-[11px] text-muted-foreground">
                AI 클론 간의 대화 기록
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {chats?.length ?? 0}개의 대화
            </span>
          </div>
        </div>
      </header>

      <div className="container py-5">
        {chats && chats.length > 0 ? (
          <div className="space-y-3">
            {chats.map((chat, i) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => setLocation(`/chat-log/${chat.id}`)}
                className="w-full warm-card p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                      chat.status === "completed"
                        ? "bg-gradient-to-br from-[#7BA68C] to-[#A8D5BA]"
                        : "bg-gradient-to-br from-blue-400 to-blue-300"
                    }`}
                  >
                    <span className="text-white text-sm font-bold">
                      {chat.partnerNickname.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {chat.partnerNickname}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          chat.status === "completed"
                            ? "bg-green-50 text-green-600"
                            : chat.status === "failed"
                              ? "bg-red-50 text-red-500"
                              : "bg-blue-50 text-blue-500"
                        }`}
                      >
                        {chat.status === "completed"
                          ? "완료"
                          : chat.status === "failed"
                            ? "실패"
                            : "진행 중"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {chat.totalMessages}개 메시지 ·{" "}
                      {chat.createdAt
                        ? new Date(chat.createdAt).toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  <ChevronLeft
                    size={16}
                    className="text-muted-foreground rotate-180 shrink-0"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="warm-card p-8 text-center space-y-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-light mx-auto">
              <MessageSquare size={28} className="text-sage" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-foreground">
                아직 대화 기록이 없어요
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI 클론을 생성하면 자동으로 다른 사람의 클론과
                <br />
                대화를 시작합니다.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full px-6"
              >
                <Sparkles size={16} className="mr-2" />
                클론 만들기
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

// ─── 채팅 상세 뷰 ───
function ChatDetailView({ chatId }: { chatId: number }) {
  const [, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data: chat,
    isLoading,
    error,
  } = trpc.clone.getChatById.useQuery({ chatId }, { retry: false });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-warm-coral" size={32} />
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
          <div className="container py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/chat-log")}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft size={18} className="text-foreground" />
              </button>
              <h1 className="font-semibold text-foreground">대화 로그</h1>
            </div>
          </div>
        </header>
        <div className="container py-12">
          <div className="warm-card p-8 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-red-400" />
            <p className="text-sm text-muted-foreground">
              {error?.message ?? "대화를 불러올 수 없습니다."}
            </p>
            <Button
              onClick={() => setLocation("/chat-log")}
              variant="outline"
              className="rounded-full"
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/chat-log")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#7BA68C] to-[#A8D5BA] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">
                  {chat.partnerNickname.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {chat.partnerNickname}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {chat.totalMessages}개 메시지 ·{" "}
                  {chat.status === "completed" ? "대화 완료" : "진행 중"}
                </p>
              </div>
            </div>
            {chat.reportId && (
              <Button
                onClick={() => setLocation(`/report/${chat.reportId}`)}
                size="sm"
                className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full text-xs h-8 px-3"
              >
                <FileText size={12} className="mr-1" />
                리포트
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-140px)]" ref={scrollRef}>
          <div className="container py-4 space-y-3">
            {/* 대화 시작 안내 */}
            <div className="text-center py-3">
              <span className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {chat.createdAt
                  ? new Date(chat.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}{" "}
                · AI 클론 대화 시작
              </span>
            </div>

            {/* 메시지 버블 */}
            <AnimatePresence>
              {chat.messages.map(
                (
                  msg: {
                    role: string;
                    displayName?: string;
                    content: string;
                    timestamp: number;
                  },
                  idx: number
                ) => {
                  const isMyClone =
                    msg.role === "user_a" || msg.role === chat.myNickname;
                  const speakerName =
                    msg.displayName ??
                    (isMyClone ? chat.myNickname : chat.partnerNickname);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className={`flex ${isMyClone ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[80%] ${isMyClone ? "flex-row-reverse" : ""}`}
                      >
                        {/* 아바타 */}
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white ${
                            isMyClone
                              ? "bg-gradient-to-br from-[#E8725C] to-[#FF9A76]"
                              : "bg-gradient-to-br from-[#7BA68C] to-[#A8D5BA]"
                          }`}
                        >
                          {isMyClone
                            ? chat.myNickname.charAt(0)
                            : chat.partnerNickname.charAt(0)}
                        </div>

                        {/* 메시지 버블 */}
                        <div
                          className={`space-y-1 ${isMyClone ? "items-end" : "items-start"}`}
                        >
                          <p
                            className={`text-[10px] font-medium ${isMyClone ? "text-right" : "text-left"} text-muted-foreground`}
                          >
                            {speakerName}의 클론
                          </p>
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMyClone
                                ? "bg-warm-coral text-white rounded-br-md"
                                : "bg-white border border-border text-foreground rounded-bl-md shadow-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <p
                            className={`text-[9px] text-muted-foreground/60 ${isMyClone ? "text-right" : "text-left"}`}
                          >
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString(
                                  "ko-KR",
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>

            {/* 대화 완료 안내 */}
            {chat.status === "completed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-center py-4 space-y-3"
              >
                <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  <CheckCircle2 size={10} className="text-green-500" />
                  대화가 완료되었습니다
                </div>

                {chat.reportId ? (
                  <div className="warm-card p-4 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          chat.reportStatus === "failed"
                            ? "bg-gray-100"
                            : "bg-gradient-to-br from-[#E8725C] to-[#FF9A76]"
                        }`}
                      >
                        <span
                          className={`text-xs font-bold ${
                            chat.reportStatus === "failed"
                              ? "text-gray-500"
                              : "text-white"
                          }`}
                        >
                          {chat.reportStatus === "failed"
                            ? "!"
                            : (chat.reportScore ?? "?")}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">
                          케미스트리 리포트
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chat.reportStatus === "failed"
                            ? "생성 실패 · 하트 환불됨"
                            : `호환성 점수: ${chat.reportScore}점`}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setLocation(`/report/${chat.reportId}`)}
                      className="w-full bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full text-sm"
                    >
                      <FileText size={14} className="mr-1.5" />
                      리포트 보기
                    </Button>
                  </div>
                ) : (
                  <div className="warm-card p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        리포트 생성 중...
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>

      <MobileNav />
    </div>
  );
}

// ─── 메인 라우터 ───
export default function ChatLog() {
  const [matchDetail, params] = useRoute("/chat-log/:id");

  if (matchDetail && params?.id) {
    const chatId = parseInt(params.id, 10);
    if (!isNaN(chatId)) {
      return <ChatDetailView chatId={chatId} />;
    }
  }

  return <ChatListView />;
}
