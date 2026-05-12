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
  Lock,
  Eye,
  MessageSquare,
  Heart,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const REPORT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/report-warm-MnRnkaimmvUfzLmysa9bE8.webp";

const COMPATIBILITY_DATA = [
  { label: "가치관", score: 94, color: "warm-coral" },
  { label: "유머 코드", score: 88, color: "sage" },
  { label: "생활 패턴", score: 82, color: "gold" },
  { label: "관심사", score: 91, color: "warm-coral" },
  { label: "소통 방식", score: 86, color: "sage" },
  { label: "연애관", score: 79, color: "gold" },
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
    topic: "참고 사항",
    insight: "생활 리듬에서 약간의 차이가 있을 수 있습니다. 한 분은 아침형, 다른 분은 저녁형입니다.",
    sentiment: "warning",
  },
];

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
          <div className="flex items-center justify-between">
            <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-semibold text-foreground">
              케미스트리 리포트
            </h1>
            <div />
          </div>
        </div>
      </header>

      <div className="container py-5 space-y-5">
        {/* Overall Score */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="warm-card p-6 text-center space-y-3"
        >
          <p className="text-xs text-muted-foreground">나의 클론 × 별빛산책자</p>
          <div className="relative">
            <span className="text-7xl font-bold text-warm-coral">92</span>
            <span className="text-2xl font-bold text-warm-coral/60">%</span>
          </div>
          <p className="text-sm text-foreground/70 font-medium">
            매우 높은 호환성을 보입니다
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-1.5 badge-coral">
              <TrendingUp size={12} />
              <span>상위 8%</span>
            </div>
            <div className="flex items-center gap-1.5 badge-sage">
              <MessageSquare size={12} />
              <span>31회 대화</span>
            </div>
          </div>
        </motion.div>

        {/* Report Image */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="warm-card overflow-hidden"
        >
          <img
            src={REPORT_IMG}
            alt="호환성 분석 리포트"
            className="w-full aspect-[3/4] object-cover object-top"
          />
        </motion.div>

        {/* Compatibility Breakdown */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-foreground">상세 분석</h2>
          <div className="space-y-3">
            {COMPATIBILITY_DATA.map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i + 3}
                className="warm-card p-4"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className={`text-xl font-bold text-${item.color}`}>
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ delay: (i + 3) * 0.08, duration: 0.8 }}
                    className={`h-full rounded-full ${
                      item.color === "warm-coral"
                        ? "gradient-coral"
                        : item.color === "sage"
                        ? "gradient-sage"
                        : "bg-gold"
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
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-lg font-bold text-foreground">
            대화 하이라이트
          </motion.h2>
          <div className="space-y-3">
            {HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={item.topic}
                variants={fadeUp}
                custom={i + 1}
                className={`warm-card p-4 space-y-2 ${
                  item.sentiment === "warning" ? "border-gold/30 bg-gold-light/20" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.sentiment === "warning" ? (
                    <AlertTriangle size={14} className="text-gold" />
                  ) : (
                    <Sparkles size={14} className="text-warm-coral" />
                  )}
                  <span className="text-xs font-semibold text-foreground">
                    {item.topic}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.insight}</p>
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
            className="w-full h-13 gradient-coral text-white font-semibold text-base rounded-full shadow-lg shadow-warm-coral/20"
          >
            <MessageSquare size={18} className="mr-2" />
            전체 대화 보기
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => toast.info("프리미엄 기능입니다. 상점에서 하트를 구매해주세요.")}
              variant="outline"
              className="h-13 rounded-full border-border bg-white text-foreground font-medium hover:bg-sage-light hover:text-sage"
            >
              <Eye size={16} className="mr-2" />
              사진 보기
            </Button>
            <Button
              onClick={() => toast.info("프리미엄 기능입니다. 상점에서 하트를 구매해주세요.")}
              variant="outline"
              className="h-13 rounded-full border-border bg-white text-foreground font-medium hover:bg-warm-coral-light hover:text-warm-coral"
            >
              <Heart size={16} className="mr-2" />
              대화 신청
            </Button>
          </div>

          <div className="warm-card p-4 flex items-center gap-3 bg-muted/30">
            <Lock size={16} className="text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              사진 보기와 직접 대화 신청은 프리미엄 기능입니다. 하트를 사용하여 잠금을 해제할 수 있습니다.
            </p>
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
