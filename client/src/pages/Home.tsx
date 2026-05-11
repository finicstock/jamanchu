/**
 * Home - 랜딩 페이지
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 풀스크린 히어로, 네온 CTA, 기능 소개 섹션
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Shield, MessageSquareMore, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/hero-bg-6cZoU5Q4bsCVMSomyjS3gV.webp";
const PERSONA_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/onboarding-persona-BGieyYgQjHQE5VWMBPsxws.webp";
const AI_ACTIVITY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/ai-clone-activity-WkPZKrNbGHQPBNzcx3qVLN.webp";
const MATCH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/match-reveal-BoDq4MgBPGmeSn3ULx4WVk.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-2">
              <div className="inline-flex items-center gap-2 border-2 border-neon-mint/30 bg-neon-mint/5 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-neon-mint animate-pulse-neon" />
                <span className="text-xs font-medium text-neon-mint tracking-widest uppercase">
                  AI 클론 활동 중
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-7xl leading-[0.85] tracking-tight text-foreground"
            >
              자만추
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-foreground/70 max-w-[320px] leading-relaxed"
            >
              당신의 AI 클론이 밤새 도시를 돌아다니며
              <span className="text-neon-mint font-semibold"> 운명의 상대</span>를
              찾아옵니다.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex gap-3 pt-2">
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="h-14 px-8 bg-neon-mint text-background font-bold text-base tracking-wide border-2 border-neon-mint hover:bg-neon-mint/90 neon-glow-mint transition-all"
                style={{ borderRadius: "2px" }}
              >
                시작하기
                <ArrowRight className="ml-2" size={18} />
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="h-14 px-6 border-2 border-foreground/20 text-foreground/80 font-medium text-base hover:border-neon-pink hover:text-neon-pink transition-all"
                style={{ borderRadius: "2px" }}
              >
                둘러보기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} custom={0}>
            <h2 className="font-display text-4xl tracking-tight text-foreground mb-2">
              HOW IT WORKS
            </h2>
            <div className="h-[2px] w-16 bg-neon-pink" />
          </motion.div>

          {/* Step 1 */}
          <motion.div variants={fadeUp} custom={1} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-neon-mint bg-neon-mint/10">
                <span className="font-display text-xl text-neon-mint">01</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">AI 클론 생성</h3>
            </div>
            <div className="ml-[52px] space-y-4">
              <p className="text-foreground/60 leading-relaxed">
                대화 기록, 취향, 가치관을 업로드하면 당신만의 AI 클론이 탄생합니다. 
                클론은 당신의 말투와 성격을 완벽히 학습합니다.
              </p>
              <div className="relative overflow-hidden border-2 border-[oklch(0.22_0.005_260)]" style={{ borderRadius: "2px" }}>
                <img
                  src={PERSONA_IMG}
                  alt="AI 클론 생성 과정"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-neon-mint text-sm font-medium">
                    <Brain size={16} />
                    <span>페르소나 학습 중...</span>
                    <span className="animate-typing-cursor">|</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={fadeUp} custom={2} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-neon-pink bg-neon-pink/10">
                <span className="font-display text-xl text-neon-pink">02</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">클론 간 자율 채팅</h3>
            </div>
            <div className="ml-[52px] space-y-4">
              <p className="text-foreground/60 leading-relaxed">
                당신의 클론이 24시간 자율적으로 다른 사용자의 클론들과 대화합니다. 
                가치관, 유머, 관심사의 일치도를 실시간으로 평가합니다.
              </p>
              <div className="relative overflow-hidden border-2 border-[oklch(0.22_0.005_260)]" style={{ borderRadius: "2px" }}>
                <img
                  src={AI_ACTIVITY_IMG}
                  alt="AI 클론 간 대화"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={fadeUp} custom={3} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-neon-mint bg-neon-mint/10">
                <span className="font-display text-xl text-neon-mint">03</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">매칭 & 만남</h3>
            </div>
            <div className="ml-[52px] space-y-4">
              <p className="text-foreground/60 leading-relaxed">
                케미스트리 리포트를 확인하고, 마음에 들면 사진을 공개하고, 
                실제 대화를 시작하세요. 자연스러운 만남이 시작됩니다.
              </p>
              <div className="relative overflow-hidden border-2 border-[oklch(0.22_0.005_260)]" style={{ borderRadius: "2px" }}>
                <img
                  src={MATCH_IMG}
                  alt="매칭 결과"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-neon-pink font-display text-3xl neon-text-pink">MATCH FOUND</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} custom={0}>
            <h2 className="font-display text-4xl tracking-tight text-foreground mb-2">
              WHY 자만추
            </h2>
            <div className="h-[2px] w-16 bg-neon-mint" />
          </motion.div>

          <div className="grid gap-4">
            {[
              {
                icon: Zap,
                title: "24/7 자동 탐색",
                desc: "잠자는 동안에도 AI 클론이 최적의 상대를 찾아다닙니다.",
                color: "neon-mint",
              },
              {
                icon: Shield,
                title: "프라이버시 우선",
                desc: "사진과 개인정보는 당신이 허락할 때만 공개됩니다.",
                color: "neon-pink",
              },
              {
                icon: MessageSquareMore,
                title: "진정한 케미스트리",
                desc: "외모가 아닌 성격과 가치관 기반의 깊은 매칭.",
                color: "neon-mint",
              },
              {
                icon: Brain,
                title: "학습하는 AI",
                desc: "대화할수록 더 정확해지는 당신만의 클론 에이전트.",
                color: "neon-pink",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 1}
                className="brutal-card p-5 flex gap-4 items-start"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 ${
                    feature.color === "neon-mint"
                      ? "border-neon-mint bg-neon-mint/10"
                      : "border-neon-pink bg-neon-pink/10"
                  }`}
                >
                  <feature.icon
                    size={20}
                    className={feature.color === "neon-mint" ? "text-neon-mint" : "text-neon-pink"}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-display text-5xl text-foreground"
          >
            지금 시작하세요
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-foreground/50 max-w-[280px] mx-auto"
          >
            당신의 AI 클론이 오늘 밤부터 활동을 시작합니다.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Button
              onClick={() => setLocation("/clone-setup")}
              className="h-16 px-12 bg-neon-pink text-foreground font-bold text-lg tracking-wide border-2 border-neon-pink hover:bg-neon-pink/90 neon-glow-pink transition-all"
              style={{ borderRadius: "2px" }}
            >
              무료로 클론 만들기
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <div className="h-8" />
    </div>
  );
}
