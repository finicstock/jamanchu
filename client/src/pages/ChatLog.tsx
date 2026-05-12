/**
 * ChatLog - AI 클론 간 채팅 로그
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ChatLog() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-foreground">대화 로그</h1>
              <p className="text-[11px] text-muted-foreground">AI 클론 간의 대화 기록</p>
            </div>
          </div>
        </div>
      </header>

      {/* Empty State */}
      <div className="container py-12">
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
            <h2 className="font-display text-lg font-bold text-foreground">아직 대화 기록이 없어요</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI 클론을 생성하면 자동으로 다른 사람의 클론과
              <br />
              대화를 시작합니다. 대화가 완료되면 이곳에서
              <br />
              전체 대화 내용을 확인할 수 있어요.
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

        {/* Info Cards */}
        <div className="mt-6 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="warm-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-coral-light shrink-0 mt-0.5">
                <span className="text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">클론이 대화를 시작해요</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  나의 성격과 가치관을 학습한 AI 클론이 자동으로 상대를 찾아 대화합니다.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="warm-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-light shrink-0 mt-0.5">
                <span className="text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">대화 내용을 확인해요</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  대화가 완료되면 일부 내용을 무료로 확인할 수 있고, 전체 내용은 하트로 잠금 해제할 수 있어요.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="warm-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 shrink-0 mt-0.5">
                <span className="text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">마음에 들면 대화를 신청해요</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  케미스트리 리포트를 확인하고, 실제 대화를 신청할 수 있습니다.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
