/**
 * Dashboard - AI 클론 활동 대시보드
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { Activity, MessageSquare, Heart, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import LoginModal from "@/components/LoginModal";

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
          </div>
        </div>
      </header>

      <div className="container py-5 space-y-5">
        {/* Clone Status - Empty State */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="warm-card p-6 space-y-4"
        >
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
        </motion.div>

        {/* Matches - Empty State */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <motion.div variants={fadeUp} custom={1} className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">매칭 결과</h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={2}
            className="warm-card p-8 text-center space-y-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-light mx-auto">
              <Search size={20} className="text-sage" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">아직 매칭 결과가 없어요</h3>
              <p className="text-xs text-muted-foreground mt-1">
                AI 클론을 생성하면 자동으로 대화를 시작하고
                <br />
                호환성 높은 상대를 찾아줍니다.
              </p>
            </div>
          </motion.div>
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
