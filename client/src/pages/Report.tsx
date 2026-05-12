/**
 * Report - 케미스트리 리포트
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  FileText,
  Sparkles,
  TrendingUp,
  Heart,
  MessageSquare,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Report() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/dashboard")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="font-semibold text-foreground">케미스트리 리포트</h1>
              <p className="text-[11px] text-muted-foreground">AI 분석 결과</p>
            </div>
          </div>
        </div>
      </header>

      {/* Empty State */}
      <div className="container py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="warm-card p-8 text-center space-y-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-coral-light mx-auto">
            <FileText size={28} className="text-warm-coral" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-foreground">아직 리포트가 없어요</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI 클론이 대화를 완료하면 상세한 케미스트리
              <br />
              리포트가 자동으로 생성됩니다.
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

        {/* What's in a Report */}
        <div className="mt-8 space-y-4">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-lg font-bold text-foreground"
          >
            리포트에는 이런 내용이 담겨요
          </motion.h2>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="warm-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-coral-light shrink-0">
                <TrendingUp size={16} className="text-warm-coral" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">호환성 점수</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  가치관, 유머 코드, 생활 패턴, 관심사, 소통 방식, 연애관 등 6가지 항목별 상세 점수를 제공합니다.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="warm-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-light shrink-0">
                <MessageSquare size={16} className="text-sage" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">대화 하이라이트</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI가 분석한 주요 대화 포인트와 공통 관심사, 주의할 점을 정리해드립니다.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="warm-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20 shrink-0">
                <Heart size={16} className="text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">추천 행동</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  사진 열람, 전체 대화 확인, 직접 대화 신청 등 다음 단계를 안내합니다.
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
