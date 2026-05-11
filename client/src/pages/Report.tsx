/**
 * Report - 케미스트리 리포트
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 호환성 분석, 레이더 차트, 대화 하이라이트
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Lock,
  Eye,
  MessageSquare,
  Heart,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const REPORT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/chemistry-report-VfhzLWP7LU6SEagvgGnzmp.webp";

const COMPATIBILITY_DATA = [
  { label: "가치관", score: 94, color: "neon-mint" },
  { label: "유머 코드", score: 88, color: "neon-pink" },
  { label: "생활 패턴", score: 82, color: "neon-mint" },
  { label: "관심사", score: 91, color: "neon-pink" },
  { label: "소통 방식", score: 86, color: "neon-mint" },
  { label: "연애관", score: 79, color: "neon-pink" },
];

const HIGHLIGHTS = [
  {
    topic: "여행에 대한 가치관",
    insight: "두 분 모두 여행을 '힐링'으로 인식하며, 자연 속에서 에너지를 충전하는 타입입니다.",
    sentiment: "positive",
  },
  {
    topic: "음악 취향",
    insight: "인디 음악에 대한 공통 관심사가 있으며, 특히 감성적인 가사를 선호하는 경향이 일치합니다.",
    sentiment: "positive",
  },
  {
    topic: "주말 활동",
    insight: "활동적인 아웃도어와 조용한 카페 시간 모두 즐기는 균형 잡힌 라이프스타일을 공유합니다.",
    sentiment: "positive",
  },
  {
    topic: "갈등 요소",
    insight: "생활 리듬에서 약간의 차이가 있을 수 있습니다. 한 분은 아침형, 다른 분은 저녁형입니다.",
    sentiment: "warning",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Report() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[oklch(0.22_0.005_260)] bg-background/95 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setLocation("/dashboard")} className="text-foreground/60 hover:text-foreground transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-display text-lg text-foreground tracking-wide">
              CHEMISTRY REPORT
            </h1>
            <div />
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Overall Score */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="brutal-card p-6 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">나의 클론 × 별빛산책자</span>
          </div>
          <div className="relative">
            <span className="font-display text-8xl text-neon-mint neon-text-mint">92</span>
            <span className="font-display text-3xl text-neon-mint/60">%</span>
          </div>
          <p className="text-sm text-foreground/60">
            매우 높은 호환성을 보입니다
          </p>
          <div className="flex justify-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-neon-mint">
              <TrendingUp size={12} />
              <span>상위 8%</span>
            </div>
            <div className="h-3 w-px bg-[oklch(0.3_0.005_260)]" />
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <MessageSquare size={12} />
              <span>31회 대화</span>
            </div>
          </div>
        </motion.div>

        {/* Report Preview Image */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="relative overflow-hidden border-2 border-[oklch(0.22_0.005_260)]"
          style={{ borderRadius: "2px" }}
        >
          <img
            src={REPORT_IMG}
            alt="상세 분석 리포트"
            className="w-full aspect-[3/4] object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-xs text-foreground/60 mb-2">AI가 분석한 상세 호환성 리포트</p>
          </div>
        </motion.div>

        {/* Compatibility Breakdown */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="space-y-4"
        >
          <h2 className="font-display text-xl text-foreground tracking-wide">BREAKDOWN</h2>
          <div className="space-y-3">
            {COMPATIBILITY_DATA.map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i + 3}
                className="brutal-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span
                    className={`font-display text-xl ${
                      item.color === "neon-mint" ? "text-neon-mint" : "text-neon-pink"
                    }`}
                  >
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 bg-[oklch(0.18_0.005_260)] overflow-hidden" style={{ borderRadius: "1px" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ delay: (i + 3) * 0.1, duration: 0.8 }}
                    className={`h-full ${
                      item.color === "neon-mint" ? "bg-neon-mint" : "bg-neon-pink"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Conversation Highlights */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-xl text-foreground tracking-wide">
            HIGHLIGHTS
          </motion.h2>
          <div className="space-y-3">
            {HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={item.topic}
                variants={fadeUp}
                custom={i + 1}
                className={`brutal-card p-4 space-y-2 ${
                  item.sentiment === "warning" ? "border-[oklch(0.7_0.15_50)]/30" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.sentiment === "warning" ? (
                    <AlertTriangle size={14} className="text-[oklch(0.7_0.15_50)]" />
                  ) : (
                    <Sparkles size={14} className="text-neon-mint" />
                  )}
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {item.topic}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">{item.insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="space-y-3"
        >
          <Button
            onClick={() => setLocation("/chat-log")}
            className="w-full h-14 bg-neon-mint text-background font-bold text-base tracking-wide border-2 border-neon-mint hover:bg-neon-mint/90 neon-glow-mint"
            style={{ borderRadius: "2px" }}
          >
            <MessageSquare size={18} className="mr-2" />
            전체 대화 보기
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => toast.info("프리미엄 기능입니다. 상점에서 하트를 구매해주세요.")}
              variant="outline"
              className="h-14 border-2 border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink font-medium"
              style={{ borderRadius: "2px" }}
            >
              <Eye size={16} className="mr-2" />
              사진 보기
            </Button>
            <Button
              onClick={() => toast.info("프리미엄 기능입니다. 상점에서 하트를 구매해주세요.")}
              variant="outline"
              className="h-14 border-2 border-neon-mint/30 text-neon-mint hover:bg-neon-mint/10 hover:border-neon-mint font-medium"
              style={{ borderRadius: "2px" }}
            >
              <Heart size={16} className="mr-2" />
              대화 신청
            </Button>
          </div>

          <div className="brutal-card p-3 flex items-center gap-3 border-neon-pink/20">
            <Lock size={16} className="text-neon-pink shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              사진 보기와 직접 대화 신청은 프리미엄 기능입니다. 하트를 사용하여 잠금을 해제할 수 있습니다.
            </p>
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
