/**
 * Pricing - 과금 시스템 및 상점
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { useState } from "react";
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Crown,
  Eye,
  MessageSquare,
  FileText,
  Zap,
  Check,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const HEART_PACKAGES = [
  { amount: 30, price: "3,900원", popular: false, bonus: "" },
  { amount: 100, price: "9,900원", popular: true, bonus: "+20 보너스" },
  { amount: 300, price: "24,900원", popular: false, bonus: "+80 보너스" },
  { amount: 1000, price: "69,900원", popular: false, bonus: "+350 보너스" },
];

const SUBSCRIPTION_PLANS = [
  {
    name: "Free",
    price: "무료",
    period: "",
    color: "muted",
    features: [
      "AI 클론 1개 생성",
      "일 1회 매칭",
      "요약 리포트 열람",
      "제한된 채팅 로그",
    ],
    cta: "현재 플랜",
    disabled: true,
  },
  {
    name: "Pro",
    price: "14,900",
    period: "원/월",
    color: "coral",
    features: [
      "AI 클론 무제한 수정",
      "일 10회 매칭",
      "전체 리포트 열람",
      "전체 채팅 로그",
      "우선 매칭 권한",
      "월 50 하트 지급",
    ],
    cta: "Pro 시작하기",
    disabled: false,
  },
  {
    name: "Premium",
    price: "29,900",
    period: "원/월",
    color: "sage",
    features: [
      "Pro의 모든 기능",
      "무제한 매칭",
      "고급 AI 모델 적용",
      "심층 심리 분석",
      "대화 코칭 AI",
      "월 200 하트 지급",
      "프로필 부스트",
    ],
    cta: "Premium 시작하기",
    disabled: false,
  },
];

const FEATURE_PRICES = [
  { icon: FileText, label: "전체 채팅 로그 열람", price: "50", desc: "클론 간 전체 대화 내용 확인" },
  { icon: Eye, label: "프로필 사진 잠금 해제", price: "30", desc: "상대방의 실제 사진 공개" },
  { icon: MessageSquare, label: "직접 대화 신청", price: "100", desc: "상대방에게 실제 대화 요청" },
  { icon: Star, label: "심층 분석 리포트", price: "80", desc: "AI 심리 분석 상세 보고서" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<"hearts" | "subscription">("hearts");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-foreground">상점</h1>
            <div className="flex items-center gap-2 badge-coral">
              <Heart size={12} className="fill-current" />
              <span className="text-xs font-semibold">127</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("hearts")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
                activeTab === "hearts"
                  ? "gradient-coral text-white shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Heart size={14} className="inline mr-1.5" />
              하트
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
                activeTab === "subscription"
                  ? "gradient-sage text-white shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Crown size={14} className="inline mr-1.5" />
              구독
            </button>
          </div>
        </div>
      </header>

      <div className="container py-5 space-y-5">
        {activeTab === "hearts" && (
          <motion.div initial="hidden" animate="visible" className="space-y-5">
            {/* Heart Packages */}
            <motion.div variants={fadeUp} custom={0}>
              <h2 className="font-display text-lg font-bold text-foreground mb-1">하트 패키지</h2>
              <p className="text-xs text-muted-foreground mb-4">
                하트로 프리미엄 기능을 이용하세요
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {HEART_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.amount}
                  variants={fadeUp}
                  custom={i + 1}
                  className={`warm-card p-4 text-center space-y-2 relative ${
                    pkg.popular ? "border-warm-coral ring-2 ring-warm-coral/10" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge-coral text-[10px] px-2.5 py-0.5">
                      인기
                    </div>
                  )}
                  <Heart
                    size={24}
                    className={`mx-auto ${pkg.popular ? "text-warm-coral fill-warm-coral" : "text-warm-coral/50"}`}
                  />
                  <div>
                    <span className="text-2xl font-bold text-foreground">{pkg.amount}</span>
                    {pkg.bonus && (
                      <span className="text-[10px] text-sage font-medium block mt-0.5">{pkg.bonus}</span>
                    )}
                  </div>
                  <Button
                    onClick={() => toast.info("데모 버전에서는 결제가 지원되지 않습니다.")}
                    className={`w-full h-9 font-semibold text-sm rounded-full ${
                      pkg.popular
                        ? "gradient-coral text-white shadow-sm"
                        : "bg-muted text-foreground hover:bg-warm-coral-light hover:text-warm-coral"
                    }`}
                  >
                    {pkg.price}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Feature Prices */}
            <motion.div variants={fadeUp} custom={5} className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">기능별 가격</h2>
              {FEATURE_PRICES.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  variants={fadeUp}
                  custom={i + 6}
                  className="warm-card p-4 flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-light">
                    <feature.icon size={18} className="text-sage" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{feature.label}</h3>
                    <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Heart size={12} className="text-warm-coral fill-warm-coral" />
                    <span className="text-sm font-bold text-warm-coral">{feature.price}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeTab === "subscription" && (
          <motion.div initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <h2 className="font-display text-lg font-bold text-foreground mb-1">구독 플랜</h2>
              <p className="text-xs text-muted-foreground mb-4">
                구독으로 더 많은 기능을 이용하세요
              </p>
            </motion.div>

            {SUBSCRIPTION_PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i + 1}
                className={`warm-card p-5 space-y-4 ${
                  plan.color === "coral"
                    ? "border-warm-coral ring-2 ring-warm-coral/10"
                    : plan.color === "sage"
                    ? "border-sage ring-2 ring-sage/10"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {plan.color === "sage" && <Crown size={18} className="text-sage" />}
                    {plan.color === "coral" && <Zap size={18} className="text-warm-coral" />}
                    <span className="text-lg font-bold text-foreground">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${
                      plan.color === "coral" ? "text-warm-coral" : plan.color === "sage" ? "text-sage" : "text-muted-foreground"
                    }`}>
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check size={14} className={
                        plan.color === "coral" ? "text-warm-coral" : plan.color === "sage" ? "text-sage" : "text-muted-foreground"
                      } />
                      <span className="text-sm text-foreground/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    if (!plan.disabled) {
                      toast.info("데모 버전에서는 구독이 지원되지 않습니다.");
                    }
                  }}
                  disabled={plan.disabled}
                  className={`w-full h-12 font-semibold text-sm rounded-full ${
                    plan.color === "coral"
                      ? "gradient-coral text-white shadow-md shadow-warm-coral/20"
                      : plan.color === "sage"
                      ? "gradient-sage text-white shadow-md shadow-sage/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
