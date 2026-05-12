/**
 * Home - 자만추 랜딩 페이지
 * Design: Warm Afternoon Conversation - 건실한 만남
 * 따뜻한 크림 배경, Warm Coral + Sage Green 포인트
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, FileText, Shield, Sparkles, ArrowRight } from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/hero-warm-UchKCieCyinfad4qZVoK5c.webp";
const CLONE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/clone-activity-warm-hhH8j4eLwaWyKQMeaVmVGy.webp";
const MATCH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/match-warm-cZheKiyUqyEmwcHQVHfan9.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6 },
  }),
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI 클론 생성",
    desc: "나의 성격과 가치관을 학습한 AI 클론이 대신 대화합니다",
    color: "bg-warm-coral-light text-warm-coral",
  },
  {
    icon: MessageSquare,
    title: "자연스러운 대화",
    desc: "클론끼리 편안하게 대화하며 서로의 호환성을 확인합니다",
    color: "bg-sage-light text-sage",
  },
  {
    icon: FileText,
    title: "케미스트리 리포트",
    desc: "대화 분석을 통해 상세한 호환성 보고서를 제공합니다",
    color: "bg-gold-light text-gold",
  },
  {
    icon: Shield,
    title: "안전한 만남",
    desc: "충분한 정보를 확인한 후에만 실제 대화를 시작합니다",
    color: "bg-sage-light text-sage",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "자만추 - AI 클론이 대신 대화하는 새로운 데이팅 앱";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="따뜻한 카페에서의 만남"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-background" />
        </div>

        <div className="relative container pt-16 pb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.85)', color: '#c0564a', backdropFilter: 'blur(4px)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-warm-coral animate-gentle-pulse" />
                건실한 만남을 위한 AI 매칭
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl font-bold leading-tight"
              style={{ color: '#2d2520', textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}
            >
              진심이 통하는<br />
              <span className="text-warm-coral" style={{ textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}>자연스러운 만남</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base leading-relaxed max-w-[320px]"
              style={{ color: '#4a4039', textShadow: '0 1px 6px rgba(255,255,255,0.7)' }}
            >
              AI 클론이 당신을 대신해 대화하고,
              진짜 잘 맞는 사람을 찾아줍니다.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex gap-3 pt-2">
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="h-12 px-6 gradient-coral text-white font-semibold rounded-full shadow-lg shadow-warm-coral/20 hover:shadow-xl hover:shadow-warm-coral/30 transition-all"
              >
                시작하기
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="h-12 px-6 rounded-full border-border bg-white/80 backdrop-blur-sm text-foreground font-medium hover:bg-white"
              >
                둘러보기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              어떻게 작동하나요?
            </h2>
            <p className="text-sm text-muted-foreground">
              세 단계로 진심이 통하는 상대를 만나보세요
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "클론 만들기",
                desc: "대화 내역, 관심사, 가치관을 입력하면 나를 닮은 AI 클론이 만들어집니다.",
                img: null,
              },
              {
                step: "02",
                title: "클론이 대화하기",
                desc: "AI 클론이 자동으로 다른 사람의 클론과 자연스럽게 대화합니다.",
                img: CLONE_IMG,
              },
              {
                step: "03",
                title: "리포트 확인하기",
                desc: "대화 분석 결과를 바탕으로 호환성 리포트를 확인하고, 마음에 드는 상대에게 대화를 신청하세요.",
                img: null,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i + 1}
                className="warm-card p-5"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <span className="font-display text-3xl font-bold text-warm-coral/30">
                      {item.step}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {item.img && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              자만추만의 특별함
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 1}
                className="warm-card p-4 space-y-3"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Match Preview */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <motion.div variants={fadeUp} custom={0} className="warm-card overflow-hidden">
            <img
              src={MATCH_IMG}
              alt="인연의 정원"
              className="w-full aspect-square object-cover"
            />
            <div className="p-5 space-y-3 text-center">
              <h3 className="font-display text-xl font-bold text-foreground">
                진짜 잘 맞는 사람을 만나세요
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                외모가 아닌 가치관, 성격, 대화 스타일로 매칭합니다.
                AI가 분석한 호환성 리포트로 확신을 가지고 만나보세요.
              </p>
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="h-11 px-6 gradient-coral text-white font-semibold rounded-full shadow-md"
              >
                <Heart size={16} className="mr-2" />
                무료로 시작하기
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t border-border">
        <div className="text-center space-y-2">
          <p className="font-display text-lg font-bold text-foreground">자만추</p>
          <p className="text-xs text-muted-foreground">
            AI 클론 기반 데이팅 앱 · 자연스러운 만남을 추구합니다
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            AI매칭 · 가치관매칭 · 성격매칭 · 클론채팅 · 소개팅
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            &copy; 2025 자만추. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
