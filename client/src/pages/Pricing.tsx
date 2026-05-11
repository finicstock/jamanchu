/**
 * Pricing - 과금 시스템 및 상점
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 하트 패키지, 구독 플랜, 기능별 과금 안내
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
    name: "FREE",
    price: "무료",
    period: "",
    color: "foreground/60",
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
    name: "PRO",
    price: "14,900",
    period: "원/월",
    color: "neon-mint",
    features: [
      "AI 클론 무제한 수정",
      "일 10회 매칭",
      "전체 리포트 열람",
      "전체 채팅 로그",
      "우선 매칭 권한",
      "월 50 하트 지급",
    ],
    cta: "PRO 시작하기",
    disabled: false,
  },
  {
    name: "PREMIUM",
    price: "29,900",
    period: "원/월",
    color: "neon-pink",
    features: [
      "PRO의 모든 기능",
      "무제한 매칭",
      "고급 AI 모델 적용",
      "심층 심리 분석",
      "대화 코칭 AI",
      "월 200 하트 지급",
      "프로필 부스트",
    ],
    cta: "PREMIUM 시작하기",
    disabled: false,
  },
];

const FEATURE_PRICES = [
  { icon: FileText, label: "전체 채팅 로그 열람", price: "50 하트", desc: "클론 간 전체 대화 내용 확인" },
  { icon: Eye, label: "프로필 사진 잠금 해제", price: "30 하트", desc: "상대방의 실제 사진 공개" },
  { icon: MessageSquare, label: "직접 대화 신청", price: "100 하트", desc: "상대방에게 실제 대화 요청" },
  { icon: Star, label: "심층 분석 리포트", price: "80 하트", desc: "AI 심리 분석 상세 보고서" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<"hearts" | "subscription">("hearts");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[oklch(0.22_0.005_260)] bg-background/95 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl text-foreground tracking-wide">SHOP</h1>
            <div className="flex items-center gap-2 border-2 border-neon-pink/30 bg-neon-pink/5 px-3 py-1.5">
              <Heart size={14} className="text-neon-pink fill-neon-pink" />
              <span className="text-sm font-bold text-neon-pink">127</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("hearts")}
              className={`flex-1 py-2.5 text-sm font-bold tracking-wider uppercase border-2 transition-all ${
                activeTab === "hearts"
                  ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                  : "border-[oklch(0.25_0.005_260)] text-muted-foreground"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <Heart size={14} className="inline mr-1.5" />
              하트
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`flex-1 py-2.5 text-sm font-bold tracking-wider uppercase border-2 transition-all ${
                activeTab === "subscription"
                  ? "border-neon-mint bg-neon-mint/10 text-neon-mint"
                  : "border-[oklch(0.25_0.005_260)] text-muted-foreground"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <Crown size={14} className="inline mr-1.5" />
              구독
            </button>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {activeTab === "hearts" && (
          <motion.div initial="hidden" animate="visible" className="space-y-6">
            {/* Heart Packages */}
            <motion.div variants={fadeUp} custom={0}>
              <h2 className="font-display text-xl text-foreground tracking-wide mb-1">HEART PACKAGES</h2>
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
                  className={`brutal-card p-4 text-center space-y-2 relative ${
                    pkg.popular ? "border-neon-pink" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-pink text-background text-[9px] font-bold px-3 py-0.5 uppercase tracking-wider">
                      인기
                    </div>
                  )}
                  <Heart
                    size={24}
                    className={`mx-auto ${pkg.popular ? "text-neon-pink fill-neon-pink" : "text-neon-pink/60"}`}
                  />
                  <div>
                    <span className="font-display text-3xl text-foreground">{pkg.amount}</span>
                    {pkg.bonus && (
                      <span className="text-[10px] text-neon-mint block mt-0.5">{pkg.bonus}</span>
                    )}
                  </div>
                  <Button
                    onClick={() => toast.info("데모 버전에서는 결제가 지원되지 않습니다.")}
                    className={`w-full h-10 font-bold text-sm border-2 ${
                      pkg.popular
                        ? "bg-neon-pink text-foreground border-neon-pink hover:bg-neon-pink/90 neon-glow-pink"
                        : "bg-transparent text-foreground border-[oklch(0.3_0.005_260)] hover:border-neon-pink hover:text-neon-pink"
                    }`}
                    style={{ borderRadius: "2px" }}
                  >
                    {pkg.price}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Feature Prices */}
            <motion.div variants={fadeUp} custom={5} className="space-y-3">
              <h2 className="font-display text-xl text-foreground tracking-wide">FEATURE PRICES</h2>
              {FEATURE_PRICES.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  variants={fadeUp}
                  custom={i + 6}
                  className="brutal-card p-4 flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-neon-mint/30 bg-neon-mint/5">
                    <feature.icon size={18} className="text-neon-mint" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground">{feature.label}</h3>
                    <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Heart size={12} className="text-neon-pink fill-neon-pink" />
                    <span className="text-sm font-bold text-neon-pink">{feature.price.replace(" 하트", "")}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeTab === "subscription" && (
          <motion.div initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <h2 className="font-display text-xl text-foreground tracking-wide mb-1">SUBSCRIPTION PLANS</h2>
              <p className="text-xs text-muted-foreground mb-4">
                구독으로 더 많은 기능을 이용하세요
              </p>
            </motion.div>

            {SUBSCRIPTION_PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i + 1}
                className={`brutal-card p-5 space-y-4 ${
                  plan.color === "neon-mint"
                    ? "border-neon-mint"
                    : plan.color === "neon-pink"
                    ? "border-neon-pink"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {plan.color === "neon-pink" && <Crown size={18} className="text-neon-pink" />}
                    {plan.color === "neon-mint" && <Zap size={18} className="text-neon-mint" />}
                    <span className="font-display text-2xl text-foreground">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-display text-2xl ${
                      plan.color === "neon-mint" ? "text-neon-mint" : plan.color === "neon-pink" ? "text-neon-pink" : "text-foreground/60"
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
                        plan.color === "neon-mint" ? "text-neon-mint" : plan.color === "neon-pink" ? "text-neon-pink" : "text-muted-foreground"
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
                  className={`w-full h-12 font-bold text-sm border-2 ${
                    plan.color === "neon-mint"
                      ? "bg-neon-mint text-background border-neon-mint hover:bg-neon-mint/90 neon-glow-mint"
                      : plan.color === "neon-pink"
                      ? "bg-neon-pink text-foreground border-neon-pink hover:bg-neon-pink/90 neon-glow-pink"
                      : "bg-transparent text-muted-foreground border-[oklch(0.3_0.005_260)]"
                  }`}
                  style={{ borderRadius: "2px" }}
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
