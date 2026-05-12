/**
 * Pricing - 자만추 결제 시스템
 * 한국형 결제 수단: 토스페이먼츠, 카카오페이, 일반 카드결제, 구글페이
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Crown,
  Zap,
  Check,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  MessageSquare,
  Eye,
  Send,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const HEART_PACKAGES = [
  { id: "heart-10", hearts: 10, price: "3,900원", priceNum: 3900, popular: false, badge: "" },
  { id: "heart-30", hearts: 30, price: "9,900원", priceNum: 9900, popular: true, badge: "인기" },
  { id: "heart-60", hearts: 60, price: "17,900원", priceNum: 17900, popular: false, badge: "할인" },
  { id: "heart-100", hearts: 100, price: "24,900원", priceNum: 24900, popular: false, badge: "최고 가성비" },
];

const FEATURE_PRICES = [
  { icon: MessageSquare, label: "채팅 로그 열람", desc: "AI 클론 간 대화 내용 확인", price: 3 },
  { icon: Eye, label: "사진 열람", desc: "매칭 상대의 프로필 사진 확인", price: 5 },
  { icon: Star, label: "케미스트리 리포트", desc: "상세 호환성 분석 보고서", price: 7 },
  { icon: Send, label: "대화 신청", desc: "실제 대화 요청 보내기", price: 10 },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "무료",
    price: "0원",
    period: "",
    priceNum: 0,
    features: ["AI 클론 1개 생성", "일일 매칭 3회", "기본 리포트"],
    color: "default",
    cta: "현재 플랜",
    disabled: true,
  },
  {
    id: "plus",
    name: "플러스",
    price: "9,900원",
    period: "/월",
    priceNum: 9900,
    features: ["AI 클론 3개 생성", "무제한 매칭", "상세 리포트", "채팅 로그 무제한 열람"],
    color: "coral",
    cta: "플러스 시작하기",
    disabled: false,
  },
  {
    id: "premium",
    name: "프리미엄",
    price: "19,900원",
    period: "/월",
    priceNum: 19900,
    features: ["AI 클론 5개 생성", "무제한 매칭", "프리미엄 리포트", "모든 기능 무제한", "우선 매칭"],
    color: "sage",
    cta: "프리미엄 시작하기",
    disabled: false,
  },
];

const PAYMENT_METHODS = [
  {
    id: "tosspay",
    name: "토스페이",
    icon: "💙",
    color: "bg-blue-50 border-blue-200",
    activeColor: "bg-blue-100 border-blue-500 ring-2 ring-blue-200",
    desc: "토스로 간편하게",
  },
  {
    id: "kakaopay",
    name: "카카오페이",
    icon: "💛",
    color: "bg-yellow-50 border-yellow-200",
    activeColor: "bg-yellow-100 border-yellow-500 ring-2 ring-yellow-200",
    desc: "카카오톡으로 결제",
  },
  {
    id: "card",
    name: "일반 카드결제",
    icon: "💳",
    color: "bg-gray-50 border-gray-200",
    activeColor: "bg-gray-100 border-gray-500 ring-2 ring-gray-200",
    desc: "신용/체크카드",
  },
  {
    id: "googlepay",
    name: "구글페이",
    icon: "🌐",
    color: "bg-green-50 border-green-200",
    activeColor: "bg-green-100 border-green-500 ring-2 ring-green-200",
    desc: "Google Pay",
  },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<"hearts" | "subscription">("hearts");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "confirm" | "processing" | "done">("select");

  const handlePurchase = (itemId: string) => {
    setSelectedPackage(itemId);
    setSelectedPlan(null);
    setSelectedPayment(null);
    setPaymentStep("select");
    setShowPaymentModal(true);
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setSelectedPackage(null);
    setSelectedPayment(null);
    setPaymentStep("select");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      setPaymentStep("done");
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStep("select");
        toast.success("결제가 완료되었습니다!", {
          description: selectedPackage ? "하트가 충전되었습니다." : "구독이 시작되었습니다.",
        });
      }, 1500);
    }, 2000);
  };

  const getSelectedItemName = () => {
    if (selectedPackage) {
      const pkg = HEART_PACKAGES.find((p) => p.id === selectedPackage);
      return pkg ? `하트 ${pkg.hearts}개` : "";
    }
    if (selectedPlan) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);
      return plan ? `${plan.name} 구독` : "";
    }
    return "";
  };

  const getSelectedItemPrice = () => {
    if (selectedPackage) {
      const pkg = HEART_PACKAGES.find((p) => p.id === selectedPackage);
      return pkg?.price || "";
    }
    if (selectedPlan) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);
      return plan ? `${plan.price}${plan.period}` : "";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <h1 className="font-display text-xl font-bold text-foreground text-center">상점</h1>
        </div>
      </header>

      {/* Balance */}
      <div className="container py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="warm-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-coral-light">
              <Heart size={18} className="text-warm-coral fill-warm-coral" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">보유 하트</p>
              <p className="text-lg font-bold text-foreground">12개</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">현재 플랜</p>
            <p className="text-sm font-semibold text-sage">무료</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="container pb-3">
        <div className="flex gap-2 p-1 bg-muted rounded-full">
          <button
            onClick={() => setActiveTab("hearts")}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "hearts"
                ? "bg-white text-warm-coral shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Heart size={14} className="inline mr-1" />
            하트 충전
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "subscription"
                ? "bg-white text-sage shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Crown size={14} className="inline mr-1" />
            구독
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container space-y-6">
        {activeTab === "hearts" && (
          <motion.div initial="hidden" animate="visible" className="space-y-6">
            {/* Heart Packages */}
            <div className="grid grid-cols-2 gap-3">
              {HEART_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  variants={fadeUp}
                  custom={i}
                  className={`warm-card p-4 text-center space-y-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.97] ${
                    pkg.popular ? "border-warm-coral ring-2 ring-warm-coral/10" : ""
                  }`}
                  onClick={() => handlePurchase(pkg.id)}
                >
                  {pkg.badge && (
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.popular ? "bg-warm-coral text-white" : "bg-sage-light text-sage"
                    }`}>
                      {pkg.badge}
                    </span>
                  )}
                  <div className="flex items-center justify-center gap-1">
                    <Heart size={16} className="text-warm-coral fill-warm-coral" />
                    <span className="text-2xl font-bold text-foreground">{pkg.hearts}</span>
                  </div>
                  <div className={`w-full py-2 font-semibold text-sm rounded-full ${
                    pkg.popular
                      ? "gradient-coral text-white shadow-sm"
                      : "bg-muted text-foreground"
                  }`}>
                    {pkg.price}
                  </div>
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

            {/* Payment Methods Info */}
            <motion.div variants={fadeUp} custom={11} className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">지원 결제 수단</h2>
              <div className="grid grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className={`p-2.5 rounded-xl border text-center ${method.color}`}>
                    <div className="text-lg mb-0.5">{method.icon}</div>
                    <p className="text-[10px] font-medium text-foreground">{method.name}</p>
                  </div>
                ))}
              </div>
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
                key={plan.id}
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
                    if (!plan.disabled) handleSubscribe(plan.id);
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (paymentStep === "select" || paymentStep === "confirm") {
                setShowPaymentModal(false);
              }
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {paymentStep === "done" ? "결제 완료" : "결제하기"}
                </h3>
                {(paymentStep === "select" || paymentStep === "confirm") && (
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-muted"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Payment Content */}
              <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Order Summary */}
                {paymentStep !== "done" && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-warm-coral fill-warm-coral" />
                      <span className="text-sm font-medium text-foreground">{getSelectedItemName()}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{getSelectedItemPrice()}</span>
                  </div>
                )}

                {/* Step: Select Payment Method */}
                {paymentStep === "select" && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-foreground">결제 수단을 선택하세요</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const isSelected = selectedPayment === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                              isSelected ? method.activeColor : method.color
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xl">{method.icon}</span>
                              {isSelected && (
                                <Check size={14} className="text-green-600" />
                              )}
                            </div>
                            <p className="text-xs font-semibold text-foreground mt-1.5">{method.name}</p>
                            <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => setPaymentStep("confirm")}
                      disabled={!selectedPayment}
                      className="w-full h-12 gradient-coral text-white font-semibold rounded-full shadow-md shadow-warm-coral/20 disabled:opacity-40 disabled:shadow-none"
                    >
                      다음
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                )}

                {/* Step: Confirm Payment */}
                {paymentStep === "confirm" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">결제 정보 확인</p>
                      <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">상품</span>
                          <span className="font-medium text-foreground">{getSelectedItemName()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">결제 수단</span>
                          <span className="font-medium text-foreground">
                            {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.icon}{" "}
                            {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}
                          </span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-foreground">결제 금액</span>
                          <span className="text-lg font-bold text-warm-coral">{getSelectedItemPrice()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-sage-light/50 rounded-xl">
                      <ShieldCheck size={16} className="text-sage shrink-0 mt-0.5" />
                      <p className="text-[11px] text-foreground/70 leading-relaxed">
                        결제 정보는 안전하게 암호화되어 처리됩니다. 구독은 언제든 해지할 수 있습니다.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setPaymentStep("select")}
                        variant="outline"
                        className="flex-1 h-12 rounded-full"
                      >
                        이전
                      </Button>
                      <Button
                        onClick={handleConfirmPayment}
                        className="flex-[2] h-12 gradient-coral text-white font-semibold rounded-full shadow-md shadow-warm-coral/20"
                      >
                        {getSelectedItemPrice()} 결제하기
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step: Processing */}
                {paymentStep === "processing" && (
                  <div className="py-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-warm-coral-light flex items-center justify-center">
                        <Smartphone size={28} className="text-warm-coral animate-gentle-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">결제 처리 중...</p>
                      <p className="text-xs text-muted-foreground">
                        {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}으로 결제를 진행하고 있습니다
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-1.5 w-40 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-warm-coral rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Done */}
                {paymentStep === "done" && (
                  <div className="py-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="h-16 w-16 rounded-full bg-sage-light flex items-center justify-center"
                      >
                        <Check size={28} className="text-sage" />
                      </motion.div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">결제 완료!</p>
                      <p className="text-xs text-muted-foreground">
                        {getSelectedItemName()}이(가) 충전되었습니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}
